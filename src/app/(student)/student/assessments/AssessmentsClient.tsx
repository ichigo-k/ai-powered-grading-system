"use client";

import {
	CalendarDays,
	CheckCircle2,
	Clock3,
	Search,
	FileText,
	ArrowRight,
	Filter,
} from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
function gradeColor(grade: string): { bg: string; text: string } {
	if (grade.startsWith("A")) return { bg: "#DCFCE7", text: "#16A34A" };
	if (grade.startsWith("B")) return { bg: "#DBEAFE", text: "#1967D2" };
	return { bg: "#FEF3C7", text: "#D97706" };
}

// ─── Types ────────────────────────────────────────────────────────────────────

type SerializedAssessmentRow = {
	id: number;
	title: string;
	type: string; // 'EXAM' | 'QUIZ' | 'ASSIGNMENT'
	status: "upcoming" | "ongoing" | "completed";
	courseTitle: string;
	courseCode: string;
	courseId: number;
	startsAt: string; // ISO string (serialized from Date)
	endsAt: string;   // ISO string (serialized from Date)
	durationMinutes: number | null;
	totalMarks: number;
	maxAttempts: number;
	sections: { id: number; name: string; type: string; requiredQuestionsCount: number | null }[];
	latestAttempt: { score: number | null; grade: string | null; attemptNumber: number; status: string } | null;
};

type Course = { id: number; code: string; title: string };

interface Props {
	assessments: SerializedAssessmentRow[];
	courses: Course[];
}

// ─── Type badge styles (uppercase keys matching DB enum) ─────────────────────

