"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { QuestionFormState } from "@/lib/assessment-types"
import { ChevronUp, ChevronDown, Trash2, Plus, X } from "lucide-react"

interface QuestionBuilderAProps {
  question: QuestionFormState
  onChange: (q: QuestionFormState) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
  readonlyMarks?: boolean
}

export default function QuestionBuilderA({
  question,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  readonlyMarks = false,
}: QuestionBuilderAProps) {
  const updateOption = (index: number, value: string) => {
    const options = [...question.options]
    options[index] = value
    onChange({ ...question, options })
  }

  const addOption = () => {
    onChange({ ...question, options: [...question.options, ""] })
  }

  const removeOption = (index: number) => {
    if (question.options.length <= 2) return
    const options = question.options.filter((_, i) => i !== index)
    // If removed option was the correct one, reset
    const correctOption =
      question.correctOption === index
        ? null
        : question.correctOption !== null && question.correctOption > index
          ? question.correctOption - 1
          : question.correctOption
    onChange({ ...question, options, correctOption })
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
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Objective Question</h4>
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
        <div className="grid grid-cols-1 md:grid-cols-[1fr_140px] gap-8 items-start">
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
          <div className="space-y-3">
            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1 text-center block">Marks</Label>
            <Input
              type="number"
              min={1}
              value={question.marks}
              onChange={(e) => onChange({ ...question, marks: e.target.value })}
              placeholder="0"
              disabled={readonlyMarks}
              className={`h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-[#002388]/30 transition-all text-center font-bold text-lg ${readonlyMarks ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
            />
            {readonlyMarks && <p className="text-[9px] text-center text-slate-400 font-medium italic mt-1">Synced to section</p>}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Answer Options</Label>
            <span className="text-[10px] font-semibold text-[#002388]/60 uppercase tracking-widest italic">Select correct answer</span>
          </div>
          
          <div className="grid gap-3">
            {question.options.map((opt, i) => {
              const isCorrect = question.correctOption === i
              return (
                <div key={i} className={`flex items-center gap-4 p-3 pr-4 rounded-2xl border transition-all duration-300 ${isCorrect ? "border-[#002388]/10 bg-[#002388]/5 shadow-sm" : "border-slate-50 bg-slate-50/30 hover:border-slate-100"}`}>
                  <button
                    type="button"
                    onClick={() => onChange({ ...question, correctOption: i })}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${isCorrect ? "border-[#002388] border-[6px]" : "border-slate-300 bg-white"}`}
                  />
                  <Input
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="h-10 border-none bg-transparent focus-visible:ring-0 shadow-none font-medium px-1 text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(i)}
                    disabled={question.options.length <= 2}
                    className="h-8 w-8 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all disabled:hidden"
                  >
                    <X size={16} />
                  </Button>
                </div>
              )
            })}
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={addOption}
            className="w-full h-12 rounded-2xl border border-dashed border-slate-200 text-slate-400 hover:text-[#002388] hover:border-[#002388]/30 hover:bg-[#002388]/5 font-bold text-[10px] uppercase tracking-[0.2em] transition-all"
          >
            <Plus size={16} className="mr-2" />
            Add Another Option
          </Button>
        </div>
      </div>
    </div>
  )
}
