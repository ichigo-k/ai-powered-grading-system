"use client";

import { recentUsers } from "@/lib/admin-dashboard";
import { 
	UserPlus, 
	Upload, 
	MoreVertical, 
	Edit2, 
	UserX,
	Mail,
	Users as UsersIcon,
	GraduationCap,
	ShieldCheck,
	CheckCircle2,
	AlertCircle,
	Clock,
	XCircle,
	ArrowUpDown
} from "lucide-react";
import { useMemo, useState } from "react";
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

const tabs = [
	{ key: "Student", label: "Students", icon: GraduationCap },
	{ key: "Lecturer", label: "Lecturers", icon: UsersIcon },
	{ key: "Admin", label: "Admins", icon: ShieldCheck },
] as const;

type UserRole = (typeof tabs)[number]["key"];

export default function AdminUsersPage() {
	const [activeTab, setActiveTab] = useState<UserRole>("Student");

	const counts = useMemo(() => {
		return {
			Student: recentUsers.filter(u => u.role === "Student").length,
			Lecturer: recentUsers.filter(u => u.role === "Lecturer").length,
			Admin: recentUsers.filter(u => u.role === "Admin").length,
		};
	}, []);

	const filteredData = useMemo(() => {
		return recentUsers.filter((user) => user.role === activeTab);
	}, [activeTab]);

	const columns: ColumnDef<typeof recentUsers[0]>[] = [
		{
			accessorKey: "name",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="-ml-4 h-8 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:bg-transparent"
					>
						User Name
						<ArrowUpDown className="ml-2 h-3 w-3" />
					</Button>
				)
			},
			cell: ({ row }) => (
				<div className="min-w-0">
					<p className="truncate font-semibold text-slate-900 group-hover:text-[#002388] transition-colors">
						{row.getValue("name")}
					</p>
					<p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
						{row.original.id}
					</p>
				</div>
			),
		},
		{
			accessorKey: "role",
			header: "Role",
			cell: ({ row }) => (
				<span className="text-xs font-medium text-slate-600">{row.getValue("role")}</span>
			),
		},
		{
			accessorKey: "meta",
			header: "Department / Class",
			cell: ({ row }) => (
				<span className="text-xs font-medium text-slate-600">{row.getValue("meta")}</span>
			),
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => {
				const status = row.getValue("status") as string;
				return (
					<Badge variant={status === "Active" ? "success" : status === "Suspended" ? "danger" : "warning"}>
						{status}
					</Badge>
				);
			},
		},
		{
			id: "actions",
			cell: ({ row }) => {
				const user = row.original;
				return (
					<div className="text-right">
						<TooltipProvider>
							<div className="flex items-center justify-end gap-1">
								<Tooltip>
									<TooltipTrigger asChild>
										<button className="p-2 text-slate-400 hover:text-[#002388] hover:bg-[#002388]/5 rounded-lg transition-all">
											<Mail size={16} />
										</button>
									</TooltipTrigger>
									<TooltipContent>Email User</TooltipContent>
								</Tooltip>

								<Tooltip>
									<TooltipTrigger asChild>
										<button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
											<Edit2 size={16} />
										</button>
									</TooltipTrigger>
									<TooltipContent>Edit Profile</TooltipContent>
								</Tooltip>

								<Tooltip>
									<TooltipTrigger asChild>
										<button className={`p-2 rounded-lg transition-all ${user.status === 'Suspended' ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}>
											{user.status === 'Suspended' ? <ShieldCheck size={16} /> : <UserX size={16} />}
										</button>
									</TooltipTrigger>
									<TooltipContent>{user.status === 'Suspended' ? "Unsuspend" : "Suspend"}</TooltipContent>
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
						User Directory
					</h1>
					<p className="text-sm text-slate-500">
						Manage students, lecturers, and administrative staff from a central directory.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50">
						<Upload size={18} className="text-slate-400" />
						Bulk Import
					</button>
					<button className="flex items-center gap-2 rounded-xl bg-[#002388] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#0B4DBB]">
						<UserPlus size={18} />
						Add User
					</button>
				</div>
			</header>

			<div className="flex flex-col gap-6">
				{/* Tabs Navigation */}
				<div className="flex items-center gap-8 border-b border-slate-200">
					{tabs.map(({ key, label, icon: Icon }) => {
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
								<Icon size={16} strokeWidth={active ? 2.5 : 2} />
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

				<DataTable 
					columns={columns} 
					data={filteredData} 
					searchKey="name" 
					placeholder={`Search ${activeTab.toLowerCase()}s...`}
				/>
			</div>
		</div>
	);
}

