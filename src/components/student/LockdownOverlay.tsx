"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Maximize2, AlertTriangle } from "lucide-react";
import { MAX_VIOLATIONS, ViolationReason, addViolation, readViolationCount, readLastReason } from "@/lib/violation-tracker";

interface LockdownOverlayProps {
  isSecured: boolean;
  onSubmit: (reason: ViolationReason) => void;
  attemptId: number;
}

export interface LockdownOverlayHandle {
  submit: () => void;
}

const REASON_LABELS: Record<ViolationReason, string> = {
  FULLSCREEN_EXIT: "exiting fullscreen",
  TAB_SWITCH: "switching tabs or leaving the page",
};

const LockdownOverlay = forwardRef<LockdownOverlayHandle, LockdownOverlayProps>(
  function LockdownOverlay({ isSecured, onSubmit, attemptId }, ref) {
    const [violationCount, setViolationCount] = useState<number>(() =>
      typeof window !== "undefined" ? readViolationCount(attemptId) : 0
    );
    const [isOutOfFullscreen, setIsOutOfFullscreen] = useState(false);
    const [terminated, setTerminated] = useState(false);
    const [terminationReason, setTerminationReason] = useState<ViolationReason | null>(null);

    const intentionalExitRef = useRef(false);
    const onSubmitRef = useRef(onSubmit);
    onSubmitRef.current = onSubmit;

    // Expose submit handle for intentional submission
    useImperativeHandle(ref, () => ({
      submit() {
        intentionalExitRef.current = true;
        const exit = document.fullscreenElement
          ? document.exitFullscreen()
          : Promise.resolve();
        exit.catch(() => {}).finally(() => onSubmitRef.current("FULLSCREEN_EXIT"));
      },
    }), []);

    // Fullscreen enforcement
    useEffect(() => {
      if (!isSecured) return;

      intentionalExitRef.current = false;

      // Already at limit on mount — terminate immediately
      const existing = readViolationCount(attemptId);
      if (existing >= MAX_VIOLATIONS) {
        setViolationCount(existing);
        setTerminationReason(readLastReason(attemptId));
        setTerminated(true);
        return;
      }

      function enterFullscreen() {
        document.documentElement.requestFullscreen().catch(() => {
          setIsOutOfFullscreen(true);
        });
      }

      function handleFullscreenChange() {
        if (intentionalExitRef.current) return;
        if (!document.fullscreenElement) {
          setIsOutOfFullscreen(true);
          const next = addViolation(attemptId, "FULLSCREEN_EXIT");
          setViolationCount(next);
        } else {
          setIsOutOfFullscreen(false);
        }
      }

      function handleBeforeUnload(e: BeforeUnloadEvent) {
        e.preventDefault();
      }

      enterFullscreen();
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }, [isSecured, attemptId]);

    // Trigger termination when limit is reached
    useEffect(() => {
      if (violationCount >= MAX_VIOLATIONS && !terminated) {
        setTerminationReason(readLastReason(attemptId));
        setTerminated(true);
        setIsOutOfFullscreen(false);
        // Instant submit — no countdown, no pity
        intentionalExitRef.current = true;
        const exit = document.fullscreenElement
          ? document.exitFullscreen()
          : Promise.resolve();
        exit.catch(() => {}).finally(() => onSubmitRef.current(readLastReason(attemptId) ?? "FULLSCREEN_EXIT"));
      }
    }, [violationCount, terminated, attemptId]);

    if (!isSecured) return null;

    // ── Terminated screen ─────────────────────────────────────────────────────
    if (terminated) {
      const reason = terminationReason ?? readLastReason(attemptId);
      return (
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
                {reason ? <> (last: <span className="text-white/80">{REASON_LABELS[reason]}</span>)</> : ""}.
                Your assessment has been automatically submitted.
              </p>
            </div>
            <p className="text-white/40 text-[12px]">Submitting…</p>
          </div>
        </div>
      );
    }

    // ── Out-of-fullscreen warning overlay ─────────────────────────────────────
    if (isOutOfFullscreen) {
      const remaining = MAX_VIOLATIONS - violationCount;
      return (
        <div
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center"
          style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" }}
        >
          <div className="flex flex-col items-center gap-6 text-center px-8 max-w-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
              <Maximize2 size={28} className="text-white" />
            </div>
            <div>
              <p className="text-white text-[18px] font-semibold mb-2">
                Fullscreen required
              </p>
              <p className="text-white/60 text-[14px] leading-relaxed">
                You exited fullscreen. This has been logged.
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
              <p className={`mt-2 text-[13px] font-semibold ${remaining <= 1 ? "text-red-400" : "text-white/50"}`}>
                {remaining} violation{remaining !== 1 ? "s" : ""} remaining before auto-submit
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                document.documentElement.requestFullscreen().then(() => {
                  setIsOutOfFullscreen(false);
                }).catch(() => {
                  // Keep overlay up if browser blocks
                });
              }}
              className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-[14px] font-semibold text-[#111827] hover:bg-white/90 transition-colors"
            >
              <Maximize2 size={16} />
              Return to fullscreen
            </button>
          </div>
        </div>
      );
    }

    return null;
  },
);

export default LockdownOverlay;
