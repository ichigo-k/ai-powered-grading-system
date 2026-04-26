"use client"

import { useEffect, useState } from "react"
import { Dialog } from "radix-ui"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { QuestionFormState, SectionEnum } from "@/lib/assessment-types"
import { X, Loader2 } from "lucide-react"

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
}

interface ImportFromBankModalProps {
  open: boolean
  onClose: () => void
  onImport: (questions: QuestionFormState[]) => void
  courseId: number | null
  type: string
}

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

  // Fetch banks when modal opens
  useEffect(() => {
    if (!open) return
    setLoadingBanks(true)
    setSelectedBankId(null)
    setItems([])
    setSelectedIds(new Set())

    fetch("/api/lecturer/question-banks")
      .then((r) => r.json())
      .then((data: QuestionBank[]) => {
        // Filter by courseId first, fall back to all
        const filtered = courseId
          ? data.filter((b) => b.courseId === courseId || b.courseId === null)
          : data
        setBanks(filtered.length > 0 ? filtered : data)
      })
      .catch(() => setBanks([]))
      .finally(() => setLoadingBanks(false))
  }, [open, courseId])

  // Fetch items when a bank is selected
  useEffect(() => {
    if (selectedBankId === null) {
      setItems([])
      return
    }
    setLoadingItems(true)
    setSelectedIds(new Set())

    fetch(`/api/lecturer/question-banks/${selectedBankId}/items`)
      .then((r) => r.json())
      .then((data: BankItem[]) => {
        // Filter by type
        setItems(data.filter((item) => item.type === type))
      })
      .catch(() => setItems([]))
      .finally(() => setLoadingItems(false))
  }, [selectedBankId, type])

  const toggleItem = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleImport = () => {
    const toImport = items.filter((item) => selectedIds.has(item.id))
    const questions: QuestionFormState[] = toImport.map((item) => ({
      id: crypto.randomUUID(),
      order: 0, // will be set by Step3Questions
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
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[32px] bg-white p-10 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 border border-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <Dialog.Title className="text-xl font-semibold text-slate-900 tracking-tight">
                Import from Bank
              </Dialog.Title>
              <Dialog.Description className="text-xs font-medium text-slate-400 mt-1.5">
                Select items from your {type === "OBJECTIVE" ? "Objective" : "Subjective"} question bank.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50">
                <X className="size-5" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="space-y-10">
            {/* Bank selector */}
            <div className="space-y-4">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">Choose Question Bank</Label>
              {loadingBanks ? (
                <div className="flex items-center gap-3 p-5 rounded-2xl bg-slate-50/50 border border-slate-50">
                  <Loader2 className="size-4 animate-spin text-[#002388]" />
                  <span className="text-xs font-medium text-slate-500">Scanning available banks...</span>
                </div>
              ) : banks.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center">
                  <p className="text-sm font-medium text-slate-400 italic">No question banks found for this course.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {banks.map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setSelectedBankId(bank.id)}
                      className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all duration-300 ${selectedBankId === bank.id
                          ? "border-[#002388] bg-[#002388] text-white shadow-lg shadow-blue-900/10"
                          : "border-slate-100 bg-white text-slate-500 hover:border-[#002388]/30 hover:text-[#002388]"
                        }`}
                    >
                      {bank.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Items list */}
            {selectedBankId !== null && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-400">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Select Questions</Label>
                  {selectedIds.size > 0 && (
                    <span className="text-[10px] font-bold text-[#002388] uppercase tracking-[0.15em] bg-[#002388]/5 px-2 py-1 rounded-md">{selectedIds.size} Selected</span>
                  )}
                </div>
                
                {loadingItems ? (
                  <div className="flex items-center gap-3 p-5 rounded-2xl bg-slate-50/50 border border-slate-50">
                    <Loader2 className="size-4 animate-spin text-[#002388]" />
                    <span className="text-xs font-medium text-slate-500">Retrieving items...</span>
                  </div>
                ) : items.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center">
                    <p className="text-sm font-medium text-slate-400 italic">No matching questions in this bank.</p>
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto space-y-2.5 pr-3 custom-scrollbar">
                    {items.map((item) => {
                      const selected = selectedIds.has(item.id)
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleItem(item.id)}
                          className={`w-full group text-left rounded-[20px] border p-4 transition-all duration-300 ${selected
                              ? "border-[#002388]/10 bg-[#002388]/5 shadow-sm"
                              : "border-slate-50 bg-slate-50/30 hover:border-slate-100 hover:bg-slate-50"
                            }`}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ${selected
                                  ? "bg-[#002388] border-[#002388] text-white shadow-lg shadow-blue-900/10"
                                  : "border-slate-200 bg-white group-hover:border-[#002388]/30"
                                }`}
                            >
                              {selected && (
                                <svg className="h-3 w-3" viewBox="0 0 10 10" fill="none">
                                  <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 leading-relaxed line-clamp-2">{item.body}</p>
                              <div className="flex items-center gap-3 mt-2.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.marks} Point{item.marks !== 1 ? "s" : ""}</span>
                                {item.answerType && (
                                  <>
                                    <span className="text-slate-200 text-[8px]">•</span>
                                    <span className="text-[10px] font-bold text-[#002388] uppercase tracking-widest">{item.answerType.replace("_", " ")}</span>
                                  </>
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
          </div>

          {/* Footer */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <Button type="button" variant="ghost" onClick={onClose} className="h-14 flex-1 rounded-[20px] font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-50 uppercase tracking-[0.2em] text-[10px]">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={selectedIds.size === 0}
              className="h-14 flex-[2] rounded-[20px] bg-[#002388] hover:bg-[#0B4DBB] text-white font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-blue-900/20 transition-all disabled:shadow-none disabled:bg-slate-100 disabled:text-slate-400"
            >
              Import {selectedIds.size > 0 ? `${selectedIds.size} Question${selectedIds.size !== 1 ? "s" : ""}` : "Selection"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
