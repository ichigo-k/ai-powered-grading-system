import {
  TrendingUp,
  ArrowRight,
  FileText,
  Users,
  Plus,
  Zap,
  Clock,
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

const activeTests = [
  {
    id: "1",
    name: "Midterm Examination",
    course: "CS101",
    batch: "Level 100 A & B",
    timeRemaining: "Ends in 45m",
    status: "Live",
  },
  {
    id: "2",
    name: "Quiz 4: Neural Networks",
    course: "CSC 402",
    batch: "Final Year Alpha",
    timeRemaining: "Ends in 2h 40m",
    status: "Live",
  },
  {
    id: "3",
    name: "Assignment 2: Data Structures",
    course: "CS301",
    batch: "Level 300",
    timeRemaining: "Closed",
    status: "Closed",
  },
]

export default async function LecturerDashboardPage() {
  const session = await getSession();
  const displayName = session?.user?.name ?? "Lecturer";

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Welcome back, <span className="text-[#002388]">{displayName}</span>
          </h1>
          <p className="mt-0.5 text-sm text-slate-400">
            Here&apos;s your grading overview for today.
          </p>
        </div>
        <Link
          href="/lecturer/tests/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#002388] text-white rounded-lg text-sm font-medium hover:bg-[#001b66] transition-colors"
        >
          <Plus size={15} />
          New Test
        </Link>
      </div>

      {/* Top Row: Active Tests & My Batches side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active Tests */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Zap size={14} className="text-[#002388]" />
              Active Tests
            </h2>
          </div>
          {activeTests.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-400 text-center">No active tests right now.</p>
          ) : (
            activeTests.map((test, i) => (
              <Link
                key={test.id}
                href={`/lecturer/assessments/${test.id}`}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${i !== 0 ? "border-t border-slate-100" : ""}`}
              >
                <span className={`shrink-0 h-1.5 w-1.5 rounded-full ${test.status === "Live" ? "bg-red-400 animate-pulse" : "bg-slate-300"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{test.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{test.course} · {test.batch}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock size={11} />
                  {test.timeRemaining}
                </div>
              </Link>
            ))
          )}
        </div>

        {/* My Batches */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Users size={14} className="text-[#002388]" />
              My Batches
            </h2>
          </div>
          {assignedClasses.map((cls, i) => (
            <div
              key={cls.name}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${i !== 0 ? "border-t border-slate-100" : ""}`}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[#002388] font-bold text-[10px] border border-slate-100 shrink-0">
                {cls.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{cls.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{cls.course}</p>
              </div>
              <span className="text-xs text-slate-400 shrink-0">{cls.students} students</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row: Grading Pipeline (Full Width) */}
      <div className="w-full">
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          {/* Card header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <TrendingUp size={15} className="text-[#002388]" />
              Grading Pipeline
            </h2>
            <Link
              href="/lecturer/assessments"
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#002388] transition-colors"
            >
              View all
              <ArrowRight size={12} />
            </Link>
          </div>
          {/* Rows */}
          {activeAssessments.map((item, i) => (
            <Link
              key={item.id}
              href={`/lecturer/assessments/${item.id}`}
              className={`flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors ${i !== 0 ? "border-t border-slate-100" : ""}`}
            >
              <span className={`shrink-0 h-1.5 w-1.5 rounded-full ${item.status === "Live" ? "bg-red-400 animate-pulse" : "bg-slate-300"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{item.course} · {item.classes.join(", ")}</p>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-1 w-24 shrink-0">
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-300 rounded-full" style={{ width: `${item.progress}%` }} />
                </div>
                <span className="text-[10px] text-slate-400">{item.submissions}/{item.total}</span>
              </div>
              <span className="shrink-0 text-[11px] text-slate-400 border border-slate-200 rounded px-2 py-0.5">
                {item.status}
              </span>
              <ArrowRight size={12} className="text-slate-300 shrink-0" />
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
