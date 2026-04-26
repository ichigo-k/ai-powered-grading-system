import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import AssessmentDetailView from "./AssessmentDetailView"
import type { AssessmentWithDetails } from "@/lib/assessment-types"

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session || session.user.role !== "LECTURER") redirect("/")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  })
  if (!user) redirect("/")

  const { id } = await params
  const assessmentId = Number(id)
  if (Number.isNaN(assessmentId)) notFound()

  const raw = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      course: { select: { code: true, title: true } },
      classes: {
        include: {
          class: { select: { name: true, level: true } },
        },
      },
      sections: {
        include: {
          questions: {
            include: {
              rubricCriteria: {
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { id: "asc" },
      },
    },
  })

  if (!raw || raw.lecturerId !== user.id) notFound()

  const assessment: AssessmentWithDetails = {
    id: raw.id,
    title: raw.title,
    type: raw.type as AssessmentWithDetails["type"],
    status: raw.status as AssessmentWithDetails["status"],
    courseId: raw.courseId,
    courseCode: raw.course.code,
    courseTitle: raw.course.title,
    lecturerId: raw.lecturerId,
    totalMarks: raw.totalMarks,
    startsAt: raw.startsAt,
    endsAt: raw.endsAt,
    durationMinutes: raw.durationMinutes,
    maxAttempts: raw.maxAttempts,
    passwordProtected: raw.passwordProtected,
    accessPassword: raw.accessPassword,
    shuffleQuestions: raw.shuffleQuestions,
    shuffleOptions: raw.shuffleOptions,
    isLocationBound: raw.isLocationBound,
    location: raw.location,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    classes: raw.classes.map((ac) => ({
      id: ac.id,
      classId: ac.classId,
      className: ac.class.name,
    })),
    sections: raw.sections.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type as any,
      requiredQuestionsCount: s.requiredQuestionsCount,
      questions: s.questions.map((q) => ({
        id: q.id,
        order: q.order,
        body: q.body,
        marks: q.marks,
        answerType: q.answerType as any,
        options: q.options as string[] | null,
        correctOption: q.correctOption,
        rubricCriteria: q.rubricCriteria.map((rc) => ({
          id: rc.id,
          description: rc.description,
          maxMarks: rc.maxMarks,
          order: rc.order,
        })),
      })),
    })),
  }

  return <AssessmentDetailView assessment={assessment} />
}
