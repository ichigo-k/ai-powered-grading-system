"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import {
	formatAssessmentDate,
	getMonthLabel,
	studentAssessments,
	typeStyles,
} from "@/lib/student-assessments";
import {
	Calendar as CalendarIcon,
	ChevronLeft,
	ChevronRight,
	X,
	Clock,
	MapPin,
	BookOpen,
	ArrowRight,
	MoreHorizontal
} from "lucide-react";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Helper to convert "10:00 AM" to hour number
function parseTimeToDecimal(time: string) {
	const [timePart, ampm] = time.split(" ");
	let [hours, minutes] = timePart.split(":").map(Number);
	if (ampm === "PM" && hours !== 12) hours += 12;
	if (ampm === "AM" && hours === 12) hours = 0;
	return hours + minutes / 60;
}

// Helper to get minutes from duration "2 hours" or "90 mins"
function parseDurationToHours(duration: string) {
	if (duration.includes("hour")) {
		return parseFloat(duration.split(" ")[0]);
	}
	if (duration.includes("min")) {
		return parseFloat(duration.split(" ")[0]) / 60;
	}
	return 1;
}

export default function StudentSchedulePage() {
	const [viewMode, setViewMode] = useState<"Week" | "Month">("Month");
	const [viewDate, setViewDate] = useState(new Date("2026-04-22"));
	const scrollRef = useRef<HTMLDivElement>(null);

	const datedAssessments = useMemo(
		() =>
			[...studentAssessments]
				.filter(
					(assessment) =>
						assessment.status === "upcoming" || assessment.status === "ongoing",
				)
				.sort((a, b) => a.date.localeCompare(b.date)),
		[],
	);

	// Navigation
	const navigate = (direction: number) => {
		const next = new Date(viewDate);
		if (viewMode === "Month") {
			next.setMonth(viewDate.getMonth() + direction);
		} else {
			next.setDate(viewDate.getDate() + direction * 7);
		}
		setViewDate(next);
	};

	const goToToday = () => {
		setViewDate(new Date("2026-04-22"));
	};

	// Calendar Data
	const calendarDays = useMemo(() => buildCalendar(viewDate), [viewDate]);
	const weekDays = useMemo(() => {
		const days = [];
		const startOfWeek = new Date(viewDate);
		startOfWeek.setDate(viewDate.getDate() - viewDate.getDay());
		for (let i = 0; i < 7; i++) {
			const day = new Date(startOfWeek);
			day.setDate(startOfWeek.getDate() + i);
			days.push(day);
		}
		return days;
	}, [viewDate]);

	const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);
	const selectedDayAssessments = useMemo(() => {
		if (!selectedDayDate) return [];
		return datedAssessments.filter(a => a.date === selectedDayDate);
	}, [selectedDayDate, datedAssessments]);

	// Auto-scroll to 8 AM in Week view
	useEffect(() => {
		if (viewMode === "Week" && scrollRef.current) {
			scrollRef.current.scrollTop = 8 * 80;
		}
	}, [viewMode]);

	return (
		<div className="mx-auto max-w-7xl space-y-6 pb-8 h-[calc(100vh-120px)] flex flex-col">
			<header className="flex flex-col gap-1 shrink-0">
				<h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
					<CalendarIcon className="text-[#002388]" size={28} />
					Schedule
				</h1>
				<p className="text-sm text-slate-500">
					See what is coming next, how close it is, and which days need your attention.
				</p>
			</header>

			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl">
						<button onClick={() => navigate(-1)} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-600 transition-all">
							<ChevronLeft size={18} />
						</button>
						<button onClick={goToToday} className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg border-x border-slate-100 transition-all">
							Today
						</button>
						<button onClick={() => navigate(1)} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-600 transition-all">
							<ChevronRight size={18} />
						</button>
					</div>
					<h2 className="text-lg font-bold text-slate-900 tracking-tight">
						{viewMode === "Month" ? getMonthLabel(viewDate.toISOString().split("T")[0]) : `Week of ${viewDaysLabel(weekDays)}`}
					</h2>
				</div>

				<div className="flex bg-white border border-slate-200 p-1 rounded-xl">
					{["Week", "Month"].map((v) => (
						<button
							key={v}
							onClick={() => setViewMode(v as any)}
							className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${viewMode === v ? "bg-slate-100 text-[#002388]" : "text-slate-500 hover:text-slate-700"}`}
						>
							{v}
						</button>
					))}
				</div>
			</div>

			{viewMode === "Month" ? (
				/* MONTH VIEW */
				<div className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col flex-1">
					<div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50">
						{weekdayLabels.map(l => (
							<div key={l} className="py-3 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">{l}</div>
						))}
					</div>
					<div className="grid grid-cols-7 flex-1">
						{calendarDays.map((day, idx) => {
							const dayItems = datedAssessments.filter(a => day.date && a.date === day.date);
							const isToday = day.date === "2026-04-22";
							return (
								<div
									key={day.key}
									onClick={() => day.date && dayItems.length > 0 && setSelectedDayDate(day.date)}
									className={`relative min-h-[90px] p-2 border-r border-b border-slate-200 transition-all cursor-pointer group flex flex-col ${!day.date ? "bg-slate-50/30" : dayItems.length > 0 ? "hover:bg-blue-50/50" : "cursor-default"} ${(idx + 1) % 7 === 0 ? "border-r-0" : ""}`}
								>
									{day.day && (
										<>
											<div className="flex justify-between items-start mb-2">
												<span className={`flex items-center justify-center w-7 h-7 text-sm font-semibold rounded-full ${isToday ? "bg-[#002388] text-white" : "text-slate-600 group-hover:text-[#002388]"}`}>{day.day}</span>
												{dayItems.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-[#002388]" />}
											</div>
											<div className="space-y-1">
												{dayItems.slice(0, 3).map(item => (
													<div key={item.id} className="px-1.5 py-0.5 rounded text-[10px] font-bold truncate flex items-center gap-1.5" style={{ background: `${item.courseColor}15`, color: item.courseColor }}>
														<span className="truncate uppercase">{item.courseCode}</span>
													</div>
												))}
												{dayItems.length > 3 && <div className="text-[10px] font-bold text-slate-400 pl-1">+ {dayItems.length - 3}</div>}
											</div>
										</>
									)}
								</div>
							);
						})}
					</div>
				</div>
			) : (
				/* WEEK VIEW */
				<div className="flex-1 overflow-hidden bg-white rounded-3xl border border-slate-200 flex flex-col">
					<div className="flex border-b border-slate-200 shrink-0 bg-slate-50/50">
						<div className="w-16 md:w-20 border-r border-slate-200 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center">GMT+0</div>
						<div className="flex-1 grid grid-cols-7">
							{weekDays.map((day, idx) => {
								const isToday = day.toDateString() === new Date("2026-04-22").toDateString();
								return (
									<div key={idx} className="flex flex-col items-center py-2 border-r last:border-0 border-slate-200">
										<span className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? "text-[#002388]" : "text-slate-400"}`}>{weekdayLabels[day.getDay()]}</span>
										<span className={`mt-1 flex items-center justify-center w-8 h-8 rounded-full text-base font-bold ${isToday ? "bg-[#002388] text-white" : "text-slate-800"}`}>{day.getDate()}</span>
									</div>
								);
							})}
						</div>
					</div>
					<div ref={scrollRef} className="flex-1 overflow-y-auto relative custom-scrollbar">
						<div className="flex min-h-full relative">
							<div className="w-16 md:w-20 border-r border-slate-200 shrink-0 bg-slate-50/20">
								{HOURS.map(h => (
									<div key={h} className="h-20 border-b border-slate-200 flex items-start justify-center pt-2 text-[10px] font-medium text-slate-400">
										{h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`}
									</div>
								))}
							</div>
							<div className="flex-1 grid grid-cols-7 relative">
								<div className="absolute inset-0 pointer-events-none">
									{HOURS.map(h => <div key={h} className="h-20 border-b border-slate-200 w-full" />)}
								</div>
								{weekDays.map((day, dIdx) => {
									const dayStr = day.toISOString().split("T")[0];
									const items = datedAssessments.filter(a => a.date === dayStr);
									const isToday = day.toDateString() === new Date("2026-04-22").toDateString();
									return (
										<div key={dIdx} className={`relative h-full border-r last:border-0 border-slate-200 ${isToday ? "bg-blue-50/10" : ""}`}>
											{items.map(a => {
												const start = parseTimeToDecimal(a.time);
												const duration = parseDurationToHours(a.duration);
												return (
													<div
														key={a.id}
														onClick={() => setSelectedDayDate(a.date)}
														className="absolute left-1 right-1 rounded-lg p-2 overflow-hidden transition-all hover:scale-[1.02] cursor-pointer border border-white"
														style={{ top: `${start * 80}px`, height: `${duration * 80}px`, backgroundColor: `${a.courseColor}15`, borderLeft: `4px solid ${a.courseColor}` }}
													>
														<div className="flex flex-col h-full gap-0.5">
															<span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight truncate">{a.courseCode}</span>
															<h3 className="text-[10px] font-bold text-slate-800 leading-tight truncate">{a.title}</h3>
															<div className="mt-auto flex items-center gap-1 text-[8px] font-medium text-slate-500 truncate">
																<Clock size={8} /> {a.time}
															</div>
														</div>
													</div>
												);
											})}
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Detailed Pop-up (Google Style) */}
			{selectedDayDate && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-[2px] animate-in fade-in duration-200" onClick={() => setSelectedDayDate(null)}>
					<div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl" onClick={e => e.stopPropagation()}>
						<div className="flex justify-end p-2 bg-slate-50/50 border-b border-slate-100">
							<button onClick={() => setSelectedDayDate(null)} className="p-2 hover:bg-slate-200/50 rounded-full text-slate-500 transition-colors"><X size={18} /></button>
						</div>
						<div className="p-6 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
							{selectedDayAssessments.map(a => (
								<div key={a.id} className="flex gap-4">
									<div className="w-4 h-4 rounded mt-1.5 shrink-0" style={{ backgroundColor: a.courseColor }} />
									<div className="flex-1 space-y-4">
										<div>
											<h3 className="text-xl font-medium text-slate-900 leading-tight">{a.title}</h3>
											<p className="text-sm text-slate-500 mt-1">{formatAssessmentDate(selectedDayDate, "long")}</p>
										</div>
										<div className="space-y-3">
											<div className="flex items-center gap-4 text-slate-600"><Clock size={18} className="text-slate-400" /><div className="text-sm"><span className="font-medium text-slate-700">{a.time}</span><span className="mx-2 text-slate-300">|</span><span className="text-slate-500">{a.duration}</span></div></div>
											<div className="flex items-center gap-4 text-slate-600"><MapPin size={18} className="text-slate-400" /><p className="text-sm font-medium text-slate-700">{a.venue}</p></div>
											<div className="flex items-center gap-4 text-slate-600"><BookOpen size={18} className="text-slate-400" /><p className="text-sm font-medium text-slate-700">{a.courseCode} • {a.course}</p></div>
										</div>
										<button className="flex items-center gap-2 text-sm font-bold text-[#002388] hover:underline pt-2">View Assessment Portal <ArrowRight size={16} /></button>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

function buildCalendar(date: Date) {
	const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
	const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
	const cells: Array<{ day: number | null; date: string | null; key: string }> = [];
	for (let i = 0; i < firstDay.getDay(); i++) cells.push({ day: null, date: null, key: `blank-${i}` });
	for (let day = 1; day <= lastDay.getDate(); day++) {
		const isoDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
		cells.push({ day, date: isoDate, key: isoDate });
	}
	while (cells.length % 7 !== 0) cells.push({ day: null, date: null, key: `tail-${cells.length}` });
	return cells;
}

function viewDaysLabel(days: Date[]) {
	const first = days[0];
	const last = days[6];
	if (first.getMonth() === last.getMonth()) {
		return `${first.toLocaleDateString("en-US", { month: "long" })} ${first.getDate()} – ${last.getDate()}, ${first.getFullYear()}`;
	}
	return `${first.toLocaleDateString("en-US", { month: "short" })} ${first.getDate()} – ${last.toLocaleDateString("en-US", { month: "short" })} ${last.getDate()}, ${last.getFullYear()}`;
}
