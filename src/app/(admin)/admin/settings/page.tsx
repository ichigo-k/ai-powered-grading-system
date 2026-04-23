import { 
	Calendar, 
	ShieldCheck, 
	Lock, 
	Globe, 
	ArrowRight,
	Bell,
	Database,
	Key
} from "lucide-react";

export default function AdminSettingsPage() {
	const settingsGroups = [
		{
			title: "Academic Configuration",
			icon: Calendar,
			items: [
				{ label: "Active Session", description: "Set the current academic year and semester.", icon: Calendar },
				{ label: "Portal Defaults", description: "Manage labels, display formats, and defaults.", icon: Globe },
			]
		},
		{
			title: "Security & Access",
			icon: ShieldCheck,
			items: [
				{ label: "Role Permissions", description: "Define access levels for admins and lecturers.", icon: Lock },
				{ label: "Account Rules", description: "Suspension logic and password requirements.", icon: Key },
			]
		},
		{
			title: "System & data",
			icon: Database,
			items: [
				{ label: "Notifications", description: "Configure system-wide alert behavior.", icon: Bell },
				{ label: "Backup & Sync", description: "Manage database snapshots and sync tasks.", icon: Database },
			]
		}
	];

	return (
		<div className="mx-auto max-w-5xl space-y-8">
			<div className="space-y-1">
				<h1 className="text-3xl font-bold tracking-tight text-slate-900">System Settings</h1>
			</div>

			<div className="space-y-10">
				{settingsGroups.map((group) => (
					<div key={group.title} className="space-y-4">
						<div className="flex items-center gap-2 px-1">
							<group.icon size={18} className="text-slate-400" />
							<h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">{group.title}</h2>
						</div>
						<div className="grid gap-4 md:grid-cols-2">
							{group.items.map((item) => (
								<button
									key={item.label}
									className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-slate-900 text-left"
								>
									<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded border border-slate-200 bg-white text-slate-400 transition-colors group-hover:border-slate-900 group-hover:text-slate-900">
										<item.icon size={22} />
									</div>
									<div className="flex-1 space-y-1">
										<p className="text-sm font-bold text-slate-900 group-hover:text-slate-700 transition-colors">{item.label}</p>
										<p className="text-xs font-medium text-slate-500 leading-relaxed">{item.description}</p>
										<div className="pt-2 flex items-center gap-1 text-[10px] font-bold text-slate-900 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
											Manage <ArrowRight size={12} />
										</div>
									</div>
								</button>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
