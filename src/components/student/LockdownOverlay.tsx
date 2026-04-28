"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

interface LockdownOverlayProps {
  isSecured: boolean;
  onSubmit: () => void;
}

export interface LockdownOverlayHandle {
  submit: () => void;
}

const LockdownOverlay = forwardRef<LockdownOverlayHandle, LockdownOverlayProps>(
  function LockdownOverlay({ isSecured, onSubmit }, ref) {
    const [showWarning, setShowWarning] = useState(false);
    const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intentionalExitRef = useRef(false);
    const onSubmitRef = useRef(onSubmit);
    onSubmitRef.current = onSubmit;

    useImperativeHandle(ref, () => ({
      submit() {
        intentionalExitRef.current = true;
        const exit = document.fullscreenElement ? document.exitFullscreen() : Promise.resolve();
        exit.catch(() => {}).finally(() => onSubmitRef.current());
      },
    }), []);

    useEffect(() => {
      if (!isSecured) return;

      intentionalExitRef.current = false;

      const clearWarningTimer = () => {
        if (warningTimerRef.current !== null) {
          clearTimeout(warningTimerRef.current);
          warningTimerRef.current = null;
        }
      };

      const dismissWarningAfterDelay = () => {
        clearWarningTimer();
        warningTimerRef.current = setTimeout(() => setShowWarning(false), 5000);
      };

      const requestFullscreen = () => {
        document.documentElement.requestFullscreen().catch(() => {
          setShowWarning(true);
          dismissWarningAfterDelay();
        });
      };

      const handleFullscreenChange = () => {
        if (intentionalExitRef.current) return;
        if (!document.fullscreenElement) {
          setShowWarning(true);
          dismissWarningAfterDelay();
          requestFullscreen();
        } else {
          setShowWarning(false);
          clearWarningTimer();
        }
      };

      const handleBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); };

      requestFullscreen();
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
        window.removeEventListener("beforeunload", handleBeforeUnload);
        clearWarningTimer();
      };
    }, [isSecured]);

    if (!isSecured) return null;

    return (
      <>
        {showWarning && (
          <div
            role="alert"
            aria-live="assertive"
            className="fixed top-0 left-0 right-0 z-[10000] bg-[#dc2626] text-white px-4 py-2.5 text-center text-[13px] font-medium"
          >
            You exited fullscreen — please stay in fullscreen mode during the assessment.
          </div>
        )}
      </>
    );
  },
);

export default LockdownOverlay;
