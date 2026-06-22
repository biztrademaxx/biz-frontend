"use client"

import { useState, useEffect, useId } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion, animate } from "framer-motion"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Plus,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  CalendarDays,
  Loader2,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  Heart,
  MapPin,
  Eye,
  MessageSquare,
  BarChart3,
  User,
  Building2,
  Crown,
  Check,
  Sparkles,
  FileCheck,
  UserPlus,
} from "lucide-react"
import { DashboardManagedBanner } from "@/components/dashboard-managed-banner"
import { orgAccentText, orgCardShell, orgPageHeader, orgPrimaryBtn, orgUpgradeCard } from "./organizer-dashboard-theme"
import { cn } from "@/lib/utils"
import { getEventDisplayImageUrl } from "@/lib/default-event-image"
import { eventPublicPath } from "@/lib/event-path"

interface DashboardStats {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: unknown
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
  city?: string
  state?: string
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
  onVenueBookingClick?: () => void
  onProfileClick?: () => void
  onUpgradeClick?: () => void
}

interface OrganizerAttendeeStats {
  totalAttendees: number
  eventsCount: number
  statusCounts: Record<string, number>
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
    <div className="mt-3 h-10 w-full overflow-hidden rounded-lg bg-gradient-to-t from-[#004A96]/[0.06] to-transparent" aria-hidden>
      <svg viewBox="0 0 96 36" className="h-full w-full min-h-[2.25rem]" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#004A96" />
            <stop offset="100%" stopColor="#003d7a" />
          </linearGradient>
        </defs>
        <motion.path
          d={d}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ pathLength: { duration: 1.35, delay, ease: [0.33, 1, 0.68, 1] } }}
        />
      </svg>
    </div>
  )
}

function formatEventDateBadge(dateString?: string) {
  if (!dateString) return { month: "TBD", day: "—", year: "" }
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return { month: "TBD", day: "—", year: "" }
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: String(d.getDate()),
    year: String(d.getFullYear()),
  }
}

