"use client"

import { useEffect, useState } from "react"
import { adminApi } from "@/lib/admin-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Globe2 } from "lucide-react"

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
  const typeBreakdown = [
    { label: "Events", value: data.totals.events, color: "#2563eb" },
    { label: "Organizers", value: data.totals.organizers, color: "#14b8a6" },
    { label: "Exhibitors", value: data.totals.exhibitors, color: "#f97316" },
    { label: "Speakers", value: data.totals.speakers, color: "#7c3aed" },
    { label: "Bulk", value: data.totals.bulkImports, color: "#ef4444" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold tracking-tight">My Upload Analytics</h2>
        </div>
        <p className="text-xs text-muted-foreground">Updated {new Date(data.generatedAt).toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TopCard title="Total Uploads" value={data.totals.total} trend={latestDaily.map((x) => x.total)} tone="blue" />
        <TopCard title="Events Uploaded" value={data.totals.events} trend={latestWeekly.map((x) => x.total)} tone="emerald" />
        <TopCard title="Bulk Imports" value={data.totals.bulkImports} trend={latestMonthly.map((x) => x.total)} tone="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SessionOverviewCard rows={latestDaily} />
        <MostActiveCard rows={latestWeekly} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CountryMapCard countries={topCountries} />
        <DistributionDonutCard items={typeBreakdown} total={data.totals.total} />
      </div>
    </div>
  )
}

function TopCard({
  title,
  value,
  trend,
  tone,
}: {
  title: string
  value: number
  trend: number[]
  tone: "blue" | "emerald" | "orange"
}) {
  const toneMap = {
    blue: { text: "text-blue-600", stroke: "#3b82f6", fill: "#dbeafe" },
    emerald: { text: "text-emerald-600", stroke: "#10b981", fill: "#d1fae5" },
    orange: { text: "text-orange-600", stroke: "#f97316", fill: "#ffedd5" },
  }[tone]

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-slate-600">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className={`text-3xl font-bold ${toneMap.text}`}>{value}</div>
        <MiniTrend trend={trend} stroke={toneMap.stroke} fill={toneMap.fill} />
      </CardContent>
    </Card>
  )
}

