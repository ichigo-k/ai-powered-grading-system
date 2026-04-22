import { getSession } from "@/lib/session"
import ExamsTabs from "./ExamsTabs"

export default async function StudentDashboardPage() {
  const session = await getSession()
  const displayName = session?.user?.name ?? session?.user?.userId ?? "Student"

  return (
    <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <header className="space-y-1 pb-2">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Welcome back, <span className="text-[#002388]">{displayName}</span>.
          </h1>
          <p className="text-sm text-gray-400">Here's a quick overview of your tests.</p>
        </header>

        <ExamsTabs />
    </div>
  )
}
