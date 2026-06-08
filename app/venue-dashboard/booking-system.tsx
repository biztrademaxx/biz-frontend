"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Clock, CalendarIcon, CheckCircle2, XCircle, Phone, Mail, Building2, MapPin,
  ChevronLeft, ChevronRight, TrendingUp, AlertCircle, CalendarDays,
  User, Eye, MessageSquare, Search, Loader2, CheckCircle,
} from "lucide-react"
import { safeResponseJson } from "@/lib/api"
import { cn } from "@/lib/utils"

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

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    pill: "text-amber-600 bg-amber-50 border-amber-200",
    icon: AlertCircle,
    dot: "bg-amber-500",
    sectionTitle: "Pending Requests",
    sectionIcon: AlertCircle,
    sectionIconColor: "text-amber-500",
    badgeBg: "bg-amber-50 text-amber-600 border-amber-200",
    emptyMsg: "No pending requests",
  },
  CONFIRMED: {
    label: "Confirmed",
    pill: "text-emerald-600 bg-emerald-50 border-emerald-200",
    icon: CheckCircle2,
    dot: "bg-emerald-500",
    sectionTitle: "Confirmed Appointments",
    sectionIcon: CheckCircle2,
    sectionIconColor: "text-emerald-500",
    badgeBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
    emptyMsg: "No confirmed appointments",
  },
  COMPLETED: {
    label: "Completed",
    pill: "text-blue-600 bg-blue-50 border-blue-200",
    icon: CheckCircle,
    dot: "bg-blue-500",
    sectionTitle: "Completed",
    sectionIcon: CheckCircle,
    sectionIconColor: "text-blue-500",
    badgeBg: "bg-blue-50 text-blue-600 border-blue-200",
    emptyMsg: "No completed appointments",
  },
  CANCELLED: {
    label: "Cancelled",
    pill: "text-red-500 bg-red-50 border-red-200",
    icon: XCircle,
    dot: "bg-red-400",
    sectionTitle: "Cancelled",
    sectionIcon: XCircle,
    sectionIconColor: "text-red-400",
    badgeBg: "bg-red-50 text-red-500 border-red-200",
    emptyMsg: "No cancelled appointments",
  },
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":")
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

function AvatarFallback({ name, size = "lg" }: { name: string; size?: "sm" | "lg" }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  return (
    <div className={cn(
      "rounded-full bg-gradient-to-br from-[#004A96] to-blue-400 flex items-center justify-center text-white font-bold shrink-0",
      size === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm"
    )}>
      {initials}
    </div>
  )
}

