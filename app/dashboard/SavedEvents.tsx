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
    <div className="relative ml-3 min-w-0 border-l-2 border-gray-200 sm:ml-6">
      {events.map((event) => {
        const showWatermark = eventUsesWatermarkImage(event)
        const isUnsaving = unsavingInProgress.has(event.id)

        return (
          <div key={event.id} className="relative mb-10 ml-4 sm:ml-6">
            <span className="absolute -left-[35px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-gray-600" />

            <p className="text-sm font-semibold text-gray-700 mb-3">
              {formatDate(event.startDate)} – {formatDate(event.endDate || event.startDate)}
            </p>

            <div
              onClick={() => router.push(eventPublicPath(event))}
              className="relative flex w-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md sm:flex-row"
            >
              <button
                type="button"
                className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-gray-50"
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
                  "relative mx-auto mt-3 h-32 w-[calc(100%-1.5rem)] shrink-0 overflow-hidden rounded-2xl sm:mx-3 sm:w-40",
                  showWatermark && "bg-slate-50",
                )}
              >
                <AppImage
                  src={getEventDisplayImageUrl(event)}
                  alt={event.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 160px"
                  fallbackSrc={DEFAULT_EVENT_IMAGE}
                  className={eventCardImageClassName(event)}
                />
              </div>

              <div className="min-w-0 flex-1 p-4 pr-12 sm:p-6">
                <span className="mb-2 inline-block rounded bg-purple-50 px-2 py-1 text-xs text-purple-600">
                  {event.category || "Event"}
                </span>
                <h2 className="mb-2 line-clamp-2 break-words text-lg font-bold text-gray-900 sm:text-xl">
                  {event.title}
                </h2>
                <p className="mb-4 line-clamp-2 break-words text-sm text-gray-600">
                  {event.shortDescription || event.description || "No description available"}
                </p>

                <div className="grid grid-cols-1 gap-3 border-t border-gray-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex min-w-0 items-start gap-2 text-sm text-gray-500">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="break-words">{getEventAddress(event)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4 shrink-0" />
                    <span className="break-words">
                      {formatDate(event.startDate)} - {formatDate(event.endDate || event.startDate)}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Expected Visitors</span>
                      <span className="font-semibold text-gray-900">
                        {event.expectedExhibitors || event.maxAttendees || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Exptd Exhibitors</span>
                      <span className="font-semibold text-gray-900">
                        {event.expectedExhibitors || "0"}
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xl font-bold text-pink-500">
                      {formatEventEntryFeeDisplay(event.ticketTypes as TicketPriceRow[], "₹")}
                    </span>
                    <span className="block text-sm text-gray-500">Entry Fee</span>
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