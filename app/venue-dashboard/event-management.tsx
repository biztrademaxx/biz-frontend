"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  CalendarIcon,
  MapPin,
  Users,
  Phone,
  Mail,
  Building,
  Clock,
  Search,
  Download,
  Eye,
  MessageSquare,
} from "lucide-react"
import { apiFetch } from "@/lib/api"

export default function EventManagement() {
  const { id: venueId } = useParams() // 👈 get venueId from the URL (like /venue-dashboard/[id])
  const [activeTab, setActiveTab] = useState("upcoming")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch events from API
  useEffect(() => {
    if (!venueId) return

    const fetchEvents = async () => {
      try {
        setLoading(true)
        const data = await apiFetch<{ success: boolean; data?: any[]; events?: any[] }>(
          `/api/venues/${venueId}/events`,
          { auth: true },
        )

        if (data.success) {
          // Support both { data: [...] } and { events: [...] } shapes
          setEvents(data.data || data.events || [])
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
  }, [venueId])

  // Filter upcoming & past events
  const now = new Date()
  const upcomingEvents = events.filter((e) => new Date(e.startDate) > now)
  const pastEvents = events.filter((e) => new Date(e.endDate) < now)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
      case "PUBLISHED":
        return "bg-green-500"
      case "Pending Confirmation":
        return "bg-yellow-500"
      case "Completed":
        return "bg-blue-500"
      case "Cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
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

  const EventCard = ({ event, isPast = false }: { event: any; isPast?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                {event.category || "N/A"}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Organizer ID: {event.organizerId}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Start Date</span>
            </div>
            <p className="text-gray-600">{new Date(event.startDate).toLocaleDateString()}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-green-500" />
              <span className="font-medium">End Date</span>
            </div>
            <p className="text-gray-600">{new Date(event.endDate).toLocaleDateString()}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-purple-500" />
              <span className="font-medium">Timezone</span>
            </div>
            <p className="text-gray-600">{event.timezone || "Asia/Kolkata"}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-orange-500" />
              <span className="font-medium">Attendees</span>
            </div>
            <p className="text-gray-600">{event.currentAttendees || 0} people</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <Eye className="w-4 h-4" />
            View Details
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <MessageSquare className="w-4 h-4" />
            Contact Organizer
          </Button>
        </div>
      </CardContent>
    </Card>
  )

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