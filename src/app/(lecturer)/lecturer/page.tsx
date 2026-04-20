const courses = [
  { code: "CS101", title: "Introduction to Computing", students: 45, activeAssessments: 2, color: "#2563EB" },
  { code: "MATH201", title: "Calculus I", students: 38, activeAssessments: 1, color: "#7C3AED" },
  { code: "CS301", title: "Data Structures", students: 52, activeAssessments: 3, color: "#0891B2" },
]

const assessments = [
  { name: "Midterm Exam", course: "CS101", status: "Grading in Progress", dueDate: "Nov 20, 2024", questions: 45 },
  { name: "Assignment 2", course: "MATH201", status: "Pending", dueDate: "Nov 25, 2024", questions: 12 },
  { name: "Final Exam", course: "CS101", status: "Finalised", dueDate: "Dec 15, 2024", questions: 60 },
  { name: "Lab Report 3", course: "CS301", status: "Pending", dueDate: "Nov 28, 2024", questions: 10 },
  { name: "Quiz 4", course: "CS301", status: "Grading in Progress", dueDate: "Nov 18, 2024", questions: 18 },
]

const batches = [
  { name: "Morning Group A", students: 42, enrolled: true },
  { name: "Evening Group B", students: 38, enrolled: true },
  { name: "Distance Learning", students: 44, enrolled: false },
]

const batchPerformance = [
  { group: "Group A", pct: 78, color: "#2563EB" },
  { group: "Group B", pct: 62, color: "#7C3AED" },
  { group: "Distance", pct: 54, color: "#F5C518" },
]

const statusConfig: Record<string, { bg: string; color: string; dot: string }> = {
  "Grading in Progress": { bg: "#FEF3C7", color: "#D97706", dot: "#F59E0B" },
  "Pending": { bg: "#EFF6FF", color: "#2563EB", dot: "#3B82F6" },
  "Finalised": { bg: "#ECFDF5", color: "#059669", dot: "#10B981" },
}

const courseColors: Record<string, string> = {
  CS101: "#2563EB",
  MATH201: "#7C3AED",
  CS301: "#0891B2",
}

