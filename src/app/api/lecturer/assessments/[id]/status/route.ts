import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validateStatusTransition } from "@/lib/assessment-validation"

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

  const transitionErr = validateStatusTransition(
    assessment.status as "DRAFT" | "PUBLISHED" | "CLOSED",
    body.status,
    {
      hasQuestions: assessment._count.questions > 0,
      hasStartsAt: !!assessment.startsAt,
      hasEndsAt: !!assessment.endsAt,
      hasClasses: assessment._count.classes > 0,
    }
  )

  if (transitionErr) {
    return NextResponse.json({ error: transitionErr }, { status: 400 })
  }

  const updated = await prisma.assessment.update({
    where: { id: assessmentId },
    data: { status: body.status },
  })

  return NextResponse.json(updated)
}
