import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function getLecturerId(email: string) {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  return user?.id ?? null
}

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "LECTURER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const lecturerId = await getLecturerId(session.user.email!)
  if (!lecturerId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // Get all assessments by this lecturer with their enrolled classes + students
  const assessments = await prisma.assessment.findMany({
    where: { lecturerId },
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      totalMarks: true,
      startsAt: true,
      course: { select: { id: true, code: true, title: true } },
      classes: {
        select: {
          class: {
            select: {
              id: true,
              name: true,
              level: true,
              students: {
                select: {
                  user: { select: { id: true, name: true, email: true } },
                },
              },
            },
          },
        },
      },
    },
  })

  // Build a map: studentId → { student info, classes, assessments }
  const studentMap = new Map<number, {
    id: number
    name: string
    email: string
    classId: number
    className: string
    classLevel: number
    assessmentCount: number
    courseIds: Set<number>
  }>()

  for (const assessment of assessments) {
    for (const ac of assessment.classes) {
      for (const sp of ac.class.students) {
        const sid = sp.user.id
        if (!studentMap.has(sid)) {
          studentMap.set(sid, {
            id: sid,
            name: sp.user.name ?? "Unknown",
            email: sp.user.email,
            classId: ac.class.id,
            className: ac.class.name,
            classLevel: ac.class.level,
            assessmentCount: 0,
            courseIds: new Set(),
          })
        }
        const entry = studentMap.get(sid)!
        entry.assessmentCount++
        entry.courseIds.add(assessment.course.id)
      }
    }
  }

  // Collect unique courses and classes for filter options
  const coursesMap = new Map<number, { id: number; code: string; title: string }>()
  const classesMap = new Map<number, { id: number; name: string; level: number }>()

  for (const assessment of assessments) {
    coursesMap.set(assessment.course.id, assessment.course)
    for (const ac of assessment.classes) {
      classesMap.set(ac.class.id, {
        id: ac.class.id,
        name: ac.class.name,
        level: ac.class.level,
      })
    }
  }

  const students = Array.from(studentMap.values()).map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    classId: s.classId,
    className: s.className,
    classLevel: s.classLevel,
    assessmentCount: s.assessmentCount,
    courseIds: Array.from(s.courseIds),
  }))

  return NextResponse.json({
    students,
    courses: Array.from(coursesMap.values()),
    classes: Array.from(classesMap.values()),
  })
}
