import Link from "next/link";
import { getSession } from "@/lib/session";
import {
	formatAssessmentDate,
	getRelativeLabel,
	studentAlerts,
	studentAssessments,
	typeStyles,
} from "@/lib/student-assessments";
import {
	Calendar,
	Clock,
	MapPin,
	TrendingUp,
	CheckCircle2,
	AlertCircle,
	ArrowRight,
	BookOpen,
	Award,
	BellDot
} from "lucide-react";
import LiveBanner from "./LiveBanner";

export default async function StudentDashboardPage() {
	const session = await getSession();
	const displayName = session?.user?.name ?? session?.user?.userId ?? "Student";

	const upcoming = studentAssessments.filter(
		(assessment) => assessment.status === "upcoming",
	);
	const ongoing = studentAssessments.filter(
		(assessment) => assessment.status === "ongoing",
	);
	const completed = studentAssessments.filter(
		(assessment) => assessment.status === "completed",
	);
	const nextAssessment = [...ongoing, ...upcoming].sort((a, b) =>
		a.date.localeCompare(b.date),
	)[0];
	const averageScore = completed.length
		? Math.round(
			completed.reduce(
				(total, assessment) => total + (assessment.score ?? 0),
				0,
			) / completed.length,
		)
		: 0;

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

			{ongoing.length > 0 && <LiveBanner items={ongoing} />}

			{nextAssessment && nextAssessment.status !== "ongoing" ? (
				<section className="rounded-xl border border-slate-200 bg-white p-6 lg:p-8">
					<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
						<div className="space-y-5 flex-1">
							<div className="flex flex-wrap items-center gap-3">
								<span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#002388]">
									{nextAssessment.status === "ongoing" ? (
										<>
											<span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
											Live now
										</>
									) : (
										"Next assessment"
									)}
								</span>
								<span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
									{nextAssessment.courseCode}
								</span>
							</div>

							<div>
								<h2 className="text-2xl lg:text-3xl font-semibold text-slate-900">
									{nextAssessment.title}
								</h2>
								<p className="mt-1.5 flex items-center gap-2 text-slate-600">
									<BookOpen size={16} className="opacity-70" />
									{nextAssessment.course}
								</p>
							</div>

							<div className="flex flex-wrap gap-3 text-sm text-slate-600">
								<div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
									<Calendar size={16} className="text-slate-400" />
									{formatAssessmentDate(nextAssessment.date, "long")}
								</div>
								<div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
									<Clock size={16} className="text-slate-400" />
									{nextAssessment.time}
								</div>
								<div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
									<MapPin size={16} className="text-slate-400" />
									{nextAssessment.venue}
								</div>
							</div>
						</div>

						<div className="flex min-w-[220px] flex-col justify-center rounded-xl border border-slate-200 p-5 lg:p-6">
							<p className="text-xs font-medium uppercase tracking-wider text-slate-500">
								Countdown
							</p>
							<p className="mt-2 text-2xl lg:text-3xl font-semibold text-[#002388]">
								{getRelativeLabel(nextAssessment.date)}
							</p>
							<p className="mt-2 text-sm text-slate-500 leading-relaxed">
								{nextAssessment.note ??
									"Make sure to arrive at least 15 minutes early."}
							</p>
						</div>
					</div>
				</section>
			) : null}

			<section className="rounded-xl border border-slate-200 bg-white px-6 py-4 grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
				{[
					{ label: "Upcoming", value: upcoming.length, icon: Calendar },
					{ label: "Live now", value: ongoing.length, icon: AlertCircle },
					{ label: "Completed", value: completed.length, icon: CheckCircle2 },
					{ label: "Avg. score", value: `${averageScore}%`, icon: TrendingUp },
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
						{[...ongoing, ...upcoming].slice(0, 3).map((assessment, i) => (
							<div
								key={assessment.id}
								className={`p-4 transition-colors hover:bg-slate-50 ${i !== 0 ? "border-t border-slate-200" : ""}`}
							>
								<div className="flex items-start justify-between gap-3">
									<div className="space-y-1">
										<h3 className="font-medium text-slate-900">
											{assessment.title}
										</h3>
										<div className="flex flex-col gap-1 text-sm text-slate-500 sm:flex-row sm:items-center">
											<span className="font-medium text-slate-600">{assessment.courseCode}</span>
											<span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block"></span>
											<span className="flex items-center gap-1.5">
												<Clock size={14} />
												{assessment.time}
											</span>
										</div>
									</div>
									<span className="flex-shrink-0 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600">
										{getRelativeLabel(assessment.date)}
									</span>
								</div>
							</div>
						))}
					</div>
				</section>

				<section className="flex flex-col gap-4">
					<div className="px-1">
						<h2 className="flex items-center gap-2 text-lg font-medium text-slate-900">
							<BellDot className="text-[#002388]" size={20} />
							Important Alerts
						</h2>
					</div>
					<div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
						{studentAlerts.map((alert, i) => (
							<div
								key={alert.id}
								className={`flex gap-3 p-4 transition-colors hover:bg-slate-50 ${i !== 0 ? "border-t border-slate-200" : ""}`}
							>
								<div className="mt-0.5 flex-shrink-0 text-amber-500">
									<AlertCircle size={18} />
								</div>
								<div>
									<h3 className="font-medium text-slate-800 text-sm">
										{alert.title}
									</h3>
									<p className="mt-0.5 text-sm text-slate-500">
										{alert.detail}
									</p>
								</div>
							</div>
						))}
					</div>
				</section>
			</div>

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
					{completed.slice(0, 4).map((assessment, i) => {
						const pct = assessment.score != null && assessment.total ? Math.round((assessment.score / assessment.total) * 100) : 0;
						const barColor = pct >= 85 ? "#22c55e" : pct >= 60 ? "#3b82f6" : "#f59e0b";
						return (
							<div
								key={assessment.id}
								className={`flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-slate-50 ${i !== 0 ? "border-t border-slate-200" : ""}`}
							>
								<div className="min-w-0 flex-1">
									<p className="font-semibold text-slate-900 truncate">{assessment.title}</p>
									<p className="text-xs text-slate-400 mt-0.5 truncate">{assessment.course}</p>
								</div>
								<div className="flex items-center gap-6 shrink-0">
									<span className="text-sm text-slate-400">{formatAssessmentDate(assessment.date)}</span>
									<span
										className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider w-14 text-center"
										style={{ background: typeStyles[assessment.type].bg, color: typeStyles[assessment.type].text }}
									>
										{assessment.type}
									</span>
									<div className="flex items-center gap-2 w-32">
										<div className="h-1.5 flex-1 rounded-full bg-slate-100">
											<div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: barColor }} />
										</div>
										<p className="text-sm font-semibold text-slate-800 whitespace-nowrap w-14 text-right">{assessment.score}/{assessment.total}</p>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</section>

		</div>
	);
}
