import { Suspense } from "react"
import { BookMarked } from "lucide-react"
import GradebookClient from "./GradebookClient"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import LoadingLogo from "@/components/ui/LoadingLogo"

export default function GradebookPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-8">
      <header className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <BookMarked className="text-[#002388]" size={26} />
          Gradebook
        </h1>
        <p className="text-sm text-slate-500">
          All students enrolled in your assessments. Click a student to view their results.
        </p>
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
        <GradebookClient />
      </Suspense>
    </div>
  )
}
