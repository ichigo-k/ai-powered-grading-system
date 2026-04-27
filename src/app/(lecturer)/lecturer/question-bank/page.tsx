import { Suspense } from "react"
import { Library } from "lucide-react"
import QuestionBankClient from "./QuestionBankClient"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import LoadingLogo from "@/components/ui/LoadingLogo"

export default function QuestionBankPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-8">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <Library className="text-[#002388]" size={28} />
          Question Bank
        </h1>
        <p className="text-sm text-slate-500">
          Manage reusable question banks to quickly populate new assessments.
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
        <QuestionBankClient />
      </Suspense>
    </div>
  )
}
