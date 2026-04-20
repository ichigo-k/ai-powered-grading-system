"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  BarChart3, 
  Calendar, 
  ChevronDown, 
  Search, 
  Bell, 
  HelpCircle, 
  LogOut, 
  User,
  Grid
} from "lucide-react"
import { signOutAction } from "@/app/actions/signout"

interface StudentNavbarProps {
  userName: string | null | undefined
  userId: string
}

export default function StudentNavbar({ userName, userId }: StudentNavbarProps) {
  const pathname = usePathname()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSpacesOpen, setIsSpacesOpen] = useState(false)

  const navItems = [
    { label: "Dashboard", href: "/student", icon: <LayoutDashboard size={16} /> },
    { label: "My Courses", href: "/student/courses", icon: <BookOpen size={16} /> },
    { label: "Exams & Tests", href: "/student/exams", icon: <FileText size={16} /> },
    { label: "Grades", href: "/student/grades", icon: <BarChart3 size={16} /> },
    { label: "Schedule", href: "/student/schedule", icon: <Calendar size={16} /> },
  ]

  const activeItem = navItems.find(item => pathname === item.href) || navItems[0]

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-[#E2E8F0] shadow-sm">
      <div className="max-w-[1400px] mx-auto h-16 px-4 md:px-6 flex items-center justify-between">
        
        {/* Left: Logo & Mobile Menu & Spaces Dropdown */}
        <div className="flex items-center gap-2 md:gap-6">
          <button 
            className="md:hidden p-2 hover:bg-[#F8FAFC] rounded-lg text-[#64748B]"
            onClick={() => setIsSpacesOpen(!isSpacesOpen)}
          >
            <Grid size={20} />
          </button>

          <Link href="/student" className="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95">
            <Image 
              src="/logos/gctu-logo.png" 
              alt="GCTU" 
              width={34} 
              height={34} 
              className="object-contain" 
            />
            <span className="font-black text-xl tracking-tight text-[#002388] hidden xs:block">Exam Portal</span>
          </Link>

          <div className="hidden md:block h-6 w-[1px] bg-[#E2E8F0]" />

          {/* Spaces Dropdown (ClickUp Style) */}
          <div className="relative hidden md:block">
            <button 
              onClick={() => setIsSpacesOpen(!isSpacesOpen)}
              onBlur={() => setTimeout(() => setIsSpacesOpen(false), 200)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#F8FAFC] transition-all group"
            >
              <div className="w-5 h-5 rounded bg-[#EEF2FF] flex items-center justify-center text-[#002388]">
                {activeItem.icon}
              </div>
              <span className="text-sm font-bold text-[#002388]">{activeItem.label}</span>
              <ChevronDown size={14} className={`text-[#94A3B8] transition-transform ${isSpacesOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSpacesOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-[#E2E8F0] rounded-xl shadow-xl shadow-blue-900/5 p-2 animate-in fade-in zoom-in-95 duration-100">
                <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#CBD5E1]">Academic Spaces</p>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                      pathname === item.href 
                        ? 'bg-[#EEF2FF] text-[#002388]' 
                        : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#002388]'
                    }`}
                  >
                    <span className={pathname === item.href ? 'text-[#002388]' : 'text-[#94A3B8]'}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Search Bar (Hidden on mobile) */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-6 xl:mx-12">
          <div className="relative w-full group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#002388] transition-colors" />
            <input 
              type="text" 
              placeholder="Search everything..." 
              className="w-full h-10 bg-[#F1F5F9] border-transparent rounded-lg pl-10 pr-4 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-[#002388]/5 transition-all outline-none"
            />
          </div>
        </div>

        {/* Right: Actions & User Profile */}
        <div className="flex items-center gap-1 md:gap-2">
          <button className="hidden sm:flex p-2 hover:bg-[#F8FAFC] rounded-lg text-[#64748B] hover:text-[#002388] transition-colors">
            <Search size={20} className="lg:hidden" />
          </button>
          
          <button className="p-2 hover:bg-[#F8FAFC] rounded-lg text-[#64748B] hover:text-[#002388] transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white" />
          </button>
          
          <button className="hidden md:flex p-2 hover:bg-[#F8FAFC] rounded-lg text-[#64748B] hover:text-[#002388] transition-colors">
            <HelpCircle size={20} />
          </button>

          <div className="h-6 w-[1px] bg-[#E2E8F0] mx-1 md:mx-2" />

          {/* User Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              onBlur={() => setTimeout(() => setIsProfileOpen(false), 200)}
              className="flex items-center gap-2 p-1 md:pl-2 rounded-xl border border-[#F1F5F9] hover:border-[#E2E8F0] hover:bg-[#F8FAFC] transition-all bg-white overflow-hidden"
            >
              <div className="flex flex-col items-end mr-1 hidden lg:flex">
                <span className="text-[11px] font-black text-[#002388] uppercase tracking-tighter leading-none">{userName || "Student"}</span>
                <span className="text-[9px] font-bold text-[#94A3B8] leading-none mt-1 uppercase">Student</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#002388] to-[#0055A4] flex items-center justify-center text-[10px] font-black text-white uppercase shadow-sm">
                {userName ? (userName.split(' ').map(n => n[0]).join('').slice(0, 2)) : "ST"}
              </div>
              <ChevronDown size={14} className={`text-[#94A3B8] transition-transform mr-1 hidden sm:block ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-[#E2E8F0] rounded-xl shadow-xl shadow-blue-900/10 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-3 border-b mb-1 lg:hidden">
                   <p className="text-[11px] font-black text-[#002388] uppercase tracking-widest leading-none mb-1">{userName}</p>
                   <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Student</p>
                </div>
                
                <Link href="/student/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#002388] transition-colors">
                  <User size={16} />
                  My Profile
                </Link>

                <div className="h-px bg-[#F1F5F9] my-2" />

                <form action={signOutAction}>
                  <button type="submit" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-[#EF4444] hover:bg-red-50 transition-colors">
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer (Overlay-style using the Spaces Dropdown state) */}
        {isSpacesOpen && (
          <div className="md:hidden fixed inset-0 z-[-1] bg-white pt-20 px-6 animate-in slide-in-from-left duration-300">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#CBD5E1] mb-6">Academic Spaces</p>
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSpacesOpen(false)}
                  className={`flex items-center gap-4 p-4 rounded-xl text-base font-black transition-all ${
                    pathname === item.href 
                      ? 'bg-[#EEF2FF] text-[#002388] translate-x-2' 
                      : 'text-[#64748B] active:bg-[#F8FAFC]'
                  }`}
                >
                  <span className={pathname === item.href ? 'text-[#002388]' : 'text-[#94A3B8]'}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </nav>
  )
}
