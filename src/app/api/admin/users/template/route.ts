import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const VALID_ROLES = ["STUDENT", "LECTURER", "ADMIN"] as const
type ValidRole = (typeof VALID_ROLES)[number]

const TEMPLATES: Record<ValidRole, { headers: string; example: string }> = {
  STUDENT: {
    headers: "email,name,program,classId",
    example: "4211230210@live.gctu.edu.gh,John Doe,Computer Science,",
  },
  LECTURER: {
    headers: "email,name,department,title",
    example: "kephas.tetteh@live.gctu.edu.gh,Kephas Tetteh,Computer Science,Dr.",
  },
  ADMIN: {
    headers: "email,name",
    example: "admin.user@live.gctu.edu.gh,Admin User",
  },
}

export async function GET(request: NextRequest) {
  // 5.1 — require admin session
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // 5.2 — validate role query param
  const role = request.nextUrl.searchParams.get("role")
  if (!role || !VALID_ROLES.includes(role as ValidRole)) {
    return NextResponse.json(
      { error: "role must be one of STUDENT, LECTURER, ADMIN" },
      { status: 400 }
    )
  }

  // 5.3 — return CSV
  const { headers, example } = TEMPLATES[role as ValidRole]
  const csv = `${headers}\n${example}\n`

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="user-template-${role.toLowerCase()}.csv"`,
    },
  })
}
