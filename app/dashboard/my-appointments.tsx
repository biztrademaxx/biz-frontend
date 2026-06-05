"use client"

import { useState, useEffect, useMemo } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  CalendarIcon,
  CalendarDays,
  Mail,
  Phone,
  MapPin,
  Users,
  Search,
  Loader2,
  Filter,
  Eye,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Video,
  MessageSquare,
  User,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { cn } from "@/lib/utils"

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
  // const cfg = STATUS_CONFIG[appt.status]
  // const StatusIcon = cfg.icon
  const { date, time } = formatDateTime(appt.scheduledAt)
  const requestedDate = formatDate(appt.createdAt)

  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      {/* Avatar */}
      <div className="shrink-0">
        {appt.exhibitorAvatar ? (
          <img
            src={appt.exhibitorAvatar}
            alt={appt.exhibitorName}
            className="h-14 w-14 rounded-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
          />
        ) : (
          <AvatarFallback name={appt.exhibitorName} />
        )}
      </div>

      {/* Name + org + event tag */}
      <div className="min-w-[150px] shrink-0">
        <p className="font-bold text-slate-900 text-base leading-tight">{appt.exhibitorName}</p>
        {appt.exhibitorCompany && (
          <p className="text-xs text-slate-500 mt-0.5">{appt.exhibitorCompany}</p>
        )}
        {appt.eventTitle && (
          <span className="mt-1.5 inline-block rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
            {appt.eventTitle}
          </span>
        )}
      </div>

      {/* Date/time */}
      <div className="flex items-start gap-2 text-sm text-slate-600 min-w-[130px]">
        <CalendarDays className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
        <div>
          <p className="font-medium text-slate-800">{date}</p>
          <p className="text-xs text-slate-500">{time}</p>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-start gap-2 text-sm text-slate-600 flex-1 min-w-[140px]">
        <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
        <div>
          <p className="font-medium text-slate-800">{appt.eventCity || appt.eventVenue || "TBD"}</p>
          {appt.boothNumber && <p className="text-xs text-slate-500">Hall 2, Booth {appt.boothNumber}</p>}
        </div>
      </div>

      {/* Status + meta */}
      {/* <div className="flex flex-col items-start gap-1 min-w-[110px]">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border", cfg.pill)}>
          <StatusIcon className="h-3.5 w-3.5" />
          {cfg.label}
        </span>
        {appt.status === "PENDING" && (
          <p className="text-[11px] text-slate-400 leading-tight">
            Requested on<br />{requestedDate}
          </p>
        )}
        {appt.status === "CONFIRMED" && (
          <p className="text-[11px] text-slate-400 leading-tight">
            Confirmed on<br />{requestedDate}
          </p>
        )}
      </div> */}

      {/* Actions */}
      <div className="flex flex-col gap-1.5 ml-auto shrink-0 min-w-[130px]">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-full border-slate-200 text-slate-700 text-xs gap-1.5"
          onClick={() => onViewDetails(appt)}
        >
          <User className="h-3.5 w-3.5" />
          View Profile
        </Button>

        {appt.status === "PENDING" && onCancel && (
          <>
            <Button
              size="sm"
              className="h-8 w-full bg-[#004A96] hover:bg-[#003d7a] text-white text-xs gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full border-red-200 text-red-500 hover:bg-red-50 text-xs gap-1.5"
              onClick={() => onCancel(appt.id)}
            >
              <XCircle className="h-3.5 w-3.5" />
              Decline
            </Button>
          </>
        )}

        {appt.status === "CONFIRMED" && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-full border-slate-200 text-slate-700 text-xs gap-1.5"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Message
          </Button>
        )}

        {(appt.status === "PENDING" || appt.status === "CONFIRMED") && !onCancel && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-full text-red-500 hover:bg-red-50 text-xs"
          >
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

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cn("h-5 w-5", cfg.sectionIconColor)} />
        <h3 className="text-base font-bold text-slate-800">{cfg.sectionTitle}</h3>
        <span className={cn("rounded-full border px-2 py-0.5 text-xs font-bold", cfg.pill)}>
          {appointments.length}
        </span>
      </div>

      {appointments.length > 0 ? (
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
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center">
          <Icon className={cn("mx-auto mb-2 h-10 w-10 opacity-25", cfg.sectionIconColor)} />
          <p className="text-sm text-slate-400">{cfg.emptyMsg}</p>
          {cfg.emptySubMsg && (
            <p className="text-xs text-slate-400 mt-1">{cfg.emptySubMsg}</p>
          )}
        </div>
      )}
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
      const data = await apiFetch<{ appointments?: Appointment[] }>(
        `/api/appointments?requesterId=${userId}`,
        { auth: true }
      )
      setAppointments(data.appointments ?? [])
    } catch (err) {
      setError("Failed to load appointments")
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
      toast({ title: "Appointment Cancelled", description: "Successfully cancelled." })
      fetchAppointments()
    } catch {
      toast({ title: "Error", description: "Failed to cancel appointment.", variant: "destructive" })
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
      (a.exhibitorName || "").toLowerCase().includes(q) ||
      (a.exhibitorCompany || "").toLowerCase().includes(q) ||
      (a.eventTitle || "").toLowerCase().includes(q)
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
      if (!a.scheduledAt) return false
      const ad = new Date(a.scheduledAt)
      return ad.getFullYear() === d.getFullYear() &&
        ad.getMonth() === d.getMonth() &&
        ad.getDate() === d.getDate()
    })
  }

  const statCards = [
    { label: "Total Requests", value: stats.total, icon: CalendarDays, bg: "bg-blue-50", iconColor: "text-blue-600", border: "border-slate-200", sub: `+${Math.max(0, stats.total - 1)} from last month`, subColor: "text-emerald-600", showArrow: true },
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
          <h2 className="text-2xl font-bold text-slate-900">My Appointments</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage and track your exhibitor meetings</p>
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
              {s.showArrow && <TrendingUp className="h-3 w-3" />}
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
            placeholder="Search by event, exhibitor, or company..."
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
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#004A96]/20"
          >
            <option value="all">All Events</option>
            {Array.from(new Set(appointments.map((a) => a.eventTitle).filter(Boolean))).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <CalendarIcon className="mx-auto mb-3 h-12 w-12 text-slate-300" />
          <h3 className="text-base font-semibold text-slate-700">No Appointments Yet</h3>
          <p className="text-sm text-slate-400 mt-1">You haven't scheduled any meetings with exhibitors yet.</p>
        </div>
      ) : view === "list" ? (
        /* ── List View ── */
        <div className="space-y-8">
          {(["PENDING", "CONFIRMED", "CANCELLED"] as const).map((status) => (
            <SectionBlock
              key={status}
              status={status}
              appointments={byStatus(status)}
              onCancel={cancelAppointment}
              onViewDetails={(appt) => { setSelectedAppointment(appt); setDetailsOpen(true) }}
            />
          ))}
        </div>
      ) : (
        /* ── Calendar View ── */
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
                  {/* {dayAppts.slice(0, 2).map((a) => {
                    // const cfg = STATUS_CONFIG[a.status]
                    // return (
                    //   // <span key={a.id} className={cn("truncate rounded px-1 py-0.5 text-[9px] font-semibold border mb-0.5", cfg.pill)}>
                    //   //   {a.exhibitorName}
                    //   // </span>
                    // )
                  })} */}
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
            // const cfg = STATUS_CONFIG[selectedAppointment.status]
            // const StatusIcon = cfg.icon
            const { date, time } = formatDateTime(selectedAppointment.scheduledAt)
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {selectedAppointment.exhibitorAvatar ? (
                    <img src={selectedAppointment.exhibitorAvatar} alt={selectedAppointment.exhibitorName}
                      className="h-12 w-12 rounded-full object-cover shrink-0" />
                  ) : (
                    <AvatarFallback name={selectedAppointment.exhibitorName} size="sm" />
                  )}
                  {/* <div>
                    <p className="font-bold text-slate-900">{selectedAppointment.exhibitorName}</p>
                    <p className="text-xs text-slate-500">{selectedAppointment.exhibitorCompany}</p>
                    <span className={cn("mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold", cfg.pill)}>
                      <StatusIcon className="h-3 w-3" />
                      {cfg.label}
                    </span>
                  </div> */}
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm">
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-700 text-xs uppercase tracking-wide">Appointment</p>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                      <span>{date} {time}</span>
                    </div>
                    {selectedAppointment.eventTitle && (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span>{selectedAppointment.eventTitle}</span>
                      </div>
                    )}
                    {selectedAppointment.boothNumber && (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin className="h-3.5 w-3.5 text-red-400" />
                        <span>Booth {selectedAppointment.boothNumber}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-700 text-xs uppercase tracking-wide">Contact</p>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate text-xs">{selectedAppointment.exhibitorEmail}</span>
                    </div>
                    {selectedAppointment.exhibitorPhone && (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{selectedAppointment.exhibitorPhone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedAppointment.notes && (
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-sm text-slate-600">
                    <p className="text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">Notes</p>
                    {selectedAppointment.notes}
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