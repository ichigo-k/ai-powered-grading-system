import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import bcrypt from "bcrypt"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

const VALID_ROLES = ["ADMIN", "LECTURER", "STUDENT"] as const
type ValidRole = (typeof VALID_ROLES)[number]

export async function POST(request: NextRequest) {
  // 1. Auth check — Admin only
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // 2. Parse + validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { userId, name, role, password } = body as Record<string, unknown>

  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "userId is required" }, { status: 400 })
  }
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 })
  }
  if (!role || !VALID_ROLES.includes(role as ValidRole)) {
    return NextResponse.json(
      { error: "role must be one of ADMIN, LECTURER, STUDENT" },
      { status: 400 }
    )
  }
  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "password is required" }, { status: 400 })
  }

  // 3. Hash password
  const passwordHash = await bcrypt.hash(password, 12)

  // 4. Create user
  try {
    const user = await prisma.user.create({
      data: {
        userId,
        name,
        role: role as ValidRole,
        passwordHash,
      },
      select: {
        id: true,
        userId: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A user with that userId already exists" },
        { status: 409 }
      )
    }
    throw err
  }
}
