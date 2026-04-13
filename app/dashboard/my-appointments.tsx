"use client"

import { useState, useEffect, useMemo } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CalendarIcon, CalendarDays, Mail, Phone, Building2, Search, Loader2, Filter, Eye, MapPin, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface Appointment {
  id: string
  exhibitorId: string
  exhibitorName: string
  exhibitorCompany: string
  exhibitorEmail: string
  exhibitorPhone?: string
  exhibitorAvatar?: string
  boothNumber?: string
  scheduledAt: string
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  notes?: string
  createdAt: string
  eventTitle?: string
  eventStartDate?: string
  eventEndDate?: string
  eventVenue?: string
  eventCity?: string
}

interface MyAppointmentsProps {
  userId: string
}

export function MyAppointments({ userId }: MyAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEvent, setSelectedEvent] = useState<string>("all")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchAppointments()
  }, [userId])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiFetch<{ appointments?: Appointment[] }>(`/api/appointments?requesterId=${userId}`, { auth: true })
      setAppointments(data.appointments ?? [])
    } catch (err) {
      setError("Failed to load appointments")
      console.error("Error fetching appointments:", err)
    } finally {
      setLoading(false)
    }
  }

  const cancelAppointment = async (appointmentId: string) => {
    try {
      await apiFetch("/api/appointments", {
        method: "PUT",
        body: { appointmentId, status: "CANCELLED" },
        auth: true,
      })

      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled successfully.",
      })

      fetchAppointments()
    } catch {
      toast({
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
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

  const formatDate = (dateStr?: string) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "N/A"

  const formatDateTime = (dateStr?: string) =>
    dateStr
      ? new Date(dateStr).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A"

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "default"
      case "PENDING": return "secondary"
      case "COMPLETED": return "outline"
      case "CANCELLED": return "destructive"
      default: return "secondary"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "Confirmed"
      case "PENDING": return "Pending"
      case "COMPLETED": return "Completed"
      case "CANCELLED": return "Cancelled"
      default: return status
    }
  }

  const uniqueEvents = useMemo(() => {
    const events = appointments
      .map((appointment) => appointment.eventTitle)
      .filter((title): title is string => Boolean(title))
    return Array.from(new Set(events)).sort()
  }, [appointments])

  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch = a.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         a.exhibitorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         a.exhibitorCompany?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEvent = selectedEvent === "all" || a.eventTitle === selectedEvent
    return matchesSearch && matchesEvent
  })

  // Fixed default image path
  const defaultImage = "/image/Ellipse 72.png"

  // Function to get valid image source
  const getImageSrc = (avatarUrl?: string) => {
    if (!avatarUrl) return defaultImage
    
    // Check if it's a relative path or valid URL
    if (avatarUrl.startsWith('/') || avatarUrl.startsWith('http')) {
      return avatarUrl
    }
    
    return defaultImage
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
        <p className="text-gray-600">You haven't scheduled any meetings with exhibitors yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Appointments</h2>
        <p className="text-gray-600">Manage and track your exhibitor meetings</p>
      </div>

      {/* Stats Cards */}
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

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search by event, exhibitor, or company..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-10" 
                />
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {uniqueEvents.map((event) => (
                    <SelectItem key={event} value={event}>
                      {event}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {(searchTerm || selectedEvent !== "all") && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredAppointments.length} of {appointments.length} appointments
          {selectedEvent !== "all" && ` for "${selectedEvent}"`}
        </div>
      )}

      {/* Appointments List - two cards per row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAppointments.map((appointment) => (
          <Card key={appointment.id} className="overflow-hidden hover:shadow-lg transition-shadow w-full">
            <div className="flex flex-col md:flex-row">
              {/* Exhibitor Avatar on left - FIXED IMAGE SECTION */}
              <div className="relative w-full md:w-1/3 h-48 bg-gray-100 flex items-center justify-center">
                {appointment.exhibitorAvatar ? (
                  <Image 
                    src={getImageSrc(appointment.exhibitorAvatar)}
                    alt={appointment.exhibitorName}  
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // Fallback to default image on error
                      const target = e.target as HTMLImageElement
                      target.src = defaultImage
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <div className="text-4xl font-bold text-blue-600">
                      {appointment.exhibitorName[0]?.toUpperCase() || "E"}
                    </div>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <Badge variant={getStatusColor(appointment.status)}>
                    {getStatusLabel(appointment.status)}
                  </Badge>
                </div>
              </div>

              {/* Content on right */}
              <CardContent className="p-6 flex-1">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-xl line-clamp-1">{appointment.exhibitorName}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{appointment.exhibitorCompany || "No company specified"}</p>
                    {appointment.eventTitle && (
                      <Badge variant="outline" className="mt-1">
                        {appointment.eventTitle}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      <span>Scheduled: {formatDateTime(appointment.scheduledAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="line-clamp-1">{appointment.exhibitorEmail}</span>
                    </div>
                    {appointment.exhibitorPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{appointment.exhibitorPhone}</span>
                      </div>
                    )}
                    {appointment.boothNumber && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>Booth {appointment.boothNumber}</span>
                      </div>
                    )}
                    {appointment.eventStartDate && appointment.eventEndDate && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                          Event: {formatDate(appointment.eventStartDate)} - {formatDate(appointment.eventEndDate)}
                        </span>
                      </div>
                    )}
                  </div>

                  {appointment.notes && (
                    <div className="bg-gray-50 p-3 rounded-md text-gray-700 text-sm">
                      <p className="line-clamp-2">{appointment.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-xs text-gray-500">
                      Created: {formatDate(appointment.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedAppointment(appointment)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Appointment Details</DialogTitle>
                          </DialogHeader>
                          {selectedAppointment && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                                  <Image 
                                    src={getImageSrc(selectedAppointment.exhibitorAvatar)}
                                    alt={selectedAppointment.exhibitorName} 
                                    fill 
                                    className="object-cover rounded-full"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.src = defaultImage
                                    }}
                                  />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg">{selectedAppointment.exhibitorName}</h3>
                                  <p className="text-gray-600">{selectedAppointment.exhibitorCompany}</p>
                                  <Badge variant={getStatusColor(selectedAppointment.status)} className="mt-1">
                                    {getStatusLabel(selectedAppointment.status)}
                                  </Badge>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Appointment Details</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Scheduled Time:</span>
                                      <span>{formatDateTime(selectedAppointment.scheduledAt)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Event:</span>
                                      <span>{selectedAppointment.eventTitle || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Booth Number:</span>
                                      <span>{selectedAppointment.boothNumber || "N/A"}</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Contact Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Email:</span>
                                      <span>{selectedAppointment.exhibitorEmail}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Phone:</span>
                                      <span>{selectedAppointment.exhibitorPhone || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Event Dates:</span>
                                      <span className="text-right">
                                        {selectedAppointment.eventStartDate && selectedAppointment.eventEndDate 
                                          ? `${formatDate(selectedAppointment.eventStartDate)} - ${formatDate(selectedAppointment.eventEndDate)}`
                                          : "N/A"
                                        }
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {selectedAppointment.notes && (
                                <div>
                                  <h4 className="font-medium mb-2">Notes</h4>
                                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                                    {selectedAppointment.notes}
                                  </p>
                                </div>
                              )}

                              {selectedAppointment.status === "PENDING" || selectedAppointment.status === "CONFIRMED" ? (
                                <div className="flex justify-end gap-2 pt-4 border-t">
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => cancelAppointment(selectedAppointment.id)}
                                  >
                                    Cancel Appointment
                                  </Button>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

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
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedEvent !== "all"
                ? "Try adjusting your search or filters"
                : "No appointments scheduled yet"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}