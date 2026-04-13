"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { eventPublicPath } from "@/lib/event-path"

const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"]

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

  // 🔹 Fetch user's interested events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await apiFetch<{ events?: Event[]; data?: Event[] }>(`/api/users/${userId}/interested-events`, { auth: true })
        setEvents(data.events ?? data.data ?? [])
      } catch (err) {
        console.error("Failed to load events", err)
      }
    }

    if (userId) fetchEvents()
  }, [userId])

  // Reset selected date when month/year changes
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

  // 🔹 Filter events for the current month
  const monthEvents = events.filter(ev => {
    const evDate = new Date(ev.startDate)
    return (
      evDate.getMonth() === currentMonth &&
      evDate.getFullYear() === currentYear
    )
  })

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      {/* Header */}
      <CardHeader className="pb-3 flex justify-between items-center">
        <CardTitle>
          {new Date(currentYear, currentMonth).toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrev}>
            &lt;
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext}>
            &gt;
          </Button>
        </div>
      </CardHeader>

      {/* Calendar Content */}
      <CardContent className="flex-1">
        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-1 text-xs text-center mb-2">
          {daysOfWeek.map((day, i) => (
            <div key={i} className="font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1 text-xs text-center">
          {calendarDays.map((day, idx) => {
            if (!day) return <div key={idx} />

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
                <div
                  className={cn(
                    "relative p-2 rounded aspect-square flex items-center justify-center border cursor-pointer transition-colors",
                    isToday
                      ? "bg-red-400 text-white font-bold hover:bg-red-500"
                      : isSelected
                        ? "bg-blue-100 border-blue-300 hover:bg-blue-200"
                        : hasEvents
                          ? "bg-green-50 border-green-200 hover:bg-green-100"
                          : "hover:bg-gray-100"
                  )}
                  onClick={() => handleDateClick(day)}
                >
                  <div>{day}</div>

                  {/* Small indicator for events */}
                  {hasEvents && !isSelected && (
                    <div className="absolute bottom-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>

                {/* Event list - shows when date is selected */}
                {isSelected && dayEvents.length > 0 && (
                  <div className="absolute top-full left-0 z-10 mt-1 min-w-[200px] bg-white border border-gray-200 rounded-md shadow-lg p-2">
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      Events on {day}:
                    </div>
                    {dayEvents.map(ev => (
                      <div
                        key={ev.id}
                        className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer py-1 px-2 hover:bg-blue-50 rounded truncate"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEventClick(ev)
                        }}
                        title={ev.title}
                      >
                        {ev.title}
                        {ev.city && (
                          <span className="text-gray-500 ml-1">({ev.city})</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Instructions */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          Click on a date to see events • Click on event name to view details
        </div>
      </CardContent>
    </Card>
  )
}