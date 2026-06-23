"use client"

import { devLog } from "@/lib/dev-log"

import { useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Search, TrendingUp, Tag, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { getEventDisplayImageUrl } from "@/lib/default-event-image"

interface Event {
  slug: string
  subTitle: ReactNode
  id: string
  title: string
  shortTitle: string
  description: string
  startDate: string
  endDate: string
  location: string
  city: string
  venueAddress: string
  eventType: string[]
  category?: string[]
  images: string[]
  bannerImage?: string
  thumbnailImage?: string
  tags: string[]
  timelineStatus?: "upcoming" | "ongoing" | "past"
  status: "draft" | "published" | "cancelled" | "archived" | "approved" | "rejected" | "pending"
  attendees?: number
  registrations?: number
  leads?: number
  leadCounts?: {
    ATTENDEE: number
    EXHIBITOR: number
    SPEAKER: number
    SPONSOR: number
    PARTNER: number
  }
  revenue?: number
  maxAttendees?: number
  isPublic?: boolean
  currency?: string
}

interface MyEventsProps {
  organizerId: string
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0)
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()]
  }
  return []
}

function getPrimaryEventType(eventType: unknown): string {
  const types = asStringArray(eventType)
  return types[0] || "Event"
}

// Pagination: 6 events per page (3 columns x 2 rows)
const EVENTS_PER_PAGE = 6

