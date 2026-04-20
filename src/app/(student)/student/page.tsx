import { getSession } from "@/lib/session"

const courses = [
  { code: "CS101", title: "Introduction to Computing" },
  { code: "MATH201", title: "Calculus I" },
  { code: "CS301", title: "Data Structures" },
  { code: "ENG101", title: "Technical Writing" },
]

const upcomingExams = [
  { name: "CS101 Final Exam", date: "Dec 15, 2024", time: "09:00 AM", venue: "Hall A" },
  { name: "MATH201 Quiz 4", date: "Nov 28, 2024", time: "02:00 PM", venue: "Room 204" },
  { name: "CS301 Midterm", date: "Dec 02, 2024", time: "10:00 AM", venue: "Hall B" },
]

const schedule: Record<string, { time: string; course: string }[]> = {
  Mon: [
    { time: "08:00", course: "CS101" },
    { time: "14:00", course: "MATH201" },
  ],
  Tue: [
    { time: "10:00", course: "CS301" },
  ],
  Wed: [
    { time: "08:00", course: "CS101" },
    { time: "12:00", course: "ENG101" },
  ],
  Thu: [
    { time: "10:00", course: "CS301" },
    { time: "14:00", course: "MATH201" },
  ],
  Fri: [
    { time: "12:00", course: "ENG101" },
  ],
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const

export default async function StudentDashboardPage() {
  const session = await getSession()
  const displayName = session?.user?.name ?? session?.user?.userId ?? "Student"

  return (
    <div>
      {/* Welcome Banner */}
      <h1 className="text-3xl font-bold mb-8" style={{ color: "#003366" }}>
        Welcome back, {displayName} 👋
      </h1>

      {/* Currently Enrolled Courses */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4" style={{ color: "#003366" }}>
          Currently Enrolled Courses
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {courses.map((course) => (
            <div key={course.code} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div
                className="px-4 py-3 text-white"
                style={{ backgroundColor: "#003366" }}
              >
                <p className="text-lg font-bold">{course.code}</p>
                <p className="text-xs opacity-80 truncate">{course.title}</p>
              </div>
              <div className="px-4 py-3 flex flex-col gap-2">
                <span
                  className="self-start px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: "#FFCC00", color: "#003366" }}
                >
                  Active
                </span>
                <a
                  href={`/student/exams?course=${course.code}`}
                  className="text-xs font-medium hover:underline"
                  style={{ color: "#0055A4" }}
                >
                  View Tests →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Exams + GPA & Stats */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
        {/* Upcoming Exams */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: "#003366" }}>
            Upcoming Exams
          </h2>
          <ul className="space-y-3">
            {upcomingExams.map((exam) => (
              <li key={exam.name} className="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <span
                  className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: "#FFCC00" }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">{exam.name}</p>
                  <p className="text-xs text-gray-500">
                    {exam.date} &bull; {exam.time} &bull; {exam.venue}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* GPA & Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: "#003366" }}>
            GPA &amp; Stats
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "GPA", value: "3.6" },
              { label: "Credits Earned", value: "18" },
              { label: "Rank Percentile", value: "Top 20%" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold" style={{ color: "#003366" }}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Class Schedule */}
      <section>
        <h2 className="text-xl font-semibold mb-4" style={{ color: "#003366" }}>
          Class Schedule
        </h2>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-5 divide-x divide-gray-100">
            {DAYS.map((day) => (
              <div key={day}>
                <div
                  className="px-3 py-2 text-center text-xs font-semibold text-white"
                  style={{ backgroundColor: "#003366" }}
                >
                  {day}
                </div>
                <div className="p-2 min-h-[120px] flex flex-col gap-2">
                  {schedule[day].length === 0 ? (
                    <p className="text-xs text-gray-400 text-center mt-4">—</p>
                  ) : (
                    schedule[day].map((slot) => (
                      <div
                        key={`${day}-${slot.time}`}
                        className="rounded px-2 py-1 text-xs"
                        style={{ backgroundColor: "#F8F9FA", borderLeft: "3px solid #FFCC00" }}
                      >
                        <p className="font-semibold" style={{ color: "#003366" }}>{slot.course}</p>
                        <p className="text-gray-500">{slot.time}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
