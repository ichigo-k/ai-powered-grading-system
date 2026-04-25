"use client";

import { useMemo, useState } from "react";
import AddUserSheet from "./AddUserSheet";
import BulkImportSheet from "./BulkImportSheet";
import { ColumnDef } from "@tanstack/react-table";
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
	ArrowUpDown,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import type { UserWithProfile } from "@/lib/admin-users";

const tabs = [
	{ key: "STUDENT" as const, label: "Students", icon: GraduationCap },
	{ key: "LECTURER" as const, label: "Lecturers", icon: UsersIcon },
	{ key: "ADMIN" as const, label: "Admins", icon: ShieldCheck },
];

type UserRole = (typeof tabs)[number]["key"];

function emailLocalPart(email: string): string {
	return email.split("@")[0];
}

function StatusBadge({ status }: { status: UserWithProfile["status"] }) {
	const variant =
		status === "ACTIVE" ? "success" : status === "SUSPENDED" ? "danger" : "warning";
	const label = status === "ACTIVE" ? "Active" : status === "SUSPENDED" ? "Suspended" : "Pending";
	return <Badge variant={variant}>{label}</Badge>;
}

function ActionButtons({ user }: { user: UserWithProfile }) {
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
							<button
								className={`p-2 rounded-lg transition-all ${
									user.status === "SUSPENDED"
										? "text-emerald-500 hover:bg-emerald-50"
										: "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
								}`}
							>
								{user.status === "SUSPENDED" ? (
									<ShieldCheck size={16} />
								) : (
									<UserX size={16} />
								)}
							</button>
						</TooltipTrigger>
						<TooltipContent>
							{user.status === "SUSPENDED" ? "Unsuspend" : "Suspend"}
						</TooltipContent>
					</Tooltip>

					<button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
						<MoreVertical size={16} />
					</button>
				</div>
			</TooltipProvider>
		</div>
	);
}

function nameColumn(): ColumnDef<UserWithProfile> {
	return {
		accessorKey: "name",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="-ml-4 h-8 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:bg-transparent"
			>
				User Name
				<ArrowUpDown className="ml-2 h-3 w-3" />
			</Button>
		),
		cell: ({ row }) => (
			<div className="min-w-0">
				<p className="truncate font-semibold text-slate-900 group-hover:text-[#002388] transition-colors">
					{row.original.name ?? "—"}
				</p>
				<p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
					{emailLocalPart(row.original.email)}
				</p>
			</div>
		),
	};
}

function actionsColumn(): ColumnDef<UserWithProfile> {
	return {
		id: "actions",
		cell: ({ row }) => <ActionButtons user={row.original} />,
	};
}

const studentColumns: ColumnDef<UserWithProfile>[] = [
	nameColumn(),
	{
		id: "program",
		header: "Program",
		cell: ({ row }) => {
			const p = row.original.studentProfile;
			return p ? (
				<span className="text-xs font-medium text-slate-700">{p.program}</span>
			) : (
				<span className="text-xs text-slate-400">—</span>
			);
		},
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => <StatusBadge status={row.original.status} />,
	},
	actionsColumn(),
];

const lecturerColumns: ColumnDef<UserWithProfile>[] = [
	nameColumn(),
	{
		id: "deptTitle",
		header: "Department / Title",
		cell: ({ row }) => {
			const p = row.original.lecturerProfile;
			return p ? (
				<div>
					<p className="text-xs font-medium text-slate-700">{p.department}</p>
					<p className="text-[10px] text-slate-400 font-medium">{p.title}</p>
				</div>
			) : (
				<span className="text-xs text-slate-400">—</span>
			);
		},
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => <StatusBadge status={row.original.status} />,
	},
	actionsColumn(),
];

const adminColumns: ColumnDef<UserWithProfile>[] = [
	nameColumn(),
	{
		id: "dateJoined",
		header: "Date Joined",
		cell: ({ row }) => (
			<span className="text-xs font-medium text-slate-700">
				{new Date(row.original.dateJoined ?? row.original.createdAt).toLocaleDateString()}
			</span>
		),
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => <StatusBadge status={row.original.status} />,
	},
	actionsColumn(),
];

const columnsByRole: Record<UserRole, ColumnDef<UserWithProfile>[]> = {
	STUDENT: studentColumns,
	LECTURER: lecturerColumns,
	ADMIN: adminColumns,
};

export default function UsersClient({ users }: { users: UserWithProfile[] }) {
	const [activeTab, setActiveTab] = useState<UserRole>("STUDENT");
	const [addUserOpen, setAddUserOpen] = useState(false);
	const [bulkImportOpen, setBulkImportOpen] = useState(false);

	const counts = useMemo(
		() => ({
			STUDENT: users.filter((u) => u.role === "STUDENT").length,
			LECTURER: users.filter((u) => u.role === "LECTURER").length,
			ADMIN: users.filter((u) => u.role === "ADMIN").length,
		}),
		[users],
	);

	const filteredData = useMemo(
		() => users.filter((u) => u.role === activeTab),
		[users, activeTab],
	);

	return (
		<div className="flex flex-col gap-6">
			{/* Action buttons */}
			<div className="flex items-center justify-end gap-3">
				<button
					onClick={() => setBulkImportOpen(true)}
					className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50">
					<Upload size={18} className="text-slate-400" />
					Bulk Import
				</button>
				<button
					onClick={() => setAddUserOpen(true)}
					className="flex items-center gap-2 rounded-xl bg-[#002388] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#0B4DBB]"
				>
					<UserPlus size={18} />
					Add User
				</button>
			</div>

			<AddUserSheet open={addUserOpen} onOpenChange={setAddUserOpen} />
			<BulkImportSheet open={bulkImportOpen} onOpenChange={setBulkImportOpen} />

			{/* Tabs */}
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
				columns={columnsByRole[activeTab]}
				data={filteredData}
				searchKey="name"
				placeholder={`Search ${activeTab.toLowerCase()}s...`}
			/>
		</div>
	);
}
