import { getSession } from "@/lib/session"

const courses = [
  { code: "CS101", title: "Introduction to Computing", progress: 78, status: "Active" },
  { code: "MATH201", title: "Calculus I", progress: 55, status: "Active" },
  { code: "CS301", title: "Data Structures", progress: 40, status: "Active" },
  { code: "ENG101", title: "Technical Writing", progress: 90, status: "Active" },
]

const upcomingExams = [
  { name: "CS101 Final Exam", date: "Dec 15", time: "09:00 AM", venue: "Hall A", daysLeft: 5 },
  { name: "MATH201 Quiz 4", date: "Nov 28", time: "02:00 PM", venue: "Room 204", daysLeft: 12 },
  { name: "CS301 Midterm", date: "Dec 02", time: "10:00 AM", venue: "Hall B", daysLeft: 16 },
]

const schedule: Record<string, { time: string; course: string }[]> = {
  Mon: [{ time: "08:00", course: "CS101" }, { time: "14:00", course: "MATH201" }],
  Tue: [{ time: "10:00", course: "CS301" }],
  Wed: [{ time: "08:00", course: "CS101" }, { time: "12:00", course: "ENG101" }],
  Thu: [{ time: "10:00", course: "CS301" }, { time: "14:00", course: "MATH201" }],
  Fri: [{ time: "12:00", course: "ENG101" }],
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const

const courseColors: Record<string, string> = {
  CS101: "#2563EB",
  MATH201: "#7C3AED",
  CS301: "#0891B2",
  ENG101: "#059669",
}

export default async function StudentDashboardPage() {
  const session = await getSession()
  const displayName = session?.user?.name ?? session?.user?.userId ?? "Student"
  const firstName = displayName.split(" ")[0]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#94A3B8" }}>
            Student Portal
          </p>
          <h1 className="text-3xl font-bold leading-tight" style={{ color: "#0A1628" }}>
            Welcome back, {firstName}.
          </h1>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>
            Your academic journey continues. You have{" "}
            <span className="font-semibold" style={{ color: "#0A1628" }}>2 upcoming exams</span> this week.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors hover:bg-gray-50"
            style={{ borderColor: "#E2E8F0", color: "#0A1628" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Exam Slip
          </button>
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #0A1628 0%, #1a3a6b 100%)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
            Start Exam
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Current GPA", value: "3.8", sub: "Semester 1, 2024", icon: "📈", color: "#2563EB" },
          { label: "Credits Earned", value: "12", sub: "of 18 this semester", icon: "🎓", color: "#7C3AED" },
          { label: "Rank Percentile", value: "Top 15%", sub: "Among 420 students", icon: "🏆", color: "#059669" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border card-hover" style={{ borderColor: "#E2E8F0" }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: `${s.color}15`, color: s.color }}
              >
                Live
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "#0A1628" }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{s.label}</p>
            <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Courses + Schedule */}
        <div className="col-span-2 space-y-6">
          {/* Enrolled Courses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold" style={{ color: "#0A1628" }}>Currently Enrolled Courses</h2>
              <a href="/student/courses" className="text-xs font-semibold" style={{ color: "#2563EB" }}>View All →</a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {courses.map((course) => (
                <div key={course.code} className="bg-white rounded-2xl p-5 border card-hover" style={{ borderColor: "#E2E8F0" }}>
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: courseColors[course.code] ?? "#2563EB" }}
                    >
                      {course.code.slice(0, 2)}
                    </div>
                    <span className="badge-active text-xs font-semibold px-2 py-0.5 rounded-full">
                      {course.status}
                    </span>
                  </div>
                  <p className="font-bold text-sm mb-0.5" style={{ color: "#0A1628" }}>{course.code}</p>
                  <p className="text-xs mb-4 line-clamp-1" style={{ color: "#64748B" }}>{course.title}</p>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span style={{ color: "#94A3B8" }}>Course Progress</span>
                      <span className="font-semibold" style={{ color: "#0A1628" }}>{course.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${course.progress}%`, background: courseColors[course.code] ?? "#2563EB" }}
                      />
                    </div>
                  </div>
                  <a
                    href={`/student/exams?course=${course.code}`}
                    className="text-xs font-semibold flex items-center gap-1 transition-colors hover:opacity-80"
                    style={{ color: courseColors[course.code] ?? "#2563EB" }}
                  >
                    View Tests
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold" style={{ color: "#0A1628" }}>Class Schedule</h2>
              <span className="text-xs" style={{ color: "#94A3B8" }}>This Week</span>
            </div>
            <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
              <div className="grid grid-cols-5 divide-x" style={{ borderColor: "#E2E8F0" }}>
                {DAYS.map((day) => (
                  <div key={day}>
                    <div
                      className="px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wider"
                      style={{ background: "#F8FAFC", color: "#64748B", borderBottom: "1px solid #E2E8F0" }}
                    >
                      {day}
                    </div>
                    <div className="p-2 min-h-[110px] flex flex-col gap-1.5">
                      {schedule[day].length === 0 ? (
                        <p className="text-xs text-center mt-4" style={{ color: "#CBD5E1" }}>—</p>
                      ) : (
                        schedule[day].map((slot) => (
                          <div
                            key={`${day}-${slot.time}`}
                            className="rounded-lg px-2 py-1.5 text-xs"
                            style={{
                              background: `${courseColors[slot.course] ?? "#2563EB"}10`,
                              borderLeft: `3px solid ${courseColors[slot.course] ?? "#2563EB"}`,
                            }}
                          >
                            <p className="font-bold" style={{ color: courseColors[slot.course] ?? "#2563EB" }}>{slot.course}</p>
                            <p style={{ color: "#94A3B8" }}>{slot.time}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Exam Schedule + Quick Stats */}
        <div className="space-y-5">
          {/* Exam Schedule */}
          <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: "#E2E8F0" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold" style={{ color: "#0A1628" }}>Exam Schedule</h3>
              <span className="text-xs" style={{ color: "#94A3B8" }}>May 2026</span>
            </div>
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <div key={exam.name} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0" style={{ borderColor: "#F1F5F9" }}>
                  <div
                    className="w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-white"
                    style={{ background: "linear-gradient(135deg, #0A1628 0%, #1a3a6b 100%)" }}
                  >
                    <span className="text-xs font-bold leading-none">{exam.date.split(" ")[1]}</span>
                    <span className="text-xs opacity-70 leading-none">{exam.date.split(" ")[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: "#0A1628" }}>{exam.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>{exam.time} · {exam.venue}</p>
                  </div>
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                    style={{ background: "#FEF3C7", color: "#D97706" }}
                  >
                    {exam.daysLeft}d
                  </span>
                </div>
              ))}
            </div>
            <a href="/student/schedule" className="block text-center text-xs font-semibold mt-4" style={{ color: "#2563EB" }}>
              Full Academic Calendar →
            </a>
          </div>

          {/* Quick Stats dark card */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "linear-gradient(135deg, #0A1628 0%, #0D2045 100%)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
              Quick Stats
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl font-bold text-white">3.8</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>Current GPA</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">12</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>Credits</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Semester Progress</span>
                <span className="font-semibold" style={{ color: "#F5C518" }}>67%</span>
              </div>
              <div className="progress-bar" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div className="progress-fill progress-fill-gold" style={{ width: "67%" }} />
              </div>
            </div>
          </div>

          {/* Advisor card */}
          <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: "#E2E8F0" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#94A3B8" }}>Your Advisor</p>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" }}
              >
                SA
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#0A1628" }}>Dr. Sarah Asante</p>
                <p className="text-xs" style={{ color: "#94A3B8" }}>Dept. of Computer Science</p>
              </div>
            </div>
            <button
              className="w-full py-2 rounded-xl text-xs font-semibold border transition-colors hover:bg-gray-50"
              style={{ borderColor: "#E2E8F0", color: "#0A1628" }}
            >
              Message Advisor
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
