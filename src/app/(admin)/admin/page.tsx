import { getAdminDashboardStats } from "@/lib/admin-stats";
import { getSession } from "@/lib/session";
import { Suspense } from "react";
import {
	Users,
	GraduationCap,
	BookOpen,
	ArrowUpRight,
	AlertTriangle,
	Layers,
	History,
	UserCheck,
	Layout,
	Settings,
	Shield
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function AdminDashboardPage() {
	const session = await getSession();
	const name = session?.user?.name ?? "Administrator";

	return (
		<div className="mx-auto max-w-7xl space-y-12">
			{/* Minimal Hero Section - Loads instantly */}
			<section className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight text-slate-900">
						Good morning, {name.split(" ")[0]}
					</h1>
					<p className="mt-1 text-sm text-slate-500 font-medium">
						System overview and administrative controls.
					</p>
				</div>
			</section>

			{/* Heavy Data Section - Lazy Loaded */}
			<Suspense fallback={<DashboardSkeleton />}>
				<DashboardContent />
			</Suspense>
		</div>
	);
}

function DashboardSkeleton() {
	return (
		<div className="space-y-12 animate-pulse">
			<section className="rounded-2xl border-2 border-slate-100 bg-white overflow-hidden">
				<div className="grid grid-cols-2 divide-y-2 divide-slate-50 md:grid-cols-4 md:divide-y-0 md:divide-x-2">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="p-8">
							<div className="flex items-center justify-between mb-4">
								<div className="h-10 w-10 rounded-xl bg-slate-100" />
								<div className="h-5 w-12 rounded-lg bg-slate-100" />
							</div>
							<div className="space-y-2">
								<div className="h-8 w-16 bg-slate-100 rounded-lg" />
								<div className="h-3 w-24 bg-slate-100 rounded-lg" />
							</div>
						</div>
					))}
				</div>
			</section>
			<div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
				{/* Audit Log Skeleton */}
				<div className="rounded-2xl border-2 border-slate-100 bg-white">
					<div className="flex items-center justify-between border-b-2 border-slate-50 px-8 py-6">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-xl bg-slate-100" />
							<div className="h-6 w-32 rounded-lg bg-slate-100" />
						</div>
						<div className="h-4 w-20 rounded-lg bg-slate-100" />
					</div>
					<div className="divide-y-2 divide-slate-50">
						{[1, 2, 3, 4, 5].map((i) => (
							<div key={i} className="px-8 py-5">
								<div className="flex items-center gap-2.5 mb-2">
									<div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
									<div className="h-4 w-32 rounded-lg bg-slate-100" />
								</div>
								<div className="h-3 w-3/4 rounded-lg bg-slate-100 ml-4 mb-3" />
								<div className="h-2 w-20 rounded-lg bg-slate-100 ml-4" />
							</div>
						))}
					</div>
				</div>

				{/* Health Center Skeleton */}
				<div className="rounded-2xl border-2 border-slate-100 bg-white">
					<div className="p-8 border-b-2 border-slate-50 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-xl bg-slate-100" />
							<div className="space-y-2">
								<div className="h-4 w-24 rounded-lg bg-slate-100" />
								<div className="h-2 w-32 rounded-lg bg-slate-100" />
							</div>
						</div>
					</div>
					<div className="p-8 space-y-6">
						<div className="space-y-4">
							{[1, 2, 3].map((i) => (
								<div key={i} className="flex gap-4">
									<div className="mt-1 h-5 w-1 rounded-full bg-slate-200" />
									<div className="h-4 w-full rounded-lg bg-slate-100" />
								</div>
							))}
						</div>
						<div className="grid gap-4 pt-6 mt-6 border-t-2 border-slate-50">
							{[1, 2, 3].map((i) => (
								<div key={i} className="flex items-center justify-between py-1">
									<div className="h-3 w-20 rounded-lg bg-slate-100" />
									<div className="flex items-center gap-3">
										<div className="h-1 w-12 rounded-full bg-slate-100" />
										<div className="h-4 w-6 rounded-lg bg-slate-100" />
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

async function DashboardContent() {
	// Live data fetch happens here, so it doesn't block the main page load
	const { stats, structuralStats, auditLogs, auditAlerts, healthStatus } = await getAdminDashboardStats();

	return (
		<>
			{/* Unified Summary Card - Flat Style */}
			<section className="rounded-2xl border-2 border-slate-100 bg-white overflow-hidden">
				<div className="grid grid-cols-2 divide-y-2 divide-slate-50 md:grid-cols-4 md:divide-y-0 md:divide-x-2">
					{stats.map((item, idx) => {
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
										Live
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

			<div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
				<div className="space-y-12">
					{/* Audit Log Card - Replacing Recent Accounts */}
					<section className="rounded-2xl border-2 border-slate-100 bg-white">
						<div className="flex items-center justify-between border-b-2 border-slate-50 px-8 py-6">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
									<History size={20} />
								</div>
								<h2 className="text-xl font-semibold text-slate-900">System Audit Log</h2>
							</div>
							<Link href="/admin/settings?tab=logs" className="text-sm font-semibold text-[#002388] hover:underline">
								Full history
							</Link>
						</div>
						<div className="divide-y-2 divide-slate-50 max-h-[340px] overflow-y-auto no-scrollbar">
							{auditLogs.length > 0 ? (
								auditLogs.map((log) => (
									<div
										key={log.id}
										className="group flex items-start justify-between px-8 py-5 transition-colors hover:bg-slate-50/30"
									>
										<div className="min-w-0">
											<div className="flex items-center gap-2.5">
												<span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
													log.category === 'USER' ? 'bg-blue-500' :
													log.category === 'CLASS' ? 'bg-purple-500' :
													log.category === 'COURSE' ? 'bg-amber-500' : 'bg-rose-500'
												}`} />
												<p className="text-sm font-bold text-slate-900 uppercase tracking-wide group-hover:text-[#002388] transition-colors">{log.action.replace(/_/g, " ")}</p>
											</div>
											<p className="text-sm font-medium text-slate-500 mt-1 leading-relaxed pl-4">{log.details}</p>
											<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 pl-4">
												{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
											</p>
										</div>
									</div>
								))
							) : (
								<div className="p-12 text-center">
									<p className="text-sm font-medium text-slate-400">No recent activity recorded.</p>
								</div>
							)}
						</div>
					</section>
				</div>

				<div className="space-y-12">
					{/* Health Center */}
					<section className="rounded-2xl border-2 border-slate-100 bg-white overflow-hidden">
						<div className="p-8 border-b-2 border-slate-50 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className={`flex h-10 w-10 items-center justify-center rounded-xl ${healthStatus === "Warning" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
									<AlertTriangle size={20} />
								</div>
								<div>
									<h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Health Center</h2>
									<p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">System Status: {healthStatus}</p>
								</div>
							</div>
						</div>
						
						<div className="p-8 space-y-6">
							{/* Actionable Alerts */}
							<div className="space-y-4">
								{auditAlerts.map((alert, i) => (
									<div key={i} className="flex gap-4 group cursor-default">
										<div className={`mt-1 h-5 w-1 rounded-full ${healthStatus === "Warning" ? "bg-amber-200 group-hover:bg-amber-500" : "bg-emerald-200 group-hover:bg-emerald-500"} transition-colors`} />
										<p className="text-sm font-medium text-slate-600 leading-snug">
											{alert}
										</p>
									</div>
								))}
							</div>

							{/* Summary Metrics */}
							<div className="grid gap-3 pt-6 mt-6 border-t-2 border-slate-50">
								{structuralStats.map((item) => (
									<div key={item.label} className="flex items-center justify-between py-1 group">
										<span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest transition-colors group-hover:text-slate-600">{item.label}</span>
										<div className="flex items-center gap-3">
											<div className="h-1 w-12 rounded-full bg-slate-50 overflow-hidden">
												<div 
													className="h-full rounded-full transition-all duration-1000" 
													style={{ 
														width: `${Math.min((parseInt(item.value) / 10) * 100, 100)}%`, 
														backgroundColor: item.tone 
													}} 
												/>
											</div>
											<span className="text-sm font-bold tabular-nums" style={{ color: item.tone }}>{item.value}</span>
										</div>
									</div>
								))}
							</div>
						</div>
					</section>
				</div>
			</div>
		</>
	);
}

