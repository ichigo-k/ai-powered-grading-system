"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { complementWeight } from "@/lib/assessment-validation"
import type { Step4State, SectionFormState } from "@/lib/assessment-types"

interface Step4GradingProps {
  state: Step4State
  sections: SectionFormState[]
  onChange: (updates: Partial<Step4State>) => void
  errors: Partial<Record<keyof Step4State, string>>
  onSaveAsDraft: () => void
  onPublish: () => void
  onBack: () => void
  isSubmitting: boolean
}

export default function Step4Grading({
  state,
  sections,
  onChange,
  errors,
  onSaveAsDraft,
  onPublish,
  onBack,
  isSubmitting,
}: Step4GradingProps) {
  const totalMarks = sections.reduce((total, sec) => {
    const required = Number(sec.requiredQuestionsCount) || sec.questions.length
    const sortedMarks = sec.questions
      .map((q) => Number(q.marks) || 0)
      .sort((a, b) => b - a)
    return total + sortedMarks.slice(0, required).reduce((sum, m) => sum + m, 0)
  }, 0)


  return (
    <div className="space-y-12">
      <div className="space-y-8">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-50">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-[#002388]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20v-6M9 20v-10M15 20v-2M3 20h18" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">Grading Configuration</h2>
        </div>

        <div className="p-6 rounded-[24px] bg-[#002388]/5 border border-[#002388]/10 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#002388] uppercase tracking-wider">Automated Grading</h3>
            <p className="text-xs text-slate-500 font-medium">Total marks are calculated automatically based on your questions and section criteria.</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#002388] flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      {totalMarks > 0 && (
        <div className="rounded-[40px] bg-slate-900 p-10 text-white shadow-2xl shadow-slate-900/20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Distribution Overview</p>
              <h3 className="text-2xl font-bold mt-2">Marks Summary</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Max Obtainable Score</p>
              <p className="text-4xl font-bold text-white mt-1">{totalMarks} <span className="text-xs text-slate-500 ml-1">pts</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sections.map((sec) => {
              const required = Number(sec.requiredQuestionsCount) || sec.questions.length
              const sortedMarks = sec.questions.map((q) => Number(q.marks) || 0).sort((a, b) => b - a)
              const secMarks = sortedMarks.slice(0, required).reduce((acc, m) => acc + m, 0)
              const percentage = totalMarks > 0 ? Math.round((secMarks / totalMarks) * 100) : 0
              
              return (
                <div key={sec.id} className="p-6 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest line-clamp-1 pr-2">{sec.name || "Untitled Section"}</span>
                    <span className="text-[10px] font-bold bg-white/10 px-2.5 py-1 rounded-lg text-white/60">{percentage}%</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <p className="text-5xl font-bold tracking-tighter">{secMarks}</p>
                    <span className="text-sm font-bold text-white/20">pts</span>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${sec.type === "OBJECTIVE" ? "bg-blue-400" : "bg-purple-400"}`} />
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                        {sec.type === "OBJECTIVE" ? "Objective" : "Subjective"}
                      </p>
                    </div>
                    
                    <p className="text-[10px] font-medium text-white/30 italic leading-relaxed">
                      {sec.requiredQuestionsCount 
                        ? `Student must answer ${sec.requiredQuestionsCount} of ${sec.questions.length} questions.`
                        : `Student must answer all ${sec.questions.length} questions.`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Submission Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="h-12 w-12 rounded-md border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center justify-center shrink-0"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onSaveAsDraft}
          disabled={isSubmitting}
          className="h-12 flex-1 rounded-md border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          {isSubmitting ? "Processing..." : "Save as Draft"}
        </Button>
        <Button
          type="button"
          onClick={onPublish}
          disabled={isSubmitting}
          className="h-12 flex-[2] rounded-md bg-[#002388] hover:bg-[#0B4DBB] text-white font-semibold transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? "Publishing..." : (
            <>
              Confirm & Publish
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