// Compact Appointment Card for grid layout
function CompactAppointmentCard({
  appointment,
  onUpdateStatus,
  onViewDetails,
}: {
  appointment: Appointment
  onUpdateStatus: (id: string, status: string) => void
  onViewDetails: (appt: Appointment) => void
}) {
  const statusConfig = STATUS_CONFIG[appointment.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <AvatarFallback name={appointment.visitorName} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 text-sm truncate">{appointment.visitorName}</p>
          {appointment.company && appointment.company !== "N/A" && (
            <p className="text-xs text-slate-500 truncate">{appointment.company}</p>
          )}
        </div>
      </div>

      {/* Status & Priority Badges */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", statusConfig.pill)}>
          {statusConfig.label}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
          <span className={cn("h-1.5 w-1.5 rounded-full",
            appointment.priority === "HIGH" ? "bg-red-500" : appointment.priority === "MEDIUM" ? "bg-amber-500" : "bg-emerald-500"
          )} />
          {appointment.priority}
        </span>
      </div>

      {/* Date & Time */}
      <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <div>
          <p className="font-medium text-slate-800 text-xs">{appointment.requestedDate}</p>
          <p className="text-xs text-slate-500">{formatTime(appointment.requestedTime)}</p>
        </div>
      </div>

      {/* Duration */}
      <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
        <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <p className="text-xs text-slate-500">{appointment.duration}</p>
      </div>

      {/* Location */}
      {appointment.location && appointment.location !== "N/A" && (
        <div className="flex items-start gap-2 text-sm text-slate-600 mb-3">
          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-red-400" />
          <p className="text-xs text-slate-500 line-clamp-2">{appointment.location}</p>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-2 mb-3">
        <div className="text-center bg-slate-50 rounded-xl px-2 py-1">
          <p className="text-sm font-bold text-slate-800">{appointment.profileViews}</p>
          <p className="text-[9px] text-slate-400">Views</p>
        </div>
        <div className="text-center bg-slate-50 rounded-xl px-2 py-1">
          <p className="text-sm font-bold text-slate-800">{appointment.previousMeetings}</p>
          <p className="text-[9px] text-slate-400">Meetings</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-slate-100">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-full border-slate-200 text-slate-700 text-xs gap-1.5"
          onClick={() => onViewDetails(appointment)}
        >
          <Eye className="h-3.5 w-3.5" />
          View Details
        </Button>

        {appointment.status === "PENDING" && (
          <>
            <Button
              size="sm"
              className="h-8 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
              onClick={() => onUpdateStatus(appointment.id, "CONFIRMED")}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full border-red-200 text-red-500 hover:bg-red-50 text-xs gap-1.5"
              onClick={() => onUpdateStatus(appointment.id, "CANCELLED")}
            >
              <XCircle className="h-3.5 w-3.5" />
              Decline
            </Button>
          </>
        )}

        {appointment.status === "CONFIRMED" && (
          <Button
            size="sm"
            className="h-8 w-full bg-[#004A96] hover:bg-[#003d7a] text-white text-xs gap-1.5"
            onClick={() => onUpdateStatus(appointment.id, "COMPLETED")}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Mark Complete
          </Button>
        )}
      </div>
    </div>
  )
}

// Visitor Section Component
function VisitorSection({
  visitorId,
  visitorName,
  appointments,
  onUpdateStatus,
  onViewDetails,
}: {
  visitorId: string
  visitorName: string
  appointments: Appointment[]
  onUpdateStatus: (id: string, status: string) => void
  onViewDetails: (appt: Appointment) => void
}) {
  return (
    <div className="mb-8">
      {/* Visitor Header */}
      <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-200">
        <AvatarFallback name={visitorName} size="sm" />
        <div>
          <h3 className="text-lg font-semibold text-slate-800">{visitorName}</h3>
          <p className="text-xs text-slate-500">
            {appointments.length} {appointments.length === 1 ? "appointment" : "appointments"}
          </p>
        </div>
      </div>

      {/* Cards Grid - 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {appointments.map((appt) => (
          <CompactAppointmentCard
            key={appt.id}
            appointment={appt}
            onUpdateStatus={onUpdateStatus}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  )
}

export default function AppointmentScheduling({ venueId, onCountChange }: AppointmentSchedulingProps) {
  const { toast } = useToast()
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [view, setView] = useState<"list" | "calendar">("list")
  const [currentMonth, setCurrentMonth] = useState(new Date())

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

  const updateAppointment = async (appointmentId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/venue-appointments`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appointmentId, status, notes }),
      })
      if (!response.ok) throw new Error("Failed to update appointment")

      toast({
        title: "Success",
        description: `Appointment ${status.toLowerCase()} successfully!`,
      })
      fetchAppointments()
    } catch {
      toast({ title: "Error", description: "Failed to update appointment.", variant: "destructive" })
    }
  }

  const stats = useMemo(() => ({
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "PENDING").length,
    confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
    completed: appointments.filter((a) => a.status === "COMPLETED").length,
    cancelled: appointments.filter((a) => a.status === "CANCELLED").length,
  }), [appointments])

  // Group appointments by visitor (requester)
  const groupedByVisitor = useMemo(() => {
    const groups = new Map<string, {
      visitorId: string
      visitorName: string
      appointments: Appointment[]
    }>()

    appointments.forEach((appt) => {
      const visitorId = appt.visitorEmail // Using email as unique identifier
      const visitorName = appt.visitorName

      if (!groups.has(visitorId)) {
        groups.set(visitorId, {
          visitorId,
          visitorName,
          appointments: [],
        })
      }
      groups.get(visitorId)!.appointments.push(appt)
    })

    return Array.from(groups.values())
  }, [appointments])

  // Filter appointments based on search and status
  const filteredGroups = useMemo(() => {
    if (!searchTerm && statusFilter === "all") return groupedByVisitor

    return groupedByVisitor
      .map(group => ({
        ...group,
        appointments: group.appointments.filter((appt) => {
          const q = searchTerm.toLowerCase()
          const matchSearch = !q ||
            appt.visitorName.toLowerCase().includes(q) ||
            (appt.company && appt.company.toLowerCase().includes(q)) ||
            appt.visitorEmail.toLowerCase().includes(q) ||
            (appt.purpose && appt.purpose.toLowerCase().includes(q))
          const matchStatus = statusFilter === "all" || appt.status === statusFilter.toUpperCase()
          return matchSearch && matchStatus
        })
      }))
      .filter(group => group.appointments.length > 0)
  }, [groupedByVisitor, searchTerm, statusFilter])

  // Calendar helpers
  const getDayAppointments = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateStr = date.toLocaleDateString()
    return appointments.filter((a) => a.requestedDate === dateStr)
  }

  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const daysInMonth = Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }, (_, i) => i + 1)

  const statCards = [
    { label: "Total Requests", value: stats.total, bg: "bg-blue-50", iconColor: "text-blue-600", border: "border-slate-200", sub: "All time requests", subColor: "text-slate-500" },
    { label: "Pending", value: stats.pending, bg: "bg-amber-50", iconColor: "text-amber-500", border: "border-amber-200", sub: "Awaiting response", subColor: "text-amber-500" },
    { label: "Confirmed", value: stats.confirmed, bg: "bg-emerald-50", iconColor: "text-emerald-500", border: "border-emerald-200", sub: "Upcoming meetings", subColor: "text-emerald-500" },
    { label: "Completed", value: stats.completed, bg: "bg-blue-50", iconColor: "text-blue-500", border: "border-blue-200", sub: "Finished meetings", subColor: "text-blue-500" },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#004A96]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchAppointments} variant="outline">Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visitor Appointment Scheduling</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage and track visitor meeting requests</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn("gap-1.5 border-slate-200 text-slate-700 text-xs", view === "calendar" && "bg-slate-100")}
            onClick={() => setView(view === "list" ? "calendar" : "list")}
          >
            <CalendarDays className="h-4 w-4" />
            {view === "list" ? "Calendar View" : "List View"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className={cn("rounded-2xl border bg-white p-4 shadow-sm", s.border)}>
            <div className="flex items-center gap-3">
              <div className={cn("rounded-full p-2.5", s.bg)}>
                <CalendarDays className={cn("h-5 w-5", s.iconColor)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </div>
            <p className={cn("mt-2 text-[11px] font-medium", s.subColor)}>
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, company, email, or purpose..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 border-slate-200 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#004A96]/20"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <CalendarIcon className="mx-auto mb-3 h-12 w-12 text-slate-300" />
          <h3 className="text-base font-semibold text-slate-700">No Appointments Found</h3>
          <p className="text-sm text-slate-400 mt-1">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "No appointment requests have been received yet"}
          </p>
        </div>
      ) : view === "list" ? (
        /* List View - Grouped by Visitor */
        <div className="space-y-8">
          {filteredGroups.map((group) => (
            <VisitorSection
              key={group.visitorId}
              visitorId={group.visitorId}
              visitorName={group.visitorName}
              appointments={group.appointments}
              onUpdateStatus={updateAppointment}
              onViewDetails={(appt) => { setSelectedAppointment(appt); setDetailsOpen(true) }}
            />
          ))}
        </div>
      ) : (
        /* Calendar View */
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="sm" className="border-slate-200" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-base font-bold text-slate-900">
              {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
            </h3>
            <Button variant="outline" size="sm" className="border-slate-200" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array(startOfMonth.getDay()).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
            {daysInMonth.map((day) => {
              const dayAppts = getDayAppointments(day)
              const isToday = new Date().getDate() === day &&
                new Date().getMonth() === currentMonth.getMonth() &&
                new Date().getFullYear() === currentMonth.getFullYear()
              return (
                <div key={day} className={cn(
                  "min-h-[80px] rounded-xl border p-1.5 flex flex-col cursor-pointer hover:bg-slate-50 transition",
                  isToday ? "border-[#004A96] bg-blue-50" : "border-slate-100"
                )}>
                  <span className={cn("text-xs font-bold mb-1", isToday ? "text-[#004A96]" : "text-slate-500")}>
                    {day}
                  </span>
                  <div className="space-y-0.5">
                    {dayAppts.slice(0, 2).map((a) => (
                      <div
                        key={a.id}
                        className={cn(
                          "text-[9px] truncate rounded px-1 py-0.5",
                          a.status === "PENDING" ? "bg-amber-50 text-amber-600" :
                            a.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                        )}
                      >
                        {a.visitorName.split(" ")[0]}
                      </div>
                    ))}
                    {dayAppts.length > 2 && (
                      <span className="text-[9px] text-slate-400">+{dayAppts.length - 2} more</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-[#004A96]" />
              Appointment Details
            </DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-5">
              {/* Visitor Profile */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <AvatarFallback name={selectedAppointment.visitorName} size="lg" />
                <div>
                  <p className="font-bold text-slate-900 text-lg">{selectedAppointment.visitorName}</p>
                  {selectedAppointment.company && selectedAppointment.company !== "N/A" && (
                    <p className="text-sm text-slate-500">{selectedAppointment.company}</p>
                  )}
                  {selectedAppointment.designation && selectedAppointment.designation !== "N/A" && (
                    <p className="text-xs text-slate-400">{selectedAppointment.designation}</p>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm">
                <div className="space-y-2">
                  <p className="font-semibold text-slate-700 text-xs uppercase tracking-wide">Contact</p>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs break-all">{selectedAppointment.visitorEmail}</span>
                  </div>
                  {selectedAppointment.visitorPhone && selectedAppointment.visitorPhone !== "N/A" && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{selectedAppointment.visitorPhone}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-slate-700 text-xs uppercase tracking-wide">Meeting Details</p>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                    <span>{selectedAppointment.requestedDate} at {formatTime(selectedAppointment.requestedTime)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Duration: {selectedAppointment.duration}</span>
                  </div>
                  {selectedAppointment.location && selectedAppointment.location !== "N/A" && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="h-3.5 w-3.5 text-red-400" />
                      <span>{selectedAppointment.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Purpose */}
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <p className="text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">Purpose of Visit</p>
                <p className="text-sm text-slate-600">{selectedAppointment.purpose}</p>
              </div>

              {/* Notes */}
              <div>
                <Label className="text-xs text-slate-500 uppercase tracking-wide">Notes</Label>
                <Textarea
                  placeholder="Add meeting notes..."
                  className="mt-1 rounded-xl border-slate-200"
                  value={selectedAppointment.notes || ""}
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, notes: e.target.value })}
                />
              </div>

              {/* Status Update */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-500 uppercase tracking-wide">Status</Label>
                  <Select
                    value={selectedAppointment.status}
                    onValueChange={(v) => setSelectedAppointment({ ...selectedAppointment, status: v })}
                  >
                    <SelectTrigger className="mt-1 rounded-xl border-slate-200">
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

              {/* Meeting Link (if available) */}
              {selectedAppointment.meetingLink && (
                <div>
                  <Label className="text-xs text-slate-500 uppercase tracking-wide">Meeting Link</Label>
                  <Input
                    value={selectedAppointment.meetingLink}
                    className="mt-1 rounded-xl border-slate-200 bg-slate-50"
                    readOnly
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="outline" className="rounded-xl" onClick={() => setDetailsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="rounded-xl bg-[#004A96] text-white hover:bg-[#003d7a]"
                  onClick={() => {
                    if (selectedAppointment) {
                      updateAppointment(selectedAppointment.id, selectedAppointment.status, selectedAppointment.notes)
                      setDetailsOpen(false)
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
  )
}