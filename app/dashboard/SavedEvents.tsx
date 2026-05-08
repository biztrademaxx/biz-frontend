"use client"

import { useEffect, useState } from "react"
import type { Event } from "./events-section"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarIcon, MapPin } from "lucide-react"
import { apiFetch, getCurrentUserId, isAuthenticated } from "@/lib/api"
import { formatEventEntryFeeDisplay, type TicketPriceRow } from "@/lib/ticket-price-display"

/* ---------- Helpers (same as EventsSection) ---------- */
const DEFAULT_IMAGE = "/image/download2.jpg"
const DEFAULT_ADDRESS = "Address not specified"

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

export function SavedEvents({ userId }: { userId?: string }) {
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
    return <p className="text-gray-500">No saved events found.</p>
  }

  return (
    <div className="relative border-l-2 border-gray-200 ml-6">
      {events.map((event) => (
        <div key={event.id} className="mb-10 ml-6 relative">
          <span className="absolute -left-[35px] flex items-center justify-center w-5 h-5 rounded-full ring-4 ring-white bg-gray-600" />

          <p className="text-sm font-semibold text-gray-700 mb-3">
            {formatDate(event.startDate)} – {formatDate(event.endDate || event.startDate)}
          </p>

          <div className="flex flex-col sm:flex-row w-full border border-gray-200 bg-white rounded-lg hover:shadow-md transition-shadow overflow-hidden">
            <div className="w-full sm:w-40 h-36 sm:h-32 shrink-0 flex justify-center sm:block px-3 pt-3 sm:px-0 sm:pt-0">
              <img
                src={
                  event.thumbnailImage ||
                  event.bannerImage ||
                  "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop"
                }
                alt={event.title}
                className="w-full max-w-[220px] sm:max-w-none h-full max-h-[9rem] sm:max-h-none object-cover rounded-2xl sm:mt-3 sm:mx-3"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement
                  target.src = "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop"
                }}
              />
            </div>

            <div className="flex-1 p-4 sm:p-6 min-w-0">
              <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start gap-4 xl:gap-6">
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="mb-0">
                    <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      {event.category || "Event"}
                    </span>
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-start gap-4 min-w-0">
                    <div className="flex-1 min-w-0 order-2 lg:order-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 pr-1">{event.title}</h2>

                      <p className="text-sm text-gray-600 mb-0 line-clamp-2">
                        {event.shortDescription || event.description || "No description available"}
                      </p>
                    </div>

                    <div className="flex items-start gap-2 lg:ml-auto lg:pl-2 shrink-0 order-1 lg:order-2">
                      <div className="w-12 h-12 flex items-center justify-center bg-purple-50 rounded-lg">
                        🎟️
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-x-6 sm:gap-y-2 text-sm text-gray-600 pt-1 border-t border-gray-100">
                    <div className="flex items-start gap-2 min-w-0 flex-1 sm:min-w-[12rem] sm:max-w-full lg:max-w-xl">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" aria-hidden />
                      <span
                        className="min-w-0 break-words leading-snug line-clamp-3 sm:line-clamp-4"
                        title={getEventAddress(event)}
                      >
                        {getEventAddress(event)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-gray-500">
                      <CalendarIcon className="w-4 h-4 shrink-0" aria-hidden />
                      <span className="whitespace-nowrap">
                        {formatDate(event.startDate)} – {formatDate(event.endDate || event.startDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row xl:flex-col gap-4 xl:gap-5 items-start justify-between xl:justify-start xl:items-end shrink-0 xl:min-w-[12rem]">
                  <div className="space-y-2 min-w-0 xl:w-full xl:text-right">
                    <div className="flex justify-between gap-6 xl:gap-8">
                      <span className="text-gray-500 whitespace-nowrap text-xs sm:text-sm">Expected Visitors</span>
                      <span className="font-semibold text-gray-900 whitespace-nowrap tabular-nums text-sm">
                        {event.expectedExhibitors || event.maxAttendees || "200"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-6 xl:gap-8">
                      <span className="text-gray-500 whitespace-nowrap text-xs sm:text-sm">Exptd Exhibitors</span>
                      <span className="font-semibold text-gray-900 whitespace-nowrap tabular-nums text-sm">
                        {event.expectedExhibitors || "200"}
                      </span>
                    </div>
                  </div>

                  <div className="grid text-center xl:text-right shrink-0 min-w-[4.5rem]">
                    <span className="text-xl font-bold text-pink-500 whitespace-nowrap">
                      {formatEventEntryFeeDisplay(event.ticketTypes as TicketPriceRow[], event.currency)}
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
