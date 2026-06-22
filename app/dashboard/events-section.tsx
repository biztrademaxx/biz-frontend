"use client"

import { AppImage } from "@/components/app-image"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Plus, Heart, Filter, X, CalendarIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { apiFetch, getCurrentUserId } from "@/lib/api"
import { eventPublicPath } from "@/lib/event-path"
import { formatEventEntryFeeDisplay, type TicketPriceRow } from "@/lib/ticket-price-display"
import {
  DEFAULT_EVENT_IMAGE,
  eventCardImageClassName,
  eventUsesWatermarkImage,
  getEventDisplayImageUrl,
} from "@/lib/default-event-image"
import { cn } from "@/lib/utils"

/**
 * Full EventsSection component
 * - Fetches interested events for the current user (or provided userId)
 * - Supports date range filtering via a calendar + date inputs
 * - Renders timeline-style list of events
 * - Shows role badge (Visitor / Exhibitor) using `leadType`
 * - Timeline dot color changes by leadType
 * - Handles loading and error states
 * - Automatically filters out expired events
 *
 * Paste this file in your React/Next.js component folder and adjust imports if needed.
 */

/* ---------- Types ---------- */
interface TicketType {
  id: string
  name: string
  price: number
  earlyBirdPrice?: number
  earlyBirdEnd?: string
  quantity: number
  sold: number
  isActive: boolean
}

export interface Event {
  country: any
  expectedExhibitors: string
  id: string
  title: string
  startDate: string
  endDate: string
  location?: string
  city?: string
  venue?:{
    venueCountry: string
    venueCity: string
    venueName: string
  }
  state?: string
  status?: "pending" | "confirmed" | "rejected" | string
  type?: string
  description?: string
  shortDescription?: string
  bannerImage?: string
  category?: string
  thumbnailImage?: string
  address?: string
  ticketTypes: TicketType[] // Fixed from ticketType:[] to ticketTypes with proper typing
  organizer?: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
    company?: string
  }
  leadId?: string
  leadStatus?: string
  leadType?: "visitor" | "exhibitor" | string
  contactedAt?: string
  followUpDate?: string
  leadNotes?: string
  currentRegistrations?: number
  maxAttendees?: number
}

/* ---------- Props ---------- */
interface EventsSectionProps {
  userId?: string
}

/* ---------- Helpers ---------- */
const DEFAULT_IMAGE = "/image/download2.jpg"

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

// Choose dot color based on leadType (visitor / exhibitor / unknown)
const timelineDotClass = (leadType?: string) => {
  if (!leadType) return "bg-blue-700"
  if (leadType === "exhibitor") return "bg-blue-700"
  if (leadType === "visitor") return "bg-blue-700"
  return "bg-blue-700"
}

// Choose badge variant or classes for role display
const roleBadgeProps = (leadType?: string) => {
  if (leadType === "exhibitor") {
    return { label: "Exhibitor", classes: "bg-green-100 text-green-800 border-green-200" }
  }
  if (leadType === "visitor") {
    return { label: "Visitor", classes: "bg-blue-100 text-blue-800 border-blue-200" }
  }
  return { label: "Participant", classes: "bg-gray-100 text-gray-800 border-gray-200" }
}

// Status pill classes
const statusPillClass = (status?: string) => {
  switch (status) {
    case "confirmed":
      return "bg-green-50 text-green-800 border-green-100"
    case "pending":
      return "bg-yellow-50 text-yellow-800 border-yellow-100"
    case "rejected":
      return "bg-red-50 text-red-800 border-red-100"
    default:
      return "bg-gray-50 text-gray-700 border-gray-100"
  }
}

