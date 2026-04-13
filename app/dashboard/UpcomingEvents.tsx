"use client"

import { Event } from "./events-section"
import { Skeleton } from "@/components/ui/skeleton"

interface UpcomingEventsProps {
  events: Event[]
  userId?: string
  loading?: boolean
}

export function UpcomingEvents({ events, userId, loading }: UpcomingEventsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  const upcoming = events.filter(e => new Date(e.startDate) > new Date())

  if (upcoming.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No upcoming events.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {upcoming.map((event) => (
        <div key={event.id} className="p-4 border rounded-lg shadow-sm bg-green-50">
          <h3 className="font-semibold">{event.title}</h3>
          {event.shortDescription && (
            <p className="text-sm text-gray-600">{event.shortDescription}</p>
          )}
          <p className="text-xs text-gray-500">
            {event.location || "No location"} •{" "}
            {new Date(event.startDate).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  )
}