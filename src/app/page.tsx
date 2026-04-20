"use client";

import { useState, useActionState } from "react";
import Image from "next/image";
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8F9FA" }}>
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Image
            src="/logos/gctu-logo.png"
            alt="GCTU Logo"
            width={48}
            height={48}
            className="rounded"
          />
          <span className="font-semibold text-sm" style={{ color: "#003366" }}>
            GCTU
          </span>
        </div>
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border"
          style={{ borderColor: "#003366", color: "#003366" }}
          title="Help"
        >
          ?
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-10">
          {/* Crest */}
          <div className="flex flex-col items-center mb-6">
            <h1 className="text-2xl font-bold" style={{ color: "#003366" }}>
              Welcome Back
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Please sign in to access your dashboard
            </p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-5" action={formAction}>
            {/* Student/Staff ID */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#003366" }}>
                Student / Staff ID
              </label>
              <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 focus-within:border-[#0055A4] focus-within:bg-white transition-colors overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2.5 flex-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    name="userId"
                    placeholder="e.g. 4211202010"
                    className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400 min-w-0"
                  />
                </div>
                <div
                  className="px-3 py-2.5 text-sm border-l border-gray-200 shrink-0 select-none"
                  style={{ backgroundColor: "#f0f4f8", color: "#0055A4" }}
                >
                  @live.gctu.edu.gh
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#003366" }}>
                  Password
                </label>
                <button type="button" className="text-xs font-medium" style={{ color: "#0055A4" }}>
                  Forgot Password?
                </button>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 bg-gray-50 focus-within:border-[#0055A4] focus-within:bg-white transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
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

            {/* Keep me logged in */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setKeepLoggedIn(!keepLoggedIn)}
                className="w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer"
                style={{
                  backgroundColor: keepLoggedIn ? "#003366" : "white",
                  borderColor: keepLoggedIn ? "#003366" : "#d1d5db",
                }}
              >
                {keepLoggedIn && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2,6 5,9 10,3" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-600">Keep me logged in</span>
            </label>
            <input type="hidden" name="keepLoggedIn" value={String(keepLoggedIn)} />

            {/* Error message */}
            {state?.error && (
              <p className="text-sm text-red-600" aria-live="polite">
                {state.error}
              </p>
            )}

            {/* Sign in button */}
            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#003366" }}
            >
              {pending ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Request access */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">New to the Academic Portal?</p>
            <button
              type="button"
              className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-lg border text-sm font-medium transition-colors hover:bg-gray-50"
              style={{ borderColor: "#003366", color: "#003366" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              Request Access
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 px-4">
        <p className="text-xs text-gray-400 mb-1">
          Secure login powered by the GCTU ICT Directorate.
        </p>
        <p className="text-xs text-gray-400 mb-4">
          Ensure you are on the official{" "}
          <span className="font-medium" style={{ color: "#0055A4" }}>
            portal.gctu.edu.gh
          </span>{" "}
          domain.
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
          <span>© 2024 Ghana Communication Technology University. All rights reserved.</span>
          <span>·</span>
          <a href="#" className="hover:underline" style={{ color: "#0055A4" }}>Privacy Policy</a>
          <span>·</span>
          <a href="#" className="hover:underline" style={{ color: "#0055A4" }}>Terms of Service</a>
          <span>·</span>
          <a href="#" className="hover:underline" style={{ color: "#0055A4" }}>IT Support</a>
        </div>
      </footer>
    </div>
  );
}
