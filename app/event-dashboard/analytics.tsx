"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
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
  AreaChart,
  Area,
} from "recharts"
import { Eye, Download, Users, TrendingUp, FileText } from "lucide-react"

interface AnalyticsReportsProps {
  exhibitorId: string
}

interface AnalyticsData {
  overview: {
    totalProfileViews: number
    brochureDownloads: number
     totalRevenue: number
  profileViews: number
    leadsGenerated: number
    visitorEngagement: number
  }
  profileViewsData: Array<{ date: string; views: number }>
  brochureDownloadsData: Array<{ name: string; downloads: number; percentage: number }>
  leadSourceData: Array<{ name: string; value: number; color: string }>
  engagementData: Array<{ metric: string; current: number; previous: number; change: number }>
}

export default function AnalyticsReports({ exhibitorId }: AnalyticsReportsProps) {
  const { toast } = useToast()
  const [timeRange, setTimeRange] = useState("30d")
  const [activeTab, setActiveTab] = useState("overview")
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (exhibitorId && exhibitorId !== "undefined") {
      fetchAnalytics()
    }
  }, [exhibitorId, timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/exhibitors/${exhibitorId}/analytics?timeRange=${timeRange}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch analytics")
      }

      const data = await response.json()
      setAnalytics(data.analytics)
    } catch (err) {
      console.error("Error fetching analytics:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      toast({
        title: "Error",
        description: "Failed to load analytics. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchAnalytics}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <div className="flex items-center gap-4">
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
          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profile-views">Profile Views</TabsTrigger>
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Profile Views</p>
                    <p className="text-2xl font-bold">{analytics?.overview?.totalRevenue
  ? analytics.overview.totalRevenue.toLocaleString("en-US", { style: "currency", currency: "USD" })
  : "0"}
</p>
                  </div>
                  <Eye className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-xs text-green-600 mt-2">+15% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Brochure Downloads</p>
                    <p className="text-2xl font-bold">{analytics.overview.brochureDownloads}</p>
                  </div>
                  <Download className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-xs text-green-600 mt-2">+22% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Leads Generated</p>
                    <p className="text-2xl font-bold">{analytics.overview.leadsGenerated}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-xs text-green-600 mt-2">+18% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                    <p className="text-2xl font-bold">{analytics.overview.visitorEngagement}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-xs text-green-600 mt-2">+8% from last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Views Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.profileViewsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="views" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.leadSourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.leadSourceData.map((entry, index) => (
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

        <TabsContent value="profile-views" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Profile Views</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.profileViewsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">{analytics.overview.totalProfileViews}</div>
                <div className="text-gray-600">Total Views</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {Math.round(analytics.overview.totalProfileViews / 30)}
                </div>
                <div className="text-gray-600">Daily Average</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {Math.max(...analytics.profileViewsData.map((d) => d.views))}
                </div>
                <div className="text-gray-600">Peak Day</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="downloads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brochure Download Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.brochureDownloadsData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">{item.downloads} downloads</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
                      </div>
                      <div className="text-sm font-medium">{item.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600">{analytics.overview.brochureDownloads}</div>
                <div className="text-gray-600">Total Downloads</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">{analytics.brochureDownloadsData.length}</div>
                <div className="text-gray-600">Active Brochures</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {Math.round(
                    (analytics.overview.brochureDownloads / Math.max(analytics.overview.totalProfileViews, 1)) * 100,
                  )}
                  %
                </div>
                <div className="text-gray-600">Download Rate</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.engagementData.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{item.metric}</div>
                      <div className={`text-sm font-medium ${item.change > 0 ? "text-green-600" : "text-red-600"}`}>
                        {item.change > 0 ? "+" : ""}
                        {item.change}%
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Current Period</div>
                        <div className="text-2xl font-bold text-blue-600">{item.current.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Previous Period</div>
                        <div className="text-xl font-semibold text-gray-500">{item.previous.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
