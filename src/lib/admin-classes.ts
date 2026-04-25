import { prisma } from "@/lib/prisma"

export type ClassWithDetails = {
  id: number
  name: string
  level: number
  isGraduated: boolean
  createdAt: Date
  _count: {
    students: number
    courses: number
  }
}

export type CourseDetails = {
  id: number
  code: string
  title: string
  credits: number
}

export async function getClasses(): Promise<ClassWithDetails[]> {
  return prisma.class.findMany({
    where: {
      isGraduated: false
    },
    include: {
      _count: {
        select: { students: true, courses: true }
      }
    },
    orderBy: [
      { level: "asc" },
      { name: "asc" }
    ]
  })
}

export async function getCourses(): Promise<CourseDetails[]> {
  return prisma.course.findMany({
    orderBy: { code: "asc" }
  })
}
