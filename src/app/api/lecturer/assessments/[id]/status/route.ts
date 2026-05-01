import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function getLecturerId(email: string): Promise<number | null> {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  return user?.id ?? null
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== "LECTURER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const lecturerId = await getLecturerId(session.user.email!)
  if (!lecturerId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const assessmentId = parseInt(id)
  if (isNaN(assessmentId)) return NextResponse.json({ error: "Not found" }, { status: 404 })

  let body: { status: "PUBLISHED" | "CLOSED" }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!body.status || !["PUBLISHED", "CLOSED"].includes(body.status)) {
    return NextResponse.json({ error: "status must be PUBLISHED or CLOSED" }, { status: 400 })
  }

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      _count: { select: { questions: true, classes: true } },
    },
  })

  if (!assessment || assessment.lecturerId !== lecturerId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const current = assessment.status as "DRAFT" | "PUBLISHED" | "CLOSED"

  // Allowed transitions:
  //   DRAFT      → PUBLISHED  (publish)
  //   PUBLISHED  → CLOSED     (close)
  //   CLOSED     → PUBLISHED  (re-open)
  if (current === "DRAFT" && body.status !== "PUBLISHED") {
    return NextResponse.json({ error: "DRAFT can only transition to PUBLISHED" }, { status: 400 })
  }

  if (current === "DRAFT" && body.status === "PUBLISHED") {
    const missing: string[] = []
    if (assessment._count.questions === 0) missing.push("at least one question")
    if (!assessment.startsAt) missing.push("start date")
    if (!assessment.endsAt) missing.push("end date")
    if (assessment._count.classes === 0) missing.push("at least one assigned class")
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Cannot publish: missing ${missing.join(", ")}` },
        { status: 400 }
      )
    }
  }

  // CLOSED → PUBLISHED: re-open. No extra validation needed beyond ownership.
  // PUBLISHED → CLOSED: always allowed.

  const updated = await prisma.assessment.update({
    where: { id: assessmentId },
    data: { status: body.status },
  })

  return NextResponse.json(updated)
}
