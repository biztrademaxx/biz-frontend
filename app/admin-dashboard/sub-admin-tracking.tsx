"use client"

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { adminApi } from "@/lib/admin-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Users, Activity, Upload, Globe2 } from "lucide-react"

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
}

export default function SubAdminTrackingPage() {
  const [data, setData] = useState<SubAdminActivityData | null>(null)
  const [loading, setLoading] = useState(true)

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

  const topAdmins = useMemo(() => (data?.bySubAdmin ?? []).slice(0, 8), [data])
  const onlineCount = useMemo(
    () => (data?.bySubAdmin ?? []).filter((a) => a.onlineStatus === "ONLINE").length,
    [data],
  )
  const maxUploads = useMemo(() => Math.max(...topAdmins.map((a) => a.total), 1), [topAdmins])

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
                  <div key={admin.adminId} className="space-y-1">
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
                  </div>
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
                    <tr key={row.adminId} className="border-b last:border-b-0">
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
