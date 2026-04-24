"use client"

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { adminApi } from "@/lib/admin-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { RefreshCw, Users, Activity, Upload, Globe2, MousePointerClick } from "lucide-react"

type ActivityPoint = {
  period: string
  events: number
  organizers: number
  exhibitors: number
  speakers: number
  bulkImports: number
  total: number
}

type SubAdminActivityData = {
  generatedAt: string
  totals: {
    events: number
    organizers: number
    exhibitors: number
    speakers: number
    bulkImports: number
    total: number
  }
  bySubAdmin: Array<{
    adminId: string
    name: string
    email: string
    onlineStatus: "ONLINE" | "OFFLINE"
    lastLogin: string | null
    lastActivityAt: string | null
    events: number
    organizers: number
    exhibitors: number
    speakers: number
    bulkImports: number
    total: number
  }>
  daily?: ActivityPoint[]
  weekly?: ActivityPoint[]
  monthly?: ActivityPoint[]
}

export default function SubAdminTrackingPage() {
  const [data, setData] = useState<SubAdminActivityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedAdminId, setSelectedAdminId] = useState<string>("")
  const [detail, setDetail] = useState<SubAdminActivityData | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date())

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi<{ success?: boolean; data?: SubAdminActivityData }>("/analytics/sub-admin-activity")
      if (res?.data) setData(res.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const loadDetail = useCallback(async (adminId: string) => {
    if (!adminId) return
    setDetailLoading(true)
    try {
      const res = await adminApi<{ success?: boolean; data?: SubAdminActivityData }>(`/analytics/sub-admin-activity/${adminId}`)
      if (res?.data) setDetail(res.data)
    } finally {
      setDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!data?.bySubAdmin?.length) return
    const fallbackId = data.bySubAdmin[0]?.adminId
    if (!selectedAdminId && fallbackId) {
      setSelectedAdminId(fallbackId)
      loadDetail(fallbackId)
    }
  }, [data, selectedAdminId, loadDetail])

  const topAdmins = useMemo(() => (data?.bySubAdmin ?? []).slice(0, 8), [data])
  const onlineCount = useMemo(
    () => (data?.bySubAdmin ?? []).filter((a) => a.onlineStatus === "ONLINE").length,
    [data],
  )
  const maxUploads = useMemo(() => Math.max(...topAdmins.map((a) => a.total), 1), [topAdmins])
  const selectedAdmin = useMemo(
    () => (data?.bySubAdmin ?? []).find((x) => x.adminId === selectedAdminId) ?? null,
    [data, selectedAdminId],
  )
  const dailyMap = useMemo(() => {
    const map = new Map<string, ActivityPoint>()
    for (const row of detail?.daily ?? []) map.set(row.period, row)
    return map
  }, [detail])
  const activeDays = useMemo(
    () =>
      Array.from(dailyMap.entries())
        .filter(([, row]) => row.total > 0)
        .map(([day]) => new Date(`${day}T00:00:00`)),
    [dailyMap],
  )
  const selectedDayKey = useMemo(
    () => (selectedDay ? new Date(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate()).toISOString().slice(0, 10) : ""),
    [selectedDay],
  )
  const selectedDayStats = useMemo(() => dailyMap.get(selectedDayKey), [dailyMap, selectedDayKey])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
        Loading sub-admin tracking...
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Sub Admin Tracking</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Only sub-admin analytics in one place
            {data?.generatedAt ? ` · Updated ${new Date(data.generatedAt).toLocaleString()}` : ""}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard title="Total Uploads" value={data?.totals.total ?? 0} icon={<Upload className="h-4 w-4 text-blue-600" />} />
        <MetricCard title="Events Uploaded" value={data?.totals.events ?? 0} icon={<Activity className="h-4 w-4 text-emerald-600" />} />
        <MetricCard title="Bulk Imports" value={data?.totals.bulkImports ?? 0} icon={<Globe2 className="h-4 w-4 text-indigo-600" />} />
        <MetricCard title="Sub Admins Online" value={onlineCount} icon={<Users className="h-4 w-4 text-orange-600" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top Active Sub Admins</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topAdmins.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sub-admin activity yet.</p>
            ) : (
              topAdmins.map((admin) => {
                const width = `${Math.max((admin.total / maxUploads) * 100, admin.total > 0 ? 8 : 0)}%`
                return (
                  <button
                    key={admin.adminId}
                    type="button"
                    onClick={() => {
                      setSelectedAdminId(admin.adminId)
                      loadDetail(admin.adminId)
                    }}
                    className={`w-full space-y-1 rounded-md p-2 text-left transition ${
                      selectedAdminId === admin.adminId ? "bg-blue-50 border border-blue-200" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{admin.name || "Sub Admin"}</p>
                        <p className="text-xs text-muted-foreground">{admin.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{admin.total}</p>
                        <p className="text-[11px] text-muted-foreground">uploads</p>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width }} />
                    </div>
                  </button>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Online Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.bySubAdmin ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No sub-admins found.</p>
            ) : (
              (data?.bySubAdmin ?? []).slice(0, 8).map((admin) => (
                <div key={`${admin.adminId}-status`} className="flex items-center justify-between">
                  <span className="text-sm truncate pr-2">{admin.name || "Sub Admin"}</span>
                  <Badge
                    variant={admin.onlineStatus === "ONLINE" ? "default" : "secondary"}
                    className={admin.onlineStatus === "ONLINE" ? "bg-emerald-600 hover:bg-emerald-600" : ""}
                  >
                    {admin.onlineStatus}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sub Admin Activity Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="py-2 pr-3">Sub-admin</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3 text-right">Events</th>
                  <th className="py-2 pr-3 text-right">Organizers</th>
                  <th className="py-2 pr-3 text-right">Exhibitors</th>
                  <th className="py-2 pr-3 text-right">Speakers</th>
                  <th className="py-2 pr-3 text-right">Bulk</th>
                  <th className="py-2 pr-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {(data?.bySubAdmin ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-3 text-muted-foreground">
                      No sub-admin activity yet.
                    </td>
                  </tr>
                ) : (
                  (data?.bySubAdmin ?? []).map((row) => (
                    <tr
                      key={row.adminId}
                      className={`border-b last:border-b-0 cursor-pointer ${
                        selectedAdminId === row.adminId ? "bg-blue-50/70" : "hover:bg-slate-50"
                      }`}
                      onClick={() => {
                        setSelectedAdminId(row.adminId)
                        loadDetail(row.adminId)
                      }}
                    >
                      <td className="py-2 pr-3">
                        <div className="font-medium">{row.name || "Sub Admin"}</div>
                        <div className="text-xs text-muted-foreground">{row.email}</div>
                      </td>
                      <td className="py-2 pr-3">
                        <Badge
                          variant={row.onlineStatus === "ONLINE" ? "default" : "secondary"}
                          className={row.onlineStatus === "ONLINE" ? "bg-emerald-600 hover:bg-emerald-600" : ""}
                        >
                          {row.onlineStatus}
                        </Badge>
                      </td>
                      <td className="py-2 pr-3 text-right">{row.events}</td>
                      <td className="py-2 pr-3 text-right">{row.organizers}</td>
                      <td className="py-2 pr-3 text-right">{row.exhibitors}</td>
                      <td className="py-2 pr-3 text-right">{row.speakers}</td>
                      <td className="py-2 pr-3 text-right">{row.bulkImports}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{row.total}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Sub Admin Performance</span>
            {selectedAdmin ? (
              <span className="text-sm font-normal text-muted-foreground">
                {selectedAdmin.name} ({selectedAdmin.email})
              </span>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedAdminId ? (
            <p className="text-sm text-muted-foreground">Select a sub-admin to view full analytics.</p>
          ) : detailLoading && !detail ? (
            <div className="flex items-center text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Loading performance details...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1 border rounded-lg p-3">
                <p className="text-sm font-medium mb-2">Daily Update Calendar</p>
                <Calendar
                  mode="single"
                  selected={selectedDay}
                  onSelect={setSelectedDay}
                  modifiers={{ hasActivity: activeDays }}
                  modifiersClassNames={{ hasActivity: "bg-blue-100 text-blue-900 font-semibold rounded-sm" }}
                  className="mx-auto"
                />
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <MousePointerClick className="h-3.5 w-3.5" />
                  Click a highlighted date to see exact uploads
                </p>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <MetricCard title="Events" value={detail?.totals.events ?? 0} icon={<Activity className="h-4 w-4 text-emerald-600" />} />
                  <MetricCard title="Organizers" value={detail?.totals.organizers ?? 0} icon={<Users className="h-4 w-4 text-blue-600" />} />
                  <MetricCard title="Exhibitors" value={detail?.totals.exhibitors ?? 0} icon={<Users className="h-4 w-4 text-violet-600" />} />
                  <MetricCard title="Speakers" value={detail?.totals.speakers ?? 0} icon={<Users className="h-4 w-4 text-orange-600" />} />
                  <MetricCard title="Bulk Imports" value={detail?.totals.bulkImports ?? 0} icon={<Upload className="h-4 w-4 text-indigo-600" />} />
                  <MetricCard title="Total Uploads" value={detail?.totals.total ?? 0} icon={<Globe2 className="h-4 w-4 text-slate-600" />} />
                </div>

                <Card className="border-slate-200 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Selected Date: {selectedDayKey || "N/A"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedDayStats ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        <div>Events: <span className="font-semibold">{selectedDayStats.events}</span></div>
                        <div>Organizers: <span className="font-semibold">{selectedDayStats.organizers}</span></div>
                        <div>Exhibitors: <span className="font-semibold">{selectedDayStats.exhibitors}</span></div>
                        <div>Speakers: <span className="font-semibold">{selectedDayStats.speakers}</span></div>
                        <div>Bulk: <span className="font-semibold">{selectedDayStats.bulkImports}</span></div>
                        <div>Total: <span className="font-semibold">{selectedDayStats.total}</span></div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No updates on this date.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({ title, value, icon }: { title: string; value: number; icon: ReactNode }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-600 flex items-center justify-between">
          {title}
          {icon}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900">{value}</div>
      </CardContent>
    </Card>
  )
}
