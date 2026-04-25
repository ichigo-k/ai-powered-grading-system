"use client";

import { useState } from "react";
import { Key, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordAction } from "@/app/actions/change-password-server";

export default function ChangePasswordPage() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(false);

		const formData = new FormData(e.currentTarget);
		const result = await changePasswordAction(formData);

		if (result.success) {
			setSuccess(true);
			(e.target as HTMLFormElement).reset();
		} else {
			setError(result.error || "Failed to change password");
		}
		
		setLoading(false);
	};

	return (
		<div className="mx-auto max-w-6xl space-y-8 pb-8">
			<header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-1">
					<h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
						<Key className="text-[#002388]" size={28} />
						Change Password
					</h1>
					<p className="text-sm text-slate-500">
						Update your administrative credentials securely.
					</p>
				</div>
			</header>

			<div className="max-w-xl">
				<form onSubmit={handleSubmit} className="flex flex-col gap-5">
					{error && (
						<div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
							<AlertCircle size={16} />
							{error}
						</div>
					)}
					{success && (
						<div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
							<CheckCircle2 size={16} />
							Password successfully updated
						</div>
					)}

					<div className="flex flex-col gap-2">
						<Label htmlFor="currentPassword" className="text-slate-700 font-medium">Current Password</Label>
						<Input 
							id="currentPassword"
							type="password" 
							name="currentPassword" 
							required
							className="rounded-lg h-10 border-slate-200 focus-visible:ring-[#002388]" 
						/>
					</div>

					<div className="flex flex-col gap-2">
						<Label htmlFor="newPassword" className="text-slate-700 font-medium">New Password</Label>
						<Input 
							id="newPassword"
							type="password" 
							name="newPassword" 
							required
							minLength={8}
							placeholder="Minimum 8 characters"
							className="rounded-lg h-10 border-slate-200 focus-visible:ring-[#002388]" 
						/>
					</div>

					<div className="flex flex-col gap-2">
						<Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Confirm New Password</Label>
						<Input 
							id="confirmPassword"
							type="password" 
							name="confirmPassword" 
							required
							minLength={8}
							className="rounded-lg h-10 border-slate-200 focus-visible:ring-[#002388]" 
						/>
					</div>

					<div className="pt-2">
						<Button 
							type="submit" 
							disabled={loading}
							className="bg-[#002388] hover:bg-[#0B4DBB] text-white rounded-lg h-10 font-medium transition-colors flex items-center justify-center gap-2 px-6"
						>
							<Save size={16} />
							{loading ? "Updating..." : "Update Password"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
