"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Building2,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Download,
  Plus,
} from "lucide-react"
import AddExhibitorForm from "./add-exhibitor-form"


interface Exhibitor {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  website: string
  industry: string
  location: string
  status: "active" | "pending" | "suspended"
  verified: boolean
  joinDate: string
  eventsParticipated: number
  totalProducts: number
  revenue: number
  rating: number
  avatar: string
  description: string
}

export default function ExhibitorManagement() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [industryFilter, setIndustryFilter] = useState("all")
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    verified: 0,
    totalRevenue: 0,
    avgRating: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)


  // Fetch exhibitors and stats
  useEffect(() => {
    fetchExhibitors()
    fetchStats()
  }, [searchTerm, statusFilter, industryFilter])

  const fetchExhibitors = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (industryFilter !== "all") params.append("industry", industryFilter)
      const query = params.toString()
      const path = `/api/admin/exhibitors${query ? `?${query}` : ""}`
      const res = await apiFetch<{ success?: boolean; data?: Array<Record<string, unknown>>; pagination?: { total: number } }>(path, { auth: true })
      const raw = Array.isArray(res?.data) ? res.data : []
      const safeExhibitors: Exhibitor[] = raw.map((u: Record<string, unknown>) => {
        const companyName = (u.company as string) ?? "Unnamed Company"
        const contactPerson = (u.name as string) ?? ([u.firstName, u.lastName].filter(Boolean).join(" ").trim() || "Unknown Contact")
        const isActive = u.isActive !== false
        const status: "active" | "pending" | "suspended" = isActive ? "active" : "suspended"
        return {
          id: String(u.id),
          companyName,
          contactPerson,
          email: String(u.email ?? ""),
          phone: String(u.phone ?? ""),
          website: "",
          industry: "Other",
          location: "",
          status,
          verified: false,
          joinDate: String(u.createdAt ?? ""),
          eventsParticipated: 0,
          totalProducts: 0,
          revenue: 0,
          rating: 0,
          avatar: "/city/c4.jpg",
          description: "",
        }
      })
      const filtered =
        statusFilter === "all"
          ? safeExhibitors
          : safeExhibitors.filter((e) => e.status === statusFilter)
      setExhibitors(filtered)
    } catch (err) {
      console.error("Error fetching exhibitors:", err)
      setError("Failed to load exhibitors")
      setExhibitors([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await import("@/lib/admin-api").then((m) => m.adminApi<{ success?: boolean; data?: { total?: number; active?: number } }>("/exhibitors/stats"))
      if (data?.data) setStats((prev) => ({ ...prev, total: data.data?.total ?? 0, active: data.data?.active ?? 0 }))
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleStatusChange = async (exhibitorId: string, newStatus: boolean) => {
    try {
      await import("@/lib/admin-api").then((m) =>
        m.adminApi(`/exhibitors/${exhibitorId}`, { method: "PATCH", body: { isActive: newStatus } })
      )
      fetchExhibitors()
      fetchStats()
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const handleDelete = async (exhibitorId: string) => {
    if (!confirm("Are you sure you want to delete this exhibitor?")) return
    try {
      await import("@/lib/admin-api").then((m) => m.adminApi(`/exhibitors/${exhibitorId}`, { method: "DELETE" }))
      fetchExhibitors()
      fetchStats()
    } catch (error) {
      console.error("Error deleting exhibitor:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "suspended":
        return <XCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  // Safe fallback for avatar text
  const getAvatarFallback = (companyName: string, contactPerson: string) => {
    if (companyName && companyName.length >= 2) {
      return companyName.substring(0, 2).toUpperCase()
    }
    if (contactPerson && contactPerson.length >= 2) {
      return contactPerson.substring(0, 2).toUpperCase()
    }
    return "EX"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading exhibitors...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    )
  }
if (showAddForm) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Add New Exhibitor</h1>

        <Button variant="outline" onClick={() => setShowAddForm(false)}>
          Back
        </Button>
      </div>

      <AddExhibitorForm
        onSuccess={() => setShowAddForm(false)}
        onCancel={() => setShowAddForm(false)}
      />
    </div>
  )
}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exhibitor Management</h1>
          <p className="text-gray-600">Manage exhibitor accounts, approvals, and performance</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
  <Plus className="w-4 h-4 mr-2" />
  Add Exhibitor
</Button>

      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="exhibitors">Exhibitors</TabsTrigger>
          {/* <TabsTrigger value="reports">Reports</TabsTrigger> */}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Exhibitors</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total ?? 0}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Exhibitors</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  {(stats.total ?? 0) > 0 ? Math.round(((stats.active ?? 0) / (stats.total ?? 1)) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats.avgRating ?? 0).toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">Across all exhibitors</p>
              </CardContent>
            </Card>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Exhibitor Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{stats.active ?? 0}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(stats.total ?? 0) > 0 ? ((stats.active ?? 0) / (stats.total ?? 1)) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span>Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{stats.pending ?? 0}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-600 h-2 rounded-full"
                        style={{ width: `${(stats.total ?? 0) > 0 ? ((stats.pending ?? 0) / (stats.total ?? 1)) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>Suspended</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{stats.suspended ?? 0}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${(stats.total ?? 0) > 0 ? ((stats.suspended ?? 0) / (stats.total ?? 1)) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Exhibitors Tab */}
        <TabsContent value="exhibitors" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search exhibitors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Energy">Energy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {exhibitors.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No exhibitors</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || industryFilter !== 'all' 
                  ? "No exhibitors match your search criteria." 
                  : "Get started by creating a new exhibitor."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {exhibitors.map((exhibitor) => (
                <Card key={exhibitor.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={exhibitor.avatar} />
                          <AvatarFallback>
                            {getAvatarFallback(exhibitor.companyName, exhibitor.contactPerson)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{exhibitor.companyName}</CardTitle>
                          <CardDescription>{exhibitor.contactPerson}</CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(exhibitor.id, exhibitor.status !== 'active')}
                          >
                            {exhibitor.status === 'active' ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Suspend
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDelete(exhibitor.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(exhibitor.status)}>
                        {getStatusIcon(exhibitor.status)}
                        <span className="ml-1 capitalize">{exhibitor.status}</span>
                      </Badge>
                      {exhibitor.verified && (
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{exhibitor.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{exhibitor.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{exhibitor.location}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{exhibitor.eventsParticipated}</div>
                        <div className="text-xs text-gray-500">Events</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{exhibitor.totalProducts}</div>
                        <div className="text-xs text-gray-500">Products</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{exhibitor.rating}</span>
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        ${exhibitor.revenue.toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Exhibitor Directory
                </CardTitle>
                <CardDescription>Complete list of all exhibitors with contact information</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Download CSV</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Report
                </CardTitle>
                <CardDescription>Exhibitor performance metrics and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}