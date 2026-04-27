"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Step2State, LecturerCourse } from "@/lib/assessment-types"

interface Step2ClassesProps {
  state: Step2State
  onChange: (updates: Partial<Step2State>) => void
  selectedCourse: LecturerCourse | null
  errors: {
    classes?: string
    location?: string
  }
}

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.12em] mb-4">
      {label}
    </p>
  )
}

export default function Step2Classes({ state, onChange, selectedCourse, errors }: Step2ClassesProps) {
  const classes = selectedCourse?.classes ?? []
  const [searchTerm, setSearchTerm] = useState("")

  const toggleClass = (classId: number, className: string, level: number) => {
    const existing = state.selectedClasses.find((c) => c.classId === classId)
    if (existing) {
      onChange({ selectedClasses: state.selectedClasses.filter((c) => c.classId !== classId) })
    } else {
      onChange({
        selectedClasses: [
          ...state.selectedClasses,
          { classId, className: `${className} (Level ${level})` },
        ],
      })
    }
  }

  const filtered = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.level.toString().includes(searchTerm)
  )

  return (
    <div className="space-y-6">
      {/* Assign Classes */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <SectionHeader label="Assign Classes" />

        {classes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <p className="text-sm text-slate-400">
              {selectedCourse
                ? `No classes are assigned to ${selectedCourse.code}.`
                : "Select a course in Step 1 first."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9 border-slate-200 bg-white text-sm focus-visible:ring-[#002388]/30"
              />
            </div>

            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5 w-12 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Class Name
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Level
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-400">
                        No classes found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((cls) => {
                      const isSelected = !!state.selectedClasses.find((c) => c.classId === cls.id)
                      return (
                        <tr
                          key={cls.id}
                          className={`transition-colors cursor-pointer hover:bg-slate-50 ${isSelected ? "bg-[#002388]/5" : ""}`}
                          onClick={() => toggleClass(cls.id, cls.name, cls.level)}
                        >
                          <td className="px-4 py-3 text-center">
                            <div
                              className={`flex h-4 w-4 mx-auto items-center justify-center rounded border transition-all ${
                                isSelected
                                  ? "bg-[#002388] border-[#002388] text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {isSelected && (
                                <svg className="h-2.5 w-2.5" viewBox="0 0 10 10" fill="none">
                                  <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-900">{cls.name}</td>
                          <td className="px-4 py-3 text-slate-500">Level {cls.level}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {state.selectedClasses.length > 0 && (
              <p className="text-xs text-slate-500">
                {state.selectedClasses.length} class{state.selectedClasses.length !== 1 ? "es" : ""} selected
              </p>
            )}
          </div>
        )}

        {errors.classes && <p className="text-xs text-rose-500 mt-2">{errors.classes}</p>}
      </div>

      {/* Location Restriction */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <SectionHeader label="Location Restriction" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChange({ isLocationBound: false, location: "" })}
            className={`flex items-start gap-3 p-4 rounded-lg border text-left transition-all ${
              !state.isLocationBound
                ? "border-[#002388] bg-[#002388]/5"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
              !state.isLocationBound ? "border-[#002388]" : "border-slate-300"
            }`}>
              {!state.isLocationBound && <div className="h-2 w-2 rounded-full bg-[#002388]" />}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Anywhere</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Students can take this from any location.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChange({ isLocationBound: true })}
            className={`flex items-start gap-3 p-4 rounded-lg border text-left transition-all ${
              state.isLocationBound
                ? "border-[#002388] bg-[#002388]/5"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
              state.isLocationBound ? "border-[#002388]" : "border-slate-300"
            }`}>
              {state.isLocationBound && <div className="h-2 w-2 rounded-full bg-[#002388]" />}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Location-Bound</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Restrict to a specific campus hall or exam room.
              </p>
            </div>
          </button>
        </div>

        {state.isLocationBound && (
          <div className="mt-4 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <Label htmlFor="location" className="text-xs text-slate-600">
              Required Location <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="location"
              value={state.location}
              onChange={(e) => onChange({ location: e.target.value })}
              placeholder="e.g. Lecture Hall A, Room 204"
              className="h-10 border-slate-200 bg-white focus-visible:ring-[#002388]/30"
            />
            {errors.location && <p className="text-xs text-rose-500 mt-1">{errors.location}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
