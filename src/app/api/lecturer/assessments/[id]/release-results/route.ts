import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function getLecturerId(email: string) {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  return user?.id ?? null
}

// POST /api/lecturer/assessments/[id]/release-results
// Sets resultsReleased to true so students can see their scores
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
    select: { lecturerId: true, gradingStatus: true, resultsReleased: true },
  })
  if (!assessment || assessment.lecturerId !== lecturerId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Can only release if grading is complete
  if (assessment.gradingStatus !== "GRADED") {
    return NextResponse.json({ error: "Grading not complete" }, { status: 400 })
  }

  await prisma.assessment.update({
    where: { id: assessmentId },
    data: { resultsReleased: true },
  })

  return NextResponse.json({ success: true, resultsReleased: true })
}
