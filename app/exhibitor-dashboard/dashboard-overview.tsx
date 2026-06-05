"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calendar,
  CalendarDays,
  ChevronRight,
  Mail,
  MapPin,
  Package,
  Phone,
  TrendingUp,
  Users,
} from "lucide-react"
import { apiFetch } from "@/lib/api"
import {
  buildExhibitorLeadChartData,
  filterExhibitorLeadsByPeriod,
  mergeExhibitorLeads,
  summarizeExhibitorLeads,
  type ExhibitorLeadPeriod,
  type ExhibitorLeadRow,
} from "@/lib/exhibitor-leads"
import { cn } from "@/lib/utils"
import { exAccentText, exCardShell, exPrimaryBtn } from "./dashboard-theme"

interface ExhibitorOverviewProps {
  exhibitor: {
    id: string
    firstName: string
    lastName: string
    displayName?: string
    organizationName?: string | null
    company?: string | null
    email: string
    phone?: string
    avatar?: string
    location?: string
    jobTitle?: string
    activeEvents: number
    totalProducts: number
    profileViews: number
  }
  onNavigate: (section: string) => void
}

interface AppointmentRow {
  id: string
  visitorName: string
  requestedDate: string
  requestedTime: string
  purpose: string
  status: string
}

interface ProductRow {
  id: string
  name: string
  category?: string
}

function MiniSparkline({ stroke = "#004A96" }: { stroke?: string }) {
  return (
    <svg viewBox="0 0 80 24" className="mt-3 h-6 w-full" preserveAspectRatio="none" aria-hidden>
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points="0,18 12,14 24,16 36,10 48,12 60,6 72,8 80,4"
      />
    </svg>
  )
}

function StatCard({
  title,
  value,
  trend,
  icon: Icon,
  iconClass,
  loading,
}: {
  title: string
  value: string | number
  trend: string
  icon: typeof Calendar
  iconClass: string
  loading?: boolean
}) {
  return (
    <Card className={cn(exCardShell, "overflow-hidden")}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "—" : value}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />
              {trend}
            </p>
          </div>
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
              iconClass,
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        </div>
        <MiniSparkline />
      </CardContent>
    </Card>
  )
}

function leadStatusClass(status: string) {
  const s = status.toLowerCase()
  if (s === "new") return "bg-emerald-50 text-emerald-700"
  if (s === "contacted") return "bg-blue-50 text-[#004A96]"
  return "bg-slate-100 text-slate-600"
}

function formatLeadDate(ts: string) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatAppointmentDate(date: string) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return { month: "—", day: "—" }
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: String(d.getDate()),
  }
}

