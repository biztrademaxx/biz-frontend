"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"

interface Event {
  id: string
  title: string
  date: string // ISO format
  category: "personal" | "work" | "travel"
}

interface ScheduleProps {
  userId: string
}

export default function Schedule({ userId }: ScheduleProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    apiFetch<{ events?: any[]; data?: any[] }>(`/api/users/${userId}/interested-events`, { auth: true })
      .then((data) => {
        const list = data.events ?? data.data ?? []
        const mappedEvents = list.map((e: any) => ({
          id: e.id,
          title: e.title,
          date: e.startDate,
          category: "work" as const,
        }))
        setEvents(mappedEvents)
      })
      .catch(console.error)
  }, [userId])


  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const daysInMonth = Array.from({ length: endOfMonth.getDate() }, (_, i) => i + 1)

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const getDayEvents = (day: number) => {
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split("T")[0]
    return events.filter((e) => e.date.startsWith(dateStr))
  }

 const categoryColors: Record<Event["category"], string> = {
    personal: "bg-blue-200 text-blue-800",
    work: "bg-green-200 text-green-800", // ✅ updated
    travel: "bg-yellow-200 text-yellow-800",
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" onClick={prevMonth}>←</Button>
        <h2 className="text-lg font-bold">
          {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
        </h2>
        <Button variant="outline" onClick={nextMonth}>→</Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="font-semibold">{d}</div>
        ))}

        {Array(startOfMonth.getDay()).fill(null).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {daysInMonth.map((day) => {
          const dayEvents = getDayEvents(day)
          return (
            <div key={day} className="border rounded-lg p-2 h-28 flex flex-col items-start overflow-hidden">
              <span className="text-xs font-bold">{day}</span>
              <div className="flex flex-col gap-1 w-full mt-1">
                {dayEvents.map((e) => (
                  <span
                    key={e.id}
                    className={`text-xs rounded px-1 truncate ${categoryColors[e.category]}`}
                  >
                    {e.title}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
