"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { apiFetch } from "@/lib/api"
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Video,
  MessageSquare,
  User,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Appointment {
  id: string
  title: string
  exhibitorName: string
  exhibitorOrg?: string
  exhibitorAvatar?: string
  exhibitorTag?: string
  date: string
  location?: string
  booth?: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  requestedOn?: string
  confirmedOn?: string
}

interface ExhibitorScheduleProps {
  userId: string
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "text-amber-600 bg-amber-50 border border-amber-200",
    icon: AlertCircle,
    dot: "bg-amber-500",
    section: "Pending Meetings",
    sectionIcon: AlertCircle,
    sectionColor: "text-amber-500",
    emptyMsg: "No pending meetings",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-emerald-600 bg-emerald-50 border border-emerald-200",
    icon: CheckCircle2,
    dot: "bg-emerald-500",
    section: "Confirmed Meetings",
    sectionIcon: CheckCircle2,
    sectionColor: "text-emerald-500",
    emptyMsg: "No confirmed meetings",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-500 bg-red-50 border border-red-200",
    icon: XCircle,
    dot: "bg-red-500",
    section: "Cancelled Meetings",
    sectionIcon: XCircle,
    sectionColor: "text-red-400",
    emptyMsg: "No cancelled meetings",
  },
  completed: {
    label: "Completed",
    color: "text-slate-500 bg-slate-50 border border-slate-200",
    icon: CheckCircle2,
    dot: "bg-purple-400",
    section: "Completed Meetings",
    sectionIcon: CheckCircle2,
    sectionColor: "text-purple-400",
    emptyMsg: "No completed meetings yet",
  },
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return { date: "TBD", time: "" }
  const d = new Date(dateStr)
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  return { date, time }
}