/* ---------- Component ---------- */
export function EventsSection({ userId }: EventsSectionProps) {
  const router = useRouter()
  const [interestedEvents, setInterestedEvents] = useState<Event[]>([])
  const [interestedLoading, setInterestedLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // date range filter state
  const [dateFilter, setDateFilter] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [showCalendarFilter, setShowCalendarFilter] = useState(false)

  const targetUserId = userId || getCurrentUserId()

  useEffect(() => {
    if (!targetUserId) {
      setError("User not authenticated")
      setInterestedLoading(false)
      return
    }
    fetchInterestedEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId])

  // Fetch interested events from API
  const fetchInterestedEvents = async () => {
    if (!targetUserId) return
    try {
      setInterestedLoading(true)
      setError(null)

      const data = await apiFetch<{ events?: Event[]; data?: Event[] }>(`/api/users/${targetUserId}/interested-events`, { auth: true })

      // API might return `events` or `data`
      const events: Event[] = data?.events ?? data?.data ?? []

      // Normalize date strings (ensure ISO-like string)
      const normalized = events.map((ev) => ({
        ...ev,
        startDate: ev.startDate ? new Date(ev.startDate).toISOString() : new Date().toISOString(),
        endDate: ev.endDate ? new Date(ev.endDate).toISOString() : new Date(ev.startDate || new Date()).toISOString(),
      }))

      setInterestedEvents(normalized)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setInterestedEvents([])
    } finally {
      setInterestedLoading(false)
    }
  }

  // Clear date filter
  const clearDateFilter = () => setDateFilter({ from: undefined, to: undefined })

  // Filter out expired events (events that ended before today)
  const filterOutExpiredEvents = (events: Event[]) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return events.filter((event) => {
      const eventEndDate = new Date(event.endDate || event.startDate)
      eventEndDate.setHours(0, 0, 0, 0)
      return eventEndDate >= today
    })
  }

  // Filter events by date range; inclusive of start/end overlap
  const filterEventsByDate = (events: Event[]) => {
    if (!dateFilter.from && !dateFilter.to) return events
    return events.filter((event) => {
      const eventStartDate = new Date(event.startDate)
      const eventEndDate = new Date(event.endDate || event.startDate)

      // If only from is set
      if (dateFilter.from && !dateFilter.to) {
        return eventEndDate >= dateFilter.from
      }

      // If only to is set
      if (!dateFilter.from && dateFilter.to) {
        return eventStartDate <= dateFilter.to
      }

      // Both from & to present -> check overlap
      if (dateFilter.from && dateFilter.to) {
        const from = dateFilter.from
        const to = dateFilter.to
        return eventStartDate <= to && eventEndDate >= from
      }

      return true
    })
  }

  // Apply both filters: first date range, then remove expired events
  const filteredEvents = filterOutExpiredEvents(filterEventsByDate(interestedEvents))
  const expiredEventsCount = filterEventsByDate(interestedEvents).length - filteredEvents.length

  /* ---------- UI: Loading / Error States ---------- */
  if (interestedLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  /* ---------- Render ---------- */
  return (
    <div className="space-y-6 min-w-0 overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Interested Events</h1>
        <Button onClick={() => router.push("/event")} className="flex w-full sm:w-auto items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Find Events
        </Button>
      </div>

      {/* Show expired events count if any were filtered out */}
      {/* {expiredEventsCount > 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            {expiredEventsCount} expired event{expiredEventsCount > 1 ? 's' : ''} hidden from display
          </AlertDescription>
        </Alert>
      )} */}

      {/* Calendar Filter Section */}
      <div className="flex flex-col gap-4 rounded-lg border bg-[#fff] p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-medium">Filter by Date</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCalendarFilter(!showCalendarFilter)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {showCalendarFilter ? "Hide Filter" : "Show Filter"}
          </Button>
        </div>

        {showCalendarFilter && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Calendar
                mode="range"
                selected={{ from: dateFilter.from, to: dateFilter.to }}
                onSelect={(range) => {
                  setDateFilter({ from: range?.from, to: range?.to })
                }}
                className="rounded-md border"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="from-date">From Date</Label>
                <Input
                  id="from-date"
                  type="date"
                  value={dateFilter.from ? format(dateFilter.from, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined
                    setDateFilter((prev) => ({ ...prev, from: date }))
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="to-date">To Date</Label>
                <Input
                  id="to-date"
                  type="date"
                  value={dateFilter.to ? format(dateFilter.to, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined
                    setDateFilter((prev) => ({ ...prev, to: date }))
                  }}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={clearDateFilter}
                  className="flex items-center gap-2 bg-transparent"
                  disabled={!dateFilter.from && !dateFilter.to}
                >
                  <X className="w-4 h-4" />
                  Clear Filter
                </Button>
                <Button variant="default" onClick={() => setShowCalendarFilter(false)}>
                  Apply Filter
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs (only All for now) */}
      <Tabs defaultValue="all" className="w-full">
        <TabsContent value="all" className="space-y-8">
          {filteredEvents.length > 0 ? (
            <div className="relative border-l-2 border-gray-200 ml-6 min-w-0">
              {filteredEvents.map((event) => {
                const defaultImage = DEFAULT_IMAGE
                const role = roleBadgeProps(event.leadType)
                return (
                  <div key={event.id} className="mb-10 ml-6 relative">
                    {/* Timeline Dot (centered over the line) */}
                    <span
                      className={`absolute -left-[35px] top-0 flex items-center justify-center 
    w-6 h-6 rounded-full bg-gray-600 ${timelineDotClass(event.leadType)}`}
                    />

                    {/* Date Heading */}
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      {formatDate(event.startDate)} – {formatDate(event.endDate)}
                    </p>

                    {/* Event Card */}
                    <div
                      onClick={() => router.push(eventPublicPath(event))}
                      className="flex w-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md sm:flex-row"
                    >
                      <div
                        className={cn(
                          "relative mx-auto mt-3 h-32 w-[calc(100%-1.5rem)] shrink-0 overflow-hidden rounded-2xl sm:mx-3 sm:w-40",
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

                      <div className="min-w-0 flex-1 p-4 sm:p-6">
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
                            <span className="break-words">
                              {event.city
                                ? `${event.city}${event.venue?.venueCountry ? `, ${event.venue.venueCountry}` : ""}`
                                : "Location TBD"}
                            </span>
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
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 mb-4">
                  {dateFilter.from || dateFilter.to
                    ? "No events match your filter criteria."
                    : interestedEvents.length > 0
                    ? "All your interested events have expired."
                    : "No interested events yet."}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Button variant="outline" onClick={() => router.push("/event")}>
                    Find Events
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EventsSection