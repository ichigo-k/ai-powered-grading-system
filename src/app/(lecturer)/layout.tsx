import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import LecturerNavbar from "@/components/layout/LecturerNavbar"

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
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#FFFFFF" }}>
      <LecturerNavbar
        userName={session.user.name}
      />
      <main className="flex-1 p-8 min-h-screen">
        {children}
      </main>
    </div>
  )
}
