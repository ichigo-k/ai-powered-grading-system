"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard, BookOpen, FileText, BarChart3, CalendarDays,
  Bell, LogOut, User, Menu, X,
} from "lucide-react"
import { signOutAction } from "@/app/actions/signout"

interface StudentNavbarProps {
  userName: string | null | undefined
  userId: string
}

const navItems = [
  { label: "Dashboard", href: "/student",          Icon: LayoutDashboard },
  { label: "Courses",   href: "/student/courses",  Icon: BookOpen },
  { label: "Exams",     href: "/student/exams",    Icon: FileText },
  { label: "Grades",    href: "/student/grades",   Icon: BarChart3 },
  { label: "Schedule",  href: "/student/schedule", Icon: CalendarDays },
]

export default function StudentNavbar({ userName }: StudentNavbarProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white" style={{ borderBottom: "1px solid #E2E8F0" }}>
        <div className="max-w-6xl mx-auto h-16 px-4 md:px-6 flex items-center gap-8">

          {/* Logo */}
          <Link href="/student" className="flex items-center gap-1.5 flex-shrink-0">
            <Image src="/logos/gctu-logo.png" alt="GCTU" width={40} height={40} className="object-contain" />
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-bold" style={{ color: "#002388" }}>GCTU</p>
              <p className="text-xs" style={{ color: "#64748B" }}>Exam Portal</p>
            </div>
          </Link>

          {/* Nav links — desktop */}
          <div className="hidden md:flex items-center flex-1">
            {navItems.map(({ label, href, Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative flex items-center gap-2 px-3.5 h-16 text-sm font-medium transition-colors"
                  style={{ color: active ? "#002388" : "#64748B" }}
                >
                  <Icon size={15} strokeWidth={active ? 2.5 : 1.8} />
                  {label}
                  {active && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ background: "#002388" }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1 ml-auto">

            {/* Bell */}
            <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>

            {/* Avatar + dropdown */}
            <div className="relative ml-1">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                onBlur={() => setTimeout(() => setProfileOpen(false), 150)}
                className="flex items-center justify-center w-8 h-8 rounded-full text-slate-500 hover:text-[#002388] hover:bg-slate-50 transition-colors"
              >
                <User size={20} />
              </button>

              {profileOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg p-1.5" style={{ border: "1px solid #E2E8F0" }}>
                  <div className="px-3 py-2 mb-1">
                    <p className="text-xs font-semibold truncate" style={{ color: "#0A1628" }}>{userName}</p>
                    <p className="text-[11px] text-slate-400">Student</p>
                  </div>
                  <Link
                    href="/student/profile"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <User size={14} />
                    Profile
                  </Link>
                  <div className="h-px bg-slate-100 my-1" />
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors ml-1"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 z-40 bg-white px-4 py-3 flex flex-col gap-1" style={{ borderBottom: "1px solid #E2E8F0" }}>
          {navItems.map(({ label, href, Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={
                  active
                    ? { background: "#EEF2FF", color: "#002388" }
                    : { color: "#64748B" }
                }
              >
                <Icon size={15} strokeWidth={active ? 2.5 : 1.8} />
                {label}
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
