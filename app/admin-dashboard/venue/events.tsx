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
import { Pagination } from "@/app/admin-dashboard/shared/components/Pagination"

const PAGE_SIZE = 20

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

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface VenueEventsStats {
  totalVenues: number
  totalEvents: number
  activeEvents: number
}

export default function VenuesEventsPage() {
  const [venueEvents, setVenueEvents] = useState<VenueEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedVenue, setSelectedVenue] = useState<VenueEvent | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  })
  const [stats, setStats] = useState<VenueEventsStats>({
    totalVenues: 0,
    totalEvents: 0,
    activeEvents: 0,
  })

  const fetchVenueEvents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: String(PAGE_SIZE),
        ...(searchQuery.trim() && { search: searchQuery.trim() }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      })
      const result = await adminApi<{
        success?: boolean
        data?: VenueEvent[]
        pagination?: PaginationInfo
        stats?: VenueEventsStats
      }>(`/venue/venue-events?${params}`)

      setVenueEvents(result.data ?? [])
      setPagination(
        result.pagination ?? { page: pagination.page, limit: PAGE_SIZE, total: 0, totalPages: 0 }
      )
      if (result.stats) setStats(result.stats)
    } catch (error) {
      console.error("Error fetching venue events:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchVenueEvents()
  }, [pagination.page, statusFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page === 1) void fetchVenueEvents()
      else setPagination((p) => ({ ...p, page: 1 }))
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

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

  if (loading && venueEvents.length === 0) {
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Venues</CardTitle>
            <MapPin className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVenues}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
            <Calendar className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Events</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeEvents}</div>
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
          <div className="rounded-md border relative">
            {loading && venueEvents.length > 0 && (
              <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Venue Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Total Events</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Upcoming</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {venueEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No venue events found
                    </TableCell>
                  </TableRow>
                ) : (
                  venueEvents.map((venue) => (
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

          {pagination.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} venues
              </p>
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
              />
            </div>
          )}
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