const typeStyles: Record<string, { bg: string; text: string }> = {
	EXAM:       { bg: "#FEE2E2", text: "#DC2626" },
	QUIZ:       { bg: "#FEF3C7", text: "#D97706" },
	ASSIGNMENT: { bg: "#EDE9FE", text: "#7C3AED" },
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const tabs = [
	{ key: "ongoing",   label: "Live",      icon: Clock3 },
	{ key: "upcoming",  label: "Upcoming",  icon: CalendarDays },
	{ key: "completed", label: "Completed", icon: CheckCircle2 },
] as const;

type VisibleTab = (typeof tabs)[number]["key"];
type TypeFilter = "all" | "EXAM" | "QUIZ" | "ASSIGNMENT";

// ─── Component ────────────────────────────────────────────────────────────────

export default function AssessmentsClient({ assessments, courses }: Props) {
	const [activeTab, setActiveTab]     = useState<VisibleTab>("ongoing");
	const [courseFilter, setCourseFilter] = useState<number | "all">("all");
	const [typeFilter, setTypeFilter]   = useState<TypeFilter>("all");
	const [search, setSearch]           = useState("");
	const [showFilters, setShowFilters] = useState(false);

	const counts = useMemo(
		() => ({
			upcoming:  assessments.filter((a) => a.status === "upcoming").length,
			ongoing:   assessments.filter((a) => a.status === "ongoing").length,
			completed: assessments.filter((a) => a.status === "completed").length,
		}),
		[assessments],
	);

	const filteredAssessments = useMemo(() => {
		return assessments.filter((a) => {
			if (a.status !== activeTab) return false;
			if (courseFilter !== "all" && a.courseId !== courseFilter) return false;
			if (typeFilter !== "all" && a.type !== typeFilter) return false;
			if (search.length > 0) {
				const q = search.toLowerCase();
				const inTitle  = a.title.toLowerCase().includes(q);
				const inCourse = a.courseTitle.toLowerCase().includes(q);
				const inCode   = a.courseCode.toLowerCase().includes(q);
				if (!inTitle && !inCourse && !inCode) return false;
			}
			return true;
		});
	}, [assessments, activeTab, courseFilter, typeFilter, search]);

	const hasActiveFilters = courseFilter !== "all" || typeFilter !== "all";

	return (
		<div className="mx-auto max-w-6xl space-y-8 pb-8">
			<header className="flex flex-col gap-1">
				<h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
					<FileText className="text-[#002388]" size={28} />
					Assessments
				</h1>
				<p className="text-sm text-slate-500">
					Track everything in one place, from countdowns to live tests and completed results.
				</p>
			</header>

			<div className="flex flex-col gap-6">
				{/* Tabs */}
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

				{/* Search + Filter */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center relative z-20">
					<div className="relative flex-1 group">
						<Search
							className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#002388]"
							size={16}
						/>
						<input
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
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
							{hasActiveFilters && (
								<span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center">
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#002388] opacity-50" />
									<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#002388] ring-2 ring-white" />
								</span>
							)}
						</button>

						{showFilters && (
							<>
								{/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismiss */}
								<div className="fixed inset-0 z-10" onClick={() => setShowFilters(false)} />
								<div className="absolute right-0 top-full mt-2 w-full sm:w-[320px] rounded-2xl border border-slate-200 bg-white p-5 shadow-xl z-20 flex flex-col gap-6 origin-top-right animate-in fade-in zoom-in-95 duration-200">
									{/* Course filter */}
									<div>
										<label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-slate-500">
											Course
										</label>
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
											{courses.map((course) => (
												<button
													type="button"
													key={course.id}
													onClick={() => setCourseFilter(course.id)}
													className={`rounded-lg border px-3 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
														courseFilter === course.id
															? "border-[#002388] bg-[#002388]/10 text-[#002388]"
															: "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
													}`}
												>
													{course.code}
												</button>
											))}
										</div>
									</div>

									{/* Type filter */}
									<div>
										<label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-slate-500">
											Assessment Type
										</label>
										<div className="flex flex-wrap gap-2">
											{(["all", "EXAM", "QUIZ", "ASSIGNMENT"] as TypeFilter[]).map((type) => (
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

			{/* Empty state */}
			{filteredAssessments.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
						<Search size={24} />
					</div>
					<h3 className="mt-4 text-base font-medium text-slate-900">No assessments found</h3>
					<p className="mt-1 text-sm text-slate-500 max-w-sm">
						We couldn't find any assessments matching your current filters. Try adjusting your search term or selected course.
					</p>
					<button
						type="button"
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
				<div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
					{filteredAssessments.map((assessment, i) => {
						const isCompleted = assessment.status === "completed";
						const isOngoing   = assessment.status === "ongoing";
						const style = typeStyles[assessment.type] ?? { bg: "#F1F5F9", text: "#475569" };
						const score = assessment.latestAttempt?.score ?? null;
						const grade = assessment.latestAttempt?.grade ?? null;
						const barColor = score != null
							? score >= 85 ? "#22c55e" : score >= 60 ? "#3b82f6" : "#f59e0b"
							: "#94a3b8";

						return (
							<div
								key={assessment.id}
								className={`flex flex-col gap-3 px-6 py-5 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between ${i !== 0 ? "border-t border-slate-200" : ""}`}
							>
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-2">
										<p className="font-semibold text-slate-900">{assessment.title}</p>
										<span
											className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
											style={{ background: style.bg, color: style.text }}
										>
											{assessment.type}
										</span>
									</div>
									<p className="mt-0.5 text-xs text-slate-500">
										<span className="font-medium text-slate-600">{assessment.courseCode}</span>
										{" · "}{assessment.courseTitle}
									</p>
									<div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
										<span className="flex items-center gap-1">
											<CalendarDays size={12} className="text-slate-400" />
											{new Date(assessment.startsAt).toLocaleDateString("en-GB")}
											{" – "}
											{new Date(assessment.endsAt).toLocaleDateString("en-GB")}
										</span>
										{assessment.durationMinutes != null && (
											<span className="flex items-center gap-1">
												<Clock3 size={12} className="text-slate-400" />
												{assessment.durationMinutes} min
											</span>
										)}
									</div>
								</div>

								<div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
									{isCompleted && grade ? (
										<>
											<span
												className="inline-flex items-center justify-center rounded-lg px-3 py-1 text-sm font-semibold"
												style={{
													background: gradeColor(grade).bg,
													color: gradeColor(grade).text,
												}}
											>
												{grade}
											</span>
											{score != null && (
												<div className="flex flex-col items-end">
													<p className="text-xs font-semibold text-slate-700">{score}%</p>
													<div className="mt-1 h-1.5 w-20 rounded-full bg-slate-100">
														<div
															className="h-1.5 rounded-full"
															style={{ width: `${Math.min(score, 100)}%`, background: barColor }}
														/>
													</div>
												</div>
											)}
										</>
									) : isCompleted ? (
										<Link
											href={`/student/assessments/${assessment.id}`}
											className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
										>
											View Details
											<ArrowRight size={12} />
										</Link>
									) : (
										<>
											<Link
												href={`/student/assessments/${assessment.id}`}
												className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
													isOngoing
														? "bg-green-600 text-white hover:bg-green-700"
														: "bg-[#002388] text-white hover:bg-[#0B4DBB]"
												}`}
											>
												{isOngoing ? "Start" : "View Details"}
												<ArrowRight size={12} />
											</Link>
											<p className="text-xs text-slate-400">
												{isOngoing ? "Open now" : new Date(assessment.startsAt).toLocaleDateString("en-GB")}
											</p>
										</>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
