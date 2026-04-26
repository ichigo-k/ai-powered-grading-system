"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Step1State, LecturerCourse } from "@/lib/assessment-types"
import { CalendarClock, Clock } from "lucide-react"

function formatDateTimeNice(value: string) {
  if (!value) return null
  const d = new Date(value)
  if (isNaN(d.getTime())) return null
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

function getWindowSummary(start: string, end: string): string | null {
  if (!start || !end) return null
  const s = new Date(start)
  const e = new Date(end)
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e <= s) return null

  const diffMs = e.getTime() - s.getTime()
  const diffMins = Math.round(diffMs / 60000)
  const diffHours = diffMins / 60
  const diffDays = diffHours / 24
  const diffWeeks = diffDays / 7

  let duration: string
  if (diffMins < 60) {
    duration = `${diffMins} minute${diffMins !== 1 ? "s" : ""}`
  } else if (diffHours < 24) {
    const h = Math.floor(diffHours)
    const m = diffMins % 60
    duration = m > 0 ? `${h} hour${h !== 1 ? "s" : ""} and ${m} minute${m !== 1 ? "s" : ""}` : `${h} hour${h !== 1 ? "s" : ""}`
  } else if (diffDays < 14) {
    const d = Math.round(diffDays)
    duration = `${d} day${d !== 1 ? "s" : ""}`
  } else {
    const w = Math.round(diffWeeks)
    duration = `${w} week${w !== 1 ? "s" : ""}`
  }

  return `Students will have ${duration} to complete this assessment`
}

interface Step1BasicsProps {
  state: Step1State
  onChange: (updates: Partial<Step1State>) => void
  lecturerCourses: LecturerCourse[]
  errors: Partial<Record<keyof Step1State, string>>
}

