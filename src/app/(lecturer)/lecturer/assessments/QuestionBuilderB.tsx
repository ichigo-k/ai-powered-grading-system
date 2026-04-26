"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { QuestionFormState } from "@/lib/assessment-types"
import { ChevronUp, ChevronDown, Trash2, Plus, X } from "lucide-react"

interface QuestionBuilderBProps {
  question: QuestionFormState
  onChange: (q: QuestionFormState) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
  readonlyMarks?: boolean
}

export default function QuestionBuilderB({
  question,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  readonlyMarks = false,
}: QuestionBuilderBProps) {
  const addCriterion = () => {
    onChange({
      ...question,
      rubricCriteria: [
        ...question.rubricCriteria,
        {
          id: crypto.randomUUID(),
          description: "",
          maxMarks: "",
          order: question.rubricCriteria.length + 1,
        },
      ],
    })
  }

  const updateCriterion = (id: string, field: "description" | "maxMarks", value: string) => {
    onChange({
      ...question,
      rubricCriteria: question.rubricCriteria.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    })
  }

  const removeCriterion = (id: string) => {
    const updated = question.rubricCriteria
      .filter((c) => c.id !== id)
      .map((c, i) => ({ ...c, order: i + 1 }))
    onChange({ ...question, rubricCriteria: updated })
  }

  return (
    <div className="group relative rounded-[24px] border border-slate-100 bg-white p-7 transition-all duration-300 hover:border-[#002388]/20 hover:shadow-xl hover:shadow-slate-200/40">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white text-[11px] font-bold shadow-lg shadow-slate-900/20">
            {question.order}
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Subjective Question</h4>
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMoveUp}
            disabled={isFirst}
            className="h-9 w-9 rounded-xl text-slate-400 hover:text-[#002388] hover:bg-[#002388]/5 transition-all"
          >
            <ChevronUp size={18} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMoveDown}
            disabled={isLast}
            className="h-9 w-9 rounded-xl text-slate-400 hover:text-[#002388] hover:bg-[#002388]/5 transition-all"
          >
            <ChevronDown size={18} />
          </Button>
          <div className="w-px h-4 bg-slate-100 mx-2" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-9 w-9 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Question Content */}
        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">Question Content</Label>
          <textarea
            value={question.body}
            onChange={(e) => onChange({ ...question, body: e.target.value })}
            placeholder="Type your question here..."
            rows={3}
            className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-4 text-sm font-medium outline-none resize-none focus:bg-white focus:border-[#002388]/30 transition-all placeholder:text-slate-400 leading-relaxed"
          />
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">Answer Submission Format</Label>
            <Select
              value={question.answerType}
              onValueChange={(v) =>
                onChange({ ...question, answerType: v as QuestionFormState["answerType"] })
              }
            >
              <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-[#002388]/30 transition-all font-semibold text-xs shadow-sm">
                <SelectValue placeholder="Select format..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FILL_IN" className="text-xs font-medium">Text Input / Rich Editor</SelectItem>
                <SelectItem value="PDF_UPLOAD" className="text-xs font-medium">PDF Document Upload</SelectItem>
                <SelectItem value="CODE" className="text-xs font-medium">Interactive Code Sandbox</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">Allocated Marks</Label>
            <Input
              type="number"
              min={1}
              value={question.marks}
              onChange={(e) => onChange({ ...question, marks: e.target.value })}
              placeholder="0"
              disabled={readonlyMarks}
              className={`h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-[#002388]/30 transition-all font-bold text-center text-lg ${readonlyMarks ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
            />
            {readonlyMarks && <p className="text-[9px] text-center text-slate-400 font-medium italic mt-1">Synced to section</p>}
          </div>
        </div>

        {/* Rubric Criteria */}
        <div className="space-y-6 pt-4 border-t border-slate-50">
          <div className="flex items-center justify-between px-1">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Grading Rubric</Label>
              <p className="text-[10px] text-slate-400 font-medium italic">Define how AI should distribute marks</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addCriterion}
              className="h-10 px-4 rounded-xl text-[10px] font-bold text-[#002388] bg-[#002388]/5 hover:bg-[#002388]/10 transition-all uppercase tracking-widest"
            >
              <Plus size={14} className="mr-2" />
              Add Criterion
            </Button>
          </div>

          {question.rubricCriteria.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-6 text-center">
              <p className="text-[10px] font-bold text-slate-400 italic uppercase tracking-wider">No rubric criteria specified</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {question.rubricCriteria.map((criterion) => (
                <div
                  key={criterion.id}
                  className="group/item flex items-center gap-4 p-4 rounded-2xl border border-slate-50 bg-slate-50/30 hover:border-slate-100 transition-all duration-300"
                >
                  <div className="flex-1">
                    <Input
                      value={criterion.description}
                      onChange={(e) => updateCriterion(criterion.id, "description", e.target.value)}
                      placeholder="e.g. Correct use of data structures"
                      className="h-10 border-none bg-transparent focus-visible:ring-0 shadow-none font-medium px-1 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Max:</span>
                    <Input
                      type="number"
                      min={1}
                      value={criterion.maxMarks}
                      onChange={(e) => updateCriterion(criterion.id, "maxMarks", e.target.value)}
                      placeholder="0"
                      className="h-9 w-20 rounded-xl border-slate-100 bg-white text-center font-bold text-xs focus:ring-[#002388]/30 shadow-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCriterion(criterion.id)}
                      className="h-9 w-9 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
