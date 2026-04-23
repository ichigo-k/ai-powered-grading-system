"use client";

import {
	Bell,
	CalendarDays,
	FileText,
	LayoutDashboard,
	LogOut,
	Menu,
	User,
	X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOutAction } from "@/app/actions/signout";

interface StudentNavbarProps {
	userName: string | null | undefined;
}

const navItems = [
	{ label: "Dashboard", href: "/student", Icon: LayoutDashboard },
	{ label: "Assessments", href: "/student/assessments", Icon: FileText },
	{ label: "Schedule", href: "/student/schedule", Icon: CalendarDays },
];

export default function StudentNavbar({ userName }: StudentNavbarProps) {
	const pathname = usePathname();
	const [menuOpen, setMenuOpen] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);

	return (
		<>
			<nav
				className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm"
				style={{ borderBottom: "1px solid #E2E8F0" }}
			>
				<div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4 md:px-6">
					<Link
						href="/student"
						className="flex flex-shrink-0 items-center gap-1.5"
					>
						<Image
							src="/logos/gctu-logo.png"
							alt="GCTU"
							width={40}
							height={40}
							className="object-contain"
						/>
						<div className="hidden leading-tight sm:block">
							<p className="text-sm font-bold" style={{ color: "#002388" }}>
								GCTU
							</p>
							<p className="text-xs" style={{ color: "#64748B" }}>
								Assessment Portal
							</p>
						</div>
					</Link>

					<div className="hidden flex-1 items-center md:flex">
						{navItems.map(({ label, href, Icon }) => {
							const active = pathname === href;
							return (
								<Link
									key={href}
									href={href}
									className="relative flex h-16 items-center gap-2 px-3.5 text-sm font-medium transition-colors"
									style={{ color: active ? "#002388" : "#64748B" }}
								>
									<Icon size={15} strokeWidth={active ? 2.5 : 1.8} />
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

					<div className="ml-auto flex items-center gap-1">
						<button
							type="button"
							className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
						>
							<Bell size={18} />
							<span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
						</button>

						<div className="relative ml-1">
							<button
								type="button"
								onClick={() => setProfileOpen(!profileOpen)}
								onBlur={() => setTimeout(() => setProfileOpen(false), 150)}
								className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-50 hover:text-[#002388]"
							>
								<User size={20} />
							</button>

							{profileOpen ? (
								<div
									className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white p-1.5 shadow-lg"
									style={{ border: "1px solid #E2E8F0" }}
								>
									<div className="mb-1 px-3 py-2">
										<p
											className="truncate text-xs font-semibold"
											style={{ color: "#0A1628" }}
										>
											{userName}
										</p>
										<p className="text-[11px] text-slate-400">Student</p>
									</div>
									<Link
										href="/student/profile"
										className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
									>
										<User size={14} />
										Profile
									</Link>
									<div className="my-1 h-px bg-slate-100" />
									<form action={signOutAction}>
										<button
											type="submit"
											className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
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
							className="ml-1 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 md:hidden"
							onClick={() => setMenuOpen(!menuOpen)}
						>
							{menuOpen ? <X size={18} /> : <Menu size={18} />}
						</button>
					</div>
				</div>
			</nav>

			{menuOpen ? (
				<div
					className="fixed inset-x-0 top-16 z-40 flex flex-col gap-1 bg-white px-4 py-3 md:hidden"
					style={{ borderBottom: "1px solid #E2E8F0" }}
				>
					{navItems.map(({ label, href, Icon }) => {
						const active = pathname === href;
						return (
							<Link
								key={href}
								href={href}
								onClick={() => setMenuOpen(false)}
								className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
								style={
									active
										? { background: "#EEF2FF", color: "#002388" }
										: { color: "#64748B" }
								}
							>
								<Icon size={15} strokeWidth={active ? 2.5 : 1.8} />
								{label}
							</Link>
						);
					})}
				</div>
			) : null}
		</>
	);
}
