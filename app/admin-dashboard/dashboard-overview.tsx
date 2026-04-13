"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
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
  Settings,
  BarChart3,
  Download,
  AlertCircle,
} from "lucide-react"
import { apiFetch } from "@/lib/api"

const iconMap: Record<string, any> = {
  Users,
  Calendar,
  Building2,
  DollarSign,
  CheckCircle,
}

export default function DashboardOverview({
  onNavigate,
}: {
  onNavigate?: (sectionId: string) => void
}) {
  const [stats, setStats] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])

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
            recentEvents?: Array<{ id: string; title: string; status: string; createdAt: string }>
            recentRegistrations?: Array<{
              id: string
              registeredAt?: string
              user?: { firstName?: string; lastName?: string }
              event?: { title?: string }
            }>
          }
          stats?: any[]
          activities?: any[]
        }>("/api/admin/dashboard", { auth: true })

        if (data.success !== false && data.data?.totals) {
          const t = data.data.totals
          setStats([
            { title: "Total Events", value: t.totalEvents ?? 0, trend: "up", change: "—", icon: "Calendar", color: "blue" },
            { title: "Published Events", value: t.publishedEvents ?? 0, trend: "up", change: "—", icon: "CheckCircle", color: "green" },
            { title: "Organizers", value: t.organizers ?? 0, trend: "up", change: "—", icon: "Building2", color: "indigo" },
            { title: "Attendees", value: t.attendees ?? 0, trend: "up", change: "—", icon: "Users", color: "purple" },
          ])
        } else if (Array.isArray((data as any).stats)) {
          setStats((data as any).stats)
        }

        if (Array.isArray((data as any).activities)) {
          setActivities((data as any).activities)
        } else if (data.data?.recentEvents?.length || data.data?.recentRegistrations?.length) {
          const acts: any[] = []
          data.data.recentEvents?.slice(0, 5).forEach((e: any, i: number) => {
            acts.push({
              id: `event-${e.id}-${i}`,
              action: "Event created",
              adminName: "System",
              resource: e.title,
              timestamp: e.createdAt,
              icon: "default",
            })
          })
          data.data.recentRegistrations?.slice(0, 5).forEach((r: any, i: number) => {
            const name = r.user ? `${r.user.firstName || ""} ${r.user.lastName || ""}`.trim() || "Visitor" : "Visitor"
            acts.push({
              id: `reg-${r.id}-${i}`,
              action: "New registration",
              adminName: name,
              resource: r.event?.title || "Event",
              timestamp: r.registeredAt || r.createdAt || new Date().toISOString(),
              icon: "success",
            })
          })
          setActivities(acts)
        }
      } catch (error) {
        console.error("Error loading dashboard:", error)
        setStats([])
        setActivities([])
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and key metrics</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(stats ?? []).map((stat, index) => {
          const Icon = iconMap[stat.icon] || Users
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {stat.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span
                        className={`text-sm ${stat.trend === "up" ? "text-green-500" : "text-red-500"
                          }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 bg-${stat.color}-100 rounded-full`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(activities ?? []).length > 0 ? (
                (activities ?? []).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <div
                      className={`p-2 rounded-full ${activity.icon === "success"
                          ? "bg-green-100"
                          : activity.icon === "error"
                            ? "bg-red-100"
                            : "bg-blue-100"
                        }`}
                    >
                      {activity.icon === "success" ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : activity.icon === "error" ? (
                        <Flag className="w-4 h-4 text-red-600" />
                      ) : (
                        <Activity className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-600">
                        {activity.adminName} — {activity.resource}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No recent activity found.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 bg-transparent"
                onClick={() => onNavigate?.("organizers")}
              >
                <Users className="w-6 h-6" />
                Manage Users
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 bg-transparent"
                onClick={() => onNavigate?.("events")}
              >
                <Calendar className="w-6 h-6" />
                Review Events
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 bg-transparent"
                onClick={() => onNavigate?.("reports")}
              >
                <BarChart3 className="w-6 h-6" />
                View Analytics
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 bg-transparent"
                onClick={() => onNavigate?.("settings")}
              >
                <Settings className="w-6 h-6" />
                System Settings
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
