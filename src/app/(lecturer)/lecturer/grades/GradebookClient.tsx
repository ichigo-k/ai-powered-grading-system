"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Search, Users, ArrowRight, Loader2, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import LoadingLogo from "@/components/ui/LoadingLogo"
import { TableSkeleton } from "@/components/ui/table-skeleton"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Student {
  id: number
  name: string
  email: string
  classId: number
  className: string
  classLevel: number
  assessmentCount: number
  courseIds: number[]
}

interface Course {
  id: number
  code: string
  title: string
}

interface ClassOption {
  id: number
  name: string
  level: number
}

interface GradebookData {
  students: Student[]
  courses: Course[]
  classes: ClassOption[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GradebookClient() {
  const router = useRouter()
  const [data, setData] = useState<GradebookData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [courseFilter, setCourseFilter] = useState<string>("all")
  const [classFilter, setClassFilter] = useState<string>("all")

  useEffect(() => {
    fetch("/api/lecturer/gradebook")
      .then((r) => r.json())
      .then((d: GradebookData) => setData(d))
      .catch(() => toast.error("Failed to load gradebook"))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!data) return []
    return data.students.filter((s) => {
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
      const matchCourse =
        courseFilter === "all" ||
        s.courseIds.includes(parseInt(courseFilter))
      const matchClass =
        classFilter === "all" || s.classId === parseInt(classFilter)
      return matchSearch && matchCourse && matchClass
    })
  }, [data, search, courseFilter, classFilter])

  const hasFilters = search || courseFilter !== "all" || classFilter !== "all"

  const clearFilters = () => {
    setSearch("")
    setCourseFilter("all")
    setClassFilter("all")
  }

  if (loading) {
    return (
      <div className="relative">
        <TableSkeleton />
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
          <div className="scale-75 opacity-80">
            <LoadingLogo />
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-9 rounded-xl border-slate-200 focus-visible:ring-[#002388]"
          />
        </div>

        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-full sm:w-52 rounded-xl border-slate-200">
            <SelectValue placeholder="All courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {data.courses.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.code} — {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl border-slate-200">
            <SelectValue placeholder="All classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All classes</SelectItem>
            {data.classes.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name} (Lvl {c.level})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="rounded-xl text-slate-500 gap-1.5 shrink-0"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Count */}
      <p className="text-sm text-slate-500">
        {filtered.length} {filtered.length === 1 ? "student" : "students"}
        {hasFilters && ` matching filters`}
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Users className="h-7 w-7 text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-600">
            {hasFilters ? "No students match your filters" : "No students enrolled yet"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {hasFilters
              ? "Try adjusting your search or filters."
              : "Students will appear here once they are enrolled in your assessment classes."}
          </p>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4 rounded-xl">
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="pl-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Student
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Class
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                  Level
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                  Assessments
                </TableHead>
                <TableHead className="w-10 pr-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((student) => (
                <TableRow
                  key={student.id}
                  className="group cursor-pointer hover:bg-slate-50/80"
                  onClick={() => router.push(`/lecturer/grades/${student.id}`)}
                >
                  <TableCell className="pl-5">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{student.name}</p>
                      <p className="text-xs text-slate-400">{student.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{student.className}</TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                      {student.classLevel}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full text-xs font-semibold bg-[#002388]/8 text-[#002388]">
                      {student.assessmentCount}
                    </span>
                  </TableCell>
                  <TableCell className="pr-4">
                    <ArrowRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
