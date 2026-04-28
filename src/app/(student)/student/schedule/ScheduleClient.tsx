"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock, MapPin } from "lucide-react";

export type ScheduleItemSerialized = {
	id: number;
	title: string;
	type: string;
	courseTitle: string;
	courseCode: string;
	startsAt: string;
	endsAt: string;
	durationMinutes: number | null;
	location: string | null;
	status: "upcoming" | "ongoing" | "completed";
};

function formatDuration(minutes: number | null): string {
	if (!minutes) return "";
	if (minutes < 60) return `${minutes} min`;
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}

function getRelativeLabel(isoDate: string, todayIso: string): string {
	const diff = Math.round(
		(new Date(isoDate).setHours(0, 0, 0, 0) - new Date(todayIso).setHours(0, 0, 0, 0)) / 86400000
	);
	if (diff === 0) return "Today";
	if (diff === 1) return "Tomorrow";
	if (diff > 1) return `In ${diff} days`;
	return `${Math.abs(diff)} days ago`;
}

function toDateKey(iso: string): string {
	return iso.slice(0, 10);
}

function getTodayIso(): string {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function ScheduleClient({ items }: { items: ScheduleItemSerialized[] }) {
	const router = useRouter();
	const todayIso = getTodayIso();
	const [activePill, setActivePill] = useState<string | null>(null);
	const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
	const scrollingFromPill = useRef(false);

	const grouped = useMemo(() => {
		const map: Record<string, ScheduleItemSerialized[]> = {};
		for (const a of items) {
			const key = toDateKey(a.startsAt);
			if (!map[key]) map[key] = [];
			map[key].push(a);
		}
		return map;
	}, [items]);

	const activeDates = useMemo(
		() => Object.keys(grouped).filter((d) => d >= todayIso).sort().slice(0, 7),
		[grouped, todayIso]
	);

	const pills = useMemo(
		() => activeDates.map((iso) => {
			const d = new Date(`${iso}T00:00:00`);
			return {
				iso,
				isToday: iso === todayIso,
				monthDay: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
				weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
				count: grouped[iso]?.length ?? 0,
			};
		}),
		[activeDates, grouped, todayIso]
	);

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
			{ threshold: 0.4 }
		);
		for (const date of activeDates) {
			const el = sectionRefs.current[date];
			if (el) observer.observe(el);
		}
		return () => observer.disconnect();
	}, [activeDates]);

	return (
		<div className="mx-auto max-w-6xl pb-8">
			<div className="pt-4 pb-6 mb-6 space-y-4">
				<header className="flex flex-col gap-0.5">
					<h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
						<CalendarDays className="text-[#002388]" size={26} />
						Schedule
					</h1>
					<p className="text-sm text-slate-500">
						{activeDates.length > 0
							? `Your next ${activeDates.length} assessment day${activeDates.length !== 1 ? "s" : ""}, at a glance.`
							: "No upcoming assessments scheduled."}
					</p>
				</header>

				{pills.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{pills.map((p) => (
							<button
								key={p.iso}
								onClick={() => handlePillClick(p.iso)}
								className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all border ${
									activePill === p.iso
										? "bg-[#002388] border-[#002388] text-white shadow-sm"
										: p.isToday
										? "bg-[#EEF2FF] border-[#C7D2FE] text-[#002388]"
										: "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
								}`}
							>
								<span>{p.isToday ? "Today" : `${p.monthDay} · ${p.weekday}`}</span>
								<span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
									activePill === p.iso
										? "bg-white/20 text-white"
										: p.isToday
										? "bg-[#C7D2FE] text-[#002388]"
										: "bg-slate-100 text-slate-500"
								}`}>
									{p.count}
								</span>
							</button>
						))}
					</div>
				)}
			</div>

			{activeDates.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-20 text-center">
					<CalendarDays size={28} className="text-slate-300 mb-3" />
					<p className="text-sm font-medium text-slate-500">No upcoming assessments</p>
					<p className="text-xs text-slate-400 mt-1">Check back later for new assessments.</p>
				</div>
			) : (
				<div className="space-y-8">
					{activeDates.map((date) => {
						const dayItems = grouped[date];
						const isToday = date === todayIso;
						const d = new Date(`${date}T00:00:00`);
						return (
							<div
								key={date}
								data-date={date}
								ref={(el) => { sectionRefs.current[date] = el; }}
							>
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
										<span className="text-xs text-slate-400">{getRelativeLabel(date, todayIso)}</span>
									</div>
									<div className="flex-1 h-px bg-slate-100" />
									<span className="text-xs text-slate-400">{dayItems.length} assessment{dayItems.length !== 1 ? "s" : ""}</span>
								</div>
								<div className="pl-11 space-y-2">
									{dayItems.map((a) => (
										<AssessmentCard
											key={a.id}
											item={a}
											onClick={() => router.push(`/student/assessments/${a.id}`)}
										/>
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

function AssessmentCard({
	item: a,
	onClick,
}: {
	item: ScheduleItemSerialized;
	onClick: () => void;
}) {
	const isOngoing = a.status === "ongoing";
	const time = new Date(a.startsAt).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
	});

	return (
		<button
			type="button"
			onClick={onClick}
			className="w-full text-left bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
		>
			<div className="flex items-center gap-4 px-4 py-3">
				<div className="flex-1 min-w-0">
					<p className="text-sm font-semibold text-slate-900 truncate">{a.title}</p>
					<p className="text-xs text-slate-400 truncate mt-0.5">
						<span className="font-medium text-slate-500">{a.courseCode}</span>
						{" · "}{a.courseTitle}
					</p>
				</div>

				{isOngoing && (
					<span className="shrink-0 flex items-center gap-1 rounded-full bg-red-50 border border-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-600 uppercase tracking-wider">
						<span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
						Live
					</span>
				)}

				<div className="hidden sm:flex items-center gap-4 shrink-0 text-xs text-slate-400">
					<span className="flex items-center gap-1">
						<Clock size={11} />
						{time}{a.durationMinutes ? ` · ${formatDuration(a.durationMinutes)}` : ""}
					</span>
					{a.location && (
						<span className="flex items-center gap-1">
							<MapPin size={11} />
							{a.location}
						</span>
					)}
				</div>
			</div>
		</button>
	);
}
