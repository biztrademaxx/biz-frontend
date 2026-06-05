"use client"

import { useState, useEffect, useMemo } from "react"
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
  Pagination, PaginationContent, PaginationItem,
} from "@/components/ui/pagination"
import {
  Clock, CalendarIcon, CheckCircle, X, Phone, Mail, Building, User, MapPin,
  ChevronLeft, ChevronRight,
} from "lucide-react"
import { safeResponseJson } from "@/lib/api"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 8

interface AppointmentSchedulingProps {
  venueId: string
  showStatsCard?: boolean
  onCountChange?: (count: number) => void
}

interface Appointment {
  id: string
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

interface VenueAppointmentFromAPI {
  id: string
  requester: { id: string; firstName: string; lastName: string; email: string; avatar?: string }
  requesterPhone?: string
  requesterCompany?: string
  requesterTitle?: string
  requestedDate: string
  requestedTime: string
  duration: number
  purpose?: string
  status: string
  priority: string
  notes?: string
  meetingLink?: string
  location?: string
  type: string
}

export default function AppointmentScheduling({ venueId, onCountChange }: AppointmentSchedulingProps) {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (venueId && venueId !== "undefined") fetchAppointments()
  }, [venueId])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/venue-appointments?venueId=${venueId}`)
      if (!response.ok) throw new Error("Failed to fetch appointments")
      const data = await safeResponseJson<{ data?: VenueAppointmentFromAPI[] }>(response)
      if (!data) throw new Error("Invalid response from server")
      const fetchedAppointments = (data.data || []).map((apt: VenueAppointmentFromAPI) => ({
        id: apt.id,
        visitorName: `${apt.requester.firstName} ${apt.requester.lastName}`,
        visitorEmail: apt.requester.email,
        visitorPhone: apt.requesterPhone || "N/A",
        company: apt.requesterCompany || "N/A",
        designation: apt.requesterTitle || "N/A",
        requestedDate: new Date(apt.requestedDate).toLocaleDateString(),
        requestedTime: apt.requestedTime,
        duration: `${apt.duration} min`,
        purpose: apt.purpose || "General inquiry",
        status: apt.status,
        priority: apt.priority,
        profileViews: 0,
        previousMeetings: 0,
        notes: apt.notes,
        meetingLink: apt.meetingLink,
        location: apt.location,
      }))
      setAppointments(fetchedAppointments)
      if (onCountChange) onCountChange(fetchedAppointments.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      toast({ title: "Error", description: "Failed to load appointments.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const updateAppointment = async (appointmentId: string, updates: Partial<Appointment>) => {
    try {
      const response = await fetch(`/api/venue-appointments`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appointmentId, status: updates.status }),
      })
      if (!response.ok) throw new Error("Failed to update appointment")
      setAppointments(appointments.map((apt) => (apt.id === appointmentId ? { ...apt, ...updates } : apt)))
      toast({ title: "Success", description: "Appointment updated successfully!" })
      fetchAppointments()
    } catch {
      toast({ title: "Error", description: "Failed to update appointment.", variant: "destructive" })
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]"
      case "CONFIRMED": return "bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]"
      case "COMPLETED": return "bg-[#dbeafe] text-[#004A96] border border-[#bfdbfe]"
      case "CANCELLED": return "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
      default: return "bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]"
    }
  }

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-[#EF4444]"
      case "MEDIUM": return "bg-[#F59E0B]"
      case "LOW": return "bg-[#22C55E]"
      default: return "bg-[#94A3B8]"
    }
  }

  const filteredAppointments = useMemo(
    () => appointments.filter((a) => filterStatus === "ALL" || a.status === filterStatus),
    [appointments, filterStatus]
  )

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / PAGE_SIZE))
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(startIndex + PAGE_SIZE, filteredAppointments.length)
  const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex)

  useEffect(() => { setCurrentPage(1) }, [filterStatus])

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 hover:shadow-sm hover:border-[#C7D2FE] transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#004A96] font-semibold text-sm shrink-0">
            {appointment.visitorName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[#1E293B] text-sm">{appointment.visitorName}</h3>
              <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", getStatusBadgeClass(appointment.status))}>
                {appointment.status}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-[#64748B]">
                <span className={cn("w-1.5 h-1.5 rounded-full", getPriorityDot(appointment.priority))} />
                {appointment.priority}
              </span>
            </div>
            <div className="mt-1 space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <Building className="w-3.5 h-3.5 text-[#94A3B8]" />
                {appointment.company} • {appointment.designation}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <Mail className="w-3.5 h-3.5 text-[#94A3B8]" />
                {appointment.visitorEmail}
              </div>
              {appointment.visitorPhone && appointment.visitorPhone !== "N/A" && (
                <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <Phone className="w-3.5 h-3.5 text-[#94A3B8]" />
                  {appointment.visitorPhone}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <CalendarIcon className="w-3.5 h-3.5 text-[#004A96]" />
                {appointment.requestedDate} at {appointment.requestedTime} ({appointment.duration})
              </div>
              {appointment.location && (
                <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <MapPin className="w-3.5 h-3.5 text-[#0284C7]" />
                  {appointment.location}
                </div>
              )}
            </div>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <button
              onClick={() => setSelectedAppointment(appointment)}
              className="text-xs text-[#004A96] hover:underline font-medium whitespace-nowrap"
            >
              View Details
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <User className="w-4 h-4 text-[#004A96]" />
                Appointment — {appointment.visitorName}
              </DialogTitle>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F8FAFC] rounded-xl p-3">
                    <p className="text-xs text-[#94A3B8] mb-1">Profile Views</p>
                    <p className="text-lg font-bold text-[#1E293B]">{selectedAppointment.profileViews}</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-3">
                    <p className="text-xs text-[#94A3B8] mb-1">Previous Meetings</p>
                    <p className="text-lg font-bold text-[#1E293B]">{selectedAppointment.previousMeetings}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-[#94A3B8] uppercase tracking-wide">Purpose</Label>
                  <p className="mt-1 text-sm text-[#1E293B]">{selectedAppointment.purpose}</p>
                </div>
                <div>
                  <Label htmlFor="notes" className="text-xs text-[#94A3B8] uppercase tracking-wide">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add meeting notes..."
                    className="mt-1 rounded-xl border-[#E2E8F0]"
                    value={selectedAppointment.notes || ""}
                    onChange={(e) => setSelectedAppointment({ ...selectedAppointment, notes: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-[#94A3B8] uppercase tracking-wide">Status</Label>
                    <Select
                      value={selectedAppointment.status}
                      onValueChange={(v) => setSelectedAppointment({ ...selectedAppointment, status: v })}
                    >
                      <SelectTrigger className="mt-1 rounded-xl border-[#E2E8F0]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-[#94A3B8] uppercase tracking-wide">Reschedule Date</Label>
                    <Input type="date" className="mt-1 rounded-xl border-[#E2E8F0]" />
                  </div>
                </div>
                {selectedAppointment.meetingLink && (
                  <div>
                    <Label className="text-xs text-[#94A3B8] uppercase tracking-wide">Meeting Link</Label>
                    <Input value={selectedAppointment.meetingLink} className="mt-1 rounded-xl border-[#E2E8F0]" readOnly />
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" className="rounded-xl" onClick={() => setSelectedAppointment(null)}>Cancel</Button>
                  <Button
                    className="rounded-xl bg-[#004A96] text-white"
                    onClick={() => {
                      if (selectedAppointment) {
                        updateAppointment(selectedAppointment.id, { status: selectedAppointment.status, notes: selectedAppointment.notes })
                        setSelectedAppointment(null)
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Purpose */}
      <div className="bg-[#F8FAFC] rounded-xl p-3 mb-4">
        <p className="text-xs text-[#94A3B8] font-medium mb-1">Purpose</p>
        <p className="text-sm text-[#475569]">{appointment.purpose}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center bg-[#EFF6FF] rounded-xl p-2">
          <p className="text-base font-bold text-[#004A96]">{appointment.profileViews}</p>
          <p className="text-[10px] text-[#64748B]">Profile Views</p>
        </div>
        <div className="text-center bg-[#F0FDF4] rounded-xl p-2">
          <p className="text-base font-bold text-[#16A34A]">{appointment.previousMeetings}</p>
          <p className="text-[10px] text-[#64748B]">Previous Meetings</p>
        </div>
        <div className="text-center bg-[#F5F3FF] rounded-xl p-2">
          <p className="text-base font-bold text-[#7C3AED]">{appointment.duration}</p>
          <p className="text-[10px] text-[#64748B]">Duration</p>
        </div>
      </div>

      {/* Actions */}
      {appointment.status === "PENDING" && (
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
          <Button
            size="sm"
            className="rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs flex items-center gap-1"
            onClick={() => updateAppointment(appointment.id, { status: "CONFIRMED" })}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl text-xs border-[#E2E8F0] text-[#64748B] flex items-center gap-1"
          >
            <Clock className="w-3.5 h-3.5" />
            Reschedule
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl text-xs border-[#FECACA] text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-1"
            onClick={() => updateAppointment(appointment.id, { status: "CANCELLED" })}
          >
            <X className="w-3.5 h-3.5" />
            Decline
          </Button>
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-[#E2E8F0]">
        <div className="text-center">
          <p className="text-[#EF4444] mb-3 text-sm">{error}</p>
          <Button onClick={fetchAppointments} className="rounded-xl bg-[#004A96] text-white">Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Visitor Appointment Scheduling</h1>
          <p className="text-sm text-[#64748B] mt-0.5">Manage visitor appointments and meeting requests</p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 rounded-xl border-[#E2E8F0] text-sm">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      {venueId && venueId !== "undefined" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Requests", value: appointments.length, color: "text-[#004A96] bg-[#EFF6FF]", icon: "📋" },
            { label: "Pending", value: appointments.filter((a) => a.status === "PENDING").length, color: "text-[#D97706] bg-[#FEF3C7]", icon: "⏳" },
            { label: "Confirmed", value: appointments.filter((a) => a.status === "CONFIRMED").length, color: "text-[#16A34A] bg-[#DCFCE7]", icon: "✅" },
            { label: "Completed", value: appointments.filter((a) => a.status === "COMPLETED").length, color: "text-[#004A96] bg-[#EFF6FF]", icon: "🏁" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg", stat.color.split(" ")[1])}>
                {stat.icon}
              </div>
              <div>
                <p className={cn("text-2xl font-bold", stat.color.split(" ")[0])}>{stat.value}</p>
                <p className="text-xs text-[#94A3B8]">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
          <h3 className="text-sm font-semibold text-[#1E293B] mb-3 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#004A96]" />
            Calendar
          </h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-xl"
          />
        </div>

        {/* Appointments list */}
        <div className="lg:col-span-2 space-y-4">
          {filteredAppointments.length > 0 ? (
            <>
              {paginatedAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#E2E8F0]">
                  <p className="text-xs text-[#94A3B8]">
                    Showing {startIndex + 1}–{endIndex} of {filteredAppointments.length} appointments
                  </p>
                  <Pagination>
                    <PaginationContent className="gap-1">
                      <PaginationItem>
                        <Button variant="outline" size="sm" className="rounded-xl border-[#E2E8F0] text-xs" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      </PaginationItem>
                      {(() => {
                        const pages: (number | "ellipsis")[] = []
                        if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) pages.push(i) }
                        else {
                          pages.push(1)
                          if (currentPage > 3) pages.push("ellipsis")
                          for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i)
                          if (currentPage < totalPages - 2) pages.push("ellipsis")
                          if (totalPages > 1) pages.push(totalPages)
                        }
                        return pages.map((p, i) =>
                          p === "ellipsis" ? (
                            <PaginationItem key={`e${i}`}>
                              <span className="flex h-8 w-8 items-center justify-center text-[#94A3B8] text-xs">…</span>
                            </PaginationItem>
                          ) : (
                            <PaginationItem key={p}>
                              <Button
                                variant={currentPage === p ? "default" : "outline"}
                                size="icon"
                                className={cn("h-8 w-8 rounded-xl text-xs", currentPage === p ? "bg-[#004A96] border-[#004A96] text-white" : "border-[#E2E8F0]")}
                                onClick={() => setCurrentPage(p as number)}
                              >
                                {p}
                              </Button>
                            </PaginationItem>
                          )
                        )
                      })()}
                      <PaginationItem>
                        <Button variant="outline" size="sm" className="rounded-xl border-[#E2E8F0] text-xs" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
              <CalendarIcon className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
              <h3 className="text-base font-semibold text-[#94A3B8] mb-1">No appointments</h3>
              <p className="text-sm text-[#CBD5E1]">
                {filterStatus === "ALL" ? "Appointment requests will appear here" : `No ${filterStatus.toLowerCase()} appointments found`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}