import { getSession } from "@/lib/session"

const stats = [
  {
    label: "Total Students", value: "14,208", change: "+3.2%", up: true, color: "#2563EB", bg: "#EFF6FF",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  },
  {
    label: "Active Courses", value: "42", change: "+2 this sem", up: true, color: "#7C3AED", bg: "#F5F3FF",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  },
  {
    label: "Faculty Members", value: "186", change: "+5 new", up: true, color: "#059669", bg: "#ECFDF5",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
  },
  {
    label: "Pending Approvals", value: "7", change: "Needs action", up: false, color: "#D97706", bg: "#FFFBEB",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  },
]

const recentUsers = [
  { name: "Kwame Asante", id: "STU-2024-001", role: "Student", programme: "BSc. Computer Science", status: "Active", joined: "Jan 12" },
  { name: "Abena Mensah", id: "STU-2024-002", role: "Student", programme: "BSc. IT", status: "Pending", joined: "Jan 14" },
  { name: "Dr. Kofi Boateng", id: "FAC-2024-010", role: "Lecturer", programme: "Dept. of CS", status: "Active", joined: "Jan 10" },
  { name: "Ama Owusu", id: "STU-2024-003", role: "Student", programme: "BSc. Computer Science", status: "Active", joined: "Jan 15" },
  { name: "Prof. Yaw Darko", id: "FAC-2024-011", role: "Lecturer", programme: "Dept. of Math", status: "Active", joined: "Jan 9" },
]

const courses = [
  { code: "CS101", name: "Introduction to Computing", faculty: "Dr. Mensah", students: 120, exams: 3, status: "Active" },
  { code: "MATH201", name: "Calculus I", faculty: "Prof. Asante", students: 98, exams: 2, status: "Active" },
  { code: "CS301", name: "Data Structures", faculty: "Dr. Owusu", students: 75, exams: 2, status: "Active" },
  { code: "NET401", name: "Network Security", faculty: "Dr. Boateng", students: 60, exams: 1, status: "Inactive" },
  { code: "ENG101", name: "Technical Writing", faculty: "Mrs. Frimpong", students: 110, exams: 2, status: "Active" },
]

const notifications = [
  { text: "New user registration pending approval", type: "warning", time: "5m ago" },
  { text: "Course CS301 enrollment limit reached", type: "info", time: "1h ago" },
  { text: "System maintenance scheduled Sunday 02:00 GMT", type: "info", time: "3h ago" },
  { text: "3 faculty accounts require password reset", type: "warning", time: "Today" },
]

