"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { BookOpen, CheckCircle2, Loader2, Target, PenLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { QuestionFormState } from "@/lib/assessment-types"

// ─── Types ────────────────────────────────────────────────────────────────────

interface BankItem {
  id: number
  type: string
  body: string
  marks: number
  answerType?: string | null
  options?: string[] | null
  correctOption?: number | null
  rubricCriteria?: Array<{ description: string; maxMarks: number; order: number }>
}

interface QuestionBank {
  id: number
  title: string
  courseId: number | null
  course?: { code: string; title: string } | null
  _count?: { items: number }
  typeCounts?: { OBJECTIVE: number; SUBJECTIVE: number }
}

interface ImportFromBankModalProps {
  open: boolean
  onClose: () => void
  onImport: (questions: QuestionFormState[]) => void
  courseId: number | null
  type: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImportFromBankModal({
  open,
  onClose,
  onImport,
  courseId,
  type,
}: ImportFromBankModalProps) {
  const [banks, setBanks] = useState<QuestionBank[]>([])
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null)
  const [items, setItems] = useState<BankItem[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [loadingBanks, setLoadingBanks] = useState(false)
  const [loadingItems, setLoadingItems] = useState(false)

  const isObjective = type === "OBJECTIVE"
  const TypeIcon = isObjective ? Target : PenLine
  const typeLabel = isObjective ? "Objective" : "Subjective"

  useEffect(() => {
    if (!open) return
    setLoadingBanks(true)
    setSelectedBankId(null)
    setItems([])
    setSelectedIds(new Set())

    fetch("/api/lecturer/question-banks")
      .then((r) => r.json())
      .then((data: QuestionBank[]) => {
        const filtered = courseId
          ? data.filter((b) => b.courseId === courseId || b.courseId === null)
          : data
        setBanks(filtered.length > 0 ? filtered : data)
      })
      .catch(() => setBanks([]))
      .finally(() => setLoadingBanks(false))
  }, [open, courseId])

  useEffect(() => {
    if (selectedBankId === null) { setItems([]); return }
    setLoadingItems(true)
    setSelectedIds(new Set())

    fetch(`/api/lecturer/question-banks/${selectedBankId}/items`)
      .then((r) => r.json())
      .then((data: BankItem[]) => setItems(data.filter((item) => item.type === type)))
      .catch(() => setItems([]))
      .finally(() => setLoadingItems(false))
  }, [selectedBankId, type])

  const toggleItem = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)))
    }
  }

  const handleImport = () => {
    const toImport = items.filter((item) => selectedIds.has(item.id))
    const questions: QuestionFormState[] = toImport.map((item) => ({
      id: crypto.randomUUID(),
      order: 0,
      body: item.body,
      marks: String(item.marks),
      answerType: (item.answerType as QuestionFormState["answerType"]) ?? "",
      options: Array.isArray(item.options) ? [...item.options] : ["", ""],
      correctOption: item.correctOption ?? null,
      rubricCriteria: (item.rubricCriteria ?? []).map((r) => ({
        id: crypto.randomUUID(),
        description: r.description,
        maxMarks: String(r.maxMarks),
        order: r.order,
      })),
    }))
    onImport(questions)
    onClose()
  }

  const handleClose = () => {
    setSelectedBankId(null)
    setItems([])
    setSelectedIds(new Set())
    onClose()
  }

  const allSelected = items.length > 0 && selectedIds.size === items.length

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent side="right" className="sm:max-w-lg w-full flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
              isObjective ? "bg-amber-100" : "bg-purple-100"
            )}>
              <TypeIcon className={cn("h-4 w-4", isObjective ? "text-amber-600" : "text-purple-600")} />
            </div>
            <div>
              <SheetTitle>Import from Bank</SheetTitle>
              <SheetDescription>
                Importing <span className="font-medium">{typeLabel}</span> questions into this section
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Bank selector */}
          <div className="px-6 py-4 border-b border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Choose Question Bank
            </p>
            {loadingBanks ? (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading banks…
              </div>
            ) : banks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
                <p className="text-sm text-slate-400">No question banks found.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {banks.map((bank) => {
                  const count = bank.typeCounts
                    ? (isObjective ? bank.typeCounts.OBJECTIVE : bank.typeCounts.SUBJECTIVE)
                    : bank._count?.items ?? 0
                  const isSelected = selectedBankId === bank.id
                  return (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setSelectedBankId(bank.id)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all",
                        isSelected
                          ? "border-[#002388] bg-[#002388] text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-[#002388]/40 hover:text-[#002388]"
                      )}
                    >
                      <BookOpen className="h-3.5 w-3.5 shrink-0" />
                      {bank.title}
                      {count > 0 && (
                        <span className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                          isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                        )}>
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Questions list */}
          {selectedBankId !== null && (
            <div className="px-6 py-4 space-y-3">
              {/* Toolbar */}
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Questions
                </p>
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="text-xs font-semibold text-[#002388] hover:underline"
                  >
                    {allSelected ? "Deselect all" : "Select all"}
                  </button>
                )}
              </div>

              {loadingItems ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
                </div>
              ) : items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
                  <p className="text-sm text-slate-400">
                    No {typeLabel.toLowerCase()} questions in this bank.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => {
                    const selected = selectedIds.has(item.id)
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className={cn(
                          "w-full text-left rounded-xl border p-4 transition-all",
                          selected
                            ? "border-[#002388]/20 bg-[#002388]/5 shadow-sm"
                            : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <div className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all",
                            selected
                              ? "bg-[#002388] border-[#002388] text-white"
                              : "border-slate-300 bg-white"
                          )}>
                            {selected && <CheckCircle2 className="h-3.5 w-3.5" />}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <p className="text-sm text-slate-800 leading-relaxed line-clamp-2">
                              {item.body}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                                {item.marks} {item.marks === 1 ? "mark" : "marks"}
                              </span>
                              {item.answerType && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase border bg-slate-50 text-slate-500 border-slate-200">
                                  {item.answerType.replace("_", " ")}
                                </span>
                              )}
                              {item.options && Array.isArray(item.options) && item.options.length > 0 && (
                                <span className="text-[10px] text-slate-400">
                                  {item.options.length} options
                                </span>
                              )}
                              {item.rubricCriteria && item.rubricCriteria.length > 0 && (
                                <span className="text-[10px] text-slate-400">
                                  {item.rubricCriteria.length} rubric criteria
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Placeholder when no bank selected */}
          {selectedBankId === null && !loadingBanks && banks.length > 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <BookOpen className="h-10 w-10 text-slate-200 mb-3" />
              <p className="text-sm text-slate-400">Select a bank above to browse questions</p>
            </div>
          )}
        </div>

        <SheetFooter className="px-6 py-4 border-t border-slate-100 flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-400">
            {selectedIds.size > 0
              ? `${selectedIds.size} question${selectedIds.size !== 1 ? "s" : ""} selected`
              : "No questions selected"}
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={handleClose} className="rounded-xl">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={selectedIds.size === 0}
              className="rounded-xl bg-[#002388] hover:bg-[#002388]/90 gap-1.5"
            >
              Import {selectedIds.size > 0 ? `${selectedIds.size} Question${selectedIds.size !== 1 ? "s" : ""}` : ""}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