function formatDateRange(start?: string, end?: string) {
  if (!start) return "Date TBD"
  const s = new Date(start)
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }
  if (!end) return s.toLocaleDateString("en-US", opts)
  const e = new Date(end)
  const startStr = s.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const endStr = e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  return `${startStr} – ${endStr}`
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
  onVenueBookingClick,
  onProfileClick,
  onUpgradeClick,
}: DashboardOverviewProps) {
  const router = useRouter()
  const [attendeeStats, setAttendeeStats] = useState<OrganizerAttendeeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAttendeeStats = async () => {
      try {
        setLoading(true)
        const data = await apiFetch<OrganizerAttendeeStats & { success?: boolean }>(
          `/api/organizers/${organizerId}/total-attendees`,
          { auth: true },
        )
        if (data && data.success !== false) {
          setAttendeeStats({
            totalAttendees: data.totalAttendees ?? 0,
            eventsCount: data.eventsCount ?? 0,
            statusCounts: data.statusCounts ?? {},
          })
        }
      } catch (err) {
        console.error("Error fetching attendee stats:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }
    if (organizerId) fetchAttendeeStats()
  }, [organizerId])

  const totalViews = recentEvents.reduce(
    (sum, e) => sum + Math.max(e.registrations ?? 0, e.attendees ?? 0) * 15,
    0,
  )

  const enhancedStats = [
    {
      title: "Total Events",
      value: dashboardStats.find((s) => s.title === "Total Events")?.value || "0",
      change: dashboardStats.find((s) => s.title === "Total Events")?.change ?? "+12%",
      trend: "up" as const,
      icon: LayoutGrid,
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      title: "Active Events",
      value: dashboardStats.find((s) => s.title === "Active Events")?.value || "0",
      change: dashboardStats.find((s) => s.title === "Active Events")?.change ?? "+3",
      trend: "up" as const,
      icon: CalendarDays,
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Total Attendees",
      value: loading ? "…" : String(attendeeStats?.totalAttendees ?? 0),
      change: dashboardStats.find((s) => s.title === "Total Attendees")?.change ?? "+18%",
      trend: "up" as const,
      icon: Users,
      iconBg: "bg-orange-50 text-orange-600",
    },
    {
      title: "Total Views",
      value: totalViews.toLocaleString(),
      change: "+24%",
      trend: "up" as const,
      icon: Eye,
      iconBg: "bg-red-50 text-red-600",
    },
  ]

  const upcomingEvents = recentEvents
    .filter((e) => {
      const start = e.startDate || e.date
      return start && new Date(start) > new Date()
    })
    .slice(0, 8)

  const scrollEvents = (dir: "left" | "right") => {
    const el = document.getElementById("org-upcoming-scroll")
    if (!el) return
    const amount = 320
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" })
  }

  const openEventDashboard = (event: RecentEvent) => {
    const ref = event.slug ?? String(event.id)
    if (ref) router.push(`/event-dashboard/${ref}`)
  }

  const publicationLabel = (raw: string) => {
    const s = raw?.toLowerCase?.() ?? ""
    const labels: Record<string, string> = {
      pending: "Pending Review",
      approved: "Approved",
      published: "Published",
      active: "Active",
      draft: "Draft",
    }
    return labels[s] ?? raw
  }

  const activityIcon = (status: string) => {
    const s = status?.toLowerCase?.() ?? ""
    if (s === "pending") return { icon: FileCheck, bg: "bg-amber-100 text-amber-600" }
    if (s === "approved" || s === "published") return { icon: Sparkles, bg: "bg-emerald-100 text-emerald-600" }
    return { icon: UserPlus, bg: "bg-blue-100 text-blue-600" }
  }

  const recentActivity = recentEvents.slice(0, 4).map((event) => {
    const { icon: Icon, bg } = activityIcon(event.status)
    const label =
      event.status?.toLowerCase() === "pending"
        ? `${event.title} submitted for review`
        : `New activity on ${event.title}`
    return {
      id: String(event.id),
      label,
      time: formatDateRange(event.startDate, event.endDate),
      status: publicationLabel(event.status),
      Icon,
      iconBg: bg,
    }
  })

  const quickActions = [
    { label: "Create New Event", icon: Plus, color: "bg-blue-50 text-blue-600", onClick: onCreateEventClick },
    { label: "Manage Events", icon: Calendar, color: "bg-emerald-50 text-emerald-600", onClick: onViewAllEventsClick },
    { label: "Messages", icon: MessageSquare, color: "bg-sky-50 text-sky-600", onClick: onSendMessageClick },
    { label: "Venue Booking", icon: Building2, color: "bg-orange-50 text-orange-600", onClick: onVenueBookingClick },
    { label: "Analytics", icon: BarChart3, color: "bg-indigo-50 text-indigo-600", onClick: onViewAnalyticsClick },
    { label: "My Profile", icon: User, color: "bg-slate-100 text-slate-600", onClick: onProfileClick },
  ]

  const proFeatures = ["Featured Listing", "Advanced Analytics", "Priority Support", "Unlimited Events"]

  return (
    <div className="w-full min-w-0 max-w-full space-y-6 sm:space-y-8">
      <header className={cn(orgPageHeader, "min-w-0 lg:items-center lg:gap-6")}>
        <div className="min-w-0 shrink-0 lg:max-w-[280px] xl:max-w-xs">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600 break-words">
            Welcome back, <span className="font-medium text-slate-800">{organizerName}</span>.
          </p>
        </div>
        <div className="flex min-w-0 w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <DashboardManagedBanner
            page="organizer-dashboard"
            variant="compact"
            className="!h-12 w-full min-w-0 max-w-full sm:!h-14 md:!h-16 sm:flex-1 md:max-w-3xl lg:-ml-2"
          />
          <Button type="button" onClick={onCreateEventClick} className={cn(orgPrimaryBtn, "h-11 w-full shrink-0 rounded-xl px-5 sm:w-auto")}>
            <Plus className="h-4 w-4" />
            Create New Event
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {enhancedStats.map((stat, index) => (
          <div key={stat.title} className={cn(orgCardShell, "p-5")}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">
                  {loading && stat.title === "Total Attendees" ? (
                    <Loader2 className="h-8 w-8 animate-spin text-[#004A96]" />
                  ) : (
                    <AnimatedStatValue value={stat.value} />
                  )}
                </p>
                {stat.change ? (
                  <span
                    className={cn(
                      "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                      stat.trend === "up" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
                    )}
                  >
                    {stat.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stat.change}
                  </span>
                ) : null}
              </div>
              <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", stat.iconBg)}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            {!(loading && stat.title === "Total Attendees") ? (
              <MetricSparkline trend={stat.trend} delay={index * 0.1} />
            ) : null}
          </div>
        ))}
      </div>

      {/* Upcoming Events row */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">Upcoming Events</h2>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onViewAllEventsClick ? (
              <button type="button" onClick={onViewAllEventsClick} className={cn("text-sm font-medium hover:underline", orgAccentText)}>
                View All &gt;
              </button>
            ) : null}
            <button type="button" onClick={() => scrollEvents("left")} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50" aria-label="Scroll left">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => scrollEvents("right")} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50" aria-label="Scroll right">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        {upcomingEvents.length === 0 ? (
          <Card className={orgCardShell}>
            <CardContent className="py-10 text-center text-sm text-slate-500">No upcoming events yet.</CardContent>
          </Card>
        ) : (
          <div id="org-upcoming-scroll" className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 hide-scrollbar sm:gap-4">
            {upcomingEvents.map((event) => {
              const img = getEventDisplayImageUrl(event)
              const badge = formatEventDateBadge(event.startDate || event.date)
              const interested = event.registrations ?? event.attendees ?? 0
              const location = event.location || [event.city, event.state].filter(Boolean).join(", ") || "Location TBD"

              return (
                <Card key={String(event.id)} className={cn(orgCardShell, "w-[min(85vw,280px)] shrink-0 overflow-hidden p-0 sm:w-[280px]")}>
                  <div className="relative aspect-[16/10] bg-slate-100">
                    <Image src={img} alt={event.title} fill sizes="280px" className="object-cover" />
                    <div className="absolute left-3 top-3 rounded-lg bg-white/95 px-2 py-1 text-center shadow-sm">
                      <p className={cn("text-[10px] font-bold uppercase", orgAccentText)}>{badge.month}</p>
                      <p className="text-lg font-bold leading-none text-slate-900">{badge.day}</p>
                      <p className="text-[10px] text-slate-500">{badge.year}</p>
                    </div>
                    {/* <button type="button" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm" aria-label="Favorite">
                      <Heart className="h-4 w-4 text-red-500" />
                    </button> */}
                  </div>
                  <CardContent className="p-4">
                    <p className="line-clamp-2 min-h-[2.5rem] text-sm font-bold text-slate-900">{event.title}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5 text-[#004A96]" />
                      {formatDateRange(event.startDate || event.date, event.endDate)}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-red-500" />
                      <span className="line-clamp-1">{location}</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{interested.toLocaleString()} Interested</p>
                    <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 w-fit">Upcoming</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 flex-1 text-xs sm:flex-none" onClick={() => openEventDashboard(event)}>
                          Manage
                        </Button>
                        <Button size="sm" className={cn("h-8 flex-1 text-xs sm:flex-none", orgPrimaryBtn)} asChild>
                          <Link href={eventPublicPath(event)}>View</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className={orgCardShell}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500">No recent activity.</p>
            ) : (
              recentActivity.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", item.iconBg)}>
                    <item.Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 line-clamp-2">{item.label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.time}</p>
                    <span className="mt-1 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className={orgCardShell}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-center transition hover:border-[#004A96]/20 hover:bg-blue-50/50"
                >
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", action.color)}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-slate-700">{action.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className={cn(orgUpgradeCard, "shadow-none")}>
          <CardContent className="p-0 pt-2">
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-amber-500" />
              <h3 className={cn("text-lg font-bold", orgAccentText)}>Upgrade to Pro</h3>
            </div>
            <ul className="mt-4 space-y-2">
              {proFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className="h-4 w-4 shrink-0 text-[#004A96]" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button type="button" className={cn("mt-5 w-full rounded-xl", orgPrimaryBtn)} onClick={onUpgradeClick}>
              Upgrade Now
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">Error loading attendee data: {error}</CardContent>
        </Card>
      ) : null}
    </div>
  )
}