function AvatarFallback({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  return (
    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#004A96] to-blue-400 flex items-center justify-center text-white text-lg font-bold shrink-0">
      {initials}
    </div>
  )
}

function AppointmentCard({
  appt,
  onAccept,
  onDecline,
}: {
  appt: Appointment
  onAccept?: (id: string) => void
  onDecline?: (id: string) => void
}) {
  const cfg = STATUS_CONFIG[appt.status]
  const StatusIcon = cfg.icon
  const { date, time } = formatDateTime(appt.date)
  const requestedDate = appt.requestedOn ? formatDateTime(appt.requestedOn).date : date
  const confirmedDate = appt.confirmedOn ? formatDateTime(appt.confirmedOn).date : null

  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      {/* Avatar */}
      <div className="shrink-0">
        {appt.exhibitorAvatar ? (
          <img
            src={appt.exhibitorAvatar}
            alt={appt.exhibitorName}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <AvatarFallback name={appt.exhibitorName} />
        )}
      </div>

      {/* Name + org + tag */}
      <div className="min-w-[160px] shrink-0">
        <p className="font-bold text-slate-900 text-base leading-tight">{appt.exhibitorName}</p>
        {appt.exhibitorOrg && (
          <p className="text-xs text-slate-500 mt-0.5">{appt.exhibitorOrg}</p>
        )}
        {appt.exhibitorTag && (
          <span className="mt-1.5 inline-block rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
            {appt.exhibitorTag}
          </span>
        )}
      </div>

      {/* Date/time */}
      <div className="flex items-start gap-2 text-sm text-slate-600 min-w-[130px]">
        <Calendar className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
        <div>
          <p className="font-medium text-slate-800">{date}</p>
          <p className="text-xs text-slate-500">{time}</p>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-start gap-2 text-sm text-slate-600 flex-1 min-w-[140px]">
        <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
        <div>
          <p className="font-medium text-slate-800">{appt.location || "TBD"}</p>
          {appt.booth && <p className="text-xs text-slate-500">{appt.booth}</p>}
        </div>
      </div>

      {/* Status badge + meta */}
      <div className="flex flex-col items-start gap-1 min-w-[110px]">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", cfg.color)}>
          <StatusIcon className="h-3.5 w-3.5" />
          {cfg.label}
        </span>
        {appt.status === "pending" && (
          <p className="text-[11px] text-slate-400 leading-tight">
            Requested on<br />{requestedDate}
          </p>
        )}
        {appt.status === "confirmed" && confirmedDate && (
          <p className="text-[11px] text-slate-400 leading-tight">
            Confirmed on<br />{confirmedDate}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-1.5 ml-auto shrink-0 min-w-[130px]">
        <Button variant="outline" size="sm" className="h-8 w-full border-slate-200 text-slate-700 text-xs gap-1.5">
          <User className="h-3.5 w-3.5" />
          View Profile
        </Button>

        {appt.status === "pending" && onAccept && onDecline && (
          <>
            <Button
              size="sm"
              className="h-8 w-full bg-[#004A96] hover:bg-[#003d7a] text-white text-xs gap-1.5"
              onClick={() => onAccept(appt.id)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full border-red-200 text-red-500 hover:bg-red-50 text-xs gap-1.5"
              onClick={() => onDecline(appt.id)}
            >
              <XCircle className="h-3.5 w-3.5" />
              Decline
            </Button>
          </>
        )}

        {appt.status === "confirmed" && (
          <>
            <Button variant="outline" size="sm" className="h-8 w-full border-slate-200 text-slate-700 text-xs gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Message
            </Button>
            <Button size="sm" className="h-8 w-full bg-[#004A96] hover:bg-[#003d7a] text-white text-xs gap-1.5">
              <Video className="h-3.5 w-3.5" />
              Join Meeting
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

function SectionHeader({
  status,
  count,
}: {
  status: keyof typeof STATUS_CONFIG
  count: number
}) {
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.sectionIcon
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className={cn("h-5 w-5", cfg.sectionColor)} />
      <h3 className="text-base font-bold text-slate-800">{cfg.section}</h3>
      <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", cfg.color)}>{count}</span>
    </div>
  )
}

export function ExhibitorSchedule({ userId }: ExhibitorScheduleProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"list" | "calendar">("list")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    setLoading(true)
    apiFetch<{ appointments?: any[] }>(`/api/appointments?requesterId=${userId}`, { auth: true })
      .then((data) => {
        const formatted: Appointment[] = (data.appointments || []).map((e: any) => ({
          id: e.id,
          title: e.eventTitle || e.eventName || `Meeting with ${e.exhibitorName}`,
          exhibitorName: e.exhibitorName || e.requesterName || "Unknown",
          exhibitorOrg: e.exhibitorOrganization || e.organization || e.companyName,
          exhibitorAvatar: e.exhibitorAvatar || e.avatar || e.profileImage,
          exhibitorTag: e.eventTitle || e.eventName,
          date: e.scheduledAt || e.createdAt,
          location: e.location || e.city,
          booth: e.booth || e.boothNumber,
          status: (e.status || "pending").toLowerCase() as Appointment["status"],
          requestedOn: e.createdAt,
          confirmedOn: e.confirmedAt,
        }))
        setAppointments(formatted)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [userId])

  const handleAccept = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "confirmed", confirmedOn: new Date().toISOString() } : a))
    )
  }

  const handleDecline = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a))
    )
  }

  const filtered = appointments.filter((a) => {
    const matchSearch =
      !search ||
      a.exhibitorName.toLowerCase().includes(search.toLowerCase()) ||
      (a.exhibitorOrg || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.exhibitorTag || "").toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || a.status === statusFilter
    return matchSearch && matchStatus
  })

  const byStatus = (status: Appointment["status"]) =>
    filtered.filter((a) => a.status === status)

  const stats = [
    {
      label: "Total Requests",
      value: appointments.length,
      icon: Calendar,
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
      sub: `+${Math.max(0, appointments.length - 1)} from last month`,
      subColor: "text-emerald-600",
      border: "border-slate-200",
    },
    {
      label: "Pending",
      value: appointments.filter((a) => a.status === "pending").length,
      icon: AlertCircle,
      bg: "bg-amber-50",
      iconColor: "text-amber-500",
      sub: "Waiting for response",
      subColor: "text-amber-500",
      border: "border-amber-200",
    },
    {
      label: "Confirmed",
      value: appointments.filter((a) => a.status === "confirmed").length,
      icon: CheckCircle2,
      bg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      sub: "Upcoming meetings",
      subColor: "text-emerald-500",
      border: "border-emerald-200",
    },
    {
      label: "Completed",
      value: appointments.filter((a) => a.status === "completed").length,
      icon: CheckCircle2,
      bg: "bg-purple-50",
      iconColor: "text-purple-500",
      sub: "This month",
      subColor: "text-purple-500",
      border: "border-purple-200",
    },
  ]

  // Calendar view helpers
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const daysInMonth = Array.from({ length: endOfMonth.getDate() }, (_, i) => i + 1)
  const getDayAppts = (day: number) => {
    const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return appointments.filter((a) => {
      if (!a.date) return false
      const d = new Date(a.date)
      return d.getFullYear() === dayDate.getFullYear() &&
        d.getMonth() === dayDate.getMonth() &&
        d.getDate() === dayDate.getDate()
    })
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
            <Calendar className="h-4 w-4" />
            {view === "list" ? "Calendar View" : "List View"}
          </Button>
          <Button size="sm" className="gap-1.5 bg-[#004A96] hover:bg-[#003d7a] text-white text-xs">
            <Plus className="h-4 w-4" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i} className={cn("rounded-2xl border bg-white p-4 shadow-sm", s.border)}>
            <div className="flex items-center gap-3">
              <div className={cn("rounded-full p-2.5", s.bg)}>
                <s.icon className={cn("h-5 w-5", s.iconColor)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </div>
            <p className={cn("mt-2 text-[11px] font-medium", s.subColor)}>
              {i === 0 && <TrendingUp className="inline h-3 w-3 mr-0.5" />}
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by event, exhibitor, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : view === "list" ? (
        /* ── List View ── */
        <div className="space-y-8">
          {(["pending", "confirmed", "completed", "cancelled"] as const).map((status) => {
            const list = byStatus(status)
            const cfg = STATUS_CONFIG[status]
            return (
              <div key={status}>
                <SectionHeader status={status} count={list.length} />
                {list.length > 0 ? (
                  <div className="space-y-3">
                    {list.map((appt) => (
                      <AppointmentCard
                        key={appt.id}
                        appt={appt}
                        onAccept={status === "pending" ? handleAccept : undefined}
                        onDecline={status === "pending" ? handleDecline : undefined}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center">
                    <cfg.sectionIcon className={cn("mx-auto mb-2 h-10 w-10 opacity-30", cfg.sectionColor)} />
                    <p className="text-sm text-slate-400">{cfg.emptyMsg}</p>
                    {status === "completed" && (
                      <p className="text-xs text-slate-400 mt-1">Your completed meetings will appear here.</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
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
            {Array(startOfMonth.getDay()).fill(null).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {daysInMonth.map((day) => {
              const dayAppts = getDayAppts(day)
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === currentMonth.getMonth() &&
                new Date().getFullYear() === currentMonth.getFullYear()
              return (
                <div
                  key={day}
                  className={cn(
                    "min-h-[80px] rounded-xl border p-1.5 flex flex-col",
                    isToday ? "border-[#004A96] bg-blue-50" : "border-slate-100 hover:bg-slate-50"
                  )}
                >
                  <span className={cn(
                    "text-xs font-bold mb-1",
                    isToday ? "text-[#004A96]" : "text-slate-500"
                  )}>
                    {day}
                  </span>
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    {dayAppts.slice(0, 2).map((a) => {
                      const cfg = STATUS_CONFIG[a.status]
                      return (
                        <span
                          key={a.id}
                          className={cn("truncate rounded px-1 py-0.5 text-[9px] font-semibold", cfg.color)}
                        >
                          {a.exhibitorName}
                        </span>
                      )
                    })}
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
    </div>
  )
}