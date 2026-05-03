import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import AssessmentResultsView from "./AssessmentResultsView"
import { Skeleton } from "@/components/ui/skeleton"
import type { AssessmentResultsData } from "./AssessmentResultsView"

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ResultsSkeleton() {
  return (
    <div className="mx-auto max-w-5xl pb-16 space-y-6 animate-pulse">
      <Skeleton className="h-4 w-36" />
      {/* hero */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-14 rounded" />
          <Skeleton className="h-5 w-20 rounded" />
        </div>
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-44" />
        <div className="border-t border-slate-100 mt-4 pt-4 grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="h-6 w-10" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
      {/* charts */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <Skeleton className="h-3 w-32 mb-4" />
          <Skeleton className="h-44 w-full rounded-lg" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col items-center gap-4">
          <Skeleton className="h-3 w-24 self-start" />
          <Skeleton className="h-32 w-32 rounded-full" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      {/* table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-48 rounded-lg" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-100 last:border-0">
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Data fetcher ─────────────────────────────────────────────────────────────

async function ResultsData({ id }: { id: string }) {
  const session = await auth()
  if (!session || session.user.role !== "LECTURER") redirect("/")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  })
  if (!user) redirect("/")

  const assessmentId = Number(id)
  if (Number.isNaN(assessmentId)) notFound()

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      course: { select: { code: true, title: true } },
      classes: {
        include: {
          class: {
            select: {
              name: true,
              level: true,
              students: {
                include: {
                  user: { select: { id: true, name: true, email: true } },
                },
              },
            },
          },
        },
      },
      sections: {
        select: {
          id: true,
          type: true,
          questions: { select: { id: true, marks: true } },
        },
      },
    },
  })

  if (!assessment || assessment.lecturerId !== user.id) notFound()
  if (assessment.status === "DRAFT") redirect(`/lecturer/assessments/${assessmentId}`)

  const enrolledStudents: AssessmentResultsData["enrolledStudents"] = []
  const seen = new Set<number>()
  for (const ac of assessment.classes) {
    for (const sp of ac.class.students) {
      if (!seen.has(sp.user.id)) {
        seen.add(sp.user.id)
        enrolledStudents.push({
          id: sp.user.id,
          name: sp.user.name ?? "Unknown",
          email: sp.user.email,
          className: ac.class.name,
        })
      }
    }
  }

  const data: AssessmentResultsData = {
    id: assessment.id,
    title: assessment.title,
    type: assessment.type as AssessmentResultsData["type"],
    status: assessment.status as AssessmentResultsData["status"],
    courseCode: assessment.course.code,
    courseTitle: assessment.course.title,
    totalMarks: assessment.totalMarks,
    totalQuestions: assessment.sections.reduce((acc, s) => acc + s.questions.length, 0),
    startsAt: assessment.startsAt,
    endsAt: assessment.endsAt,
    gradingStatus: assessment.gradingStatus as "NOT_GRADED" | "GRADING" | "GRADED",
    resultsReleased: assessment.resultsReleased,
    enrolledStudents,
    submissions: [],
  }

  // Fetch all attempts for this assessment
  const attempts = await prisma.assessmentAttempt.findMany({
    where: {
      assessmentId,
      studentId: { in: enrolledStudents.map((s) => s.id) },
      status: { in: ["SUBMITTED", "TIMED_OUT"] },
    },
    orderBy: { submittedAt: "desc" },
    select: {
      studentId: true,
      score: true,
      submittedAt: true,
      status: true,
    },
  })

  // Map attempts to submissions (latest per student)
  const submissionMap = new Map<number, AssessmentResultsData["submissions"][number]>()
  for (const attempt of attempts) {
    if (!submissionMap.has(attempt.studentId)) {
      submissionMap.set(attempt.studentId, {
        studentId: attempt.studentId,
        score: attempt.score,
        submittedAt: attempt.submittedAt,
        // An attempt is considered GRADED when the grader has written a final score
        // (gradingStatus === GRADED on the assessment is the reliable signal)
        status: assessment.gradingStatus === "GRADED" ? "GRADED" : "SUBMITTED",
      })
    }
  }

  data.submissions = Array.from(submissionMap.values())

  return <AssessmentResultsView data={data} />
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AssessmentResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <Suspense fallback={<ResultsSkeleton />}>
      <ResultsData id={id} />
    </Suspense>
  )
}
