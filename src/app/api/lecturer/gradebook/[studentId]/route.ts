import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function getLecturerId(email: string) {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  return user?.id ?? null
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== "LECTURER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const lecturerId = await getLecturerId(session.user.email!)
  if (!lecturerId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { studentId } = await params
  const sid = parseInt(studentId)
  if (isNaN(sid)) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Get student info
  const student = await prisma.user.findUnique({
    where: { id: sid },
    select: {
      id: true,
      name: true,
      email: true,
      studentProfile: {
        select: {
          program: true,
          class: { select: { id: true, name: true, level: true } },
        },
      },
    },
  })
  if (!student || !student.studentProfile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Get all assessments by this lecturer that include a class this student belongs to
  const classId = student.studentProfile.class?.id
  if (!classId) {
    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name ?? "Unknown",
        email: student.email,
        program: student.studentProfile.program,
        className: null,
        classLevel: null,
      },
      assessments: [],
    })
  }

  const assessments = await prisma.assessment.findMany({
    where: {
      lecturerId,
      classes: { some: { classId } },
    },
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      totalMarks: true,
      startsAt: true,
      endsAt: true,
      course: { select: { code: true, title: true } },
    },
    orderBy: { startsAt: "desc" },
  })

  return NextResponse.json({
    student: {
      id: student.id,
      name: student.name ?? "Unknown",
      email: student.email,
      program: student.studentProfile.program,
      className: student.studentProfile.class?.name ?? null,
      classLevel: student.studentProfile.class?.level ?? null,
    },
    assessments: assessments.map((a) => ({
      id: a.id,
      title: a.title,
      type: a.type,
      status: a.status,
      totalMarks: a.totalMarks,
      startsAt: a.startsAt,
      endsAt: a.endsAt,
      courseCode: a.course.code,
      courseTitle: a.course.title,
      // No submission model yet — placeholder
      score: null,
      submissionStatus: "NOT_SUBMITTED" as const,
    })),
  })
}
