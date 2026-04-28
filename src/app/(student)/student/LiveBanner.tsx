"use client";

import { useState } from "react";
import { X, ArrowRight } from "lucide-react";

export default function LiveBanner({ items }: { items: { id: number; title: string; courseTitle: string }[] }) {
	const [dismissed, setDismissed] = useState(false);
	if (dismissed || items.length === 0) return null;

	return (
		<div className="rounded-xl border border-green-100 bg-green-50/60 px-4 py-3 flex items-center gap-3">
			<span className="relative flex h-2 w-2 shrink-0">
				<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
				<span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
			</span>

			<span className="text-xs font-semibold text-green-700 shrink-0 uppercase tracking-wider">Live now</span>

			<div className="flex flex-wrap gap-2 flex-1 min-w-0">
				{items.map(a => (
					<button
						key={a.id}
						className="flex items-center gap-1.5 rounded-full border border-green-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-green-50 transition-colors"
					>
						<span className="font-semibold text-slate-900">{a.courseTitle}</span>
						<span className="text-slate-400">·</span>
						<span className="truncate max-w-[140px]">{a.title}</span>
						<ArrowRight size={10} className="text-slate-400 shrink-0" />
					</button>
				))}
			</div>

			<button
				onClick={() => setDismissed(true)}
				className="shrink-0 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-green-100 transition-colors"
			>
				<X size={14} />
			</button>
		</div>
	);
}
