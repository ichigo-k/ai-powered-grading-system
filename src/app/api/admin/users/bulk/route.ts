import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { logAction } from "@/lib/audit";
import ExcelJS from "exceljs";

type RowError = { row: number; field: string; message: string };

const REQUIRED_FIELDS: Record<string, string[]> = {
  STUDENT: ["email", "name", "program"],
  LECTURER: ["email", "name", "department", "title"],
  ADMIN: ["email", "name"],
};

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const role = formData.get("role") as string;
  const file = formData.get("file") as File | null;

  const validRoles = ["STUDENT", "LECTURER", "ADMIN"];
  if (!role || !validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "Excel file is required" }, { status: 400 });
  }

  const requiredFields = REQUIRED_FIELDS[role];
  const buffer = Buffer.from(await file.arrayBuffer());

  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer as any);
  } catch {
    return NextResponse.json({ error: "Could not parse Excel file" }, { status: 400 });
  }

  const sheet = workbook.getWorksheet(1);
  if (!sheet) {
    return NextResponse.json({ error: "Excel file has no worksheets" }, { status: 400 });
  }

  const rows: Record<string, string>[] = [];
  let headers: string[] = [];
  
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      headers = (row.values as string[]).map(h => typeof h === "string" ? h.toLowerCase().trim() : "");
    } else {
      const rowData: Record<string, string> = {};
      headers.forEach((h, idx) => {
        if (!h) return;
        let val = row.getCell(idx).value;
        if (typeof val === "object" && val !== null) {
          if ('text' in val) val = (val as any).text;
          else if ('result' in val) val = (val as any).result;
        }
        rowData[h] = val ? String(val).trim() : "";
      });
      if (Object.values(rowData).some(v => v !== "")) {
        rows.push(rowData);
      }
    }
  });

  if (rows.length === 0) {
    return NextResponse.json({ error: "Excel file contains no data rows" }, { status: 400 });
  }

  // Pre-fetch classes if role is STUDENT
  const classMap = new Map<string, number>();
  if (role === "STUDENT") {
    const classes = await prisma.class.findMany({ where: { isGraduated: false } });
    for (const c of classes) {
      classMap.set(`${c.name} - Level ${c.level}`.toLowerCase(), c.id);
    }
  }

  let created = 0;
  const errors: RowError[] = [];

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2; // +1 for 0-index, +1 for header
    const row = rows[i];

    let validationError: RowError | null = null;
    for (const field of requiredFields) {
      if (!row[field]) {
        validationError = { row: rowNum, field, message: `${field} is required` };
        break;
      }
    }

    if (validationError) {
      errors.push(validationError);
      continue;
    }

    try {
      const emailLocal = row.email.includes("@") ? row.email.split("@")[0] : row.email;
      const passwordHash = await bcrypt.hash(emailLocal, 12);

      let classId: number | null = null;
      if (role === "STUDENT" && row.class) {
        classId = classMap.get(row.class.toLowerCase()) ?? null;
      }

      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: row.email,
            name: row.name,
            role: role as "STUDENT" | "LECTURER" | "ADMIN",
            passwordHash,
          },
        });

        if (role === "STUDENT") {
          await tx.studentProfile.create({
            data: { id: user.id, program: row.program, classId },
          });
        } else if (role === "LECTURER") {
          await tx.lecturerProfile.create({
            data: { id: user.id, department: row.department, title: row.title },
          });
        } else if (role === "ADMIN") {
          await tx.adminProfile.create({ data: { id: user.id } });
        }
      });

      created++;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        errors.push({ row: rowNum, field: "email", message: "Email already exists" });
      } else {
        errors.push({ row: rowNum, field: "unknown", message: "Unexpected error creating user" });
      }
    }
  }

  if (created > 0) {
    await logAction(
      "USER_BULK_IMPORT",
      `Bulk import completed: ${created} ${role.toLowerCase()}s created successfully`,
      "USER"
    );
  }

  if (errors.length === 0) {
    return NextResponse.json({ created, failed: 0, errors: [] }, { status: 200 });
  }
  return NextResponse.json({ created, failed: errors.length, errors }, { status: 207 });
}
