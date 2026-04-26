"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
	open: boolean;
	title: string;
	description: string;
	confirmText: string;
	cancelText?: string;
	isDestructive?: boolean;
	isLoading?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export function ConfirmModal({
	open,
	title,
	description,
	confirmText,
	cancelText = "Cancel",
	isDestructive = false,
	isLoading = false,
	onConfirm,
	onCancel,
}: ConfirmModalProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!open || !mounted) return null;

	return createPortal(
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
			<div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
				<div className="p-8">
					<h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
					<p className="mt-3 text-sm font-medium text-slate-500 leading-relaxed">{description}</p>
				</div>
				<div className="bg-slate-50 px-8 py-5 flex items-center justify-end gap-3 border-t border-slate-100">
					<Button
						variant="outline"
						onClick={onCancel}
						disabled={isLoading}
						className="h-11 px-6 rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-white hover:text-slate-900 transition-all active:scale-95"
					>
						{cancelText}
					</Button>
					<Button
						onClick={onConfirm}
						disabled={isLoading}
						className={`h-11 px-6 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg ${
							isDestructive
								? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/10"
								: "bg-[#002388] hover:bg-[#0B4DBB] text-white shadow-blue-900/10"
						}`}
					>
						{isLoading ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Processing...
							</>
						) : (
							confirmText
						)}
					</Button>
				</div>
			</div>
		</div>,
		document.body
	);
}
