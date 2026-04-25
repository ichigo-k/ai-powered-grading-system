"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";

export async function saveSystemSettingsAction(data: {
	academicYear: string;
	semester: string;
	contactEmail: string;
}) {
	try {

		const settings = await prisma.systemSettings.upsert({
			where: { id: 1 },
			update: {
				academicYear: data.academicYear,
				semester: data.semester,
				contactEmail: data.contactEmail,
			},
			create: {
				id: 1,
				academicYear: data.academicYear,
				semester: data.semester,
				contactEmail: data.contactEmail,
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
				data: { id: 1 }
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
