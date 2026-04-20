"use client"

import { useState, useMemo } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const allCourses = [
  { code: "CS101", title: "Introduction to Computing", lecturer: "Dr. Mensah", credit: 3, color: "#2563EB", pattern: "circles" },
  { code: "MATH201", title: "Calculus I", lecturer: "Prof. Agyei", credit: 3, color: "#7C3AED", pattern: "diamonds" },
  { code: "CS301", title: "Data Structures", lecturer: "Dr. Boateng", credit: 3, color: "#0891B2", pattern: "hexagons" },
  { code: "ENG101", title: "Technical Writing", lecturer: "Mrs. Owusu", credit: 2, color: "#059669", pattern: "circles" },
  { code: "CS401", title: "Operating Systems", lecturer: "Dr. Asante", credit: 3, color: "#DC2626", pattern: "triangles" },
  { code: "MATH301", title: "Linear Algebra", lecturer: "Prof. Darko", credit: 3, color: "#D97706", pattern: "diamonds" },
  { code: "CS201", title: "Object Oriented Programming", lecturer: "Dr. Mensah", credit: 3, color: "#7C3AED", pattern: "hexagons" },
  { code: "NET101", title: "Computer Networks", lecturer: "Mr. Frimpong", credit: 3, color: "#0891B2", pattern: "circles" },
]

const SORT_OPTIONS = [
  { label: "Course Code", value: "code" },
  { label: "Course Title", value: "title" },
  { label: "Lecturer", value: "lecturer" },
]

function getBannerUrl(color: string, pattern: string) {
  let svg = ""
  if (pattern === "diamonds") {
    svg = `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><rect width='40' height='40' fill='${color}'/><rect x='10' y='10' width='20' height='20' fill='${color}cc' transform='rotate(45 20 20)'/></svg>`
  } else if (pattern === "hexagons") {
    svg = `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='46'><rect width='40' height='46' fill='${color}'/><polygon points='20,2 38,12 38,34 20,44 2,34 2,12' fill='${color}bb'/></svg>`
  } else if (pattern === "triangles") {
    svg = `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><rect width='40' height='40' fill='${color}'/><polygon points='20,4 36,36 4,36' fill='${color}aa'/></svg>`
  } else {
    svg = `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><rect width='40' height='40' fill='${color}'/><circle cx='20' cy='20' r='14' fill='${color}99'/><circle cx='20' cy='20' r='7' fill='${color}66'/></svg>`
  }
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function IconGrid({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#2563EB" : "#94A3B8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  )
}

function IconList({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#2563EB" : "#94A3B8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  )
}

export default function CoursesPage() {
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("code")
  const [view, setView] = useState<"grid" | "list">("grid")

  const filtered = useMemo(() => {
    return allCourses
      .filter((c) =>
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.lecturer.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => a[sort as keyof typeof a].toString().localeCompare(b[sort as keyof typeof b].toString()))
  }, [search, sort])

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#0A1628" }}>My Courses</h1>
        <p className="text-sm mt-0.5" style={{ color: "#64748B" }}>
          {filtered.length} course{filtered.length !== 1 ? "s" : ""} enrolled
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border p-4" style={{ borderColor: "#E2E8F0" }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#94A3B8" }}>Course Overview</p>
        <div className="flex flex-wrap items-center gap-3">

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search courses, lecturers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border outline-none transition-all"
              style={{ borderColor: "#E2E8F0", color: "#0A1628" }}
            />
          </div>

          {/* Sort */}
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-48 rounded-xl border font-semibold text-sm" style={{ borderColor: "#E2E8F0", color: "#0A1628", background: "#F8FAFC" }}>
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-sm font-medium">
                  Sort by {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View toggle */}
          <div className="flex items-center rounded-xl border overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
            <button
              onClick={() => setView("grid")}
              className="flex items-center justify-center w-9 h-9 transition-colors"
              style={{ background: view === "grid" ? "#EFF6FF" : "#fff" }}
              title="Grid view"
            >
              <IconGrid active={view === "grid"} />
            </button>
            <div style={{ width: 1, height: 20, background: "#E2E8F0" }} />
            <button
              onClick={() => setView("list")}
              className="flex items-center justify-center w-9 h-9 transition-colors"
              style={{ background: view === "list" ? "#EFF6FF" : "#fff" }}
              title="List view"
            >
              <IconList active={view === "list"} />
            </button>
          </div>

          {/* Clear */}
          {search && (
            <button
              onClick={() => setSearch("")}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors hover:bg-red-50"
              style={{ color: "#DC2626", border: "1px solid #FEE2E2" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border" style={{ borderColor: "#E2E8F0" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <p className="mt-3 text-sm font-semibold" style={{ color: "#64748B" }}>No courses found</p>
          <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>Try a different search term</p>
        </div>
      ) : view === "grid" ? (

        /* ── Grid view ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((course) => {
            const bannerUrl = getBannerUrl(course.color, course.pattern)
            const lecturerInitials = course.lecturer.split(" ").map((w) => w[0]).slice(0, 2).join("")
            return (
              <div
                key={course.code}
                className="bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer group"
                style={{ borderColor: "#E2E8F0" }}
              >
                <div className="h-28 relative" style={{ background: course.color }}>
                  <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url("${bannerUrl}")`, backgroundSize: "40px", backgroundRepeat: "repeat" }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                      {course.credit} cr
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: "rgba(0,0,0,0.3)", color: "#fff" }}>
                      {course.code}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-bold text-sm leading-snug line-clamp-2" style={{ color: "#0A1628" }}>{course.title}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: "#F1F5F9" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: course.color }}>
                        {lecturerInitials}
                      </div>
                      <p className="text-xs font-medium" style={{ color: "#64748B" }}>{course.lecturer}</p>
                    </div>
                    <svg className="opacity-0 group-hover:opacity-100 transition-opacity" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      ) : (

        /* ── List view ── */
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
          {filtered.map((course, i) => {
            const bannerUrl = getBannerUrl(course.color, course.pattern)
            return (
              <div
                key={course.code}
                className="flex items-center gap-5 px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer group"
                style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F1F5F9" : "none" }}
              >
                {/* Wide banner thumbnail */}
                <div className="w-24 h-16 sm:w-36 sm:h-20 rounded-xl flex-shrink-0 relative overflow-hidden" style={{ background: course.color }}>
                  <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url("${bannerUrl}")`, backgroundSize: "30px", backgroundRepeat: "repeat" }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: "#2563EB" }}>
                    {course.code} · {course.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{course.lecturer}</p>
                </div>

                {/* Dots menu */}
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 flex-shrink-0 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg width="4" height="16" viewBox="0 0 4 16" fill="#94A3B8">
                    <circle cx="2" cy="2" r="1.5"/><circle cx="2" cy="8" r="1.5"/><circle cx="2" cy="14" r="1.5"/>
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
