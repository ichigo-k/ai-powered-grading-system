import { Suspense } from "react"
import { redirect } from "next/navigation"
import { ClipboardList } from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import AssessmentsClient from "./AssessmentsClient"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import LoadingLogo from "@/components/ui/LoadingLogo"
import type { AssessmentListItem } from "@/lib/assessment-types"

async function AssessmentsDataWrapper() {
  const session = await auth()
  if (!session || session.user.role !== "LECTURER") redirect("/")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  })
  if (!user) redirect("/")

  const assessments = await prisma.assessment.findMany({
    where: { lecturerId: user.id },
    include: {
      course: { select: { code: true, title: true } },
      _count: { select: { classes: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const assessmentList: AssessmentListItem[] = assessments.map((a) => ({
    id: a.id,
    title: a.title,
    type: a.type as AssessmentListItem["type"],
    status: a.status as AssessmentListItem["status"],
    courseCode: a.course.code,
    courseTitle: a.course.title,
    classCount: a._count.classes,
    startsAt: a.startsAt,
    endsAt: a.endsAt,
    totalMarks: a.totalMarks,
  }))

  return <AssessmentsClient assessments={assessmentList} />
}

export default function LecturerAssessmentsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-8">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <ClipboardList className="text-[#002388]" size={28} />
            Assessments
          </h1>
          <p className="text-sm text-slate-500">
            Create and manage exams, quizzes, and assignments for your courses.
          </p>
        </div>
      </header>

      <Suspense
        fallback={
          <div className="relative">
            <TableSkeleton />
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
              <div className="scale-75 opacity-80">
                <LoadingLogo />
              </div>
            </div>
          </div>
        }
      >
        <AssessmentsDataWrapper />
      </Suspense>
    </div>
  )
}
