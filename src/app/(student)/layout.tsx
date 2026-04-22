import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import StudentNavbar from "@/components/layout/StudentNavbar"
import StudentFooter from "@/components/layout/StudentFooter"

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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F9FBFD" }}>
      <StudentNavbar
        userName={session.user.name}
        userId={session.user.userId}
      />
      <main className="flex-1 px-4 md:px-8 py-6 animate-in fade-in duration-500">
        {children}
      </main>
      <StudentFooter />
    </div>
  )
}
