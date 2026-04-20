import { getSession } from "@/lib/session"

const courses = [
  { code: "CS101", title: "Introduction to Computing", lecturer: "Dr. Mensah", credit: 3, color: "#2563EB", pattern: "circles" },
  { code: "MATH201", title: "Calculus I", lecturer: "Prof. Agyei", credit: 3, color: "#7C3AED", pattern: "diamonds" },
  { code: "CS301", title: "Data Structures", lecturer: "Dr. Boateng", credit: 3, color: "#0891B2", pattern: "hexagons" },
  { code: "ENG101", title: "Technical Writing", lecturer: "Mrs. Owusu", credit: 2, color: "#059669", pattern: "circles" },
]

const upcomingExams = [
  { name: "CS101 Final Exam", date: "Dec 15", time: "09:00 AM", venue: "Hall A", daysLeft: 5, urgent: true },
  { name: "MATH201 Quiz 4", date: "Nov 28", time: "02:00 PM", venue: "Room 204", daysLeft: 12, urgent: false },
  { name: "CS301 Midterm", date: "Dec 02", time: "10:00 AM", venue: "Hall B", daysLeft: 16, urgent: false },
]

const recentActivity = [
  { text: "CS101 assignment graded", sub: "Score: 88/100", time: "2h ago", color: "#2563EB" },
  { text: "MATH201 lecture notes uploaded", sub: "Chapter 7 – Integration", time: "Yesterday", color: "#7C3AED" },
  { text: "ENG101 quiz result released", sub: "Score: 92/100", time: "2 days ago", color: "#059669" },
]

