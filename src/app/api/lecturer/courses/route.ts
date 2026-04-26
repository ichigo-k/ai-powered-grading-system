import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "LECTURER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  })
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const profile = await prisma.lecturerProfile.findUnique({
    where: { id: user.id },
    include: {
      courses: { select: { id: true, code: true, title: true } },
    },
  })

  return NextResponse.json(profile?.courses ?? [])
}
