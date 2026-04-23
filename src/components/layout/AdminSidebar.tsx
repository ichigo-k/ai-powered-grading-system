"use client";

import {
	BookOpen,
	FolderKanban,
	LayoutDashboard,
	LogOut,
	Settings,
	Users,
	ChevronRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions/signout";

const navItems = [
	{ label: "Dashboard", href: "/admin", Icon: LayoutDashboard },
	{ label: "Users", href: "/admin/users", Icon: Users },
	{ label: "Classes", href: "/admin/classes", Icon: FolderKanban },
	{ label: "Courses", href: "/admin/courses", Icon: BookOpen },
	{ label: "Settings", href: "/admin/settings", Icon: Settings },
];

interface AdminSidebarProps {
	userName: string | null | undefined;
	userId: string;
}

function getInitials(userName: string | null | undefined, userId: string) {
	if (userName && userName.trim().length > 0) {
		const parts = userName.trim().split(/\s+/);
		if (parts.length >= 2) {
			return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
		}
		return parts[0].slice(0, 2).toUpperCase();
	}

	return userId.slice(0, 2).toUpperCase();
}

export default function AdminSidebar({ userName, userId }: AdminSidebarProps) {
	const pathname = usePathname();
	const initials = getInitials(userName, userId);

	return (
		<aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white xl:flex xl:flex-col">
			<div className="px-6 py-8">
				<div className="flex items-center gap-3">
					<div className="flex items-center justify-center shrink-0">
						<Image
							src="/logos/gctu-logo.png"
							alt="GCTU"
							width={48}
							height={48}
							className="object-contain"
						/>
					</div>
					<div>
						<p className="text-xl font-bold leading-none tracking-tight text-[#002388]">
							GCTU
						</p>
						<p className="mt-1 text-sm font-medium text-slate-500">
							Assessment Portal
						</p>
					</div>
				</div>
			</div>

			<div className="flex-1 px-4">
				<div className="mb-4 px-4 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
					Menu
				</div>
				<nav className="space-y-1">
					{navItems.map(({ label, href, Icon }) => {
						const active =
							pathname === href ||
							(href !== "/admin" && pathname.startsWith(`${href}/`));

						return (
							<Link
								key={href}
								href={href}
								className={`group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${active
									? "bg-slate-900 text-white"
									: "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
									}`}
							>
								<Icon size={18} className={active ? "text-white" : "text-slate-400 group-hover:text-slate-900"} />
								<span className="flex-1">{label}</span>
								{active && <ChevronRight size={14} className="opacity-50" />}
							</Link>
						);
					})}
				</nav>
			</div>

			<div className="border-t border-slate-100 p-4">
				<div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white uppercase">
							{initials}
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-bold text-slate-900">
								{userName ?? "Admin User"}
							</p>
							<p className="mt-0.5 text-[10px] font-medium text-slate-500 truncate">
								System Administrator
							</p>
						</div>
					</div>
					<form action={signOutAction} className="mt-4">
						<button
							type="submit"
							className="flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-red-50 hover:border-red-100 hover:text-red-600"
						>
							<LogOut size={14} />
							Sign Out
						</button>
					</form>
				</div>
			</div>
		</aside>
	);
}
