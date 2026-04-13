"use client"

import { useState, useEffect } from "react"
import { adminApi } from "@/lib/admin-api"
import { Search, Calendar, Clock, User, MapPin, CheckCircle, XCircle, Eye, Phone, Mail, Building } from 'lucide-react'
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface VenueBooking {
  id: string
  venueId: string
  venueName: string
  venuePhone: string
  venueEmail: string
  requesterId: string
  requesterName: string
  requesterEmail: string
  requesterPhone: string
  requesterCompany: string
  title: string
  description: string
  type: string
  status: string
  priority: string
  requestedDate: string
  requestedTime: string
  duration: number
  confirmedDate: string | null
  confirmedTime: string | null
  meetingType: string
  location: string
  purpose: string
  eventType: string
  expectedAttendees: number
  createdAt: string
}

export default function VenueBookingsPage() {
  const [bookings, setBookings] = useState<VenueBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState<VenueBooking | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [currentAction, setCurrentAction] = useState<"confirm" | "cancel" | null>(null)
  const [actionNotes, setActionNotes] = useState("")

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const data = await adminApi<{ bookings: VenueBooking[] }>("/venue/venue-bookings")
      setBookings(data?.bookings ?? [])
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async () => {
    if (!selectedBooking || !currentAction) return

    try {
      await adminApi(`/venue/venue-bookings/${selectedBooking.id}`, {
        method: "PATCH",
        body: {
          status: currentAction === "confirm" ? "CONFIRMED" : "CANCELLED",
          notes: actionNotes,
        },
      })
      await fetchBookings()
      setActionDialogOpen(false)
      setActionNotes("")
      setCurrentAction(null)
      setSelectedBooking(null)
    } catch (error) {
      console.error(`Error ${currentAction}ing booking:`, error)
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "PENDING").length,
    confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
    completed: bookings.filter((b) => b.status === "COMPLETED").length,
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      PENDING: { variant: "outline", label: "Pending" },
      CONFIRMED: { variant: "default", label: "Confirmed" },
      COMPLETED: { variant: "secondary", label: "Completed" },
      CANCELLED: { variant: "destructive", label: "Cancelled" },
    }
    const config = variants[status] || { variant: "outline", label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      LOW: { variant: "secondary", label: "Low" },
      MEDIUM: { variant: "outline", label: "Medium" },
      HIGH: { variant: "default", label: "High" },
      URGENT: { variant: "destructive", label: "Urgent" },
    }
    const config = variants[priority] || { variant: "outline", label: priority }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading venue bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Venue Booking Enquiries</h1>
        <p className="text-gray-600">Manage venue appointment requests and bookings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by venue, requester, or title..."
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
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Requested Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500">
                    No bookings found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-xs">{booking.id.slice(-8)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.venueName}</div>
                        <div className="text-xs text-gray-500">{booking.venueEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.requesterName}</div>
                        <div className="text-xs text-gray-500">{booking.requesterCompany}</div>
                      </div>
                    </TableCell>
                    <TableCell>{booking.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{booking.type.replace(/_/g, " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{new Date(booking.requestedDate).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">{booking.requestedTime}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell>{getPriorityBadge(booking.priority)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedBooking(booking)
                            setDetailsDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {booking.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                setSelectedBooking(booking)
                                setCurrentAction("confirm")
                                setActionDialogOpen(true)
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedBooking(booking)
                                setCurrentAction("cancel")
                                setActionDialogOpen(true)
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Venue Information
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedBooking.venueName}</p>
                    <p><span className="font-medium">Email:</span> {selectedBooking.venueEmail}</p>
                    <p><span className="font-medium">Phone:</span> {selectedBooking.venuePhone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Requester Information
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedBooking.requesterName}</p>
                    <p><span className="font-medium">Company:</span> {selectedBooking.requesterCompany}</p>
                    <p><span className="font-medium">Email:</span> {selectedBooking.requesterEmail}</p>
                    <p><span className="font-medium">Phone:</span> {selectedBooking.requesterPhone}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Booking Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Title:</span> {selectedBooking.title}</p>
                  <p><span className="font-medium">Description:</span> {selectedBooking.description}</p>
                  <p><span className="font-medium">Type:</span> {selectedBooking.type.replace(/_/g, " ")}</p>
                  <p><span className="font-medium">Purpose:</span> {selectedBooking.purpose}</p>
                  <div className="flex gap-2">
                    <span className="font-medium">Status:</span> {getStatusBadge(selectedBooking.status)}
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium">Priority:</span> {getPriorityBadge(selectedBooking.priority)}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Requested Date:</span> {new Date(selectedBooking.requestedDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Requested Time:</span> {selectedBooking.requestedTime}</p>
                  <p><span className="font-medium">Duration:</span> {selectedBooking.duration} minutes</p>
                  <p><span className="font-medium">Meeting Type:</span> {selectedBooking.meetingType.replace(/_/g, " ")}</p>
                  <p><span className="font-medium">Location:</span> {selectedBooking.location || "N/A"}</p>
                  {selectedBooking.confirmedDate && (
                    <>
                      <p><span className="font-medium">Confirmed Date:</span> {new Date(selectedBooking.confirmedDate).toLocaleDateString()}</p>
                      <p><span className="font-medium">Confirmed Time:</span> {selectedBooking.confirmedTime}</p>
                    </>
                  )}
                </div>
              </div>

              {selectedBooking.eventType && (
                <div>
                  <h3 className="font-semibold mb-2">Event Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Event Type:</span> {selectedBooking.eventType}</p>
                    <p><span className="font-medium">Expected Attendees:</span> {selectedBooking.expectedAttendees}</p>
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500">
                <p>Created: {new Date(selectedBooking.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentAction === "confirm" ? "Confirm Booking" : "Cancel Booking"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {currentAction === "confirm"
                ? "Are you sure you want to confirm this booking?"
                : "Are you sure you want to cancel this booking?"}
            </p>
            <Textarea
              placeholder={currentAction === "confirm" ? "Add confirmation notes (optional)" : "Add cancellation reason"}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={currentAction === "confirm" ? "default" : "destructive"}
              onClick={handleAction}
            >
              {currentAction === "confirm" ? "Confirm" : "Cancel Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
