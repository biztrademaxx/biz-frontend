"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  CalendarIcon,
  CheckCircle,
  X,
  Eye,
  Phone,
  Mail,
  Building,
  User,
  MapPin,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useDashboard } from "@/contexts/dashboard-context"
import { exGlassCard, exBtnPrimary, exPageTitle } from "./dashboard-theme"

interface AppointmentSchedulingProps {
  exhibitorId: string
  showStatsCard?: boolean
 onCountChange?: (count: number) => void   // ✅ add this line
}


interface Appointment {
  id: string
  visitorId?: string
  visitorName: string
  visitorEmail: string
  visitorPhone?: string
  company?: string
  designation?: string
  requestedDate: string
  requestedTime: string
  duration: string
  purpose: string
  status: string
  priority: string
  profileViews: number
  previousMeetings: number
  notes?: string
  meetingLink?: string
  location?: string
}

export default function AppointmentScheduling({ exhibitorId, onCountChange }: AppointmentSchedulingProps) {
  const { toast } = useToast()
  const { openMessagesWithUser } = useDashboard()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState("ALL")

  useEffect(() => {
    if (exhibitorId && exhibitorId !== "undefined") {
      fetchAppointments()
    }
  }, [exhibitorId])

const fetchAppointments = async () => {
  try {
    setLoading(true)
    setError(null)

    const response = await fetch(`/api/appointments?exhibitorId=${exhibitorId}`)
    if (!response.ok) throw new Error("Failed to fetch appointments")

    const data = await response.json()
    const fetchedAppointments = data.appointments || []
    setAppointments(fetchedAppointments)

    // ✅ Update parent count whenever appointments change
    if (onCountChange) onCountChange(fetchedAppointments.length)

  } catch (err) {
    setError(err instanceof Error ? err.message : "An error occurred")
    toast({
      title: "Error",
      description: "Failed to load appointments. Please try again.",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}


  const updateAppointment = async (appointmentId: string, updates: Partial<Appointment>) => {
    try {
      const response = await fetch(`/api/appointments`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId,
          ...updates,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update appointment")
      }

      setAppointments(appointments.map((apt) => (apt.id === appointmentId ? { ...apt, ...updates } : apt)))

      toast({
        title: "Success",
        description: "Appointment updated successfully!",
      })

      // Refresh appointments to get latest data
      fetchAppointments()
    } catch (err) {
      console.error("Error updating appointment:", err)
      toast({
        title: "Error",
        description: "Failed to update appointment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500"
      case "CONFIRMED":
        return "bg-green-500"
      case "COMPLETED":
        return "bg-[#004A96]"
      case "CANCELLED":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "text-red-600 bg-red-50"
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-50"
      case "LOW":
        return "text-green-600 bg-green-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const filteredAppointments = appointments.filter(
    (appointment) => filterStatus === "ALL" || appointment.status === filterStatus,
  )

  const handleMessageVisitor = (appointment: Appointment) => {
    const visitorId = appointment.visitorId?.trim()
    if (!visitorId) {
      toast({
        title: "Cannot open messages",
        description: "This visitor does not have a linked account yet.",
        variant: "destructive",
      })
      return
    }
    openMessagesWithUser(visitorId)
  }

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className={cn(exGlassCard, "transition-shadow hover:shadow-md min-w-0 overflow-hidden")}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="font-semibold text-base sm:text-lg break-words">{appointment.visitorName}</h3>
              <Badge className={`${getStatusColor(appointment.status)} text-white`}>{appointment.status}</Badge>
              <Badge variant="outline" className={getPriorityColor(appointment.priority)}>
                {appointment.priority}
              </Badge>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-start gap-2 min-w-0">
                <Building className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="break-words">{appointment.company} • {appointment.designation}</span>
              </div>
              <div className="flex items-start gap-2 min-w-0">
                <Mail className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="break-all">{appointment.visitorEmail}</span>
              </div>
              {appointment.visitorPhone && (
                <div className="flex items-start gap-2 min-w-0">
                  <Phone className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="break-all">{appointment.visitorPhone}</span>
                </div>
              )}
              <div className="flex items-start gap-2 min-w-0">
                <CalendarIcon className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="break-words">{appointment.requestedDate} at {appointment.requestedTime} ({appointment.duration})</span>
              </div>
              {appointment.location && (
                <div className="flex items-start gap-2 min-w-0">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="break-words">{appointment.location}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAppointment(appointment)}>
                  <Eye className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Appointment Details - {appointment.visitorName}
                  </DialogTitle>
                </DialogHeader>
                {selectedAppointment && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-sm font-medium">Visitor Profile Views</Label>
                        <p className="text-gray-600">{selectedAppointment.profileViews} views</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Previous Meetings</Label>
                        <p className="text-gray-600">{selectedAppointment.previousMeetings} meetings</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Meeting Purpose</Label>
                      <p className="text-gray-600 mt-1">{selectedAppointment.purpose}</p>
                    </div>
                    <div>
                      <Label htmlFor="notes" className="text-sm font-medium">
                        Meeting Notes
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Add meeting notes or preparation points..."
                        className="mt-1"
                        value={selectedAppointment.notes || ""}
                        onChange={(e) => setSelectedAppointment({ ...selectedAppointment, notes: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Select
                          value={selectedAppointment.status}
                          onValueChange={(value) => setSelectedAppointment({ ...selectedAppointment, status: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {selectedAppointment.meetingLink && (
                      <div>
                        <Label className="text-sm font-medium">Meeting Link</Label>
                        <Input value={selectedAppointment.meetingLink} className="mt-1" readOnly />
                      </div>
                    )}
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                      <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
                      <Button
                        onClick={() => {
                          if (selectedAppointment) {
                            updateAppointment(selectedAppointment.id, {
                              status: selectedAppointment.status,
                              notes: selectedAppointment.notes,
                            })
                            setSelectedAppointment(null)
                          }
                        }}
                        className={cn(exBtnPrimary, "w-full sm:w-auto")}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-700 font-medium mb-1">Meeting Purpose:</p>
          <p className="text-sm text-gray-600">{appointment.purpose}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-4 text-sm">
          <div className="rounded bg-[#004A96]/10 p-2 text-center">
            <div className="font-semibold text-[#004A96]">{appointment.profileViews}</div>
            <div className="text-gray-600">Profile Views</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="font-semibold text-green-600">{appointment.previousMeetings}</div>
            <div className="text-gray-600">Previous Meetings</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-semibold text-[#004A96]">{appointment.duration}</div>
            <div className="text-gray-600">Duration</div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-500 break-words">
            Requested: {appointment.requestedDate} at {appointment.requestedTime}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
            {appointment.status === "PENDING" && (
              <>
                <Button
                  size="sm"
                  className="flex w-full items-center justify-center gap-2 bg-green-600 hover:bg-green-700 sm:w-auto"
                  onClick={() => updateAppointment(appointment.id, { status: "CONFIRMED" })}
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex w-full items-center justify-center gap-2 text-red-600 hover:text-red-700 bg-transparent sm:w-auto"
                  onClick={() => updateAppointment(appointment.id, { status: "CANCELLED" })}
                >
                  <X className="w-4 h-4" />
                  Decline
                </Button>
              </>
            )}
            {/* <Button
              variant="outline"
              size="sm"
              className="flex w-full items-center justify-center gap-2 bg-transparent sm:w-auto"
              onClick={() => handleMessageVisitor(appointment)}
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </Button> */}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
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
          <Button className={exBtnPrimary} onClick={fetchAppointments}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className={exPageTitle}>Visitor Appointment Scheduling</h1>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          {/* <Button className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Calendar View
          </Button> */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
        <Card className={exGlassCard}>
          <CardContent className="p-4 sm:p-6">
            <div className="text-3xl font-bold text-[#004A96]">{appointments.length}</div>
            <div className="text-gray-600">Total Requests</div>
          </CardContent>
        </Card>
        <Card className={exGlassCard}>
          <CardContent className="p-4 sm:p-6">
            <div className="text-3xl font-bold text-yellow-600">
              {appointments.filter((a) => a.status === "PENDING").length}
            </div>
            <div className="text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card className={exGlassCard}>
          <CardContent className="p-4 sm:p-6">
            <div className="text-3xl font-bold text-green-600">
              {appointments.filter((a) => a.status === "CONFIRMED").length}
            </div>
            <div className="text-gray-600">Confirmed</div>
          </CardContent>
        </Card>
        {/* <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="text-3xl font-bold text-[#004A96]">
              {appointments.filter((a) => a.status === "COMPLETED").length}
            </div>
            <div className="text-gray-600">Completed</div>
          </CardContent>
        </Card> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <Card className={exGlassCard}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border" />
          </CardContent>
        </Card>

        {/* Appointments List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <Card className={exGlassCard}>
              <CardContent className="p-12 text-center">
                <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No appointments</h3>
                <p className="text-gray-500">
                  {filterStatus === "ALL"
                    ? "Appointment requests will appear here"
                    : `No ${filterStatus.toLowerCase()} appointments found`}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
