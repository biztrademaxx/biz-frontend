"use client"

import { useState, useEffect, useId } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, animate } from "framer-motion"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, TrendingUp, TrendingDown, Calendar, CalendarDays, Loader2, Clock, ChevronRight, MoreHorizontal, LayoutGrid } from "lucide-react"
import { orgCardShell, orgPageHeader, orgPrimaryBtn } from "./organizer-dashboard-theme"
import { cn } from "@/lib/utils"
import { getEventDisplayImageUrl } from "@/lib/default-event-image"

interface DashboardStats {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: any
}

interface RecentEvent {
  id: string | number
  slug?: string
  title: string
  date?: string
  startDate?: string
  endDate?: string
  location?: string
  status: string
  attendees?: number
  registrations?: number
  revenue?: number
  type?: string
  bannerImage?: string
  thumbnailImage?: string
  images?: string[]
  currency?: string
}

interface DashboardOverviewProps {
  organizerId: string
  organizerName: string
  dashboardStats: DashboardStats[]
  recentEvents: RecentEvent[]
  onCreateEventClick: () => void
  onManageAttendeesClick: () => void
  onViewAnalyticsClick: () => void
  onSendMessageClick: () => void
  onViewAllEventsClick?: () => void
}

interface OrganizerAttendeeStats {
  totalAttendees: number
  eventsCount: number
  statusCounts: {
    NEW: number
    CONTACTED: number
    QUALIFIED: number
    CONVERTED: number
    FOLLOW_UP: number
    REJECTED: number
  }
}

function parseAnimatableMetric(value: string): number | null {
  if (value === "…" || value === "..." || value.trim() === "") return null
  const t = value.trim().replace(/,/g, "")
  const k = t.match(/^(\d+(?:\.\d+)?)\s*K$/i)
  if (k) return Math.round(parseFloat(k[1]) * 1000)
  const n = Number.parseInt(t, 10)
  return Number.isFinite(n) ? n : null
}

function AnimatedStatValue({ value, className }: { value: string; className?: string }) {
  const target = parseAnimatableMetric(value)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const t = parseAnimatableMetric(value)
    if (t === null) return
    const reduceMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduceMotion) {
      setDisplay(t)
      return
    }
    setDisplay(0)
    const ctrl = animate(0, t, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => ctrl.stop()
  }, [value])

  if (target === null) return <span className={className}>{value}</span>
  return <span className={className}>{display.toLocaleString()}</span>
}

function MetricSparkline({ trend, delay = 0 }: { trend: "up" | "down"; delay?: number }) {
  const rawId = useId()
  const gradId = `spark-${rawId.replace(/:/g, "")}`
  const d =
    trend === "up"
      ? "M 2 32 C 16 32, 22 20, 36 14 S 58 8, 70 6 S 86 5, 94 4"
      : "M 2 6 C 20 7, 32 14, 46 18 S 68 26, 82 28 S 90 29, 94 30"

  return (
    <div
      className="h-10 w-full overflow-hidden rounded-lg bg-gradient-to-t from-[#8E54E9]/[0.06] to-transparent px-0.5"
      aria-hidden
    >
      <svg viewBox="0 0 96 36" className="h-full w-full min-h-[2.25rem]" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8E54E9" />
            <stop offset="100%" stopColor="#4776E6" />
          </linearGradient>
        </defs>
        <motion.path
          d={d}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            pathLength: { duration: 1.35, delay, ease: [0.33, 1, 0.68, 1] },
          }}
        />
      </svg>
    </div>
  )
}

