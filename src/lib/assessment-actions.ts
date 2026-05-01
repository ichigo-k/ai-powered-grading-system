'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { computeHash, shuffleWithSeed } from '@/lib/student-utils'

export type AttemptResult = { attemptId: number } | { error: string }
export type SubmitResult = { success: true } | { error: string }
export type AnswerPayload = {
  answerText?: string | null
  selectedOption?: number | null
  fileUrl?: string | null
}

async function getStudentId(email: string): Promise<number | null> {
  const user = await prisma.user.findUnique({ where: { email } })
  return user?.id ?? null
}

export async function createOrResumeAttempt(
  assessmentId: number,
  password?: string,
): Promise<AttemptResult> {
  const session = await getSession()
  if (!session?.user || session.user.role !== 'STUDENT') return { error: 'UNAUTHORIZED' }

  const studentId = await getStudentId(session.user.email!)
  if (!studentId) return { error: 'UNAUTHORIZED' }

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: {
      passwordProtected: true,
      accessPassword: true,
      maxAttempts: true,
      shuffleQuestions: true,
      startsAt: true,
      endsAt: true,
      status: true,
    },
  })
  if (!assessment) return { error: 'NOT_FOUND' }

  // Enforce assessment window — server-side time check
  const now = new Date()
  if (assessment.status !== 'PUBLISHED') return { error: 'NOT_AVAILABLE' }
  if (now < assessment.startsAt) return { error: 'NOT_STARTED' }
  if (now > assessment.endsAt) return { error: 'ENDED' }

  if (assessment.passwordProtected) {
    if (!password || password !== assessment.accessPassword) return { error: 'INVALID_PASSWORD' }
  }

  // Resume an in-progress attempt if one exists
  const existing = await prisma.assessmentAttempt.findFirst({
    where: { assessmentId, studentId, status: 'IN_PROGRESS' },
    select: { id: true },
  })
  if (existing) return { attemptId: existing.id }

  // Count only completed attempts (SUBMITTED / TIMED_OUT) against the limit.
  // IN_PROGRESS attempts are already handled above (resume), so they don't
  // consume an extra slot here.
  const completedCount = await prisma.assessmentAttempt.count({
    where: { assessmentId, studentId, status: { in: ['SUBMITTED', 'TIMED_OUT'] } },
  })
  if (completedCount >= assessment.maxAttempts) return { error: 'MAX_ATTEMPTS_REACHED' }

  // Total attempts (including any in-progress) determines the next attempt number
  const totalCount = await prisma.assessmentAttempt.count({ where: { assessmentId, studentId } })

  let questionOrder: { questionId: number }[] = []
  if (assessment.shuffleQuestions) {
    const questions = await prisma.question.findMany({ where: { assessmentId }, select: { id: true } })
    questionOrder = shuffleWithSeed(questions.map((q) => q.id)).map((id) => ({ questionId: id }))
  }

  const newAttempt = await prisma.assessmentAttempt.create({
    data: { assessmentId, studentId, status: 'IN_PROGRESS', startedAt: new Date(), attemptNumber: totalCount + 1, questionOrder },
    select: { id: true },
  })

  return { attemptId: newAttempt.id }
}

export async function saveAnswer(
  attemptId: number,
  questionId: number,
  payload: AnswerPayload,
): Promise<void> {
  const session = await getSession()
  if (!session?.user || session.user.role !== 'STUDENT') return

  const studentId = await getStudentId(session.user.email!)
  if (!studentId) return

  const attempt = await prisma.assessmentAttempt.findUnique({ where: { id: attemptId }, select: { studentId: true } })
  if (!attempt || attempt.studentId !== studentId) return

  await prisma.studentAnswer.upsert({
    where: { attemptId_questionId: { attemptId, questionId } },
    create: { attemptId, questionId, answerText: payload.answerText ?? null, selectedOption: payload.selectedOption ?? null, fileUrl: payload.fileUrl ?? null },
    update: { answerText: payload.answerText ?? null, selectedOption: payload.selectedOption ?? null, fileUrl: payload.fileUrl ?? null },
  })
}

