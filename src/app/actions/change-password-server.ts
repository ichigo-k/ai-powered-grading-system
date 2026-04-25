"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import bcrypt from "bcrypt";
import { logAction } from "@/lib/audit";

export async function changePasswordAction(formData: FormData) {
	try {
		const session = await getSession();
		if (!session?.user?.email) {
			return { success: false, error: "Unauthorized access" };
		}

		const currentPassword = formData.get("currentPassword") as string;
		const newPassword = formData.get("newPassword") as string;
		const confirmPassword = formData.get("confirmPassword") as string;

		if (!currentPassword || !newPassword || !confirmPassword) {
			return { success: false, error: "All fields are required" };
		}

		if (newPassword !== confirmPassword) {
			return { success: false, error: "New passwords do not match" };
		}

		if (newPassword.length < 8) {
			return { success: false, error: "New password must be at least 8 characters long" };
		}

		// Get user
		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
		});

		if (!user) {
			return { success: false, error: "User not found" };
		}

		// Verify current password
		const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
		if (!isValid) {
			return { success: false, error: "Incorrect current password" };
		}

		// Hash new password and update
		const newHash = await bcrypt.hash(newPassword, 10);
		await prisma.user.update({
			where: { id: user.id },
			data: { passwordHash: newHash },
		});

		// Log the action
		await logAction(
			"PASSWORD_CHANGED",
			`Password changed for user ${user.email}`,
			"USER"
		);

		return { success: true };
	} catch (error) {
		console.error("Change password error:", error);
		return { success: false, error: "An unexpected error occurred" };
	}
}
