"use client"

import { Button } from "@/components/ui/button"
import type { Step4State, SectionFormState } from "@/lib/assessment-types"
import { ArrowLeft, FileText, Send } from "lucide-react"

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

  const totalQuestions = sections.reduce((acc, sec) => acc + sec.questions.length, 0)

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.12em] mb-4">
          Grading Summary
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs text-slate-500 mb-1">Total Marks</p>
            <p className="text-2xl font-semibold text-[#002388]">{totalMarks}</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs text-slate-500 mb-1">Sections</p>
            <p className="text-2xl font-semibold text-slate-900">{sections.length}</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs text-slate-500 mb-1">Questions</p>
            <p className="text-2xl font-semibold text-slate-900">{totalQuestions}</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs text-slate-500 mb-1">Grading</p>
            <p className="text-sm font-medium text-slate-700 mt-1">Automated</p>
          </div>
        </div>

        {sections.length > 0 && (
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Section</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Questions</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sections.map((sec) => {
                  const required = Number(sec.requiredQuestionsCount) || sec.questions.length
                  const sortedMarks = sec.questions.map((q) => Number(q.marks) || 0).sort((a, b) => b - a)
                  const secMarks = sortedMarks.slice(0, required).reduce((acc, m) => acc + m, 0)
                  const pct = totalMarks > 0 ? Math.round((secMarks / totalMarks) * 100) : 0

                  return (
                    <tr key={sec.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-slate-900">
                        {sec.name || <span className="text-slate-400 italic">Untitled</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                          sec.type === "OBJECTIVE"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-purple-50 text-purple-700 border-purple-200"
                        }`}>
                          {sec.type === "OBJECTIVE" ? "Objective" : "Subjective"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {sec.requiredQuestionsCount
                          ? `${sec.requiredQuestionsCount} of ${sec.questions.length}`
                          : `All ${sec.questions.length}`}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-medium text-slate-900">{secMarks}</span>
                        <span className="text-xs text-slate-400 ml-1">({pct}%)</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="border-t border-slate-200 bg-slate-50">
                <tr>
                  <td colSpan={3} className="px-4 py-2.5 text-xs font-medium text-slate-600">Total</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-[#002388]">{totalMarks} pts</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={isSubmitting}
          className="h-9 w-9 p-0 text-slate-400 hover:text-slate-700"
        >
          <ArrowLeft size={16} />
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onSaveAsDraft}
          disabled={isSubmitting}
          className="h-9 px-4 border-slate-200 text-slate-600 hover:bg-slate-50 text-sm"
        >
          <FileText size={14} className="mr-1.5" />
          {isSubmitting ? "Saving..." : "Save as Draft"}
        </Button>
        <Button
          type="button"
          onClick={onPublish}
          disabled={isSubmitting}
          className="h-9 px-5 bg-[#002388] hover:bg-[#0B4DBB] text-white text-sm ml-auto"
        >
          <Send size={14} className="mr-1.5" />
          {isSubmitting ? "Publishing..." : "Publish Assessment"}
        </Button>
      </div>
    </div>
  )
}
