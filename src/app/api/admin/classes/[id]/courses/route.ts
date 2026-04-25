import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const classId = parseInt(id);
    if (isNaN(classId)) {
      return NextResponse.json({ error: "Invalid class ID" }, { status: 400 });
    }

    const cls = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        courses: true,
      },
    });

    if (!cls) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json(cls.courses, { status: 200 });
  } catch (error) {
    console.error("Error fetching class courses:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
