"use client"

import { useState, useEffect } from "react"
import { adminApi } from "@/lib/admin-api"
import { Search, Calendar, MapPin, Users, Eye, TrendingUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface VenueEvent {
  id: string
  venueName: string
  venueId: string
  venueEmail: string
  venuePhone: string
  venueCity: string
  totalEvents: number
  upcomingEvents: number
  completedEvents: number
  activeEvents: number
  totalRevenue: number
  averageRating: number
  totalReviews?: number
  events: Event[]
}

interface Event {
  id: string
  title: string
  status: string
  startDate: string
  endDate: string
  category: string[]
  attendees: number
  organizerName: string
  organizerEmail: string
}

export default function VenuesEventsPage() {
  const [venueEvents, setVenueEvents] = useState<VenueEvent[]>([])
  const [filteredData, setFilteredData] = useState<VenueEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedVenue, setSelectedVenue] = useState<VenueEvent | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    fetchVenueEvents()
  }, [])

  useEffect(() => {
    filterData()
  }, [searchQuery, statusFilter, venueEvents])

  const fetchVenueEvents = async () => {
    try {
      setLoading(true)
      const data = await adminApi<VenueEvent[]>("/venue/venue-events")
      const list = Array.isArray(data) ? data : []
      setVenueEvents(list)
      setFilteredData(list)
    } catch (error) {
      console.error("Error fetching venue events:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterData = () => {
    let filtered = venueEvents

    if (searchQuery) {
      filtered = filtered.filter(
        (venue) =>
          venue.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          venue.venueEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
          venue.venueCity?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((venue) => {
        if (statusFilter === "active") return venue.activeEvents > 0
        if (statusFilter === "upcoming") return venue.upcomingEvents > 0
        if (statusFilter === "completed") return venue.completedEvents > 0
        return true
      })
    }

    setFilteredData(filtered)
  }

  const handleViewDetails = (venue: VenueEvent) => {
    setSelectedVenue(venue)
    setIsDetailOpen(true)
  }

  const formatVenueRating = (venue: VenueEvent) => {
    const reviews = venue.totalReviews ?? 0
    const rating = Number(venue.averageRating ?? 0)
    if (reviews <= 0 || !Number.isFinite(rating)) return { label: "—" as const, sub: null as string | null }
    return { label: rating.toFixed(1), sub: `${reviews} review${reviews === 1 ? "" : "s"}` }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      PUBLISHED: { label: "Published", variant: "default" },
      DRAFT: { label: "Draft", variant: "secondary" },
      CANCELLED: { label: "Cancelled", variant: "destructive" },
      COMPLETED: { label: "Completed", variant: "outline" },
    }
    const config = statusMap[status] || { label: status, variant: "outline" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const totalStats = {
    totalVenues: venueEvents.length,
    totalEvents: venueEvents.reduce((sum, v) => sum + v.totalEvents, 0),
    activeEvents: venueEvents.reduce((sum, v) => sum + v.activeEvents, 0),
    totalRevenue: venueEvents.reduce((sum, v) => sum + v.totalRevenue, 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading venue events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Events by Venue</h1>
        <p className="text-gray-600 mt-2">Manage and view all events organized by venues</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Venues</CardTitle>
            <MapPin className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalVenues}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
            <Calendar className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Events</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalStats.activeEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${totalStats.totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by venue name, email, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Venues</SelectItem>
                <SelectItem value="active">Active Events</SelectItem>
                <SelectItem value="upcoming">Upcoming Events</SelectItem>
                <SelectItem value="completed">Completed Events</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Venue Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Total Events</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Upcoming</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No venue events found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((venue) => (
                    <TableRow key={venue.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{venue.venueName}</div>
                          <div className="text-sm text-gray-500">{venue.venueEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {venue.venueCity || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{venue.totalEvents}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{venue.activeEvents}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{venue.upcomingEvents}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{venue.completedEvents}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${venue.totalRevenue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const { label, sub } = formatVenueRating(venue)
                          return (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1">
                                {label !== "—" ? <span className="text-yellow-500">★</span> : null}
                                <span>{label}</span>
                              </div>
                              {sub ? <span className="text-xs text-muted-foreground">{sub}</span> : null}
                            </div>
                          )
                        })()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(venue)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Events
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Events at {selectedVenue?.venueName}</DialogTitle>
            <DialogDescription>
              Complete list of events hosted at this venue
            </DialogDescription>
          </DialogHeader>

          {selectedVenue && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Venue Name</p>
                  <p className="font-medium">{selectedVenue.venueName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact Email</p>
                  <p className="font-medium">{selectedVenue.venueEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{selectedVenue.venuePhone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{selectedVenue.venueCity || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="font-medium text-blue-600">
                    ${selectedVenue.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <p className="font-medium">
                    {(() => {
                      const { label, sub } = formatVenueRating(selectedVenue)
                      return (
                        <>
                          {label !== "—" ? <span className="text-yellow-500">★</span> : null}{" "}
                          {label}
                          {sub ? (
                            <span className="block text-xs text-muted-foreground font-normal">{sub}</span>
                          ) : null}
                        </>
                      )
                    })()}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Events ({selectedVenue.events.length})</h3>
                <div className="space-y-3">
                  {selectedVenue.events.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{event.title}</h4>
                            {getStatusBadge(event.status)}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {new Date(event.startDate).toLocaleDateString()} -{" "}
                                {new Date(event.endDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-3 h-3" />
                              <span>{event.attendees} attendees</span>
                            </div>
                            <div>
                              <span className="font-medium">Organizer:</span> {event.organizerName}{" "}
                              ({event.organizerEmail})
                            </div>
                            {event.category.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {event.category.map((cat, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {cat}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