export default function MyEvents({ organizerId }: MyEventsProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [timelineStatusFilter, setTimelineStatusFilter] = useState("all")
  const [publicationStatusFilter, setPublicationStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        setError(null)
        devLog("[v0] Fetching events for organizer:", organizerId)

        const data = await apiFetch<{ success?: boolean; events?: Event[]; error?: string }>(
          `/api/organizers/${organizerId}/events?page=1&limit=100`,
          { auth: true },
        )
        devLog("[v0] Fetched events data:", data)

        if (data.events && Array.isArray(data.events)) {
          devLog("[v0] Setting events:", data.events.length)
          const eventsWithStatus = data.events.map((event: Event) => ({
            ...event,
            timelineStatus: calculateTimelineStatus(event.startDate, event.endDate),
          }))
          setEvents(eventsWithStatus)
        } else {
          throw new Error("Invalid response format")
        }
      } catch (err) {
        console.error("[v0] Error fetching events:", err)
        setError(err instanceof Error ? err.message : "Failed to load events")
      } finally {
        setLoading(false)
      }
    }

    if (organizerId) {
      fetchEvents()
    }
  }, [organizerId])

  useEffect(() => {
    const filtered = events.filter((event) => {
      const categoryLabels = asStringArray(event.category)
      const matchesSearch =
        !searchTerm ||
        [
          event.title,
          event.description,
          event.location,
          event.city,
          event.venueAddress,
          ...asStringArray(event.eventType),
          ...categoryLabels,
        ].some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesTimeline = timelineStatusFilter === "all" || event.timelineStatus === timelineStatusFilter
      const matchesPublication = publicationStatusFilter === "all" || event.status === publicationStatusFilter
      const matchesType =
        typeFilter === "all" ||
        (Array.isArray(event.eventType) &&
          event.eventType.some((type) => type?.toLowerCase() === typeFilter.toLowerCase()))

      return matchesSearch && matchesTimeline && matchesPublication && matchesType
    })

    setFilteredEvents(filtered)
    setCurrentPage(1)
  }, [events, searchTerm, timelineStatusFilter, publicationStatusFilter, typeFilter])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  // kept for potential future use
  // const formatCurrency = (amount: number, currency = "USD") => {
  //   return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
  // }

  const getTimelineStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      upcoming: "Upcoming",
      ongoing: "Ongoing",
      past: "Past",
    }
    return labels[status] || status
  }

  const getTimelineStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      upcoming: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
      ongoing:  { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
      past:     { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" },
    }
    return colors[status] || colors.past
  }

  const getPublicationStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Draft",
      published: "Published",
      cancelled: "Cancelled",
      archived: "Archived",
      approved: "Approved",
      rejected: "Rejected",
      pending: "Pending Review",
    }
    return labels[status] || status
  }

  const getPublicationStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      draft:     { bg: "#FEF3C7", text: "#92400E",  border: "#FDE68A" },
      published: { bg: "#ECFDF5", text: "#065F46",  border: "#A7F3D0" },
      cancelled: { bg: "#FEF2F2", text: "#991B1B",  border: "#FECACA" },
      archived:  { bg: "#F3F4F6", text: "#6B7280",  border: "#E5E7EB" },
      // Light green bg + dark green text (matches design "Approved" pill)
      // OLD: approved: { bg: "#166534", text: "#FFFFFF", border: "#166534" },
      approved:  { bg: "#DCFCE7", text: "#166534",  border: "#BBF7D0" },
      rejected:  { bg: "#FEF2F2", text: "#DC2626",  border: "#FECACA" },
      pending:   { bg: "#FEF9C3", text: "#A16207",  border: "#FEF08A" },
    }
    return colors[status] || colors.draft
  }

  // kept for potential future use
  // const getLeadTypeLabel = (type: string) => {
  //   const labels: Record<string, string> = {
  //     ATTENDEE: "Attendee",
  //     EXHIBITOR: "Exhibitor",
  //     SPEAKER: "Speaker",
  //     SPONSOR: "Sponsor",
  //     PARTNER: "Partner",
  //   }
  //   return labels[type] || type
  // }

  const uniqueTypes = [
    ...new Set(
      events
        .flatMap((event) => event.eventType || [])
        .filter((type): type is string => typeof type === "string" && type.length > 0),
    ),
  ]

  const calculateTimelineStatus = (startDate: string, endDate: string): "upcoming" | "ongoing" | "past" => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (now < start) return "upcoming"
    if (now >= start && now <= end) return "ongoing"
    return "past"
  }

  const getEventImage = (event: Event) => getEventDisplayImageUrl(event)

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE)
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * EVENTS_PER_PAGE,
    currentPage * EVENTS_PER_PAGE,
  )

  const getPageNumbers = () => {
    const maxVisible = 3
    let start = Math.max(1, currentPage - 1)
    const end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)
    const pages: number[] = []
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  return (
    // Outer wrapper — white background, no card border (matches design: content sits on plain white bg)
    <div className="space-y-4 bg-white rounded-xl p-6">

      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and track your events all in one place.</p>
      </div>

      {/* Filter section — sits inside same white container, with its own border */}
      <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">

        {/* Row 1: Search + Type dropdown + Filter icon */}
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200 bg-white"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px] border-gray-200">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueTypes.map((type) => (
                <SelectItem key={type} value={type.toLowerCase()}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 border-gray-200 text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Row 2: Timeline Status filter buttons */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-sm font-medium text-gray-600">Timeline Status:</span>
          {["all", "upcoming", "ongoing", "past"].map((status) => (
            <Button
              key={status}
              size="sm"
              onClick={() => setTimelineStatusFilter(status)}
              className={
                timelineStatusFilter === status
                  ? "bg-[#0F172A] text-white hover:bg-[#1E293B] border-[#0F172A] rounded-full px-4 text-sm"
                  : "border border-gray-200 text-gray-700 hover:bg-gray-50 bg-white rounded-full px-4 text-sm"
              }
            >
              {status === "all" ? "All Timeline" : getTimelineStatusLabel(status)}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading events...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No events found</p>
        </div>
      )}

      {/* Events Grid + Pagination */}
      {!loading && !error && filteredEvents.length > 0 && (
        <div>
          {/* 3-column grid matching design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedEvents.map((event: Event) => {
              const timelineColors = getTimelineStatusColor(event.timelineStatus ?? "past")
              const publicationColors = getPublicationStatusColor(event.status)
              const eventImage = getEventImage(event)
              const eventTypeLabel = getPrimaryEventType(event.eventType)
              const categoryLabels = asStringArray(event.category)
              const visibleCategories = categoryLabels.slice(0, 2)
              const hiddenCategoryCount = Math.max(0, categoryLabels.length - visibleCategories.length)

              return (
                <Card
                  key={event.id}
                  onClick={() => router.push(`/event-dashboard/${event.slug || event.id}`)}
                  className="overflow-hidden p-0 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex flex-col h-full">

                    {/* Card image section */}
                    <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                      <Image
                        src={eventImage}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {/* Publication status badge — top left */}
                      <div className="absolute top-3 left-3 z-10">
                        <span
                          className="px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm"
                          style={{
                            backgroundColor: publicationColors.bg,
                            color: publicationColors.text,
                            border: `1px solid ${publicationColors.border}`,
                          }}
                        >
                          {getPublicationStatusLabel(event.status)}
                        </span>
                      </div>

                      {/* Timeline status badge — top right */}
                      {event.timelineStatus && (
                        <div className="absolute top-3 right-3 z-10">
                          <span
                            className="px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm"
                            style={{
                              backgroundColor: timelineColors.bg,
                              color: timelineColors.text,
                              border: `1px solid ${timelineColors.border}`,
                            }}
                          >
                            {getTimelineStatusLabel(event.timelineStatus)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card content */}
                    <CardContent className="flex-1 p-5 bg-white">
                      <div className="flex flex-col justify-between h-full">
                        <div className="space-y-3">
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-1 hover:text-[#004A96] transition-colors">
                            {event.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-1 leading-relaxed">
                            {event.description}
                          </p>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-xs">
                                {formatDate(event.startDate)} – {formatDate(event.endDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-xs line-clamp-1">
                                {event.venueAddress || event.location}
                                {event.city && `, ${event.city}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-xs font-medium text-gray-800">
                                {event.leads || 0} leads
                              </span>
                            </div>
                            {visibleCategories.map((label) => (
                              <span
                                key={`footer-${label}`}
                                className="max-w-[8.5rem] truncate rounded-full border border-[#004A96]/20 bg-[#004A96]/5 px-2 py-1 text-xs font-medium text-[#004A96]"
                              >
                                {label}
                              </span>
                            ))}
                            {hiddenCategoryCount > 0 && (
                              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                                +{hiddenCategoryCount}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Footer: type + category pills + View Details */}
                        <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-gray-100">
                          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                              {eventTypeLabel}
                            </span>
                            
                          </div>
                          <span className="shrink-0 text-xs font-medium text-[#004A96] group-hover:text-[#003d7a]">
                            View Details →
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-gray-200 text-gray-500 hover:text-gray-700"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {getPageNumbers().map((page) => (
                <Button
                  key={page}
                  size="icon"
                  className={`h-9 w-9 text-sm font-medium ${
                    currentPage === page
                      ? "bg-[#004A96] text-white border-[#004A96] hover:bg-[#003d7a]"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-50 bg-white"
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-gray-200 text-gray-500 hover:text-gray-700"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}