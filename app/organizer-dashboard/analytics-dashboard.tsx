"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Download,
  Users,
  Eye,
  MousePointer,
  TrendingUp,
  Building2,
  UserCheck,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  FileText,
  Mail,
  Phone,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Event {
  id: number
  title: string
  date: string
  location: string
  status: string
  attendees: number
  revenue: number
  registrations: number
  type: string
}

interface AnalyticsData {
  registrationData: Array<{ month: string; registrations: number }>
  eventTypeData: Array<{ name: string; value: number; color: string }>
  summary: {
    totalLeads: number
    qualifiedLeads: number
    hotLeads: number
    conversionRate: number
    totalVisitors: number
    uniqueVisitors: number
    avgSessionDuration: string
    bounceRate: number
    totalExhibitors: number
    confirmedExhibitors: number
    totalBoothRevenue: number
  }
}

interface AnalyticsDashboardProps {
  analyticsData?: AnalyticsData
  events: Event[]
  organizerId: string
}

export default function AnalyticsDashboard({
  analyticsData: initialAnalyticsData,
  events,
  organizerId,
}: AnalyticsDashboardProps) {
  const [selectedEvent, setSelectedEvent] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("30d")
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(initialAnalyticsData || null)
  const [loading, setLoading] = useState(!initialAnalyticsData)
  const { toast } = useToast()

  // Fetch analytics data from backend
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (initialAnalyticsData) return

      try {
        setLoading(true)
        const response = await fetch(`/api/organizers/${organizerId}/analytics`)
        if (!response.ok) throw new Error("Failed to fetch analytics")
        const data = await response.json()
        setAnalyticsData(data.analytics)
      } catch (error) {
        console.error("Error fetching analytics:", error)
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [organizerId, initialAnalyticsData, toast])

  const downloadReport = (type: string) => {
    // Mock download functionality
    console.log(`Downloading ${type} report...`)
    toast({
      title: "Download Started",
      description: `${type} report is being prepared for download.`,
    })
  }

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No analytics data available</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  // Mock visitor analytics data (can be replaced with real data from backend)
  const visitorData = {
    totalVisitors: analyticsData.summary.totalVisitors,
    uniqueVisitors: analyticsData.summary.uniqueVisitors,
    avgSessionDuration: analyticsData.summary.avgSessionDuration,
    bounceRate: analyticsData.summary.bounceRate,
    hourlyTraffic: [
      { hour: "9 AM", visitors: Math.floor(analyticsData.summary.totalVisitors * 0.05) },
      { hour: "10 AM", visitors: Math.floor(analyticsData.summary.totalVisitors * 0.08) },
      { hour: "11 AM", visitors: Math.floor(analyticsData.summary.totalVisitors * 0.12) },
      { hour: "12 PM", visitors: Math.floor(analyticsData.summary.totalVisitors * 0.15) },
      { hour: "1 PM", visitors: Math.floor(analyticsData.summary.totalVisitors * 0.13) },
      { hour: "2 PM", visitors: Math.floor(analyticsData.summary.totalVisitors * 0.16) },
      { hour: "3 PM", visitors: Math.floor(analyticsData.summary.totalVisitors * 0.14) },
      { hour: "4 PM", visitors: Math.floor(analyticsData.summary.totalVisitors * 0.11) },
      { hour: "5 PM", visitors: Math.floor(analyticsData.summary.totalVisitors * 0.09) },
      { hour: "6 PM", visitors: Math.floor(analyticsData.summary.totalVisitors * 0.07) },
    ],
    deviceBreakdown: [
      { name: "Desktop", value: 52, color: "#3B82F6" },
      { name: "Mobile", value: 35, color: "#10B981" },
      { name: "Tablet", value: 13, color: "#F59E0B" },
    ],
    topPages: [
      { page: "Event Details", views: Math.floor(analyticsData.summary.totalVisitors * 0.28), percentage: 27.6 },
      { page: "Speakers", views: Math.floor(analyticsData.summary.totalVisitors * 0.21), percentage: 20.6 },
      { page: "Schedule", views: Math.floor(analyticsData.summary.totalVisitors * 0.19), percentage: 18.7 },
      { page: "Registration", views: Math.floor(analyticsData.summary.totalVisitors * 0.15), percentage: 15.2 },
      { page: "Venue", views: Math.floor(analyticsData.summary.totalVisitors * 0.11), percentage: 11.4 },
    ],
  }

  // Mock exhibitor data (can be replaced with real data from backend)
  const exhibitorData = {
    totalExhibitors: analyticsData.summary.totalExhibitors,
    confirmedExhibitors: analyticsData.summary.confirmedExhibitors,
    pendingExhibitors: analyticsData.summary.totalExhibitors - analyticsData.summary.confirmedExhibitors,
    totalBoothRevenue: analyticsData.summary.totalBoothRevenue,
    boothTypes: [
      {
        type: "Premium",
        count: Math.floor(analyticsData.summary.confirmedExhibitors * 0.3),
        revenue: analyticsData.summary.totalBoothRevenue * 0.5,
      },
      {
        type: "Standard",
        count: Math.floor(analyticsData.summary.confirmedExhibitors * 0.6),
        revenue: analyticsData.summary.totalBoothRevenue * 0.4,
      },
      {
        type: "Startup",
        count: Math.floor(analyticsData.summary.confirmedExhibitors * 0.1),
        revenue: analyticsData.summary.totalBoothRevenue * 0.1,
      },
    ],
    exhibitorCategories: [
      { category: "Technology", count: Math.floor(analyticsData.summary.confirmedExhibitors * 0.3), color: "#3B82F6" },
      { category: "Healthcare", count: Math.floor(analyticsData.summary.confirmedExhibitors * 0.2), color: "#10B981" },
      {
        category: "Manufacturing",
        count: Math.floor(analyticsData.summary.confirmedExhibitors * 0.18),
        color: "#F59E0B",
      },
      { category: "Finance", count: Math.floor(analyticsData.summary.confirmedExhibitors * 0.16), color: "#EF4444" },
      { category: "Education", count: Math.floor(analyticsData.summary.confirmedExhibitors * 0.16), color: "#8B5CF6" },
    ],
    topExhibitors: [
      {
        id: 1,
        name: "TechCorp Solutions",
        category: "Technology",
        boothType: "Premium",
        leads: 89,
        contact: "contact@techcorp.com",
        phone: "+91 98765 43210",
      },
      {
        id: 2,
        name: "HealthFirst Medical",
        category: "Healthcare",
        boothType: "Premium",
        leads: 76,
        contact: "info@healthfirst.com",
        phone: "+91 98765 43211",
      },
      {
        id: 3,
        name: "ManufacturingPro",
        category: "Manufacturing",
        boothType: "Standard",
        leads: 65,
        contact: "sales@manufacturingpro.com",
        phone: "+91 98765 43212",
      },
    ],
  }

  // Generate daily leads data based on registration data
  const leadData = {
    totalLeads: analyticsData.summary.totalLeads,
    qualifiedLeads: analyticsData.summary.qualifiedLeads,
    hotLeads: analyticsData.summary.hotLeads,
    conversionRate: analyticsData.summary.conversionRate,
    leadSources: [
      { name: "Website", value: 45, count: Math.floor(analyticsData.summary.totalLeads * 0.45) },
      { name: "Social Media", value: 28, count: Math.floor(analyticsData.summary.totalLeads * 0.28) },
      { name: "Email", value: 15, count: Math.floor(analyticsData.summary.totalLeads * 0.15) },
      { name: "Referrals", value: 12, count: Math.floor(analyticsData.summary.totalLeads * 0.12) },
    ],
    dailyLeads: analyticsData.registrationData.slice(-7).map((item, index) => ({
      day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index] || item.month.slice(-3),
      total: Math.floor(item.registrations * 1.5),
      qualified: Math.floor(item.registrations * 1.2),
    })),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex items-center gap-4">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id.toString()}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Lead Generation</TabsTrigger>
          <TabsTrigger value="visitors">Visitor Analytics</TabsTrigger>
          <TabsTrigger value="exhibitors">Exhibitors</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Leads</p>
                    <p className="text-2xl font-bold">{leadData.totalLeads.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-xs text-green-600 mt-2">+{leadData.conversionRate}% conversion rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                    <p className="text-2xl font-bold">{visitorData.totalVisitors.toLocaleString()}</p>
                  </div>
                  <Eye className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-xs text-green-600 mt-2">+15% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Exhibitors</p>
                    <p className="text-2xl font-bold">{exhibitorData.totalExhibitors}</p>
                  </div>
                  <Building2 className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-xs text-green-600 mt-2">{exhibitorData.confirmedExhibitors} confirmed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Booth Revenue</p>
                    <p className="text-2xl font-bold">₹{(exhibitorData.totalBoothRevenue / 100000).toFixed(1)}L</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-xs text-green-600 mt-2">+25% from target</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Registration Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.registrationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="registrations" fill="#3B82F6" name="Registrations" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.eventTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.eventTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{leadData.totalLeads}</div>
                  <div className="text-sm text-gray-600">Total Leads</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{leadData.qualifiedLeads}</div>
                  <div className="text-sm text-gray-600">Qualified Leads</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{leadData.hotLeads}</div>
                  <div className="text-sm text-gray-600">Hot Leads</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={leadData.leadSources}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {leadData.leadSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Lead Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={leadData.dailyLeads}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="qualified" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="visitors" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                    <p className="text-2xl font-bold">{visitorData.totalVisitors.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
                    <p className="text-2xl font-bold">{visitorData.uniqueVisitors.toLocaleString()}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Session</p>
                    <p className="text-2xl font-bold">{visitorData.avgSessionDuration}</p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                    <p className="text-2xl font-bold">{visitorData.bounceRate}%</p>
                  </div>
                  <MousePointer className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {visitorData.deviceBreakdown.map((device, index) => (
                    <div key={device.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {device.name === "Desktop" && <Monitor className="w-5 h-5" />}
                        {device.name === "Mobile" && <Smartphone className="w-5 h-5" />}
                        {device.name === "Tablet" && <Tablet className="w-5 h-5" />}
                        <span>{device.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{ width: `${device.value}%`, backgroundColor: device.color }}
                          />
                        </div>
                        <span className="text-sm font-medium">{device.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {visitorData.topPages.map((page, index) => (
                    <div key={page.page} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{page.page}</div>
                        <div className="text-sm text-gray-600">{page.views.toLocaleString()} views</div>
                      </div>
                      <div className="text-sm font-medium">{page.percentage}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exhibitors" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{exhibitorData.totalExhibitors}</div>
                  <div className="text-sm text-gray-600">Total Exhibitors</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{exhibitorData.confirmedExhibitors}</div>
                  <div className="text-sm text-gray-600">Confirmed</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    ₹{(exhibitorData.totalBoothRevenue / 100000).toFixed(1)}L
                  </div>
                  <div className="text-sm text-gray-600">Booth Revenue</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Exhibitor Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={exhibitorData.exhibitorCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, count }) => `${category}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {exhibitorData.exhibitorCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Exhibitors by Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exhibitorData.topExhibitors.map((exhibitor, index) => (
                    <div key={exhibitor.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">{exhibitor.name}</div>
                        <Badge variant="outline">{exhibitor.leads} leads</Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          {exhibitor.category} • {exhibitor.boothType}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {exhibitor.contact}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {exhibitor.phone}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Download Reports</CardTitle>
              <p className="text-sm text-gray-600">Export detailed analytics and data reports</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2 bg-transparent"
                  onClick={() => downloadReport("lead-generation")}
                >
                  <Users className="w-6 h-6 text-blue-600" />
                  <span>Lead Generation Report</span>
                  <span className="text-xs text-gray-500">CSV Format</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2 bg-transparent"
                  onClick={() => downloadReport("visitor-analytics")}
                >
                  <Eye className="w-6 h-6 text-green-600" />
                  <span>Visitor Analytics</span>
                  <span className="text-xs text-gray-500">PDF Report</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2 bg-transparent"
                  onClick={() => downloadReport("exhibitor-data")}
                >
                  <Building2 className="w-6 h-6 text-purple-600" />
                  <span>Exhibitor Data</span>
                  <span className="text-xs text-gray-500">Excel Format</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2 bg-transparent"
                  onClick={() => downloadReport("performance-summary")}
                >
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                  <span>Performance Summary</span>
                  <span className="text-xs text-gray-500">Executive PDF</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2 bg-transparent"
                  onClick={() => downloadReport("attendee-list")}
                >
                  <FileText className="w-6 h-6 text-red-600" />
                  <span>Attendee List</span>
                  <span className="text-xs text-gray-500">CSV Database</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2 bg-transparent"
                  onClick={() => downloadReport("complete-analytics")}
                >
                  <Download className="w-6 h-6 text-gray-600" />
                  <span>Complete Analytics</span>
                  <span className="text-xs text-gray-500">ZIP Package</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Available Data</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      Lead contact information and qualification status
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      Visitor behavior and engagement metrics
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      Exhibitor booth performance and lead generation
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      Revenue tracking and financial analytics
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Export Options</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      CSV files for data analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-red-500" />
                      PDF reports for presentations
                    </li>
                    <li className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-500" />
                      Excel spreadsheets for calculations
                    </li>
                    <li className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-gray-500" />
                      Complete data packages
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
