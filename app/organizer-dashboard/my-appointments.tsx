"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  CalendarIcon,
  CalendarDays,
  Mail,
  Phone,
  Search,
  Loader2,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  User,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Building2,
  MapPin,
  Clock,
  Users,
  Target,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

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
    venueName?: string
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

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    pill: "text-amber-600 bg-amber-50 border border-amber-200",
    icon: AlertCircle,
    dot: "bg-amber-500",
    sectionTitle: "Pending Meetings",
    sectionIcon: AlertCircle,
    sectionIconColor: "text-amber-500",
    badgeBg: "bg-amber-50 text-amber-600 border-amber-200",
    emptyMsg: "No pending meetings",
    emptySubMsg: "",
  },
  CONFIRMED: {
    label: "Confirmed",
    pill: "text-emerald-600 bg-emerald-50 border border-emerald-200",
    icon: CheckCircle2,
    dot: "bg-emerald-500",
    sectionTitle: "Confirmed Meetings",
    sectionIcon: CheckCircle2,
    sectionIconColor: "text-emerald-500",
    badgeBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
    emptyMsg: "No confirmed meetings",
    emptySubMsg: "",
  },
  CANCELLED: {
    label: "Cancelled",
    pill: "text-red-500 bg-red-50 border border-red-200",
    icon: XCircle,
    dot: "bg-red-400",
    sectionTitle: "Cancelled Meetings",
    sectionIcon: XCircle,
    sectionIconColor: "text-red-400",
    badgeBg: "bg-red-50 text-red-500 border-red-200",
    emptyMsg: "No cancelled meetings",
    emptySubMsg: "",
  },
  COMPLETED: {
    label: "Completed",
    pill: "text-gray-500 bg-gray-50 border border-gray-200",
    icon: CheckCircle2,
    dot: "bg-gray-400",
    sectionTitle: "Completed Meetings",
    sectionIcon: CheckCircle2,
    sectionIconColor: "text-gray-500",
    badgeBg: "bg-gray-50 text-gray-500 border-gray-200",
    emptyMsg: "No completed meetings",
    emptySubMsg: "",
  },
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "N/A"
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })
}

function formatDateTime(dateStr?: string) {
  if (!dateStr) return { date: "TBD", time: "" }
  const d = new Date(dateStr)
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  }
}

