"use client"

import { useState } from "react"
import Link from "next/link"
import { User, LogOut, ChevronDown, Bell, Settings, Search, Menu } from "lucide-react"
import { signOutAction } from "@/app/actions/signout"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface AdminNavbarProps {
  userName: string | null | undefined
  userId: string
}

export default function AdminNavbar({ userName, userId }: AdminNavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : "AD"

  return (
    <nav className="h-16 border-b border-[#F1F5F9] bg-white sticky top-0 z-30 px-4 flex items-center justify-between">
      {/* Left: Sidebar Toggle & Search */}
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger className="text-black scale-110 hover:bg-slate-100 transition-all font-bold" />
        
        <div className="hidden md:block w-px h-6 bg-[#F1F5F9]" />

        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#002388] transition-colors" />
            <input 
              type="text" 
              placeholder="Search dashboard..." 
              className="w-full h-9 bg-[#F8FAFC] border-transparent rounded-lg pl-10 pr-4 text-xs font-medium focus:bg-white focus:ring-4 focus:ring-[#002388]/5 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* Right: Actions and Profile */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="p-2 hover:bg-[#F8FAFC] rounded-lg text-[#64748B] hover:text-[#002388] transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white" />
        </button>

        <button className="p-2 hover:bg-[#F8FAFC] rounded-lg text-[#64748B] hover:text-[#002388] transition-colors">
          <Settings size={18} />
        </button>

        <div className="h-6 w-px bg-[#F1F5F9] mx-1" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            onBlur={() => setTimeout(() => setIsProfileOpen(false), 200)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#F8FAFC] transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-[#002388] flex items-center justify-center text-[10px] font-black text-white shadow-sm">
              {initials}
            </div>
            <div className="flex flex-col items-start hidden sm:flex">
              <span className="text-[11px] font-black text-[#002388] uppercase tracking-tight leading-none">{userName || "Admin"}</span>
              <span className="text-[9px] font-bold text-[#94A3B8] leading-none mt-1">ADMINISTRATOR</span>
            </div>
            <ChevronDown size={14} className={`text-[#94A3B8] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-[#F1F5F9] rounded-xl shadow-xl shadow-blue-900/5 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
              <Link href="/admin/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#002388] transition-colors">
                <User size={14} />
                Edit Profile
              </Link>
              
              <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#002388] transition-colors">
                <Settings size={14} />
                System Settings
              </Link>

              <div className="h-px bg-[#F1F5F9] my-1" />

              <form action={signOutAction}>
                <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-[#EF4444] hover:bg-red-50 transition-colors">
                  <LogOut size={14} />
                  Sign Out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
