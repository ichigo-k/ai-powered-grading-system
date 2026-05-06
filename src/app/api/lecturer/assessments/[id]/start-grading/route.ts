import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { callGraderBatch } from "@/lib/grader-client"

async function getLecturerId(email: string) {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  return user?.id ?? null
}

// POST /api/lecturer/assessments/[id]/start-grading
// Sets gradingStatus to GRADING so external grader can pick it up
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== "LECTURER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const lecturerId = await getLecturerId(session.user.email!)
  if (!lecturerId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const assessmentId = parseInt(id)
  if (isNaN(assessmentId)) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Verify ownership
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: { lecturerId: true, gradingStatus: true, status: true },
  })
  if (!assessment || assessment.lecturerId !== lecturerId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Assessment must be CLOSED before grading can begin
  if (assessment.status !== "CLOSED") {
    return NextResponse.json(
      { error: "Assessment must be closed before grading can begin" },
      { status: 409 }
    )
  }

  // Reject if grading is already in progress or completed
  if (assessment.gradingStatus === "GRADING") {
    return NextResponse.json({ error: "Grading already in progress" }, { status: 409 })
  }
  if (assessment.gradingStatus === "GRADED") {
    return NextResponse.json({ error: "Assessment has already been graded" }, { status: 409 })
  }

  // Set status to GRADING
  await prisma.assessment.update({
    where: { id: assessmentId },
    data: { gradingStatus: "GRADING" },
  })

  // Fire-and-forget: call the Django grader without awaiting
  callGraderBatch(assessmentId).catch(async (err) => {
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { gradingStatus: "NOT_GRADED" },
    })
    console.error("Grader batch call failed for assessment", assessmentId, err)
  })

  return NextResponse.json({ gradingStatus: "GRADING" })
}
