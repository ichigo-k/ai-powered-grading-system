// Shared violation tracker — all anti-cheat events (fullscreen exits, tab switches)
// count toward the same limit. Stored in sessionStorage so reloads don't reset it.

export const MAX_VIOLATIONS = 4

export type ViolationReason = "FULLSCREEN_EXIT" | "TAB_SWITCH"

const VIOLATIONS_KEY = (attemptId: number) => `violations_${attemptId}`
const LAST_REASON_KEY = (attemptId: number) => `violation_reason_${attemptId}`

export function readViolationCount(attemptId: number): number {
  try {
    return parseInt(sessionStorage.getItem(VIOLATIONS_KEY(attemptId)) ?? "0", 10) || 0
  } catch {
    return 0
  }
}

export function addViolation(attemptId: number, reason: ViolationReason): number {
  try {
    const next = readViolationCount(attemptId) + 1
    sessionStorage.setItem(VIOLATIONS_KEY(attemptId), String(next))
    sessionStorage.setItem(LAST_REASON_KEY(attemptId), reason)
    return next
  } catch {
    return 0
  }
}

export function readLastReason(attemptId: number): ViolationReason | null {
  try {
    return (sessionStorage.getItem(LAST_REASON_KEY(attemptId)) as ViolationReason) ?? null
  } catch {
    return null
  }
}
