"use client"

import { useState } from "react"

const students = [
  { id: "1", name: "Kofi Owusu", class: "Level 100 A", time: "10:24 AM", status: "Graded", score: 85, confidence: 98 },
  { id: "2", name: "Ama Serwaa", class: "Level 100 A", time: "10:30 AM", status: "Graded", score: 92, confidence: 95 },
  { id: "3", name: "John Doe", class: "Level 100 B", time: "10:45 AM", status: "AI Grading", score: null, confidence: null },
  { id: "4", name: "Sarah Smith", class: "Level 100 B", time: "11:02 AM", status: "Review Required", score: 45, confidence: 42 },
  { id: "5", name: "Kwesi Appiah", class: "Level 100 A", time: "11:15 AM", status: "Graded", score: 78, confidence: 99 },
]

export default function AssessmentDetailsPage() {
  const [filter, setFilter] = useState("all")

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Back & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
        <span>Assessments</span>
        <span>/</span>
        <span className="text-slate-900">Midterm Theory Exam</span>
      </div>

      {/* Hero Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase border border-indigo-100">
              In Progress
            </span>
            <span className="text-sm font-medium text-slate-400">CS101 • Created 2 days ago</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Midterm Theory Exam</h1>
          <p className="text-slate-500 mt-1">
            Tracking submissions for <span className="font-bold text-slate-700">Level 100 A</span> and <span className="font-bold text-slate-700">Level 100 B</span>
          </p>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900">84/90</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submissions</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">72%</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Progress</p>
          </div>
          <div className="h-12 w-px bg-slate-100" />
          <button 
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            Publish Results
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                type="text" 
                placeholder="Search students..."
                className="pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-64"
              />
            </div>
            <select className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm font-medium text-slate-600 focus:outline-none">
              <option>All Classes</option>
              <option>Level 100 A</option>
              <option>Level 100 B</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submission</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Status</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">AI Grade</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{s.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{s.class}</p>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span className="text-xs text-slate-600 font-medium">{s.time}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      s.status === "Graded" ? "bg-green-50 text-green-600" :
                      s.status === "Review Required" ? "bg-orange-50 text-orange-600" :
                      "bg-blue-50 text-blue-600 animate-pulse"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        s.status === "Graded" ? "bg-green-500" :
                        s.status === "Review Required" ? "bg-orange-500" : "bg-blue-500"
                      }`} />
                      {s.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-center">
                    {s.score ? (
                      <div>
                        <p className="text-sm font-bold text-slate-900">{s.score}%</p>
                        <p className={`text-[9px] font-bold ${s.confidence && s.confidence < 60 ? "text-red-500" : "text-slate-400"}`}>
                          {s.confidence}% Confidence
                        </p>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div className="w-8 h-4 bg-slate-100 rounded animate-pulse" />
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button className="text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {s.status === "Review Required" ? "Manual Review" : "View Details"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination/Summary */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">Showing 5 of 84 submissions</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">Prev</button>
            <button className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
