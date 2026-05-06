import { prisma } from '@/lib/prisma'
import { deriveStatus, computeAverage, sortAndLimit } from '@/lib/student-utils'
import { computeGrade, parseGradingScale } from '@/lib/grading-scale'
import type { DerivedStatus } from '@/lib/student-utils'

export type DashboardData = {
  upcomingCount: number
  ongoingCount: number
  completedCount: number
  averageScore: number | null
  upcomingAssessments: UpcomingItem[]
  recentResults: RecentResultItem[]
}

type UpcomingItem = {
  id: number
  title: string
  type: string
  courseTitle: string
  startsAt: Date
  endsAt: Date
  status: DerivedStatus
}

type RecentResultItem = {
  id: number
  title: string
  type: string
  courseTitle: string
  endsAt: Date
  score: number | null
  grade: string | null  // computed from score on read
}

export type StudentAssessmentRow = {
  id: number
  title: string
  type: string
  status: DerivedStatus
  courseTitle: string
  courseCode: string
  courseId: number
  startsAt: Date
  endsAt: Date
  durationMinutes: number | null
  totalMarks: number
  maxAttempts: number
  sections: { id: number; name: string; type: string; requiredQuestionsCount: number | null }[]
  latestAttempt: { score: number | null; grade: string | null; attemptNumber: number; status: string } | null}

export type AssessmentDetail = {
  id: number
  title: string
  type: string
  status: string
  courseId: number
  courseTitle: string
  courseCode: string
  startsAt: Date
  endsAt: Date
  durationMinutes: number | null
  totalMarks: number
  maxAttempts: number
  passwordProtected: boolean
  shuffleQuestions: boolean
  shuffleOptions: boolean
  isLocationBound: boolean
  location: string | null
  sections: {
    id: number
    name: string
    type: string
    requiredQuestionsCount: number | null
    questions: {
      id: number
      order: number
      body: string
      marks: number
      answerType: string | null
      options: unknown
    }[]
  }[]
}

export type AttemptRow = {
  id: number
  attemptNumber: number
  status: string
  score: number | null
  grade: string | null  // computed from score on read, not stored in DB
  startedAt: Date
  submittedAt: Date | null
  questionOrder: unknown
  tabSwitchLog: unknown
}

export type ActiveAttempt = {
  id: number
  assessmentId: number
  studentId: number
  attemptNumber: number
  status: string
  startedAt: Date
  submittedAt: Date | null
  questionOrder: unknown
  tabSwitchLog: unknown
  answers: {
    id: number
    questionId: number
    answerText: string | null
    selectedOption: number | null
    fileUrl: string | null
  }[]
}

const EMPTY_DASHBOARD: DashboardData = {
  upcomingCount: 0,
  ongoingCount: 0,
  completedCount: 0,
  averageScore: null,
  upcomingAssessments: [],
  recentResults: [],
}

