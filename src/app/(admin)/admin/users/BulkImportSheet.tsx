"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Role = "STUDENT" | "LECTURER" | "ADMIN";

type RowError = { row: number; field: string; message: string };

type ImportResult = {
	created: number;
	failed: number;
	errors: RowError[];
};

type Step = "upload" | "preview" | "result";

/** Minimal CSV parser — handles quoted fields */
function parseCsv(text: string): Record<string, string>[] {
	const lines = text.trim().split(/\r?\n/);
	if (lines.length < 2) return [];
	const headers = splitCsvLine(lines[0]);
	return lines.slice(1).map((line) => {
		const values = splitCsvLine(line);
		const row: Record<string, string> = {};
		headers.forEach((h, i) => {
			row[h.trim()] = (values[i] ?? "").trim();
		});
		return row;
	});
}

function splitCsvLine(line: string): string[] {
	const result: string[] = [];
	let current = "";
	let inQuotes = false;
	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (ch === '"') {
			inQuotes = !inQuotes;
		} else if (ch === "," && !inQuotes) {
			result.push(current);
			current = "";
		} else {
			current += ch;
		}
	}
	result.push(current);
	return result;
}

export default function BulkImportSheet({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [role, setRole] = useState<Role>("STUDENT");
	const [step, setStep] = useState<Step>("upload");
	const [fileError, setFileError] = useState<string | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);
	const [allRows, setAllRows] = useState<Record<string, string>[]>([]);
	const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
	const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
	const [importing, setImporting] = useState(false);
	const [result, setResult] = useState<ImportResult | null>(null);
	const [isDragging, setIsDragging] = useState(false);

	function reset() {
		setStep("upload");
		setFileError(null);
		setFileName(null);
		setAllRows([]);
		setPreviewRows([]);
		setPreviewHeaders([]);
		setResult(null);
		setImporting(false);
		if (fileInputRef.current) fileInputRef.current.value = "";
	}

	function handleClose(val: boolean) {
		if (!val) reset();
		onOpenChange(val);
	}

	// 8.2 — validate CSV file
	function processFile(file: File) {
		setFileError(null);
		if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
			setFileError("Only .csv files are accepted. Please select a valid CSV file.");
			return;
		}
		setFileName(file.name);
		const reader = new FileReader();
		reader.onload = (e) => {
			const text = e.target?.result as string;
			const rows = parseCsv(text);
			if (rows.length === 0) {
				setFileError("The CSV file contains no data rows.");
				return;
			}
			setAllRows(rows);
			// 8.3 — preview first 5 rows
			setPreviewRows(rows.slice(0, 5));
			setPreviewHeaders(Object.keys(rows[0]));
			setStep("preview");
		};
		reader.readAsText(file);
	}

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file) processFile(file);
	}

	const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files?.[0];
		if (file) processFile(file);
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// 8.4 — download template for currently selected role
	function handleDownloadTemplate() {
		window.open(`/api/admin/users/template?role=${role}`, "_blank");
	}

	// 8.5 — confirm upload
	async function handleConfirm() {
		setImporting(true);
		try {
			const res = await fetch("/api/admin/users/bulk", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ role, rows: allRows }),
			});
			const json: ImportResult = await res.json();
			setResult(json);
			setStep("result");
			if (json.failed === 0) {
				toast.success(`${json.created} user${json.created !== 1 ? "s" : ""} imported successfully`);
				router.refresh();
			} else if (json.created > 0) {
				toast.warning(`${json.created} imported, ${json.failed} failed`);
				router.refresh();
			} else {
				toast.error("Import failed — no users were created");
			}
		} catch {
			toast.error("Network error. Please try again.");
		} finally {
			setImporting(false);
		}
	}

	return (
		<Sheet open={open} onOpenChange={handleClose}>
			<SheetContent className="w-full sm:max-w-lg overflow-y-auto">
				<SheetHeader>
					<SheetTitle>Bulk Import Users</SheetTitle>
					<SheetDescription>
						Upload a CSV file to create multiple users at once.
					</SheetDescription>
				</SheetHeader>

				<div className="flex flex-col gap-5 px-4 pb-4">
					{/* Role selector — always visible */}
					<div className="flex flex-col gap-1.5">
						<Label>Role</Label>
						<Select
							value={role}
							onValueChange={(v) => {
								setRole(v as Role);
								reset();
							}}
						>
							<SelectTrigger className="w-full rounded-xl focus-visible:ring-[#002388]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="STUDENT">Student</SelectItem>
								<SelectItem value="LECTURER">Lecturer</SelectItem>
								<SelectItem value="ADMIN">Admin</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* 8.4 — Download template link */}
					<button
						type="button"
						onClick={handleDownloadTemplate}
						className="flex items-center gap-2 text-sm font-medium text-[#002388] hover:underline self-start"
					>
						<Download size={15} />
						Download {role.charAt(0) + role.slice(1).toLowerCase()} template
					</button>

					{/* Step: upload */}
					{step === "upload" && (
						<>
							{/* Drop zone */}
							<div
								onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
								onDragLeave={() => setIsDragging(false)}
								onDrop={handleDrop}
								onClick={() => fileInputRef.current?.click()}
								className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition-colors ${
									isDragging
										? "border-[#002388] bg-[#002388]/5"
										: "border-slate-200 hover:border-[#002388]/40 hover:bg-slate-50"
								}`}
							>
								<Upload size={28} className="text-slate-400" />
								<div className="text-center">
									<p className="text-sm font-semibold text-slate-700">
										Drop your CSV here or click to browse
									</p>
									<p className="text-xs text-slate-400 mt-1">Only .csv files accepted</p>
								</div>
								<input
									ref={fileInputRef}
									type="file"
									accept=".csv,text/csv"
									className="hidden"
									onChange={handleFileChange}
								/>
							</div>

							{/* 8.2 — inline file error */}
							{fileError && (
								<div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
									<AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
									<p className="text-xs text-red-600">{fileError}</p>
								</div>
							)}
						</>
					)}

					{/* Step: preview */}
					{step === "preview" && (
						<>
							{/* File info */}
							<div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
								<FileText size={16} className="text-[#002388] shrink-0" />
								<span className="text-sm font-medium text-slate-700 truncate flex-1">{fileName}</span>
								<span className="text-xs text-slate-400">{allRows.length} row{allRows.length !== 1 ? "s" : ""}</span>
								<button
									type="button"
									onClick={reset}
									className="text-slate-400 hover:text-slate-600 transition-colors"
								>
									<X size={15} />
								</button>
							</div>

							{/* 8.3 — preview table */}
							<div>
								<p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
									Preview (first {previewRows.length} row{previewRows.length !== 1 ? "s" : ""})
								</p>
								<div className="overflow-x-auto rounded-xl border border-slate-200">
									<table className="w-full text-xs">
										<thead>
											<tr className="bg-slate-50 border-b border-slate-200">
												{previewHeaders.map((h) => (
													<th
														key={h}
														className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap"
													>
														{h}
													</th>
												))}
											</tr>
										</thead>
										<tbody>
											{previewRows.map((row, i) => (
												<tr
													key={i}
													className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
												>
													{previewHeaders.map((h) => (
														<td
															key={h}
															className="px-3 py-2 text-slate-700 max-w-[120px] truncate"
														>
															{row[h] || <span className="text-slate-300">—</span>}
														</td>
													))}
												</tr>
											))}
										</tbody>
									</table>
								</div>
								{allRows.length > 5 && (
									<p className="text-xs text-slate-400 mt-1.5">
										+{allRows.length - 5} more row{allRows.length - 5 !== 1 ? "s" : ""} not shown
									</p>
								)}
							</div>
						</>
					)}

					{/* Step: result */}
					{step === "result" && result && (
						<div className="flex flex-col gap-3">
							{/* Summary */}
							<div className="grid grid-cols-2 gap-3">
								<div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-center">
									<p className="text-2xl font-bold text-emerald-600">{result.created}</p>
									<p className="text-xs font-medium text-emerald-700 mt-0.5">Created</p>
								</div>
								<div className={`rounded-xl border px-4 py-3 text-center ${result.failed > 0 ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
									<p className={`text-2xl font-bold ${result.failed > 0 ? "text-red-600" : "text-slate-400"}`}>{result.failed}</p>
									<p className={`text-xs font-medium mt-0.5 ${result.failed > 0 ? "text-red-700" : "text-slate-500"}`}>Failed</p>
								</div>
							</div>

							{/* All-success message */}
							{result.failed === 0 && (
								<div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5">
									<CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
									<p className="text-xs text-emerald-700 font-medium">All users imported successfully.</p>
								</div>
							)}

							{/* Row-level errors */}
							{result.errors.length > 0 && (
								<div className="flex flex-col gap-1.5">
									<p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Row Errors</p>
									<div className="flex flex-col gap-1 max-h-48 overflow-y-auto rounded-xl border border-red-200 bg-red-50 p-2">
										{result.errors.map((err, i) => (
											<div key={i} className="flex items-start gap-2 text-xs text-red-700 py-1 border-b border-red-100 last:border-0">
												<span className="font-bold shrink-0">Row {err.row}:</span>
												<span className="font-medium text-red-500">{err.field}</span>
												<span className="text-red-600">— {err.message}</span>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					)}
				</div>

				<SheetFooter className="px-4 pb-4 flex flex-col gap-2">
					{step === "preview" && (
						<Button
							onClick={handleConfirm}
							disabled={importing}
							className="w-full bg-[#002388] hover:bg-[#0B4DBB] text-white rounded-xl h-9"
						>
							{importing ? "Importing…" : `Import ${allRows.length} User${allRows.length !== 1 ? "s" : ""}`}
						</Button>
					)}
					{step === "result" && (
						<Button
							variant="outline"
							onClick={reset}
							className="w-full rounded-xl h-9"
						>
							Import Another File
						</Button>
					)}
					{step === "upload" && (
						<Button
							variant="outline"
							onClick={() => handleClose(false)}
							className="w-full rounded-xl h-9"
						>
							Cancel
						</Button>
					)}
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
