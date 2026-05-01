import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validateDateRange, validatePasswordProtection } from "@/lib/assessment-validation"

async function getLecturerId(email: string): Promise<number | null> {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  return user?.id ?? null
}

export interface UpdateAssessmentSettingsPayload {
  endsAt?: string
  durationMinutes?: number | null
  maxAttempts?: number
  passwordProtected?: boolean
  accessPassword?: string | null
}

/**
 * PATCH /api/lecturer/assessments/[id]/settings
 *
 * Allows limited edits to a PUBLISHED or CLOSED assessment:
 *   - endsAt          (extend the window)
 *   - durationMinutes (increase time per attempt)
 *   - maxAttempts     (increase allowed attempts)
 *   - passwordProtected / accessPassword
 *
 * Questions, sections, course, title, and type cannot be changed here.
 */
export async function PATCH(
  request: NextRequest,
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

  const existing = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: {
      lecturerId: true,
      status: true,
      startsAt: true,
      endsAt: true,
      maxAttempts: true,
      passwordProtected: true,
      accessPassword: true,
      durationMinutes: true,
    },
  })

  if (!existing || existing.lecturerId !== lecturerId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (existing.status === "DRAFT") {
    return NextResponse.json(
      { error: "Use the full edit form for DRAFT assessments" },
      { status: 400 }
    )
  }

  let body: UpdateAssessmentSettingsPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  // Validate endsAt if provided
  if (body.endsAt !== undefined) {
    const dateErr = validateDateRange(existing.startsAt, body.endsAt)
    if (dateErr) return NextResponse.json({ error: dateErr }, { status: 400 })
  }

  // Validate maxAttempts if provided
  if (body.maxAttempts !== undefined) {
    if (!Number.isInteger(body.maxAttempts) || body.maxAttempts < 1) {
      return NextResponse.json({ error: "maxAttempts must be a positive integer" }, { status: 400 })
    }
  }

  // Validate durationMinutes if provided
  if (body.durationMinutes !== undefined && body.durationMinutes !== null) {
    if (!Number.isInteger(body.durationMinutes) || body.durationMinutes <= 0) {
      return NextResponse.json({ error: "durationMinutes must be a positive integer" }, { status: 400 })
    }
  }

  // Validate password settings
  const passwordProtected = body.passwordProtected ?? existing.passwordProtected
  const accessPassword = body.accessPassword ?? existing.accessPassword
  const passwordErr = validatePasswordProtection(passwordProtected, accessPassword)
  if (passwordErr) return NextResponse.json({ error: passwordErr }, { status: 400 })

  const updated = await prisma.assessment.update({
    where: { id: assessmentId },
    data: {
      ...(body.endsAt !== undefined ? { endsAt: new Date(body.endsAt) } : {}),
      ...(body.durationMinutes !== undefined ? { durationMinutes: body.durationMinutes } : {}),
      ...(body.maxAttempts !== undefined ? { maxAttempts: body.maxAttempts } : {}),
      ...(body.passwordProtected !== undefined ? { passwordProtected: body.passwordProtected } : {}),
      ...(body.accessPassword !== undefined
        ? { accessPassword: passwordProtected ? body.accessPassword : null }
        : {}),
    },
    select: {
      id: true,
      endsAt: true,
      durationMinutes: true,
      maxAttempts: true,
      passwordProtected: true,
      accessPassword: true,
    },
  })

  return NextResponse.json({ success: true, ...updated })
}
