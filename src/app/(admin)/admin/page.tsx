export default function AdminDashboardPage() {
  return (
    <div>
      {/* Heading */}
      <h1 className="text-3xl font-bold mb-8" style={{ color: "#003366" }}>
        Chancellor Dashboard
      </h1>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {[
          { label: "Total Students", value: "14,208" },
          { label: "Active Courses", value: "42" },
          { label: "Faculty Count", value: "186" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg overflow-hidden shadow-sm">
            <div
              className="px-4 py-2 text-white text-sm font-semibold"
              style={{ backgroundColor: "#003366" }}
            >
              {stat.label}
            </div>
            <div className="bg-white px-4 py-6">
              <p className="text-3xl font-bold" style={{ color: "#003366" }}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Course & Faculty Directory */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4" style={{ color: "#003366" }}>
          Course &amp; Faculty Directory
        </h2>
        <input
          type="text"
          placeholder="Search courses or faculty..."
          className="w-full border border-gray-200 rounded-md px-4 py-2 mb-4 text-sm focus:outline-none focus:ring-2"
          style={{ "--tw-ring-color": "#003366" } as React.CSSProperties}
          readOnly
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200">
                {["Name", "Faculty", "Students", "Status", "Actions"].map((col) => (
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
              {[
                { name: "Introduction to Computing", faculty: "Dr. Mensah", students: 120, status: "Active" },
                { name: "Calculus I", faculty: "Prof. Asante", students: 98, status: "Active" },
                { name: "Data Structures", faculty: "Dr. Owusu", students: 75, status: "Inactive" },
              ].map((row) => (
                <tr key={row.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-800">{row.name}</td>
                  <td className="py-3 pr-4 text-gray-600">{row.faculty}</td>
                  <td className="py-3 pr-4 text-gray-600">{row.students}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        row.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <button
                      className="text-xs font-medium hover:underline"
                      style={{ color: "#0055A4" }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom row: Quick Actions + System Notifications */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: "#003366" }}>
            Quick Actions
          </h2>
          <div className="flex flex-col gap-3">
            <button
              className="w-full py-2 px-4 rounded-md text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#003366" }}
            >
              + Add User
            </button>
            <button
              className="w-full py-2 px-4 rounded-md text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#003366" }}
            >
              + Add Course
            </button>
          </div>
        </div>

        {/* System Notifications */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: "#003366" }}>
            System Notifications
          </h2>
          <ul className="space-y-3">
            {[
              "New user registration pending approval.",
              "Course CS301 enrollment limit reached.",
              "System maintenance scheduled for Sunday 02:00 GMT.",
            ].map((note) => (
              <li key={note} className="flex items-start gap-2 text-sm text-gray-600">
                <span
                  className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: "#FFCC00" }}
                />
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Integrity Shield Widget */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: "#003366" }}>
          Integrity Shield
        </h2>
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
            style={{ backgroundColor: "#003366" }}
          >
            ✓
          </div>
          <div>
            <p className="font-semibold text-gray-800">All systems nominal</p>
            <p className="text-sm text-gray-500">No integrity violations detected in the last 24 hours.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
