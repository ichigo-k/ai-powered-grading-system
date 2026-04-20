import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import AdminSidebar from "@/components/layout/AdminSidebar"

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
    <div className="flex min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      <AdminSidebar
        userName={session.user.name}
        userId={session.user.userId}
      />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
