import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function getLecturerId(email: string): Promise<number | null> {
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

  const banks = await prisma.questionBank.findMany({
    where: { lecturerId },
    include: {
      course: { select: { code: true, title: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(banks)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "LECTURER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const lecturerId = await getLecturerId(session.user.email!)
  if (!lecturerId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  let body: { title: string; courseId?: number | null }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 })
  }

  const bank = await prisma.questionBank.create({
    data: {
      lecturerId,
      title: body.title,
      courseId: body.courseId ?? null,
    },
  })

  return NextResponse.json(bank, { status: 201 })
}
