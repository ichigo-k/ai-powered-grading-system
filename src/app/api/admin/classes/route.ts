import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, level } = body;

    if (!name || !level) {
      return NextResponse.json({ error: "Name and level are required" }, { status: 400 });
    }

    const existingClass = await prisma.class.findUnique({
      where: {
        name_level: {
          name,
          level: Number(level),
        },
      },
    });

    if (existingClass) {
      return NextResponse.json({ error: "A class with this name and level already exists" }, { status: 409 });
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        level: Number(level),
      },
    });

    await logAction(
      "CLASS_CREATED",
      `New class "${newClass.name}" (Level ${newClass.level}) was created`,
      "CLASS"
    );

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
