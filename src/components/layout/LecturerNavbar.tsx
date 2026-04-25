"use client";

import {
	Bell,
	FileCheck,
	FileText,
	LayoutDashboard,
	LogOut,
	Menu,
	PlusCircle,
	User,
	X,
	Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOutAction } from "@/app/actions/signout";

interface LecturerNavbarProps {
	userName: string | null | undefined;
}

const navItems = [
	{ label: "Dashboard", href: "/lecturer", Icon: LayoutDashboard },
	{ label: "Assessments", href: "/lecturer/assessments", Icon: FileText },
	{ label: "Grade Book", href: "/lecturer/grades", Icon: FileCheck },
	{ label: "Create Test", href: "/lecturer/tests/new", Icon: PlusCircle },
];

export default function LecturerNavbar({ userName }: LecturerNavbarProps) {
	const pathname = usePathname();
	const [menuOpen, setMenuOpen] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);

	return (
		<>
			<nav
				className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm shadow-sm"
				style={{ borderBottom: "1px solid #E2E8F0" }}
			>
				<div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 md:px-6">
					<Link
						href="/lecturer"
						className="flex flex-shrink-0 items-center gap-2"
					>
						<Image
							src="/logos/gctu-logo.png"
							alt="GCTU"
							width={38}
							height={38}
							className="object-contain"
						/>
						<div className="hidden leading-tight sm:block">
							<p className="text-sm font-bold" style={{ color: "#002388" }}>
								GCTU
							</p>
							<p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#64748B" }}>
								Lecturer Portal
							</p>
						</div>
					</Link>

					<div className="hidden flex-1 items-center md:flex ml-4">
						{navItems.map(({ label, href, Icon }) => {
							const active = pathname === href || (href !== "/lecturer" && pathname.startsWith(href));
							return (
								<Link
									key={href}
									href={href}
									className="relative flex h-16 items-center gap-2 px-4 text-sm font-semibold transition-colors"
									style={{ color: active ? "#002388" : "#64748B" }}
								>
									<Icon size={16} strokeWidth={active ? 2.5 : 2} />
									{label}
									{active ? (
										<span
											className="absolute bottom-0 left-0 right-0 h-0.5"
											style={{ background: "#002388" }}
										/>
									) : null}
								</Link>
							);
						})}
					</div>

					<div className="ml-auto flex items-center gap-2">
						<button
							type="button"
							className="relative rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 border border-transparent hover:border-slate-100"
						>
							<Bell size={18} />
							<span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
						</button>

						<div className="relative ml-1">
							<button
								type="button"
								onClick={() => setProfileOpen(!profileOpen)}
								className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-slate-100 hover:bg-slate-50 transition-all"
							>
								<div className="hidden sm:block text-right mr-1">
									<p className="text-xs font-bold text-slate-900 leading-none mb-0.5">{userName}</p>
									<p className="text-[9px] font-bold text-indigo-600 uppercase tracking-tighter leading-none">Lecturer</p>
								</div>
								<div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
									{userName?.split(' ').map(n => n[0]).join('')}
								</div>
							</button>

							{profileOpen ? (
								<div
									className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-200"
									style={{ border: "1px solid #E2E8F0" }}
								>
									<div className="mb-2 px-3 py-2 border-b border-slate-50">
										<p className="truncate text-xs font-bold text-slate-900">
											{userName}
										</p>
										<p className="text-[10px] text-slate-400 font-medium">Lecturer Account</p>
									</div>
									<Link
										href="/lecturer/settings"
										className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
									>
										<Settings size={14} />
										Account Settings
									</Link>
									<div className="my-1 h-px bg-slate-100" />
									<form action={signOutAction}>
										<button
											type="submit"
											className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
										>
											<LogOut size={14} />
											Sign out
										</button>
									</form>
								</div>
							) : null}
						</div>

						<button
							type="button"
							className="ml-1 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 md:hidden"
							onClick={() => setMenuOpen(!menuOpen)}
						>
							{menuOpen ? <X size={20} /> : <Menu size={20} />}
						</button>
					</div>
				</div>
			</nav>

			{menuOpen ? (
				<div
					className="fixed inset-x-0 top-16 z-40 flex flex-col gap-1 bg-white px-4 py-3 md:hidden shadow-lg"
					style={{ borderBottom: "1px solid #E2E8F0" }}
				>
					{navItems.map(({ label, href, Icon }) => {
						const active = pathname === href;
						return (
							<Link
								key={href}
								href={href}
								onClick={() => setMenuOpen(false)}
								className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors"
								style={
									active
										? { background: "#F5F3FF", color: "#7C3AED" }
										: { color: "#64748B" }
								}
							>
								<Icon size={16} strokeWidth={active ? 2.5 : 2} />
								{label}
							</Link>
						);
					})}
				</div>
			) : null}
		</>
	);
}
