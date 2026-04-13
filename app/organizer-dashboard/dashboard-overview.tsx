"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, BarChart3, MessageSquare, TrendingUp, TrendingDown, Calendar, Loader2 } from "lucide-react"

interface DashboardStats {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: any
}

interface Event {
  id: number
  title: string
  date: string
  location: string
  status: string
  attendees: number
  registrations: number
  type: string
}

interface DashboardOverviewProps {
  organizerId: string
  organizerName: string
  dashboardStats: DashboardStats[]
  recentEvents: Event[]
  onCreateEventClick: () => void
  onManageAttendeesClick: () => void
  onViewAnalyticsClick: () => void
  onSendMessageClick: () => void
}

interface OrganizerAttendeeStats {
  totalAttendees: number
  eventsCount: number
  statusCounts: {
    NEW: number
    CONTACTED: number
    QUALIFIED: number
    CONVERTED: number
    FOLLOW_UP: number
    REJECTED: number
  }
}

export default function DashboardOverview({
  organizerId,
  organizerName,
  dashboardStats,
  recentEvents,
  onCreateEventClick,
  onManageAttendeesClick,
  onViewAnalyticsClick,
  onSendMessageClick
}: DashboardOverviewProps) {
  const [attendeeStats, setAttendeeStats] = useState<OrganizerAttendeeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch total attendees data from backend (all events attendee leads count)
  useEffect(() => {
    const fetchAttendeeStats = async () => {
      try {
        setLoading(true)
        const data = await apiFetch<OrganizerAttendeeStats & { success?: boolean }>(
          `/api/organizers/${organizerId}/total-attendees`,
          { auth: true }
        )
        if (data && (data.success !== false)) {
          setAttendeeStats({
            totalAttendees: data.totalAttendees ?? 0,
            eventsCount: data.eventsCount ?? 0,
            statusCounts: data.statusCounts ?? {
              NEW: 0,
              CONTACTED: 0,
              QUALIFIED: 0,
              CONVERTED: 0,
              FOLLOW_UP: 0,
              REJECTED: 0,
            },
          })
        }
      } catch (err) {
        console.error("Error fetching attendee stats:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (organizerId) {
      fetchAttendeeStats()
    }
  }, [organizerId])

  // Calculate conversion rate
  const conversionRate = attendeeStats && attendeeStats.totalAttendees > 0 
    ? Math.round((attendeeStats.statusCounts.CONVERTED / attendeeStats.totalAttendees) * 100)
    : 0

  // Enhanced stats with real attendee data
  const enhancedStats = [
    {
      title: "Total Events",
      value: dashboardStats.find(stat => stat.title === "Total Events")?.value || "0",
      change: "+12%",
      trend: "up" as const,
      icon: Calendar,
    },
    {
      title: "Active Events",
      value: dashboardStats.find(stat => stat.title === "Active Events")?.value || "0",
      change: "+3",
      trend: "up" as const,
      icon: Calendar,
    },
    {
      title: "Total Attendees",
      value: loading ? "..." : attendeeStats ? attendeeStats.totalAttendees.toString() : "0",
      change: loading ? "" : "+18%",
      trend: "up" as const,
      icon: Users,
    }
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {organizerName}</p>
        </div>

        <Button
          onClick={onCreateEventClick}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 cursor-pointer" />
          Create New Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enhancedStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold">
                    {loading && stat.title.includes("Attendee") ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      stat.value
                    )}
                  </p>
                  {!loading && stat.change && (
                    <div className="flex items-center gap-1 mt-1">
                      {stat.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                        {stat.change}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Recent Events & Quick Actions */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.date}</p>
                  </div>
                  <Badge
                    variant={
                      event.status === "Active"
                        ? "default"
                        : event.status === "Planning"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {event.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

       
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <TrendingDown className="w-4 h-4" />
              <span>Error loading attendee data: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}