export async function logTabSwitch(attemptId: number, timestamp: string): Promise<void> {
  const session = await getSession()
  if (!session?.user || session.user.role !== 'STUDENT') return

  const attempt = await prisma.assessmentAttempt.findUnique({ where: { id: attemptId }, select: { tabSwitchLog: true } })
  if (!attempt) return

  const log = Array.isArray(attempt.tabSwitchLog) ? attempt.tabSwitchLog : []
  await prisma.assessmentAttempt.update({
    where: { id: attemptId },
    data: { tabSwitchLog: [...log, { timestamp, event: 'tab_switch' }] },
  })
}

export async function submitAttempt(attemptId: number, reason?: 'TIMED_OUT' | 'FULLSCREEN_VIOLATION' | 'TAB_SWITCH'): Promise<SubmitResult> {
  const session = await getSession()
  if (!session?.user || session.user.role !== 'STUDENT') return { error: 'UNAUTHORIZED' }

  const studentId = await getStudentId(session.user.email!)
  if (!studentId) return { error: 'UNAUTHORIZED' }

  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    select: { studentId: true, assessmentId: true },
  })
  if (!attempt || attempt.studentId !== studentId) return { error: 'NOT_FOUND' }

  // Fetch all answers for this attempt
  const answers = await prisma.studentAnswer.findMany({
    where: { attemptId },
    select: { id: true, questionId: true, answerText: true, selectedOption: true },
  })

  // Hash all answers
  for (const answer of answers) {
    const raw = answer.answerText ?? (answer.selectedOption?.toString() ?? null)
    await prisma.studentAnswer.update({ where: { id: answer.id }, data: { answerHash: computeHash(raw) } })
  }

  // Auto-score objective (MCQ) questions only
  // Subjective questions will be graded by the external grader
  const questions = await prisma.question.findMany({
    where: {
      assessmentId: attempt.assessmentId,
      section: { type: 'OBJECTIVE' },
      correctOption: { not: null },
    },
    select: { id: true, marks: true, correctOption: true },
  })

  const questionMap = new Map(questions.map((q) => [q.id, q]))
  let mcqScore = 0

  for (const answer of answers) {
    const question = questionMap.get(answer.questionId)
    if (question && answer.selectedOption === question.correctOption) {
      mcqScore += question.marks
    }
  }

  // Check if assessment has any subjective questions
  const hasSubjective = await prisma.question.count({
    where: {
      assessmentId: attempt.assessmentId,
      section: { type: 'SUBJECTIVE' },
    },
  })

  // If no subjective questions, grading is complete — assign final grade now
  // If there are subjective questions, score is partial (MCQ only) until external grader runs
  const assessment = await prisma.assessment.findUnique({
    where: { id: attempt.assessmentId },
    select: { totalMarks: true },
  })
  const totalMarks = assessment?.totalMarks ?? 100

  let grade: string | null = null
  if (hasSubjective === 0) {
    // Pure MCQ — grade immediately
    const percentage = totalMarks > 0 ? (mcqScore / totalMarks) * 100 : 0
    if (percentage >= 90) grade = 'A+'
    else if (percentage >= 85) grade = 'A'
    else if (percentage >= 80) grade = 'A-'
    else if (percentage >= 75) grade = 'B+'
    else if (percentage >= 70) grade = 'B'
    else if (percentage >= 65) grade = 'B-'
    else if (percentage >= 60) grade = 'C+'
    else if (percentage >= 55) grade = 'C'
    else if (percentage >= 50) grade = 'C-'
    else if (percentage >= 45) grade = 'D+'
    else if (percentage >= 40) grade = 'D'
    else grade = 'F'
  }

  // Append the submission reason to the tab switch log so the detail page can show the right message
  const currentAttempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    select: { tabSwitchLog: true },
  })
  const existingLog = Array.isArray(currentAttempt?.tabSwitchLog) ? currentAttempt.tabSwitchLog : []
  const logWithReason = reason
    ? [...existingLog, { timestamp: new Date().toISOString(), event: reason }]
    : existingLog

  // Map all forced-submit reasons to TIMED_OUT (the only non-SUBMITTED status in the DB enum)
  const dbStatus = reason ? 'TIMED_OUT' : 'SUBMITTED'

  await prisma.assessmentAttempt.update({
    where: { id: attemptId },
    data: {
      status: dbStatus,
      submittedAt: new Date(),
      score: mcqScore,
      tabSwitchLog: logWithReason,
      ...(grade !== null ? { grade } : {}),
    },
  })

  return { success: true }
}
