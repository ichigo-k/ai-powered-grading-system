import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import LecturerSidebar from "@/components/layout/LecturerSidebar"

export default async function LecturerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session || session.user.role !== "LECTURER") {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      <LecturerSidebar
        userName={session.user.name}
        userId={session.user.userId}
      />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
