import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import StudentSidebar from "@/components/layout/StudentSidebar"

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session || session.user.role !== "STUDENT") {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#F4F6FB" }}>
      <StudentSidebar
        userName={session.user.name}
        userId={session.user.userId}
      />
      <main className="flex-1 ml-64 p-8 min-h-screen">
        {children}
      </main>
    </div>
  )
}
