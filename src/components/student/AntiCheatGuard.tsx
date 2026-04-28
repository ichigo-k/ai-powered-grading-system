"use client"

import { useEffect, useRef } from "react"
import { logTabSwitch } from "@/lib/assessment-actions"

interface AntiCheatGuardProps {
  isSecured: boolean
  attemptId: number
}

export default function AntiCheatGuard({ isSecured, attemptId }: AntiCheatGuardProps) {
  const devToolsOpen = useRef(false)

  useEffect(() => {
    if (!isSecured) return

    const preventDefault = (e: Event) => e.preventDefault()
    document.addEventListener("copy", preventDefault)
    document.addEventListener("cut", preventDefault)
    document.addEventListener("paste", preventDefault)
    document.addEventListener("contextmenu", preventDefault)

    const handleKeyDown = (e: KeyboardEvent) => {
      const { key, ctrlKey, shiftKey } = e
      if (
        key === "F12" ||
        (ctrlKey && shiftKey && key === "I") ||
        (ctrlKey && shiftKey && key === "J") ||
        (ctrlKey && shiftKey && key === "C") ||
        (ctrlKey && key === "u")
      ) {
        e.preventDefault()
      }
    }
    document.addEventListener("keydown", handleKeyDown)

    const handleVisibilityChange = () => {
      logTabSwitch(attemptId, new Date().toISOString())
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)

    const devToolsInterval = setInterval(() => {
      const detected = window.outerWidth - window.innerWidth > 160
      devToolsOpen.current = detected
      const overlay = document.getElementById("anti-cheat-devtools-overlay")
      if (overlay) overlay.style.display = detected ? "flex" : "none"
    }, 1000)

    return () => {
      document.removeEventListener("copy", preventDefault)
      document.removeEventListener("cut", preventDefault)
      document.removeEventListener("paste", preventDefault)
      document.removeEventListener("contextmenu", preventDefault)
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      clearInterval(devToolsInterval)
    }
  }, [isSecured, attemptId])

  if (!isSecured) return null

  return (
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
  )
}
