const courses = [
  { code: "CS101", title: "Introduction to Computing", students: 45, activeAssessments: 2 },
  { code: "MATH201", title: "Calculus I", students: 38, activeAssessments: 1 },
  { code: "CS301", title: "Data Structures", students: 52, activeAssessments: 3 },
]

const assessments = [
  { name: "Midterm Exam", course: "CS101", status: "Grading in Progress", dueDate: "Nov 20, 2024" },
  { name: "Assignment 2", course: "MATH201", status: "Pending", dueDate: "Nov 25, 2024" },
  { name: "Final Exam", course: "CS101", status: "Finalised", dueDate: "Dec 15, 2024" },
  { name: "Lab Report 3", course: "CS301", status: "Pending", dueDate: "Nov 28, 2024" },
  { name: "Quiz 4", course: "CS301", status: "Grading in Progress", dueDate: "Nov 18, 2024" },
]

const statusBadge = (status: string) => {
  if (status === "Grading in Progress") {
    return "bg-amber-100 text-amber-700"
  }
  if (status === "Pending") {
    return "bg-blue-100 text-blue-700"
  }
  return "bg-green-100 text-green-700"
}

export default function LecturerDashboardPage() {
  return (
    <div>
      {/* Heading */}
      <h1 className="text-3xl font-bold mb-8" style={{ color: "#003366" }}>
        Academic Portfolio
      </h1>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {courses.map((course) => (
          <div key={course.code} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div
              className="px-4 py-3 text-white"
              style={{ backgroundColor: "#003366" }}
            >
              <p className="text-lg font-bold">{course.code}</p>
              <p className="text-sm opacity-80">{course.title}</p>
            </div>
            <div className="px-4 py-4 flex gap-6">
              <div>
                <p className="text-2xl font-bold" style={{ color: "#003366" }}>
                  {course.students}
                </p>
                <p className="text-xs text-gray-500">Students</p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "#003366" }}>
                  {course.activeAssessments}
                </p>
                <p className="text-xs text-gray-500">Active Assessments</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Assessment Registry */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4" style={{ color: "#003366" }}>
          Assessment Registry
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200">
                {["Assessment Name", "Course", "Status", "Due Date"].map((col) => (
                  <th
                    key={col}
                    className="pb-3 pr-4 font-semibold text-gray-500 uppercase tracking-wide text-xs"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assessments.map((row) => (
                <tr key={row.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-800">{row.name}</td>
                  <td className="py-3 pr-4 text-gray-600">{row.course}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">{row.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New Test CTA */}
      <button
        className="py-2 px-6 rounded-md text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        style={{ backgroundColor: "#003366" }}
      >
        + Create New Test
      </button>
    </div>
  )
}
