"use client"

import { useEffect, useState, type ReactNode } from "react"
import { adminApi } from "@/lib/admin-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, CalendarDays, CalendarRange, CalendarClock, Globe2 } from "lucide-react"

type ActivityTotals = {
  events: number
  organizers: number
  exhibitors: number
  speakers: number
  bulkImports: number
  total: number
}

type ActivityPoint = ActivityTotals & { period: string }

type ResponseData = {
  generatedAt: string
  totals: ActivityTotals
  daily: ActivityPoint[]
  weekly: ActivityPoint[]
  monthly: ActivityPoint[]
  eventCountries?: { country: string; events: number }[]
}

export default function SubAdminAnalyticsPanel() {
  const [data, setData] = useState<ResponseData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await adminApi<{ success?: boolean; data?: ResponseData }>("/analytics/my-activity")
        if (!cancelled && res?.data) setData(res.data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <div className="text-sm text-muted-foreground">Loading analytics...</div>
  if (!data) return <div className="text-sm text-muted-foreground">No analytics data available.</div>

  const latestDaily = data.daily.slice(-7)
  const latestWeekly = data.weekly.slice(-6)
  const latestMonthly = data.monthly.slice(-6)
  const topCountries = (data.eventCountries ?? []).slice(0, 6)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">My Upload Analytics</h2>
        </div>
        <p className="text-xs text-muted-foreground">Updated {new Date(data.generatedAt).toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Stat title="Events" value={data.totals.events} />
        <Stat title="Organizers" value={data.totals.organizers} />
        <Stat title="Exhibitors" value={data.totals.exhibitors} />
        <Stat title="Speakers" value={data.totals.speakers} />
        <Stat title="Bulk Imports" value={data.totals.bulkImports} />
        <Stat title="Total" value={data.totals.total} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
        <SessionOverviewCard rows={latestDaily} />
        <ActivityBarCard
          title="Most Active Window"
          subtitle="Last 6 weeks"
          icon={<CalendarRange className="h-4 w-4 text-indigo-600" />}
          rows={latestWeekly}
          barClassName="bg-indigo-500"
        />
        <ActivityBarCard
          title="Monthly Momentum"
          subtitle="Last 6 months"
          icon={<CalendarClock className="h-4 w-4 text-emerald-600" />}
          rows={latestMonthly}
          barClassName="bg-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <CountryMapCard countries={topCountries} />
        <ActivityBarCard
          title="Daily Activity"
          subtitle="Last 7 days"
          icon={<CalendarDays className="h-4 w-4 text-blue-600" />}
          rows={latestDaily}
          barClassName="bg-blue-500"
        />
      </div>
    </div>
  )
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

function ActivityBarCard({
  title,
  subtitle,
  icon,
  rows,
  barClassName,
}: {
  title: string
  subtitle: string
  icon: ReactNode
  rows: ActivityPoint[]
  barClassName: string
}) {
  const maxTotal = Math.max(...rows.map((r) => r.total), 1)
  const current = rows[rows.length - 1]?.total ?? 0
  const previous = rows[rows.length - 2]?.total ?? 0
  const change = current - previous
  const changeLabel = previous > 0 ? `${((change / previous) * 100).toFixed(0)}%` : change > 0 ? "+100%" : "0%"
  const isUp = change >= 0

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          {icon}
        </div>
        <div className="text-sm">
          <span className="font-semibold text-slate-900">{current}</span>
          <span className={`ml-2 text-xs ${isUp ? "text-emerald-600" : "text-rose-600"}`}>
            {isUp ? "+" : ""}
            {changeLabel} vs previous
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity</p>
        ) : (
          rows.map((row) => {
            const width = `${Math.max((row.total / maxTotal) * 100, row.total > 0 ? 6 : 0)}%`
            return (
              <div key={row.period} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 truncate pr-2">{row.period}</span>
                  <span className="font-medium text-slate-900">{row.total}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-2 rounded-full ${barClassName}`} style={{ width }} />
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

function SessionOverviewCard({ rows }: { rows: ActivityPoint[] }) {
  const points = rows.map((row) => row.total)
  const max = Math.max(...points, 1)
  const linePoints = points
    .map((value, idx) => {
      const x = points.length <= 1 ? 0 : (idx / (points.length - 1)) * 100
      const y = 100 - (value / max) * 90
      return `${x},${y}`
    })
    .join(" ")
  const last = points[points.length - 1] ?? 0

  return (
    <Card className="border-slate-200 xl:col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Sessions Overview</CardTitle>
        <p className="text-xs text-muted-foreground">Daily activity trend (last 7 days)</p>
      </CardHeader>
      <CardContent>
        <div className="h-40 rounded-xl bg-slate-50 border border-slate-100 p-3">
          {points.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No activity</div>
          ) : (
            <svg viewBox="0 0 100 100" className="h-full w-full">
              <polyline fill="none" stroke="#3b82f6" strokeWidth="2.5" points={linePoints} />
              <polyline fill="none" stroke="#93c5fd" strokeWidth="8" opacity="0.2" points={linePoints} />
            </svg>
          )}
        </div>
        <div className="mt-3 text-sm text-slate-600">
          Current day total: <span className="font-semibold text-slate-900">{last}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function CountryMapCard({ countries }: { countries: { country: string; events: number }[] }) {
  const max = Math.max(...countries.map((c) => c.events), 1)
  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Top Location for Events</CardTitle>
          <Globe2 className="h-4 w-4 text-blue-600" />
        </div>
        <p className="text-xs text-muted-foreground">Countries where this sub-admin added events</p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50 h-44 flex items-center justify-center">
          <div className="text-center space-y-2 px-4">
            <Globe2 className="h-8 w-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500">World map view</p>
            <p className="text-xs text-slate-400">Country list at right shows event distribution</p>
          </div>
        </div>
        <div className="space-y-3">
          {countries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No event country data yet.</p>
          ) : (
            countries.map((item) => {
              const width = `${Math.max((item.events / max) * 100, 8)}%`
              return (
                <div key={item.country} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{item.country}</span>
                    <span className="font-semibold text-slate-900">{item.events}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width }} />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
