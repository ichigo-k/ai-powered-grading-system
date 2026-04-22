"use client"

import { useState } from "react"
import { CalendarDays, CheckCircle2, Clock } from "lucide-react"

const upcomingTests = [
  { id: 1, title: "Data Structures Midterm", course: "CS301", date: "Apr 25, 2026", time: "09:00 AM" },
  { id: 2, title: "Calculus I Quiz 3", course: "MATH201", date: "Apr 28, 2026", time: "02:00 PM" },
]

const completedTests = [
  { id: 3, title: "Introduction to Computing Quiz 2", course: "CS101", date: "Apr 15, 2026", score: "88/100" },
  { id: 4, title: "Technical Writing Assignment 1", course: "ENG101", date: "Apr 10, 2026", score: "95/100" },
]

const TABS = [
  { key: "upcoming",  label: "Upcoming",  Icon: CalendarDays },
  { key: "completed", label: "Completed", Icon: CheckCircle2 },
] as const

type Tab = typeof TABS[number]["key"]

export default function ExamsTabs() {
  const [tab, setTab] = useState<Tab>("upcoming")

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="border-b border-gray-200 flex items-center gap-1">
        {TABS.map(({ key, label, Icon }) => {
          const active = tab === key
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold relative transition-colors"
              style={{ color: active ? "#1967D2" : "#64748B" }}
            >
              <Icon size={14} />
              {label}
              {active && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                  style={{ background: "#1967D2" }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Upcoming */}
      {tab === "upcoming" && (
        <div className="space-y-4">
          {upcomingTests.map((test) => (
            <div
              key={test.id}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{test.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{test.course}</p>
                </div>
                <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-md">Upcoming</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1.5"><CalendarDays size={14} className="text-gray-400" />{test.date}</span>
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400" />{test.time}</span>
              </div>
            </div>
          ))}
          {upcomingTests.length === 0 && (
            <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
              No upcoming tests scheduled.
            </div>
          )}
        </div>
      )}

      {/* Completed */}
      {tab === "completed" && (
        <div className="space-y-4">
          {completedTests.map((test) => (
            <div
              key={test.id}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">{test.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{test.course}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">{test.score}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Score</div>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="flex items-center gap-1.5"><CalendarDays size={14} className="text-gray-400" />{test.date}</span>
              </div>
            </div>
          ))}
          {completedTests.length === 0 && (
            <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
              No completed tests yet.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
