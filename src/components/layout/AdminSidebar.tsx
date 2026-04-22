"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  UserCog, 
  BookOpen, 
  BarChart3, 
  Settings,
  ChevronRight,
  ShieldCheck,
  UserCircle
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface AdminSidebarProps {
  userName: string | null | undefined
  userId: string
}

const generalItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Course Directory",
    url: "/admin/courses",
    icon: BookOpen,
  },
  {
    title: "Reports",
    url: "/admin/reports",
    icon: BarChart3,
  },
  {
    title: "System Settings",
    url: "/admin/settings",
    icon: Settings,
  },
]

const userManagementSubItems = [
  {
    title: "Student Mgt",
    url: "/admin/users/students",
    icon: GraduationCap,
  },
  {
    title: "Lecturer Mgt",
    url: "/admin/users/lecturers",
    icon: UserCog,
  },
  {
    title: "Admin Mgt",
    url: "/admin/users/admins",
    icon: ShieldCheck,
  },
  {
    title: "All Users",
    url: "/admin/users",
    icon: Users,
  },
]

export default function AdminSidebar({ userName, userId }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-white">
      <SidebarHeader className="h-20 flex items-center px-6">
        <div className="flex items-center gap-3 w-full overflow-hidden">
          <div className="flex items-center justify-center flex-shrink-0">
            <Image
              src="/logos/gctu-logo.png"
              alt="GCTU"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden whitespace-nowrap">
            <p className="font-black text-[#002388] text-xl tracking-tighter leading-none">Exam Portal</p>
            <p className="text-[10px] font-bold leading-tight uppercase tracking-[0.2em] mt-1 text-[#94A3B8]">Academic Admin</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 pt-6">
        {/* General Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-black uppercase tracking-[0.1em] text-[#CBD5E1] px-3 mb-4">
            General
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {generalItems.map((item) => {
                const isActive = pathname === item.url || (item.url !== "/admin" && pathname.startsWith(item.url))
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`h-11 px-4 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? "bg-[#002388] text-white shadow-lg shadow-blue-900/20 hover:bg-[#002388] hover:text-white" 
                          : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#002388]"
                      }`}
                    >
                      <Link href={item.url} className="flex items-center gap-3 font-bold">
                        <item.icon size={20} className={isActive ? "text-white" : "text-[#94A3B8] group-hover:text-[#002388]"} />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Management Group (Collapsible) */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-[11px] font-black uppercase tracking-[0.1em] text-[#CBD5E1] px-3 mb-4">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                        tooltip="User Management"
                        className="h-11 px-4 rounded-xl text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#002388] transition-all"
                    >
                      <UserCircle size={20} className="text-[#94A3B8]" />
                      <span className="text-sm font-black text-[#64748B] group-hover:text-[#002388]">User Management</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-[#94A3B8]" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1">
                    <SidebarMenuSub className="border-l-0 ml-4 gap-1">
                      {userManagementSubItems.map((subItem) => {
                        const isSubActive = pathname === subItem.url
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={isSubActive}>
                              <Link href={subItem.url} className={`h-10 px-4 rounded-lg text-xs font-black transition-all duration-200 ${
                                isSubActive 
                                  ? "bg-[#F5C518] text-[#002388] shadow-sm shadow-yellow-400/20 hover:bg-[#F5C518] hover:text-[#002388]" 
                                  : "text-[#64748B] hover:text-[#002388] hover:bg-[#F8FAFC]"
                              }`}>
                                {subItem.title}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
