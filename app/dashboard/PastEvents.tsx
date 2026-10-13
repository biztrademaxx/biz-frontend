"use client"


import { devLog } from "@/lib/dev-log"

import { AppImage } from "@/components/app-image"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Calendar as CalendarIcon, MapPin } from "lucide-react"
import { Event } from "./events-section" // reusing Event type
import { TicketType } from "@prisma/client"
import { apiFetch, getCurrentUserId } from "@/lib/api"
import {
  DEFAULT_EVENT_IMAGE,
  eventCardImageClassName,
  eventUsesWatermarkImage,
  getEventDisplayImageUrl,
} from "@/lib/default-event-image"
import { cn } from "@/lib/utils"

/* ---------- Helpers ---------- */
const DEFAULT_ADDRESS = "Address not specified"

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

// Dot color
const timelineDotClass = (leadType?: string) => {
  if (!leadType) return "bg-gray-400"
  if (leadType === "exhibitor") return "bg-green-600"
  if (leadType === "visitor") return "bg-blue-600"
  return "bg-gray-600"
}

// Status pill
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

const formatTicketPrice = (ticketTypes: TicketType[]) => {
  if (!ticketTypes || ticketTypes.length === 0) return "Free"

  const allPricesZero = ticketTypes.every(
    (t) => !Number.isFinite(Number(t.price)) || Number(t.price) <= 0,
  )
  if (allPricesZero) return "Free"

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

// Helper function to get address with fallback
const getEventLocation = (event: Event) => {
  const country =
    event.venue?.venueCountry ||
    ""

  if (event.city && country) {
    return `${event.city}, ${country}`
  }

  if (event.city) {
    return event.city
  }

  return "Location TBD"
}

/* ---------- Component ---------- */
interface PastEventsProps {
  userId?: string
}

export function PastEvents({ userId }: PastEventsProps) {
  const router = useRouter()
  const [pastEvents, setPastEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  const targetUserId = userId || (typeof window !== "undefined" ? getCurrentUserId() : null)

  useEffect(() => {
    if (!targetUserId) return
    fetchPastEvents()
  }, [targetUserId])

  const fetchPastEvents = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<{ events?: Event[]; data?: Event[] }>(`/api/users/${targetUserId}/interested-events`, { auth: true })

      const events: Event[] = data?.events ?? data?.data ?? []
      
      // Debug: Log all events and their dates
      devLog('=== DEBUG: All events from API ===')
      events.forEach((event, index) => {
        devLog(`${index + 1}. ${event.title}`)
        devLog(`   Start: ${event.startDate}`)
        devLog(`   End: ${event.endDate}`)
        devLog(`   End Date Object: ${new Date(event.endDate)}`)
        devLog(`   Today: ${new Date()}`)
        devLog(`   Is Past: ${new Date(event.endDate) < new Date()}`)
        devLog('---')
      })

      // Get today's date at start of day (midnight) for accurate comparison
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // Filter events that ended before today
      const pastOnly = events.filter((ev) => {
        if (!ev.endDate) return false
        
        // Create date object for event end date at start of day
        const eventEndDate = new Date(ev.endDate)
        eventEndDate.setHours(0, 0, 0, 0)
        
        return eventEndDate < today
      })

      devLog(`Filtered ${pastOnly.length} past events from ${events.length} total events`)

      setPastEvents(
        pastOnly.map((ev) => ({
          ...ev,
          startDate: ev.startDate ? new Date(ev.startDate).toISOString() : new Date().toISOString(),
          endDate: ev.endDate ? new Date(ev.endDate).toISOString() : new Date(ev.startDate || new Date()).toISOString(),
        }))
      )
    } catch (err) {
      console.error("Error fetching past events:", err)
      setPastEvents([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  if (!pastEvents.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 mb-4">No past events found.</p>
          <Button variant="outline" onClick={() => router.push("/event")}>
            Browse Events
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative ml-3 min-w-0 border-l-2 border-gray-200 sm:ml-6">
        {pastEvents.map((event) => {
          const showWatermark = eventUsesWatermarkImage(event)
          return (
          <div key={event.id} className="relative mb-10 ml-4 sm:ml-6">
            {/* Timeline Dot */}
            <span
              className={`absolute -left-[35px] flex items-center justify-center w-5 h-5 rounded-full ring-4 ring-white ${timelineDotClass(
                event.leadType
              )}`}
            />

            {/* Date Heading */}
            <p className="text-sm font-semibold text-gray-700 mb-3">
              {formatDate(event.startDate)} – {formatDate(event.endDate)}
            </p>

            {/* Event Card */}
           <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md sm:flex-row">
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
                   <span className="break-words">{getEventLocation(event)}</span>
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
                       {event.expectedExhibitors || event.maxAttendees || "200"}
                     </span>
                   </div>
                   <div className="flex justify-between gap-2">
                     <span className="text-gray-500">Exptd Exhibitors</span>
                     <span className="font-semibold text-gray-900">
                       {event.expectedExhibitors || "200"}
                     </span>
                   </div>
                 </div>
                 <div className="text-left sm:text-right">
                   <span className="text-xl font-bold text-pink-500">
                     {formatTicketPrice(event.ticketTypes as unknown as TicketType[])}
                   </span>
                   <span className="block text-sm text-gray-500">Entry Fee</span>
                 </div>
               </div>
             </div>
           </div>
          </div>
        )})}
      </div>
    </div>
  )
}

export default PastEvents