export default function DashboardOverview({
  organizerId,
  organizerName,
  dashboardStats,
  recentEvents,
  onCreateEventClick,
  onManageAttendeesClick,
  onViewAnalyticsClick,
  onSendMessageClick,
  onViewAllEventsClick,
}: DashboardOverviewProps) {
  const router = useRouter()
  const [attendeeStats, setAttendeeStats] = useState<OrganizerAttendeeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch total attendees data from backend (all events attendee leads count)
  useEffect(() => {
    const fetchAttendeeStats = async () => {
      try {
        setLoading(true)
        const data = await apiFetch<OrganizerAttendeeStats & { success?: boolean }>(
          `/api/organizers/${organizerId}/total-attendees`,
          { auth: true }
        )
        if (data && (data.success !== false)) {
          setAttendeeStats({
            totalAttendees: data.totalAttendees ?? 0,
            eventsCount: data.eventsCount ?? 0,
            statusCounts: data.statusCounts ?? {
              NEW: 0,
              CONTACTED: 0,
              QUALIFIED: 0,
              CONVERTED: 0,
              FOLLOW_UP: 0,
              REJECTED: 0,
            },
          })
        }
      } catch (err) {
        console.error("Error fetching attendee stats:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (organizerId) {
      fetchAttendeeStats()
    }
  }, [organizerId])

  // Calculate conversion rate
  const conversionRate = attendeeStats && attendeeStats.totalAttendees > 0 
    ? Math.round((attendeeStats.statusCounts.CONVERTED / attendeeStats.totalAttendees) * 100)
    : 0

  // Enhanced stats with real attendee data
  const enhancedStats = [
    {
      title: "Total Events",
      value: dashboardStats.find((stat) => stat.title === "Total Events")?.value || "0",
      change: dashboardStats.find((stat) => stat.title === "Total Events")?.change ?? "",
      trend: (dashboardStats.find((stat) => stat.title === "Total Events")?.trend ?? "up") as "up" | "down",
      icon: LayoutGrid,
    },
    {
      title: "Active Events",
      value: dashboardStats.find((stat) => stat.title === "Active Events")?.value || "0",
      change: dashboardStats.find((stat) => stat.title === "Active Events")?.change ?? "",
      trend: (dashboardStats.find((stat) => stat.title === "Active Events")?.trend ?? "up") as "up" | "down",
      icon: CalendarDays,
    },
    {
      title: "Total Attendees",
      value: loading ? "…" : attendeeStats ? attendeeStats.totalAttendees.toString() : "0",
      change: loading ? "" : dashboardStats.find((stat) => stat.title === "Total Attendees")?.change ?? "",
      trend: (dashboardStats.find((stat) => stat.title === "Total Attendees")?.trend ?? "up") as "up" | "down",
      icon: Users,
    },
  ]

  const getEventImage = (event: RecentEvent) => getEventDisplayImageUrl(event)

  const formatSlashDate = (dateString?: string) => {
    if (!dateString) return "—"
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return dateString
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}/${m}/${day}`
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return ""
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return ""
    const h = d.getHours()
    const m = d.getMinutes()
    const s = d.getSeconds()
    if (h === 0 && m === 0 && s === 0) return ""
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  }

  const publicationBadgeStyle = (raw: string) => {
    const s = raw?.toLowerCase?.() ?? ""
    const map: Record<string, { bg: string; text: string; border: string }> = {
      draft: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
      published: { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
      cancelled: { bg: "#FEF2F2", text: "#991B1B", border: "#FECACA" },
      archived: { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" },
      approved: { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
      rejected: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
      pending: { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" },
      active: { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
      planning: { bg: "#EDE9FE", text: "#5b21b6", border: "#C4B5FD" },
    }
    return map[s] ?? { bg: "#F3F4F6", text: "#374151", border: "#E5E7EB" }
  }

  const publicationLabel = (raw: string) => {
    const s = raw?.toLowerCase?.() ?? ""
    const labels: Record<string, string> = {
      draft: "Draft",
      published: "Published",
      cancelled: "Cancelled",
      archived: "Archived",
      approved: "Approved",
      rejected: "Rejected",
      pending: "Pending Review",
      active: "Active",
      planning: "Planning",
    }
    return labels[s] ?? raw
  }

  const openEventDashboard = (event: RecentEvent) => {
    const ref = event.slug ?? String(event.id)
    if (ref) router.push(`/event-dashboard/${ref}`)
  }

  return (
    <div className="w-full space-y-6">
      <header className={cn(orgPageHeader)}>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8E54E9]">Overview</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1E293B] sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Welcome back,{" "}
            <span className="font-medium text-[#334155]">{organizerName}</span>
          </p>
        </div>
        <Button
          type="button"
          onClick={onCreateEventClick}
          className={cn(orgPrimaryBtn, "h-11 shrink-0 rounded-xl px-5")}
        >
          <Plus className="h-4 w-4" />
          Create New Event
        </Button>
      </header>

      {/* Stats — compact Spectra-style metric tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {enhancedStats.map((stat, index) => (
          <div
            key={index}
            className={cn(
              "relative overflow-hidden rounded-2xl border border-[#ebe7f3] bg-white/90 p-5",
              "shadow-[0_6px_28px_rgba(99,102,241,0.07)] backdrop-blur-[2px]",
              "transition-shadow duration-200 hover:shadow-[0_10px_36px_rgba(142,84,233,0.11)]",
            )}
          >
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#8E54E9]/10 blur-2xl"
              aria-hidden
            />
            <div className="relative flex flex-col gap-2">
              <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold tabular-nums tracking-tight text-gray-900 lg:text-[1.85rem]">
                  {loading && stat.title === "Total Attendees" ? (
                    <Loader2 className="h-8 w-8 animate-spin text-[#8E54E9]" aria-label="Loading" />
                  ) : (
                    <AnimatedStatValue value={stat.value} />
                  )}
                </p>
                {!loading && stat.change ? (
                  <div
                    className={cn(
                      "inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                      stat.trend === "up"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100/80"
                        : "bg-rose-50 text-rose-700 ring-1 ring-rose-100/80",
                    )}
                  >
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-3.5 w-3.5 shrink-0 opacity-90" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 shrink-0 opacity-90" />
                    )}
                    <span>{stat.change}</span>
                  </div>
                ) : null}
              </div>
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                  "bg-gradient-to-br from-[#8E54E9]/18 to-[#4776E6]/12",
                  "text-[#5b21b6] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ring-1 ring-[#8E54E9]/18",
                )}
              >
                <stat.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
            </div>
            {!(loading && stat.title === "Total Attendees") ? (
              <MetricSparkline trend={stat.trend} delay={index * 0.12} />
            ) : null}
            </div>
          </div>
        ))}
      </div>
      {/* Recent Events */}
      <div>
        <Card className={orgCardShell}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Events</CardTitle>
            {onViewAllEventsClick ? (
              <button
                type="button"
                onClick={onViewAllEventsClick}
                className="flex items-center gap-0.5 text-sm font-medium text-[#6d28d9] transition hover:text-[#5b21b6]"
              >
                View All
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            ) : null}
          </CardHeader>
          <CardContent className="pt-0">
            {recentEvents.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No events to show yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentEvents.slice(0, 5).map((event) => {
                  const img = getEventImage(event)
                  const start = event.startDate || event.date
                  const end = event.endDate || event.startDate || event.date
                  const pb = publicationBadgeStyle(event.status)
                  const tStart = formatTime(start)
                  const tEnd = formatTime(end)
                  let timeLine = "—"
                  if (tStart && tEnd && tStart !== tEnd) timeLine = `${tStart} - ${tEnd}`
                  else if (tStart) timeLine = tStart
                  else if (tEnd) timeLine = tEnd

                  return (
                    <div
                      key={String(event.id)}
                      role="button"
                      tabIndex={0}
                      onClick={() => openEventDashboard(event)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          openEventDashboard(event)
                        }
                      }}
                      className="flex w-full cursor-pointer gap-4 rounded-xl py-4 text-left transition hover:bg-[#8E54E9]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E54E9]/25"
                    >
                      <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200/80">
                        <Image
                          src={img}
                          alt=""
                          fill
                          sizes="72px"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="min-w-0 flex-1 truncate pr-2 text-base font-semibold text-gray-900">
                            {event.title}
                          </h4>
                          <div className="flex shrink-0 items-center gap-2">
                            <span
                              className="whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium"
                              style={{
                                backgroundColor: pb.bg,
                                color: pb.text,
                                border: `1px solid ${pb.border}`,
                              }}
                            >
                              {publicationLabel(event.status)}
                            </span>
                            <button
                              type="button"
                              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                              aria-label="Event actions"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-5 w-5" aria-hidden />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 shrink-0 text-[#8E54E9]/80" aria-hidden />
                            <span>
                              {formatSlashDate(start)}
                              {end && formatSlashDate(end) !== formatSlashDate(start)
                                ? ` - ${formatSlashDate(end)}`
                                : null}
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-4 w-4 shrink-0 text-[#8E54E9]/80" aria-hidden />
                            <span>{timeLine}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <TrendingDown className="w-4 h-4" />
              <span>Error loading attendee data: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}