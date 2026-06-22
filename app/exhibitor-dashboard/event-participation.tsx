"use client"


import { devLog } from "@/lib/dev-log"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { EVENT_VENUE_LOCATION_PENDING } from "@/lib/event-location-copy"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  Calendar,
  MapPin,
  Download,
  CreditCard,
  FileText,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Building,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { exGlassCard, exTabsList, exTabsScrollWrapper, exTabsTriggerActive, exBtnPrimary, exPageTitle } from "./dashboard-theme"

interface EventParticipationProps {
  exhibitorId: string
}

interface Booth {
  id: string
  eventId: string
  exhibitorId: string
  spaceId: string
  spaceReference: string
  boothNumber: string
  companyName: string
  description: string
  additionalPower: number
  compressedAir: number
  setupRequirements: {
    requirements: string
  }
  specialRequests: string
  totalCost: number
  currency: string
  status: string
  createdAt: string
  updatedAt: string
  exhibitor: any
  event: {
    id: string
    title: string
    description: string
    shortDescription: string
    slug: string
    status: string
    category: string
    startDate: string
    endDate: string
    registrationStart: string
    registrationEnd: string
    timezone: string
    venueId: string
    isVirtual: boolean
    maxAttendees: number | null
    currentAttendees: number
    currency: string
    organizer: {
      id: string
      firstName: string
      lastName: string
      company: string
    }
    venue: {
      id: string
      venueName: string
      venueDescription: string
      venueAddress: string
    }
  }
}

/** Matches GET /api/exhibitors/[id]/events nested `event.venue` select. */
interface EventVenueInfo {
  venueName: string
  venueAddress: string
  venueCity: string
  venueState: string
  venueCountry: string
  venueZipCode: string
}

function formatEventVenue(venue: string | EventVenueInfo | null | undefined): string {
  if (venue == null) return EVENT_VENUE_LOCATION_PENDING
  if (typeof venue === "string") return venue.trim() || EVENT_VENUE_LOCATION_PENDING
  const parts = [
    venue.venueName,
    venue.venueAddress,
    [venue.venueCity, venue.venueState].filter(Boolean).join(", "),
    venue.venueCountry,
    venue.venueZipCode,
  ]
    .map((p) => (typeof p === "string" ? p.trim() : ""))
    .filter(Boolean)
  return parts.length ? parts.join(" · ") : EVENT_VENUE_LOCATION_PENDING
}

interface Event {
  id: string
  eventId: string
  eventName: string
  date: string
  endDate: string
  venue: string | EventVenueInfo | null
  boothSize: string
  boothNumber: string
  paymentStatus: string
  setupTime?: string
  dismantleTime?: string
  passes: number
  passesUsed: number
  invoiceAmount: number
  status: string
  specialRequests?: string
  currency: string
  organizer?: {
    id: string
    firstName: string
    lastName: string
    company: string
  }
  // Add raw date fields for proper comparison
  rawStartDate: string
  rawEndDate: string
}

