"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Settings, X, Clock, RotateCcw, Calendar, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AssessmentWithDetails } from "@/lib/assessment-types"

interface Props {
  assessment: AssessmentWithDetails
}

function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  const dt = new Date(d)
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

export default function EditSettingsModal({ assessment }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [endsAt, setEndsAt] = useState(toDatetimeLocal(new Date(assessment.endsAt)))
  const [durationMinutes, setDurationMinutes] = useState(
    assessment.durationMinutes != null ? String(assessment.durationMinutes) : ""
  )
  const [maxAttempts, setMaxAttempts] = useState(String(assessment.maxAttempts))
  const [passwordProtected, setPasswordProtected] = useState(assessment.passwordProtected)
  const [accessPassword, setAccessPassword] = useState(assessment.accessPassword ?? "")

  function handleOpen() {
    // Reset to current values each time modal opens
    setEndsAt(toDatetimeLocal(new Date(assessment.endsAt)))
    setDurationMinutes(assessment.durationMinutes != null ? String(assessment.durationMinutes) : "")
    setMaxAttempts(String(assessment.maxAttempts))
    setPasswordProtected(assessment.passwordProtected)
    setAccessPassword(assessment.accessPassword ?? "")
    setOpen(true)
  }

  function handleSave() {
    startTransition(async () => {
      const payload: Record<string, unknown> = {
        endsAt,
        maxAttempts: parseInt(maxAttempts) || 1,
        passwordProtected,
        accessPassword: passwordProtected ? accessPassword : null,
      }
      if (durationMinutes.trim()) {
        payload.durationMinutes = parseInt(durationMinutes)
      } else {
        payload.durationMinutes = null
      }

      const res = await fetch(`/api/lecturer/assessments/${assessment.id}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error ?? "Failed to save settings")
        return
      }

      toast.success("Assessment settings updated")
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
      >
        <Settings size={12} />
        Edit Settings
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Edit Assessment Settings</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Adjust timing, attempts, and access — questions cannot be changed.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* End date */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                  <Calendar size={12} className="text-slate-400" />
                  Close Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002388]/20 focus:border-[#002388]"
                />
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                  <Clock size={12} className="text-slate-400" />
                  Duration (minutes)
                  <span className="text-slate-400 font-normal">— leave blank for unlimited</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="e.g. 60"
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002388]/20 focus:border-[#002388]"
                />
              </div>

              {/* Max attempts */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                  <RotateCcw size={12} className="text-slate-400" />
                  Max Attempts
                </label>
                <input
                  type="number"
                  min={1}
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002388]/20 focus:border-[#002388]"
                />
                <p className="text-[11px] text-slate-400">
                  Students who already used all their attempts will get additional ones automatically.
                </p>
              </div>

              {/* Password */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={passwordProtected}
                    onChange={(e) => setPasswordProtected(e.target.checked)}
                    className="rounded border-slate-300 text-[#002388] focus:ring-[#002388]/20"
                  />
                  <Lock size={12} className="text-slate-400" />
                  Password Protected
                </label>
                {passwordProtected && (
                  <input
                    type="text"
                    value={accessPassword}
                    onChange={(e) => setAccessPassword(e.target.value)}
                    placeholder="Access password"
                    className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002388]/20 focus:border-[#002388]"
                  />
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
              <button
                onClick={() => setOpen(false)}
                className="h-8 px-4 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="h-8 px-4 rounded-lg bg-[#002388] text-xs text-white hover:bg-[#001a6e] disabled:opacity-50 transition-colors"
              >
                {isPending ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
