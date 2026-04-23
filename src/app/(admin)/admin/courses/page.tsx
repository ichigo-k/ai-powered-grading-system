"use client";

import { courseAssignments } from "@/lib/admin-dashboard";
import { 
	BookPlus, 
	MoreVertical, 
	UserPlus,
	Link as LinkIcon,
	BookOpen,
	ArrowUpDown
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { 
	Tooltip, 
	TooltipContent, 
	TooltipProvider, 
	TooltipTrigger 
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export default function AdminCoursesPage() {
	const columns: ColumnDef<typeof courseAssignments[0]>[] = [
		{
			accessorKey: "title",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="-ml-4 h-8 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:bg-transparent"
					>
						Course Title
						<ArrowUpDown className="ml-2 h-3 w-3" />
					</Button>
				)
			},
			cell: ({ row }) => (
				<div className="min-w-0">
					<p className="truncate font-semibold text-slate-900 group-hover:text-[#002388] transition-colors">
						{row.getValue("title")}
					</p>
					<p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
						{row.original.code}
					</p>
				</div>
			),
		},
		{
			accessorKey: "lecturer",
			header: "Lecturer",
			cell: ({ row }) => {
				const lecturer = row.getValue("lecturer") as string;
				return (
					<span className={`text-xs font-medium ${lecturer === 'Unassigned' ? 'text-slate-400 italic' : 'text-slate-700'}`}>
						{lecturer}
					</span>
				);
			},
		},
		{
			accessorKey: "classes",
			header: "Linked Classes",
			cell: ({ row }) => {
				const classes = row.getValue("classes") as string[];
				return (
					<div className="flex flex-wrap gap-1">
						{classes.length > 0 ? (
							classes.map((cls) => (
								<span key={cls} className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
									{cls}
								</span>
							))
						) : (
							<span className="text-[10px] font-medium text-slate-400 italic">None linked</span>
						)}
					</div>
				);
			},
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => {
				const status = row.getValue("status") as string;
				return (
					<Badge variant={status === "Complete" ? "success" : "warning"}>
						{status}
					</Badge>
				);
			},
		},
		{
			id: "actions",
			cell: ({ row }) => {
				return (
					<div className="text-right">
						<TooltipProvider>
							<div className="flex items-center justify-end gap-1">
								<Tooltip>
									<TooltipTrigger asChild>
										<button className="p-2 text-slate-400 hover:text-[#002388] hover:bg-[#002388]/5 rounded-lg transition-all">
											<UserPlus size={16} />
										</button>
									</TooltipTrigger>
									<TooltipContent>Assign Lecturer</TooltipContent>
								</Tooltip>

								<Tooltip>
									<TooltipTrigger asChild>
										<button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
											<LinkIcon size={16} />
										</button>
									</TooltipTrigger>
									<TooltipContent>Link Classes</TooltipContent>
								</Tooltip>

								<button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
									<MoreVertical size={16} />
								</button>
							</div>
						</TooltipProvider>
					</div>
				);
			},
		},
	];

	return (
		<div className="mx-auto max-w-6xl space-y-8 pb-8">
			{/* Header Section */}
			<header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-1">
					<h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
						<BookOpen className="text-[#002388]" size={28} />
						Course Catalog
					</h1>
					<p className="text-sm text-slate-500">
						Manage academic courses, lecturer assignments, and class linkages.
					</p>
				</div>
				<button className="flex items-center gap-2 rounded-xl bg-[#002388] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#0B4DBB]">
					<BookPlus size={18} />
					Add New Course
				</button>
			</header>

			<DataTable 
				columns={columns} 
				data={courseAssignments} 
				searchKey="title" 
				placeholder="Search courses by title..." 
			/>
		</div>
	);
}