export default function LecturerDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#94A3B8" }}>
            Portfolio · Lecturer View
          </p>
          <h1 className="text-3xl font-bold" style={{ color: "#0A1628" }}>Academic Portfolio</h1>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>
            Overseeing <span className="font-semibold" style={{ color: "#0A1628" }}>3 Courses</span> and{" "}
            <span className="font-semibold" style={{ color: "#0A1628" }}>3 Active Batches</span>
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #0A1628 0%, #1a3a6b 100%)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Create New Test
        </button>
      </div>

      {/* Active Course Hero */}
      <div
        className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0A1628 0%, #1a3a6b 100%)" }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="badge-active text-xs font-bold px-2.5 py-1 rounded-full">Active Course</span>
              <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>CSC 402</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4 leading-tight">
              Advanced Neural<br />Architectures
            </h2>
            <div className="flex items-center gap-8">
              <div>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Total Students</p>
                <p className="text-3xl font-bold text-white">124</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Tests Completed</p>
                <p className="text-3xl font-bold text-white">08</p>
              </div>
            </div>
          </div>
          <div
            className="w-32 h-28 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full" style={{ background: "rgba(245,197,24,0.05)" }} />
        <div className="absolute -right-4 -bottom-12 w-56 h-56 rounded-full" style={{ background: "rgba(37,99,235,0.08)" }} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Course cards + Assessment Registry */}
        <div className="col-span-2 space-y-6">
          {/* Course cards */}
          <div className="grid grid-cols-3 gap-4">
            {courses.map((course) => (
              <div key={course.code} className="bg-white rounded-2xl overflow-hidden border card-hover" style={{ borderColor: "#E2E8F0" }}>
                <div className="h-1.5" style={{ background: course.color }} />
                <div className="p-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold mb-3"
                    style={{ background: course.color }}
                  >
                    {course.code.slice(0, 2)}
                  </div>
                  <p className="font-bold text-sm" style={{ color: "#0A1628" }}>{course.code}</p>
                  <p className="text-xs mb-4 line-clamp-1" style={{ color: "#64748B" }}>{course.title}</p>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-xl font-bold" style={{ color: "#0A1628" }}>{course.students}</p>
                      <p className="text-xs" style={{ color: "#94A3B8" }}>Students</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold" style={{ color: "#0A1628" }}>{course.activeAssessments}</p>
                      <p className="text-xs" style={{ color: "#94A3B8" }}>Assessments</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Assessment Registry */}
          <div className="bg-white rounded-2xl border" style={{ borderColor: "#E2E8F0" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#F1F5F9" }}>
              <h2 className="text-sm font-bold" style={{ color: "#0A1628" }}>Assessment Registry</h2>
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border"
                  style={{ borderColor: "#E2E8F0", color: "#64748B" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Search tests...
                </div>
                <button
                  className="p-1.5 rounded-lg border transition-colors hover:bg-gray-50"
                  style={{ borderColor: "#E2E8F0" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                    <line x1="11" y1="18" x2="13" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="divide-y" style={{ borderColor: "#F1F5F9" }}>
              {assessments.map((row) => {
                const cfg = statusConfig[row.status]
                return (
                  <div key={row.name} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${courseColors[row.course] ?? "#2563EB"}15` }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={courseColors[row.course] ?? "#2563EB"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "#0A1628" }}>{row.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                        {row.course} · {row.questions} Questions
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                        {row.status}
                      </span>
                      <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>{row.dueDate}</p>
                    </div>
                    <button style={{ color: "#94A3B8" }} className="hover:text-gray-600 transition-colors flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Batches + Performance */}
        <div className="space-y-5">
          {/* Student Batches */}
          <div className="bg-white rounded-2xl border" style={{ borderColor: "#E2E8F0" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#F1F5F9" }}>
              <h3 className="text-sm font-bold" style={{ color: "#0A1628" }}>Student Batches</h3>
              <button
                className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                style={{ background: "#EFF6FF", color: "#2563EB" }}
              >
                Enroll
              </button>
            </div>
            <div className="divide-y" style={{ borderColor: "#F1F5F9" }}>
              {batches.map((b) => (
                <div key={b.name} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#0A1628" }}>{b.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>{b.students} Students Enrolled</p>
                  </div>
                  <button
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
                    style={{ color: "#94A3B8" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Index dark card */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "linear-gradient(135deg, #0A1628 0%, #0D2045 100%)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>
                Performance Index
              </p>
            </div>
            <div className="space-y-3">
              {batchPerformance.map((b) => (
                <div key={b.group}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color: "rgba(255,255,255,0.6)" }}>{b.group}</span>
                    <span className="font-bold text-white">{b.pct}%</span>
                  </div>
                  <div className="progress-bar" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <div className="progress-fill" style={{ width: `${b.pct}%`, background: b.color }} />
                  </div>
                </div>
              ))}
            </div>
            <button
              className="w-full mt-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-opacity hover:opacity-90"
              style={{ background: "rgba(245,197,24,0.15)", color: "#F5C518", border: "1px solid rgba(245,197,24,0.2)" }}
            >
              Download Full Report
            </button>
          </div>

          {/* Other Courses */}
          <div className="bg-white rounded-2xl border" style={{ borderColor: "#E2E8F0" }}>
            <p className="text-xs font-semibold uppercase tracking-wider px-5 pt-4 pb-2" style={{ color: "#94A3B8" }}>
              Other Courses
            </p>
            {[
              { code: "CS201", title: "Data Structures" },
              { code: "CS401", title: "AI Ethics & Policy" },
            ].map((c) => (
              <div
                key={c.code}
                className="flex items-center justify-between px-5 py-3 border-t hover:bg-gray-50/50 transition-colors cursor-pointer"
                style={{ borderColor: "#F1F5F9" }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#0A1628" }}>{c.title}</p>
                  <p className="text-xs" style={{ color: "#94A3B8" }}>{c.code}</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
