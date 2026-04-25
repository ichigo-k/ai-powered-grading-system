"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { saveSystemSettingsAction } from "@/app/actions/admin-settings-server";

export default function SystemSettingsForm({ initialSettings }: { initialSettings: any }) {
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		academicYear: initialSettings?.academicYear || "2023/2024",
		semester: initialSettings?.semester || "First Semester",
		contactEmail: initialSettings?.contactEmail || "admin@system.edu",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSave = async () => {
		setLoading(true);
		const result = await saveSystemSettingsAction(formData);
		if (result.success) {
			toast.success("System settings updated successfully.");
		} else {
			toast.error(result.error || "Failed to update system settings.");
		}
		setLoading(false);
	};

	return (
		<section className="space-y-6">
			<div className="grid gap-8">
				<div className="space-y-4">
					<h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Academic Configuration</h2>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label className="text-xs font-bold text-slate-700 uppercase tracking-tight ml-1">Current Academic Year</Label>
							<Input 
								name="academicYear"
								value={formData.academicYear} 
								onChange={handleChange}
								className="h-11 rounded-xl border-slate-200" 
							/>
						</div>
						<div className="space-y-2">
							<Label className="text-xs font-bold text-slate-700 uppercase tracking-tight ml-1">Current Semester</Label>
							<Input 
								name="semester"
								value={formData.semester} 
								onChange={handleChange}
								className="h-11 rounded-xl border-slate-200" 
							/>
						</div>
					</div>
				</div>

				<div className="space-y-4 pt-6 border-t border-slate-100">
					<h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Portal Information</h2>
					<div className="space-y-2">
						<Label className="text-xs font-bold text-slate-700 uppercase tracking-tight ml-1">Contact Email</Label>
						<Input 
							name="contactEmail"
							type="email"
							value={formData.contactEmail} 
							onChange={handleChange}
							className="h-11 rounded-xl border-slate-200" 
						/>
					</div>
				</div>

				<div className="pt-8">
					<Button 
						onClick={handleSave}
						disabled={loading}
						className="h-12 px-8 bg-[#002388] hover:bg-[#0B4DBB] text-white font-normal rounded-xl shadow-lg shadow-blue-900/10 flex items-center gap-2"
					>
						<Save size={18} />
						{loading ? "Saving..." : "Save System Changes"}
					</Button>
				</div>
			</div>
		</section>
	);
}
