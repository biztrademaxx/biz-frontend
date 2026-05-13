"use client"

import { devLog } from "@/lib/dev-log"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Users, DollarSign, Search, TrendingUp } from "lucide-react"
import Image from "next/image"

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  city: string
  venueAddress: string
  eventType: string[]
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

export default function MyEvents({ organizerId }: MyEventsProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [timelineStatusFilter, setTimelineStatusFilter] = useState("all")
  const [publicationStatusFilter, setPublicationStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const defaultImage = "/city/c4.jpg"

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
      const matchesSearch =
        !searchTerm ||
        [event.title, event.description, event.location, event.city, event.venueAddress].some((field) =>
          field?.toLowerCase().includes(searchTerm.toLowerCase()),
        )

      const matchesTimeline = timelineStatusFilter === "all" || event.timelineStatus === timelineStatusFilter
      const matchesPublication = publicationStatusFilter === "all" || event.status === publicationStatusFilter
      const matchesType =
        typeFilter === "all" ||
        (Array.isArray(event.eventType) &&
          event.eventType.some((type) => type?.toLowerCase() === typeFilter.toLowerCase()))

      return matchesSearch && matchesTimeline && matchesPublication && matchesType
    })

    setFilteredEvents(filtered)
  }, [events, searchTerm, timelineStatusFilter, publicationStatusFilter, typeFilter])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
  }

  // Timeline Status Labels and Colors
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
      ongoing: { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
      past: { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" },
    }
    const color = colors[status] || colors.past
    return { bg: color.bg, text: color.text, border: color.border }
  }

  // Publication Status Labels and Colors (Approved/Rejected/Pending etc.)
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
      draft: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
      published: { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
      cancelled: { bg: "#FEF2F2", text: "#991B1B", border: "#FECACA" },
      archived: { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" },
      approved: { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
      rejected: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
      pending: { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" },
    }
    const color = colors[status] || colors.draft
    return { bg: color.bg, text: color.text, border: color.border }
  }

  const getLeadTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ATTENDEE: "Attendee",
      EXHIBITOR: "Exhibitor",
      SPEAKER: "Speaker",
      SPONSOR: "Sponsor",
      PARTNER: "Partner",
    }
    return labels[type] || type
  }

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

    if (now < start) {
      return "upcoming"
    } else if (now >= start && now <= end) {
      return "ongoing"
    } else {
      return "past"
    }
  }

  // Get the best image to display
  const getEventImage = (event: Event) => {
    if (event.bannerImage && event.bannerImage !== "") return event.bannerImage
    if (event.thumbnailImage && event.thumbnailImage !== "") return event.thumbnailImage
    if (event.images && event.images.length > 0 && event.images[0] !== "") return event.images[0]
    return defaultImage
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by type" />
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
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700 self-center">Timeline Status:</span>
              {["all", "upcoming", "ongoing", "past"].map((status) => (
                <Button
                  key={status}
                  variant={timelineStatusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimelineStatusFilter(status as typeof timelineStatusFilter)}
                >
                  {status === "all" ? "All Timeline" : getTimelineStatusLabel(status)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading events...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {!loading && !error && filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No events found</p>
        </div>
      )}

      {/* Events List - two cards per row */}
      {!loading && !error && filteredEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((event: any) => {
            const timelineColors = getTimelineStatusColor(event.timelineStatus)
            const publicationColors = getPublicationStatusColor(event.status)
            const eventImage = getEventImage(event)

            return (
              <Card
                key={event.id}
                onClick={() => router.push(`/event-dashboard/${event.slug || event.id}`)}
                className="overflow-hidden p-0 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex flex-col h-full">
                  {/* Image Section - Smaller and Full Width */}
                  <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                    <Image
                      src={eventImage}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Overlay Gradient for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {/* Status Badges Positioned on Image */}
                    <div className="absolute top-3 right-3 z-10 flex gap-2">
                      {/* Timeline Status Badge */}
                      <span
                        className="px-2.5 py-1 text-xs font-medium rounded-full shadow-sm"
                        style={{
                          backgroundColor: timelineColors.bg,
                          color: timelineColors.text,
                          border: `1px solid ${timelineColors.border}`,
                        }}
                      >
                        {getTimelineStatusLabel(event.timelineStatus)}
                      </span>
                    </div>

                    {/* Publication Status Badge - Bottom Left */}
                    <div className="absolute bottom-3 left-3 z-10">
                      <span
                        className="px-2.5 py-1 text-xs font-medium rounded-full shadow-sm"
                        style={{
                          backgroundColor: publicationColors.bg,
                          color: publicationColors.text,
                          border: `1px solid ${publicationColors.border}`,
                        }}
                      >
                        {getPublicationStatusLabel(event.status)}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <CardContent className="flex-1 p-5 bg-white">
                    <div className="flex flex-col justify-between h-full">
                      <div className="space-y-3">
                        {/* Title */}
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1 hover:text-blue-600 transition-colors">
                          {event.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {event.description}
                        </p>

                        {/* Event Details */}
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-xs">
                              {formatDate(event.startDate)} - {formatDate(event.endDate)}
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
                        </div>
                      </div>

                      {/* Bottom Badges */}
                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                          {Array.isArray(event.eventType) && event.eventType.length > 0
                            ? event.eventType[0]
                            : "Event"}
                        </span>

                        {/* View Details Link */}
                        <span className="text-xs text-blue-600 hover:text-blue-700 font-medium">
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
      )}
    </div>
  )
}