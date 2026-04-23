import Link from "next/link";
import { getSession } from "@/lib/session";
import {
	formatAssessmentDate,
	getRelativeLabel,
	gradeColor,
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
		<div className="mx-auto max-w-6xl space-y-8 pb-8">
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

			{nextAssessment ? (
				<section className="rounded-2xl border border-[#002388]/10 bg-[#002388]/[0.02] p-6 lg:p-8">
					<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
						<div className="space-y-5 flex-1">
							<div className="flex flex-wrap items-center gap-3">
								<span className="inline-flex items-center gap-1.5 rounded-full bg-[#002388]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#002388]">
									{nextAssessment.status === "ongoing" ? (
										<>
											<span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
											Live now
										</>
									) : (
										"Next assessment"
									)}
								</span>
								<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
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
								<div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 border border-slate-200">
									<Calendar size={16} className="text-slate-400" />
									{formatAssessmentDate(nextAssessment.date, "long")}
								</div>
								<div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 border border-slate-200">
									<Clock size={16} className="text-slate-400" />
									{nextAssessment.time}
								</div>
								<div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 border border-slate-200">
									<MapPin size={16} className="text-slate-400" />
									{nextAssessment.venue}
								</div>
							</div>
						</div>

						<div className="flex min-w-[220px] flex-col justify-center rounded-2xl border border-slate-200 bg-white p-5 lg:p-6 shadow-sm">
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

			<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{[
					{
						label: "Upcoming",
						value: upcoming.length,
						icon: Calendar,
						color: "#1967D2",
						bg: "#EFF6FF",
					},
					{
						label: "Live now",
						value: ongoing.length,
						icon: AlertCircle,
						color: "#16A34A",
						bg: "#DCFCE7",
					},
					{
						label: "Completed",
						value: completed.length,
						icon: CheckCircle2,
						color: "#475569",
						bg: "#F8FAFC",
					},
					{
						label: "Average score",
						value: `${averageScore}%`,
						icon: TrendingUp,
						color: "#D97706",
						bg: "#FFF7ED",
					},
				].map((item) => (
					<div
						key={item.label}
						className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300"
					>
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-slate-500">
								{item.label}
							</span>
							<div
								className="rounded-full p-2"
								style={{ background: item.bg, color: item.color }}
							>
								<item.icon size={16} />
							</div>
						</div>
						<p className="mt-4 text-3xl font-semibold text-slate-900">
							{item.value}
						</p>
					</div>
				))}
			</section>

			<div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
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

					<div className="flex flex-col gap-3">
						{completed.slice(0, 4).map((assessment) => {
							const tone = gradeColor(assessment.grade ?? "C");
							return (
								<div
									key={assessment.id}
									className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between"
								>
									<div className="flex items-center gap-4">
										<div
											className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
											style={{ background: `${assessment.courseColor}15` }}
										>
											<BookOpen size={20} style={{ color: assessment.courseColor }} />
										</div>
										<div>
											<div className="flex flex-wrap items-center gap-2">
												<h3 className="text-base font-medium text-slate-900">
													{assessment.title}
												</h3>
												<span
													className="rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider"
													style={{
														background: typeStyles[assessment.type].bg,
														color: typeStyles[assessment.type].text,
													}}
												>
													{assessment.type}
												</span>
											</div>
											<p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
												<span className="font-medium text-slate-600">{assessment.courseCode}</span>
												<span className="h-1 w-1 rounded-full bg-slate-300"></span>
												{formatAssessmentDate(assessment.date)}
											</p>
										</div>
									</div>
									<div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center">
										<div
											className="inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-base font-semibold"
											style={{ background: tone.bg, color: tone.text }}
										>
											{assessment.grade}
										</div>
										<p className="mt-1.5 text-sm font-medium text-slate-400">
											{assessment.score} / {assessment.total} pts
										</p>
									</div>
								</div>
							);
						})}
					</div>
				</section>

				<div className="flex flex-col gap-6">
					<section className="flex flex-col gap-4">
						<div className="px-1">
							<h2 className="flex items-center gap-2 text-lg font-medium text-slate-900">
								<Calendar className="text-[#002388]" size={20} />
								Upcoming This Week
							</h2>
						</div>
						<div className="flex flex-col gap-3">
							{[...ongoing, ...upcoming].slice(0, 3).map((assessment) => (
								<div
									key={assessment.id}
									className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-[#002388]/30"
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
										<span className="flex-shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#002388]">
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
						<div className="flex flex-col gap-3">
							{studentAlerts.map((alert) => (
								<div
									key={alert.id}
									className="flex gap-3 rounded-2xl border border-amber-100 bg-amber-50/50 p-4"
								>
									<div className="mt-0.5 flex-shrink-0 text-amber-500">
										<AlertCircle size={18} />
									</div>
									<div>
										<h3 className="font-medium text-amber-900 text-sm">
											{alert.title}
										</h3>
										<p className="mt-1 text-sm text-amber-700/80">
											{alert.detail}
										</p>
									</div>
								</div>
							))}
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
