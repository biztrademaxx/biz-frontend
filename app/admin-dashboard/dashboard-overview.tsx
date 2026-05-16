"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import {
  Users,
  Calendar,
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Flag,
  Activity,
  Download,
  CalendarDays,
  MapPin,
} from "lucide-react"
import { apiFetch } from "@/lib/api"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { format, subDays, formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

const PLACEHOLDER_EVENT = "/images/gpex.jpg"

const iconMap: Record<string, any> = {
  Users,
  Calendar,
  Building2,
  DollarSign,
  CheckCircle,
}

const statVisual: Record<
  string,
  { iconWrap: string; icon: string; chart: string }
> = {
  blue: {
    iconWrap: "bg-blue-100",
    icon: "text-blue-600",
    chart: "#3b82f6",
  },
  purple: {
    iconWrap: "bg-violet-100",
    icon: "text-violet-600",
    chart: "#7c3aed",
  },
  green: {
    iconWrap: "bg-emerald-100",
    icon: "text-emerald-600",
    chart: "#10b981",
  },
  indigo: {
    iconWrap: "bg-indigo-100",
    icon: "text-indigo-600",
    chart: "#6366f1",
  },
  orange: {
    iconWrap: "bg-orange-100",
    icon: "text-orange-600",
    chart: "#f97316",
  },
  yellow: {
    iconWrap: "bg-amber-100",
    icon: "text-amber-600",
    chart: "#d97706",
  },
}

type TrendRow = {
  key: string
  label: string
  eventsCreated: number
  publishedEvents: number
  registrations: number
}

type DashboardEventCard = {
  id: string
  title: string
  status?: string
  startDate?: string
  endDate?: string
  createdAt?: string
  slug?: string | null
  city?: string | null
  country?: string | null
  isVirtual?: boolean
  bannerImage?: string | null
  thumbnailImage?: string | null
  images?: string[]
  currentAttendees?: number
  maxAttendees?: number | null
}

type DonutSlice = { name: string; status: string; value: number; color: string }

type TopEventRow = { id: string; title: string; registrations: number; maxAttendees: number | null }

type ActivityRow = {
  id: string
  action: string
  adminName: string
  resource: string
  timestamp: string
  icon: string
  imageUrl?: string | null
  eventStatus?: string
}

function pickEventImage(e: DashboardEventCard | null | undefined): string | null {
  if (!e) return null
  const thumb = e.thumbnailImage
  if (typeof thumb === "string" && thumb.trim()) return thumb.trim()
  if (Array.isArray(e.images) && e.images.length > 0 && typeof e.images[0] === "string" && e.images[0].trim()) {
    return e.images[0].trim()
  }
  const banner = e.bannerImage
  if (typeof banner === "string" && banner.trim()) return banner.trim()
  return null
}

function eventImageSrc(e: DashboardEventCard | null | undefined): string {
  return pickEventImage(e) || PLACEHOLDER_EVENT
}

function statusBadgeClass(status: string | undefined) {
  const s = (status || "").toUpperCase()
  if (s === "PUBLISHED") return "bg-emerald-100 text-emerald-700 border-emerald-200/80"
  if (s === "PENDING_APPROVAL") return "bg-orange-100 text-orange-800 border-orange-200/80"
  if (s === "DRAFT") return "bg-slate-100 text-slate-700 border-slate-200/80"
  if (s === "REJECTED") return "bg-red-100 text-red-700 border-red-200/80"
  return "bg-slate-100 text-slate-700 border-slate-200/80"
}

function formatEventStatusLabel(status: string | undefined) {
  const s = (status || "").toUpperCase()
  switch (s) {
    case "PUBLISHED":
      return "Published"
    case "PENDING_APPROVAL":
      return "Pending"
    case "DRAFT":
      return "Draft"
    case "REJECTED":
      return "Rejected"
    case "CANCELLED":
      return "Cancelled"
    case "COMPLETED":
      return "Completed"
    default:
      return status || "—"
  }
}

function formatLocation(e: DashboardEventCard) {
  if (e.isVirtual) return "Online"
  const parts = [e.city, e.country].filter((x) => typeof x === "string" && x.trim())
  if (parts.length) return parts.join(", ")
  return "—"
}

function MiniStatSparkline({ color, uid }: { color: string; uid: string }) {
  const data = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        i,
        v: 22 + Math.sin(i * 0.65) * 12 + i * 1.4,
      })),
    [],
  )
  const gid = `spark-${uid.replace(/[^a-zA-Z0-9]/g, "")}`
  return (
    <div className="mt-1 h-10 w-[5.5rem] shrink-0 sm:h-11 sm:w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gid})`}
            fillOpacity={1}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function DashboardOverview({
  onNavigate: _onNavigate,
}: {
  onNavigate?: (sectionId: string) => void
}) {
  void _onNavigate

  const [stats, setStats] = useState<any[]>([])
  const [activities, setActivities] = useState<ActivityRow[]>([])
  const [trend, setTrend] = useState<TrendRow[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<DashboardEventCard[]>([])
  const [registrationsByStatus, setRegistrationsByStatus] = useState<DonutSlice[]>([])
  const [topEvents, setTopEvents] = useState<TopEventRow[]>([])
  const [revenue, setRevenue] = useState<{ total: number; currency: string } | null>(null)

  const dateRangeLabel = useMemo(() => {
    const end = new Date()
    const start = subDays(end, 30)
    return `${format(start, "d MMM yyyy")} – ${format(end, "d MMM yyyy")}`
  }, [])

  const donutTotal = useMemo(
    () => registrationsByStatus.reduce((a, b) => a + (b.value || 0), 0),
    [registrationsByStatus],
  )

  const maxTopReg = useMemo(() => Math.max(1, ...topEvents.map((e) => e.registrations || 0)), [topEvents])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch<{
          success?: boolean
          data?: {
            totals?: {
              totalEvents?: number
              publishedEvents?: number
              organizers?: number
              exhibitors?: number
              venues?: number
              attendees?: number
            }
            recentEvents?: DashboardEventCard[]
            recentRegistrations?: Array<{
              id: string
              registeredAt?: string
              createdAt?: string
              user?: { firstName?: string; lastName?: string }
              event?: DashboardEventCard | null
            }>
            upcomingEvents?: DashboardEventCard[]
            dashboardCharts?: { trend?: TrendRow[] }
            registrationsByStatus?: DonutSlice[]
            topEvents?: TopEventRow[]
            revenue?: { total: number; currency: string }
          }
          stats?: any[]
          activities?: ActivityRow[]
        }>("/api/admin/dashboard", { auth: true })

        const payload = data.data

        if (payload?.dashboardCharts?.trend?.length) setTrend(payload.dashboardCharts.trend)
        else setTrend([])

        setUpcomingEvents(Array.isArray(payload?.upcomingEvents) ? payload!.upcomingEvents! : [])
        setRegistrationsByStatus(Array.isArray(payload?.registrationsByStatus) ? payload!.registrationsByStatus! : [])
        setTopEvents(Array.isArray(payload?.topEvents) ? payload!.topEvents! : [])
        setRevenue(payload?.revenue && typeof payload.revenue.total === "number" ? payload.revenue : null)

        if (data.success !== false && payload?.totals) {
          const t = payload.totals
          setStats([
            { title: "Total Events", value: t.totalEvents ?? 0, trend: "up", change: "—", icon: "Calendar", color: "blue" },
            { title: "Published Events", value: t.publishedEvents ?? 0, trend: "up", change: "—", icon: "CheckCircle", color: "purple" },
            { title: "Organizers", value: t.organizers ?? 0, trend: "up", change: "—", icon: "Building2", color: "green" },
            { title: "Attendees", value: t.attendees ?? 0, trend: "up", change: "—", icon: "Users", color: "orange" },
          ])
        } else if (Array.isArray((data as any).stats)) {
          setStats((data as any).stats)
        }

        if (Array.isArray((data as any).activities)) {
          setActivities((data as any).activities as ActivityRow[])
        } else if (payload?.recentEvents?.length || payload?.recentRegistrations?.length) {
          const acts: ActivityRow[] = []
          payload.recentEvents?.slice(0, 5).forEach((e: DashboardEventCard, i: number) => {
            acts.push({
              id: `event-${e.id}-${i}`,
              action: "Event created",
              adminName: "System",
              resource: e.title,
              timestamp: (e.createdAt as string) || new Date().toISOString(),
              icon: "default",
              imageUrl: pickEventImage(e),
              eventStatus: e.status,
            })
          })
          payload.recentRegistrations?.slice(0, 5).forEach((r, i) => {
            const name = r.user ? `${r.user.firstName || ""} ${r.user.lastName || ""}`.trim() || "Visitor" : "Visitor"
            acts.push({
              id: `reg-${r.id}-${i}`,
              action: "New registration",
              adminName: name,
              resource: r.event?.title || "Event",
              timestamp: r.registeredAt || r.createdAt || new Date().toISOString(),
              icon: "success",
              imageUrl: pickEventImage(r.event ?? undefined),
              eventStatus: r.event?.status,
            })
          })
          setActivities(acts)
        } else {
          setActivities([])
        }
      } catch (error) {
        console.error("Error loading dashboard:", error)
        setStats([])
        setActivities([])
        setTrend([])
        setUpcomingEvents([])
        setRegistrationsByStatus([])
        setTopEvents([])
        setRevenue(null)
      }
    }
    load()
  }, [])

  const fmtMoney = (n: number, cur: string) => {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: cur || "USD", maximumFractionDigits: 0 }).format(n)
    } catch {
      return `$${n.toFixed(0)}`
    }
  }

  const sortedActivities = useMemo(() => {
    const list = [...(activities ?? [])]
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return list
  }, [activities])

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">System overview and key metrics</p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            className="h-10 justify-center rounded-2xl border-gray-200 bg-white text-xs font-medium text-gray-700 shadow-sm sm:text-sm"
          >
            <CalendarDays className="mr-2 h-4 w-4 text-gray-500" />
            {dateRangeLabel}
          </Button>
          <Button
            variant="outline"
            className="h-10 flex items-center gap-2 rounded-2xl border-gray-200 bg-white font-semibold text-gray-800 shadow-sm hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* System Stats — same metrics & values as before */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">
        {(stats ?? []).map((stat, index) => {
          const Icon = iconMap[stat.icon] || Users
          const pal = statVisual[stat.color] ?? statVisual.blue
          return (
            <div
              key={index}
              className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900 sm:text-3xl">{stat.value}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={cn(
                        "text-sm font-medium",
                        stat.trend === "up" ? "text-emerald-600" : "text-red-600",
                      )}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className={cn("rounded-2xl p-3 shadow-inner ring-1 ring-black/[0.04]", pal.iconWrap)}>
                    <Icon className={cn("h-6 w-6", pal.icon)} />
                  </div>
                  <MiniStatSparkline color={pal.chart} uid={`${stat.title}-${index}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Event overview — full width (Quick Actions removed) */}
      <Card className="rounded-3xl border-gray-100 bg-white shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b border-gray-50 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Event overview</CardTitle>
          <span className="rounded-full border border-gray-100 bg-slate-50 px-3 py-1 text-xs font-medium text-gray-600">
            Last 30 days
          </span>
        </CardHeader>
        <CardContent className="pt-5">
          {trend.length > 0 ? (
            <div className="h-[300px] w-full min-h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trend} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#94a3b8" interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" allowDecimals={false} width={36} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Area
                    type="basis"
                    dataKey="eventsCreated"
                    name="Events created"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="#3b82f6"
                    fillOpacity={0.14}
                  />
                  <Area
                    type="basis"
                    dataKey="publishedEvents"
                    name="Events published (new)"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="#8b5cf6"
                    fillOpacity={0.14}
                  />
                  <Area
                    type="basis"
                    dataKey="registrations"
                    name="Registrations"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="#10b981"
                    fillOpacity={0.14}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-gray-500">No trend data for this period.</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity (timeline) + Upcoming + Registrations overview */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3 xl:gap-6">
        <Card className="rounded-3xl border-gray-100 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            {sortedActivities.length > 0 ? (
              <div className="relative">
                {sortedActivities.map((activity, i) => {
                  const src = activity.imageUrl?.trim() || null
                  const ext = src?.startsWith("http")
                  const showThumb = Boolean(src)
                  return (
                    <div key={activity.id} className="flex gap-4">
                      <div className="flex w-14 shrink-0 flex-col items-center">
                        <div
                          className={cn(
                            "relative z-10 flex shrink-0 items-center justify-center overflow-hidden ring-4 ring-white shadow-md",
                            showThumb ? "h-12 w-12 rounded-full" : "h-12 w-12 rounded-full",
                          )}
                        >
                          {showThumb ? (
                            <Image
                              src={src!}
                              alt=""
                              width={48}
                              height={48}
                              className="h-12 w-12 object-cover"
                              unoptimized={!!ext}
                            />
                          ) : (
                            <div
                              className={cn(
                                "flex h-12 w-12 items-center justify-center rounded-full ring-1 ring-black/[0.06]",
                                activity.icon === "success"
                                  ? "bg-emerald-100"
                                  : activity.icon === "error"
                                    ? "bg-red-100"
                                    : "bg-sky-100",
                              )}
                            >
                              {activity.icon === "success" ? (
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                              ) : activity.icon === "error" ? (
                                <Flag className="h-5 w-5 text-red-600" />
                              ) : (
                                <Calendar className="h-5 w-5 text-sky-600" />
                              )}
                            </div>
                          )}
                        </div>
                        {i < sortedActivities.length - 1 ? (
                          <div className="mt-2 min-h-[1.25rem] w-px flex-1 bg-gradient-to-b from-slate-200 to-slate-100" />
                        ) : null}
                      </div>
                      <div
                        className={cn(
                          "min-w-0 flex-1 border-b border-slate-100 pb-6",
                          i === sortedActivities.length - 1 && "border-b-0 pb-0",
                        )}
                      >
                        <p className="font-semibold text-gray-900">{activity.action}</p>
                        <p className="mt-1 text-sm leading-snug text-gray-600">
                          <span className="font-medium text-gray-800">{activity.adminName}</span>
                          <span className="text-gray-400"> — </span>
                          {activity.resource}
                        </p>
                        {activity.eventStatus ? (
                          <Badge
                            variant="outline"
                            className={cn("mt-2 text-[10px] font-semibold", statusBadgeClass(activity.eventStatus))}
                          >
                            {formatEventStatusLabel(activity.eventStatus)}
                          </Badge>
                        ) : null}
                        <p className="mt-2 text-xs font-medium text-gray-400">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No recent activity found.</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-gray-100 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[min(420px,65vh)] space-y-3 overflow-y-auto pt-5">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((ev) => {
                const img = eventImageSrc(ev)
                const ext = img.startsWith("http")
                const start = ev.startDate ? new Date(ev.startDate) : null
                const end = ev.endDate ? new Date(ev.endDate) : null
                const dateLabel =
                  start && end
                    ? `${format(start, "d MMM")} – ${format(end, "d MMM yyyy")}`
                    : start
                      ? format(start, "d MMM yyyy")
                      : "—"
                return (
                  <div
                    key={ev.id}
                    className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm ring-1 ring-black/[0.02]"
                  >
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl">
                      <Image src={img} alt="" fill className="object-cover" sizes="80px" unoptimized={ext} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">{ev.title}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                        {dateLabel}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                        <span className="truncate">{formatLocation(ev)}</span>
                      </p>
                      <Badge variant="outline" className={cn("mt-2 text-[10px] font-semibold", statusBadgeClass(ev.status))}>
                        {formatEventStatusLabel(ev.status)}
                      </Badge>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-gray-500">No upcoming events in the schedule.</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-gray-100 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Registrations overview</CardTitle>
            <p className="text-xs font-normal text-gray-500">Event mix by status</p>
          </CardHeader>
          <CardContent className="relative pt-2">
            {registrationsByStatus.length > 0 ? (
              <div className="relative mx-auto h-[288px] w-full max-w-sm">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={registrationsByStatus as any[]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="48%"
                      innerRadius={62}
                      outerRadius={88}
                      paddingAngle={2}
                    >
                      {registrationsByStatus.map((entry, j) => (
                        <Cell key={`cell-${j}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number, name: string) => [`${v} events`, name]} />
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      wrapperStyle={{ fontSize: "11px", paddingLeft: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute left-[42%] top-[44%] z-10 -translate-x-1/2 -translate-y-1/2 text-center sm:left-[44%]">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Total</p>
                  <p className="text-xl font-bold tabular-nums text-gray-900">{donutTotal}</p>
                </div>
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-gray-500">No registration overview data.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue + Top events + System status */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        <Card className="rounded-3xl border-gray-100 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Revenue overview</CardTitle>
            <p className="text-xs font-normal text-gray-500">Confirmed registration totals</p>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-baseline gap-1">
                  <DollarSign className="h-7 w-7 text-blue-600" />
                  <span className="text-3xl font-bold tabular-nums text-gray-900">
                    {revenue ? fmtMoney(revenue.total, revenue.currency) : "—"}
                  </span>
                </div>
                <p className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">From confirmed sign-ups</span>
                </p>
              </div>
              <MiniStatSparkline color="#3b82f6" uid="revenue-spark" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-gray-100 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Top performing events</CardTitle>
            <p className="text-xs font-normal text-gray-500">By current attendees</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            {topEvents.length > 0 ? (
              topEvents.map((te) => (
                <div key={te.id}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                    <span className="line-clamp-1 min-w-0 font-medium text-gray-900">{te.title}</span>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-gray-600">
                      {te.registrations} registrations
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                      style={{ width: `${Math.min(100, (te.registrations / maxTopReg) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No events to rank yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-gray-100 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">System status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            {[
              { label: "Website", detail: "Operational" },
              { label: "Email service", detail: "Operational" },
              { label: "Payment gateway", detail: "Operational" },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-2xl border border-emerald-100/80 bg-emerald-50/40 px-4 py-3"
              >
                <span className="text-sm font-medium text-gray-800">{row.label}</span>
                <span className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <CheckCircle className="h-4 w-4" />
                  {row.detail}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
