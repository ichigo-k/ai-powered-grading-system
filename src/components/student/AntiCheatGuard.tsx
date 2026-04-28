"use client"

import { useEffect, useRef, useState } from "react"
import { logTabSwitch } from "@/lib/assessment-actions"
import { EyeOff, AlertTriangle } from "lucide-react"
import { MAX_VIOLATIONS, ViolationReason, addViolation, readViolationCount, readLastReason } from "@/lib/violation-tracker"

interface AntiCheatGuardProps {
  isSecured: boolean
  attemptId: number
  onSubmit: (reason: ViolationReason) => void
}

const REASON_LABELS: Record<ViolationReason, string> = {
  FULLSCREEN_EXIT: "exiting fullscreen",
  TAB_SWITCH: "switching tabs or leaving the page",
}

export default function AntiCheatGuard({ isSecured, attemptId, onSubmit }: AntiCheatGuardProps) {
  const [violationCount, setViolationCount] = useState<number>(() =>
    typeof window !== "undefined" ? readViolationCount(attemptId) : 0
  )
  const [showWarning, setShowWarning] = useState(false)
  const [terminated, setTerminated] = useState(false)
  const [terminationReason, setTerminationReason] = useState<ViolationReason | null>(null)

  const onSubmitRef = useRef(onSubmit)
  onSubmitRef.current = onSubmit

  // Block copy/paste/devtools shortcuts
  useEffect(() => {
    if (!isSecured) return

    const preventDefault = (e: Event) => e.preventDefault()
    document.addEventListener("copy", preventDefault)
    document.addEventListener("cut", preventDefault)
    document.addEventListener("paste", preventDefault)
    document.addEventListener("contextmenu", preventDefault)

    const handleKeyDown = (e: KeyboardEvent) => {
      const { key, ctrlKey, shiftKey, metaKey, altKey } = e

      // Block any Ctrl+Shift or Meta+Shift combo — covers screenshots,
      // devtools, source view, and OS-level capture shortcuts
      if ((ctrlKey && shiftKey) || (metaKey && shiftKey)) {
        e.preventDefault()
        return
      }

      // Block individual high-risk keys
      if (
        key === "F12" ||
        key === "PrintScreen" ||
        key === "F5" ||                        // refresh
        (ctrlKey && key === "u") ||            // view source
        (ctrlKey && key === "p") ||            // print
        (ctrlKey && key === "s") ||            // save page
        (altKey && key === "PrintScreen") ||   // window screenshot (Windows)
        (metaKey && key === "3") ||            // macOS area screenshot
        (metaKey && key === "4") ||            // macOS selection screenshot
        (metaKey && key === "5") ||            // macOS screenshot toolbar
        (metaKey && key === "6")               // macOS screen recording
      ) {
        e.preventDefault()
      }
    }
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("copy", preventDefault)
      document.removeEventListener("cut", preventDefault)
      document.removeEventListener("paste", preventDefault)
      document.removeEventListener("contextmenu", preventDefault)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isSecured])

  // Tab switch detection
  useEffect(() => {
    if (!isSecured) return

    // Already at limit on mount — terminate immediately
    const existing = readViolationCount(attemptId)
    if (existing >= MAX_VIOLATIONS) {
      setViolationCount(existing)
      setTerminationReason(readLastReason(attemptId))
      setTerminated(true)
      return
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        logTabSwitch(attemptId, new Date().toISOString())
        const next = addViolation(attemptId, "TAB_SWITCH")
        setViolationCount(next)
        setShowWarning(true)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [isSecured, attemptId])

  // Trigger termination when limit is reached
  useEffect(() => {
    if (violationCount >= MAX_VIOLATIONS && !terminated) {
      const reason = readLastReason(attemptId) ?? "TAB_SWITCH"
      setTerminationReason(reason)
      setTerminated(true)
      setShowWarning(false)
      // Instant submit — no countdown, no pity
      onSubmitRef.current(reason)
    }
  }, [violationCount, terminated, attemptId])

  // Devtools detection overlay
  useEffect(() => {
    if (!isSecured) return

    const devToolsInterval = setInterval(() => {
      const detected = window.outerWidth - window.innerWidth > 160
      const overlay = document.getElementById("anti-cheat-devtools-overlay")
      if (overlay) overlay.style.display = detected ? "flex" : "none"
    }, 1000)

    return () => clearInterval(devToolsInterval)
  }, [isSecured])

  if (!isSecured) return null

  return (
    <>
      {/* Devtools overlay */}
      <div
        id="anti-cheat-devtools-overlay"
        style={{
          display: "none",
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          backgroundColor: "rgba(0,0,0,0.85)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ background: "#fff", borderRadius: 8, padding: "2rem 3rem", textAlign: "center", maxWidth: 480 }}>
          <p style={{ fontSize: "1.125rem", fontWeight: 600, color: "#b91c1c" }}>
            Developer tools detected. Please close them to continue.
          </p>
        </div>
      </div>

      {/* Terminated screen */}
      {terminated && (
        <div
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center"
          style={{ background: "rgba(0,0,0,0.96)", backdropFilter: "blur(8px)" }}
        >
          <div className="flex flex-col items-center gap-6 text-center px-8 max-w-md">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
              <AlertTriangle size={30} className="text-red-400" />
            </div>
            <div>
              <p className="text-white text-[20px] font-semibold mb-2">
                Assessment terminated
              </p>
              <p className="text-white/60 text-[14px] leading-relaxed">
                You accumulated {MAX_VIOLATIONS} violations
                {terminationReason ? <> (last: <span className="text-white/80">{REASON_LABELS[terminationReason]}</span>)</> : ""}.
                Your assessment has been automatically submitted.
              </p>
            </div>
            <p className="text-white/40 text-[12px]">Submitting…</p>
          </div>
        </div>
      )}

      {/* Tab switch warning overlay */}
      {showWarning && !terminated && (
        <div
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center"
          style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" }}
        >
          <div className="flex flex-col items-center gap-6 text-center px-8 max-w-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
              <EyeOff size={28} className="text-white" />
            </div>
            <div>
              <p className="text-white text-[18px] font-semibold mb-2">
                Tab switch detected
              </p>
              <p className="text-white/60 text-[14px] leading-relaxed">
                You left the exam page. This has been logged.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                {Array.from({ length: MAX_VIOLATIONS }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2.5 w-2.5 rounded-full transition-colors ${
                      i < violationCount ? "bg-red-400" : "bg-white/20"
                    }`}
                  />
                ))}
              </div>
              <p className={`mt-2 text-[13px] font-semibold ${MAX_VIOLATIONS - violationCount <= 1 ? "text-red-400" : "text-white/50"}`}>
                {MAX_VIOLATIONS - violationCount} violation{MAX_VIOLATIONS - violationCount !== 1 ? "s" : ""} remaining before auto-submit
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowWarning(false)}
              className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-[14px] font-semibold text-[#111827] hover:bg-white/90 transition-colors"
            >
              <EyeOff size={16} />
              Return to exam
            </button>
          </div>
        </div>
      )}
    </>
  )
}