export default function Step1Basics({ state, onChange, lecturerCourses, errors }: Step1BasicsProps) {
  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="flex items-center gap-4 pb-3 border-b border-slate-50">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-50 text-[#002388]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M8 7h6" />
              <path d="M8 11h8" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">General Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">
              Assessment Title <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="title"
              value={state.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="e.g. Midterm Examination"
              className="h-11 rounded-md border-slate-200 bg-white hover:bg-slate-50 focus:bg-white focus:ring-[#002388] transition-all font-medium"
            />
            {errors.title && <p className="text-[10px] font-semibold text-rose-500 ml-1 italic">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">
              Assigned Course <span className="text-rose-500">*</span>
            </Label>
            {lecturerCourses.length === 0 ? (
              <p className="text-xs font-medium text-slate-400 bg-slate-50 rounded-md px-4 h-11 flex items-center border border-slate-200 italic">
                No courses assigned
              </p>
            ) : (
              <Select
                value={state.courseId ? String(state.courseId) : ""}
                onValueChange={(v) => onChange({ courseId: parseInt(v) })}
              >
                <SelectTrigger className="h-11 rounded-md border-slate-200 bg-white hover:bg-slate-50 focus:bg-white focus:ring-[#002388] transition-all font-medium">
                  <SelectValue placeholder="Select course..." />
                </SelectTrigger>
                <SelectContent>
                  {lecturerCourses.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)} className="font-medium">
                      {c.code} — {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.courseId && <p className="text-[10px] font-semibold text-rose-500 ml-1 italic">{errors.courseId}</p>}
          </div>

          <div className="space-y-3 col-span-full pt-1">
            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">
              Assessment Type <span className="text-rose-500">*</span>
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {/* Card 1: Exam */}
               <button
                 type="button"
                 onClick={() => onChange({ type: "EXAM" })}
                 className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                   state.type === "EXAM" 
                     ? "border-[#002388] bg-[#002388]/5 shadow-sm" 
                     : "border-slate-200 bg-white hover:border-[#002388]/40 hover:bg-slate-50"
                 }`}
               >
                 <div className="flex items-center justify-between w-full mb-1">
                   <span className="font-semibold text-slate-900">Exam</span>
                   <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                     state.type === "EXAM" ? "border-[#002388]" : "border-slate-300"
                   }`}>
                     {state.type === "EXAM" && <div className="h-2 w-2 rounded-full bg-[#002388]" />}
                   </div>
                 </div>
                 <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Formal evaluation with strict grading and structured sections.</p>
               </button>

               {/* Card 2: Quiz */}
               <button
                 type="button"
                 onClick={() => onChange({ type: "QUIZ" })}
                 className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                   state.type === "QUIZ" 
                     ? "border-[#002388] bg-[#002388]/5 shadow-sm" 
                     : "border-slate-200 bg-white hover:border-[#002388]/40 hover:bg-slate-50"
                 }`}
               >
                 <div className="flex items-center justify-between w-full mb-1">
                   <span className="font-semibold text-slate-900">Quiz</span>
                   <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                     state.type === "QUIZ" ? "border-[#002388]" : "border-slate-300"
                   }`}>
                     {state.type === "QUIZ" && <div className="h-2 w-2 rounded-full bg-[#002388]" />}
                   </div>
                 </div>
                 <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Short, lightweight assessment for quick knowledge checks.</p>
               </button>

               {/* Card 3: Assignment */}
               <button
                 type="button"
                 onClick={() => onChange({ type: "ASSIGNMENT" })}
                 className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                   state.type === "ASSIGNMENT" 
                     ? "border-[#002388] bg-[#002388]/5 shadow-sm" 
                     : "border-slate-200 bg-white hover:border-[#002388]/40 hover:bg-slate-50"
                 }`}
               >
                 <div className="flex items-center justify-between w-full mb-1">
                   <span className="font-semibold text-slate-900">Assignment</span>
                   <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                     state.type === "ASSIGNMENT" ? "border-[#002388]" : "border-slate-300"
                   }`}>
                     {state.type === "ASSIGNMENT" && <div className="h-2 w-2 rounded-full bg-[#002388]" />}
                   </div>
                 </div>
                 <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Project or task-based evaluation requiring detailed review.</p>
               </button>
            </div>
            {errors.type && <p className="text-[10px] font-semibold text-rose-500 ml-1 italic">{errors.type}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="startsAt" className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">
              Start Date & Time <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <CalendarClock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                id="startsAt"
                type="datetime-local"
                value={state.startsAt}
                onChange={(e) => onChange({ startsAt: e.target.value })}
                className="h-11 rounded-md border-slate-200 bg-white hover:bg-slate-50 focus:bg-white focus:ring-[#002388] transition-all font-medium pl-10 w-full"
              />
            </div>
            {errors.startsAt && <p className="text-[10px] font-semibold text-rose-500 ml-1 italic">{errors.startsAt}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endsAt" className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">
              End Date & Time <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <CalendarClock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                id="endsAt"
                type="datetime-local"
                value={state.endsAt}
                onChange={(e) => onChange({ endsAt: e.target.value })}
                className="h-11 rounded-md border-slate-200 bg-white hover:bg-slate-50 focus:bg-white focus:ring-[#002388] transition-all font-medium pl-10 w-full"
              />
            </div>
            {errors.endsAt && <p className="text-[10px] font-semibold text-rose-500 ml-1 italic">{errors.endsAt}</p>}
          </div>

          {getWindowSummary(state.startsAt, state.endsAt) && (
            <div className="col-span-full flex items-center gap-2.5 px-4 py-2.5 rounded-md bg-[#002388]/5 border border-[#002388]/10">
              <Clock className="h-4 w-4 text-[#002388] shrink-0" />
              <p className="text-xs font-semibold text-[#002388]">
                {getWindowSummary(state.startsAt, state.endsAt)}
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="durationMinutes" className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">
              Duration (Minutes) <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="durationMinutes"
              type="number"
              min={1}
              value={state.durationMinutes}
              onChange={(e) => onChange({ durationMinutes: e.target.value })}
              placeholder="e.g. 90"
              className="h-11 rounded-md border-slate-200 bg-white hover:bg-slate-50 focus:bg-white focus:ring-[#002388] transition-all font-medium"
            />
            {errors.durationMinutes && <p className="text-[10px] font-semibold text-rose-500 ml-1 italic">{errors.durationMinutes}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="maxAttempts" className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">
              Max Attempts <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="maxAttempts"
              type="number"
              min={1}
              value={state.maxAttempts}
              onChange={(e) => onChange({ maxAttempts: e.target.value })}
              className="h-11 rounded-md border-slate-200 bg-white hover:bg-slate-50 focus:bg-white focus:ring-[#002388] transition-all font-medium"
            />
            {errors.maxAttempts && <p className="text-[10px] font-semibold text-rose-500 ml-1 italic">{errors.maxAttempts}</p>}
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="h-px bg-slate-100 w-full" />

      <div className="space-y-6">
        <div className="flex items-center gap-4 pb-3 border-b border-slate-50">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-50 text-[#002388]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">Access & Security</h2>
        </div>

        <div className="grid gap-6">
          {/* Password Protection */}
          <div className={`p-6 rounded-lg border transition-all duration-300 ${state.passwordProtected ? "bg-[#002388]/5 border-[#002388]/10" : "bg-slate-50/30 border-slate-100 hover:border-slate-200"}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Password Protection</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Restrict access to this assessment with a password</p>
              </div>
              <button
                type="button"
                onClick={() => onChange({ passwordProtected: !state.passwordProtected, accessPassword: "" })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${state.passwordProtected ? "bg-[#002388]" : "bg-slate-200"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ${state.passwordProtected ? "translate-x-6 shadow-sm" : "translate-x-1"}`} />
              </button>
            </div>
            
            {state.passwordProtected && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="accessPassword" className="text-[10px] font-bold text-[#002388] uppercase tracking-widest ml-1">
                  Access Password <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="accessPassword"
                  value={state.accessPassword}
                  onChange={(e) => onChange({ accessPassword: e.target.value })}
                  placeholder="Enter access password"
                  className="h-11 rounded-md border-[#002388]/10 bg-white focus:ring-[#002388] font-medium"
                />
                {errors.accessPassword && <p className="text-[10px] font-semibold text-rose-500 ml-1 italic">{errors.accessPassword}</p>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shuffle Questions */}
            <div className={`p-6 rounded-lg border transition-all duration-300 ${state.shuffleQuestions ? "bg-[#002388]/5 border-[#002388]/10" : "bg-slate-50/30 border-slate-100 hover:border-slate-200"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Shuffle Questions</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">Randomize question order</p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange({ shuffleQuestions: !state.shuffleQuestions })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${state.shuffleQuestions ? "bg-[#002388]" : "bg-slate-200"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ${state.shuffleQuestions ? "translate-x-6 shadow-sm" : "translate-x-1"}`} />
                </button>
              </div>
            </div>

            {/* Shuffle Options */}
            <div className={`p-6 rounded-lg border transition-all duration-300 ${state.shuffleOptions ? "bg-[#002388]/5 border-[#002388]/10" : "bg-slate-50/30 border-slate-100 hover:border-slate-200"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Shuffle Options</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">Randomize MCQ options</p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange({ shuffleOptions: !state.shuffleOptions })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${state.shuffleOptions ? "bg-[#002388]" : "bg-slate-200"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ${state.shuffleOptions ? "translate-x-6 shadow-sm" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