function MostActiveCard({ rows }: { rows: ActivityPoint[] }) {
  const max = Math.max(...rows.map((r) => r.total), 1)
  return (
    <Card className="border-slate-200 lg:col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Most Active Window</CardTitle>
        <p className="text-xs text-muted-foreground">Weekly uploads (last 6 weeks)</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => {
          const height = Math.max((row.total / max) * 100, row.total > 0 ? 14 : 0)
          return (
            <div key={row.period} className="grid grid-cols-[80px,1fr,28px] items-center gap-2 text-xs">
              <span className="text-slate-500 truncate">{row.period}</span>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-2 bg-indigo-500 rounded-full" style={{ width: `${height}%` }} />
              </div>
              <span className="text-right font-medium text-slate-700">{row.total}</span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function SessionOverviewCard({ rows }: { rows: ActivityPoint[] }) {
  const points = rows.map((row) => row.total)
  const max = Math.max(...points, 1)
  const linePoints = (points.length ? points : [0, 0])
    .map((value, idx) => {
      const x = points.length <= 1 ? 0 : (idx / Math.max(points.length - 1, 1)) * 100
      const y = 100 - (value / max) * 90
      return `${x},${y}`
    })
    .join(" ")
  const areaPoints = `0,100 ${linePoints} 100,100`
  const last = points[points.length - 1] ?? 0

  return (
    <Card className="border-slate-200 lg:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Sessions Overview</CardTitle>
        <p className="text-xs text-muted-foreground">Daily activity trend</p>
      </CardHeader>
      <CardContent>
        <div className="h-44 rounded-xl bg-slate-50 border border-slate-100 p-3">
          {points.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No activity</div>
          ) : (
            <svg viewBox="0 0 100 100" className="h-full w-full">
              <polygon points={areaPoints} fill="#bfdbfe" opacity="0.5" />
              <polyline fill="none" stroke="#3b82f6" strokeWidth="2.5" points={linePoints} />
            </svg>
          )}
        </div>
        <div className="mt-3 text-sm text-slate-600">
          Current day total: <span className="font-semibold text-slate-900">{last}</span> uploads
        </div>
      </CardContent>
    </Card>
  )
}

function CountryMapCard({ countries }: { countries: { country: string; events: number }[] }) {
  const max = Math.max(...countries.map((c) => c.events), 1)
  const points = countries
    .map((item) => {
      const coords = getCountryLatLng(item.country)
      if (!coords) return null
      const p = projectLatLng(coords.lat, coords.lng)
      return { ...item, ...p }
    })
    .filter(Boolean) as Array<{ country: string; events: number; x: number; y: number }>

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
        <div className="rounded-xl border border-slate-100 bg-slate-50 h-44 px-2 py-1">
          <svg viewBox="0 0 1000 450" className="h-full w-full">
            <rect x="0" y="0" width="1000" height="450" fill="#f8fafc" />

            {/* Simplified continent silhouettes */}
            <ellipse cx="210" cy="125" rx="120" ry="65" fill="#dbeafe" />
            <ellipse cx="250" cy="260" rx="70" ry="105" fill="#dbeafe" />
            <ellipse cx="490" cy="120" rx="75" ry="45" fill="#dbeafe" />
            <ellipse cx="520" cy="240" rx="90" ry="115" fill="#dbeafe" />
            <ellipse cx="700" cy="175" rx="220" ry="90" fill="#dbeafe" />
            <ellipse cx="860" cy="305" rx="75" ry="45" fill="#dbeafe" />

            {points.map((point) => {
              const radius = 5 + (point.events / max) * 8
              return (
                <g key={`pt-${point.country}`}>
                  <circle cx={point.x} cy={point.y} r={radius} fill="#2563eb" opacity="0.25" />
                  <circle cx={point.x} cy={point.y} r={3.5} fill="#1d4ed8" />
                </g>
              )
            })}
          </svg>
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

function projectLatLng(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * 1000
  const y = ((90 - lat) / 180) * 450
  return { x, y }
}

function getCountryLatLng(countryName: string): { lat: number; lng: number } | null {
  const key = countryName.trim().toLowerCase()
  const map: Record<string, { lat: number; lng: number }> = {
    india: { lat: 20.6, lng: 78.9 },
    "united states": { lat: 37.1, lng: -95.7 },
    usa: { lat: 37.1, lng: -95.7 },
    "united kingdom": { lat: 55.3, lng: -3.4 },
    uk: { lat: 55.3, lng: -3.4 },
    canada: { lat: 56.1, lng: -106.3 },
    germany: { lat: 51.2, lng: 10.4 },
    france: { lat: 46.2, lng: 2.2 },
    spain: { lat: 40.5, lng: -3.7 },
    italy: { lat: 41.9, lng: 12.6 },
    australia: { lat: -25.3, lng: 133.8 },
    china: { lat: 35.9, lng: 104.2 },
    japan: { lat: 36.2, lng: 138.3 },
    singapore: { lat: 1.35, lng: 103.8 },
    uae: { lat: 24.3, lng: 54.3 },
    "united arab emirates": { lat: 24.3, lng: 54.3 },
    brazil: { lat: -14.2, lng: -51.9 },
    mexico: { lat: 23.6, lng: -102.5 },
    indonesia: { lat: -2.5, lng: 118.0 },
    "south africa": { lat: -30.6, lng: 22.9 },
  }
  return map[key] ?? null
}

function DistributionDonutCard({
  items,
  total,
}: {
  items: { label: string; value: number; color: string }[]
  total: number
}) {
  const circumference = 2 * Math.PI * 42
  let offsetAcc = 0

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Sessions by Type</CardTitle>
        <p className="text-xs text-muted-foreground">Upload distribution</p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div className="relative w-44 h-44 mx-auto">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" stroke="#e2e8f0" strokeWidth="12" fill="none" />
            {items.map((item) => {
              const pct = total > 0 ? item.value / total : 0
              const dash = pct * circumference
              const ring = (
                <circle
                  key={item.label}
                  cx="50"
                  cy="50"
                  r="42"
                  stroke={item.color}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offsetAcc}
                  strokeLinecap="butt"
                />
              )
              offsetAcc += dash
              return ring
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-slate-900">{total}</p>
          </div>
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600">{item.label}</span>
              </div>
              <span className="font-medium text-slate-900">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function MiniTrend({ trend, stroke, fill }: { trend: number[]; stroke: string; fill: string }) {
  const points = trend.length > 0 ? trend : [0, 0]
  const max = Math.max(...points, 1)
  const line = points
    .map((value, idx) => {
      const x = points.length <= 1 ? 0 : (idx / Math.max(points.length - 1, 1)) * 100
      const y = 100 - (value / max) * 90
      return `${x},${y}`
    })
    .join(" ")
  const area = `0,100 ${line} 100,100`

  return (
    <svg viewBox="0 0 100 28" className="h-8 w-full">
      <polygon points={area} fill={fill} opacity="0.7" />
      <polyline points={line} fill="none" stroke={stroke} strokeWidth="2" />
    </svg>
  )
}
