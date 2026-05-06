"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Zap,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type CriterionFeedback = {
  criterion: string
  awarded: number
  max: number
  justification: string
}

type QuestionDetail = {
  id: number
  order: number
  body: string
  marks: number
  sectionName: string
  sectionType: string
  answerType: string | null
  options: unknown
  correctOption: number | null
  rubricCriteria: { description: string; maxMarks: number; order: number }[]
  answer: {
    answerText: string | null
    selectedOption: number | null
    fileUrl: string | null
  } | null
  feedback: {
    totalScore: number
    maxScore: number
    flag: string
    flagReason: string
    bedrockError: boolean
    criteriaFeedback: CriterionFeedback[]
  } | null
}

type AttemptDetail = {
  attemptId: number
  attemptNumber: number
  status: string
  score: number | null
  totalMarks: number
  startedAt: string
  submittedAt: string | null
  student: { name: string | null; email: string }
  plagiarismFlagged: boolean
  gradedAt: string | null
  errorNotes: string
  questions: QuestionDetail[]
}

interface Props {
  open: boolean
  assessmentId: number
  attemptId: number | null
  studentName: string
  onClose: () => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0
  const color =
    pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-amber-400" : "bg-red-400"
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-semibold text-slate-500 tabular-nums w-8 text-right">
        {pct}%
      </span>
    </div>
  )
}

// ─── MCQ Question ─────────────────────────────────────────────────────────────

