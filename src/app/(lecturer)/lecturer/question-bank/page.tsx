import { Library } from "lucide-react"
import QuestionBankClient from "./QuestionBankClient"

export default function QuestionBankPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-8">
      <header className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <Library className="text-[#002388]" size={28} />
          Question Bank
        </h1>
        <p className="text-sm text-slate-500">
          Manage reusable question banks to quickly populate new assessments.
        </p>
      </header>

      <QuestionBankClient />
    </div>
  )
}