export async function getDashboardData(studentId: number): Promise<DashboardData> {
  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { classId: true },
  })

  if (!profile?.classId) return EMPTY_DASHBOARD

  const classId = profile.classId
  const now = new Date()

  const rows = await prisma.assessmentClass.findMany({
    where: { classId },
    select: {
      assessment: {
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          startsAt: true,
          endsAt: true,
          totalMarks: true,
          course: { select: { title: true } },
          attempts: {
            where: { studentId },
            orderBy: { score: 'desc' },
            take: 1,
            select: { score: true, status: true },
          },
        },
      },
    },
  })

  const assessments = rows
    .map((r) => r.assessment)
    .filter((a) => a.status === 'PUBLISHED')

  type Enriched = (typeof assessments)[number] & { derivedStatus: DerivedStatus }

  const enriched: Enriched[] = assessments.map((a) => ({
    ...a,
    derivedStatus: deriveStatus(a.startsAt, a.endsAt, now),
  }))

  const upcomingCount = enriched.filter((a) => a.derivedStatus === 'upcoming').length
  const ongoingCount = enriched.filter((a) => a.derivedStatus === 'ongoing').length
  const completedCount = enriched.filter((a) => a.derivedStatus === 'completed').length

  const averageScore = computeAverage(
    enriched
      .filter((a) => a.derivedStatus === 'completed')
      .map((a) => a.attempts[0]?.score ?? null),
  )

  const upcomingAssessments = sortAndLimit(
    enriched.filter((a) => a.derivedStatus === 'upcoming' || a.derivedStatus === 'ongoing'),
    'startsAt',
    'asc',
    3,
  ).map((a) => ({
    id: a.id,
    title: a.title,
    type: a.type,
    courseTitle: a.course.title,
    startsAt: a.startsAt,
    endsAt: a.endsAt,
    status: a.derivedStatus,
  }))

  // Load grading scale once for grade computation
  const settingsRow = await prisma.systemSettings.findFirst({ select: { gradingScale: true } })
  const scale = parseGradingScale(settingsRow?.gradingScale)

  const recentResults = sortAndLimit(
    enriched.filter(
      (a) => a.derivedStatus === 'completed' && (a.attempts[0]?.score ?? null) !== null,
    ),
    'endsAt',
    'desc',
    4,
  ).map((a) => {
    const score = a.attempts[0]?.score ?? null
    return {
      id: a.id,
      title: a.title,
      type: a.type,
      courseTitle: a.course.title,
      endsAt: a.endsAt,
      score,
      grade: score !== null ? computeGrade(score, a.totalMarks, scale) : null,
    }
  })

  return { upcomingCount, ongoingCount, completedCount, averageScore, upcomingAssessments, recentResults }
}

export async function getStudentAssessments(studentId: number): Promise<StudentAssessmentRow[]> {
  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { classId: true },
  })

  if (!profile?.classId) return []

  const classId = profile.classId
  const now = new Date()

  const rows = await prisma.assessmentClass.findMany({
    where: { classId },
    select: {
      assessment: {
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          courseId: true,
          startsAt: true,
          endsAt: true,
          durationMinutes: true,
          totalMarks: true,
          maxAttempts: true,
          course: { select: { title: true, code: true } },
          sections: {
            select: { id: true, name: true, type: true, requiredQuestionsCount: true },
          },
          attempts: {
            where: { studentId },
            orderBy: { score: 'desc' },
            take: 1,
            select: { score: true, attemptNumber: true, status: true },
          },
        },
      },
    },
  })

  // Load grading scale for grade computation
  const settingsRow2 = await prisma.systemSettings.findFirst({ select: { gradingScale: true } })
  const scale2 = parseGradingScale(settingsRow2?.gradingScale)

  return rows
    .map((r) => r.assessment)
    .filter((a) => a.status === 'PUBLISHED')
    .map((a) => {
      const raw = a.attempts[0] ?? null
      return {
        id: a.id,
        title: a.title,
        type: a.type,
        status: deriveStatus(a.startsAt, a.endsAt, now),
        courseTitle: a.course.title,
        courseCode: a.course.code,
        courseId: a.courseId,
        startsAt: a.startsAt,
        endsAt: a.endsAt,
        durationMinutes: a.durationMinutes,
        totalMarks: a.totalMarks,
        maxAttempts: a.maxAttempts,
        sections: a.sections,
        latestAttempt: raw
          ? {
              score: raw.score,
              grade: raw.score !== null ? computeGrade(raw.score, a.totalMarks, scale2) : null,
              attemptNumber: raw.attemptNumber,
              status: raw.status,
            }
          : null,
      }
    })
}

