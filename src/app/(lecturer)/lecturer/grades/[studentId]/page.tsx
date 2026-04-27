import { Suspense } from "react"
import StudentGradeClient from "./StudentGradeClient"
import LoadingLogo from "@/components/ui/LoadingLogo"
import { TableSkeleton } from "@/components/ui/table-skeleton"

export default async function StudentGradePage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const { studentId } = await params
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-8">
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
        <StudentGradeClient studentId={parseInt(studentId)} />
      </Suspense>
    </div>
  )
}
