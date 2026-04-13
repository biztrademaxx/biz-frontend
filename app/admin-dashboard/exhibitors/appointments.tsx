"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Search, Eye, CheckCircle, XCircle, Clock, MapPin, Video, Users, Building2 } from "lucide-react"
import { format } from "date-fns"

interface Appointment {
  id: string
  exhibitor: {
    id: string
    companyName: string
    email: string
    logo?: string
  }
  visitor: {
    id: string
    name: string
    email: string
  }
  event: {
    id: string
    name: string
  }
  scheduledAt: string
  duration: number
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  meetingType: "IN_PERSON" | "VIRTUAL"
  location?: string
  notes?: string
  cancelledBy?: string
  cancelledAt?: string
  cancelReason?: string
  createdAt: string
}

export default function ExhibitorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [meetingTypeFilter, setMeetingTypeFilter] = useState<string>("all")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    type: "confirm" | "cancel" | "complete" | null
    appointment: Appointment | null
  }>({ open: false, type: null, appointment: null })
  const [cancelReason, setCancelReason] = useState("")

  useEffect(() => {
    fetchAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, searchTerm, statusFilter, meetingTypeFilter])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<{ appointments?: Appointment[] }>(
        "/api/admin/exhibitors/exhibitor-appointments",
        { auth: true }
      )
      setAppointments(Array.isArray(data?.appointments) ? data.appointments : [])
    } catch (error) {
      console.error("Error fetching appointments:", error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = [...appointments]

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (apt) =>
          apt.exhibitor.companyName.toLowerCase().includes(search) ||
          apt.visitor.name.toLowerCase().includes(search) ||
          apt.event.name.toLowerCase().includes(search) ||
          apt.id.toLowerCase().includes(search),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter)
    }

    if (meetingTypeFilter !== "all") {
      filtered = filtered.filter((apt) => apt.meetingType === meetingTypeFilter)
    }

    setFilteredAppointments(filtered)
  }

  const handleUpdateStatus = async (appointmentId: string, status: string, cancelReason?: string) => {
    try {
      await apiFetch(`/api/admin/exhibitors/exhibitor-appointments/${appointmentId}`, {
        method: "PATCH",
        auth: true,
        body: { status, cancelReason },
      })
      await fetchAppointments()
      setActionDialog({ open: false, type: null, appointment: null })
      setCancelReason("")
    } catch (error) {
      console.error("Error updating appointment:", error)
    }
  }

  const handleConfirmAction = () => {
    if (!actionDialog.appointment) return

    const { type, appointment } = actionDialog
    let newStatus = ""

    switch (type) {
      case "confirm":
        newStatus = "CONFIRMED"
        break
      case "cancel":
        newStatus = "CANCELLED"
        break
      case "complete":
        newStatus = "COMPLETED"
        break
    }

    handleUpdateStatus(appointment.id, newStatus, type === "cancel" ? cancelReason : undefined)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      PENDING: { variant: "outline", icon: Clock },
      CONFIRMED: { variant: "default", icon: CheckCircle },
      CANCELLED: { variant: "destructive", icon: XCircle },
      COMPLETED: { variant: "secondary", icon: CheckCircle },
    }

    const config = variants[status] || variants.PENDING
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    )
  }

  const getMeetingTypeBadge = (type: string) => {
    return type === "IN_PERSON" ? (
      <Badge variant="outline" className="flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        In-Person
      </Badge>
    ) : (
      <Badge variant="outline" className="flex items-center gap-1">
        <Video className="w-3 h-3" />
        Virtual
      </Badge>
    )
  }

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "PENDING").length,
    confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
    completed: appointments.filter((a) => a.status === "COMPLETED").length,
    cancelled: appointments.filter((a) => a.status === "CANCELLED").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Exhibitor Appointments</h1>
        <p className="text-gray-600 mt-1">Manage and track exhibitor appointments with visitors</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by exhibitor, visitor, event, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={meetingTypeFilter} onValueChange={setMeetingTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by meeting type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="IN_PERSON">In-Person</SelectItem>
              <SelectItem value="VIRTUAL">Virtual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Appointments Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Appointment ID</TableHead>
                <TableHead>Exhibitor</TableHead>
                <TableHead>Visitor</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Scheduled At</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No appointments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-mono text-xs">{appointment.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{appointment.exhibitor.companyName}</div>
                          <div className="text-xs text-gray-500">{appointment.exhibitor.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{appointment.visitor.name}</div>
                          <div className="text-xs text-gray-500">{appointment.visitor.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{appointment.event.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{format(new Date(appointment.scheduledAt), "MMM dd, yyyy")}</div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(appointment.scheduledAt), "hh:mm a")}
                      </div>
                    </TableCell>
                    <TableCell>{appointment.duration} min</TableCell>
                    <TableCell>{getMeetingTypeBadge(appointment.meetingType)}</TableCell>
                    <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAppointment(appointment)
                            setDetailsOpen(true)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {appointment.status === "PENDING" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setActionDialog({
                                  open: true,
                                  type: "confirm",
                                  appointment,
                                })
                              }
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setActionDialog({
                                  open: true,
                                  type: "cancel",
                                  appointment,
                                })
                              }
                            >
                              <XCircle className="w-4 h-4 text-red-600" />
                            </Button>
                          </>
                        )}

                        {appointment.status === "CONFIRMED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setActionDialog({
                                open: true,
                                type: "complete",
                                appointment,
                              })
                            }
                          >
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>Complete information about this appointment</DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Appointment ID</Label>
                  <p className="font-mono text-sm">{selectedAppointment.id}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Exhibitor Details</h3>
                <div className="space-y-2">
                  <div>
                    <Label className="text-gray-600">Company Name</Label>
                    <p>{selectedAppointment.exhibitor.companyName}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Email</Label>
                    <p>{selectedAppointment.exhibitor.email}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Visitor Details</h3>
                <div className="space-y-2">
                  <div>
                    <Label className="text-gray-600">Name</Label>
                    <p>{selectedAppointment.visitor.name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Email</Label>
                    <p>{selectedAppointment.visitor.email}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Meeting Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Event</Label>
                    <p>{selectedAppointment.event.name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Meeting Type</Label>
                    <div className="mt-1">{getMeetingTypeBadge(selectedAppointment.meetingType)}</div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Scheduled At</Label>
                    <p>{format(new Date(selectedAppointment.scheduledAt), "MMM dd, yyyy hh:mm a")}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Duration</Label>
                    <p>{selectedAppointment.duration} minutes</p>
                  </div>
                  {selectedAppointment.location && (
                    <div className="col-span-2">
                      <Label className="text-gray-600">Location</Label>
                      <p>{selectedAppointment.location}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="border-t pt-4">
                  <Label className="text-gray-600">Notes</Label>
                  <p className="mt-1 text-sm">{selectedAppointment.notes}</p>
                </div>
              )}

              {selectedAppointment.status === "CANCELLED" && selectedAppointment.cancelReason && (
                <div className="border-t pt-4">
                  <Label className="text-gray-600">Cancellation Reason</Label>
                  <p className="mt-1 text-sm text-red-600">{selectedAppointment.cancelReason}</p>
                  {selectedAppointment.cancelledAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Cancelled on {format(new Date(selectedAppointment.cancelledAt), "MMM dd, yyyy hh:mm a")}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog({ open, type: null, appointment: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === "confirm" && "Confirm Appointment"}
              {actionDialog.type === "cancel" && "Cancel Appointment"}
              {actionDialog.type === "complete" && "Complete Appointment"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === "confirm" && "Are you sure you want to confirm this appointment?"}
              {actionDialog.type === "cancel" && "Please provide a reason for cancelling this appointment."}
              {actionDialog.type === "complete" && "Mark this appointment as completed?"}
            </DialogDescription>
          </DialogHeader>

          {actionDialog.type === "cancel" && (
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Cancellation Reason</Label>
              <Textarea
                id="cancelReason"
                placeholder="Enter reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionDialog({ open: false, type: null, appointment: null })
                setCancelReason("")
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmAction} disabled={actionDialog.type === "cancel" && !cancelReason.trim()}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
