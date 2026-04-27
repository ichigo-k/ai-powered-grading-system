"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Step3State, QuestionFormState, SectionFormState, SectionTypeEnum } from "@/lib/assessment-types"
import { Plus, Library, Trash2 } from "lucide-react"
import QuestionBuilderA from "./QuestionBuilderA"
import QuestionBuilderB from "./QuestionBuilderB"
import ImportFromBankModal from "./ImportFromBankModal"
import { useState } from "react"

interface Step3QuestionsProps {
  state: Step3State
  onChange: (s: Step3State) => void
  errors: Record<string, string>
  courseId: number | null
}

function newQuestion(order: number): QuestionFormState {
  return {
    id: crypto.randomUUID(),
    order,
    body: "",
    marks: "",
    answerType: "",
    options: ["", ""],
    correctOption: null,
    rubricCriteria: [],
  }
}

function newSection(): SectionFormState {
  return {
    id: crypto.randomUUID(),
    name: "",
    type: "",
    requiredQuestionsCount: "",
    pointsPerQuestion: "",
    questions: [],
  }
}

export default function Step3Questions({ state, onChange, errors, courseId }: Step3QuestionsProps) {
  const [bankModal, setBankModal] = useState<{ open: boolean; sectionId: string | null; type: string }>({
    open: false,
    sectionId: null,
    type: "",
  })

  const addSection = () => {
    onChange({ sections: [...state.sections, newSection()] })
  }

  const updateSection = (id: string, updates: Partial<SectionFormState>) => {
    onChange({
      sections: state.sections.map((s) => {
        if (s.id !== id) return s
        const next = { ...s, ...updates }
        if ("pointsPerQuestion" in updates) {
          next.questions = next.questions.map((q) => ({ ...q, marks: updates.pointsPerQuestion! }))
        }
        return next
      }),
    })
  }

  const removeSection = (id: string) => {
    onChange({ sections: state.sections.filter((s) => s.id !== id) })
  }

  const addQuestion = (sectionId: string) => {
    onChange({
      sections: state.sections.map((s) => {
        if (s.id !== sectionId) return s
        const q = newQuestion(s.questions.length + 1)
        return { ...s, questions: [...s.questions, q] }
      }),
    })
  }

  const updateQuestion = (sectionId: string, qId: string, updated: QuestionFormState) => {
    onChange({
      sections: state.sections.map((s) => {
        if (s.id !== sectionId) return s
        return { ...s, questions: s.questions.map((q) => (q.id === qId ? updated : q)) }
      }),
    })
  }

  const removeQuestion = (sectionId: string, qId: string) => {
    onChange({
      sections: state.sections.map((s) => {
        if (s.id !== sectionId) return s
        const remaining = s.questions.filter((q) => q.id !== qId)
        let order = 1
        return { ...s, questions: remaining.map((q) => ({ ...q, order: order++ })) }
      }),
    })
  }

  const moveQuestion = (sectionId: string, qId: string, direction: "up" | "down") => {
    onChange({
      sections: state.sections.map((s) => {
        if (s.id !== sectionId) return s
        const idx = s.questions.findIndex((q) => q.id === qId)
        if (idx === -1) return s
        const swapIdx = direction === "up" ? idx - 1 : idx + 1
        if (swapIdx < 0 || swapIdx >= s.questions.length) return s
        const qs = [...s.questions]
        const tempOrder = qs[idx].order
        qs[idx].order = qs[swapIdx].order
        qs[swapIdx].order = tempOrder
        qs.sort((a, b) => a.order - b.order)
        return { ...s, questions: qs }
      }),
    })
  }

  const handleImport = (imported: QuestionFormState[]) => {
    const { sectionId } = bankModal
    if (!sectionId) return
    onChange({
      sections: state.sections.map((s) => {
        if (s.id !== sectionId) return s
        let nextOrder = s.questions.length + 1
        const withOrders = imported.map((q) => ({ ...q, order: nextOrder++ }))
        return { ...s, questions: [...s.questions, ...withOrders] }
      }),
    })
    setBankModal({ open: false, sectionId: null, type: "" })
  }

  return (
    <div className="space-y-4">
      {(state.sections || []).map((section, secIdx) => (
        <div
          key={section.id}
          className="rounded-xl border border-slate-200 bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {/* Section header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#002388] text-white text-[11px] font-medium">
              {secIdx + 1}
            </div>
            <Input
              value={section.name}
              onChange={(e) => updateSection(section.id, { name: e.target.value })}
              placeholder="Section name (e.g. Section A — Multiple Choice)"
              className="h-8 border-none bg-transparent focus-visible:ring-0 shadow-none font-medium text-slate-900 px-0 placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => removeSection(section.id)}
              className="ml-auto p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
            >
              <Trash2 size={15} />
            </button>
          </div>

          {/* Section config */}
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-1">
                <Label className="text-[11px] text-slate-500 uppercase tracking-wider">Question Type</Label>
                <Select
                  value={section.type}
                  onValueChange={(v: SectionTypeEnum) => updateSection(section.id, { type: v })}
                >
                  <SelectTrigger className="h-9 border-slate-200 bg-white text-sm focus:ring-[#002388]/30">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OBJECTIVE">Objective (MCQ)</SelectItem>
                    <SelectItem value="SUBJECTIVE">Subjective (Open Ended)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 space-y-1">
                <Label className="text-[11px] text-slate-500 uppercase tracking-wider">Questions to Answer</Label>
                <Input
                  type="number"
                  min={1}
                  value={section.requiredQuestionsCount}
                  onChange={(e) => updateSection(section.id, { requiredQuestionsCount: e.target.value })}
                  placeholder="Leave blank for all"
                  className="h-9 border-slate-200 bg-white text-sm focus-visible:ring-[#002388]/30"
                />
              </div>

              {section.requiredQuestionsCount && (
                <div className="flex-1 space-y-1 animate-in fade-in duration-200">
                  <Label className="text-[11px] text-slate-500 uppercase tracking-wider">Points per Question</Label>
                  <Input
                    type="number"
                    min={1}
                    value={section.pointsPerQuestion}
                    onChange={(e) => updateSection(section.id, { pointsPerQuestion: e.target.value })}
                    placeholder="Marks"
                    className="h-9 border-slate-200 bg-white text-sm focus-visible:ring-[#002388]/30"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Questions area */}
          <div className="px-5 py-4">
            {section.type ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    {section.questions.length} question{section.questions.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setBankModal({ open: true, sectionId: section.id, type: section.type })}
                      className="h-8 px-3 text-xs text-[#002388] hover:bg-[#002388]/5"
                    >
                      <Library size={13} className="mr-1.5" />
                      Import from Bank
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addQuestion(section.id)}
                      className="h-8 px-3 text-xs bg-[#002388] hover:bg-[#0B4DBB] text-white"
                    >
                      <Plus size={13} className="mr-1.5" />
                      Add Question
                    </Button>
                  </div>
                </div>

                {section.questions.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
                    <p className="text-sm text-slate-400">No questions yet. Add one above.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {section.questions.map((q, idx) =>
                      section.type === "OBJECTIVE" ? (
                        <QuestionBuilderA
                          key={q.id}
                          question={q}
                          onChange={(updated) => updateQuestion(section.id, q.id, updated)}
                          onRemove={() => removeQuestion(section.id, q.id)}
                          onMoveUp={() => moveQuestion(section.id, q.id, "up")}
                          onMoveDown={() => moveQuestion(section.id, q.id, "down")}
                          isFirst={idx === 0}
                          isLast={idx === section.questions.length - 1}
                          readonlyMarks={!!section.requiredQuestionsCount}
                        />
                      ) : (
                        <QuestionBuilderB
                          key={q.id}
                          question={q}
                          onChange={(updated) => updateQuestion(section.id, q.id, updated)}
                          onRemove={() => removeQuestion(section.id, q.id)}
                          onMoveUp={() => moveQuestion(section.id, q.id, "up")}
                          onMoveDown={() => moveQuestion(section.id, q.id, "down")}
                          isFirst={idx === 0}
                          isLast={idx === section.questions.length - 1}
                          readonlyMarks={!!section.requiredQuestionsCount}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
                <p className="text-sm text-slate-400">Select a question type above to start adding questions.</p>
              </div>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addSection}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-[#002388]/30 hover:text-[#002388] hover:bg-[#002388]/5 transition-all text-sm"
      >
        <Plus size={16} />
        Add Section
      </button>

      <ImportFromBankModal
        open={bankModal.open}
        onClose={() => setBankModal({ open: false, sectionId: null, type: "" })}
        onImport={handleImport}
        courseId={courseId}
        type={bankModal.type}
      />
    </div>
  )
}
