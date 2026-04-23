"use client";

import { useState, useActionState } from "react";
import Image from "next/image";
import { loginAction } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { HelpCircle, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="h-screen flex overflow-hidden bg-white">

      {/* Left panel — academic image */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 flex-shrink-0 relative overflow-hidden bg-slate-100">
        <Image
          src="/assests/login-image.jpg"
          alt="Academic setting"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-slate-950/30" />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col overflow-y-auto">

        {/* Top bar */}
        <header className="flex items-center justify-end px-8 pt-8">
          <a
            href="#"
            className="flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-xl"
          >
            <HelpCircle size={16} />
            Need help?
          </a>
        </header>

        {/* Form */}
        <main className="flex-1 flex items-center justify-center px-6 py-10 lg:px-12">
          <div className="w-full max-w-[440px]">
            
            {/* Form Container */}
            <div className="w-full">
              
              {/* Heading */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="mb-6">
                  <Image src="/logos/gctu-logo.png" alt="GCTU" width={80} height={80} className="object-contain" />
                </div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                  Welcome Back
                </h1>
                <p className="text-sm text-slate-500 mt-2">
                  Log in to your GCTU Exam Portal
                </p>
              </div>

              <form className="space-y-6" action={formAction}>
                
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="userId" className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Email</Label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#002388] transition-colors z-10">
                      <Mail size={18} />
                    </div>
                    <Input
                      id="userId"
                      type="text"
                      name="userId"
                      placeholder="e.g. 4211230210"
                      className="w-full h-12 rounded-xl border-slate-200 bg-slate-50/50 pl-11 pr-[140px] text-sm transition-all focus:bg-white focus:border-[#002388] focus:ring-2 focus:ring-[#002388]/20 placeholder:text-slate-400"
                    />
                    <div className="absolute right-4 top-0 h-full flex items-center text-xs font-medium text-slate-500 z-10 pointer-events-none">
                      @live.gctu.edu.gh
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Password</Label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#002388] transition-colors pointer-events-none">
                      <Lock size={18} />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      className="w-full h-12 rounded-xl border-slate-200 bg-slate-50/50 pl-11 pr-11 text-sm transition-all focus:bg-white focus:border-[#002388] focus:ring-2 focus:ring-[#002388]/20 placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2.5">
                    <Checkbox
                      id="keepLoggedIn"
                      checked={keepLoggedIn}
                      onCheckedChange={(v) => setKeepLoggedIn(!!v)}
                      className="rounded-md border-slate-300 data-[state=checked]:bg-[#002388] data-[state=checked]:border-[#002388]"
                    />
                    <Label htmlFor="keepLoggedIn" className="text-sm text-slate-600 cursor-pointer select-none font-medium">
                      Remember me
                    </Label>
                  </div>
                  <a href="#" className="text-sm font-medium text-[#002388] hover:text-[#0B4DBB] transition-colors">
                    Forgot password?
                  </a>
                </div>
                <input type="hidden" name="keepLoggedIn" value={String(keepLoggedIn)} />

                {/* Error */}
                {state?.error && (
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span className="font-medium leading-tight">{state.error}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={pending}
                  className="w-full h-12 mt-2 rounded-xl text-sm font-semibold text-white transition-all hover:bg-[#0B4DBB] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none group/btn bg-[#002388] flex items-center justify-center gap-2"
                >
                  {pending ? (
                    <>
                      <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

            </div>

            {/* Footer */}
            <p className="text-center text-xs text-slate-400 mt-10 font-medium">
              © {new Date().getFullYear()} GCTU ICT Directorate<br />
              <span className="inline-flex gap-3 mt-2">
                <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
                <span>&middot;</span>
                <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
                <span>&middot;</span>
                <a href="#" className="hover:text-slate-600 transition-colors">Support</a>
              </span>
            </p>

          </div>
        </main>
      </div>
    </div>
  );
}