export default async function AdminDashboardPage() {
  const session = await getSession()
  const name = session?.user?.name ?? "Administrator"
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Hero ── */}
      <div
        className="relative rounded-2xl overflow-hidden px-6 py-6 md:px-8 md:py-7"
        style={{ background: "linear-gradient(135deg, #0A1628 0%, #0D2A5E 60%, #1a3a6b 100%)" }}
      >
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full opacity-10" style={{ background: "#2563EB" }} />
        <div className="absolute bottom-0 right-40 w-32 h-32 rounded-full opacity-5" style={{ background: "#fff" }} />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>
              Admin Portal · {today}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome back, {name.split(" ")[0]}</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
              Ghana Communication Technology University · Academic Year 2025/26
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-white/10"
              style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              <span className="hidden sm:inline">Add User</span>
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "#2563EB" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              <span className="hidden sm:inline">Add Course</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border p-5" style={{ borderColor: "#E2E8F0" }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
                {s.change}
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "#0A1628" }}>{s.value}</p>
            <p className="text-xs mt-0.5 font-medium" style={{ color: "#64748B" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — 2/3 */}
        <div className="lg:col-span-2 space-y-6">

          {/* Recent Users */}
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#F1F5F9" }}>
              <h2 className="text-sm font-bold" style={{ color: "#0A1628" }}>Recent Users</h2>
              <a href="/admin/users" className="text-xs font-semibold" style={{ color: "#2563EB" }}>View All →</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                    {["Name", "Role", "Programme / Dept.", "Status", "Joined"].map((col) => (
                      <th key={col} className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-widest" style={{ color: "#94A3B8" }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors" style={{ borderBottom: "1px solid #F8FAFC" }}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: u.role === "Lecturer" ? "#7C3AED" : "#2563EB" }}
                          >
                            {u.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                          </div>
                          <div>
                            <p className="font-semibold text-sm" style={{ color: "#0A1628" }}>{u.name}</p>
                            <p className="text-xs" style={{ color: "#94A3B8" }}>{u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={
                          u.role === "Lecturer"
                            ? { background: "#F5F3FF", color: "#7C3AED" }
                            : { background: "#EFF6FF", color: "#2563EB" }
                        }>{u.role}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: "#64748B" }}>{u.programme}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={
                          u.status === "Active"
                            ? { background: "#ECFDF5", color: "#059669" }
                            : { background: "#FEF3C7", color: "#D97706" }
                        }>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: u.status === "Active" ? "#10B981" : "#F59E0B" }} />
                          {u.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: "#94A3B8" }}>{u.joined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Course Directory */}
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#F1F5F9" }}>
              <h2 className="text-sm font-bold" style={{ color: "#0A1628" }}>Course Directory</h2>
              <a href="/admin/courses" className="text-xs font-semibold" style={{ color: "#2563EB" }}>View All →</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                    {["Course", "Faculty", "Students", "Exams", "Status"].map((col) => (
                      <th key={col} className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-widest" style={{ color: "#94A3B8" }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c.code} className="hover:bg-slate-50/60 transition-colors" style={{ borderBottom: "1px solid #F8FAFC" }}>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-sm" style={{ color: "#0A1628" }}>{c.name}</p>
                        <p className="text-xs" style={{ color: "#94A3B8" }}>{c.code}</p>
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: "#64748B" }}>{c.faculty}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: "#0A1628" }}>{c.students}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: "#0A1628" }}>{c.exams}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={
                          c.status === "Active"
                            ? { background: "#ECFDF5", color: "#059669" }
                            : { background: "#F8FAFC", color: "#94A3B8" }
                        }>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.status === "Active" ? "#10B981" : "#CBD5E1" }} />
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right — 1/3 */}
        <div className="space-y-5">

          {/* Integrity Shield */}
          <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0A1628 0%, #0D2045 100%)" }}>
            <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full" style={{ background: "rgba(16,185,129,0.06)" }} />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white">Integrity Shield</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>All systems nominal</p>
              </div>
            </div>
            <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>No integrity violations detected in the last 24 hours.</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-semibold" style={{ color: "#10B981" }}>Live Monitoring Active</span>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#F1F5F9" }}>
              <h3 className="text-sm font-bold" style={{ color: "#0A1628" }}>Notifications</h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#FEF3C7", color: "#D97706" }}>
                {notifications.length}
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: "#F8FAFC" }}>
              {notifications.map((n, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                  <span className="mt-1 w-2 h-2 rounded-full flex-shrink-0" style={{ background: n.type === "warning" ? "#F59E0B" : "#3B82F6" }} />
                  <p className="flex-1 text-xs leading-relaxed" style={{ color: "#64748B" }}>{n.text}</p>
                  <span className="text-[10px] flex-shrink-0" style={{ color: "#CBD5E1" }}>{n.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "#E2E8F0" }}>
            <h3 className="text-sm font-bold mb-4" style={{ color: "#0A1628" }}>Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "Manage Users", href: "/admin/users", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
                { label: "Course Directory", href: "/admin/courses", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
                { label: "View Reports", href: "/admin/reports", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
                { label: "System Settings", href: "/admin/settings", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
              ].map((a) => (
                <a
                  key={a.label}
                  href={a.href}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors hover:bg-slate-50"
                  style={{ borderColor: "#E2E8F0", color: "#0A1628" }}
                >
                  <span style={{ color: "#64748B" }}>{a.icon}</span>
                  {a.label}
                  <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
