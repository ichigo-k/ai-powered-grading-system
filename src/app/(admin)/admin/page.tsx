export default function AdminDashboardPage() {
  const stats = [
    { label: "Total Students", value: "14,208", change: "+3.2%", icon: "🎓", color: "#2563EB" },
    { label: "Active Courses", value: "42", change: "+2", icon: "📚", color: "#7C3AED" },
    { label: "Faculty Count", value: "186", change: "+5", icon: "👨‍🏫", color: "#059669" },
    { label: "Pending Approvals", value: "7", change: "Urgent", icon: "⏳", color: "#D97706" },
  ]

  const courses = [
    { name: "Introduction to Computing", faculty: "Dr. Mensah", students: 120, status: "Active" },
    { name: "Calculus I", faculty: "Prof. Asante", students: 98, status: "Active" },
    { name: "Data Structures", faculty: "Dr. Owusu", students: 75, status: "Inactive" },
    { name: "Network Security", faculty: "Dr. Boateng", students: 60, status: "Active" },
  ]

  const notifications = [
    { text: "New user registration pending approval.", type: "warning" },
    { text: "Course CS301 enrollment limit reached.", type: "info" },
    { text: "System maintenance scheduled for Sunday 02:00 GMT.", type: "info" },
    { text: "3 faculty accounts require password reset.", type: "warning" },
  ]

  const notifColors: Record<string, { bg: string; dot: string }> = {
    warning: { bg: "#FEF3C7", dot: "#F59E0B" },
    info: { bg: "#EFF6FF", dot: "#3B82F6" },
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#94A3B8" }}>
            Chancellor Dashboard
          </p>
          <h1 className="text-3xl font-bold" style={{ color: "#0A1628" }}>System Overview</h1>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>
            Ghana Communication Technology University · Academic Year 2025/26
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors hover:bg-gray-50"
            style={{ borderColor: "#E2E8F0", color: "#0A1628" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            Add User
          </button>
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #0A1628 0%, #1a3a6b 100%)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Add Course
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border card-hover" style={{ borderColor: "#E2E8F0" }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: `${s.color}15`, color: s.color }}
              >
                {s.change}
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "#0A1628" }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Course & Faculty Directory */}
        <div className="col-span-2">
          <div className="bg-white rounded-2xl border" style={{ borderColor: "#E2E8F0" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#F1F5F9" }}>
              <h2 className="text-sm font-bold" style={{ color: "#0A1628" }}>Course & Faculty Directory</h2>
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border"
                style={{ borderColor: "#E2E8F0", color: "#64748B" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Search courses or faculty...
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                    {["Course Name", "Faculty", "Students", "Status", ""].map((col) => (
                      <th
                        key={col}
                        className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "#94A3B8" }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courses.map((row) => (
                    <tr
                      key={row.name}
                      className="hover:bg-gray-50/50 transition-colors"
                      style={{ borderBottom: "1px solid #F8FAFC" }}
                    >
                      <td className="px-6 py-4 font-semibold text-sm" style={{ color: "#0A1628" }}>{row.name}</td>
                      <td className="px-6 py-4 text-sm" style={{ color: "#64748B" }}>{row.faculty}</td>
                      <td className="px-6 py-4 text-sm font-semibold" style={{ color: "#0A1628" }}>{row.students}</td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={
                            row.status === "Active"
                              ? { background: "#ECFDF5", color: "#059669" }
                              : { background: "#F8FAFC", color: "#94A3B8" }
                          }
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: row.status === "Active" ? "#10B981" : "#CBD5E1" }}
                          />
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="text-xs font-semibold transition-colors hover:opacity-80"
                          style={{ color: "#2563EB" }}
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Integrity Shield */}
          <div
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0A1628 0%, #0D2045 100%)" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}
              >
                ✓
              </div>
              <div>
                <p className="text-sm font-bold text-white">Integrity Shield</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>All systems nominal</p>
              </div>
            </div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              No integrity violations detected in the last 24 hours.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-semibold" style={{ color: "#10B981" }}>Live Monitoring Active</span>
            </div>
            <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full" style={{ background: "rgba(16,185,129,0.06)" }} />
          </div>

          {/* System Notifications */}
          <div className="bg-white rounded-2xl border" style={{ borderColor: "#E2E8F0" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#F1F5F9" }}>
              <h3 className="text-sm font-bold" style={{ color: "#0A1628" }}>System Notifications</h3>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: "#FEF3C7", color: "#D97706" }}
              >
                {notifications.length}
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: "#F8FAFC" }}>
              {notifications.map((n, i) => {
                const cfg = notifColors[n.type]
                return (
                  <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                    <span
                      className="mt-0.5 w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: cfg.dot }}
                    />
                    <p className="text-xs leading-relaxed" style={{ color: "#64748B" }}>{n.text}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "#E2E8F0" }}>
            <h3 className="text-sm font-bold mb-4" style={{ color: "#0A1628" }}>Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "Manage Users", icon: "👥" },
                { label: "View Reports", icon: "📊" },
                { label: "System Settings", icon: "⚙️" },
              ].map((a) => (
                <button
                  key={a.label}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors hover:bg-gray-50"
                  style={{ borderColor: "#E2E8F0", color: "#0A1628" }}
                >
                  <span>{a.icon}</span>
                  {a.label}
                  <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
