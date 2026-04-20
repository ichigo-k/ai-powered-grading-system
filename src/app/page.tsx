"use client";

import { useState, useActionState } from "react";
import Image from "next/image";
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="h-screen flex overflow-hidden bg-white">

      {/* Left panel — academic image */}
      <div className="hidden lg:block w-[560px] flex-shrink-0 relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=840&q=80"
          alt="Academic setting"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-white">

        {/* Top bar */}
        <header className="flex items-center justify-between px-10 pt-8 pb-0">
          <div className="flex items-center gap-2.5 lg:hidden">
            <Image src="/logos/gctu-logo.png" alt="GCTU" width={30} height={30} className="object-contain" />
            <span className="font-bold text-sm text-[#0A1628]">GCTU</span>
          </div>
          <div className="hidden lg:block" />
          <a href="#" className="text-xs text-[#94A3B8] hover:text-[#0A1628] transition-colors">
            Need help?
          </a>
        </header>

        {/* Form */}
        <main className="flex-1 flex items-center justify-center px-10 py-10">
          <div className="w-full max-w-[360px]">

            {/* Heading */}
            <div className="mb-8">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#2563EB] mb-2">GCTU Academic Portal</p>
              <h1 className="text-[28px] font-bold text-[#0A1628] leading-snug">Welcome back</h1>
              <p className="text-sm text-[#94A3B8] mt-1">Sign in to continue to your dashboard</p>
            </div>

            <form className="space-y-4" action={formAction}>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-[#0A1628] mb-1.5">Username</label>
                <div className="flex rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] overflow-hidden focus-within:border-[#2563EB] focus-within:bg-white transition-all">
                  <input
                    type="text"
                    name="userId"
                    placeholder="Your GCTU email or index number"
                    className="flex-1 bg-transparent text-sm text-[#0A1628] placeholder-[#CBD5E1] px-4 py-3 outline-none min-w-0"
                  />
                  <span className="flex items-center px-3 text-xs font-medium text-[#2563EB] border-l border-[#E2E8F0] bg-[#EFF6FF] whitespace-nowrap">
                    @live.gctu.edu.gh
                  </span>
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#0A1628]">Password</label>
                  <button type="button" className="text-xs text-[#2563EB] hover:underline">Forgot password?</button>
                </div>
                <div className="flex items-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 gap-2 focus-within:border-[#2563EB] focus-within:bg-white transition-all">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    className="flex-1 bg-transparent text-sm text-[#0A1628] placeholder-[#CBD5E1] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#CBD5E1] hover:text-[#64748B] transition-colors"
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Keep logged in */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
                <div
                  onClick={() => setKeepLoggedIn(!keepLoggedIn)}
                  className="w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                  style={{
                    background: keepLoggedIn ? "#0A1628" : "white",
                    borderColor: keepLoggedIn ? "#0A1628" : "#D1D5DB",
                  }}
                >
                  {keepLoggedIn && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2,6 5,9 10,3" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-[#64748B]">Keep me signed in</span>
              </label>
              <input type="hidden" name="keepLoggedIn" value={String(keepLoggedIn)} />

              {/* Error */}
              {state?.error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {state.error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={pending}
                className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-[#0A1628] hover:bg-[#0f2040] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {pending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Signing in…
                  </span>
                ) : "Sign In"}
              </button>
            </form>

            {/* First-time hint */}
            <p className="text-sm text-[#64748B] mt-5 leading-relaxed">
              <span className="font-semibold text-[#0A1628]">First time here?</span> Your username is your GCTU email and your default password is the same. You'll be asked to change it after signing in.
            </p>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[#F1F5F9]" />
              <span className="text-xs text-[#CBD5E1]">or</span>
              <div className="flex-1 h-px bg-[#F1F5F9]" />
            </div>

            {/* Request access */}
            <div className="text-center">
              <p className="text-sm text-[#94A3B8] mb-3">Don't have an account?</p>
              <button
                type="button"
                className="text-sm font-semibold text-[#2563EB] hover:underline"
              >
                Request Access
              </button>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="px-10 py-6 text-center">
          <p className="text-xs text-[#CBD5E1]">
            © 2026 GCTU ICT Directorate ·{" "}
            <a href="#" className="hover:text-[#64748B] transition-colors">Privacy</a>
            {" · "}
            <a href="#" className="hover:text-[#64748B] transition-colors">Terms</a>
            {" · "}
            <a href="#" className="hover:text-[#64748B] transition-colors">IT Support</a>
          </p>
        </footer>

      </div>
    </div>
  );
}
