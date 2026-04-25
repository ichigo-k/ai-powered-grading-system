import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
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

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