const schedule: Record<string, { time: string; course: string; color: string; type?: string }[]> = {
  Mon: [{ time: "08:00", course: "CS101", color: "#2563EB" }, { time: "14:00", course: "MATH201", color: "#7C3AED" }],
  Tue: [{ time: "10:00", course: "CS301", color: "#0891B2" }],
  Wed: [{ time: "08:00", course: "CS101", color: "#2563EB" }, { time: "12:00", course: "ENG101", color: "#059669" }],
  Thu: [{ time: "10:00", course: "CS301", color: "#0891B2" }, { time: "14:00", course: "MATH201", color: "#7C3AED" }],
  Fri: [{ time: "12:00", course: "ENG101", color: "#059669" }],
  Sat: [{ time: "09:00", course: "CS101", color: "#2563EB", type: "Exam" }],
  Sun: [],
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

export default async function StudentDashboardPage() {
  const session = await getSession()
  const displayName = session?.user?.name ?? session?.user?.userId ?? "Student"
  const firstName = displayName.split(" ")[0]
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* ── Hero header ── */}
      <div
        className="relative rounded-2xl overflow-hidden px-5 py-6 md:px-8 md:py-7"
        style={{ background: "linear-gradient(135deg, #0A1628 0%, #0D2A5E 60%, #1a3a6b 100%)" }}
      >
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full opacity-10" style={{ background: "#2563EB" }} />
        <div className="absolute bottom-0 right-32 w-32 h-32 rounded-full opacity-5" style={{ background: "#fff" }} />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>
              Student Portal · {today}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
              Good morning, {firstName}
            </h1>
            <p className="text-sm mt-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
              You have <span className="font-semibold text-white">2 exams</span> coming up this week. Stay focused.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-white/10"
              style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="hidden sm:inline">Exam Slip</span>
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "#2563EB" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
              </svg>
              <span className="hidden sm:inline">Start Exam</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left col */}
        <div className="lg:col-span-2 space-y-5">

          {/* Enrolled Courses */}
          <div className="bg-white rounded-2xl border p-5 md:p-6" style={{ borderColor: "#E2E8F0" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold" style={{ color: "#0A1628" }}>Enrolled Courses</h2>
              <a href="/student/courses" className="text-xs font-semibold" style={{ color: "#2563EB" }}>View All →</a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.map((course) => {
                const banner = course.pattern === "diamonds"
                  ? `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><rect width='40' height='40' fill='${course.color}'/><rect x='10' y='10' width='20' height='20' fill='${course.color}cc' transform='rotate(45 20 20)'/></svg>`
                  : course.pattern === "hexagons"
                  ? `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='46'><rect width='40' height='46' fill='${course.color}'/><polygon points='20,2 38,12 38,34 20,44 2,34 2,12' fill='${course.color}bb'/></svg>`
                  : `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><rect width='40' height='40' fill='${course.color}'/><circle cx='20' cy='20' r='14' fill='${course.color}99'/><circle cx='20' cy='20' r='7' fill='${course.color}66'/></svg>`
                const bannerUrl = `data:image/svg+xml,${encodeURIComponent(banner)}`
                return (
                  <div key={course.code} className="rounded-2xl border overflow-hidden hover:shadow-md transition-shadow cursor-pointer" style={{ borderColor: "#E2E8F0" }}>
                    <div className="h-24 relative" style={{ background: course.color }}>
                      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url("${bannerUrl}")`, backgroundSize: "40px", backgroundRepeat: "repeat" }} />
                      <div className="absolute bottom-3 left-4">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: "rgba(0,0,0,0.25)", color: "#fff" }}>{course.code}</span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>{course.credit} cr</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-sm leading-snug" style={{ color: "#0A1628" }}>{course.title}</p>
                      <div className="flex items-center gap-2 mt-2.5">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: course.color }}>
                          {course.lecturer.split(" ").map(w => w[0]).slice(0, 2).join("")}
                        </div>
                        <p className="text-xs" style={{ color: "#64748B" }}>{course.lecturer}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-5">

          {/* Upcoming Exams */}
          <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "#E2E8F0" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold" style={{ color: "#0A1628" }}>Upcoming Exams</h3>
              <span className="text-xs" style={{ color: "#94A3B8" }}>Dec 2024</span>
            </div>
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <div key={exam.name} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0" style={{ borderColor: "#F1F5F9" }}>
                  <div
                    className="w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-white"
                    style={{ background: exam.urgent ? "#DC2626" : "linear-gradient(135deg, #0A1628 0%, #1a3a6b 100%)" }}
                  >
                    <span className="text-xs font-bold leading-none">{exam.date.split(" ")[1]}</span>
                    <span className="text-[10px] opacity-70 leading-none">{exam.date.split(" ")[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: "#0A1628" }}>{exam.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>{exam.time} · {exam.venue}</p>
                  </div>
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                    style={exam.urgent ? { background: "#FEE2E2", color: "#DC2626" } : { background: "#FEF3C7", color: "#D97706" }}
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

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "#E2E8F0" }}>
            <h3 className="text-sm font-bold mb-4" style={{ color: "#0A1628" }}>Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color: "#0A1628" }}>{item.text}</p>
                    <p className="text-xs" style={{ color: "#94A3B8" }}>{item.sub}</p>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: "#CBD5E1" }}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Weekly Schedule (full width) ── */}
      <div className="bg-white rounded-2xl border p-5 md:p-6" style={{ borderColor: "#E2E8F0" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold" style={{ color: "#0A1628" }}>Weekly Schedule</h2>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "#F1F5F9", color: "#64748B" }}>This Week</span>
        </div>
        {/* Scrollable on mobile */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 gap-2 min-w-[560px]">
            {DAYS.map((day) => {
              const isWeekend = day === "Sat" || day === "Sun"
              return (
                <div key={day}>
                  <div
                    className="text-center text-xs font-bold uppercase tracking-wider py-2 rounded-lg mb-2"
                    style={{ background: isWeekend ? "#FEF3C7" : "#F8FAFC", color: isWeekend ? "#D97706" : "#64748B" }}
                  >
                    {day}
                  </div>
                  <div className="flex flex-col gap-1.5 min-h-[100px]">
                    {schedule[day].length === 0 ? (
                      <p className="text-xs text-center mt-6" style={{ color: "#CBD5E1" }}>—</p>
                    ) : (
                      schedule[day].map((slot) => (
                        <div
                          key={`${day}-${slot.time}`}
                          className="rounded-lg px-2 py-2 text-xs"
                          style={{
                            background: slot.type === "Exam" ? "#FEE2E2" : `${slot.color}12`,
                            borderLeft: `3px solid ${slot.type === "Exam" ? "#DC2626" : slot.color}`
                          }}
                        >
                          <p className="font-bold leading-none" style={{ color: slot.type === "Exam" ? "#DC2626" : slot.color }}>{slot.course}</p>
                          <p className="mt-0.5" style={{ color: "#94A3B8" }}>{slot.time}</p>
                          {slot.type && <p className="mt-0.5 font-semibold text-[10px]" style={{ color: "#DC2626" }}>{slot.type}</p>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