export async function getAssessmentWithQuestions(assessmentId: number, studentId?: number): Promise<AssessmentDetail | null> {
  // If a studentId is provided, verify enrollment before fetching full details.
  // This prevents students from viewing assessments for classes they are not in.
  if (studentId !== undefined) {
    const enrolled = await prisma.assessmentClass.findFirst({
      where: {
        assessmentId,
        class: { students: { some: { id: studentId } } },
      },
      select: { id: true },
    })
    if (!enrolled) return null
  }

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      courseId: true,
      startsAt: true,
      endsAt: true,
      durationMinutes: true,
      totalMarks: true,
      maxAttempts: true,
      passwordProtected: true,
      shuffleQuestions: true,
      shuffleOptions: true,
      isLocationBound: true,
      location: true,
      course: { select: { title: true, code: true } },
      sections: {
        select: {
          id: true,
          name: true,
          type: true,
          requiredQuestionsCount: true,
          questions: {
            orderBy: { order: 'asc' },
            select: { id: true, order: true, body: true, marks: true, answerType: true, options: true },
          },
        },
      },
    },
  })

  if (!assessment) return null

  return {
    id: assessment.id,
    title: assessment.title,
    type: assessment.type,
    status: assessment.status,
    courseId: assessment.courseId,
    courseTitle: assessment.course.title,
    courseCode: assessment.course.code,
    startsAt: assessment.startsAt,
    endsAt: assessment.endsAt,
    durationMinutes: assessment.durationMinutes,
    totalMarks: assessment.totalMarks,
    maxAttempts: assessment.maxAttempts,
    passwordProtected: assessment.passwordProtected,
    shuffleQuestions: assessment.shuffleQuestions,
    shuffleOptions: assessment.shuffleOptions,
    isLocationBound: assessment.isLocationBound,
    location: assessment.location,
    sections: assessment.sections,
  }
}

export async function getStudentAttempts(studentId: number, assessmentId: number): Promise<AttemptRow[]> {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: { totalMarks: true },
  })
  const totalMarks = assessment?.totalMarks ?? 100

  const settingsRow = await prisma.systemSettings.findFirst({ select: { gradingScale: true } })
  const scale = parseGradingScale(settingsRow?.gradingScale)

  const rows = await prisma.assessmentAttempt.findMany({
    where: { studentId, assessmentId },
    orderBy: { attemptNumber: 'desc' },
    select: {
      id: true,
      attemptNumber: true,
      status: true,
      score: true,
      startedAt: true,
      submittedAt: true,
      questionOrder: true,
      tabSwitchLog: true,
    },
  })

  return rows.map((r) => ({
    ...r,
    grade: r.score !== null ? computeGrade(r.score, totalMarks, scale) : null,
  }))
}

export type ScheduleItem = {
  id: number
  title: string
  type: string
  courseTitle: string
  courseCode: string
  startsAt: Date
  endsAt: Date
  durationMinutes: number | null
  location: string | null
  status: DerivedStatus
}

export async function getScheduleAssessments(studentId: number): Promise<ScheduleItem[]> {
  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { classId: true },
  })

  if (!profile?.classId) return []

  const classId = profile.classId
  const now = new Date()

  const rows = await prisma.assessmentClass.findMany({
    where: { classId },
    select: {
      assessment: {
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          startsAt: true,
          endsAt: true,
          durationMinutes: true,
          location: true,
          course: { select: { title: true, code: true } },
        },
      },
    },
  })

  return rows
    .map((r) => r.assessment)
    .filter((a) => a.status === 'PUBLISHED')
    .map((a) => ({
      id: a.id,
      title: a.title,
      type: a.type,
      courseTitle: a.course.title,
      courseCode: a.course.code,
      startsAt: a.startsAt,
      endsAt: a.endsAt,
      durationMinutes: a.durationMinutes,
      location: a.location,
      status: deriveStatus(a.startsAt, a.endsAt, now),
    }))
    .filter((a) => a.status === 'upcoming' || a.status === 'ongoing')
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
}

export async function getActiveAttempt(attemptId: number, studentId: number): Promise<ActiveAttempt | null> {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      assessmentId: true,
      studentId: true,
      attemptNumber: true,
      status: true,
      startedAt: true,
      submittedAt: true,
      questionOrder: true,
      tabSwitchLog: true,
      answers: {
        select: {
          id: true,
          questionId: true,
          answerText: true,
          selectedOption: true,
          fileUrl: true,
        },
      },
    },
  })

  if (!attempt || attempt.studentId !== studentId) return null

  return attempt
}
