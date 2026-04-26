"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Trash2, ChevronDown, ChevronRight, BookOpen, Loader2 } from "lucide-react"
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
import { ConfirmModal } from "@/components/ui/confirm-modal"
import QuestionBuilderA from "@/app/(lecturer)/lecturer/assessments/QuestionBuilderA"
import QuestionBuilderB from "@/app/(lecturer)/lecturer/assessments/QuestionBuilderB"
import type { QuestionFormState, SectionEnum, AnswerTypeEnum } from "@/lib/assessment-types"

// ─── Types ────────────────────────────────────────────────────────────────────

interface RubricItem {
  id: number
  description: string
  maxMarks: number
  order: number
}

interface BankItem {
  id: number
  bankId: number
  section: SectionEnum
  body: string
  marks: number
  answerType: AnswerTypeEnum | null
  options: string[] | null
  correctOption: number | null
  createdAt: string
  rubricCriteria: RubricItem[]
}

interface Bank {
  id: number
  title: string
  courseId: number | null
  course: { code: string; title: string } | null
  _count: { items: number }
  createdAt: string
}

interface LecturerCourse {
  id: number
  code: string
  title: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function newQuestionForm(section: SectionEnum): QuestionFormState {
  return {
    id: crypto.randomUUID(),
    section,
    order: 1,
    body: "",
    marks: "",
    answerType: "",
    options: ["", ""],
    correctOption: null,
    rubricCriteria: [],
  }
}

// ─── Add Item Form ─────────────────────────────────────────────────────────────

interface AddItemFormProps {
  bankId: number
  onAdded: () => void
  onCancel: () => void
}

function AddItemForm({ bankId, onAdded, onCancel }: AddItemFormProps) {
  const [section, setSection] = useState<SectionEnum | "">("")
  const [question, setQuestion] = useState<QuestionFormState | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSectionChange = (val: SectionEnum) => {
    setSection(val)
    setQuestion(newQuestionForm(val))
  }

  const handleSubmit = async () => {
    if (!question || !section) return

    // Basic validation
    if (!question.body.trim()) {
      toast.error("Question body is required")
      return
    }
    const marks = parseInt(String(question.marks))
    if (!marks || marks < 1) {
      toast.error("Marks must be at least 1")
      return
    }
    if (section === "SECTION_A") {
      const validOptions = question.options.filter((o) => o.trim())
      if (validOptions.length < 2) {
        toast.error("Section A questions need at least 2 options")
        return
      }
      if (question.correctOption === null) {
        toast.error("Please select the correct answer")
        return
      }
    }
    if (section === "SECTION_B" && !question.answerType) {
      toast.error("Please select an answer type")
      return
    }

    setIsSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        section,
        body: question.body,
        marks,
      }
      if (section === "SECTION_A") {
        payload.options = question.options.filter((o) => o.trim())
        payload.correctOption = question.correctOption
      }
      if (section === "SECTION_B") {
        payload.answerType = question.answerType
        if (question.rubricCriteria.length > 0) {
          payload.rubricCriteria = question.rubricCriteria.map((c, i) => ({
            description: c.description,
            maxMarks: parseInt(c.maxMarks) || 0,
            order: i + 1,
          }))
        }
      }

      const res = await fetch(`/api/lecturer/question-banks/${bankId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to add item")
      }
      toast.success("Item added to bank")
      onAdded()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add item")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-[#002388]/20 bg-blue-50/30 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">Add New Item</p>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="text-slate-500">
          Cancel
        </Button>
      </div>

      {/* Section selector */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Section <span className="text-red-500">*</span>
        </Label>
        <Select value={section} onValueChange={(v) => handleSectionChange(v as SectionEnum)}>
          <SelectTrigger className="w-48 rounded-xl border-slate-200">
            <SelectValue placeholder="Select section..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SECTION_A">Section A (Objective)</SelectItem>
            <SelectItem value="SECTION_B">Section B (Subjective)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Question builder */}
      {question && section === "SECTION_A" && (
        <QuestionBuilderA
          question={question}
          onChange={setQuestion}
          onRemove={onCancel}
          onMoveUp={() => {}}
          onMoveDown={() => {}}
          isFirst
          isLast
        />
      )}
      {question && section === "SECTION_B" && (
        <QuestionBuilderB
          question={question}
          onChange={setQuestion}
          onRemove={onCancel}
          onMoveUp={() => {}}
          onMoveDown={() => {}}
          isFirst
          isLast
        />
      )}

      {question && (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-xl bg-[#002388] hover:bg-[#002388]/90 gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Save Item
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Bank Row ──────────────────────────────────────────────────────────────────

interface BankRowProps {
  bank: Bank
  onDelete: (bank: Bank) => void
}

function BankRow({ bank, onDelete }: BankRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [items, setItems] = useState<BankItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [deleteItem, setDeleteItem] = useState<BankItem | null>(null)
  const [isDeletingItem, setIsDeletingItem] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoadingItems(true)
    try {
      const res = await fetch(`/api/lecturer/question-banks/${bank.id}/items`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setItems(data)
    } catch {
      toast.error("Failed to load items")
    } finally {
      setLoadingItems(false)
    }
  }, [bank.id])

  const handleExpand = () => {
    if (!expanded) fetchItems()
    setExpanded((v) => !v)
  }

  const handleItemAdded = () => {
    setShowAddForm(false)
    fetchItems()
  }

  const handleDeleteItem = async () => {
    if (!deleteItem) return
    setIsDeletingItem(true)
    try {
      const res = await fetch(
        `/api/lecturer/question-banks/${bank.id}/items/${deleteItem.id}`,
        { method: "DELETE" }
      )
      if (!res.ok) throw new Error()
      toast.success("Item deleted")
      setDeleteItem(null)
      setItems((prev) => prev.filter((i) => i.id !== deleteItem.id))
    } catch {
      toast.error("Failed to delete item")
    } finally {
      setIsDeletingItem(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Bank header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={handleExpand}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
          )}
          <BookOpen className="h-4 w-4 text-[#002388] shrink-0" />
          <span className="font-semibold text-slate-900 truncate">{bank.title}</span>
          {bank.course && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border bg-blue-50 text-blue-700 border-blue-200 shrink-0">
              {bank.course.code}
            </span>
          )}
          <span className="text-xs text-slate-400 shrink-0">
            {bank._count.items} {bank._count.items === 1 ? "item" : "items"}
          </span>
        </button>
        <Button
          type="button"
          variant="destructive"
          size="icon-sm"
          onClick={() => onDelete(bank)}
          title="Delete bank"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-4 space-y-4 bg-slate-50/50">
          {loadingItems ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : items.length === 0 && !showAddForm ? (
            <p className="text-sm text-slate-400 text-center py-4">
              No items yet. Add your first question below.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-slate-200 bg-white p-3 flex items-start gap-3"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                          item.section === "SECTION_A"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-purple-50 text-purple-700 border-purple-200"
                        }`}
                      >
                        {item.section === "SECTION_A" ? "Section A" : "Section B"}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {item.marks} {item.marks === 1 ? "mark" : "marks"}
                      </span>
                      {item.answerType && (
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          {item.answerType.replace("_", " ")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 line-clamp-2">{item.body}</p>
                    {item.rubricCriteria.length > 0 && (
                      <p className="text-[10px] text-slate-400">
                        {item.rubricCriteria.length} rubric {item.rubricCriteria.length === 1 ? "criterion" : "criteria"}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    onClick={() => setDeleteItem(item)}
                    title="Delete item"
                    className="shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {showAddForm ? (
            <AddItemForm
              bankId={bank.id}
              onAdded={handleItemAdded}
              onCancel={() => setShowAddForm(false)}
            />
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="rounded-xl border-dashed border-[#002388]/30 text-[#002388] text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </Button>
          )}
        </div>
      )}

      {/* Delete item confirmation */}
      <ConfirmModal
        open={!!deleteItem}
        title="Delete Item?"
        description={`Are you sure you want to delete this question from the bank? This cannot be undone.`}
        confirmText="Delete Item"
        isDestructive
        isLoading={isDeletingItem}
        onConfirm={handleDeleteItem}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  )
}

// ─── Create Bank Form ──────────────────────────────────────────────────────────

interface CreateBankFormProps {
  courses: LecturerCourse[]
  onCreated: (bank: Bank) => void
  onCancel: () => void
}

function CreateBankForm({ courses, onCreated, onCancel }: CreateBankFormProps) {
  const [title, setTitle] = useState("")
  const [courseId, setCourseId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error("Bank title is required")
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/lecturer/question-banks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          courseId: courseId ? parseInt(courseId) : null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create bank")
      }
      const bank = await res.json()
      toast.success("Question bank created")
      onCreated({ ...bank, course: null, _count: { items: 0 } })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create bank")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#002388]/20 bg-blue-50/30 p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">New Question Bank</p>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="text-slate-500">
          Cancel
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Bank Title <span className="text-red-500">*</span>
          </Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Data Structures Midterm Pool"
            className="rounded-xl border-slate-200 focus-visible:ring-[#002388]"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Course (optional)
          </Label>
          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger className="w-full rounded-xl border-slate-200">
              <SelectValue placeholder="No course filter" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.code} — {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-[#002388] hover:bg-[#002388]/90 gap-1.5"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Create Bank
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function QuestionBankClient() {
  const router = useRouter()
  const [banks, setBanks] = useState<Bank[]>([])
  const [courses, setCourses] = useState<LecturerCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Bank | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchBanks = useCallback(async () => {
    try {
      const res = await fetch("/api/lecturer/question-banks")
      if (!res.ok) throw new Error()
      const data = await res.json()
      setBanks(data)
    } catch {
      toast.error("Failed to load question banks")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBanks()
    fetch("/api/lecturer/courses")
      .then((r) => r.json())
      .then((data: LecturerCourse[]) => setCourses(data))
      .catch(() => {})
  }, [fetchBanks])

  const handleBankCreated = (bank: Bank) => {
    setBanks((prev) => [bank, ...prev])
    setShowCreateForm(false)
    router.refresh()
  }

  const handleDeleteBank = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/lecturer/question-banks/${deleteTarget.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      toast.success("Question bank deleted")
      setBanks((prev) => prev.filter((b) => b.id !== deleteTarget.id))
      setDeleteTarget(null)
      router.refresh()
    } catch {
      toast.error("Failed to delete bank")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowCreateForm(true)}
          disabled={showCreateForm}
          className="rounded-xl bg-[#002388] hover:bg-[#002388]/90 gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Create Bank
        </Button>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <CreateBankForm
          courses={courses}
          onCreated={handleBankCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Banks list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : banks.length === 0 && !showCreateForm ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-500">No question banks yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Create a bank to store reusable questions for your assessments.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {banks.map((bank) => (
            <BankRow key={bank.id} bank={bank} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {/* Delete bank confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Question Bank?"
        description={`Are you sure you want to delete "${deleteTarget?.title}" and all its items? This cannot be undone.`}
        confirmText="Delete Bank"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleDeleteBank}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
