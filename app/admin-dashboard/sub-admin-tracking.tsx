"use client"

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { adminApi } from "@/lib/admin-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { RefreshCw, Users, Activity, Upload, Globe2, MousePointerClick, Pencil } from "lucide-react"
import {
  formatCreatedUpdated,
  type SubAdminActivityData,
  type SubAdminActivityPoint,
  type SubAdminActivityUpdatedCounts,
} from "@/lib/sub-admin-activity-types"

const EMPTY_UPDATED: SubAdminActivityUpdatedCounts = {
  eventsUpdated: 0,
  organizersUpdated: 0,
  exhibitorsUpdated: 0,
  speakersUpdated: 0,
  bulkImportsUpdated: 0,
  totalUpdated: 0,
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
  const totalsUpdated = data?.totalsUpdated ?? EMPTY_UPDATED
  const maxUploads = useMemo(
    () => Math.max(...topAdmins.map((a) => a.total + (a.totalUpdated ?? 0)), 1),
    [topAdmins],
  )
  const selectedAdmin = useMemo(
    () => (data?.bySubAdmin ?? []).find((x) => x.adminId === selectedAdminId) ?? null,
    [data, selectedAdminId],
  )
  const dailyMap = useMemo(() => {
    const map = new Map<string, SubAdminActivityPoint>()
    for (const row of detail?.daily ?? []) map.set(row.period, row)
    return map
  }, [detail])
  const activeDays = useMemo(
    () =>
      Array.from(dailyMap.entries())
        .filter(([, row]) => row.total > 0 || (row.totalUpdated ?? 0) > 0)
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
            Created vs updated counts per sub-admin (last 90 days)
            {data?.generatedAt ? ` · Refreshed ${new Date(data.generatedAt).toLocaleString()}` : ""}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Table format: created / updated</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <MetricCard title="Total Created" value={data?.totals.total ?? 0} icon={<Upload className="h-4 w-4 text-blue-600" />} />
        <MetricCard title="Total Updated" value={totalsUpdated.totalUpdated} icon={<Pencil className="h-4 w-4 text-violet-600" />} />
        <MetricCard title="Sub Admins Online" value={onlineCount} icon={<Users className="h-4 w-4 text-orange-600" />} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricCard title="Events" value={formatCreatedUpdated(data?.totals.events ?? 0, totalsUpdated.eventsUpdated)} compact />
        <MetricCard title="Organizers" value={formatCreatedUpdated(data?.totals.organizers ?? 0, totalsUpdated.organizersUpdated)} compact />
        <MetricCard title="Exhibitors" value={formatCreatedUpdated(data?.totals.exhibitors ?? 0, totalsUpdated.exhibitorsUpdated)} compact />
        <MetricCard title="Speakers" value={formatCreatedUpdated(data?.totals.speakers ?? 0, totalsUpdated.speakersUpdated)} compact />
        <MetricCard
          title="Bulk Imports"
          value={formatCreatedUpdated(data?.totals.bulkImports ?? 0, totalsUpdated.bulkImportsUpdated)}
          compact
        />
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
                        <p className="text-sm font-semibold">{formatCreatedUpdated(admin.total, admin.totalUpdated ?? 0)}</p>
                        <p className="text-[11px] text-muted-foreground">created / updated</p>
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
                  <th className="py-2 pr-3 text-right">Created</th>
                  <th className="py-2 pr-3 text-right">Updated</th>
                </tr>
              </thead>
              <tbody>
                {(data?.bySubAdmin ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-3 text-muted-foreground">
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
                      <td className="py-2 pr-3 text-right">{formatCreatedUpdated(row.events, row.eventsUpdated ?? 0)}</td>
                      <td className="py-2 pr-3 text-right">{formatCreatedUpdated(row.organizers, row.organizersUpdated ?? 0)}</td>
                      <td className="py-2 pr-3 text-right">{formatCreatedUpdated(row.exhibitors, row.exhibitorsUpdated ?? 0)}</td>
                      <td className="py-2 pr-3 text-right">{formatCreatedUpdated(row.speakers, row.speakersUpdated ?? 0)}</td>
                      <td className="py-2 pr-3 text-right">
                        {formatCreatedUpdated(row.bulkImports, row.bulkImportsUpdated ?? 0)}
                      </td>
                      <td className="py-2 pr-3 text-right font-medium">{row.total}</td>
                      <td className="py-2 pr-3 text-right font-semibold text-violet-700">{row.totalUpdated ?? 0}</td>
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
                  <MetricCard title="Events" value={formatCreatedUpdated(detail?.totals.events ?? 0, detail?.totalsUpdated?.eventsUpdated ?? 0)} icon={<Activity className="h-4 w-4 text-emerald-600" />} />
                  <MetricCard title="Organizers" value={formatCreatedUpdated(detail?.totals.organizers ?? 0, detail?.totalsUpdated?.organizersUpdated ?? 0)} icon={<Users className="h-4 w-4 text-blue-600" />} />
                  <MetricCard title="Exhibitors" value={formatCreatedUpdated(detail?.totals.exhibitors ?? 0, detail?.totalsUpdated?.exhibitorsUpdated ?? 0)} icon={<Users className="h-4 w-4 text-violet-600" />} />
                  <MetricCard title="Speakers" value={formatCreatedUpdated(detail?.totals.speakers ?? 0, detail?.totalsUpdated?.speakersUpdated ?? 0)} icon={<Users className="h-4 w-4 text-orange-600" />} />
                  <MetricCard
                    title="Bulk Imports"
                    value={formatCreatedUpdated(
                      detail?.totals.bulkImports ?? 0,
                      detail?.totalsUpdated?.bulkImportsUpdated ?? 0,
                    )}
                    icon={<Upload className="h-4 w-4 text-indigo-600" />}
                  />
                  <MetricCard title="Total Created" value={detail?.totals.total ?? 0} icon={<Globe2 className="h-4 w-4 text-slate-600" />} />
                  <MetricCard title="Total Updated" value={detail?.totalsUpdated?.totalUpdated ?? 0} icon={<Pencil className="h-4 w-4 text-violet-600" />} />
                </div>

                <Card className="border-slate-200 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Selected Date: {selectedDayKey || "N/A"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedDayStats ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        <div>Events: <span className="font-semibold">{formatCreatedUpdated(selectedDayStats.events, selectedDayStats.eventsUpdated ?? 0)}</span></div>
                        <div>Organizers: <span className="font-semibold">{formatCreatedUpdated(selectedDayStats.organizers, selectedDayStats.organizersUpdated ?? 0)}</span></div>
                        <div>Exhibitors: <span className="font-semibold">{formatCreatedUpdated(selectedDayStats.exhibitors, selectedDayStats.exhibitorsUpdated ?? 0)}</span></div>
                        <div>Speakers: <span className="font-semibold">{formatCreatedUpdated(selectedDayStats.speakers, selectedDayStats.speakersUpdated ?? 0)}</span></div>
                        <div>
                          Bulk:{" "}
                          <span className="font-semibold">
                            {formatCreatedUpdated(
                              selectedDayStats.bulkImports,
                              selectedDayStats.bulkImportsUpdated ?? 0,
                            )}
                          </span>
                        </div>
                        <div>Created: <span className="font-semibold">{selectedDayStats.total}</span></div>
                        <div>Updated: <span className="font-semibold text-violet-700">{selectedDayStats.totalUpdated ?? 0}</span></div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No activity on this date.</p>
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

function MetricCard({
  title,
  value,
  icon,
  compact,
}: {
  title: string
  value: number | string
  icon?: ReactNode
  compact?: boolean
}) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className={compact ? "pb-1 pt-3 px-3" : "pb-2"}>
        <CardTitle className={`font-medium text-slate-600 flex items-center justify-between ${compact ? "text-xs" : "text-sm"}`}>
          {title}
          {icon}
        </CardTitle>
      </CardHeader>
      <CardContent className={compact ? "px-3 pb-3 pt-0" : undefined}>
        <div className={`font-bold text-slate-900 ${compact ? "text-lg" : "text-3xl"}`}>{value}</div>
      </CardContent>
    </Card>
  )
}
