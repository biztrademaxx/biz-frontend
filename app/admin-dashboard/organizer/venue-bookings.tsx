"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Building2,
  Calendar,
  DollarSign,
  Eye,
  MapPin,
  Search,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface VenueBooking {
  id: string
  venue: {
    id: string
    firstName: string
    lastName: string
    venueName: string
    venueAddress: string
    venueCity: string
  }
  startDate: string
  endDate: string
  totalAmount: number
  currency: string
  status: string
  purpose: string
  specialRequests: string
  meetingSpacesInterested: string[]
  createdAt: string
}

export default function OrganizerVenueBookingsPage() {
  const { toast } = useToast()
  const [bookings, setBookings] = useState<VenueBooking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<VenueBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<VenueBooking | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchQuery, statusFilter, bookings])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const json = await apiFetch<{ data?: VenueBooking[]; success?: boolean }>(
        "/api/admin/organizers/venue-bookings",
        { auth: true },
      )
      const list = Array.isArray(json?.data) ? json.data : []

      setBookings(list)
      setFilteredBookings(list)
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }


  const applyFilters = () => {
    let filtered = [...bookings]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (booking) =>
          (booking.venue?.venueName ?? "").toLowerCase().includes(q) ||
          (booking.venue?.venueCity ?? "").toLowerCase().includes(q) ||
          booking.id.toLowerCase().includes(q),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter)
    }

    setFilteredBookings(filtered)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any; label: string }> = {
      PENDING: { variant: "secondary", icon: Clock, label: "Pending" },
      CONFIRMED: { variant: "default", icon: CheckCircle2, label: "Confirmed" },
      CANCELLED: { variant: "destructive", icon: XCircle, label: "Cancelled" },
      COMPLETED: { variant: "outline", icon: CheckCircle2, label: "Completed" },
      REFUNDED: { variant: "outline", icon: XCircle, label: "Refunded" },
      PARTIALLY_REFUNDED: { variant: "outline", icon: XCircle, label: "Partially Refunded" },
    }

    const config = statusConfig[status] || statusConfig.PENDING
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const calculateStats = () => {
    const total = bookings.length
    const pending = bookings.filter((b) => b.status === "PENDING").length
    const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length
    const completed = bookings.filter((b) => b.status === "COMPLETED").length
    const totalRevenue = bookings
      .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
      .reduce((sum, b) => sum + b.totalAmount, 0)

    return { total, pending, confirmed, completed, totalRevenue }
  }

  const stats = calculateStats()

  const handleViewDetails = (booking: VenueBooking) => {
    setSelectedBooking(booking)
    setDetailsOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Venue Bookings</h1>
        <p className="text-gray-600 mt-1">Manage organizer venue booking requests and reservations</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Building2 className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-600 mt-1">All time bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-gray-600 mt-1">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
            <p className="text-xs text-gray-600 mt-1">Active bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-gray-600 mt-1">Finished events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-600 mt-1">From bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Bookings</CardTitle>
          <CardDescription>Search and filter venue bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by venue name, city, or booking ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Venue Bookings</CardTitle>
          <CardDescription>
            Showing {filteredBookings.length} of {bookings.length} bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Booking Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Meeting Spaces</TableHead>
                  <TableHead>Booked On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No bookings found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono text-xs">{booking.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{booking.venue?.venueName}</p>
                            <p className="text-xs text-gray-500">
                              {booking.venue?.firstName} {booking.venue?.lastName}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {booking.venue?.venueCity}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{formatDate(booking.startDate)}</p>
                          <p className="text-xs text-gray-500">to {formatDate(booking.endDate)}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {booking.meetingSpacesInterested?.length ?? 0} spaces
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {formatDate(booking.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(booking)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
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

      {/* Booking Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>Complete information about the venue booking</DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Booking ID</p>
                  <p className="font-mono text-sm">{selectedBooking.id}</p>
                </div>
                {getStatusBadge(selectedBooking.status)}
              </div>

              {/* Venue Information */}
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Venue Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Venue Name</p>
                    <p className="font-medium">{selectedBooking.venue?.venueName ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Venue Manager</p>
                    <p className="font-medium">
                      {selectedBooking.venue?.firstName ?? ""} {selectedBooking.venue?.lastName ?? ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Address</p>
                    <p className="font-medium">{selectedBooking.venue?.venueAddress ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">City</p>
                    <p className="font-medium">{selectedBooking.venue?.venueCity ?? "—"}</p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Booking Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Start Date</p>
                    <p className="font-medium">{formatDate(selectedBooking.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">End Date</p>
                    <p className="font-medium">{formatDate(selectedBooking.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Amount</p>
                    <p className="font-medium text-lg">
                      {formatCurrency(selectedBooking.totalAmount, selectedBooking.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Booked On</p>
                    <p className="font-medium">{formatDate(selectedBooking.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Meeting Spaces */}
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold">Meeting Spaces Reserved</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedBooking.meetingSpacesInterested?.map((space, index) => (
                    <Badge key={index} variant="secondary">
                      {space}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Purpose and Requests */}
              {(selectedBooking.purpose || selectedBooking.specialRequests) && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold">Additional Information</h3>
                  {selectedBooking.purpose && (
                    <div>
                      <p className="text-sm text-gray-600">Purpose</p>
                      <p className="text-sm mt-1">{selectedBooking.purpose}</p>
                    </div>
                  )}
                  {selectedBooking.specialRequests && (
                    <div>
                      <p className="text-sm text-gray-600">Special Requests</p>
                      <p className="text-sm mt-1">{selectedBooking.specialRequests}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}