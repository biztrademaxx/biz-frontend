"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { eventPublicPath } from "@/lib/event-path"

export default function TrendingEvents() {
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/events")
        const data = await res.json()
        setEvents(data || [])
      } catch (err) {
        console.error(err)
        setEvents([])
      }
    }
    load()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* Container */}
      <div className="bg-gray-100 rounded-[6px] p-6">

        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Trending Events
          </h2>
          <p className="text-sm text-gray-500">
            Explore the trending events happening in the country this week
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

          {events.length > 0
            ? events.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  onClick={() => router.push(eventPublicPath(event))}
                  className="bg-white rounded-[6px] p-2 cursor-pointer"
                >
                  {/* Image */}
                  <img
                    src={
                      event.image ||
                      event.banner ||
                      "/city/c4.jpg"
                    }
                    alt={event.title}
                    className="w-full h-[140px] object-cover rounded-[4px]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/city/c4.jpg"
                    }}
                  />

                  {/* Title */}
                  <p className="text-sm font-medium text-gray-800 mt-2 line-clamp-2">
                    {event.title || "Event Title"}
                  </p>
                </div>
              ))
            : // Skeleton (like your image)
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[6px] p-2"
                >
                  <div className="w-full h-[140px] bg-gray-200 rounded-[4px]" />
                </div>
              ))}
        </div>

      </div>
    </div>
  )
}