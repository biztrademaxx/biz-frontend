"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"
import { eventPublicPath } from "@/lib/event-path"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Calendar, MapPin, Clock } from "lucide-react"

interface Event {
  id: string
  slug?: string | null
  title: string
  startDate: string // ISO format
  endDate: string // ISO format
  city?: string
  description?: string
}

interface ScheduleProps {
  userId: string
}

export default function Schedule({ userId }: ScheduleProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<number | null>(null)

  useEffect(() => {
    apiFetch<{ events?: any[]; data?: any[] }>(`/api/users/${userId}/interested-events`, { auth: true })
      .then((data) => {
        const list = data.events ?? data.data ?? []
        const mappedEvents = list.map((e: any) => ({
          id: e.id,
          slug: e.slug ?? null,
          title: e.title,
          startDate: e.startDate,
          endDate: e.endDate,
          city: e.city,
          description: e.description,
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
    setSelectedDate(null)
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    setSelectedDate(null)
  }

  // Check if an event occurs on a specific day (from startDate to endDate)
  const isEventOnDay = (event: Event, day: number) => {
    const eventStart = new Date(event.startDate)
    const eventEnd = new Date(event.endDate)
    const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)

    // Reset time to compare dates only
    eventStart.setHours(0, 0, 0, 0)
    eventEnd.setHours(0, 0, 0, 0)
    currentDate.setHours(0, 0, 0, 0)

    return currentDate >= eventStart && currentDate <= eventEnd
  }

  // Get events that occur on a specific day
  const getDayEvents = (day: number) => {
    return events.filter((event) => isEventOnDay(event, day))
  }

  // Check if a day has any events
  const hasEventsOnDay = (day: number) => {
    return getDayEvents(day).length > 0
  }

  // Check if today is the current date
  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    )
  }

  const handleDateClick = (day: number) => {
    setSelectedDate(selectedDate === day ? null : day)
  }

  return (
    <div className="p-4 bg-[#F5F4F0] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={prevMonth} className="hover:bg-gray-100">
          ←
        </Button>
        <h2 className="text-xl font-bold text-gray-800">
          {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
        </h2>
        <Button variant="outline" onClick={nextMonth} className="hover:bg-gray-100">
          →
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="relative">
        <div className="grid grid-cols-7 gap-2 text-center mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="font-semibold text-sm text-gray-600 py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array(startOfMonth.getDay()).fill(null).map((_, i) => (
            <div key={`empty-${i}`} className="h-24" />
          ))}

          {/* Calendar days */}
          {daysInMonth.map((day) => {
            const dayEvents = getDayEvents(day)
            const hasEvents = dayEvents.length > 0
            const today = isToday(day)
            const isSelected = selectedDate === day

            return (
              <div key={day} className="relative">
                {/* Date cell */}
                <div
                  className={cn(
                    "h-24 border rounded-lg p-2 cursor-pointer transition-all duration-200",
                    hasEvents && !isSelected
                      ? "bg-green-50 border-green-300 hover:bg-green-100 hover:shadow-md"
                      : isSelected
                        ? "bg-blue-100 border-blue-400 shadow-md"
                        : today
                          ? "bg-red-50 border-red-300 hover:bg-red-100"
                          : "bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md"
                  )}
                  onClick={() => handleDateClick(day)}
                >
                  <span
                    className={cn(
                      "text-sm font-bold",
                      today ? "text-red-600" : "text-gray-700"
                    )}
                  >
                    {day}
                  </span>

                  {/* Event indicator dots */}
                  {hasEvents && !isSelected && (
                    <div className="flex gap-1 mt-1">
                      {dayEvents.slice(0, 3).map((_, idx) => (
                        <div key={idx} className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Popup card showing events for the selected date */}
                {isSelected && dayEvents.length > 0 && (
                  <div className="absolute top-full left-0 z-20 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                    <div className="bg-blue-600 text-white px-4 py-2">
                      <h3 className="font-semibold text-sm">
                        Events on {currentMonth.toLocaleString("default", { month: "long" })} {day}, {currentMonth.getFullYear()}
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {dayEvents.map((event) => (
                        <Link
                          key={event.id}
                          href={eventPublicPath(event)}
                          className="block hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <div className="p-3 border-b border-gray-100">
                            <h4 className="font-medium text-gray-800 text-sm mb-1">
                              {event.title}
                            </h4>
                            {event.city && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                <MapPin className="w-3 h-3" />
                                <span>{event.city}</span>
                              </div>
                            )}
                            {event.description && (
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {event.description}
                              </p>
                            )}
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center text-xs text-gray-500">
        💡 Click on any date to see events • Click on an event card to view details
      </div>
    </div>
  )
}