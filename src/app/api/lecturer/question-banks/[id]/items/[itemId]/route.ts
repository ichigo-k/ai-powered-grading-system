import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function getLecturerId(email: string): Promise<number | null> {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  return user?.id ?? null
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== "LECTURER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const lecturerId = await getLecturerId(session.user.email!)
  if (!lecturerId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id, itemId } = await params
  const bankId = parseInt(id)
  const itemIdNum = parseInt(itemId)
  if (isNaN(bankId) || isNaN(itemIdNum)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const bank = await prisma.questionBank.findUnique({ where: { id: bankId } })
  if (!bank || bank.lecturerId !== lecturerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const item = await prisma.questionBankItem.findUnique({ where: { id: itemIdNum } })
  if (!item || item.bankId !== bankId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.questionBankItem.delete({ where: { id: itemIdNum } })
  return NextResponse.json({ success: true })
}
