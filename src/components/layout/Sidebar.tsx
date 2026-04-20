"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOutAction } from "@/app/actions/signout"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  active?: boolean
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
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }
  return userId.slice(0, 2).toUpperCase()
}

export default function Sidebar({ userName, userId, navItems }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className="fixed top-0 left-0 h-full w-64 flex flex-col"
      style={{ backgroundColor: "#003366", color: "white" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <Image
          src="/logos/gctu-logo.png"
          alt="GCTU Logo"
          width={40}
          height={40}
          className="object-contain"
        />
        <span className="text-white font-bold text-lg tracking-wide">GCTU</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href + "/"))

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 py-3 px-4 text-white transition-colors hover:bg-white/10"
              style={
                isActive
                  ? {
                      borderLeft: "4px solid #FFCC00",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      paddingLeft: "12px",
                    }
                  : { borderLeft: "4px solid transparent" }
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
            style={{ backgroundColor: "#FFCC00", color: "#003366" }}
          >
            {getInitials(userName, userId)}
          </div>
          <div className="overflow-hidden">
            {userName && (
              <p className="text-white text-sm font-medium truncate">{userName}</p>
            )}
            <p className="text-white/70 text-xs truncate">{userId}</p>
          </div>
        </div>

        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full py-2 px-3 rounded text-sm font-medium transition-colors hover:bg-white/10"
            style={{ border: "1px solid rgba(255,255,255,0.3)", color: "white" }}
          >
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}
