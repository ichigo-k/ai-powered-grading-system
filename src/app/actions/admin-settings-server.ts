"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";
import { DEFAULT_GRADING_SCALE, type GradeEntry } from "@/lib/grading-scale";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
}

export async function saveSystemSettingsAction(data: {
	academicYear: string;
	semester: string;
	contactEmail: string;
	gradingScale: GradeEntry[];
}) {
	try {
		await requireAdmin();

		const settings = await prisma.systemSettings.upsert({
			where: { id: 1 },
			update: {
				academicYear: data.academicYear,
				semester: data.semester,
				contactEmail: data.contactEmail,
				gradingScale: data.gradingScale,
			},
			create: {
				id: 1,
				academicYear: data.academicYear,
				semester: data.semester,
				contactEmail: data.contactEmail,
				gradingScale: data.gradingScale,
			},
		});

		await logAction(
			"SYSTEM_SETTINGS_UPDATED",
			`System settings updated: Academic Year set to ${data.academicYear}, Semester to ${data.semester}`,
			"SYSTEM"
		);

		revalidatePath("/admin/settings");
		return { success: true, settings };
	} catch (error: any) {
		console.error("Failed to save system settings:", error);
		return { success: false, error: "Failed to save system settings" };
	}
}

export async function getSystemSettingsAction() {
	try {

		let settings = await prisma.systemSettings.findFirst();
		if (!settings) {
			settings = await prisma.systemSettings.create({
				data: { id: 1, gradingScale: DEFAULT_GRADING_SCALE as any },
			});
		}
		return settings;
	} catch (error) {
		console.error("Failed to fetch system settings:", error);
		return null;
	}
}

export async function clearAuditLogsAction() {
	try {
		await requireAdmin();
		await prisma.auditLog.deleteMany({});
		await logAction(
			"SYSTEM_LOGS_CLEARED",
			"All system audit logs were permanently deleted",
			"SYSTEM"
		);
		revalidatePath("/admin/settings");
		return { success: true };
	} catch (error) {
		console.error("Failed to clear audit logs:", error);
		return { success: false, error: "Failed to clear audit logs" };
	}
}

/**
 * Fetch the grading scale for use in server components and API routes.
 * Returns the parsed GradeEntry array, falling back to the default scale.
 */
export async function getGradingScaleAction(): Promise<GradeEntry[]> {
	try {
		const settings = await prisma.systemSettings.findFirst({
			select: { gradingScale: true },
		});
		if (!settings?.gradingScale) return DEFAULT_GRADING_SCALE;
		const raw = settings.gradingScale;
		if (!Array.isArray(raw)) return DEFAULT_GRADING_SCALE;
		return raw as GradeEntry[];
	} catch {
		return DEFAULT_GRADING_SCALE;
	}
}
