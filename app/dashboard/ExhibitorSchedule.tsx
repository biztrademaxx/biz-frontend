"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MyAppointments } from "./my-appointments" // import your component
import { apiFetch } from "@/lib/api"

interface AppointmentEvent {
  id: string
  title: string
  date: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
}

interface ExhibitorScheduleProps {
  userId: string
}

export function ExhibitorSchedule({ userId }: ExhibitorScheduleProps) {
  const [events, setEvents] = useState<AppointmentEvent[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null) // selected appointment

  useEffect(() => {
    apiFetch<{ appointments?: any[] }>(`/api/appointments?requesterId=${userId}`, { auth: true })
      .then((data) => {
        const formatted = (data.appointments || []).map((e: any) => ({
          id: e.id,
          title: e.eventTitle || e.eventName || `Meeting with ${e.exhibitorName}`,
          date: e.scheduledAt || e.createdAt,
          status: (e.status || "").toLowerCase(),
        }))
        setEvents(formatted)
      })
      .catch(console.error)
  }, [userId])

  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const daysInMonth = Array.from({ length: endOfMonth.getDate() }, (_, i) => i + 1)

  const prevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  const nextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))

  const getDayEvents = (day: number) => {
    const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return events.filter((e) => {
      if (!e.date) return false
      const eventDate = new Date(e.date)
      return (
        eventDate.getFullYear() === dayDate.getFullYear() &&
        eventDate.getMonth() === dayDate.getMonth() &&
        eventDate.getDate() === dayDate.getDate()
      )
    })
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-200 text-yellow-800",
    confirmed: "bg-green-200 text-green-800",
    cancelled: "bg-red-200 text-red-800",
    completed: "bg-gray-200 text-gray-800",
  }

  // click handler sets the selected appointment
  const handleClick = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId)
  }

  return (
    <div className="p-4">
      {!selectedAppointmentId ? (
        <>
          {/* Month Header */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" onClick={prevMonth}>←</Button>
            <h2 className="text-lg font-bold">
              {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
            </h2>
            <Button variant="outline" onClick={nextMonth}>→</Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
              <div key={d} className="font-semibold">{d}</div>
            ))}

            {Array(startOfMonth.getDay()).fill(null).map((_, i) => <div key={`empty-${i}`} />)}

            {daysInMonth.map((day) => {
              const dayEvents = getDayEvents(day)
              return (
                <div key={day} className="border rounded-lg p-2 h-32 flex flex-col items-start overflow-hidden hover:bg-gray-50 transition">
                  <span className="text-xs font-bold">{day}</span>
                  <div className="flex flex-col gap-1 mt-1 w-full overflow-y-auto">
                    {dayEvents.length > 0 ? (
                      dayEvents.map((e) => (
                        <Badge
                          key={e.id}
                          className={`text-xs truncate cursor-pointer ${statusColors[e.status] || "bg-gray-200 text-gray-800"} w-full`}
                          onClick={() => handleClick(e.id)}
                        >
                          {e.title} ({e.status})
                        </Badge>
                      ))
                    ) : (
                      <span className="text-[10px] text-gray-400 mt-1">No events</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <>
          {/* Render the MyAppointments component for the selected appointment */}
          <Button variant="outline" className="mb-4" onClick={() => setSelectedAppointmentId(null)}>
            ← Back to Calendar
          </Button>
          <MyAppointments userId={userId}  />
        </>
      )}
    </div>
  )
}
