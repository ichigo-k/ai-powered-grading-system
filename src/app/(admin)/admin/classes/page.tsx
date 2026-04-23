"use client";

import { classes } from "@/lib/admin-dashboard";
import { 
	FolderPlus, 
	Users as UsersIcon, 
	BookOpen, 
	MoreVertical, 
	Settings2,
	UserPlus,
	ArrowUpDown,
	GraduationCap
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

export default function AdminClassesPage() {
	const columns: ColumnDef<typeof classes[0]>[] = [
		{
			accessorKey: "name",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="-ml-4 h-8 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:bg-transparent"
					>
						Class Name
						<ArrowUpDown className="ml-2 h-3 w-3" />
					</Button>
				)
			},
			cell: ({ row }) => (
				<span className="font-semibold text-slate-900 group-hover:text-[#002388] transition-colors">{row.getValue("name")}</span>
			),
		},
		{
			accessorKey: "students",
			header: "Students",
			cell: ({ row }) => (
				<span className="text-xs font-semibold text-slate-600">{row.getValue("students")}</span>
			),
		},
		{
			accessorKey: "courses",
			header: "Courses",
			cell: ({ row }) => (
				<span className="text-xs font-semibold text-slate-600">{row.getValue("courses")}</span>
			),
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => {
				const status = row.getValue("status") as string;
				return (
					<Badge variant={status === "Ready" ? "success" : "warning"}>
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
									<TooltipContent>Manage Students</TooltipContent>
								</Tooltip>

								<Tooltip>
									<TooltipTrigger asChild>
										<button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
											<Settings2 size={16} />
										</button>
									</TooltipTrigger>
									<TooltipContent>Class Config</TooltipContent>
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
						<UsersIcon className="text-[#002388]" size={28} />
						Classes
					</h1>
					<p className="text-sm text-slate-500">
						Manage academic groups, their students, and course assignments.
					</p>
				</div>
				<button className="flex items-center gap-2 rounded-xl bg-[#002388] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#0B4DBB]">
					<FolderPlus size={18} />
					Create New Class
				</button>
			</header>

			<DataTable 
				columns={columns} 
				data={classes} 
				searchKey="name" 
				placeholder="Search classes by name..." 
			/>
		</div>
	);
}
