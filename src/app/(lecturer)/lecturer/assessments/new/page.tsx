import { Suspense } from "react"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import AssessmentForm from "../AssessmentForm"
import { Skeleton } from "@/components/ui/skeleton"
import type { LecturerCourse } from "@/lib/assessment-types"

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function FormSkeleton() {
  return (
    <div className="mx-auto max-w-4xl w-full pb-16 space-y-10 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      {/* stepper */}
      <div className="flex items-center gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
            <Skeleton className="h-7 w-7 rounded-full shrink-0" />
            <Skeleton className="h-4 w-14" />
            {i < 3 && <Skeleton className="h-px flex-1" />}
          </div>
        ))}
      </div>
      {/* form card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <Skeleton className="h-3 w-36" />
        <div className="grid grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <Skeleton className="h-3 w-40" />
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Data fetcher ─────────────────────────────────────────────────────────────

async function NewAssessmentData() {
  const session = await auth()
  if (!session || session.user.role !== "LECTURER") redirect("/")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  })
  if (!user) redirect("/")

  const profile = await prisma.lecturerProfile.findUnique({
    where: { id: user.id },
    include: {
      courses: {
        select: {
          id: true,
          code: true,
          title: true,
          classes: { select: { id: true, name: true, level: true } },
        },
      },
    },
  })

  const lecturerCourses: LecturerCourse[] = (profile?.courses ?? []).map((c) => ({
    id: c.id,
    code: c.code,
    title: c.title,
    classes: c.classes,
  }))

  return <AssessmentForm lecturerCourses={lecturerCourses} />
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewAssessmentPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <NewAssessmentData />
    </Suspense>
  )
}
