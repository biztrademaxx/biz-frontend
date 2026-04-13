"use client"

import { useState, useEffect } from "react"
import { adminApi } from "@/lib/admin-api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, Users, CheckCircle, XCircle, Eye, Search, Filter } from 'lucide-react'

interface Appointment {
  id: string
  visitor: {
    name: string
    email: string
    phone?: string
    company?: string
  }
  exhibitor: {
    name: string
    company: string
    email: string
  }
  event: {
    title: string
    date: string
  }
  title: string
  description?: string
  type: string
  status: string
  priority: string
  requestedDate: string
  requestedTime: string
  confirmedDate?: string
  confirmedTime?: string
  duration: number
  meetingType: string
  location?: string
  meetingLink?: string
  purpose?: string
  createdAt: string
}

export default function VisitorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    fetchAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, searchQuery, statusFilter])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const data = await adminApi<{ appointments?: Appointment[] }>("/visitors/visitor-appointments")
      setAppointments((data as any)?.appointments ?? [])
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = appointments

    if (searchQuery) {
      filtered = filtered.filter(
        (apt) =>
          apt.visitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          apt.visitor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          apt.exhibitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          apt.event.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter)
    }

    setFilteredAppointments(filtered)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      CONFIRMED: { label: "Confirmed", className: "bg-blue-100 text-blue-800" },
      COMPLETED: { label: "Completed", className: "bg-green-100 text-green-800" },
      CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800" },
      RESCHEDULED: { label: "Rescheduled", className: "bg-purple-100 text-purple-800" },
      NO_SHOW: { label: "No Show", className: "bg-gray-100 text-gray-800" },
    }
    const variant = variants[status] || { label: status, className: "bg-gray-100 text-gray-800" }
    return <Badge className={variant.className}>{variant.label}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      LOW: "bg-gray-100 text-gray-800",
      MEDIUM: "bg-blue-100 text-blue-800",
      HIGH: "bg-orange-100 text-orange-800",
      URGENT: "bg-red-100 text-red-800",
    }
    return <Badge className={variants[priority] || "bg-gray-100 text-gray-800"}>{priority}</Badge>
  }

  const totalAppointments = appointments.length
  const pendingAppointments = appointments.filter((a) => a.status === "PENDING").length
  const confirmedAppointments = appointments.filter((a) => a.status === "CONFIRMED").length
  const completedAppointments = appointments.filter((a) => a.status === "COMPLETED").length

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
      <div>
        <h1 className="text-3xl font-bold">Visitor Appointments</h1>
        <p className="text-gray-600 mt-1">Manage all visitor appointment requests with exhibitors</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Users className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAppointments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedAppointments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedAppointments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
          <CardDescription>View and manage all visitor appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by visitor, exhibitor, or event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
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

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor</TableHead>
                  <TableHead>Exhibitor</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No appointments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{appointment.visitor.name}</div>
                          <div className="text-sm text-gray-500">{appointment.visitor.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{appointment.exhibitor.name}</div>
                          <div className="text-sm text-gray-500">{appointment.exhibitor.company}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{appointment.event.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{appointment.type.replace(/_/g, " ")}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(appointment.requestedDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">{appointment.requestedTime}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell>{getPriorityBadge(appointment.priority)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAppointment(appointment)
                            setDetailsOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
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

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>Complete information about the appointment</DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Visitor Information</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Name:</span> {selectedAppointment.visitor.name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {selectedAppointment.visitor.email}
                    </p>
                    {selectedAppointment.visitor.phone && (
                      <p>
                        <span className="font-medium">Phone:</span> {selectedAppointment.visitor.phone}
                      </p>
                    )}
                    {selectedAppointment.visitor.company && (
                      <p>
                        <span className="font-medium">Company:</span> {selectedAppointment.visitor.company}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Exhibitor Information</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Name:</span> {selectedAppointment.exhibitor.name}
                    </p>
                    <p>
                      <span className="font-medium">Company:</span> {selectedAppointment.exhibitor.company}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {selectedAppointment.exhibitor.email}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Appointment Details</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Title:</span> {selectedAppointment.title}
                  </p>
                  {selectedAppointment.description && (
                    <p>
                      <span className="font-medium">Description:</span> {selectedAppointment.description}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Type:</span>{" "}
                    {selectedAppointment.type.replace(/_/g, " ")}
                  </p>
                  <p>
                    <span className="font-medium">Event:</span> {selectedAppointment.event.title}
                  </p>
                  <p>
                    <span className="font-medium">Requested Date:</span>{" "}
                    {new Date(selectedAppointment.requestedDate).toLocaleDateString()} at{" "}
                    {selectedAppointment.requestedTime}
                  </p>
                  <p>
                    <span className="font-medium">Duration:</span> {selectedAppointment.duration} minutes
                  </p>
                  <p>
                    <span className="font-medium">Meeting Type:</span>{" "}
                    {selectedAppointment.meetingType.replace(/_/g, " ")}
                  </p>
                  {selectedAppointment.location && (
                    <p>
                      <span className="font-medium">Location:</span> {selectedAppointment.location}
                    </p>
                  )}
                  {selectedAppointment.meetingLink && (
                    <p>
                      <span className="font-medium">Meeting Link:</span>{" "}
                      <a
                        href={selectedAppointment.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedAppointment.meetingLink}
                      </a>
                    </p>
                  )}
                  {selectedAppointment.purpose && (
                    <p>
                      <span className="font-medium">Purpose:</span> {selectedAppointment.purpose}
                    </p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <div>
                      <span className="font-medium">Status:</span>{" "}
                      {getStatusBadge(selectedAppointment.status)}
                    </div>
                    <div>
                      <span className="font-medium">Priority:</span>{" "}
                      {getPriorityBadge(selectedAppointment.priority)}
                    </div>
                  </div>
                </div>
              </div>

              {selectedAppointment.confirmedDate && (
                <div>
                  <h3 className="font-semibold mb-2">Confirmed Details</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Confirmed Date:</span>{" "}
                      {new Date(selectedAppointment.confirmedDate).toLocaleDateString()} at{" "}
                      {selectedAppointment.confirmedTime}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
