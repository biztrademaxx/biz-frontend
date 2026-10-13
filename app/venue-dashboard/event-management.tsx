"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useVenueDashboardVenueUserId } from "@/contexts/venue-dashboard-venue-id"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { venueTabsList, venueTabsScrollWrapper, venueTabsTrigger } from "./venue-dashboard-theme"
import { Button } from "@/components/ui/button"
import { CalendarIcon, MapPin, Users, Building, Plus, MoreHorizontal } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { cn } from "@/lib/utils"
import { getEventDisplayImageFromRecord } from "@/lib/default-event-image"

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

function formatEventLocation(event: Record<string, unknown>): string {
  const city = typeof event.city === "string" ? event.city.trim() : ""
  const country = typeof event.country === "string" ? event.country.trim() : ""
  const isVirtual = event.isVirtual === true
  if (isVirtual && !city && !country) return "Online"
  const parts = [city, country].filter((p) => p.length > 0)
  if (parts.length > 0) return parts.join(", ")
  const tz = typeof event.timezone === "string" ? event.timezone.trim() : ""
  return tz.length > 0 ? tz : "—"
}

export default function EventManagement() {
  const resolvedVenueUserId = useVenueDashboardVenueUserId()
  const [activeTab, setActiveTab] = useState("upcoming")
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!resolvedVenueUserId) return
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const data = await apiFetch<{ success: boolean; data?: any[]; events?: any[] }>(
          `/api/venues/${resolvedVenueUserId}/events`,
          { auth: true }
        )
        if (data.success) setEvents(data.events ?? data.data ?? [])
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [resolvedVenueUserId])

  const now = new Date()
  const upcomingEvents = events.filter((e) => new Date(e.endDate) >= now)
  const pastEvents = events.filter((e) => new Date(e.endDate) < now)

  const getStatusBadgeClass = (status: unknown) => {
    const s = (typeof status === "string" ? status : "").toUpperCase().replace(/-/g, "_")
    if (["PUBLISHED", "CONFIRMED", "LIVE", "APPROVED", "ONGOING"].some((k) => s.includes(k)))
      return "bg-[#DCFCE7] text-[#16A34A] border-0"
    if (["DRAFT", "PENDING", "SCHEDULED"].some((k) => s.includes(k)))
      return "bg-[#FEF9C3] text-[#CA8A04] border-0"
    if (["CANCELLED", "CANCELED", "REJECTED"].some((k) => s.includes(k)))
      return "bg-[#FEE2E2] text-[#DC2626] border-0"
    if (["COMPLETED", "ENDED", "CLOSED"].some((k) => s.includes(k)))
      return "bg-[#dbeafe] text-[#7C3AED] border-0"
    return "bg-[#F1F5F9] text-[#64748B] border-0"
  }

  const shortDate = (d: string | undefined) => {
    if (!d) return "—"
    try { return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) }
    catch { return "—" }
  }

  const getEventKey = (event: any, index: number) =>
    event.id || event._id || event.eventId || `${event.title || "event"}-${event.startDate || "no-date"}-${index}`

  const EventCard = ({ event }: { event: Record<string, unknown> }) => {
    const title = typeof event.title === "string" ? event.title : "Event"
    const imgSrc = getEventDisplayImageFromRecord(event)
    const startDate = typeof event.startDate === "string" ? event.startDate : undefined
    const endDate = typeof event.endDate === "string" ? event.endDate : undefined
    const locationLabel = formatEventLocation(event)
    const attendees = typeof event.currentAttendees === "number" ? event.currentAttendees : Number(event.currentAttendees) || 0
    const price = typeof event.basePrice === "number" ? event.basePrice : typeof event.price === "number" ? event.price : null
    const currency = typeof event.currency === "string" ? event.currency : "₹"

    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:shadow-md hover:border-[#C7D2FE] transition-all duration-200 group">
        {/* Image */}
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={imgSrc}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, 320px"
            unoptimized={imgSrc.startsWith("http")}
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-[11px] font-medium text-[#004A96] mb-1">{formatCategory(event.category)}</p>
          <h3 className="text-sm font-semibold text-[#1E293B] leading-snug line-clamp-2 mb-2">{title}</h3>

          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <CalendarIcon className="w-3.5 h-3.5 text-[#004A96] shrink-0" />
              <span>{shortDate(startDate)} – {shortDate(endDate)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <MapPin className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
              <span className="truncate">{locationLabel}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-[#64748B]">
                <Users className="w-3.5 h-3.5" />
                <span>{attendees}</span>
              </div>
              {price !== null && (
                <div className="flex items-center gap-1 text-xs text-[#64748B]">
                  <span>💰</span>
                  <span>{currency}{price.toLocaleString()}</span>
                </div>
              )}
            </div>
            <Badge className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", getStatusBadgeClass(event.status))}>
              {formatStatus(event.status)}
            </Badge>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1E293B] sm:text-2xl">Event Management</h1>
        <p className="text-sm text-[#64748B] mt-0.5">Manage and organize your venue events</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden animate-pulse">
              <div className="h-40 bg-[#F1F5F9]" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-[#F1F5F9] rounded w-1/3" />
                <div className="h-4 bg-[#F1F5F9] rounded w-3/4" />
                <div className="h-3 bg-[#F1F5F9] rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0">
          <div className={venueTabsScrollWrapper}>
            <TabsList className={cn(venueTabsList, "mb-0")}>
              <TabsTrigger value="upcoming" className={venueTabsTrigger}>
                <span className="sm:hidden">Upcoming</span>
                <span className="hidden sm:inline">Upcoming Events</span>
                {upcomingEvents.length > 0 && (
                  <span className="ml-1.5 bg-[#004A96] text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {upcomingEvents.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="past" className={venueTabsTrigger}>
                Past Events
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="mb-5" />

          <TabsContent value="upcoming">
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {upcomingEvents.map((event, index) => (
                  <EventCard key={getEventKey(event, index)} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#E2E8F0]">
                <CalendarIcon className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
                <p className="text-base font-semibold text-[#94A3B8]">No upcoming events</p>
                <p className="text-sm text-[#CBD5E1] mt-1">Events scheduled for future dates will appear here</p>
                {/* <Button className="mt-4 rounded-xl bg-[#004A96] text-white">
                  <Plus className="w-4 h-4 mr-1" />Add Event
                </Button> */}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 opacity-90">
                {pastEvents.map((event, index) => (
                  <EventCard key={getEventKey(event, index)} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#E2E8F0]">
                <CalendarIcon className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
                <p className="text-base font-semibold text-[#94A3B8]">No past events</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}