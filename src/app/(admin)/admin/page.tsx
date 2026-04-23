import {
	adminStats,
	adminStructuralStats,
	classes,
	courseAssignments,
	quickActions,
	recentUsers,
	setupAlerts,
} from "@/lib/admin-dashboard";
import { getSession } from "@/lib/session";
import {
	Users,
	UserPlus,
	GraduationCap,
	BookOpen,
	ArrowUpRight,
	AlertTriangle,
	MoreHorizontal,
	Plus,
	ArrowRight,
	Layers
} from "lucide-react";
import Link from "next/link";

function StatusBadge({ status }: { status: string }) {
	const getStatusStyles = (status: string) => {
		const s = status.toLowerCase();
		if (s === "active" || s === "ready" || s === "complete") {
			return "bg-emerald-50 text-emerald-700 border-emerald-100";
		}
		if (
			s.includes("needs") ||
			s.includes("required") ||
			s.includes("pending") ||
			s.includes("missing")
		) {
			return "bg-amber-50 text-amber-700 border-amber-100";
		}
		return "bg-slate-50 text-slate-600 border-slate-100";
	};

	return (
		<span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(status)}`}>
			{status}
		</span>
	);
}

export default async function AdminDashboardPage() {
	const session = await getSession();
	const name = session?.user?.name ?? "Administrator";

	return (
		<div className="mx-auto max-w-7xl space-y-12">
			{/* Minimal Hero Section */}
			<section className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight text-slate-900">
						Good morning, {name.split(" ")[0]}
					</h1>
					<p className="mt-1 text-sm text-slate-500 font-medium">
						Here's what's happening with the assessment system today.
					</p>
				</div>
			</section>

			{/* Unified Summary Card - Flat Style */}
			<section className="rounded-2xl border-2 border-slate-100 bg-white overflow-hidden">
				<div className="grid grid-cols-2 divide-y-2 divide-slate-50 md:grid-cols-4 md:divide-y-0 md:divide-x-2">
					{adminStats.map((item, idx) => {
						const Icons = [Users, GraduationCap, Layers, BookOpen];
						const Icon = Icons[idx] || Users;
						return (
							<div
								key={item.label}
								className="group p-8 transition-colors hover:bg-slate-50/50"
							>
								<div className="flex items-center justify-between mb-4">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-all group-hover:scale-110 group-hover:bg-white group-hover:text-[#002388] group-hover:border-2 group-hover:border-[#002388]/10">
										<Icon size={20} />
									</div>
									<div className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
										<ArrowUpRight size={12} />
										2.4%
									</div>
								</div>
								<div>
									<p className="text-2xl font-semibold text-slate-900 tracking-tight">{item.value}</p>
									<p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mt-1">{item.label}</p>
								</div>
							</div>
						);
					})}
				</div>
			</section>

			{/* Compact Action Bar */}
			<section className="flex flex-wrap items-center gap-3">
				<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mr-2">Quick Actions:</span>
				{quickActions.map((action) => (
					<Link
						key={action.label}
						href={action.href}
						className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition-all hover:border-[#002388] hover:text-[#002388] active:scale-95"
					>
						<Plus size={14} />
						{action.label}
					</Link>
				))}
			</section>

			<div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
				<div className="space-y-12">
					{/* Recent Activity Card - Flat Style */}
					<section className="rounded-2xl border-2 border-slate-100 bg-white">
						<div className="flex items-center justify-between border-b-2 border-slate-50 px-8 py-6">
							<h2 className="text-xl font-semibold text-slate-900">Recent Activity</h2>
							<Link href="/admin/users" className="text-sm font-semibold text-[#002388] hover:underline">
								View all accounts
							</Link>
						</div>
						<div className="divide-y-2 divide-slate-50">
							{recentUsers.map((user) => (
								<div
									key={user.id}
									className="group flex items-center justify-between p-6 transition-colors hover:bg-slate-50/30"
								>
									<div className="flex items-center gap-5">
										<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xs font-semibold text-slate-600 transition-all group-hover:rotate-3 group-hover:bg-white group-hover:border-2 group-hover:border-slate-200">
											{user.name.split(" ").map(n => n[0]).join("")}
										</div>
										<div className="min-w-0">
											<p className="truncate text-base font-semibold text-slate-900 group-hover:text-[#002388] transition-colors">{user.name}</p>
											<p className="truncate text-xs font-medium text-slate-400 mt-0.5">{user.id} • {user.meta}</p>
										</div>
									</div>
									<div className="flex items-center gap-6">
										<StatusBadge status={user.status} />
										<button className="rounded-xl p-2.5 text-slate-300 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-90">
											<MoreHorizontal size={20} />
										</button>
									</div>
								</div>
							))}
						</div>
					</section>
				</div>

				<div className="space-y-12">
					{/* Refined Health Center */}
					<section className="rounded-3xl border-2 border-slate-100 bg-white overflow-hidden">
						<div className="p-8 border-b-2 border-slate-50 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
									<AlertTriangle size={20} />
								</div>
								<div>
									<h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Health Center</h2>
									<p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">System Status: Warning</p>
								</div>
							</div>
						</div>
						
						<div className="p-8 space-y-6">
							{/* Actionable Alerts */}
							<div className="space-y-4">
								{setupAlerts.slice(0, 3).map((alert, i) => (
									<div key={i} className="flex gap-4 group cursor-default">
										<div className="mt-1 h-5 w-1 rounded-full bg-amber-200 group-hover:bg-amber-500 transition-colors" />
										<p className="text-sm font-medium text-slate-600 leading-snug">
											{alert}
										</p>
									</div>
								))}
							</div>

							{/* Summary Metrics */}
							<div className="grid gap-3 pt-6 mt-6 border-t-2 border-slate-50">
								{adminStructuralStats.map((item) => (
									<div key={item.label} className="flex items-center justify-between py-1 group">
										<span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest transition-colors group-hover:text-slate-600">{item.label}</span>
										<div className="flex items-center gap-3">
											<div className="h-1 w-12 rounded-full bg-slate-50 overflow-hidden">
												<div 
													className="h-full rounded-full transition-all duration-1000" 
													style={{ 
														width: `${(parseInt(item.value) / 10) * 100}%`, 
														backgroundColor: item.tone 
													}} 
												/>
											</div>
											<span className="text-sm font-bold tabular-nums" style={{ color: item.tone }}>{item.value}</span>
										</div>
									</div>
								))}
							</div>

							<button className="w-full mt-4 flex items-center justify-center gap-2 rounded-2xl bg-[#002388] py-4 text-sm font-semibold text-white transition-all hover:bg-[#001a66] active:scale-[0.98]">
								Run System Audit
								<ArrowRight size={18} />
							</button>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
