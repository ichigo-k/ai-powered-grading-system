"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Step2State, ClassAssignmentState, SectionEnum, LecturerCourse } from "@/lib/assessment-types"

interface Step2ClassesProps {
  state: Step2State
  onChange: (updates: Partial<Step2State>) => void
  selectedCourse: LecturerCourse | null
  errors: {
    classes?: string
    location?: string
  }
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
          { classId, className: `${className} (Level ${level})`, sections: ["SECTION_A", "SECTION_B"] },
        ],
      })
    }
  }

  return (
    <div className="space-y-12">
      {/* Classes */}
      <div className="space-y-8">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-50">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-50 text-[#002388]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">Assign Classes</h2>
        </div>

        {classes.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/30 px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-400 italic">
              {selectedCourse
                ? `No classes are assigned to ${selectedCourse.code}.`
                : "Select a course in Step 1 first."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-11 rounded-md border-slate-200 bg-white focus:ring-[#002388] font-medium"
              />
            </div>

            {/* Table */}
            <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">Assign</th>
                    <th className="px-4 py-3">Class Name</th>
                    <th className="px-4 py-3">Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classes.filter(cls => 
                    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    cls.level.toString().includes(searchTerm)
                  ).length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-400 font-medium">
                        No classes found matching "{searchTerm}"
                      </td>
                    </tr>
                  ) : (
                    classes.filter(cls => 
                      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      cls.level.toString().includes(searchTerm)
                    ).map((cls) => {
                      const assignment = state.selectedClasses.find((c) => c.classId === cls.id)
                      const isSelected = !!assignment
                      
                      return (
                        <tr key={cls.id} className={`transition-colors hover:bg-slate-50/50 ${isSelected ? "bg-[#002388]/5" : ""}`}>
                          <td className="px-4 py-3 text-center align-middle">
                            <button
                              type="button"
                              onClick={() => toggleClass(cls.id, cls.name, cls.level)}
                              className={`flex h-5 w-5 mx-auto items-center justify-center rounded border transition-all duration-200 ${
                                isSelected
                                  ? "bg-[#002388] border-[#002388] text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {isSelected && (
                                <svg className="h-3 w-3" viewBox="0 0 10 10" fill="none">
                                  <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900 align-middle">
                            {cls.name}
                          </td>
                          <td className="px-4 py-3 text-slate-500 font-medium align-middle">
                            Level {cls.level}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {errors.classes && <p className="text-[10px] font-semibold text-rose-500 ml-1 italic">{errors.classes}</p>}
      </div>

      {/* Location Constraint */}
      <div className="space-y-8 pt-4 border-t border-slate-50">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-50">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-50 text-[#002388]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">Location Restriction</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            type="button"
            onClick={() => onChange({ isLocationBound: false, location: "" })}
            className={`flex items-start gap-5 p-6 rounded-lg border text-left transition-all duration-300 ${!state.isLocationBound ? "border-[#002388]/20 bg-[#002388]/5 shadow-sm" : "border-slate-100 bg-slate-50/30 hover:border-slate-200"}`}
          >
            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 mt-0.5 ${!state.isLocationBound ? "border-[#002388] border-[6px]" : "border-slate-300 bg-white"}`} />
            <div>
              <p className="text-sm font-semibold text-slate-900">Anywhere</p>
              <p className="text-xs font-medium text-slate-500 mt-1.5 leading-relaxed">Students can take this assessment from any remote location without restrictions.</p>
            </div>
          </button>

          <button 
            type="button"
            onClick={() => onChange({ isLocationBound: true })}
            className={`flex items-start gap-5 p-6 rounded-lg border text-left transition-all duration-300 ${state.isLocationBound ? "border-[#002388]/20 bg-[#002388]/5 shadow-sm" : "border-slate-100 bg-slate-50/30 hover:border-slate-200"}`}
          >
            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 mt-0.5 ${state.isLocationBound ? "border-[#002388] border-[6px]" : "border-slate-300 bg-white"}`} />
            <div>
              <p className="text-sm font-semibold text-slate-900">Location-Bound</p>
              <p className="text-xs font-medium text-slate-500 mt-1.5 leading-relaxed">Restrict access to a specific campus hall, laboratory, or designated exam room.</p>
            </div>
          </button>
        </div>

        {state.isLocationBound && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <Label htmlFor="location" className="text-[10px] font-bold text-[#002388] uppercase tracking-widest ml-1">
              Required Location <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="location"
              value={state.location}
              onChange={(e) => onChange({ location: e.target.value })}
              placeholder="e.g. Lecture Hall A, Room 204"
              className="h-11 rounded-md border-[#002388]/10 bg-white focus:ring-[#002388] font-medium"
            />
            {errors.location && <p className="text-[10px] font-semibold text-rose-500 ml-1 italic">{errors.location}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
