import {
  LayoutDashboard,
  Users,
  AlertCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  FileText,
  Activity,
  Plus
} from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/session";

const activeAssessments = [
  {
    id: "1",
    name: "Midterm Examination",
    course: "CS101",
    classes: ["Level 100 A", "Level 100 B"],
    status: "AI Grading",
    progress: 65,
    submissions: 84,
    total: 90,
    timeRemaining: "approx. 12 mins",
  },
  {
    id: "2",
    name: "Quiz 4: Neural Networks",
    course: "CSC 402",
    classes: ["Final Year Alpha"],
    status: "Live",
    progress: 100,
    submissions: 124,
    total: 150,
    timeRemaining: "Ends in 2h 40m",
  },
  {
    id: "3",
    name: "Assignment 2: Data Structures",
    course: "CS301",
    classes: ["Level 300"],
    status: "Review Required",
    progress: 100,
    submissions: 52,
    total: 52,
    flags: 5,
  },
]

const assignedClasses = [
  { name: "Level 100 A", course: "Intro to Computing", students: 45, activity: "Active Test" },
  { name: "Level 100 B", course: "Intro to Computing", students: 45, activity: "Idle" },
  { name: "Level 300", course: "Data Structures", students: 52, activity: "52 Scripts Uploaded" },
  { name: "Final Year Alpha", course: "Adv. Neural Arch.", students: 124, activity: "Live Exam" },
]

export default async function LecturerDashboardPage() {
  const session = await getSession();
  const displayName = session?.user?.name ?? "Lecturer";

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      {/* Header */}
      <header className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome back, <span className="text-[#002388]">{displayName}</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            You have <span className="font-semibold text-indigo-600">5 assessments</span> in the grading pipeline today.
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Link 
            href="/lecturer/tests/new"
            className="flex items-center gap-2 px-4 py-2 bg-[#002388] text-white rounded-lg text-sm font-medium hover:bg-[#001b66] transition-colors"
          >
            <Plus size={16} />
            Create New Test
          </Link>
        </div>
      </header>

      {/* Stats Section - Matching Student Style */}
      <section className="rounded-xl border border-slate-200 bg-white px-6 py-4 grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
        {[
          { label: "Active Tests", value: "03", icon: Activity, color: "text-blue-500" },
          { label: "Awaiting AI", value: "12", icon: FileText, color: "text-purple-500" },
          { label: "Submissions", value: "145", icon: Users, color: "text-cyan-500" },
          { label: "Needs Review", value: "08", icon: AlertCircle, color: "text-orange-500" },
        ].map((item, i) => (
          <div key={item.label} className={`flex items-center gap-3 px-5 first:pl-0 last:pr-0 ${i >= 2 ? "mt-4 sm:mt-0 border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0" : ""}`}>
            <item.icon size={16} className="text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 font-medium">{item.label}</p>
              <p className="text-xl font-bold text-slate-900">{item.value}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content: Assessment Pipeline */}
        <div className="lg:col-span-2 space-y-6">
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="flex items-center gap-2 text-lg font-medium text-slate-900">
                <TrendingUp className="text-[#002388]" size={20} />
                Grading Pipeline
              </h2>
              <Link
                href="/lecturer/assessments"
                className="flex items-center gap-1 text-sm font-medium text-[#002388] hover:text-[#0B4DBB] transition-colors"
              >
                View all history
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="rounded-xl overflow-hidden bg-white border border-slate-200">
              {activeAssessments.map((item, i) => {
                const statusColor = item.status === "AI Grading" ? "#3b82f6" : item.status === "Live" ? "#ef4444" : "#f59e0b";
                return (
                  <div
                    key={item.id}
                    className={`flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-slate-50 ${i !== 0 ? "border-t border-slate-100" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-slate-900">{item.name}</h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-500">
                            {item.course}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Batches: <span className="font-medium text-slate-700">{item.classes.join(", ")}</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-bold text-slate-900">{item.submissions}/{item.total}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Submissions</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[11px] font-medium">
                        <div className="flex items-center gap-1.5" style={{ color: statusColor }}>
                          <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Live' ? 'animate-pulse' : ''}`} style={{ backgroundColor: statusColor }} />
                          {item.status}: {item.status === "AI Grading" ? `${item.progress}%` : item.timeRemaining}
                        </div>
                        {item.flags && (
                          <span className="text-orange-600 font-bold flex items-center gap-1">
                            <AlertCircle size={12} strokeWidth={3} />
                            {item.flags} Review Flags
                          </span>
                        )}
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-700 rounded-full"
                          style={{ width: `${item.progress}%`, backgroundColor: statusColor }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <Link 
                        href={`/lecturer/assessments/${item.id}`}
                        className="text-xs font-bold text-[#002388] hover:underline flex items-center gap-1"
                      >
                        {item.status === "Review Required" ? "Manual Review" : "Track Progress"}
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Sidebar: Assigned Classes - Matching Student Sidebar style */}
        <div className="space-y-6">
          <section className="flex flex-col gap-4">
            <div className="px-1">
              <h2 className="flex items-center gap-2 text-lg font-medium text-slate-900">
                <Users className="text-[#002388]" size={20} />
                My Batches
              </h2>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              {assignedClasses.map((cls, i) => (
                <div
                  key={cls.name}
                  className={`flex items-center gap-3 p-4 transition-colors hover:bg-slate-50 ${i !== 0 ? "border-t border-slate-100" : ""}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-[#002388] font-bold text-xs border border-slate-100">
                    {cls.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{cls.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold truncate uppercase">{cls.course}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-700">{cls.students}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Students</p>
                  </div>
                </div>
              ))}
              <div className="p-3 bg-slate-50 border-t border-slate-100">
                <button className="w-full py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:text-[#002388] hover:border-[#002388] transition-all">
                  Manage All Classes
                </button>
              </div>
            </div>
          </section>

          {/* AI Usage Metric - Minimalist Design */}
          <div className="rounded-xl bg-[#002388] p-5 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
                <Activity size={16} />
                AI Analysis Pulse
              </h3>
              <p className="text-[11px] text-blue-200 mb-4 font-medium">System efficiency is up 14% this week.</p>
              <div className="flex items-end gap-1 h-12 mb-4">
                {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                  <div key={i} className="flex-1 bg-white/20 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
              <button className="w-full py-2 bg-white text-[#002388] rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors">
                View Detailed Insights
              </button>
            </div>
            {/* Decorative background element */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
          </div>
        </div>
      </div>
    </div>
  )
}