export function ExhibitorDashboardOverview({ exhibitor, onNavigate }: ExhibitorOverviewProps) {
  const [leadsCount, setLeadsCount] = useState<number | null>(null)
  const [appointmentsCount, setAppointmentsCount] = useState<number | null>(null)
  const [allLeads, setAllLeads] = useState<ExhibitorLeadRow[]>([])
  const [leadPeriod, setLeadPeriod] = useState<ExhibitorLeadPeriod>("this-month")
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentRow[]>([])
  const [topProducts, setTopProducts] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)

  const periodLeads = useMemo(
    () => filterExhibitorLeadsByPeriod(allLeads, leadPeriod),
    [allLeads, leadPeriod],
  )
  const leadChartData = useMemo(
    () => buildExhibitorLeadChartData(allLeads, leadPeriod),
    [allLeads, leadPeriod],
  )
  const leadSummary = useMemo(() => summarizeExhibitorLeads(periodLeads), [periodLeads])
  const recentLeads = useMemo(() => allLeads.slice(0, 4), [allLeads])

  const displayName =
    exhibitor.displayName?.trim() ||
    `${exhibitor.firstName} ${exhibitor.lastName}`.replace(/\s+/g, " ").trim()

  const initials = (() => {
    const parts = displayName.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase()
    }
    return displayName.slice(0, 2).toUpperCase() || "EX"
  })()

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [leadsRes, followersRes, connectionsRes, requestsRes, apptRes, productsRes] =
          await Promise.all([
            apiFetch<{ count?: number; totalLeads?: number }>(
              `/api/exhibitors/${exhibitor.id}/leads-count`,
              { auth: true },
            ).catch(() => ({ count: 0 })),
            apiFetch<{
              success?: boolean
              followers?: {
                id: string
                firstName: string
                lastName: string
                company?: string | null
                jobTitle?: string | null
                followedAt: string
              }[]
            }>(`/api/follow/followers/${exhibitor.id}`, { auth: true }).catch(() => ({
              followers: [],
            })),
            apiFetch<{
              connections?: {
                id: string
                firstName: string
                lastName: string
                company?: string | null
                jobTitle?: string | null
                status: string
                createdAt?: string
                updatedAt?: string
              }[]
            }>("/api/connections", { auth: true }).catch(() => ({ connections: [] })),
            apiFetch<{
              connections?: {
                id: string
                firstName: string
                lastName: string
                company?: string | null
                jobTitle?: string | null
                status: string
                createdAt?: string
              }[]
            }>("/api/connections/requests", { auth: true }).catch(() => ({ connections: [] })),
            apiFetch<{ appointments?: AppointmentRow[] }>(
              `/api/appointments?exhibitorId=${encodeURIComponent(exhibitor.id)}`,
              { auth: true },
            ).catch(() => ({ appointments: [] })),
            apiFetch<{ products?: ProductRow[] }>(
              `/api/exhibitors/${encodeURIComponent(exhibitor.id)}/products`,
              { auth: true },
            ).catch(() => ({ products: [] })),
          ])

        if (cancelled) return

        setLeadsCount(Number(leadsRes?.count ?? leadsRes?.totalLeads ?? 0))

        const mergedLeads = mergeExhibitorLeads(
          followersRes?.followers ?? [],
          connectionsRes?.connections ?? [],
          requestsRes?.connections ?? [],
          exhibitor.id,
        )
        setAllLeads(mergedLeads)

        const appts: AppointmentRow[] = apptRes?.appointments ?? []
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const upcoming = appts
          .filter((a) => {
            const d = new Date(a.requestedDate)
            return !Number.isNaN(d.getTime()) && d >= today
          })
          .sort((a, b) => new Date(a.requestedDate).getTime() - new Date(b.requestedDate).getTime())
          .slice(0, 3)
        setAppointmentsCount(appts.length)
        setUpcomingAppointments(upcoming)

        const products = productsRes?.products ?? []
        setTopProducts(products.slice(0, 3))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [exhibitor.id])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          Welcome back, {displayName}! 👋
        </h1>
        <p className="mt-1 text-slate-600">Here&apos;s what&apos;s happening with your exhibitions today.</p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#004A96] via-[#003d7a] to-[#002f5e] p-6 text-white shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <CalendarDays className="h-6 w-6" />
            </span>
            <div>
              <p className="text-lg font-bold">Boost Your Booth Visibility</p>
              <p className="mt-1 max-w-xl text-sm text-sky-100">
                Promote your products and reach more qualified buyers at upcoming trade fairs.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="shrink-0 bg-white text-[#004A96] hover:bg-sky-50"
            onClick={() => onNavigate("promotions")}
          >
            Explore Promotion Options
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Active Events"
          value={exhibitor.activeEvents}
          trend="+12%"
          icon={Calendar}
          iconClass="bg-[#004A96]"
          loading={loading}
        />
        <StatCard
          title="Products"
          value={exhibitor.totalProducts}
          trend="+8%"
          icon={Package}
          iconClass="bg-sky-600"
          loading={loading}
        />
        <StatCard
          title="Leads"
          value={leadsCount ?? 0}
          trend="+18%"
          icon={Users}
          iconClass="bg-indigo-600"
          loading={loading}
        />
        <StatCard
          title="Appointments"
          value={appointmentsCount ?? 0}
          trend="+5%"
          icon={CalendarDays}
          iconClass="bg-[#004A96]"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className={cn(exCardShell, "lg:col-span-2")}>
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
            <CardTitle className="text-lg font-bold text-slate-900">Exhibitor Leads Overview</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: "this-month" as const, label: "This Month" },
                  { id: "3-months" as const, label: "3 Months" },
                  { id: "1-year" as const, label: "1 Year" },
                ] as const
              ).map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  size="sm"
                  variant={leadPeriod === option.id ? "outline" : "ghost"}
                  className={cn(
                    "h-8 text-xs",
                    leadPeriod === option.id ? "border-slate-200" : "text-slate-500",
                  )}
                  onClick={() => setLeadPeriod(option.id)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={leadChartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="exLeadFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#004A96" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#004A96" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    stroke="#004A96"
                    strokeWidth={2}
                    fill="url(#exLeadFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4">
              {[
                { label: "Total Leads", value: loading ? "—" : leadSummary.total },
                { label: "New Leads", value: loading ? "—" : leadSummary.new },
                { label: "Connected", value: loading ? "—" : leadSummary.connected },
                { label: "Followers", value: loading ? "—" : leadSummary.followers },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-slate-50 px-3 py-2 text-center">
                  <p className="text-lg font-bold text-slate-900">{item.value}</p>
                  <p className="text-xs text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className={exCardShell}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold text-slate-900">Recent Leads</CardTitle>
            <button
              type="button"
              className={cn("text-xs font-medium hover:underline", exAccentText)}
              onClick={() => onNavigate("follow")}
            >
              View All
            </button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLeads.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">No leads yet</p>
            ) : (
              recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-blue-50 text-xs font-semibold text-[#004A96]">
                      {(lead.name || "?").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{lead.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {[lead.jobTitle, lead.company].filter(Boolean).join(" · ") || "Visitor"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{formatLeadDate(lead.timestamp)}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                      leadStatusClass(lead.status),
                    )}
                  >
                    {lead.status || "new"}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className={exCardShell}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold text-slate-900">Upcoming Appointments</CardTitle>
            <button
              type="button"
              className={cn("text-xs font-medium hover:underline", exAccentText)}
              onClick={() => onNavigate("appointments")}
            >
              View All
            </button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="py-6 text-center text-sm text-slate-500">Loading appointments…</p>
            ) : upcomingAppointments.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">No upcoming appointments</p>
            ) : (
              upcomingAppointments.map((appt) => {
                const badge = formatAppointmentDate(appt.requestedDate)
                return (
                  <div
                    key={appt.id}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 p-3"
                  >
                    <div className="shrink-0 rounded-lg bg-blue-50 px-2 py-1.5 text-center">
                      <p className="text-[10px] font-bold uppercase text-[#004A96]">{badge.month}</p>
                      <p className="text-lg font-bold leading-none text-slate-900">{badge.day}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{appt.visitorName}</p>
                      <p className="text-xs text-slate-500">
                        {appt.requestedTime || "—"} · {appt.purpose || "Meeting"}
                      </p>
                      <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        {appt.status || "Scheduled"}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card className={exCardShell}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold text-slate-900">Top Viewed Products</CardTitle>
            <button
              type="button"
              className={cn("text-xs font-medium hover:underline", exAccentText)}
              onClick={() => onNavigate("products")}
            >
              View All
            </button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="py-6 text-center text-sm text-slate-500">Loading products…</p>
            ) : topProducts.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">No products listed yet</p>
            ) : (
              topProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#004A96]">
                    <Package className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                    {product.category ? (
                      <p className="truncate text-xs text-slate-500">{product.category}</p>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className={exCardShell}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold text-slate-900">Profile Summary</CardTitle>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 border-slate-200 text-xs"
              onClick={() => onNavigate("company")}
            >
              Edit Profile
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-16 w-16 ring-2 ring-blue-100">
                <AvatarImage src={exhibitor.avatar} alt={displayName} />
                <AvatarFallback className="bg-blue-50 text-lg font-bold text-[#004A96]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h3 className="mt-3 text-base font-bold text-slate-900">{displayName}</h3>
              <p className="text-sm text-slate-500">
                {exhibitor.company || exhibitor.organizationName || "Exhibitor"}
              </p>
              <div className="mt-4 w-full space-y-2 text-left text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-[#004A96]" />
                  <span className="truncate">{exhibitor.email}</span>
                </p>
                {exhibitor.phone ? (
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-[#004A96]" />
                    <span>{exhibitor.phone}</span>
                  </p>
                ) : null}
                {exhibitor.location ? (
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-[#004A96]" />
                    <span className="truncate">{exhibitor.location}</span>
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                className={cn("mt-4 w-full", exPrimaryBtn)}
                onClick={() => onNavigate("company")}
              >
                View Full Profile
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
