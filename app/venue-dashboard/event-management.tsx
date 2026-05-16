"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useVenueDashboardVenueUserId } from "@/contexts/venue-dashboard-venue-id"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CalendarIcon,
  MapPin,
  Users,
  Building,
} from "lucide-react"
import { apiFetch } from "@/lib/api"
import { cn } from "@/lib/utils"

const EVENT_PLACEHOLDER = "/images/gpex.jpg"

function getEventImageSrc(event: Record<string, unknown>): string {
  const thumb = event.thumbnailImage
  const banner = event.bannerImage
  const images = event.images
  if (typeof thumb === "string" && thumb.trim()) return thumb.trim()
  if (Array.isArray(images) && images.length > 0 && typeof images[0] === "string" && images[0].trim()) {
    return images[0].trim()
  }
  if (typeof banner === "string" && banner.trim()) return banner.trim()
  return EVENT_PLACEHOLDER
}

function formatCategory(category: unknown): string {
  if (Array.isArray(category)) {
    const parts = category.filter((c): c is string => typeof c === "string" && c.trim().length > 0)
    return parts.length ? parts.join(", ") : "—"
  }
  if (typeof category === "string" && category.trim()) return category.trim()
  return "—"
}

function formatStatus(status: unknown): string {
  if (typeof status !== "string") return "—"
  return status.replace(/_/g, " ")
}

/** “City, Country” for display; falls back to timezone when location fields are empty. */
function formatEventLocation(event: Record<string, unknown>): string {
  const city = typeof event.city === "string" ? event.city.trim() : ""
  const country = typeof event.country === "string" ? event.country.trim() : ""
  const isVirtual = event.isVirtual === true

  if (isVirtual && !city && !country) {
    return "Online"
  }

  const parts = [city, country].filter((p) => p.length > 0)
  if (parts.length > 0) {
    return parts.join(", ")
  }

  const tz = typeof event.timezone === "string" ? event.timezone.trim() : ""
  return tz.length > 0 ? tz : "—"
}

export default function EventManagement() {
  const resolvedVenueUserId = useVenueDashboardVenueUserId()
  const [activeTab, setActiveTab] = useState("upcoming")
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch events from API (venue user id UUID — not URL slug)
  useEffect(() => {
    if (!resolvedVenueUserId) return

    const fetchEvents = async () => {
      try {
        setLoading(true)
        const data = await apiFetch<{ success: boolean; data?: any[]; events?: any[] }>(
          `/api/venues/${resolvedVenueUserId}/events`,
          { auth: true },
        )

        if (data.success) {
          setEvents(data.events ?? data.data ?? [])
        } else {
          console.error("Failed to load events")
        }
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [resolvedVenueUserId])

  // Filter upcoming (includes ongoing) & past events
  const now = new Date()
  const upcomingEvents = events.filter((e) => new Date(e.endDate) >= now)
  const pastEvents = events.filter((e) => new Date(e.endDate) < now)

  const getStatusBadgeClass = (status: unknown) => {
    const s = (typeof status === "string" ? status : "").toUpperCase().replace(/-/g, "_")
    if (["PUBLISHED", "CONFIRMED", "LIVE", "APPROVED", "ONGOING"].some((k) => s.includes(k))) {
      return "border-transparent bg-emerald-500 text-white hover:bg-emerald-600"
    }
    if (["DRAFT", "PENDING", "SCHEDULED"].some((k) => s.includes(k))) {
      return "border-transparent bg-amber-500 text-white hover:bg-amber-600"
    }
    if (["CANCELLED", "CANCELED", "REJECTED"].some((k) => s.includes(k))) {
      return "border-transparent bg-red-500 text-white hover:bg-red-600"
    }
    if (["COMPLETED", "ENDED", "CLOSED"].some((k) => s.includes(k))) {
      return "border-transparent bg-violet-500 text-white hover:bg-violet-600"
    }
    return "border-transparent bg-slate-500 text-white hover:bg-slate-600"
  }

  const shortDate = (d: string | undefined) => {
    if (!d) return "—"
    try {
      return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    } catch {
      return "—"
    }
  }

  const getEventKey = (event: any, index: number) => {
    return (
      event.id ||
      event._id ||
      event.eventId ||
      `${event.title || "event"}-${event.startDate || "no-date"}-${index}`
    )
  }

  const EventCard = ({ event, isPast = false }: { event: Record<string, unknown>; isPast?: boolean }) => {
    const title = typeof event.title === "string" ? event.title : "Event"
    const imgSrc = getEventImageSrc(event)
    const startDate = typeof event.startDate === "string" ? event.startDate : undefined
    const endDate = typeof event.endDate === "string" ? event.endDate : undefined
    const locationLabel = formatEventLocation(event as Record<string, unknown>)
    const attendees =
      typeof event.currentAttendees === "number" ? event.currentAttendees : Number(event.currentAttendees) || 0

    return (
      <div
        className={cn(
          "flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all hover:border-violet-200/80 hover:shadow-md sm:flex-row sm:items-stretch",
          isPast && "opacity-[0.92]",
        )}
      >
        <div className="relative aspect-[16/9] max-h-36 w-full shrink-0 sm:aspect-auto sm:max-h-none sm:w-28 sm:min-w-[7rem] md:w-32">
          <Image
            src={imgSrc}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 136px"
            unoptimized={imgSrc.startsWith("http")}
          />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-1.5 p-3 sm:py-2.5 sm:pr-3 sm:pl-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 md:text-base">{title}</h3>
              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
                <Building className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                <span className="truncate">{formatCategory(event.category)}</span>
              </p>
            </div>
            <Badge className={cn("shrink-0 text-[10px] font-medium uppercase tracking-wide", getStatusBadgeClass(event.status))}>
              {formatStatus(event.status)}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-600 sm:text-xs">
            <span className="inline-flex items-center gap-1">
              <CalendarIcon className="h-3.5 w-3.5 text-violet-500" />
              <span className="font-medium text-slate-700">{shortDate(startDate)}</span>
              <span className="text-slate-400">–</span>
              <span className="font-medium text-slate-700">{shortDate(endDate)}</span>
            </span>
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-sky-500" />
              <span className="min-w-0 truncate" title={locationLabel}>
                {locationLabel}
              </span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-orange-500" />
              {attendees} registered
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>

      {loading ? (
        <div className="text-center text-gray-500">Loading events...</div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event, index) => <EventCard key={getEventKey(event, index)} event={event} />)
            ) : (
              <p className="text-gray-500 text-center">No upcoming events found.</p>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastEvents.length > 0 ? (
              pastEvents.map((event, index) => (
                <EventCard key={getEventKey(event, index)} event={event} isPast={true} />
              ))
            ) : (
              <p className="text-gray-500 text-center">No past events found.</p>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}