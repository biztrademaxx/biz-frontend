"use client"

import { useCallback, useEffect, useState } from "react"
import { adminApi } from "@/lib/admin-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, BarChart3, Users, DollarSign, Activity, Calendar } from "lucide-react"

export type ReportsView = "events" | "engagement" | "revenue" | "system"

export interface ReportsOverviewData {
  generatedAt: string
  eventPerformance: {
    eventsByStatus: { status: string; count: number }[]
    eventsCreatedLast30Days: number
    topEventsByRegistrations: {
      eventId: string
      registrationCount: number
      title: string
      status: string | null
      startDate: string | null
    }[]
  }
  engagement: {
    usersByRole: { role: string; count: number }[]
    usersJoinedLast30Days: number
    totalRegistrations: number
    confirmedRegistrations: number
    messagesLast30Days: number
    totalMessages: number
    totalConnections: number
    reviewsTotal: number
    savedEventsTotal: number
    speakersCount: number
    exhibitorsCount: number
  }
  revenue: {
    totalConfirmedRevenue: number
    confirmedOrderCount: number
    revenueByEvent: {
      eventId: string
      revenue: number
      orders: number
      event: { id: string; title: string } | null
    }[]
    monthlySeriesLast6Months: { month: string; registrations: number; revenue: number }[]
  }
  systemHealth: {
    inactiveUsers: number
    pendingApprovalEvents: number
    pendingDeactivationRequests: number
    totalEvents: number
  }
}

function formatMoney(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    n || 0,
  )
}

export default function ReportsAnalyticsPage({ view = "events" }: { view?: ReportsView }) {
  const [data, setData] = useState<ReportsOverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<ReportsView>(view)

  useEffect(() => {
    setTab(view)
  }, [view])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminApi<{ success?: boolean; data?: ReportsOverviewData }>("/reports/overview")
      if (res.success === false || !res.data) {
        setError("Failed to load reports")
        setData(null)
        return
      }
      setData(res.data)
    } catch (e: any) {
      setError(e?.message || "Failed to load reports")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <p>Loading reports…</p>
      </div>
    )
  }

  if (error && !data) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle>Could not load reports</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => load()} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const ep = data.eventPerformance
  const eg = data.engagement
  const rv = data.revenue
  const sh = data.systemHealth

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Live metrics from the platform database · Updated {new Date(data.generatedAt).toLocaleString()}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => load()} disabled={loading} className="gap-2 shrink-0">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ReportsView)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto flex-wrap gap-1">
          <TabsTrigger value="events" className="gap-2">
            <Calendar className="h-4 w-4" />
            Event performance
          </TabsTrigger>
          <TabsTrigger value="engagement" className="gap-2">
            <Users className="h-4 w-4" />
            User engagement
          </TabsTrigger>
          <TabsTrigger value="revenue" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Activity className="h-4 w-4" />
            System health
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Events (all statuses)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{sh.totalEvents}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">New events (30 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{ep.eventsCreatedLast30Days}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending approval</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-amber-600">{sh.pendingApprovalEvents}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Events by status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ep.eventsByStatus.map((row) => (
                    <TableRow key={row.status}>
                      <TableCell>
                        <Badge variant="outline">{row.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{row.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top events by registrations</CardTitle>
              <CardDescription>Confirmed registrations per event</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Registrations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ep.topEventsByRegistrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-muted-foreground">
                        No registration data yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    ep.topEventsByRegistrations.map((row) => (
                      <TableRow key={row.eventId}>
                        <TableCell className="font-medium">{row.title}</TableCell>
                        <TableCell>
                          {row.status ? <Badge variant="secondary">{row.status}</Badge> : "—"}
                        </TableCell>
                        <TableCell className="text-right">{row.registrationCount}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">New users (30d)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{eg.usersJoinedLast30Days}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{eg.confirmedRegistrations}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Messages (30d)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{eg.messagesLast30Days}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{eg.totalConnections}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Users by role</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Users</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eg.usersByRole.map((row) => (
                      <TableRow key={row.role}>
                        <TableCell>{row.role}</TableCell>
                        <TableCell className="text-right font-medium">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Content & social signals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total messages</span>
                  <span className="font-medium">{eg.totalMessages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reviews</span>
                  <span className="font-medium">{eg.reviewsTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saved events</span>
                  <span className="font-medium">{eg.savedEventsTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Speakers</span>
                  <span className="font-medium">{eg.speakersCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exhibitors</span>
                  <span className="font-medium">{eg.exhibitorsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">All registrations (any status)</span>
                  <span className="font-medium">{eg.totalRegistrations}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed revenue (all time)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{formatMoney(rv.totalConfirmedRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">{rv.confirmedOrderCount} confirmed orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Last 6 months (trend)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {rv.monthlySeriesLast6Months.length} month buckets with activity
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue by event</CardTitle>
              <CardDescription>From confirmed registrations with amounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rv.revenueByEvent.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-muted-foreground">
                        No revenue recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rv.revenueByEvent.map((row) => (
                      <TableRow key={row.eventId}>
                        <TableCell className="font-medium">{row.event?.title ?? row.eventId.slice(0, 8) + "…"}</TableCell>
                        <TableCell className="text-right">{row.orders}</TableCell>
                        <TableCell className="text-right font-medium">{formatMoney(row.revenue)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly registrations & revenue</CardTitle>
              <CardDescription>Last ~6 months of confirmed registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Registrations</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rv.monthlySeriesLast6Months.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-muted-foreground">
                        No data in range.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rv.monthlySeriesLast6Months.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell>{row.month}</TableCell>
                        <TableCell className="text-right">{row.registrations}</TableCell>
                        <TableCell className="text-right">{formatMoney(row.revenue)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Inactive accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">{sh.inactiveUsers}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Events pending approval</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-amber-600">{sh.pendingApprovalEvents}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Deactivation requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{sh.pendingDeactivationRequests}</p>
                <p className="text-xs text-muted-foreground mt-1">Pending review</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{sh.totalEvents}</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Operational summary</CardTitle>
              <CardDescription>Use this view to spot queues and account issues quickly.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                High <strong>pending approval</strong> counts usually mean the event review queue needs attention.
              </p>
              <p>
                <strong>Deactivation requests</strong> should be reviewed under Settings → Account deactivations.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