export default function EventParticipation({ exhibitorId }: EventParticipationProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("upcoming")
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (exhibitorId && exhibitorId !== "undefined") {
      fetchEvents()
    }
  }, [exhibitorId])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiFetch<{ success?: boolean; events?: Event[] }>(
        `/api/exhibitors/${exhibitorId}/events`
      )

      const list = Array.isArray(data?.events) ? (data.events as Event[]) : []
      setEvents(list)
    } catch (err) {
      console.error("Error fetching events:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      toast({
        title: "Error",
        description: "Failed to load events. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Get current date for comparison (UTC to avoid timezone issues)
  const currentDate = new Date()
  devLog("EventParticipation - Current date:", currentDate.toISOString())

  // Upcoming events: events that haven't ended yet
  const upcomingEvents = events.filter((event) => {
    try {
      const eventEndDate = new Date(event.rawEndDate)
      const isUpcoming = eventEndDate > currentDate
      devLog(`Event: ${event.eventName}, Raw End: ${event.rawEndDate}, Parsed End: ${eventEndDate.toISOString()}, Is Upcoming: ${isUpcoming}`)
      return isUpcoming
    } catch (error) {
      console.error(`Error parsing date for event ${event.eventName}:`, error)
      return false
    }
  })

  // Past events: events that have ended
  const pastEvents = events.filter((event) => {
    try {
      const eventEndDate = new Date(event.rawEndDate)
      const isPast = eventEndDate <= currentDate
      devLog(`Event: ${event.eventName}, Raw End: ${event.rawEndDate}, Parsed End: ${eventEndDate.toISOString()}, Is Past: ${isPast}`)
      return isPast
    } catch (error) {
      console.error(`Error parsing date for event ${event.eventName}:`, error)
      return false
    }
  })

  devLog("EventParticipation - All events:", events.length)
  devLog("EventParticipation - Upcoming events:", upcomingEvents.length)
  devLog("EventParticipation - Past events:", pastEvents.length)
  devLog("EventParticipation - Upcoming events names:", upcomingEvents.map(e => e.eventName))
  devLog("EventParticipation - Past events names:", pastEvents.map(e => e.eventName))

  const EventCard = ({ event, isPast = false }: { event: Event; isPast?: boolean }) => (
    <Card className={cn(exGlassCard, "min-w-0 overflow-hidden")}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold mb-2 break-words sm:text-lg">{event.eventName}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {event.date} - {event.endDate}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="line-clamp-2">{formatEventVenue(event.venue)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Booth: {event.boothNumber} ({event.boothSize})
              </div>
            </div>
          </div>
          <Badge
            variant={event.paymentStatus === "PAID" ? "default" : "destructive"}
            className={cn("w-fit shrink-0", event.paymentStatus === "PAID" ? "bg-green-500" : "")}
          >
            {event.paymentStatus === "PAID" ? (
              <CheckCircle className="w-3 h-3 mr-1" />
            ) : (
              <AlertCircle className="w-3 h-3 mr-1" />
            )}
            {event.paymentStatus}
          </Badge>
        </div>

        {!isPast && event.setupTime && event.dismantleTime && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#004A96]" />
                <span className="font-medium">Setup:</span>
              </div>
              <p className="text-gray-600 ml-6">{event.setupTime}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" />
                <span className="font-medium">Dismantle:</span>
              </div>
              <p className="text-gray-600 ml-6">{event.dismantleTime}</p>
            </div>
          </div>
        )}

        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
          <div className="text-center rounded-lg bg-[#004A96]/10 p-3">
            <div className="font-semibold text-[#004A96]">{event.passes}</div>
            <div className="text-gray-600">Total Passes</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="font-semibold text-green-600">{event.passesUsed}</div>
            <div className="text-gray-600">Used Passes</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="font-semibold text-[#004A96]">
              {event.currency === "USD" ? "$" : "₹"}{event.invoiceAmount}
            </div>
            <div className="text-gray-600">Invoice Amount</div>
          </div>
          {isPast && (
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="font-semibold text-orange-600">45</div>
              <div className="text-gray-600">Leads Generated</div>
            </div>
          )}
        </div> */}

        {event.specialRequests && (
          <div className="mb-4 rounded-lg border border-white/60 bg-white/40 p-3 backdrop-blur-sm">
            <p className="text-sm font-medium text-gray-700 mb-1">Special Requests:</p>
            <p className="text-sm text-gray-600">{event.specialRequests}</p>
          </div>
        )}

      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button className={exBtnPrimary} onClick={fetchEvents}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h1 className={exPageTitle}>Event Participation</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0 space-y-6">
        <div className={exTabsScrollWrapper}>
          <TabsList className={cn(exTabsList, "mb-0")}>
            <TabsTrigger value="upcoming" className={exTabsTriggerActive}>
              <span className="sm:hidden">Upcoming ({upcomingEvents.length})</span>
              <span className="hidden sm:inline">Upcoming Events ({upcomingEvents.length})</span>
            </TabsTrigger>
            <TabsTrigger value="past" className={exTabsTriggerActive}>
              <span className="sm:hidden">Past ({pastEvents.length})</span>
              <span className="hidden sm:inline">Past Events ({pastEvents.length})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <Card className={exGlassCard}>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No upcoming events</h3>
                <p className="text-gray-500">Register for events to see them here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastEvents.length > 0 ? (
            pastEvents.map((event) => <EventCard key={event.id} event={event} isPast={true} />)
          ) : (
            <Card className={exGlassCard}>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No past events</h3>
                <p className="text-gray-500">Your completed events will appear here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}