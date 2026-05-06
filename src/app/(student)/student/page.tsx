import Link from "next/link";
import { getSession } from "@/lib/session";
import { getDashboardData } from "@/lib/student-queries";
import { prisma } from "@/lib/prisma";
import {
	Calendar,
	Clock,
	TrendingUp,
	CheckCircle2,
	AlertCircle,
	ArrowRight,
	Award,
	BookOpen,
} from "lucide-react";
import LiveBanner from "./LiveBanner";

const typeStyles: Record<string, { bg: string; text: string }> = {
	EXAM:       { bg: "#FEE2E2", text: "#DC2626" },
	QUIZ:       { bg: "#FEF3C7", text: "#D97706" },
	ASSIGNMENT: { bg: "#EDE9FE", text: "#7C3AED" },
};

export default async function StudentDashboardPage() {
	const session = await getSession();
	const displayName = session?.user?.name ?? session?.user?.email?.split("@")[0] ?? "Student";

	const email = session?.user?.email;
	const user = email
		? await prisma.user.findUnique({ where: { email }, select: { id: true } })
		: null;

	const studentId = user?.id ?? null;
	const data = studentId
		? await getDashboardData(studentId)
		: { upcomingCount: 0, ongoingCount: 0, completedCount: 0, averageScore: null, upcomingAssessments: [], recentResults: [] };

	const { upcomingCount, ongoingCount, completedCount, averageScore, upcomingAssessments, recentResults } = data;

	const isEmpty = upcomingCount === 0 && ongoingCount === 0 && completedCount === 0 && recentResults.length === 0;
	const ongoingItems = upcomingAssessments.filter(a => a.status === "ongoing");

	return (
		<div className="mx-auto max-w-6xl space-y-6 pb-8">
			<header className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-slate-900">
						Welcome back, <span className="text-[#002388]">{displayName}</span>
					</h1>
					<p className="mt-1 text-sm text-slate-500">
						Here's what's happening with your courses today.
					</p>
				</div>
			</header>

			{ongoingItems.length > 0 && <LiveBanner items={ongoingItems} />}

			{isEmpty ? (
				<div className="rounded-xl border border-slate-200 bg-white px-6 py-16 flex flex-col items-center gap-3 text-center">
					<BookOpen size={40} className="text-slate-300" />
					<p className="text-lg font-medium text-slate-700">No assessments yet</p>
					<p className="text-sm text-slate-400">
						You haven't been assigned to a class yet, or no assessments have been scheduled.
					</p>
				</div>
			) : (
				<>
					<section className="rounded-xl border border-slate-200 bg-white px-6 py-4 grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
						{[
							{ label: "Upcoming", value: upcomingCount, icon: Calendar },
							{ label: "Live now", value: ongoingCount, icon: AlertCircle },
							{ label: "Completed", value: completedCount, icon: CheckCircle2 },
							{ label: "Avg. score", value: averageScore != null ? `${averageScore.toFixed(2)}%` : "—", icon: TrendingUp },
						].map((item, i) => (
							<div key={item.label} className={`flex items-center gap-3 px-5 first:pl-0 last:pr-0 ${i >= 2 ? "mt-4 sm:mt-0 border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0" : ""}`}>
								<item.icon size={16} className="text-slate-400 shrink-0" />
								<div>
									<p className="text-xs text-slate-400">{item.label}</p>
									<p className="text-xl font-semibold text-slate-900">{item.value}</p>
								</div>
							</div>
						))}
					</section>

					<div className="grid gap-6 xl:grid-cols-2">
						<section className="flex flex-col gap-4">
							<div className="px-1">
								<h2 className="flex items-center gap-2 text-lg font-medium text-slate-900">
									<Calendar className="text-[#002388]" size={20} />
									Upcoming This Week
								</h2>
							</div>
							<div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
								{upcomingAssessments.length === 0 ? (
									<p className="p-6 text-sm text-slate-400 text-center">No upcoming assessments.</p>
								) : (
									upcomingAssessments.map((assessment, i) => (
										<div
											key={assessment.id}
											className={`p-4 transition-colors hover:bg-slate-50 ${i !== 0 ? "border-t border-slate-200" : ""}`}
										>
											<div className="flex items-start justify-between gap-3">
												<div className="space-y-1">
													<h3 className="font-medium text-slate-900">{assessment.title}</h3>
													<div className="flex flex-col gap-1 text-sm text-slate-500 sm:flex-row sm:items-center">
														<span className="font-medium text-slate-600">{assessment.courseTitle}</span>
														<span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block"></span>
														<span className="flex items-center gap-1.5">
															<Clock size={14} />
															{assessment.startsAt.toLocaleDateString()}
														</span>
													</div>
												</div>
												<span className="flex-shrink-0 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 capitalize">
													{assessment.status}
												</span>
											</div>
										</div>
									))
								)}
							</div>
						</section>

						<section className="flex flex-col gap-4">
							<div className="flex items-center justify-between px-1">
								<h2 className="flex items-center gap-2 text-lg font-medium text-slate-900">
									<Award className="text-[#002388]" size={20} />
									Recent Results
								</h2>
								<Link
									href="/student/assessments"
									className="flex items-center gap-1 text-sm font-medium text-[#002388] hover:text-[#0B4DBB] transition-colors"
								>
									View all
									<ArrowRight size={14} />
								</Link>
							</div>
							<div className="rounded-xl overflow-hidden bg-white border border-slate-200">
								{recentResults.length === 0 ? (
									<p className="p-6 text-sm text-slate-400 text-center">No results yet.</p>
								) : (
									recentResults.map((result, i) => {
										const type = result.type.toUpperCase() as keyof typeof typeStyles;
										const style = typeStyles[type] ?? { bg: "#F1F5F9", text: "#475569" };
										const score = result.score ?? 0;
										const barColor = score >= 70 ? "#22c55e" : score >= 50 ? "#f59e0b" : score >= 20 ? "#f97316" : "#ef4444";
										return (
											<div
												key={result.id}
												className={`flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-slate-50 ${i !== 0 ? "border-t border-slate-200" : ""}`}
											>
												<div className="min-w-0 flex-1">
													<p className="font-semibold text-slate-900 truncate text-sm">{result.title}</p>
													<p className="text-xs text-slate-400 mt-0.5 truncate">{result.courseTitle}</p>
												</div>
												<div className="flex items-center gap-4 shrink-0">
													<span
														className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-center"
														style={{ background: style.bg, color: style.text }}
													>
														{result.type}
													</span>
													<div className="flex items-center gap-2 w-28">
														<div className="h-1.5 flex-1 rounded-full bg-slate-100">
															<div className="h-1.5 rounded-full" style={{ width: `${Math.min(score, 100)}%`, background: barColor }} />
														</div>
														<p className="text-sm font-semibold text-slate-800 whitespace-nowrap w-12 text-right">
															{result.score.toFixed(2)}%
														</p>
													</div>
												</div>
											</div>
										);
									})
								)}
							</div>
						</section>
					</div>
				</>
			)}
		</div>
	);
}
