"use client"

import { useEffect, useState } from "react"
import type { Event } from "./events-section"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarIcon, MapPin, Heart } from "lucide-react"
import { apiFetch, getCurrentUserId, isAuthenticated } from "@/lib/api"
import { formatEventEntryFeeDisplay, type TicketPriceRow } from "@/lib/ticket-price-display"
import { useRouter } from "next/navigation"
import { eventPublicPath } from "@/lib/event-path"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

/* ---------- Helpers ---------- */
const DEFAULT_IMAGE = "/image/download2.jpg"
const DEFAULT_ADDRESS = "Address not specified"

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

export function SavedEvents({ userId }: { userId?: string }) {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  const targetUserId = userId || (typeof window !== "undefined" ? getCurrentUserId() : null)

  useEffect(() => {
    if (!targetUserId || !isAuthenticated()) {
      setEvents([])
      setLoading(false)
      return
    }
    fetchSavedEvents()
  }, [targetUserId])

  const fetchSavedEvents = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<{ events?: Event[] }>(`/api/users/${targetUserId}/saved-events`, {
        auth: true,
      })
      setEvents(data.events || [])
    } catch (err) {
      // Silent fallback for unauthorized/expired auth on dashboard widget.
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const getEventAddress = (event: Event) => {
    if (event.address && event.address.trim() !== "") return event.address
    if (event.location && event.location.trim() !== "") return event.location
    if (event.city && event.state) return `${event.city}, ${event.state}`
    if (event.city) return event.city
    if (event.state) return event.state
    return DEFAULT_ADDRESS
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!events.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 mb-4">No saved events found.</p>
          <Button variant="outline" onClick={() => router.push("/event")}>
            Find Events
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="relative border-l-2 border-gray-200 ml-6 min-w-0">
      {events.map((event) => (
        <div key={event.id} className="mb-10 ml-6 relative">
          {/* Timeline Dot */}
          <span className="absolute -left-[35px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-gray-600" />

          {/* Date Heading */}
          <p className="text-sm font-semibold text-gray-700 mb-3">
            {formatDate(event.startDate)} – {formatDate(event.endDate || event.startDate)}
          </p>

          {/* Event Card - Matching EventsSection styling */}
          <div
            onClick={() => router.push(eventPublicPath(event))}
            className="flex w-full min-w-0 border border-gray-200 bg-white rounded-lg hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
          >
            {/* Left Image Section */}
            <div className="w-40 h-32 flex-shrink-0">
              <img
                src={
                  event.thumbnailImage ||
                  event.bannerImage ||
                  "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop"
                }
                alt={event.title}
                className="w-full h-full object-cover rounded-2xl mt-3 mx-3"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement
                  target.src = "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop"
                }}
              />
            </div>

            {/* Main Content Section */}
            <div className="flex-1 p-6 min-w-0">
              <div className="flex justify-between items-start min-w-0">
                {/* Left Content */}
                <div className="flex-1 min-w-0">
                  {/* Category Badge */}
                  <div className="mb-2">
                    <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      {event.category || "Event"}
                    </span>
                  </div>

                  {/* Title and Content Row */}
                  <div className="flex">
                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-gray-900 mb-3 truncate pr-4">
                        {event.title}
                      </h2>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {event.shortDescription || event.description || "No description available"}
                      </p>
                    </div>

                    {/* Location and Date - Fixed width with proper wrapping */}
                    <div className="flex flex-col gap-4 text-sm text-gray-500 ml-4 min-w-[200px] max-w-[250px]">
                      <div className="flex items-start min-w-0 overflow-hidden">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                        <span
                          className="truncate block"
                          title={getEventAddress(event)}
                        >
                          {getEventAddress(event)}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="whitespace-nowrap">
                          {formatDate(event.startDate)} - {formatDate(event.endDate || event.startDate)}
                        </span>
                      </div>
                    </div>

                    {/* Ticket Icon */}
                    <div className="w-15 h-15 flex items-center justify-center bg-purple-50 rounded-lg ml-8 flex-shrink-0">
                      🎟️
                    </div>
                  </div>
                </div>

                {/* Right Stats Section */}
                <div className="ml-6 flex items-start">
                  {/* Expected Visitors and Exhibitors */}
                  <div className="space-y-2 mt-6 mr-20 min-w-[180px]">
                    <div className="flex justify-between gap-10">
                      <span className="text-gray-500 whitespace-nowrap">Expected Visitors</span>
                      <span className="font-semibold text-gray-900 whitespace-nowrap">
                        {event.expectedExhibitors || event.maxAttendees || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-12">
                      <span className="text-gray-500 whitespace-nowrap">Exptd Exhibitors</span>
                      <span className="font-semibold text-gray-900 whitespace-nowrap">
                        {event.expectedExhibitors || "0"}
                      </span>
                    </div>
                  </div>

                  {/* Entry Fee */}
                  <div className="grid text-center mt-5 min-w-[80px]">
                    <span className="text-xl font-bold text-pink-500 whitespace-nowrap">
                      {formatEventEntryFeeDisplay(event.ticketTypes as TicketPriceRow[],  "₹")}
                    </span>
                    <span className="text-gray-500 text-sm">Entry Fee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}