// Extract city and country from location string
function getLocationCityCountry(locationStr?: string): string {
  if (!locationStr) return "Location TBD"

  // If location is like "East Godavari, Andhra Pradesh, India" - extract city and country
  const parts = locationStr.split(',').map(p => p.trim())
  if (parts.length >= 3) {
    // Return city and country (first and last parts)
    return `${parts[0]}, ${parts[parts.length - 1]}`
  }
  if (parts.length === 2) {
    return locationStr
  }
  return locationStr
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

function AppointmentCard({
  appt,
  onCancel,
  onViewDetails,
}: {
  appt: Appointment
  onCancel?: (id: string) => void
  onViewDetails: (appt: Appointment) => void
}) {
  const { date, time } = formatDateTime(appt.requestedDate)
  const locationDisplay = getLocationCityCountry(appt.location)
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "VENUE_TOUR": return "Venue Tour"
      case "MEETING": return "Meeting"
      case "CONSULTATION": return "Consultation"
      default: return type
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      {/* Venue Name on top - shown on mobile */}
      <div className="w-full sm:hidden mb-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[#004A96]" />
          <p className="font-semibold text-slate-900">{appt.venue.venueName || `${appt.venue.firstName} ${appt.venue.lastName}`}</p>
        </div>
      </div>

      {/* Avatar */}
      <div className="shrink-0">
        {appt.venue.avatar ? (
          <img
            src={appt.venue.avatar}
            alt={`${appt.venue.firstName} ${appt.venue.lastName}`}
            className="h-14 w-14 rounded-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
          />
        ) : (
          <AvatarFallback name={`${appt.venue.firstName} ${appt.venue.lastName}`} />
        )}
      </div>

      {/* Name + venue info */}
      <div className="min-w-[180px] shrink-0">
        {/* Venue Name - hidden on mobile, shown on desktop */}
        <div className="hidden sm:flex items-center gap-2 mb-1">
          <Building2 className="h-4 w-4 text-[#004A96]" />
          <p className="font-semibold text-slate-900">{appt.venue.venueName || `${appt.venue.firstName} ${appt.venue.lastName}`}</p>
        </div>
        <p className="font-bold text-slate-900 text-base leading-tight">{appt.title}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          with {appt.venue.firstName} {appt.venue.lastName}
        </p>
        {appt.requesterCompany && (
          <p className="text-xs text-slate-400 mt-1">{appt.requesterCompany}</p>
        )}
        <div className="mt-1.5 flex flex-wrap gap-1">
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">
            {getTypeLabel(appt.type)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">
            {appt.meetingType === "IN_PERSON" ? "In Person" : appt.meetingType === "VIRTUAL" ? "Virtual" : "Phone"}
          </span>
        </div>
      </div>

      {/* Date/time */}
      <div className="flex items-start gap-2 text-sm text-slate-600 min-w-[130px]">
        <CalendarDays className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
        <div>
          <p className="font-medium text-slate-800">{date}</p>
          <p className="text-xs text-slate-500">{time}</p>
        </div>
      </div>

      {/* Duration & Location */}
      <div className="flex items-start gap-2 text-sm text-slate-600 flex-1 min-w-[140px]">
        <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-red-400" />
        <div>
          <p className="font-medium text-slate-800">{locationDisplay}</p>
          <p className="text-xs text-slate-500">{appt.duration} minutes</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1.5 ml-auto shrink-0 min-w-[130px]">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-full border-slate-200 text-slate-700 text-xs gap-1.5"
          onClick={() => onViewDetails(appt)}
        >
          <Eye className="h-3.5 w-3.5" />
          View Details
        </Button>

        {(appt.status === "PENDING" || appt.status === "CONFIRMED") && onCancel && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-full border-red-200 text-red-500 hover:bg-red-50 text-xs gap-1.5"
            onClick={() => onCancel(appt.id)}
          >
            <XCircle className="h-3.5 w-3.5" />
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}

function SectionBlock({
  status,
  appointments,
  onCancel,
  onViewDetails,
}: {
  status: keyof typeof STATUS_CONFIG
  appointments: Appointment[]
  onCancel?: (id: string) => void
  onViewDetails: (appt: Appointment) => void
}) {
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.sectionIcon

  if (appointments.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cn("h-5 w-5", cfg.sectionIconColor)} />
        <h3 className="text-base font-bold text-slate-800">{cfg.sectionTitle}</h3>
        <span className={cn("rounded-full border px-2 py-0.5 text-xs font-bold", cfg.pill)}>
          {appointments.length}
        </span>
      </div>

      <div className="space-y-3">
        {appointments.map((appt) => (
          <AppointmentCard
            key={appt.id}
            appt={appt}
            onCancel={status === "PENDING" || status === "CONFIRMED" ? onCancel : undefined}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  )
}

export function MyAppointments({ userId }: MyAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [view, setView] = useState<"list" | "calendar">("list")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const { toast } = useToast()

  useEffect(() => { fetchAppointments() }, [userId])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/venue-appointments?requesterId=${userId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch appointments")
      }

      const result = await response.json()
      console.log("Appointments data:", result.data) // Debug log
      setAppointments(result.data || [])
    } catch (err) {
      console.error("Error fetching appointments:", err)
      setError("Failed to load appointments")
    } finally {
      setLoading(false)
    }
  }

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/venue-appointments`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appointmentId, status: "CANCELLED" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to cancel appointment")
      }

      toast({ title: "Appointment Cancelled", description: "Successfully cancelled." })
      fetchAppointments()
      setDetailsOpen(false)
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to cancel appointment", variant: "destructive" })
    }
  }

  const stats = useMemo(() => ({
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "PENDING").length,
    confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
    completed: appointments.filter((a) => a.status === "COMPLETED").length,
  }), [appointments])

  const filtered = appointments.filter((a) => {
    const q = searchTerm.toLowerCase()
    const matchSearch = !q ||
      (a.title || "").toLowerCase().includes(q) ||
      (a.venue?.firstName || "").toLowerCase().includes(q) ||
      (a.venue?.lastName || "").toLowerCase().includes(q) ||
      (a.venue?.venueName || "").toLowerCase().includes(q) ||
      (a.requesterCompany || "").toLowerCase().includes(q) ||
      (a.purpose || "").toLowerCase().includes(q) ||
      (a.location || "").toLowerCase().includes(q)
    const matchStatus = statusFilter === "all" || a.status === statusFilter.toUpperCase()
    return matchSearch && matchStatus
  })

  const byStatus = (s: Appointment["status"]) => filtered.filter((a) => a.status === s)

  // Calendar
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const daysInMonth = Array.from({ length: endOfMonth.getDate() }, (_, i) => i + 1)
  const getDayAppts = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return appointments.filter((a) => {
      if (!a.requestedDate) return false
      const ad = new Date(a.requestedDate)
      return ad.getFullYear() === d.getFullYear() &&
        ad.getMonth() === d.getMonth() &&
        ad.getDate() === d.getDate()
    })
  }

  const statCards = [
    { label: "Total Requests", value: stats.total, icon: CalendarDays, bg: "bg-blue-50", iconColor: "text-blue-600", border: "border-slate-200", sub: `${stats.total} total meetings`, subColor: "text-blue-600", showArrow: false },
    { label: "Pending", value: stats.pending, icon: AlertCircle, bg: "bg-amber-50", iconColor: "text-amber-500", border: "border-amber-200", sub: "Waiting for response", subColor: "text-amber-500", showArrow: false },
    { label: "Confirmed", value: stats.confirmed, icon: CheckCircle2, bg: "bg-emerald-50", iconColor: "text-emerald-500", border: "border-emerald-200", sub: "Upcoming meetings", subColor: "text-emerald-500", showArrow: false },
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
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Venue Appointments</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage and track your venue meeting requests</p>
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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {statCards.map((s) => (
          <div key={s.label} className={cn("rounded-2xl border bg-white p-4 shadow-sm", s.border)}>
            <div className="flex items-center gap-3">
              <div className={cn("rounded-full p-2.5", s.bg)}>
                <s.icon className={cn("h-5 w-5", s.iconColor)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </div>
            <p className={cn("mt-2 text-[11px] font-medium flex items-center gap-0.5", s.subColor)}>
              {!s.showArrow && <span className={cn("inline-block h-1.5 w-1.5 rounded-full mr-1", s.iconColor.replace("text-", "bg-"))} />}
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
            placeholder="Search by title, venue, company, or location..."
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
          <h3 className="text-base font-semibold text-slate-700">No Appointments Yet</h3>
          <p className="text-sm text-slate-400 mt-1">You haven't scheduled any meetings with venues yet.</p>
        </div>
      ) : view === "list" ? (
        <div className="space-y-8">
          {(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map((status) => {
            const statusAppointments = byStatus(status)
            if (statusAppointments.length === 0) return null
            return (
              <SectionBlock
                key={status}
                status={status}
                appointments={statusAppointments}
                onCancel={cancelAppointment}
                onViewDetails={(appt) => { setSelectedAppointment(appt); setDetailsOpen(true) }}
              />
            )
          })}
        </div>
      ) : (
        /* Calendar View */
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="sm" onClick={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
            }>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-base font-bold text-slate-900">
              {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
            </h3>
            <Button variant="outline" size="sm" onClick={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
            }>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array(startOfMonth.getDay()).fill(null).map((_, i) => <div key={`e-${i}`} />)}
            {daysInMonth.map((day) => {
              const dayAppts = getDayAppts(day)
              const isToday = new Date().getDate() === day &&
                new Date().getMonth() === currentMonth.getMonth() &&
                new Date().getFullYear() === currentMonth.getFullYear()
              return (
                <div key={day} className={cn(
                  "min-h-[76px] rounded-xl border p-1.5 flex flex-col",
                  isToday ? "border-[#004A96] bg-blue-50" : "border-slate-100 hover:bg-slate-50"
                )}>
                  <span className={cn("text-xs font-bold mb-1", isToday ? "text-[#004A96]" : "text-slate-500")}>
                    {day}
                  </span>
                  {dayAppts.slice(0, 2).map((a) => (
                    <div key={a.id} className="text-[9px] truncate text-slate-600 mb-0.5">
                      {a.title}
                    </div>
                  ))}
                  {dayAppts.length > 2 && <span className="text-[9px] text-slate-400">+{dayAppts.length - 2}</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (() => {
            const { date, time } = formatDateTime(selectedAppointment.requestedDate)
            const locationDisplay = getLocationCityCountry(selectedAppointment.location)
            const getTypeLabel = (type: string) => {
              switch (type) {
                case "VENUE_TOUR": return "Venue Tour"
                case "MEETING": return "Meeting"
                case "CONSULTATION": return "Consultation"
                default: return type
              }
            }

            return (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {selectedAppointment.venue.avatar ? (
                    <img src={selectedAppointment.venue.avatar} alt={`${selectedAppointment.venue.firstName} ${selectedAppointment.venue.lastName}`}
                      className="h-12 w-12 rounded-full object-cover shrink-0" />
                  ) : (
                    <AvatarFallback name={`${selectedAppointment.venue.firstName} ${selectedAppointment.venue.lastName}`} size="sm" />
                  )}
                  <div>
                    <p className="font-bold text-slate-900">{selectedAppointment.venue.venueName || `${selectedAppointment.venue.firstName} ${selectedAppointment.venue.lastName}`}</p>
                    <p className="text-xs text-slate-500">{selectedAppointment.title}</p>
                  </div>
                </div>

                {/* Meeting Details Section */}
                <div className="rounded-xl border border-slate-100 bg-gradient-to-r from-blue-50 to-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Meeting Details
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CalendarDays className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span>{date} at {time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span>{selectedAppointment.duration} minutes</span>
                    </div>
                    {locationDisplay !== "Location TBD" && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-3.5 w-3.5 text-red-400 shrink-0" />
                        <span>{locationDisplay}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Target className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span>{getTypeLabel(selectedAppointment.type)} • {selectedAppointment.meetingType === "IN_PERSON" ? "In Person" : selectedAppointment.meetingType === "VIRTUAL" ? "Virtual" : "Phone"}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm">
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-700 text-xs uppercase tracking-wide">Contact</p>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate text-xs">{selectedAppointment.venue.email}</span>
                    </div>
                    {selectedAppointment.requesterPhone && (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{selectedAppointment.requesterPhone}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-700 text-xs uppercase tracking-wide">Organization</p>
                    {selectedAppointment.requesterCompany && (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        <span>{selectedAppointment.requesterCompany}</span>
                      </div>
                    )}
                    {selectedAppointment.requesterTitle && (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span>{selectedAppointment.requesterTitle}</span>
                      </div>
                    )}
                    {selectedAppointment.expectedAttendees && (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span>{selectedAppointment.expectedAttendees} attendees</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedAppointment.purpose && (
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-sm text-slate-600">
                    <p className="text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">Purpose</p>
                    {selectedAppointment.purpose}
                  </div>
                )}

                {(selectedAppointment.agenda?.length ?? 0) > 0 && (
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                    <p className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Agenda</p>
                    <ul className="space-y-1">
                      {selectedAppointment.agenda.map((item, idx) => (
                        <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(selectedAppointment.status === "PENDING" || selectedAppointment.status === "CONFIRMED") && (
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-500 hover:bg-red-50 text-xs gap-1.5"
                      onClick={() => { cancelAppointment(selectedAppointment.id); setDetailsOpen(false) }}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Cancel Appointment
                    </Button>
                  </div>
                )}
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}