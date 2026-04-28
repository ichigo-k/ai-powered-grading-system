"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { createPortal } from "react-dom"
import {
  Lock,
  PlayCircle,
  RotateCcw,
  ShieldCheck,
  Monitor,
  EyeOff,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react"
import { createOrResumeAttempt } from "@/lib/assessment-actions"
import { MAX_VIOLATIONS } from "@/lib/violation-tracker"
import PasswordGateModal from "@/components/student/PasswordGateModal"

interface AssessmentEntryClientProps {
  assessmentId: number
  passwordProtected: boolean
  isLocked: boolean
  activeAttemptId: number | null
  assessmentType: string
  durationMinutes: number | null
  startsAt: string
  endsAt: string
}

// ─── Rules modal ─────────────────────────────────────────────────────────────

interface RulesModalProps {
  assessmentType: string
  durationMinutes: number | null
  onAccept: () => void
  onCancel: () => void
}

function RulesModal({ assessmentType, durationMinutes, onAccept, onCancel }: RulesModalProps) {
  const [accepted, setAccepted] = useState(false)
  const isSecured = assessmentType === "EXAM" || assessmentType === "QUIZ"

  const redRules = [
    ...(isSecured
      ? [
          { icon: Monitor, title: "Fullscreen required", desc: `Exiting fullscreen is logged. ${MAX_VIOLATIONS} violations will auto-submit your attempt.` },
          { icon: EyeOff, title: "No tab switching", desc: `Switching tabs or windows is logged. ${MAX_VIOLATIONS} total violations across any infraction will auto-submit your attempt.` },
        ]
      : []),
    ...(durationMinutes ? [{ icon: Clock, title: `${durationMinutes}-minute time limit`, desc: "The assessment auto-submits when the timer reaches zero." }] : []),
    { icon: AlertTriangle, title: "No going back", desc: "Once submitted, you cannot change your answers." },
  ]

  const neutralRules = [
    ...(isSecured ? [{ icon: ShieldCheck, title: "Copy & paste disabled", desc: "Copying, pasting, and right-clicking are disabled during the assessment." }] : []),
    { icon: CheckCircle2, title: "Auto-save enabled", desc: "Your answers are saved automatically as you type." },
  ]

  return (
    typeof window !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4">
            <div className="relative w-full max-w-md rounded-lg bg-white border border-[#e5e7eb] shadow-2xl overflow-hidden">

              {/* Header */}
              <div className="px-6 py-4 border-b border-[#e5e7eb] flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#f3f4f6]">
                    <ShieldCheck size={16} className="text-[#111827]" />
                  </div>
                  <div>
                    <h2 className="text-[14px] font-semibold text-[#111827]">Before you begin</h2>
                    <p className="text-[11px] text-[#9ca3af] mt-0.5">Read carefully before starting</p>
                  </div>
                </div>
                <button type="button" onClick={onCancel}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[#9ca3af] hover:text-[#374151] hover:bg-[#f3f4f6] transition-colors" aria-label="Close">
                  <X size={14} />
                </button>
              </div>

              <div className="px-6 py-4 space-y-4 max-h-[52vh] overflow-y-auto">

                {/* ── Critical rules (red) ── */}
                {redRules.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#dc2626] mb-2">Important</p>
                    <div className="border border-[#fecaca] rounded-md overflow-hidden divide-y divide-[#fecaca]">
                      {redRules.map((rule, i) => (
                        <div key={i} className="flex items-start gap-3 px-3.5 py-3 bg-white">
                          <rule.icon size={14} className="mt-0.5 shrink-0 text-[#dc2626]" />
                          <div>
                            <p className="text-[12px] font-semibold text-[#dc2626]">{rule.title}</p>
                            <p className="text-[11px] text-[#6b7280] mt-0.5 leading-relaxed">{rule.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Neutral rules ── */}
                {neutralRules.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-2">General</p>
                    <div className="border border-[#e5e7eb] rounded-md overflow-hidden divide-y divide-[#e5e7eb]">
                      {neutralRules.map((rule, i) => (
                        <div key={i} className="flex items-start gap-3 px-3.5 py-3 bg-white">
                          <rule.icon size={14} className="mt-0.5 shrink-0 text-[#9ca3af]" />
                          <div>
                            <p className="text-[12px] font-semibold text-[#374151]">{rule.title}</p>
                            <p className="text-[11px] text-[#6b7280] mt-0.5 leading-relaxed">{rule.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-[#e5e7eb] px-6 py-4 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="mt-0.5 shrink-0">
                    <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="sr-only" />
                    <div className={`rounded border-2 flex items-center justify-center transition-colors ${
                      accepted ? "border-[#002388] bg-[#002388]" : "border-[#d1d5db] bg-white group-hover:border-[#002388]"
                    }`} style={{ height: "17px", width: "17px" }}>
                      {accepted && <CheckCircle2 size={10} className="text-white" />}
                    </div>
                  </div>
                  <span className="text-[12px] text-[#374151] leading-relaxed">
                    I have read and understood the rules. I agree to take this assessment honestly.
                  </span>
                </label>

                <button type="button" onClick={onAccept} disabled={!accepted}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[#002388] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#0B4DBB] disabled:opacity-30 disabled:cursor-not-allowed">
                  <PlayCircle size={14} />
                  Start Assessment
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AssessmentEntryClient({
  assessmentId,
  passwordProtected,
  isLocked,
  activeAttemptId,
  assessmentType,
  durationMinutes,
  startsAt,
  endsAt,
}: AssessmentEntryClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showRules, setShowRules] = useState(false)
  const [showPasswordGate, setShowPasswordGate] = useState(false)

  // Locked: max attempts exhausted
  if (isLocked) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3.5 text-[#374151]">
        <Lock size={16} className="shrink-0 text-[#9ca3af]" />
        <div>
          <p className="text-[13px] font-medium text-[#374151]">Maximum attempts reached</p>
          <p className="text-xs text-[#6b7280] mt-0.5">You have used all available attempts for this assessment.</p>
        </div>
      </div>
    )
  }

  // Active in-progress attempt — show resume button
  if (activeAttemptId !== null) {
    return (
      <a
        href={`/student/assessments/${assessmentId}/attempt?attemptId=${activeAttemptId}`}
        className="inline-flex items-center gap-2 rounded-lg bg-[#002388] px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-[#0B4DBB] transition-colors"
      >
        <RotateCcw size={14} />
        Resume Attempt
      </a>
    )
  }

  function startAttempt() {
    setError(null)
    startTransition(async () => {
      const result = await createOrResumeAttempt(assessmentId)
      if ("error" in result) {
        const messages: Record<string, string> = {
          MAX_ATTEMPTS_REACHED: "You have used all available attempts.",
          NOT_STARTED: "This assessment has not started yet.",
          ENDED: "This assessment has already closed.",
          NOT_AVAILABLE: "This assessment is not currently available.",
          UNAUTHORIZED: "You are not authorised to take this assessment.",
        }
        setError(messages[result.error] ?? "Failed to start assessment. Please try again.")
        return
      }
      router.push(`/student/assessments/${assessmentId}/attempt?attemptId=${result.attemptId}`)
    })
  }

  function handleRulesAccept() {
    setShowRules(false)
    if (passwordProtected) {
      setShowPasswordGate(true)
    } else {
      startAttempt()
    }
  }

  // Password gate after rules accepted
  if (showPasswordGate) {
    return (
      <PasswordGateModal
        assessmentId={assessmentId}
        passwordProtected={true}
        onSuccess={(attemptId) => {
          router.push(`/student/assessments/${assessmentId}/attempt?attemptId=${attemptId}`)
        }}
      />
    )
  }

  return (
    <>
      {showRules && (
        <RulesModal
          assessmentType={assessmentType}
          durationMinutes={durationMinutes}
          onAccept={handleRulesAccept}
          onCancel={() => setShowRules(false)}
        />
      )}

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => setShowRules(true)}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-[#002388] px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-[#0B4DBB] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <PlayCircle size={15} />
          {isPending ? "Starting…" : "Start Assessment"}
        </button>
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3.5 py-2.5">
            <AlertTriangle size={13} className="shrink-0 text-[#dc2626]" />
            <p className="text-[13px] text-[#991b1b]">{error}</p>
          </div>
        )}
      </div>
    </>
  )
}
