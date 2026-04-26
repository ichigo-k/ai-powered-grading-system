import Link from "next/link"
import { ArrowLeft, MapPin, Lock, Shuffle, RotateCcw, Clock, Users, BookOpen, Layers } from "lucide-react"
import { format } from "date-fns"
import type { AssessmentWithDetails } from "@/lib/assessment-types"

const typeBadge: Record<string, string> = {
  EXAM: "bg-red-50 text-red-700 border-red-200",
  QUIZ: "bg-amber-50 text-amber-700 border-amber-200",
  ASSIGNMENT: "bg-blue-50 text-blue-700 border-blue-200",
}

const statusBadge: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
  PUBLISHED: "bg-green-50 text-green-700 border-green-200",
  CLOSED: "bg-slate-200 text-slate-500 border-slate-300",
}

const answerTypeLabel: Record<string, string> = {
  FILL_IN: "Fill In",
  PDF_UPLOAD: "Upload PDF",
  CODE: "Write Code",
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <span className="w-40 shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="text-sm text-slate-800">{children}</span>
    </div>
  )
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${className}`}>
      {children}
    </span>
  )
}

interface Props {
  assessment: AssessmentWithDetails
}

export default function AssessmentDetailView({ assessment }: Props) {
  const totalQuestionsCount = assessment.sections.reduce((acc, s) => acc + s.questions.length, 0)

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      {/* Back link */}
      <Link
        href="/lecturer/assessments"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#002388] transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Assessments
      </Link>

      {/* Header card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={typeBadge[assessment.type]}>{assessment.type}</Badge>
              <Badge className={statusBadge[assessment.status]}>{assessment.status}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{assessment.title}</h1>
            <p className="flex items-center gap-1.5 text-sm text-slate-500">
              <BookOpen size={14} className="text-[#002388]" />
              {assessment.courseCode} — {assessment.courseTitle}
            </p>
          </div>
          <div className="flex items-center gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-slate-900">{assessment.totalMarks}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Marks</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#002388]">{totalQuestionsCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Questions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Schedule & Access */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Schedule &amp; Access</h2>
          <InfoRow label="Starts At">
            {format(new Date(assessment.startsAt), "MMM d, yyyy HH:mm")}
          </InfoRow>
          <InfoRow label="Ends At">
            {format(new Date(assessment.endsAt), "MMM d, yyyy HH:mm")}
          </InfoRow>
          <InfoRow label="Duration">
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-slate-400" />
              {assessment.durationMinutes ? `${assessment.durationMinutes} min` : "Unlimited"}
            </span>
          </InfoRow>
          <InfoRow label="Max Attempts">
            <span className="flex items-center gap-1.5">
              <RotateCcw size={13} className="text-slate-400" />
              {assessment.maxAttempts}
            </span>
          </InfoRow>
        </div>

        {/* Configuration Summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Configuration</h2>
          <InfoRow label="Location">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-slate-400" />
              {assessment.isLocationBound
                ? `Location-Bound${assessment.location ? ` — ${assessment.location}` : ""}`
                : "Anywhere"}
            </span>
          </InfoRow>
          <InfoRow label="Password">
            <span className="flex items-center gap-1.5">
              <Lock size={13} className="text-slate-400" />
              {assessment.passwordProtected ? "Protected" : "None"}
            </span>
          </InfoRow>
          <InfoRow label="Shuffle Questions">
            <span className="flex items-center gap-1.5">
              <Shuffle size={13} className="text-slate-400" />
              {assessment.shuffleQuestions ? "Yes" : "No"}
            </span>
          </InfoRow>
          <InfoRow label="Shuffle Options">
            <span className="flex items-center gap-1.5">
              <Shuffle size={13} className="text-slate-400" />
              {assessment.shuffleOptions ? "Yes" : "No"}
            </span>
          </InfoRow>
        </div>

        {/* Assigned Classes */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <Users size={13} />
            Assigned Classes
          </h2>
          {assessment.classes.length === 0 ? (
            <p className="text-sm text-slate-400">No classes assigned.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {assessment.classes.map((c) => (
                <div key={c.id} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                  <span className="text-xs font-bold text-slate-700">{c.className}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section Summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <Layers size={13} />
            Section Summary
          </h2>
          <div className="space-y-2">
            {assessment.sections.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                   <div className={`w-1.5 h-1.5 rounded-full ${s.type === "OBJECTIVE" ? "bg-blue-400" : "bg-purple-400"}`} />
                   <span className="text-xs font-semibold text-slate-700">{s.name}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {s.requiredQuestionsCount ? `Ans ${s.requiredQuestionsCount}/${s.questions.length}` : `Ans All (${s.questions.length})`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Sections and Questions */}
      <div className="space-y-8">
        {assessment.sections.map((section, secIdx) => (
          <div key={section.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                <span className="mr-2 text-slate-400 text-[11px]">Section {secIdx + 1}:</span>
                {section.name}
              </h2>
              <Badge className={section.type === "OBJECTIVE" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"}>
                {section.type}
              </Badge>
            </div>
            
            <div className="divide-y divide-slate-100">
              {section.questions.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-slate-400 italic">No questions in this section.</div>
              ) : (
                section.questions.map((q, idx) => (
                  <div key={q.id} className="px-6 py-5">
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <p className="text-sm font-medium text-slate-800">
                        <span className="mr-2 text-[11px] font-bold text-slate-400">Q{idx + 1}.</span>
                        {q.body}
                      </p>
                      <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                        {q.marks} mk{q.marks !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {section.type === "OBJECTIVE" && q.options && (
                      <ul className="space-y-1.5 pl-4 mt-4">
                        {(q.options as string[]).map((opt, i) => (
                          <li
                            key={i}
                            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
                              q.correctOption === i
                                ? "bg-green-50 font-semibold text-green-700"
                                : "text-slate-600 border border-transparent"
                            }`}
                          >
                            <span className="w-5 shrink-0 text-[11px] font-bold text-slate-400">
                              {String.fromCharCode(65 + i)}.
                            </span>
                            {opt}
                            {q.correctOption === i && (
                              <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-green-600">
                                ✓ Correct
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.type === "SUBJECTIVE" && (
                      <div className="mt-4 space-y-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Format: <span className="text-slate-600 ml-1">{answerTypeLabel[q.answerType!] ?? q.answerType}</span>
                        </p>
                        {q.rubricCriteria.length > 0 && (
                          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                            <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Grading Rubric</p>
                            <ul className="space-y-2">
                              {q.rubricCriteria.map((rc) => (
                                <li key={rc.id} className="flex items-center justify-between text-xs">
                                  <span className="text-slate-600">{rc.description}</span>
                                  <span className="text-[10px] font-bold text-slate-400">{rc.maxMarks} pts</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {assessment.sections.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
          <p className="text-sm text-slate-400">No sections have been added to this assessment yet.</p>
        </div>
      )}
    </div>
  )
}
