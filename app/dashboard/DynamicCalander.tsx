"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { eventPublicPath } from "@/lib/event-path"
import { ChevronLeft, ChevronRight } from "lucide-react"

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function generateCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const calendar: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) calendar.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendar.push(d)
  return calendar
}

interface Event {
  id: string
  slug?: string | null
  title: string
  startDate: string
  endDate: string
  city?: string
}

interface DynamicCalendarProps {
  className?: string
  userId: string
}

export function DynamicCalendar({ className, userId }: DynamicCalendarProps) {
  const router = useRouter()
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState<number | null>(null)

  const calendarDays = generateCalendar(currentYear, currentMonth)

  useEffect(() => {
    const fetchEvents = async () => {
      try {

        const data = await apiFetch<{ events?: Event[]; data?: Event[] }>(`/api/users/${userId}/interested-events?year=${currentYear}`, { auth: true })

        setEvents(data.events ?? data.data ?? [])
      } catch (err) {
        console.error("Failed to load events", err)
      }
    }

    if (userId) fetchEvents()
  }, [userId, currentYear])

  useEffect(() => {
    setSelectedDate(null)
  }, [currentMonth, currentYear])

  const handlePrev = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNext = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleDateClick = (day: number) => {
    setSelectedDate(selectedDate === day ? null : day)
  }

  const handleEventClick = (ev: Event) => {
    router.push(eventPublicPath(ev))
  }

  const monthEvents = events.filter(ev => {
    const evDate = new Date(ev.startDate)
    return (
      evDate.getMonth() === currentMonth &&
      evDate.getFullYear() === currentYear
    )
  })

 return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-800">
            {new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" })}
          </h3>
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="text-lg font-semibold text-slate-800 border-gray-200 rounded-md px-2 py-1 outline-none cursor-pointer transition-colors"
          >
            {Array.from({ length: 11 }, (_, i) => today.getFullYear() - 5 + i).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-gray-200"
            onClick={handlePrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-gray-200"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day, i) => (
          <div key={i} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, idx) => {
          if (!day) {
            return <div key={idx} className="aspect-square p-1" />
          }

          const dayEvents = monthEvents.filter(ev => {
            const start = new Date(ev.startDate)
            const end = new Date(ev.endDate)
            const current = new Date(currentYear, currentMonth, day)
            return current >= start && current <= end
          })

          const isToday = day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()

          const isSelected = selectedDate === day
          const hasEvents = dayEvents.length > 0

          return (
            <div key={idx} className="relative">
              <button
                onClick={() => handleDateClick(day)}
                className={cn(
                  "w-full aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-200 text-sm",
                  isToday
                    ? "bg-red-500 text-white font-semibold shadow-sm"
                    : isSelected
                      ? "bg-blue-100 text-blue-700 border-2 border-blue-400"
                      : hasEvents
                        ? "bg-green-50 hover:bg-green-100 text-gray-700"
                        : "hover:bg-gray-50 text-gray-700"
                )}
              >
                <span>{day}</span>
                {hasEvents && !isSelected && !isToday && (
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-0.5" />
                )}
                {hasEvents && !isSelected && isToday && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full mt-0.5" />
                )}
              </button>

              {/* Event Popup */}
              {isSelected && dayEvents.length > 0 && (
                <div className="absolute top-full left-0 z-20 mt-2 w-[min(100vw-2rem,16rem)] max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                    <p className="text-xs font-semibold text-gray-700">
                      Events on {day} {new Date(currentYear, currentMonth).toLocaleString("default", { month: "short" })}
                    </p>
                  </div>
                  <div className="max-h-48 overflow-y-auto p-2">
                    {dayEvents.map(ev => (
                      <div
                        key={ev.id}
                        className="p-2 hover:bg-blue-50 rounded-md cursor-pointer transition-colors"
                        onClick={() => handleEventClick(ev)}
                      >
                        <p className="text-sm font-medium text-blue-600 truncate">{ev.title}</p>
                        {ev.city && (
                          <p className="text-xs text-gray-500 mt-0.5">📍 {ev.city}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Has events</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-400" />
          <span>Selected</span>
        </div>
      </div>
    </div>
  )
}