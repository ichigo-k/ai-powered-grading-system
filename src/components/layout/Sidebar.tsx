"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOutAction } from "@/app/actions/signout"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface SidebarProps {
  role: "admin" | "lecturer" | "student"
  userName: string | null | undefined
  userId: string
  navItems: NavItem[]
}

function getInitials(userName: string | null | undefined, userId: string): string {
  if (userName && userName.trim().length > 0) {
    const parts = userName.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return parts[0].slice(0, 2).toUpperCase()
  }
  return userId.slice(0, 2).toUpperCase()
}

const roleLabel: Record<string, string> = {
  admin: "Administrator",
  lecturer: "Lecturer",
  student: "Student",
}

const SupportIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const SignOutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

export default function Sidebar({ role, userName, userId, navItems }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className="fixed top-0 left-0 h-full w-64 flex flex-col z-40"
      style={{ background: "linear-gradient(180deg, #0A1628 0%, #0D2045 100%)" }}
    >
      {/* Logo area */}
      <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ background: "rgba(245,197,24,0.15)", border: "1.5px solid rgba(245,197,24,0.3)" }}
        >
          <Image
            src="/logos/gctu-logo.png"
            alt="GCTU"
            width={28}
            height={28}
            className="object-contain"
          />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight tracking-wide">GCTU</p>
          <p className="text-xs leading-tight" style={{ color: "rgba(245,197,24,0.8)" }}>Academic Lumina</p>
        </div>
      </div>

      {/* Role pill */}
      <div className="px-5 pt-4 pb-2">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
          style={{ background: "rgba(245,197,24,0.12)", color: "#F5C518" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {roleLabel[role]}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href + "/"))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive ? "nav-active" : "hover:bg-white/5"
              }`}
              style={isActive ? { color: "#F5C518" } : { color: "rgba(255,255,255,0.65)" }}
            >
              <span
                className="flex-shrink-0 transition-colors"
                style={isActive ? { color: "#F5C518" } : { color: "rgba(255,255,255,0.4)" }}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#F5C518" }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-1 border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-white/5"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          <SupportIcon />
          <span>Support</span>
        </button>

        {/* User row */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #F5C518 0%, #e6b800 100%)", color: "#0A1628" }}
          >
            {getInitials(userName, userId)}
          </div>
          <div className="flex-1 min-w-0">
            {userName && (
              <p className="text-white text-xs font-semibold truncate">{userName}</p>
            )}
            <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{userId}</p>
          </div>
        </div>

        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-red-500/10"
            style={{ color: "#EF4444" }}
          >
            <SignOutIcon />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
