import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import AdminSidebar from "@/components/layout/AdminSidebar"
import AdminNavbar from "@/components/layout/AdminNavbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <SidebarProvider>
      <AdminSidebar
        userName={session.user.name}
        userId={session.user.userId}
      />
      <SidebarInset className="bg-white">
        <AdminNavbar
          userName={session.user.name}
          userId={session.user.userId}
        />
        <div className="flex-1 p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
