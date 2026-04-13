"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CalendarIcon, CalendarDays, Mail, Phone, Search, Loader2, Filter, Eye, MapPin, Users, Clock, Building, Target } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Appointment {
  id: string
  venueId: string
  requesterId: string
  title: string
  description?: string
  type: "VENUE_TOUR" | "MEETING" | "CONSULTATION" | "OTHER"
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  priority: "LOW" | "MEDIUM" | "HIGH"
  requestedDate: string
  requestedTime: string
  duration: number
  meetingType: "IN_PERSON" | "VIRTUAL" | "PHONE"
  purpose?: string
  requesterCompany?: string
  requesterTitle?: string
  requesterPhone?: string
  requesterEmail?: string
  eventType?: string
  expectedAttendees?: number
  eventDate?: string
  meetingSpacesInterested: string[]
  location?: string
  agenda: string[]
  reminderSent: boolean
  followUpRequired: boolean
  createdAt: string
  updatedAt: string
  venue: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
  }
  requester: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
  }
}

interface MyAppointmentsProps {
  userId: string
}

export function MyAppointments({ userId }: MyAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAppointments()
  }, [userId])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/venue-appointments?requesterId=${userId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch appointments")
      }

      const result = await response.json()
      setAppointments(result.data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

const cancelAppointment = async (appointmentId: string) => {
  try {
    const response = await fetch(`/api/venue-appointments`, {
      method: "PATCH", // Change to PATCH instead of PUT
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        id: appointmentId, 
        status: "CANCELLED" 
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to cancel appointment")
    }

    const result = await response.json()
    
    toast({
      title: "Success",
      description: result.message || "Appointment cancelled successfully",
    })

    fetchAppointments() // Refresh the list
    setDialogOpen(false) // Close the dialog if open
  } catch (err) {
    console.error("Cancel appointment error:", err)
    toast({
      title: "Error",
      description: err instanceof Error ? err.message : "Failed to cancel appointment",
      variant: "destructive",
    })
  }
}

  const stats = useMemo(() => {
    const pending = appointments.filter((a) => a.status === "PENDING").length
    const confirmed = appointments.filter((a) => a.status === "CONFIRMED").length
    const completed = appointments.filter((a) => a.status === "COMPLETED").length
    const cancelled = appointments.filter((a) => a.status === "CANCELLED").length

    return {
      total: appointments.length,
      pending,
      confirmed,
      completed: completed + cancelled,
    }
  }, [appointments])

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "default"
      case "PENDING":
        return "secondary"
      case "COMPLETED":
        return "outline"
      case "CANCELLED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Confirmed"
      case "PENDING":
        return "Pending"
      case "COMPLETED":
        return "Completed"
      case "CANCELLED":
        return "Cancelled"
      default:
        return status
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "VENUE_TOUR":
        return "Venue Tour"
      case "MEETING":
        return "Meeting"
      case "CONSULTATION":
        return "Consultation"
      case "OTHER":
        return "Other"
      default:
        return type
    }
  }

  const getMeetingTypeLabel = (meetingType: string) => {
    switch (meetingType) {
      case "IN_PERSON":
        return "In Person"
      case "VIRTUAL":
        return "Virtual"
      case "PHONE":
        return "Phone"
      default:
        return meetingType
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "destructive"
      case "MEDIUM":
        return "secondary"
      case "LOW":
        return "outline"
      default:
        return "secondary"
    }
  }

  const uniqueTypes = useMemo(() => {
    const types = appointments.map((appointment) => appointment.type)
    return Array.from(new Set(types)).sort()
  }, [appointments])

  const filteredAppointments = appointments.filter((a) => {
    const q = searchTerm.toLowerCase()
    const matchesSearch =
      a.title?.toLowerCase().includes(q) ||
      a.venue?.firstName?.toLowerCase().includes(q) ||
      a.venue?.lastName?.toLowerCase().includes(q) ||
      a.requesterCompany?.toLowerCase().includes(q) ||
      a.purpose?.toLowerCase().includes(q)
    const matchesType = selectedType === "all" || a.type === selectedType
    return matchesSearch && matchesType
  })

  // Safe avatar URL handler
  const getAvatarUrl = (avatarUrl?: string) => {
    if (!avatarUrl) {
      return null
    }

    // Check if it's a valid URL or path
    if (avatarUrl.startsWith('/') || avatarUrl.startsWith('http')) {
      return avatarUrl
    }

    return null
  }

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchAppointments} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center p-8">
        <CalendarIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Appointments Yet</h3>
        <p className="text-gray-600">You haven't scheduled any meetings with venues yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Appointments</h2>
        <p className="text-gray-600">Manage and track your venue meetings</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Requests",
            value: stats.total,
            color: "border-blue-300 hover:border-blue-500",
          },
          {
            label: "Pending",
            value: stats.pending,
            color: "border-yellow-300 hover:border-yellow-500",
          },
          {
            label: "Confirmed",
            value: stats.confirmed,
            color: "border-green-300 hover:border-green-500",
          },
          {
            label: "Completed",
            value: stats.completed,
            color: "border-gray-300 hover:border-gray-500",
          },
        ].map((stat) => (
          <Card key={stat.label} className={`border-2 transition-colors ${stat.color}`}>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <span className="text-3xl font-bold">{stat.value}</span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by title, venue, company, or purpose..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {(searchTerm || selectedType !== "all") && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredAppointments.length} of {appointments.length} appointments
          {selectedType !== "all" && ` for "${getTypeLabel(selectedType)}"`}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAppointments.map((appointment) => {
          const venue = appointment.venue ?? { id: "", firstName: "Venue", lastName: "", email: "" }
          const venueInitial = (venue.firstName?.[0] ?? venue.lastName?.[0] ?? "V").toUpperCase()
          return (
          <Card key={appointment.id} className="overflow-hidden hover:shadow-lg transition-shadow w-full">
            <div className="flex flex-col md:flex-row">
              {/* Avatar Section - Fixed to prevent image errors */}
              <div className="relative w-full md:w-1/3 h-48 bg-gray-100 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {appointment.venue.firstName[0]?.toUpperCase() || "V"}
                  </div>
                </div>
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Badge variant={getStatusColor(appointment.status)}>{getStatusLabel(appointment.status)}</Badge>
                  <Badge variant={getPriorityColor(appointment.priority)}>{appointment.priority}</Badge>
                </div>
              </div>

              <CardContent className="p-6 flex-1">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-xl line-clamp-1">{appointment.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      with {appointment.venue.firstName} {appointment.venue.lastName}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">{getTypeLabel(appointment.type)}</Badge>
                      <Badge variant="outline">{getMeetingTypeLabel(appointment.meetingType)}</Badge>
                      {appointment.requesterCompany && (
                        <Badge variant="secondary">{appointment.requesterCompany}</Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      <span>
                        {formatDate(appointment.requestedDate)} at {appointment.requestedTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{appointment.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="line-clamp-1">{appointment.venue.email}</span>
                    </div>
                    {appointment.requesterPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{appointment.requesterPhone}</span>
                      </div>
                    )}
                    {appointment.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{appointment.location}</span>
                      </div>
                    )}
                    {appointment.eventType && (
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        <span>{appointment.eventType}</span>
                      </div>
                    )}
                    {appointment.expectedAttendees && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{appointment.expectedAttendees} attendees</span>
                      </div>
                    )}
                  </div>

                  {appointment.purpose && (
                    <div className="bg-gray-50 p-3 rounded-md text-gray-700 text-sm">
                      <p className="line-clamp-2">{appointment.purpose}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-xs text-gray-500">Created: {formatDate(appointment.createdAt)}</div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewDetails(appointment)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      {(appointment.status === "PENDING" || appointment.status === "CONFIRMED") && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => cancelAppointment(appointment.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
          )
        })}
      </div>

      {/* Dialog moved outside the map loop to prevent infinite re-renders */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (() => {
            const selVenue = selectedAppointment.venue ?? { id: "", firstName: "Venue", lastName: "", email: "" }
            const selVenueInitial = (selVenue.firstName?.[0] ?? selVenue.lastName?.[0] ?? "V").toUpperCase()
            return (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <div className="text-xl font-bold text-blue-600">
                    {selectedAppointment.venue.firstName[0]?.toUpperCase() || "V"}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedAppointment.title}</h3>
                  <p className="text-gray-600">
                    with {selectedAppointment.venue.firstName} {selectedAppointment.venue.lastName}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant={getStatusColor(selectedAppointment.status)}>
                      {getStatusLabel(selectedAppointment.status)}
                    </Badge>
                    <Badge variant={getPriorityColor(selectedAppointment.priority)}>
                      {selectedAppointment.priority}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Appointment Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span>{getTypeLabel(selectedAppointment.type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Meeting Type:</span>
                      <span>{getMeetingTypeLabel(selectedAppointment.meetingType)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date & Time:</span>
                      <span className="text-right">
                        {formatDate(selectedAppointment.requestedDate)} at {selectedAppointment.requestedTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span>{selectedAppointment.duration} minutes</span>
                    </div>
                    {selectedAppointment.location && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="text-right">{selectedAppointment.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Venue Email:</span>
                      <span>{selectedAppointment.venue.email}</span>
                    </div>
                    {selectedAppointment.requesterPhone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Your Phone:</span>
                        <span>{selectedAppointment.requesterPhone}</span>
                      </div>
                    )}
                    {selectedAppointment.requesterEmail && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Your Email:</span>
                        <span>{selectedAppointment.requesterEmail}</span>
                      </div>
                    )}
                    {selectedAppointment.requesterCompany && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Company:</span>
                        <span>{selectedAppointment.requesterCompany}</span>
                      </div>
                    )}
                    {selectedAppointment.requesterTitle && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Your Title:</span>
                        <span>{selectedAppointment.requesterTitle}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedAppointment.purpose && (
                <div>
                  <h4 className="font-medium mb-2">Purpose</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {selectedAppointment.purpose}
                  </p>
                </div>
              )}

              {selectedAppointment.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {selectedAppointment.description}
                  </p>
                </div>
              )}

              {selectedAppointment.eventType && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Event Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Event Type:</span>
                        <span>{selectedAppointment.eventType}</span>
                      </div>
                      {selectedAppointment.eventDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Event Date:</span>
                          <span>{formatDate(selectedAppointment.eventDate)}</span>
                        </div>
                      )}
                      {selectedAppointment.expectedAttendees && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expected Attendees:</span>
                          <span>{selectedAppointment.expectedAttendees}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {(selectedAppointment.meetingSpacesInterested?.length ?? 0) > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Meeting Spaces Interested</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAppointment.meetingSpacesInterested.map((space, index) => (
                      <Badge key={index} variant="outline">
                        {space}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(selectedAppointment.agenda?.length ?? 0) > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Agenda</h4>
                  <ul className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md space-y-1">
                    {selectedAppointment.agenda.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(selectedAppointment.status === "PENDING" || selectedAppointment.status === "CONFIRMED") && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => cancelAppointment(selectedAppointment.id)}
                  >
                    Cancel Appointment
                  </Button>
                </div>
              )}
            </div>
            )
          })()}
        </DialogContent>
      </Dialog>

      {filteredAppointments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedType !== "all"
                ? "Try adjusting your search or filters"
                : "No appointments scheduled yet"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}