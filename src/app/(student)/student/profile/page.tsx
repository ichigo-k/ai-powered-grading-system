import { getSession } from "@/lib/session"
import PasswordForm from "./PasswordForm"

export default async function ProfilePage() {
  const session = await getSession()
  const user = session?.user

  const academicInfo = [
    { label: "Student ID", value: user?.email?.split("@")[0] ?? "—" },
    { label: "Full Name", value: user?.name ?? "—" },
    { label: "Programme", value: "BSc. Computer Science" },
    { label: "Level", value: "300" },
    { label: "Class", value: "CS3A" },
    { label: "Academic Year", value: "2025 / 2026" },
    { label: "Semester", value: "First Semester" },
    { label: "Email", value: "student@gctu.edu.gh" },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My Profile</h1>
        <p className="text-sm mt-0.5 text-slate-500">View your academic information and manage your password</p>
      </div>

      {/* Academic info card */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-0.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-slate-900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <h2 className="text-sm font-medium text-slate-900">Personal Information</h2>
            <span className="ml-auto text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
              Read only
            </span>
          </div>
          <p className="text-xs text-slate-500">Your academic details as registered with GCTU. Contact the registry to make changes.</p>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-0">
          {academicInfo.map((item, i) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-3.5"
              style={{ borderBottom: i < academicInfo.length - 2 || (academicInfo.length % 2 !== 0 && i === academicInfo.length - 1) ? "1px solid #F1F5F9" : "none" }}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{item.label}</span>
              <span className="text-sm font-medium text-slate-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Password form */}
      <PasswordForm />

    </div>
  )
}
