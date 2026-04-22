"use client"

import { useState } from "react"
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Inbox,
} from "lucide-react"

// ── Types ────────────────────────────────────────────────────────────────────

type AssessmentType = "exam" | "quiz" | "test"

interface Assessment {
  id: number
  title: string
  course: string
  courseCode: string
  courseColor: string
  type: AssessmentType
  status: "upcoming" | "ongoing" | "completed" | "missed"
  date: string
  time: string
  duration: string
  venue: string
  daysLeft?: number
  score?: number
  total?: number
  grade?: string
}

// ── Mock data ────────────────────────────────────────────────────────────────

const assessments: Assessment[] = [
  // Upcoming
  { id: 1, title: "Midterm Examination", course: "Introduction to Computing", courseCode: "CS101", courseColor: "#1967D2", type: "exam", status: "upcoming", date: "Apr 25, 2026", time: "09:00 AM", duration: "2 hrs", venue: "Hall A", daysLeft: 4 },
  { id: 2, title: "Quiz 3", course: "Calculus I", courseCode: "MATH201", courseColor: "#7C3AED", type: "quiz", status: "upcoming", date: "Apr 28, 2026", time: "02:00 PM", duration: "45 min", venue: "Room 204", daysLeft: 7 },
  { id: 3, title: "Practical Test", course: "Data Structures", courseCode: "CS301", courseColor: "#0891B2", type: "test", status: "upcoming", date: "May 3, 2026", time: "10:00 AM", duration: "1.5 hrs", venue: "Lab 2", daysLeft: 12 },
  { id: 4, title: "End of Semester Exam", course: "Technical Writing", courseCode: "ENG101", courseColor: "#059669", type: "exam", status: "upcoming", date: "May 10, 2026", time: "08:00 AM", duration: "2 hrs", venue: "Hall B", daysLeft: 19 },
  // Completed
  { id: 5, title: "Quiz 2", course: "Introduction to Computing", courseCode: "CS101", courseColor: "#1967D2", type: "quiz", status: "completed", date: "Apr 14, 2026", time: "09:00 AM", duration: "45 min", venue: "Room 101", score: 88, total: 100, grade: "A" },
  { id: 6, title: "Quiz 1", course: "Calculus I", courseCode: "MATH201", courseColor: "#7C3AED", type: "quiz", status: "completed", date: "Apr 10, 2026", time: "02:00 PM", duration: "45 min", venue: "Room 204", score: 74, total: 100, grade: "B+" },
  { id: 7, title: "Lab Test 1", course: "Data Structures", courseCode: "CS301", courseColor: "#0891B2", type: "test", status: "completed", date: "Apr 7, 2026", time: "10:00 AM", duration: "1 hr", venue: "Lab 2", score: 92, total: 100, grade: "A+" },
  { id: 8, title: "Quiz 1", course: "Introduction to Computing", courseCode: "CS101", courseColor: "#1967D2", type: "quiz", status: "completed", date: "Mar 28, 2026", time: "09:00 AM", duration: "45 min", venue: "Room 101", score: 80, total: 100, grade: "A-" },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

const typeStyles: Record<AssessmentType, { bg: string; text: string }> = {
  exam:  { bg: "#FEE2E2", text: "#DC2626" },
  quiz:  { bg: "#FEF3C7", text: "#D97706" },
  test:  { bg: "#EDE9FE", text: "#7C3AED" },
}

function gradeColor(grade: string) {
  if (grade.startsWith("A")) return { bg: "#DCFCE7", text: "#16A34A" }
  if (grade.startsWith("B")) return { bg: "#DBEAFE", text: "#1967D2" }
  return { bg: "#FEF3C7", text: "#D97706" }
}

const TABS = [
  { key: "upcoming",  label: "Upcoming",  Icon: CalendarDays },
  { key: "completed", label: "Completed", Icon: CheckCircle2 },
] as const

type Tab = typeof TABS[number]["key"]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ExamsPage() {
  const [tab, setTab] = useState<Tab>("upcoming")

  const filtered = assessments.filter((a) => a.status === tab)

  const counts: Record<Tab, number> = {
    upcoming:  assessments.filter((a) => a.status === "upcoming").length,
    completed: assessments.filter((a) => a.status === "completed").length,
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header + Tabs */}
      <div className="border-b" style={{ borderColor: "#E2E8F0" }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0A1628" }}>Exams &amp; Tests</h1>
          <p className="text-sm mt-0.5 mb-4" style={{ color: "#64748B" }}>Track your upcoming and past assessments</p>
        </div>
        <div className="flex items-center gap-1">
          {TABS.map(({ key, label, Icon }) => {
            const active = tab === key
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all relative"
                style={{ color: active ? "#1967D2" : "#64748B" }}
              >
                <Icon size={14} />
                {label}
                {counts[key] > 0 && (
                  <span
                    className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                    style={active ? { background: "#DBEAFE", color: "#1967D2" } : { background: "#F1F5F9", color: "#94A3B8" }}
                  >
                    {counts[key]}
                  </span>
                )}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: "#1967D2" }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Assessment list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border flex flex-col items-center justify-center py-20" style={{ borderColor: "#E2E8F0" }}>
          <Inbox size={40} strokeWidth={1.5} style={{ color: "#CBD5E1" }} />
          <p className="mt-3 text-sm font-semibold" style={{ color: "#64748B" }}>No assessments found</p>
          <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>Try changing the filters above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const ts = typeStyles[a.type]
            const isCompleted = a.status === "completed"

            return (
              <div
                key={a.id}
                className="bg-white rounded-2xl border hover:shadow-md transition-all hover:-translate-y-px cursor-pointer"
                style={{ borderColor: "#E2E8F0" }}
              >
                <div className="flex items-center gap-4 p-5">
                  {/* Color strip */}
                  <div
                    className="w-1 self-stretch rounded-full flex-shrink-0"
                    style={{ background: a.courseColor, minHeight: 48 }}
                  />

                  {/* Date badge */}
                  <div
                    className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-white"
                    style={{ background: isCompleted ? "#94A3B8" : a.courseColor }}
                  >
                    <span className="text-sm font-black leading-none">{a.date.split(" ")[1].replace(",", "")}</span>
                    <span className="text-[10px] font-semibold opacity-80 leading-none mt-0.5">{a.date.split(" ")[0]}</span>
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold" style={{ color: "#0A1628" }}>{a.title}</p>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: ts.bg, color: ts.text }}>
                        {a.type.charAt(0).toUpperCase() + a.type.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                      {a.courseCode} · {a.course}
                    </p>
                    <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs" style={{ color: "#94A3B8" }}>
                        <Clock size={11} />
                        {a.time} · {a.duration}
                      </span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: "#94A3B8" }}>
                        <MapPin size={11} />
                        {a.venue}
                      </span>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex-shrink-0 text-right">
                    {isCompleted && a.score !== undefined && a.grade ? (
                      <div>
                        <span
                          className="text-base font-black px-3 py-1.5 rounded-xl"
                          style={{ background: gradeColor(a.grade).bg, color: gradeColor(a.grade).text }}
                        >
                          {a.grade}
                        </span>
                        <p className="text-[11px] mt-1.5 font-medium" style={{ color: "#94A3B8" }}>
                          {a.score}/{a.total}
                        </p>
                      </div>
                    ) : a.daysLeft !== undefined ? (
                      <span
                        className="text-xs font-bold px-2.5 py-1.5 rounded-lg"
                        style={
                          a.daysLeft <= 5
                            ? { background: "#FEE2E2", color: "#DC2626" }
                            : { background: "#F1F5F9", color: "#64748B" }
                        }
                      >
                        {a.daysLeft}d left
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
