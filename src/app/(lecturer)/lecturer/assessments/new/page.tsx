import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import AssessmentForm from "../AssessmentForm"
import type { LecturerCourse } from "@/lib/assessment-types"

export default async function NewAssessmentPage() {
  const session = await auth()
  if (!session || session.user.role !== "LECTURER") redirect("/")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  })
  if (!user) redirect("/")

  const profile = await prisma.lecturerProfile.findUnique({
    where: { id: user.id },
    include: {
      courses: {
        select: {
          id: true,
          code: true,
          title: true,
          classes: { select: { id: true, name: true, level: true } },
        },
      },
    },
  })

  const lecturerCourses: LecturerCourse[] = (profile?.courses ?? []).map((c) => ({
    id: c.id,
    code: c.code,
    title: c.title,
    classes: c.classes,
  }))

  return <AssessmentForm lecturerCourses={lecturerCourses} />
}
