"use client"

import Link from "next/link"
import { useState, useMemo, useTransition } from "react"
import { ArrowLeft, ClipboardList, ArrowUpDown, Send, Eye } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js"
import { Bar, Doughnut } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AssessmentResultsData {
  id: number
  title: string
  type: "EXAM" | "QUIZ" | "ASSIGNMENT"
  status: "PUBLISHED" | "CLOSED"
  courseCode: string
  courseTitle: string
  totalMarks: number
  totalQuestions: number
  startsAt: Date
  endsAt: Date
  gradingStatus: "NOT_GRADED" | "GRADING" | "GRADED"
  resultsReleased: boolean
  enrolledStudents: Array<{
    id: number
    name: string
    email: string
    className: string
  }>
  submissions: Array<{
    studentId: number
    score: number | null
    submittedAt: Date | null
    status: "SUBMITTED" | "GRADED" | "PENDING"
  }>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const typeBadge: Record<string, string> = {
  EXAM: "bg-red-50 text-red-700 border-red-200",
  QUIZ: "bg-amber-50 text-amber-700 border-amber-200",
  ASSIGNMENT: "bg-blue-50 text-blue-700 border-blue-200",
}

const statusBadge: Record<string, { cls: string; dot: string }> = {
  PUBLISHED: { cls: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
  CLOSED: { cls: "bg-slate-200 text-slate-500 border-slate-300", dot: "bg-slate-400" },
}

function Chip({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${className}`}>
      {children}
    </span>
  )
}

function StatTile({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-4 border-r border-slate-100 last:border-r-0">
      <span className="text-xl font-semibold text-slate-900">{value}</span>
      <span className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">{label}</span>
    </div>
  )
}

type SortKey = "name" | "class" | "status" | "score" | "submittedAt"
type SortDir = "asc" | "desc"

// ─── Component ────────────────────────────────────────────────────────────────

export default function AssessmentResultsView({ data }: { data: AssessmentResultsData }) {
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [search, setSearch] = useState("")
  const [isGrading, startGrading] = useTransition()
  const [isReleasing, startReleasing] = useTransition()
  const [gradingStatus, setGradingStatus] = useState(data.gradingStatus)
  const [resultsReleased, setResultsReleased] = useState(data.resultsReleased)

  const submittedCount = data.submissions.length
  const gradedCount = data.submissions.filter((s) => s.status === "GRADED").length
  const notSubmittedCount = data.enrolledStudents.length - submittedCount
  const submissionRate = data.enrolledStudents.length > 0
    ? Math.round((submittedCount / data.enrolledStudents.length) * 100)
    : 0

  const status = statusBadge[data.status] ?? statusBadge.PUBLISHED
  const submissionByStudent = new Map(data.submissions.map((s) => [s.studentId, s]))

  // Score distribution buckets for bar chart
  const scoredSubmissions = data.submissions.filter((s) => s.score != null)
  const buckets = ["0–20%", "21–40%", "41–60%", "61–80%", "81–100%"]
  const bucketCounts = [0, 0, 0, 0, 0]
  for (const sub of scoredSubmissions) {
    const pct = ((sub.score ?? 0) / data.totalMarks) * 100
    const idx = Math.min(Math.floor(pct / 20), 4)
    bucketCounts[idx]++
  }

  const barData = {
    labels: buckets,
    datasets: [{
      label: "Students",
      data: bucketCounts,
      backgroundColor: "#002388",
      borderRadius: 6,
      borderSkipped: false,
    }],
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11 }, color: "#94a3b8" } },
      y: { grid: { color: "#f1f5f9" }, border: { display: false }, ticks: { font: { size: 11 }, color: "#94a3b8", stepSize: 1 } },
    },
  }

  const doughnutData = {
    labels: ["Submitted", "Not Submitted"],
    datasets: [{
      data: [submittedCount, notSubmittedCount],
      backgroundColor: ["#002388", "#e2e8f0"],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: { parsed: number }) => ` ${ctx.parsed} students` } },
    },
  }

  // Sortable table rows
  const rows = useMemo(() => {
    const filtered = data.enrolledStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.className.toLowerCase().includes(search.toLowerCase())
    )

    return [...filtered].sort((a, b) => {
      const subA = submissionByStudent.get(a.id)
      const subB = submissionByStudent.get(b.id)
      let cmp = 0

      if (sortKey === "name") cmp = a.name.localeCompare(b.name)
      else if (sortKey === "class") cmp = a.className.localeCompare(b.className)
      else if (sortKey === "status") {
        const statusOrder = { GRADED: 0, SUBMITTED: 1, undefined: 2 }
        cmp = (statusOrder[subA?.status as keyof typeof statusOrder] ?? 2) -
              (statusOrder[subB?.status as keyof typeof statusOrder] ?? 2)
      }
      else if (sortKey === "score") cmp = (subA?.score ?? -1) - (subB?.score ?? -1)
      else if (sortKey === "submittedAt") {
        cmp = (subA?.submittedAt ? new Date(subA.submittedAt).getTime() : 0) -
              (subB?.submittedAt ? new Date(subB.submittedAt).getTime() : 0)
      }

      return sortDir === "asc" ? cmp : -cmp
    })
  }, [data.enrolledStudents, search, sortKey, sortDir, submissionByStudent])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
  }

  const SortBtn = ({ col, label }: { col: SortKey; label: string }) => (
    <button
      type="button"
      onClick={() => toggleSort(col)}
      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-800 transition-colors"
    >
      {label}
      <ArrowUpDown size={11} className={sortKey === col ? "text-[#002388]" : "text-slate-300"} />
    </button>
  )

  // Trigger grading — sets status to GRADING, external grader picks it up
  function handleStartGrading() {
    startGrading(async () => {
      const res = await fetch(`/api/lecturer/assessments/${data.id}/start-grading`, {
        method: "POST",
      })
      if (!res.ok) {
        toast.error("Failed to start grading. Please try again.")
        return
      }
      setGradingStatus("GRADING")
      toast.success("Assessment sent to grader. Results will appear as they come in.")
    })
  }

  // Release results to students
  function handleReleaseResults() {
    startReleasing(async () => {
      const res = await fetch(`/api/lecturer/assessments/${data.id}/release-results`, {
        method: "POST",
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        toast.error(body.error === "Grading not complete"
          ? "Grading is not complete yet."
          : "Failed to release results.")
        return
      }
      setResultsReleased(true)
      toast.success("Results released — students can now see their scores.")
    })
  }

  return (
    <div className="mx-auto max-w-5xl pb-16 space-y-6">

      {/* Top nav */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link
          href={`/lecturer/assessments/${data.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#002388] transition-colors"
        >
          <ArrowLeft size={13} />
          Back to Assessment
        </Link>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Grading progress pill */}
          {gradingStatus !== "NOT_GRADED" && (
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
              gradingStatus === "GRADED"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-amber-50 border-amber-200 text-amber-700"
            }`}>
              {gradingStatus === "GRADING" && (
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              )}
              {gradingStatus === "GRADED" && (
                <span className="h-2 w-2 rounded-full bg-green-500" />
              )}
              {gradingStatus === "GRADING" ? "Grading in progress…" : "Grading complete"}
              <span className="font-normal opacity-70">
                {gradedCount} / {submittedCount} graded
              </span>
            </div>
          )}

          {/* Grade Assessment button — only when not yet triggered */}
          {gradingStatus === "NOT_GRADED" && submittedCount > 0 && (
            <button
              type="button"
              onClick={handleStartGrading}
              disabled={isGrading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#002388] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B4DBB] transition-colors disabled:opacity-50"
            >
              {isGrading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Starting…
                </>
              ) : (
                <>
                  <Send size={14} />
                  Grade Assessment
                </>
              )}
            </button>
          )}

          {/* Release Results button — only when grading done and not yet released */}
          {gradingStatus === "GRADED" && !resultsReleased && (
            <button
              type="button"
              onClick={handleReleaseResults}
              disabled={isReleasing}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isReleasing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Releasing…
                </>
              ) : (
                <>
                  <Eye size={14} />
                  Release Results
                </>
              )}
            </button>
          )}

          {/* Released badge */}
          {resultsReleased && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Results released to students
            </span>
          )}
        </div>
      </div>

      {/* Hero card */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="p-6 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Chip className={typeBadge[data.type]}>{data.type}</Chip>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border ${status.cls}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {data.status}
            </span>
          </div>
          <h1 className="text-xl font-semibold text-slate-900">{data.title}</h1>
          <p className="text-sm text-slate-500">{data.courseCode} — {data.courseTitle}</p>
          <p className="text-xs text-slate-400">
            {format(new Date(data.startsAt), "MMM d, yyyy HH:mm")} — {format(new Date(data.endsAt), "MMM d, yyyy HH:mm")}
          </p>
        </div>
        <div className="border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
          <StatTile value={data.enrolledStudents.length} label="Enrolled" />
          <StatTile value={submittedCount} label="Submitted" />
          <StatTile value={gradedCount} label="Graded" />
          <StatTile value={`${submissionRate}%`} label="Submission Rate" />
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">

        {/* Score distribution bar chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.12em] mb-4">Score Distribution</p>
          {scoredSubmissions.length === 0 ? (
            <div className="h-40 flex items-center justify-center">
              <p className="text-sm text-slate-400">No scores yet</p>
            </div>
          ) : (
            <div className="h-44">
              <Bar data={barData} options={barOptions} />
            </div>
          )}
        </div>

        {/* Submission doughnut */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col items-center justify-center gap-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.12em] self-start">Submissions</p>
          <div className="relative h-32 w-32">
            <Doughnut data={doughnutData} options={doughnutOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-semibold text-slate-900">{submissionRate}%</span>
              <span className="text-[10px] text-slate-400">submitted</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#002388]" />{submittedCount} submitted</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-slate-200" />{notSubmittedCount} pending</span>
          </div>
        </div>
      </div>

      {/* Students data table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 gap-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.12em] shrink-0">Student Results</p>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="ml-auto h-8 w-48 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:border-[#002388]/40 focus:ring-2 focus:ring-[#002388]/10 transition-all"
          />
          <span className="text-xs text-slate-400 shrink-0">{rows.length} students</span>
        </div>

        {data.enrolledStudents.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <ClipboardList size={28} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-400">No students enrolled in the assigned classes.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-2.5 text-left"><SortBtn col="name" label="Student" /></th>
                <th className="px-5 py-2.5 text-left"><SortBtn col="class" label="Class" /></th>
                <th className="px-5 py-2.5 text-left"><SortBtn col="status" label="Status" /></th>
                <th className="px-5 py-2.5 text-left"><SortBtn col="submittedAt" label="Submitted" /></th>
                <th className="px-5 py-2.5 text-right"><SortBtn col="score" label="Score" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-400">No students match your search.</td>
                </tr>
              ) : rows.map((student) => {
                const sub = submissionByStudent.get(student.id)
                const scorePct = sub?.score != null
                  ? Math.round((sub.score / data.totalMarks) * 100)
                  : null

                return (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-slate-900">{student.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{student.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{student.className}</td>
                    <td className="px-5 py-3.5">
                      {!sub ? (
                        <Chip className="bg-slate-100 text-slate-500 border-slate-200">Not submitted</Chip>
                      ) : sub.status === "GRADED" ? (
                        <Chip className="bg-green-50 text-green-700 border-green-200">Graded</Chip>
                      ) : (
                        <Chip className="bg-amber-50 text-amber-700 border-amber-200">Submitted</Chip>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {sub?.submittedAt ? format(new Date(sub.submittedAt), "MMM d, HH:mm") : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {sub?.score != null ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-medium text-slate-900">
                            {sub.score}
                            <span className="text-xs text-slate-400 ml-1">/ {data.totalMarks}</span>
                          </span>
                          <div className="w-20 h-1 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#002388]"
                              style={{ width: `${scorePct}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
