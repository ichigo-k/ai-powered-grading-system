"use client";

import {
	CalendarDays,
	CheckCircle2,
	Clock3,
	MapPin,
	Search,
	BookOpen,
	FileText,
	ArrowRight,
	Filter
} from "lucide-react";
import { useMemo, useState } from "react";
import {
	formatAssessmentDate,
	getRelativeLabel,
	gradeColor,
	type StudentAssessment,
	statusStyles,
	studentAssessments,
	studentCourses,
	typeStyles,
} from "@/lib/student-assessments";

const tabs = [
	{ key: "upcoming", label: "Upcoming", icon: CalendarDays },
	{ key: "ongoing", label: "Live", icon: Clock3 },
	{ key: "completed", label: "Completed", icon: CheckCircle2 },
] as const;

type VisibleTab = (typeof tabs)[number]["key"];
type TypeFilter = "all" | "exam" | "quiz" | "test";

export default function StudentAssessmentsPage() {
	const [activeTab, setActiveTab] = useState<VisibleTab>("upcoming");
	const [courseFilter, setCourseFilter] = useState("all");
	const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
	const [search, setSearch] = useState("");
	const [showFilters, setShowFilters] = useState(false);

	const counts = useMemo(
		() => ({
			upcoming: studentAssessments.filter(
				(assessment) => assessment.status === "upcoming",
			).length,
			ongoing: studentAssessments.filter(
				(assessment) => assessment.status === "ongoing",
			).length,
			completed: studentAssessments.filter(
				(assessment) => assessment.status === "completed",
			).length,
		}),
		[],
	);

	const filteredAssessments = useMemo(() => {
		return studentAssessments.filter((assessment) => {
			const matchesTab = assessment.status === activeTab;
			const matchesCourse =
				courseFilter === "all" || assessment.courseCode === courseFilter;
			const matchesType =
				typeFilter === "all" || assessment.type === typeFilter;
			const matchesSearch =
				search.length === 0 ||
				assessment.title.toLowerCase().includes(search.toLowerCase()) ||
				assessment.course.toLowerCase().includes(search.toLowerCase()) ||
				assessment.courseCode.toLowerCase().includes(search.toLowerCase());

			return matchesTab && matchesCourse && matchesType && matchesSearch;
		});
	}, [activeTab, courseFilter, typeFilter, search]);

	return (
		<div className="mx-auto max-w-6xl space-y-8 pb-8">
			<header className="flex flex-col gap-1">
				<h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
					<FileText className="text-[#002388]" size={28} />
					Assessments
				</h1>
				<p className="text-sm text-slate-500">
					Track everything in one place, from countdowns to live tests and
					completed results.
				</p>
			</header>

			<div className="flex flex-col gap-6">
				<div className="flex items-center gap-8 border-b border-slate-200">
					{tabs.map(({ key, label }) => {
						const active = activeTab === key;
						return (
							<button
								type="button"
								key={key}
								onClick={() => setActiveTab(key)}
								className={`group relative flex items-center gap-2.5 pb-4 text-sm transition-colors ${
									active
										? "text-[#002388] font-semibold"
										: "text-slate-500 font-medium hover:text-slate-700"
								}`}
							>
								{label}
								<span
									className={`flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold transition-colors ${
										active
											? "bg-[#002388] text-white"
											: "border border-slate-200 text-slate-500 bg-slate-50 group-hover:border-slate-300"
									}`}
								>
									{counts[key]}
								</span>
								{active && (
									<span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#002388] rounded-t-full" />
								)}
							</button>
						);
					})}
				</div>

				<div className="flex flex-col gap-4 sm:flex-row sm:items-center relative z-20">
					<div className="relative flex-1 group">
						<Search
							className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#002388]"
							size={16}
						/>
						<input
							type="text"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Search by title, course, or course code..."
							className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-[#002388] focus:ring-1 focus:ring-[#002388]"
						/>
					</div>

					<div className="relative shrink-0">
						<button
							type="button"
							onClick={() => setShowFilters(!showFilters)}
							className="relative flex w-full items-center justify-center sm:w-auto gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-colors"
						>
							<Filter size={14} strokeWidth={2.5} />
							Filter
							{(courseFilter !== "all" || typeFilter !== "all") && (
								<span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center">
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#002388] opacity-50"></span>
									<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#002388] ring-2 ring-white"></span>
								</span>
							)}
						</button>

						{showFilters && (
							<>
								<div className="fixed inset-0 z-10" onClick={() => setShowFilters(false)} />
								<div className="absolute right-0 top-full mt-2 w-full sm:w-[320px] rounded-2xl border border-slate-200 bg-white p-5 shadow-xl z-20 flex flex-col gap-6 origin-top-right animate-in fade-in zoom-in-95 duration-200">
									
									<div>
										<label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-slate-500">Course</label>
										<div className="flex flex-wrap gap-2">
											<button
												type="button"
												onClick={() => setCourseFilter("all")}
												className={`rounded-lg px-3 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
													courseFilter === "all"
														? "bg-[#002388] text-white"
														: "bg-slate-50 text-slate-500 hover:bg-slate-100"
												}`}
											>
												All courses
											</button>
											{studentCourses.map((course) => (
												<button
													type="button"
													key={course.code}
													onClick={() => setCourseFilter(course.code)}
													className="rounded-lg border px-3 py-2 text-xs font-medium uppercase tracking-wider transition-colors"
													style={
														courseFilter === course.code
															? {
																	borderColor: course.color,
																	background: `${course.color}10`,
																	color: course.color,
																}
															: { borderColor: "#E2E8F0", color: "#64748B", background: "white" }
													}
												>
													{course.code}
												</button>
											))}
										</div>
									</div>

									<div>
										<label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-slate-500">Assessment Type</label>
										<div className="flex flex-wrap gap-2">
											{(["all", "exam", "quiz", "test"] as TypeFilter[]).map((type) => (
												<button
													type="button"
													key={type}
													onClick={() => setTypeFilter(type)}
													className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
														typeFilter === type
															? "bg-[#002388]/10 text-[#002388]"
															: "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
													}`}
												>
													{type === "all" ? "All types" : type}
												</button>
											))}
										</div>
									</div>

								</div>
							</>
						)}
					</div>
				</div>
			</div>

			{filteredAssessments.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
						<Search size={24} />
					</div>
					<h3 className="mt-4 text-base font-medium text-slate-900">No assessments found</h3>
					<p className="mt-1 text-sm text-slate-500 max-w-sm">
						We couldn't find any assessments matching your current filters. Try adjusting your search term or selected course.
					</p>
					<button
						onClick={() => {
							setSearch("");
							setCourseFilter("all");
							setTypeFilter("all");
						}}
						className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
					>
						Clear all filters
					</button>
				</div>
			) : (
				<div className="space-y-4">
					{filteredAssessments.map((assessment) => (
						<AssessmentCard key={assessment.id} assessment={assessment} />
					))}
				</div>
			)}
		</div>
	);
}

function AssessmentCard({ assessment }: { assessment: StudentAssessment }) {
	const isCompleted = assessment.status === "completed";
	const isOngoing = assessment.status === "ongoing";
	const statusTone = statusStyles[assessment.status];

	return (
		<article className="group flex flex-col gap-5 lg:flex-row lg:items-center rounded-2xl border border-slate-200 bg-white p-5 lg:p-6 transition-all duration-200 hover:border-slate-300">
			<div className="flex flex-1 items-start gap-4">
				<div
					className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
					style={{ background: `${assessment.courseColor}15` }}
				>
					<BookOpen size={20} style={{ color: assessment.courseColor }} />
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2.5">
						<h3 className="text-lg font-medium text-slate-900">
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
						<span
							className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider"
							style={{ background: statusTone.bg, color: statusTone.text }}
						>
							{isOngoing && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"></span>}
							{assessment.status}
						</span>
					</div>

					<p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
						<span className="font-medium text-slate-700">{assessment.courseCode}</span>
						<span className="h-1 w-1 rounded-full bg-slate-300"></span>
						{assessment.course}
					</p>

					<div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
						<span className="flex items-center gap-1.5">
							<CalendarDays size={14} className="text-slate-400" />
							{formatAssessmentDate(assessment.date, "long")}
						</span>
						<span className="flex items-center gap-1.5">
							<Clock3 size={14} className="text-slate-400" />
							{assessment.time} / {assessment.duration}
						</span>
						<span className="flex items-center gap-1.5">
							<MapPin size={14} className="text-slate-400" />
							{assessment.venue}
						</span>
					</div>
				</div>
			</div>

			<div className="flex flex-col items-start lg:w-[180px] lg:items-end pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 mt-2 lg:mt-0">
				{isCompleted && assessment.grade ? (
					<div className="flex flex-col items-start lg:items-end w-full">
						<span
							className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-xl font-semibold"
							style={{
								background: gradeColor(assessment.grade).bg,
								color: gradeColor(assessment.grade).text,
							}}
						>
							{assessment.grade}
						</span>
						<p className="mt-2 text-sm font-medium text-slate-900">
							{assessment.score} / {assessment.total} pts
						</p>
						<p className="text-xs text-slate-400 mt-0.5">Result published</p>
					</div>
				) : (
					<div className="flex flex-col items-start lg:items-end w-full">
						<button
							type="button"
							className={`flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors lg:w-auto ${
								isOngoing
									? "bg-green-600 text-white hover:bg-green-700"
									: "bg-[#002388] text-white hover:bg-[#0B4DBB]"
							}`}
						>
							{isOngoing ? "Start Assessment" : "View Details"}
							<ArrowRight size={14} />
						</button>
						<p className="mt-2 text-xs font-medium text-slate-700">
							{isOngoing
								? "Submission window is open"
								: getRelativeLabel(assessment.date)}
						</p>
					</div>
				)}
			</div>
		</article>
	);
}
