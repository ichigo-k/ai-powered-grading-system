"use client"

import { useState, useTransition, useCallback } from "react"
import { useRouter } from "next/navigation"
import { submitAttempt } from "@/lib/assessment-actions"
import type { SerializedActiveAttempt, SerializedAssessmentDetail } from "./page"
import LockdownOverlay from "@/components/student/LockdownOverlay"
import AntiCheatGuard from "@/components/student/AntiCheatGuard"
import QuestionRenderer from "@/components/student/QuestionRenderer"
import CountdownTimer from "@/components/student/CountdownTimer"
import {
  CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight,
  Send, X, BookOpen, Clock, Layers, ListChecks,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type AttemptShellProps = {
  attempt: SerializedActiveAttempt
  assessment: SerializedAssessmentDetail
  assessmentId: number
}

export type SectionWithProgress = {
  id: number
  name: string
  type: string
  requiredQuestionsCount: number | null
  questions: { id: number; order: number; body: string; marks: number; answerType: string | null; options: unknown }[]
  answeredCount: number
}

export type QuestionWithAnswer = {
  id: number; order: number; body: string; marks: number
  answerType: string | null; options: unknown; sectionType: string
  existingAnswer: { answerText: string | null; selectedOption: number | null; fileUrl: string | null } | null
}

type AnswerMap = Map<number, { answerText: string | null; selectedOption: number | null; fileUrl: string | null }>

// ─── Question Selection Screen ────────────────────────────────────────────────
// Shown when a section has requiredQuestionsCount < total questions.
// Student must pick exactly N questions before they can answer any.

function QuestionSelectionScreen({
  section,
  required,
  selectedIds,
  onToggle,
  onConfirm,
}: {
  section: SectionWithProgress
  required: number
  selectedIds: Set<number>
  onToggle: (id: number) => void
  onConfirm: () => void
}) {
  const count = selectedIds.size
  const ready = count === required

  return (
    <div className="flex-1 overflow-y-auto px-8 py-10">
      {/* Instruction banner */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-1">
          {section.name}
        </p>
        <h2 className="text-[20px] font-semibold text-[#111827] mb-1" style={{ fontFamily: "var(--font-sans,'Poppins',sans-serif)" }}>
          Choose your questions
        </h2>
        <p className="text-[14px] text-[#6b7280]" style={{ fontFamily: "var(--font-sans,'Poppins',sans-serif)" }}>
          Select exactly <strong className="text-[#111827]">{required}</strong> questions to answer from the{" "}
          {section.questions.length} below. You cannot change your selection once you begin.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 w-48 rounded-full bg-[#f3f4f6] overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all ${ready ? "bg-[#16a34a]" : "bg-[#002388]"}`}
              style={{ width: `${(count / required) * 100}%` }}
            />
          </div>
          <span className={`text-[12px] font-semibold ${ready ? "text-[#16a34a]" : "text-[#374151]"}`}>
            {count} / {required} selected
          </span>
        </div>
      </div>

      {/* Question list */}
      <div className="flex flex-col divide-y divide-[#f3f4f6]">
        {section.questions.map((q) => {
          const checked = selectedIds.has(q.id)
          const disabled = !checked && count >= required
          return (
            <label
              key={q.id}
              className={[
                "flex items-start gap-4 py-4 cursor-pointer transition-colors",
                disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-[#fafafa]",
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => !disabled && onToggle(q.id)}
                className="sr-only"
              />
              {/* Custom checkbox */}
              <div className={[
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all",
                checked
                  ? "border-[#002388] bg-[#002388]"
                  : "border-[#d1d5db] bg-white",
              ].join(" ")}>
                {checked && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af]">
                    Q{q.order}
                  </span>
                  <span className="text-[11px] text-[#9ca3af]">{q.marks} {q.marks === 1 ? "mark" : "marks"}</span>
                </div>
                <p className="mt-0.5 text-[15px] text-[#374151] leading-relaxed" style={{ fontFamily: "'Georgia','Times New Roman',serif" }}>
                  {q.body}
                </p>
              </div>
            </label>
          )
        })}
      </div>

      {/* Confirm button — sticky at bottom */}
      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={onConfirm}
          disabled={!ready}
          className="flex items-center gap-2 rounded-lg bg-[#002388] px-6 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#0B4DBB] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ListChecks size={15} />
          Confirm selection &amp; begin answering
        </button>
        {!ready && (
          <span className="text-[12px] text-[#9ca3af]">
            Select {required - count} more question{required - count !== 1 ? "s" : ""} to continue
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Submit Dialog ────────────────────────────────────────────────────────────

function SubmitDialog({ sections, totalRequired, answeredCount, isPending, onConfirm, onCancel }: {
  sections: SectionWithProgress[]
  totalRequired: number
  answeredCount: number
  isPending: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const unanswered = totalRequired - answeredCount
  const allAnswered = unanswered <= 0

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-[#e5e7eb] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#e5e7eb]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${allAnswered ? "bg-[#eff6ff]" : "bg-[#fffbeb]"}`}>
                {allAnswered ? <Send size={17} className="text-[#1d4ed8]" /> : <AlertTriangle size={17} className="text-[#d97706]" />}
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-[#111827]">
                  {allAnswered ? "Submit assessment?" : "Unanswered questions"}
                </h2>
                <p className="text-xs text-[#6b7280] mt-0.5">
                  {allAnswered ? "This action cannot be undone." : "You still have required questions unanswered."}
                </p>
              </div>
            </div>
            <button type="button" onClick={onCancel}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#9ca3af] hover:text-[#374151] hover:bg-[#f3f4f6] transition-colors" aria-label="Close">
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6b7280]">Required questions answered</span>
              <span className={`font-semibold ${allAnswered ? "text-[#16a34a]" : "text-[#d97706]"}`}>
                {Math.min(answeredCount, totalRequired)} / {totalRequired}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#f3f4f6] overflow-hidden">
              <div className={`h-1.5 rounded-full transition-all ${allAnswered ? "bg-[#16a34a]" : "bg-[#f59e0b]"}`}
                style={{ width: `${totalRequired > 0 ? Math.min((answeredCount / totalRequired) * 100, 100) : 0}%` }} />
            </div>
          </div>

          <div className="rounded-lg border border-[#e5e7eb] divide-y divide-[#f3f4f6] overflow-hidden">
            {sections.map((section) => {
              const required = section.requiredQuestionsCount ?? section.questions.length
              const done = section.answeredCount
              const complete = done >= required
              return (
                <div key={section.id} className="flex items-center justify-between px-4 py-2.5 bg-white">
                  <span className="text-sm text-[#374151] truncate flex-1 mr-3">{section.name}</span>
                  <span className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold ${complete ? "text-[#16a34a]" : "text-[#d97706]"}`}>
                    {done}/{required}
                    {complete && <CheckCircle2 size={12} />}
                  </span>
                </div>
              )
            })}
          </div>

          {!allAnswered && (
            <div className="flex items-start gap-2.5 rounded-lg border border-[#fde68a] bg-[#fffbeb] px-4 py-3">
              <AlertTriangle size={14} className="shrink-0 text-[#d97706] mt-0.5" />
              <p className="text-sm text-[#92400e]">
                <strong>{Math.max(0, unanswered)}</strong> required question{unanswered !== 1 ? "s" : ""} still unanswered.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2.5 border-t border-[#e5e7eb] px-6 py-4 bg-[#f9fafb]">
          <button type="button" onClick={onCancel} disabled={isPending}
            className="flex-1 rounded-lg border border-[#d1d5db] bg-white px-4 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#f9fafb] transition-colors disabled:opacity-50">
            Go back
          </button>
          <button type="button" onClick={onConfirm} disabled={isPending}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${allAnswered ? "bg-[#002388] hover:bg-[#0B4DBB]" : "bg-[#d97706] hover:bg-[#b45309]"}`}>
            {isPending
              ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />Submitting…</>
              : <><Send size={13} />{allAnswered ? "Submit" : "Submit anyway"}</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Question Palette ─────────────────────────────────────────────────────────

function QuestionPalette({ questions, answeredIds, selectedIds, activeIndex, onSelect }: {
  questions: { id: number; order: number }[]
  answeredIds: Set<number>
  selectedIds: Set<number> | null
  activeIndex: number
  onSelect: (index: number) => void
}) {
  return (
    <div className="grid grid-cols-5 gap-1">
      {questions.map((q, i) => {
        const isActive = i === activeIndex
        const isAnswered = answeredIds.has(q.id)
        const isLocked = selectedIds !== null && !selectedIds.has(q.id)
        return (
          <button key={q.id} type="button" onClick={() => onSelect(i)} title={`Question ${q.order}`}
            disabled={isLocked}
            className={["flex h-7 w-full items-center justify-center rounded text-[11px] font-semibold transition-all",
              isLocked ? "bg-[#fafafa] text-[#d1d5db] cursor-not-allowed"
              : isActive ? "bg-[#002388] text-white"
              : isAnswered ? "bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0] hover:bg-[#bbf7d0]"
              : "bg-[#f3f4f6] text-[#6b7280] border border-[#e5e7eb] hover:bg-[#e5e7eb]",
            ].join(" ")}
          >
            {q.order}
          </button>
        )
      })}
    </div>
  )
}
// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AttemptShell({ attempt, assessment, assessmentId }: AttemptShellProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const firstSection = assessment.sections[0]
  const [activeSectionId, setActiveSectionId] = useState<number>(firstSection?.id ?? 0)
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)

  // selectedQIds: per-section map of chosen question IDs (only for quota sections)
  // null means "no quota" — all questions are open
  // Set means "confirmed selection" — only those IDs are answerable
  // undefined means "not yet selected" — show selection screen
  const [sectionSelections, setSectionSelections] = useState<Map<number, Set<number> | undefined>>(() => {
    const map = new Map<number, Set<number> | undefined>()
    for (const s of assessment.sections) {
      const required = s.requiredQuestionsCount
      if (required !== null && required < s.questions.length) {
        // Check if student already has answers in this section (resuming attempt)
        const answeredInSection = s.questions.filter((q) => {
          const a = attempt.answers.find((a) => a.questionId === q.id)
          return a && (a.answerText !== null || a.selectedOption !== null || a.fileUrl !== null)
        })
        if (answeredInSection.length > 0) {
          // Pre-populate selection from existing answers
          map.set(s.id, new Set(answeredInSection.map((q) => q.id)))
        } else {
          map.set(s.id, undefined) // needs selection
        }
      }
      // No entry = no quota = all open
    }
    return map
  })

  // Pending selection state (before confirming)
  const [pendingSelection, setPendingSelection] = useState<Set<number>>(new Set())

  const [answers, setAnswers] = useState<AnswerMap>(() => {
    const map: AnswerMap = new Map()
    for (const a of attempt.answers) {
      map.set(a.questionId, { answerText: a.answerText, selectedOption: a.selectedOption, fileUrl: a.fileUrl })
    }
    return map
  })

  const isSecured = assessment.type === "EXAM" || assessment.type === "QUIZ"

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function hasAnswerValue(a: { answerText: string | null; selectedOption: number | null; fileUrl: string | null } | undefined) {
    return a && (a.answerText !== null || a.selectedOption !== null || a.fileUrl !== null)
  }

  // For a quota section: returns the confirmed Set, or undefined if not yet selected
  function getSectionSelectedIds(sectionId: number): Set<number> | null | undefined {
    if (!sectionSelections.has(sectionId)) return null // no quota
    return sectionSelections.get(sectionId) // undefined = needs selection, Set = confirmed
  }

  const sectionsWithProgress: SectionWithProgress[] = assessment.sections.map((s) => ({
    ...s,
    answeredCount: s.questions.filter((q) => hasAnswerValue(answers.get(q.id))).length,
  }))

  const activeSection = assessment.sections.find((s) => s.id === activeSectionId) ?? firstSection
  const activeSectionRequired = activeSection?.requiredQuestionsCount ?? null
  const activeSectionHasQuota = activeSectionRequired !== null && activeSectionRequired < (activeSection?.questions.length ?? 0)

  // Is the active section in "needs selection" mode?
  const activeSectionSelection = activeSection ? getSectionSelectedIds(activeSection.id) : null
  const needsSelection = activeSectionHasQuota && activeSectionSelection === undefined

  // Questions visible in the palette (only selected ones for quota sections)
  const visibleQuestions = activeSection
    ? activeSectionSelection instanceof Set
      ? activeSection.questions.filter((q) => (activeSectionSelection as Set<number>).has(q.id))
      : activeSection.questions
    : []

  const activeQuestion: QuestionWithAnswer | null = activeSection && visibleQuestions.length > 0
    ? (() => {
        const q = visibleQuestions[activeQuestionIndex]
        if (!q) return null
        return { ...q, sectionType: activeSection.type, existingAnswer: answers.get(q.id) ?? null }
      })()
    : null

  const totalQuestionsInSection = visibleQuestions.length

  const totalRequired = assessment.sections.reduce((sum, s) => sum + (s.requiredQuestionsCount ?? s.questions.length), 0)
  const totalAnsweredAll = sectionsWithProgress.reduce((sum, s) => sum + Math.min(s.answeredCount, s.requiredQuestionsCount ?? s.questions.length), 0)

  const answeredIdsInSection = new Set(
    visibleQuestions.filter((q) => hasAnswerValue(answers.get(q.id))).map((q) => q.id)
  )

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function handleSectionSelect(sectionId: number) {
    setActiveSectionId(sectionId)
    setActiveQuestionIndex(0)
    setPendingSelection(new Set())
  }

  function handleTogglePending(qId: number) {
    setPendingSelection((prev) => {
      const next = new Set(prev)
      if (next.has(qId)) next.delete(qId)
      else next.add(qId)
      return next
    })
  }

  function handleConfirmSelection() {
    if (!activeSection) return
    setSectionSelections((prev) => new Map(prev).set(activeSection.id, new Set(pendingSelection)))
    setActiveQuestionIndex(0)
  }

  const handleAnswerChange = useCallback((
    questionId: number,
    payload: { answerText: string | null; selectedOption: number | null; fileUrl: string | null }
  ) => {
    setAnswers((prev) => new Map(prev).set(questionId, payload))
  }, [])

  async function handleExpire() {
    await submitAttempt(attempt.id, "TIMED_OUT")
    router.push(`/student/assessments/${assessmentId}`)
  }

  function handleSubmitConfirm() {
    startTransition(async () => {
      await submitAttempt(attempt.id)
      router.push(`/student/assessments/${assessmentId}`)
    })
  }

  const activeSectionIdx = assessment.sections.findIndex((s) => s.id === activeSectionId)
  const nextSection = assessment.sections[activeSectionIdx + 1]

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      <LockdownOverlay isSecured={isSecured} onSubmit={() => setShowSubmitDialog(true)} />
      <AntiCheatGuard isSecured={isSecured} attemptId={attempt.id} />

      {showSubmitDialog && (
        <SubmitDialog
          sections={sectionsWithProgress}
          totalRequired={totalRequired}
          answeredCount={totalAnsweredAll}
          isPending={isPending}
          onConfirm={handleSubmitConfirm}
          onCancel={() => setShowSubmitDialog(false)}
        />
      )}

      <div className="fixed inset-0 z-50 flex overflow-hidden bg-white">

        {/* ── Left sidebar ── */}
        <aside className="flex w-60 shrink-0 flex-col overflow-hidden border-r border-[#ebebeb] bg-white">
          {/* Title */}
          <div className="px-4 py-4 border-b border-[#ebebeb]">
            <div className="flex items-start gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#f3f4f6]">
                <BookOpen size={14} className="text-[#6b7280]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-[#111827] leading-tight">{assessment.title}</p>
                <p className="mt-0.5 text-[10px] text-[#9ca3af] uppercase tracking-wider font-medium">{assessment.type}</p>
              </div>
            </div>
          </div>

          {/* Timer */}
          {assessment.durationMinutes != null && (
            <div className="px-4 py-3 border-b border-[#ebebeb]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5 flex items-center gap-1.5">
                <Clock size={10} />Time Remaining
              </p>
              <CountdownTimer startedAt={attempt.startedAt} durationMinutes={assessment.durationMinutes} onExpire={handleExpire} />
            </div>
          )}

          {/* Sections */}
          <div className="px-3 py-3 border-b border-[#ebebeb]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-2 px-1 flex items-center gap-1.5">
              <Layers size={10} />Sections
            </p>
            <div className="flex flex-col gap-0.5">
              {sectionsWithProgress.map((section) => {
                const isActive = section.id === activeSectionId
                const required = section.requiredQuestionsCount ?? section.questions.length
                const complete = section.answeredCount >= required
                const sel = getSectionSelectedIds(section.id)
                const pending = sel === undefined // needs selection
                return (
                  <button key={section.id} type="button" onClick={() => handleSectionSelect(section.id)}
                    className={["flex items-center justify-between gap-2 rounded-md px-3 py-2 text-left transition-colors",
                      isActive ? "bg-[#f3f4f6] text-[#111827]" : "text-[#6b7280] hover:bg-[#f9fafb] hover:text-[#374151]",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {complete
                        ? <CheckCircle2 size={12} className="shrink-0 text-[#16a34a]" />
                        : pending
                        ? <ListChecks size={12} className="shrink-0 text-[#d97706]" />
                        : <div className={`h-2.5 w-2.5 shrink-0 rounded-full border ${isActive ? "border-[#374151]" : "border-[#d1d5db]"}`} />
                      }
                      <span className="truncate text-[12px] font-medium">{section.name}</span>
                    </div>
                    <span className="shrink-0 text-[11px] text-[#9ca3af]">
                      {pending ? "choose" : `${section.answeredCount}/${required}`}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Question palette — only shown when not in selection mode */}
          {!needsSelection && (
            <div className="flex-1 overflow-y-auto px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-2 px-1">Questions</p>
              {activeSection && (
                <QuestionPalette
                  questions={activeSection.questions}
                  answeredIds={answeredIdsInSection}
                  selectedIds={activeSectionSelection instanceof Set ? activeSectionSelection : null}
                  activeIndex={activeQuestionIndex}
                  onSelect={setActiveQuestionIndex}
                />
              )}
              <div className="mt-3 flex flex-col gap-1.5 px-1">
                {[
                  { color: "bg-[#111827]", label: "Current" },
                  { color: "bg-[#dcfce7] border border-[#bbf7d0]", label: "Answered" },
                  { color: "bg-[#f3f4f6] border border-[#e5e7eb]", label: "Not answered" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2 text-[10px] text-[#9ca3af]">
                    <div className={`h-2 w-2 rounded ${color}`} />{label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {needsSelection && <div className="flex-1" />}

          {/* Submit */}
          <div className="border-t border-[#ebebeb] p-3">
            <button type="button" onClick={() => setShowSubmitDialog(true)} disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#002388] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#0B4DBB] disabled:opacity-50">
              <Send size={13} />Submit Assessment
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex flex-1 flex-col overflow-hidden bg-white">

          {/* Top bar */}
          <header className="flex items-center justify-between border-b border-[#ebebeb] px-8 py-3 shrink-0">
            <div className="flex items-center gap-3">
              {activeSection && (
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                  activeSection.type === "OBJECTIVE" ? "bg-[#eff6ff] text-[#1d4ed8]" : "bg-[#f5f3ff] text-[#6d28d9]"
                }`}>
                  {activeSection.type}
                </span>
              )}
              <span className="text-[13px] font-medium text-[#374151]">{activeSection?.name}</span>
              {!needsSelection && (
                <>
                  <span className="text-[#e5e7eb]">·</span>
                  <span className="text-[12px] text-[#9ca3af]">{activeQuestionIndex + 1} / {totalQuestionsInSection}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              {activeSectionHasQuota && !needsSelection && (
                <span className="text-[12px] text-[#6b7280]">
                  Answering <strong className="text-[#374151]">{activeSectionRequired}</strong> of {activeSection?.questions.length} questions
                </span>
              )}
              <div className="hidden sm:flex items-center gap-2">
                <div className="h-1 w-24 rounded-full bg-[#f3f4f6] overflow-hidden">
                  <div className="h-1 rounded-full bg-[#002388] transition-all"
                    style={{ width: `${totalRequired > 0 ? Math.min((totalAnsweredAll / totalRequired) * 100, 100) : 0}%` }} />
                </div>
                <span className="text-[11px] text-[#9ca3af]">{totalAnsweredAll}/{totalRequired}</span>
              </div>
            </div>
          </header>

          {/* ── Selection screen OR question area ── */}
          {needsSelection && activeSection ? (
            <QuestionSelectionScreen
              section={{ ...activeSection, answeredCount: 0 }}
              required={activeSectionRequired!}
              selectedIds={pendingSelection}
              onToggle={handleTogglePending}
              onConfirm={handleConfirmSelection}
            />
          ) : (
            <>
              {/* Question area — full width, no centering */}
              <div className="flex-1 overflow-y-auto">
                <div className="w-full px-8 py-10">
                  {activeQuestion ? (
                    <QuestionRenderer
                      key={activeQuestion.id}
                      question={activeQuestion}
                      attemptId={attempt.id}
                      onAnswerChange={handleAnswerChange}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <BookOpen size={24} className="text-[#d1d5db]" />
                      <p className="mt-3 text-sm text-[#9ca3af]">No questions in this section.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom nav */}
              <footer className="flex items-center justify-between border-t border-[#ebebeb] px-8 py-3 shrink-0">
                <button type="button"
                  onClick={() => setActiveQuestionIndex((i) => Math.max(0, i - 1))}
                  disabled={activeQuestionIndex === 0}
                  className="flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] px-4 py-2 text-[13px] font-medium text-[#374151] hover:bg-[#f9fafb] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={15} />Previous
                </button>

                <div className="hidden sm:flex items-center gap-1">
                  {visibleQuestions.map((q, i) => (
                    <button key={q.id} type="button" onClick={() => setActiveQuestionIndex(i)}
                      className={`rounded-full transition-all ${
                        i === activeQuestionIndex ? "w-5 h-1.5 bg-[#111827]"
                        : answeredIdsInSection.has(q.id) ? "w-1.5 h-1.5 bg-[#86efac]"
                        : "w-1.5 h-1.5 bg-[#e5e7eb]"
                      }`}
                      aria-label={`Go to question ${i + 1}`}
                    />
                  ))}
                </div>

                {activeQuestionIndex < totalQuestionsInSection - 1 ? (
                  <button type="button"
                    onClick={() => setActiveQuestionIndex((i) => Math.min(totalQuestionsInSection - 1, i + 1))}
                    className="flex items-center gap-1.5 rounded-lg bg-[#002388] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#0B4DBB] transition-colors"
                  >
                    Next<ChevronRight size={15} />
                  </button>
                ) : nextSection ? (
                  <button type="button" onClick={() => handleSectionSelect(nextSection.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-[#002388] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#0B4DBB] transition-colors"
                  >
                    Next Section<ChevronRight size={15} />
                  </button>
                ) : (
                  <button type="button" onClick={() => setShowSubmitDialog(true)} disabled={isPending}
                    className="flex items-center gap-1.5 rounded-lg bg-[#002388] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#0B4DBB] transition-colors disabled:opacity-50"
                  >
                    <Send size={13} />Submit
                  </button>
                )}
              </footer>
            </>
          )}
        </main>
      </div>
    </>
  )
}
