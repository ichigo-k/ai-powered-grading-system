import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import LecturerNavbar from "@/components/layout/LecturerNavbar"
import StudentFooter from "@/components/layout/StudentFooter"

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
    <div className="flex flex-col min-h-screen bg-white">
      <LecturerNavbar userName={session.user.name} />
      <main className="flex-1 px-4 md:px-6 py-8">
        {children}
      </main>
      <StudentFooter />
    </div>
  )
}
