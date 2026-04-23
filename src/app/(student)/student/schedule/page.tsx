"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import {
	getRelativeLabel,
	studentAssessments,
} from "@/lib/student-assessments";

const TODAY = "2026-04-22";

export default function StudentSchedulePage() {
	const [activePill, setActivePill] = useState<string | null>(null);
	const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
	const pillsRef = useRef<HTMLDivElement>(null);
	const scrollingFromPill = useRef(false);

	const upcoming = useMemo(() =>
		[...studentAssessments]
			.filter(a => a.status === "upcoming" || a.status === "ongoing")
			.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
		[]
	);

	const grouped = useMemo(() => {
		const map: Record<string, typeof upcoming> = {};
		for (const a of upcoming) {
			if (!map[a.date]) map[a.date] = [];
			map[a.date].push(a);
		}
		return map;
	}, [upcoming]);

	const activeDates = useMemo(() =>
		Object.keys(grouped).filter(d => d >= TODAY).sort().slice(0, 5),
		[grouped]
	);

	const pills = useMemo(() => activeDates.map(iso => {
		const d = new Date(`${iso}T00:00:00`);
		return {
			iso,
			isToday: iso === TODAY,
			monthDay: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
			weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
		};
	}), [activeDates]);

	useEffect(() => {
		if (activeDates.length > 0 && !activePill) setActivePill(activeDates[0]);
	}, [activeDates, activePill]);

	const handlePillClick = (iso: string) => {
		setActivePill(iso);
		const el = sectionRefs.current[iso];
		if (el) {
			scrollingFromPill.current = true;
			el.scrollIntoView({ behavior: "smooth", block: "start" });
			setTimeout(() => { scrollingFromPill.current = false; }, 800);
		}
	};

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (scrollingFromPill.current) return;
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const date = entry.target.getAttribute("data-date");
						if (date) setActivePill(date);
					}
				}
			},
			{ threshold: 0.5 }
		);
		for (const date of activeDates) {
			const el = sectionRefs.current[date];
			if (el) observer.observe(el);
		}
		return () => observer.disconnect();
	}, [activeDates]);

	return (
		<div className="mx-auto max-w-6xl pb-8">

			{/* Header + pills */}
			<div className="pt-4 pb-6 mb-6 space-y-4">
				<header className="flex flex-col gap-0.5">
					<h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
						<CalendarDays className="text-[#002388]" size={26} />
						Schedule
					</h1>
					<p className="text-sm text-slate-500">
						Your next {activeDates.length} assessment day{activeDates.length !== 1 ? "s" : ""}, at a glance.
					</p>
				</header>

				{pills.length > 0 && (
					<div ref={pillsRef} className="flex flex-wrap gap-2">
						{pills.map(p => {
							const isActive = activePill === p.iso;
							const count = grouped[p.iso]?.length ?? 0;
							return (
								<button
									key={p.iso}
									data-pill={p.iso}
									onClick={() => handlePillClick(p.iso)}
									className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all border ${
										p.isToday
											? "bg-[#EEF2FF] border-[#C7D2FE] text-[#002388]"
											: "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
									}`}
								>
									<span>{p.isToday ? "Today" : `${p.monthDay} · ${p.weekday}`}</span>
									<span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
										p.isToday ? "bg-[#C7D2FE] text-[#002388]" : "bg-slate-100 text-slate-500"
									}`}>{count}</span>
								</button>
							);
						})}
					</div>
				)}
			</div>

			{/* Timeline */}
			{activeDates.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-20 text-center">
					<CalendarDays size={28} className="text-slate-300 mb-3" />
					<p className="text-sm font-medium text-slate-500">No upcoming assessments</p>
				</div>
			) : (
				<div className="space-y-8">
					{activeDates.map(date => {
						const items = grouped[date];
						const isToday = date === TODAY;
						const d = new Date(`${date}T00:00:00`);

						return (
							<div
								key={date}
								data-date={date}
								ref={el => { sectionRefs.current[date] = el; }}
							>
								{/* Date row */}
								<div className="flex items-center gap-3 mb-3">
									<div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
										isToday ? "bg-[#002388] text-white" : "bg-slate-100 text-slate-600"
									}`}>
										{d.getDate()}
									</div>
									<div className="flex items-baseline gap-2">
										<span className="text-sm font-semibold text-slate-900">
											{isToday ? "Today" : d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
										</span>
										<span className="text-xs text-slate-400">{getRelativeLabel(date)}</span>
									</div>
									<div className="flex-1 h-px bg-slate-100" />
									<span className="text-xs text-slate-400">{items.length} assessment{items.length > 1 ? "s" : ""}</span>
								</div>

								{/* Indented cards */}
								<div className="pl-11 space-y-2">
									{items.map(a => (
										<AssessmentCard key={a.id} assessment={a} />
									))}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

type Assessment = typeof studentAssessments[number];

function AssessmentCard({ assessment: a }: { assessment: Assessment }) {
	const isOngoing = a.status === "ongoing";

	return (
		<div className="cursor-pointer bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
			<div className="flex items-center gap-4 px-4 py-3">

				{/* Title */}
				<div className="flex-1 min-w-0 flex items-center gap-3">
					<div className="min-w-0">
						<p className="text-sm font-semibold text-slate-900 truncate">{a.title}</p>
						<p className="text-xs text-slate-400 truncate mt-0.5">
							<span className="font-medium text-slate-500">{a.courseCode}</span>
							{" · "}{a.course}
						</p>
					</div>
				</div>

				{/* Live badge */}
				{isOngoing && (
					<span className="shrink-0 flex items-center gap-1 rounded-full bg-red-50 border border-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-600 uppercase tracking-wider">
						<span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
						Live
					</span>
				)}

				{/* Time + venue */}
				<div className="hidden sm:flex items-center gap-4 shrink-0 text-xs text-slate-400">
					<span className="flex items-center gap-1">
						<Clock size={11} />
						{a.time} · {a.duration}
					</span>
					<span className="flex items-center gap-1">
						<MapPin size={11} />
						{a.venue}
					</span>
				</div>
			</div>
		</div>
	);
}
