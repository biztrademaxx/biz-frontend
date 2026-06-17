"use client"

import { AppImage } from "@/components/app-image"
import { useEffect, useState } from "react"
import type { Event } from "./events-section"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarIcon, MapPin, Heart, HeartOff } from "lucide-react"
import { apiFetch, getCurrentUserId, isAuthenticated } from "@/lib/api"
import { formatEventEntryFeeDisplay, type TicketPriceRow } from "@/lib/ticket-price-display"
import { useRouter } from "next/navigation"
import { eventPublicPath } from "@/lib/event-path"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DEFAULT_EVENT_IMAGE,
  eventCardImageClassName,
  eventUsesWatermarkImage,
  getEventDisplayImageUrl,
} from "@/lib/default-event-image"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

export function SavedEvents({ userId }: { userId?: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [unsavingInProgress, setUnsavingInProgress] = useState<Set<string>>(new Set())

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

      // Use the endpoint that matches your backend
      const data = await apiFetch<{ events?: Event[] }>(`/api/users/${targetUserId}/interested-events`, {
        auth: true,
      })

      setEvents(data.events || [])
    } catch (err) {
      console.error("Error fetching saved events:", err)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveSaved = async (eventId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (unsavingInProgress.has(eventId) || !targetUserId) return

    setUnsavingInProgress(prev => new Set(prev).add(eventId))

    try {
      // Use the endpoint that matches your backend
      await apiFetch(`/api/users/${targetUserId}/interested-events`, {
        method: 'DELETE',
        body: { eventId },
        auth: true,
      })

      // Remove from local state
      setEvents(prev => prev.filter(event => event.id !== eventId))
      toast({
        title: "Event removed",
        description: "Event has been removed from your saved list",
      })
    } catch (error: any) {
      console.error("Error removing saved event:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to remove event from saved list. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUnsavingInProgress(prev => {
        const next = new Set(prev)
        next.delete(eventId)
        return next
      })
    }
  }

  const getEventAddress = (event: Event) => {
    const country = event.venue?.venueCountry || ""
    if (event.city && country) {
      return `${event.city}, ${country}`
    }
    if (event.city) {
      return event.city
    }
    return "Location TBD"
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
      {events.map((event) => {
        const showWatermark = eventUsesWatermarkImage(event)
        const isUnsaving = unsavingInProgress.has(event.id)

        return (
          <div key={event.id} className="mb-10 ml-6 relative">
            <span className="absolute -left-[35px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-gray-600" />

            <p className="text-sm font-semibold text-gray-700 mb-3">
              {formatDate(event.startDate)} – {formatDate(event.endDate || event.startDate)}
            </p>

            <div
              onClick={() => router.push(eventPublicPath(event))}
              className="flex w-full min-w-0 border border-gray-200 bg-white rounded-lg hover:shadow-md transition-shadow overflow-hidden cursor-pointer relative"
            >
              <button
                type="button"
                className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors"
                aria-label="Remove from saved"
                onClick={(e) => handleRemoveSaved(event.id, e)}
                disabled={isUnsaving}
              >
                {isUnsaving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
                ) : (
                  <HeartOff className="h-4 w-4 text-red-500" />
                )}
              </button>

              <div
                className={cn(
                  "relative mx-3 mt-3 h-32 w-40 shrink-0 overflow-hidden rounded-2xl",
                  showWatermark && "bg-slate-50",
                )}
              >
                <AppImage
                  src={getEventDisplayImageUrl(event)}
                  alt={event.title}
                  fill
                  sizes="160px"
                  fallbackSrc={DEFAULT_EVENT_IMAGE}
                  className={eventCardImageClassName(event)}
                />
              </div>

              <div className="flex-1 p-6 min-w-0">
                <div className="flex justify-between items-start min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="mb-2">
                      <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                        {event.category || "Event"}
                      </span>
                    </div>

                    <div className="flex">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-gray-900 mb-3 truncate pr-4">
                          {event.title}
                        </h2>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {event.shortDescription || event.description || "No description available"}
                        </p>
                      </div>

                      <div className="flex flex-col gap-4 text-sm text-gray-500 ml-4 min-w-[200px] max-w-[250px]">
                        <div className="flex items-start min-w-0 overflow-hidden">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="truncate block" title={getEventAddress(event)}>
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

                    <div className="grid text-center mt-5 min-w-[80px]">
                      <span className="text-xl font-bold text-pink-500 whitespace-nowrap">
                        {formatEventEntryFeeDisplay(event.ticketTypes as TicketPriceRow[], "₹")}
                      </span>
                      <span className="text-gray-500 text-sm">Entry Fee</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}