function McqQuestion({ q }: { q: QuestionDetail }) {
  const options = Array.isArray(q.options) ? (q.options as string[]) : []
  const selected = q.answer?.selectedOption ?? null
  const correct = q.correctOption ?? null
  const isCorrect = selected !== null && selected === correct

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt, i) => {
          const isSelected = selected === i
          const isCorrectOpt = correct === i
          let cls =
            "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
          if (isCorrectOpt)
            cls += " border-green-200 bg-green-50 text-green-800"
          else if (isSelected && !isCorrectOpt)
            cls += " border-red-200 bg-red-50 text-red-700"
          else cls += " border-slate-100 bg-slate-50 text-slate-600"

          return (
            <div key={i} className={cls + " w-full"}>
              <span className="shrink-0 font-semibold text-[11px] mt-0.5 w-4">
                {String.fromCharCode(65 + i)}.
              </span>
              <span className="flex-1">{opt}</span>
              {isCorrectOpt && (
                <CheckCircle2 size={14} className="shrink-0 text-green-600 mt-0.5" />
              )}
              {isSelected && !isCorrectOpt && (
                <XCircle size={14} className="shrink-0 text-red-500 mt-0.5" />
              )}
            </div>
          )
        })}
      </div>
      {selected === null && (
        <p className="text-xs text-slate-400 italic">No answer selected</p>
      )}
      <div className="flex items-center gap-2">
        {isCorrect ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
            <CheckCircle2 size={12} /> Correct — {q.marks} / {q.marks} marks
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
            <XCircle size={12} /> Incorrect — 0 / {q.marks} marks
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Subjective Question ──────────────────────────────────────────────────────

function SubjectiveQuestion({ q }: { q: QuestionDetail }) {
  const [expanded, setExpanded] = useState(true)
  const fb = q.feedback

  return (
    <div className="space-y-3">
      {/* Student answer */}
      {q.answer?.fileUrl ? (
        <a
          href={q.answer.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-[#002388]/20 bg-[#f0f3ff] px-3 py-2 text-sm font-medium text-[#002388] hover:bg-[#e0e7ff] transition-colors"
        >
          <FileText size={14} />
          View submitted file
        </a>
      ) : q.answer?.answerText ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
          {q.answer.answerText}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">No answer provided</p>
      )}

      {/* AI feedback */}
      {fb ? (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          {/* Score header */}
          <div
            className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer select-none"
            onClick={() => setExpanded((v) => !v)}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-sm font-semibold text-slate-800 shrink-0">
                {fb.totalScore} / {fb.maxScore}
                <span className="text-xs font-normal text-slate-400 ml-1">marks</span>
              </span>
              <div className="flex-1 min-w-0">
                <ScoreBar score={fb.totalScore} max={fb.maxScore} />
              </div>
            </div>
            <div className="flex items-center gap-2 ml-3 shrink-0">
              {fb.bedrockError && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  <Zap size={9} /> AI error
                </span>
              )}
              {fb.flag && (
                <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                  <ShieldAlert size={9} /> {fb.flag}
                </span>
              )}
              {expanded ? (
                <ChevronUp size={14} className="text-slate-400" />
              ) : (
                <ChevronDown size={14} className="text-slate-400" />
              )}
            </div>
          </div>

          {expanded && (
            <div className="divide-y divide-slate-100">
              {/* Flag reason */}
              {fb.flagReason && (
                <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50">
                  <AlertTriangle size={13} className="shrink-0 text-red-500 mt-0.5" />
                  <p className="text-xs text-red-700">{fb.flagReason}</p>
                </div>
              )}

              {/* Per-criterion breakdown */}
              {fb.criteriaFeedback.length > 0 ? (
                fb.criteriaFeedback.map((c, i) => (
                  <div key={i} className="px-4 py-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-700 flex-1">
                        {c.criterion}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 shrink-0 tabular-nums">
                        {c.awarded} / {c.max}
                      </span>
                    </div>
                    <ScoreBar score={c.awarded} max={c.max} />
                    {c.justification && (
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {c.justification}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3">
                  <p className="text-xs text-slate-400 italic">No criterion breakdown available.</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-xs text-slate-400 italic">
          Not yet graded by AI
        </div>
      )}
    </div>
  )
}

// ─── Main Sheet ───────────────────────────────────────────────────────────────

export default function StudentAttemptSheet({
  open,
  assessmentId,
  attemptId,
  studentName,
  onClose,
}: Props) {
  const [detail, setDetail] = useState<AttemptDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !attemptId) return
    setDetail(null)
    setError(null)
    setLoading(true)

    fetch(`/api/lecturer/assessments/${assessmentId}/attempts/${attemptId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load attempt")
        return r.json()
      })
      .then((d) => setDetail(d))
      .catch(() => setError("Could not load attempt details. Please try again."))
      .finally(() => setLoading(false))
  }, [open, assessmentId, attemptId])

  // Group questions by section
  const sections = detail
    ? Array.from(
        detail.questions.reduce((map, q) => {
          if (!map.has(q.sectionName)) map.set(q.sectionName, [])
          map.get(q.sectionName)!.push(q)
          return map
        }, new Map<string, QuestionDetail[]>())
      )
    : []

  const scorePct =
    detail?.score != null && detail.totalMarks > 0
      ? Math.round((detail.score / detail.totalMarks) * 100)
      : null

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="flex flex-col w-full sm:max-w-2xl p-0 gap-0"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-slate-100 shrink-0">
          <SheetTitle className="text-base">{studentName}</SheetTitle>
          <SheetDescription>
            {detail
              ? `Attempt ${detail.attemptNumber} · submitted ${
                  detail.submittedAt
                    ? format(new Date(detail.submittedAt), "MMM d, yyyy HH:mm")
                    : "—"
                }`
              : "Loading attempt…"}
          </SheetDescription>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={24} className="animate-spin text-slate-300" />
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-24">
              <p className="text-sm text-slate-400">{error}</p>
            </div>
          )}

          {detail && (
            <div className="space-y-0">
              {/* Score summary bar */}
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-6 flex-wrap">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                    Score
                  </p>
                  {detail.score != null ? (
                    <p className="text-2xl font-semibold text-slate-900">
                      {detail.score}
                      <span className="text-sm font-normal text-slate-400 ml-1">
                        / {detail.totalMarks}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Not graded</p>
                  )}
                </div>

                {scorePct !== null && (
                  <div className="flex-1 min-w-32">
                    <ScoreBar score={detail.score!} max={detail.totalMarks} />
                  </div>
                )}

                {detail.plagiarismFlagged && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                    <ShieldAlert size={12} />
                    Plagiarism flagged
                  </span>
                )}

                {detail.gradedAt && (
                  <p className="text-[11px] text-slate-400 ml-auto">
                    Graded {format(new Date(detail.gradedAt), "MMM d, HH:mm")}
                  </p>
                )}
              </div>

              {/* Error notes from grader */}
              {detail.errorNotes && (
                <div className="mx-6 mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                  <AlertTriangle size={13} className="shrink-0 text-amber-500 mt-0.5" />
                  <p className="text-xs text-amber-800">{detail.errorNotes}</p>
                </div>
              )}

              {/* Questions by section */}
              {sections.map(([sectionName, questions]) => (
                <div key={sectionName} className="mt-4">
                  {/* Section label */}
                  <div className="px-6 py-2 bg-slate-50 border-y border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                      {sectionName}
                    </p>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {questions.map((q, qi) => (
                      <div key={q.id} className="px-6 py-5 space-y-3">
                        {/* Question header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded bg-[#002388] text-white text-[10px] font-semibold mt-0.5">
                              {qi + 1}
                            </span>
                            <p className="text-sm text-slate-800 leading-relaxed">
                              {q.body}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs text-slate-400 tabular-nums">
                            {q.marks} {q.marks === 1 ? "mark" : "marks"}
                          </span>
                        </div>

                        {/* Answer + feedback */}
                        {q.sectionType === "OBJECTIVE" ? (
                          <McqQuestion q={q} />
                        ) : (
                          <SubjectiveQuestion q={q} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
