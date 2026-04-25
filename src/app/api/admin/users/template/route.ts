import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

const VALID_ROLES = ["STUDENT", "LECTURER", "ADMIN"] as const;
type ValidRole = (typeof VALID_ROLES)[number];

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { "Content-Type": "application/json" } });
  }

  const role = request.nextUrl.searchParams.get("role");
  if (!role || !VALID_ROLES.includes(role as ValidRole)) {
    return new Response(JSON.stringify({ error: "role must be one of STUDENT, LECTURER, ADMIN" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Users");

  if (role === "STUDENT") {
    sheet.addRow(["email", "name", "program", "class"]);

    const classes = await prisma.class.findMany({
      where: { isGraduated: false },
      orderBy: [{ level: "asc" }, { name: "asc" }]
    });

    const classNames = classes.map(c => `${c.name} - Level ${c.level}`);

    if (classNames.length > 0) {
      const dataSheet = workbook.addWorksheet("Data", { state: "hidden" });
      classNames.forEach((name, idx) => {
        dataSheet.getCell(`A${idx + 1}`).value = name;
      });

      for (let i = 2; i <= 500; i++) {
        sheet.getCell(`D${i}`).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`Data!$A$1:$A$${classNames.length}`]
        };
      }
    }

    sheet.addRow(["4211230210@live.gctu.edu.gh", "John Doe", "Computer Science", classNames[0] || ""]);
  } else if (role === "LECTURER") {
    sheet.addRow(["email", "name", "department", "title"]);
    sheet.addRow(["kephas.tetteh@live.gctu.edu.gh", "Kephas Tetteh", "Computer Science", "Dr."]);
  } else if (role === "ADMIN") {
    sheet.addRow(["email", "name"]);
    sheet.addRow(["admin.user@live.gctu.edu.gh", "Admin User"]);
  }

  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF002388" } };
  sheet.columns.forEach(col => { col.width = 30; });
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer as BlobPart, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="user-template-${role.toLowerCase()}.xlsx"`,
    },
  });
}
