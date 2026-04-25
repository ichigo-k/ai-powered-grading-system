"use client"

const gradeData = [
  { student: "Kofi Owusu", class: "Level 100 A", course: "CS101", test: "Midterm Exam", mark: 85, status: "Finalised" },
  { student: "Ama Serwaa", class: "Level 100 A", course: "CS101", test: "Midterm Exam", mark: 92, status: "Finalised" },
  { student: "John Doe", class: "Level 100 B", course: "CS101", test: "Midterm Exam", mark: 64, status: "Pending Review" },
  { student: "Sarah Smith", class: "Level 100 B", course: "CS101", test: "Midterm Exam", mark: 45, status: "Finalised" },
  { student: "Kwesi Appiah", class: "Level 100 A", course: "CS101", test: "Midterm Exam", mark: 78, status: "Finalised" },
]

export default function GradeBookPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Academic Gradebook</h1>
          <p className="text-slate-500 mt-1">Export and manage finalized student performance records.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export to CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input 
            type="text" 
            placeholder="Search student or course..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:border-indigo-500 transition-all text-sm outline-none"
          />
        </div>
        <select className="px-4 py-2 bg-slate-50 rounded-xl border-transparent text-sm font-bold text-slate-600 outline-none">
          <option>All Courses</option>
          <option>CS101: Intro to Computing</option>
          <option>CSC 402: Adv Neural Arch.</option>
        </select>
        <select className="px-4 py-2 bg-slate-50 rounded-xl border-transparent text-sm font-bold text-slate-600 outline-none">
          <option>All Batches</option>
          <option>Level 100 A</option>
          <option>Level 100 B</option>
        </select>
        <button className="px-4 py-2 text-indigo-600 font-bold text-sm">Clear Filters</button>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student Name</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Course & Batch</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assessment</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Grade</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {gradeData.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-4 text-sm font-bold text-slate-900">{row.student}</td>
                <td className="px-8 py-4">
                  <p className="text-xs font-bold text-slate-700">{row.course}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{row.class}</p>
                </td>
                <td className="px-8 py-4 text-xs font-medium text-slate-600">{row.test}</td>
                <td className="px-8 py-4 text-center">
                  <span className={`text-sm font-bold ${row.mark < 50 ? "text-red-500" : "text-slate-900"}`}>
                    {row.mark}%
                  </span>
                </td>
                <td className="px-8 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    row.status === "Finalised" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                  }`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Empty State Mockup */}
        {gradeData.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <h3 className="text-slate-900 font-bold">No Grades Found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your filters or search term.</p>
          </div>
        )}
      </div>
    </div>
  )
}
