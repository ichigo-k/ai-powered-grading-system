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

  // SECTION ACTIONS
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
    onChange({
      sections: state.sections.filter((s) => s.id !== id),
    })
  }

  // QUESTION ACTIONS
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
        return {
          ...s,
          questions: s.questions.map((q) => (q.id === qId ? updated : q)),
        }
      }),
    })
  }

  const removeQuestion = (sectionId: string, qId: string) => {
    onChange({
      sections: state.sections.map((s) => {
        if (s.id !== sectionId) return s
        const remaining = s.questions.filter((q) => q.id !== qId)
        let order = 1
        const reordered = remaining.map((q) => ({ ...q, order: order++ }))
        return { ...s, questions: reordered }
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

  const openBankModal = (sectionId: string, type: string) => {
    setBankModal({ open: true, sectionId, type })
  }

  return (
    <div className="space-y-16">
      <div className="space-y-12">
        {(state.sections || []).map((section, secIdx) => (
          <div key={section.id} className="p-8 rounded-[32px] border border-slate-200 bg-white shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row gap-6 pb-6 border-b border-slate-100 justify-between md:items-center">
              <div className="flex-1 space-y-4 w-full">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-[#002388] font-bold text-sm">
                    {secIdx + 1}
                  </div>
                  <Input
                    value={section.name}
                    onChange={(e) => updateSection(section.id, { name: e.target.value })}
                    placeholder="Section Name (e.g., Section A, Multiple Choice)"
                    className="h-12 text-lg font-bold border-none bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:ring-1 ring-[#002388]/30 transition-all shadow-none"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 md:ml-14">
                  <div className="flex-1 space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Question Type</Label>
                    <Select
                      value={section.type}
                      onValueChange={(v: SectionTypeEnum) => updateSection(section.id, { type: v })}
                    >
                      <SelectTrigger className="h-12 rounded-xl bg-slate-50/50 border-none font-semibold text-sm hover:bg-slate-50 focus:bg-white focus:ring-1 ring-[#002388]/30 shadow-none">
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OBJECTIVE" className="font-medium text-sm">Objective (MCQ)</SelectItem>
                        <SelectItem value="SUBJECTIVE" className="font-medium text-sm">Subjective (Open Ended)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Questions to Answer</Label>
                    <Input
                      type="number"
                      min={1}
                      value={section.requiredQuestionsCount}
                      onChange={(e) => updateSection(section.id, { requiredQuestionsCount: e.target.value })}
                      placeholder="Leave blank for 'Answer All'"
                      className="h-12 rounded-xl bg-slate-50/50 border-none font-medium text-sm hover:bg-slate-50 focus:bg-white focus:ring-1 ring-[#002388]/30 shadow-none"
                    />
                  </div>

                  {section.requiredQuestionsCount && (
                    <div className="flex-1 space-y-2 animate-in fade-in zoom-in-95 duration-300">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Points per Question</Label>
                      <Input
                        type="number"
                        min={1}
                        value={section.pointsPerQuestion}
                        onChange={(e) => updateSection(section.id, { pointsPerQuestion: e.target.value })}
                        placeholder="Marks per question"
                        className="h-12 rounded-xl bg-blue-50/50 border-none font-bold text-sm text-[#002388] hover:bg-blue-50 focus:bg-white focus:ring-1 ring-[#002388]/30 shadow-none"
                      />
                    </div>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeSection(section.id)}
                className="h-12 w-12 p-0 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all shrink-0 mt-2 md:mt-0"
              >
                <Trash2 size={20} />
              </Button>
            </div>

            {section.type ? (
              <div className="space-y-6 md:ml-14">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h4 className="text-sm font-bold text-slate-900 tracking-tight">Questions</h4>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => openBankModal(section.id, section.type)}
                      className="h-10 px-4 rounded-xl font-semibold text-[#002388] hover:bg-[#002388]/5 transition-all flex items-center gap-2"
                    >
                      <Library size={16} />
                      Import
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addQuestion(section.id)}
                      className="h-10 px-4 rounded-xl bg-[#002388] hover:bg-[#0B4DBB] text-white font-semibold shadow-md shadow-blue-900/10 transition-all flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Add Question
                    </Button>
                  </div>
                </div>

                {section.questions.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
                    <p className="text-sm font-medium text-slate-400 italic">No questions added to this section yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
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
              <div className="md:ml-14 rounded-[24px] border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
                <p className="text-sm font-medium text-slate-400 italic">Please select a Question Type above to start adding questions.</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addSection}
        className="w-full h-16 rounded-[24px] border-2 border-dashed border-[#002388]/20 bg-[#002388]/5 text-[#002388] font-bold uppercase tracking-widest hover:bg-[#002388]/10 hover:border-[#002388]/30 transition-all flex items-center justify-center gap-3 text-xs"
      >
        <Plus size={20} strokeWidth={3} />
        Add New Section
      </Button>

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
