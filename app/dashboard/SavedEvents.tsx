"use client"

import { useEffect, useState } from "react"
import type { Event } from "./events-section"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarIcon, MapPin } from "lucide-react"
import type { TicketType } from "@prisma/client"
import { apiFetch, getCurrentUserId } from "@/lib/api"

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
    if (!targetUserId) return
    fetchSavedEvents()
  }, [targetUserId])

  const fetchSavedEvents = async () => {
    try {
      setLoading(true)
      console.log("[v0] Fetching saved events for userId:", targetUserId)
      console.log("[v0] Current user ID:", targetUserId)

      const response = await fetch(`/api/users/${targetUserId}/saved-events`)

      if (response.status === 403) {
        console.error("[v0] 403 Forbidden: You can only view your own saved events")
        throw new Error("You can only view your own saved events")
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[v0] API error:", response.status, errorData)
        throw new Error(errorData.error || "Failed to fetch saved events")
      }

      const data = await response.json()
      setEvents(data.events || [])
    } catch (err) {
      console.error("Error fetching saved events:", err)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const formatTicketPrice = (ticketTypes: TicketType[]) => {
    if (!ticketTypes || ticketTypes.length === 0) return "Free"

    const activeTickets = ticketTypes.filter((ticket) => ticket.isActive)
    if (activeTickets.length === 0) return "N/A"

    const cheapestTicket = activeTickets.reduce((min, ticket) => {
      const price =
        ticket.earlyBirdPrice && new Date() < new Date(ticket.earlyBirdEnd || "") ? ticket.earlyBirdPrice : ticket.price
      const minPrice =
        min.earlyBirdPrice && new Date() < new Date(min.earlyBirdEnd || "") ? min.earlyBirdPrice : min.price
      return price < minPrice ? ticket : min
    })

    const currentPrice =
      cheapestTicket.earlyBirdPrice && new Date() < new Date(cheapestTicket.earlyBirdEnd || "")
        ? cheapestTicket.earlyBirdPrice
        : cheapestTicket.price

    if (currentPrice === 0) return "Free"
    return `$${currentPrice.toFixed(2)}`
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

          <div className="flex w-full border border-gray-200 bg-white rounded-lg hover:shadow-md transition-shadow overflow-hidden">
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

            <div className="flex-1 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      {event.category || "Event"}
                    </span>
                  </div>

                  <div className="flex">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-gray-900 mb-3 truncate pr-4">{event.title}</h2>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {event.shortDescription || event.description || "No description available"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-4 text-sm text-gray-500 ml-4 min-w-[200px]">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{getEventAddress(event)}</span>
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="whitespace-nowrap">
                          {formatDate(event.startDate)} - {formatDate(event.endDate || event.startDate)}
                        </span>
                      </div>
                    </div>
                    <div className="w-15 h-15 flex items-center justify-center bg-purple-50 rounded-lg ml-8 flex-shrink-0">
                      🎟️
                    </div>
                  </div>
                </div>

                <div className="ml-6 flex items-start">
                  <div className="space-y-2 mt-6 mr-20 min-w-[180px]">
                    <div className="flex justify-between gap-10">
                      <span className="text-gray-500 whitespace-nowrap">Expected Visitors</span>
                      <span className="font-semibold text-gray-900 whitespace-nowrap">
                        {event.expectedExhibitors || event.maxAttendees || "200"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-12">
                      <span className="text-gray-500 whitespace-nowrap">Exptd Exhibitors</span>
                      <span className="font-semibold text-gray-900 whitespace-nowrap">
                        {event.expectedExhibitors || "200"}
                      </span>
                    </div>
                  </div>

                  <div className="grid text-center mt-5 min-w-[80px]">
                    <span className="text-xl font-bold text-pink-500 whitespace-nowrap">
                      {formatTicketPrice(event.ticketTypes as unknown as TicketType[])}
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
