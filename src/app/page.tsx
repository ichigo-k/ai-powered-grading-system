"use client";

import { useState, useActionState } from "react";
import Image from "next/image";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { HelpCircle, Mail, Lock, LogIn, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="h-screen flex overflow-hidden bg-white">

      {/* Left panel — academic image */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-shrink-0 relative overflow-hidden">
        <Image
          src="/assests/login-image.jpg"
          alt="Academic setting"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.65) 100%)" }} />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-white">

        {/* Top bar */}
        <header className="flex items-center justify-between px-12 pt-10">
          <div className="hidden lg:block" />
          <a
            href="#"
            className="flex items-center gap-2 text-sm font-bold transition-all hover:opacity-70 active:scale-95 px-4 py-2 rounded-lg"
            style={{ color: "#64748B", background: "#F8FAFC" }}
          >
            <HelpCircle size={16} />
            Need help?
          </a>
        </header>

        {/* Form */}
        <main className="flex-1 flex items-center justify-center px-10 py-10">
          <div className="w-full max-w-[420px] space-y-10">

            {/* Heading */}
            <div className="flex flex-col items-center text-center space-y-3">
              <Image src="/logos/gctu-logo.png" alt="GCTU" width={120} height={120} className="object-contain mb-2" />
              <h1 className="text-[32px] font-extrabold tracking-tight" style={{ color: "#002388" }}>
                Welcome Back
              </h1>
              <p className="text-sm font-medium" style={{ color: "#64748B" }}>
                Log in to GCTU Exam Portal
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6" action={formAction}>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="userId" className="text-xs font-bold uppercase tracking-wider ml-1" style={{ color: "#64748B" }}>Email</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#002388] transition-colors z-10">
                    <Mail size={18} />
                  </div>
                  <Input
                    id="userId"
                    type="text"
                    name="userId"
                    placeholder="e.g. 4211230210"
                    className="w-full h-12 rounded-lg border-[#E2E8F0] bg-white pl-12 pr-[140px] text-sm font-medium transition-all focus:border-[#002388] focus:ring-4 focus:ring-[#002388]/5 placeholder:text-[#94A3B8] [&:-webkit-autofill]:shadow-[0_0_0px_1000px_white_inset]"
                    style={{ color: "#002388" }}
                  />
                  <div 
                    className="absolute right-4 top-0 h-full flex items-center text-xs font-bold whitespace-nowrap z-10 pointer-events-none"
                    style={{ color: "#0055A4" }}
                  >
                    @live.gctu.edu.gh
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider" style={{ color: "#64748B" }}>Password</Label>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none group-focus-within:text-[#002388] transition-colors">
                    <Lock size={18} />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    className="w-full h-12 rounded-lg border-[#E2E8F0] bg-white pl-12 pr-12 text-sm font-medium transition-all focus:border-[#002388] focus:ring-4 focus:ring-[#002388]/5 placeholder:text-[#94A3B8] [&:-webkit-autofill]:shadow-[0_0_0px_1000px_white_inset]"
                    style={{ color: "#002388" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ color: "#94A3B8" }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Keep logged in */}
              <div className="flex items-center gap-3 px-1">
                <Checkbox
                  id="keepLoggedIn"
                  checked={keepLoggedIn}
                  onCheckedChange={(v) => setKeepLoggedIn(!!v)}
                  className="rounded-md border-[#E2E8F0] data-[state=checked]:bg-[#002388] data-[state=checked]:border-[#002388]"
                />
                <Label htmlFor="keepLoggedIn" className="text-sm font-semibold cursor-pointer select-none" style={{ color: "#64748B" }}>
                  Remember me
                </Label>
              </div>
              <input type="hidden" name="keepLoggedIn" value={String(keepLoggedIn)} />

              {/* Error */}
              {state?.error && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm border animate-in fade-in slide-in-from-top-2 duration-300" style={{ background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" }}>
                  <AlertCircle size={18} className="shrink-0" />
                  <span className="font-semibold">{state.error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={pending}
                className="w-full h-12 rounded-lg text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                style={{ background: "#002388" }}
              >
                {pending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Log In
                    <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px" style={{ background: "#F1F5F9" }} />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 font-bold tracking-widest" style={{ color: "#94A3B8" }}>OR</span>
              </div>
            </div>

            {/* Request access */}
            <div className="text-center space-y-4">
              <button
                type="button"
                className="w-full h-12 rounded-lg text-sm font-bold border-2 transition-all hover:bg-gray-50 active:scale-[0.99]"
                style={{ borderColor: "#F1F5F9", color: "#002388" }}
              >
                Request Access
              </button>
              <p className="text-xs font-medium leading-relaxed px-4" style={{ color: "#94A3B8" }}>
                Forgot your password? <a href="#" className="underline font-bold" style={{ color: "#0055A4" }}>Contact ICT Support</a> for assistance.
              </p>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="px-10 py-8 text-center pt-0 mt-auto">
          <p className="text-xs font-medium" style={{ color: "#94A3B8" }}>
            © 2026 GCTU ICT Directorate ·{" "}
            <a href="#" className="hover:underline" style={{ color: "#0055A4" }}>Privacy</a>
            {" · "}
            <a href="#" className="hover:underline" style={{ color: "#0055A4" }}>Terms</a>
            {" · "}
            <a href="#" className="hover:underline" style={{ color: "#0055A4" }}>IT Support</a>
          </p>
        </footer>

      </div>
    </div>
  );
}
