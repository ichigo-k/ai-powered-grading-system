import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { computeGrade, parseGradingScale } from "@/lib/grading-scale"
import ExcelJS from "exceljs"

// ---------------------------------------------------------------------------
// Supported fields and their human-readable column labels
// ---------------------------------------------------------------------------

const SUPPORTED_FIELDS = [
  "studentId",
  "studentName",
  "email",
  "score",
  "totalMarks",
  "percentage",
  "grade",
  "attemptNumber",
  "submittedAt",
  "plagiarismFlagged",
] as const

type SupportedField = (typeof SUPPORTED_FIELDS)[number]

const FIELD_LABELS: Record<SupportedField, string> = {
  studentId: "Student ID",
  studentName: "Student Name",
  email: "Email",
  score: "Score",
  totalMarks: "Total Marks",
  percentage: "Percentage (%)",
  grade: "Grade",
  attemptNumber: "Attempt #",
  submittedAt: "Submitted At",
  plagiarismFlagged: "Plagiarism Flagged",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getLecturerId(email: string): Promise<number | null> {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  return user?.id ?? null
}

/**
 * Parse the `fields` query parameter.
 * Accepts both comma-separated (?fields=a,b) and repeated (?fields=a&fields=b) forms.
 * Returns null when the parameter is absent (caller should use all fields).
 */
function parseFieldsParam(searchParams: URLSearchParams): string[] | null {
  const all = searchParams.getAll("fields")
  if (all.length === 0) return null

  // Flatten comma-separated values within each occurrence
  const flat = all.flatMap((v) => v.split(",").map((s) => s.trim())).filter(Boolean)
  return flat.length > 0 ? flat : null
}

// ---------------------------------------------------------------------------
// GET /api/lecturer/assessments/[id]/export/marks
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // --- Auth ---
  const session = await auth()
  if (!session || session.user.role !== "LECTURER") {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const lecturerId = await getLecturerId(session.user.email!)
  if (!lecturerId) return Response.json({ error: "Forbidden" }, { status: 403 })

  // --- Parse assessment ID ---
  const { id } = await params
  const assessmentId = parseInt(id)
  if (isNaN(assessmentId)) return Response.json({ error: "Not found" }, { status: 404 })

  // --- Parse & validate fields ---
  const rawFields = parseFieldsParam(request.nextUrl.searchParams)
  let requestedFields: SupportedField[]

  if (rawFields === null) {
    // Default: all fields in canonical order
    requestedFields = [...SUPPORTED_FIELDS]
  } else {
    const invalidFields = rawFields.filter(
      (f) => !(SUPPORTED_FIELDS as readonly string[]).includes(f)
    )
    if (invalidFields.length > 0) {
      return Response.json(
        { error: `Invalid fields: ${invalidFields.join(", ")}`, invalidFields },
        { status: 400 }
      )
    }
    // Preserve canonical order for requested fields
    requestedFields = SUPPORTED_FIELDS.filter((f) => rawFields.includes(f))
  }

  // --- Ownership check ---
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: { lecturerId: true, gradingStatus: true, totalMarks: true },
  })

  if (!assessment || assessment.lecturerId !== lecturerId) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  // --- Grading status check ---
  if (assessment.gradingStatus !== "GRADED") {
    return Response.json(
      { error: "Cannot export marks before grading is complete" },
      { status: 409 }
    )
  }

  const totalMarks = assessment.totalMarks

  // --- Fetch data ---
  const [attempts, gradingResults, settingsRow] = await Promise.all([
    prisma.assessmentAttempt.findMany({
      where: {
        assessmentId,
        status: { in: ["SUBMITTED", "TIMED_OUT"] },
      },
      select: {
        id: true,
        attemptNumber: true,
        score: true,
        submittedAt: true,
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.gradingResult.findMany({
      where: { assessmentId },
      select: { attemptId: true, plagiarismFlagged: true },
    }),
    prisma.systemSettings.findFirst({ select: { gradingScale: true } }),
  ])

  const gradingResultMap = new Map(gradingResults.map((r) => [r.attemptId, r]))
  const scale = parseGradingScale(settingsRow?.gradingScale)

  // --- Build Excel workbook ---
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Marks")

  // Header row
  worksheet.addRow(requestedFields.map((f) => FIELD_LABELS[f]))

  // Data rows
  for (const attempt of attempts) {
    const gr = gradingResultMap.get(attempt.id)
    const score = attempt.score ?? 0
    const pct = totalMarks > 0 ? Math.round((score / totalMarks) * 10000) / 100 : 0
    const grade = attempt.score != null ? computeGrade(score, totalMarks, scale) : "N/A"

    const rowData: Record<SupportedField, unknown> = {
      studentId: attempt.student.id,
      studentName: attempt.student.name ?? "",
      email: attempt.student.email,
      score: attempt.score ?? 0,
      totalMarks,
      percentage: pct,
      grade,
      attemptNumber: attempt.attemptNumber,
      submittedAt: attempt.submittedAt ? attempt.submittedAt.toISOString() : "",
      plagiarismFlagged: gr?.plagiarismFlagged ?? false,
    }

    worksheet.addRow(requestedFields.map((f) => rowData[f]))
  }

  // Stream as buffer
  const buffer = await workbook.xlsx.writeBuffer()

  // --- Response ---
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const filename = `marks-${assessmentId}-${timestamp}.xlsx`

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
