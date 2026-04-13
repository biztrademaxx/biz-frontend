"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils" // shadcn utility for merging classNames

// Days of week
const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"]

function generateCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const calendar: (number | null)[] = []

  // Fill with nulls until the first day
  for (let i = 0; i < firstDay; i++) calendar.push(null)

  // Fill with actual days
  for (let d = 1; d <= daysInMonth; d++) calendar.push(d)

  return calendar
}

interface DynamicCalendarProps {
  className?: string
}

export function DynamicCalendar({ className }: DynamicCalendarProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())

  const calendarDays = generateCalendar(currentYear, currentMonth)

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
          {calendarDays.map((day, idx) => (
            <div
              key={idx}
              className={cn(
                "p-2 rounded aspect-square flex items-center justify-center",
                day === today.getDate() &&
                  currentMonth === today.getMonth() &&
                  currentYear === today.getFullYear()
                  ? "bg-red-400 text-white font-bold"
                  : day
                  ? "hover:bg-gray-100"
                  : ""
              )}
            >
              {day || ""}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
