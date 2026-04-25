import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import bcrypt from "bcrypt"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

type RowError = { row: number; field: string; message: string }

const REQUIRED_FIELDS: Record<string, string[]> = {
  STUDENT: ["email", "name", "program"],
  LECTURER: ["email", "name", "department", "title"],
  ADMIN: ["email", "name"],
}

export async function POST(request: NextRequest) {
  // 4.1 — require admin session
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // 4.2 — parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { role, rows } = body as { role?: string; rows?: unknown }

  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json(
      { error: "CSV file contains no data rows" },
      { status: 400 }
    )
  }

  const validRoles = ["STUDENT", "LECTURER", "ADMIN"]
  if (!role || !validRoles.includes(role)) {
    return NextResponse.json(
      { error: "role must be one of STUDENT, LECTURER, ADMIN" },
      { status: 400 }
    )
  }

  const requiredFields = REQUIRED_FIELDS[role]

  // 4.3 — iterate all rows, collect errors without stopping
  let created = 0
  const errors: RowError[] = []

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 1
    const row = rows[i] as Record<string, string>

    // Validate required fields
    let validationError: RowError | null = null
    for (const field of requiredFields) {
      if (!row[field] || typeof row[field] !== "string" || row[field].trim() === "") {
        validationError = {
          row: rowNum,
          field,
          message: `${field} is required`,
        }
        break
      }
    }

    if (validationError) {
      errors.push(validationError)
      continue
    }

    // Attempt to create user + profile in a transaction
    try {
      // Password = email local part
      const emailLocal = row.email.trim().includes("@")
        ? row.email.trim().split("@")[0]
        : row.email.trim()
      const passwordHash = await bcrypt.hash(emailLocal, 12)

      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: row.email.trim(),
            name: row.name.trim(),
            role: role as "STUDENT" | "LECTURER" | "ADMIN",
            passwordHash,
          },
        })

        if (role === "STUDENT") {
          await tx.studentProfile.create({
            data: {
              id: user.id,
              program: row.program.trim(),
              classId: row.classId ? Number(row.classId) : null,
            },
          })
        } else if (role === "LECTURER") {
          await tx.lecturerProfile.create({
            data: {
              id: user.id,
              department: row.department.trim(),
              title: row.title.trim(),
            },
          })
        } else if (role === "ADMIN") {
          await tx.adminProfile.create({
            data: { id: user.id },
          })
        }
      })

      created++
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        const fields = (err.meta?.target as string[] | undefined) ?? []
        const conflictField = fields[0] ?? "email"
        errors.push({
          row: rowNum,
          field: conflictField,
          message: `${conflictField} already exists`,
        })
      } else {
        console.error(`[POST /api/admin/users/bulk] row ${rowNum}:`, err)
        errors.push({
          row: rowNum,
          field: "unknown",
          message: "Unexpected error creating user",
        })
      }
    }
  }

  // 4.4 — return 200 if all succeeded, 207 on partial failure
  if (errors.length === 0) {
    return NextResponse.json(
      { created, failed: 0, errors: [] },
      { status: 200 }
    )
  }

  return NextResponse.json(
    { created, failed: errors.length, errors },
    { status: 207 }
  )
}
