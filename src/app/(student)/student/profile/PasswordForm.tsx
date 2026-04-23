"use client"

import { useState } from "react"

export default function PasswordForm() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.next !== form.confirm) {
      setStatus("error")
      setMessage("New passwords do not match.")
      return
    }
    if (form.next.length < 8) {
      setStatus("error")
      setMessage("New password must be at least 8 characters.")
      return
    }
    setStatus("loading")
    await new Promise((r) => setTimeout(r, 800))
    setStatus("success")
    setMessage("Password updated successfully.")
    setForm({ current: "", next: "", confirm: "" })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200">

      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-0.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-slate-900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <h2 className="text-sm font-medium text-slate-900">Access Credentials</h2>
        </div>
        <p className="text-xs text-slate-500">Update your password. Current password is required to save any changes.</p>
      </div>

      {/* Body — two columns */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Left col */}
          <div className="space-y-5">
            {/* Warning box */}
            <div className="flex items-start gap-3 rounded-xl p-4 border border-slate-200 bg-slate-50">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-slate-500 flex-shrink-0 mt-0.5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <p className="text-sm text-slate-500">
                You must verify your current password to save <strong className="font-medium text-slate-900">any</strong> changes.
              </p>
            </div>

            {/* Current password */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2 text-slate-500">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                </svg>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={form.current}
                  onChange={(e) => setForm((p) => ({ ...p, current: e.target.value }))}
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-900 outline-none transition-all focus:border-[#002388] focus:ring-1 focus:ring-[#002388]"
                />
              </div>
            </div>
          </div>

          {/* Right col */}
          <div className="space-y-5">
            {/* New password */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2 text-slate-500">
                New Password
              </label>
              <input
                type="password"
                placeholder="Leave blank to keep unchanged"
                value={form.next}
                onChange={(e) => setForm((p) => ({ ...p, next: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-900 outline-none transition-all focus:border-[#002388] focus:ring-1 focus:ring-[#002388]"
              />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2 text-slate-500">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Repeat new password"
                value={form.confirm}
                onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-900 outline-none transition-all focus:border-[#002388] focus:ring-1 focus:ring-[#002388]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
          {status !== "idle" ? (
            <p
              className={`text-xs font-medium px-3 py-1.5 rounded-lg ${
                status === "success" ? "bg-emerald-50 text-emerald-600" :
                status === "error" ? "bg-red-50 text-red-600" :
                "bg-blue-50 text-blue-600"
              }`}
            >
              {status === "loading" ? "Updating password..." : message}
            </p>
          ) : <span />}

          <button
            type="submit"
            disabled={status === "loading"}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all bg-[#002388] hover:bg-[#0B4DBB] disabled:opacity-60"
          >
            {status === "loading" ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}
