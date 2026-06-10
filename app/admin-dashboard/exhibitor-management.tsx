"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { getPublicProfilePath } from "@/lib/profile-path"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import {
  Building2,
  Search,
  MoreHorizontal,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  TrendingUp,
  Download,
  Plus,
} from "lucide-react"
import AddExhibitorForm from "./add-exhibitor-form"
import { AdminTableAvatar } from "@/components/admin-dashboard/admin-table-avatar"

const PAGE_SIZE = 15

const avatarColors = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
]

function getAvatarColor(company?: string) {
  if (!company) return avatarColors[0]
  return avatarColors[company.length % avatarColors.length]
}


interface Exhibitor {
  id: string
  publicSlug?: string
  firstName: string
  lastName: string
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

type ExhibitorDetail = {
  id: string
  firstName?: string
  lastName?: string
  name?: string
  email?: string
  phone?: string | null
  company?: string | null
  jobTitle?: string | null
  companyIndustry?: string | null
  website?: string | null
  location?: string | null
  businessEmail?: string | null
  businessPhone?: string | null
  businessAddress?: string | null
  taxId?: string | null
  bio?: string | null
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

type ExhibitorEditForm = {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  jobTitle: string
  companyIndustry: string
  website: string
  location: string
  businessEmail: string
  businessPhone: string
  businessAddress: string
  taxId: string
  bio: string
  isActive: boolean
}

const emptyEditForm = (): ExhibitorEditForm => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  jobTitle: "",
  companyIndustry: "",
  website: "",
  location: "",
  businessEmail: "",
  businessPhone: "",
  businessAddress: "",
  taxId: "",
  bio: "",
  isActive: true,
})

export default function ExhibitorManagement() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("exhibitors")
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
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedExhibitor, setSelectedExhibitor] = useState<Exhibitor | null>(null)
  const [detailRecord, setDetailRecord] = useState<ExhibitorDetail | null>(null)
  const [editForm, setEditForm] = useState<ExhibitorEditForm>(emptyEditForm)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    void fetchStats()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchExhibitors(currentPage, searchTerm, statusFilter, industryFilter)
    }, 250)
    return () => clearTimeout(timer)
  }, [currentPage, searchTerm, statusFilter, industryFilter])

  const fetchExhibitors = async (
    pageArg?: number,
    searchArg?: string,
    statusArg?: string,
    industryArg?: string,
  ) => {
    try {
      setLoading(true)
      setError(null)
      const page = typeof pageArg === "number" ? pageArg : currentPage
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      })
      const trimmedSearch = (searchArg ?? searchTerm ?? "").trim()
      if (trimmedSearch) params.set("search", trimmedSearch)
      const status = (statusArg ?? statusFilter ?? "all").trim()
      if (status && status !== "all") params.set("status", status)
      const industry = (industryArg ?? industryFilter ?? "all").trim()
      if (industry && industry !== "all") params.set("industry", industry)

      const path = `/api/admin/exhibitors?${params.toString()}`
      const res = await apiFetch<{
        success?: boolean
        data?: Array<Record<string, unknown>>
        pagination?: { page?: number; limit?: number; total?: number; totalPages?: number }
      }>(path, { auth: true })
      const raw = Array.isArray(res?.data) ? res.data : []
      const safeExhibitors: Exhibitor[] = raw.map((u: Record<string, unknown>) => {
        const companyName = (u.company as string) ?? "Unnamed Company"
        const contactPerson =
          (u.name as string) ??
          ([u.firstName, u.lastName].filter(Boolean).join(" ").trim() || "Unknown Contact")
        const isActive = u.isActive !== false
        const statusValue: Exhibitor["status"] = isActive ? "active" : "suspended"
        return {
          id: String(u.id),
          publicSlug: u.publicSlug ? String(u.publicSlug) : undefined,
          firstName: String(u.firstName ?? ""),
          lastName: String(u.lastName ?? ""),
          companyName,
          contactPerson,
          email: String(u.email ?? ""),
          phone: String(u.phone ?? ""),
          website: "",
          industry: String(u.companyIndustry ?? "Other"),
          location: String(u.location ?? ""),
          status: statusValue,
          verified: false,
          joinDate: String(u.createdAt ?? ""),
          eventsParticipated: 0,
          totalProducts: 0,
          revenue: 0,
          rating: 0,
          avatar: String(u.avatar ?? ""),
          description: "",
        }
      })
      setExhibitors(safeExhibitors)
      const incomingTotal = Number(res?.pagination?.total ?? safeExhibitors.length)
      const incomingPages = Math.max(1, Number(res?.pagination?.totalPages ?? 1))
      setTotalItems(Number.isFinite(incomingTotal) ? incomingTotal : 0)
      setTotalPages(incomingPages)
      if (page > incomingPages) setCurrentPage(incomingPages)
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
      if (data?.data) {
        const total = data.data?.total ?? 0
        const active = data.data?.active ?? 0
        setStats((prev) => ({
          ...prev,
          total,
          active,
          suspended: Math.max(0, total - active),
        }))
      }
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

  const unwrapExhibitorDetail = (res: unknown): ExhibitorDetail | null => {
    if (!res || typeof res !== "object") return null
    const r = res as { data?: ExhibitorDetail } & ExhibitorDetail
    return r.data ?? (r.id ? (r as ExhibitorDetail) : null)
  }

  const loadExhibitorDetail = async (exhibitorId: string): Promise<ExhibitorDetail | null> => {
    const res = await apiFetch<unknown>(`/api/admin/exhibitors/${exhibitorId}`, { auth: true })
    return unwrapExhibitorDetail(res)
  }

  const mapDetailToEditForm = (detail: ExhibitorDetail): ExhibitorEditForm => ({
    firstName: detail.firstName ?? "",
    lastName: detail.lastName ?? "",
    email: detail.email ?? "",
    phone: detail.phone ?? "",
    company: detail.company ?? "",
    jobTitle: detail.jobTitle ?? "",
    companyIndustry: detail.companyIndustry ?? "",
    website: detail.website ?? "",
    location: detail.location ?? "",
    businessEmail: detail.businessEmail ?? "",
    businessPhone: detail.businessPhone ?? "",
    businessAddress: detail.businessAddress ?? "",
    taxId: detail.taxId ?? "",
    bio: detail.bio ?? "",
    isActive: detail.isActive !== false,
  })

  const getExhibitorProfilePath = (exhibitor: Exhibitor) =>
    getPublicProfilePath("exhibitor", {
      id: exhibitor.id,
      publicSlug: exhibitor.publicSlug,
      company: exhibitor.companyName,
      firstName: exhibitor.firstName,
      lastName: exhibitor.lastName,
    })

  const handleOpenExhibitorProfile = (exhibitor: Exhibitor) => {
    router.push(getExhibitorProfilePath(exhibitor))
  }

  const handleViewDetails = async (exhibitor: Exhibitor) => {
    setSelectedExhibitor(exhibitor)
    setDetailRecord(null)
    setDetailsOpen(true)
    setLoadingDetails(true)
    try {
      const detail = await loadExhibitorDetail(exhibitor.id)
      setDetailRecord(detail)
    } catch (err) {
      console.error("Error loading exhibitor details:", err)
      toast({
        title: "Error",
        description: "Failed to load exhibitor details",
        variant: "destructive",
      })
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleOpenEdit = async (exhibitor: Exhibitor) => {
    setSelectedExhibitor(exhibitor)
    setEditForm(emptyEditForm())
    setEditOpen(true)
    setLoadingDetails(true)
    try {
      const detail = await loadExhibitorDetail(exhibitor.id)
      if (detail) {
        setEditForm(mapDetailToEditForm(detail))
      } else {
        const [firstName, ...rest] = exhibitor.contactPerson.split(" ")
        setEditForm({
          ...emptyEditForm(),
          firstName: firstName ?? "",
          lastName: rest.join(" "),
          email: exhibitor.email,
          phone: exhibitor.phone,
          company: exhibitor.companyName,
          isActive: exhibitor.status === "active",
        })
      }
    } catch (err) {
      console.error("Error loading exhibitor for edit:", err)
      toast({
        title: "Error",
        description: "Failed to load exhibitor for editing",
        variant: "destructive",
      })
      setEditOpen(false)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!selectedExhibitor) return
    if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim()) {
      toast({
        title: "Missing fields",
        description: "First name, last name, and email are required.",
        variant: "destructive",
      })
      return
    }
    try {
      setSavingEdit(true)
      const adminApi = (await import("@/lib/admin-api")).adminApi
      await adminApi(`/exhibitors/${selectedExhibitor.id}`, {
        method: "PATCH",
        body: {
          firstName: editForm.firstName.trim(),
          lastName: editForm.lastName.trim(),
          email: editForm.email.trim(),
          phone: editForm.phone.trim() || null,
          company: editForm.company.trim() || null,
          jobTitle: editForm.jobTitle.trim() || null,
          companyIndustry: editForm.companyIndustry.trim() || null,
          website: editForm.website.trim() || null,
          location: editForm.location.trim() || null,
          businessEmail: editForm.businessEmail.trim() || null,
          businessPhone: editForm.businessPhone.trim() || null,
          businessAddress: editForm.businessAddress.trim() || null,
          taxId: editForm.taxId.trim() || null,
          bio: editForm.bio.trim() || null,
          isActive: editForm.isActive,
        },
      })
      toast({ title: "Saved", description: "Exhibitor updated successfully." })
      setEditOpen(false)
      setSelectedExhibitor(null)
      fetchExhibitors()
      fetchStats()
    } catch (err) {
      console.error("Error saving exhibitor:", err)
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Could not update exhibitor",
        variant: "destructive",
      })
    } finally {
      setSavingEdit(false)
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

  const showFullPageLoader = loading && exhibitors.length === 0

  if (showFullPageLoader) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-7 w-7 border-2 border-gray-900 border-t-transparent mx-auto" />
          <p className="text-sm text-gray-400 tracking-wide">Loading exhibitors…</p>
        </div>
      </div>
    )
  }

  if (error && exhibitors.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <p className="text-lg text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => void fetchExhibitors(currentPage, searchTerm, statusFilter, industryFilter)}
            className="text-sm underline text-gray-600"
          >
            Try Again
          </button>
        </div>
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
    <div className="min-h-screen bg-[#F5F4F0] p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-gray-400 mb-1">Admin Panel</p>
          <h1 className="text-2xl font-semibold text-gray-900">Exhibitors</h1>
          <p className="text-sm text-gray-500 mt-1">Manage exhibitor accounts, approvals, and performance</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Exhibitor
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
        {[
          { label: "TOTAL EXHIBITORS", value: (stats.total ?? 0).toLocaleString() },
          { label: "ACTIVE", value: (stats.active ?? 0).toLocaleString() },
          { label: "SUSPENDED", value: (stats.suspended ?? 0).toLocaleString() },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 border border-gray-100">
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-2">{s.label}</p>
            <p className="font-mono text-3xl font-semibold tabular-nums text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white border border-gray-200 rounded-lg p-1 gap-1 w-fit mb-4">
          <TabsTrigger
            value="exhibitors"
            className="text-sm px-4 py-1.5 rounded-md data-[state=active]:bg-gray-900 data-[state=active]:text-white text-gray-500"
          >
            All Exhibitors
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="text-sm px-4 py-1.5 rounded-md data-[state=active]:bg-gray-900 data-[state=active]:text-white text-gray-500"
          >
            Overview
          </TabsTrigger>
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
        <TabsContent value="exhibitors" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* <TabsList className="bg-white border border-gray-200 rounded-lg p-1 gap-1 w-fit">
              <TabsTrigger
                value="exhibitors"
                className="text-sm px-4 py-1.5 rounded-md data-[state=active]:bg-gray-900 data-[state=active]:text-white text-gray-500"
              >
                All Exhibitors
              </TabsTrigger>
            </TabsList> */}

            <div className="flex flex-col sm:flex-row gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={industryFilter}
                onValueChange={(value) => {
                  setIndustryFilter(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Filter by industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Energy">Energy</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  placeholder="Search exhibitors…"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 w-full sm:w-64"
                />
              </div>
            </div>
          </div>

          <div className={`bg-white rounded-xl border border-gray-100 overflow-hidden ${loading ? "opacity-60" : ""}`}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">
                    Exhibitor
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">
                    Industry
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">
                    Phone
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">
                    Location
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">
                    Joined
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {exhibitors.map((exhibitor) => {
                  const colorClass = getAvatarColor(exhibitor.companyName)
                  return (
                    <tr key={exhibitor.id} className="hover:bg-gray-50/60 transition-colors">
                      <td
                        className="px-4 py-4 cursor-pointer"
                        onClick={() => handleOpenExhibitorProfile(exhibitor)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            handleOpenExhibitorProfile(exhibitor)
                          }
                        }}
                        role="link"
                        tabIndex={0}
                        title={`View ${exhibitor.companyName} profile`}
                      >
                        <div className="flex items-center gap-3">
                          <AdminTableAvatar
                            src={exhibitor.avatar}
                            name={exhibitor.companyName}
                            colorClass={colorClass}
                          />
                          <div className="min-w-0">
<<<<<<< Updated upstream
                            <p className="text-sm font-medium text-gray-900 truncate">{exhibitor.companyName}</p>
                            {/* <p className="text-xs text-gray-400 truncate">{exhibitor.contactPerson}</p> */}
                            {/* <p className="text-xs text-gray-400 truncate">{exhibitor.email}</p> */}
=======
                            <p className="text-sm font-medium text-gray-900 truncate hover:text-[#004A96] hover:underline">
                              {exhibitor.companyName}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{exhibitor.contactPerson}</p>
                            <p className="text-xs text-gray-400 truncate">{exhibitor.email}</p>
>>>>>>> Stashed changes
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">{exhibitor.industry || "—"}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{exhibitor.phone || "—"}</td>
                      <td className="px-4 py-4 text-sm text-gray-700 max-w-[180px] truncate">
                        {exhibitor.location || "—"}
                      </td>
                      <td className="px-4 py-4">
                        {exhibitor.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {exhibitor.joinDate
                          ? new Date(exhibitor.joinDate).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenExhibitorProfile(exhibitor)}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleOpenEdit(exhibitor)}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleStatusChange(exhibitor.id, exhibitor.status !== "active")}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            {exhibitor.status === "active" ? "Suspend" : "Activate"}
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => void handleDelete(exhibitor.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {exhibitors.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-sm text-gray-400">
                      No exhibitors found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 px-1">
            <p className="text-xs text-gray-500">
              Showing page {currentPage} of {totalPages} ({totalItems.toLocaleString()} exhibitors)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage <= 1 || loading}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages || loading}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
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

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Exhibitor Details</DialogTitle>
            <DialogDescription>
              {selectedExhibitor?.companyName ?? "Exhibitor profile"}
            </DialogDescription>
          </DialogHeader>
          {loadingDetails ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Loading details…</div>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Company</p>
                  <p className="font-medium">{detailRecord?.company ?? selectedExhibitor?.companyName ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Contact</p>
                  <p className="font-medium">
                    {(detailRecord?.name ??
                      [detailRecord?.firstName, detailRecord?.lastName].filter(Boolean).join(" ")) ||
                      selectedExhibitor?.contactPerson ||
                      "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Email</p>
                  <p className="font-medium break-all">{detailRecord?.email ?? selectedExhibitor?.email ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Phone</p>
                  <p className="font-medium">{detailRecord?.phone ?? selectedExhibitor?.phone ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Industry</p>
                  <p className="font-medium">{detailRecord?.companyIndustry ?? selectedExhibitor?.industry ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Status</p>
                  <p className="font-medium capitalize">
                    {detailRecord?.isActive === false ? "suspended" : selectedExhibitor?.status ?? "active"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Website</p>
                  <p className="font-medium break-all">{detailRecord?.website || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Location</p>
                  <p className="font-medium">{detailRecord?.location ?? selectedExhibitor?.location ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Joined</p>
                  <p className="font-medium">
                    {detailRecord?.createdAt
                      ? new Date(detailRecord.createdAt).toLocaleDateString()
                      : selectedExhibitor?.joinDate
                        ? new Date(selectedExhibitor.joinDate).toLocaleDateString()
                        : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Job Title</p>
                  <p className="font-medium">{detailRecord?.jobTitle || "—"}</p>
                </div>
              </div>
              {detailRecord?.bio ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Bio</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{detailRecord.bio}</p>
                </div>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Exhibitor</DialogTitle>
            <DialogDescription>
              Update profile details for {selectedExhibitor?.companyName ?? "this exhibitor"}.
            </DialogDescription>
          </DialogHeader>
          {loadingDetails ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">First name</Label>
                  <Input
                    id="edit-firstName"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Last name</Label>
                  <Input
                    id="edit-lastName"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="edit-company">Company</Label>
                  <Input
                    id="edit-company"
                    value={editForm.company}
                    onChange={(e) => setEditForm((f) => ({ ...f, company: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-jobTitle">Job title</Label>
                  <Input
                    id="edit-jobTitle"
                    value={editForm.jobTitle}
                    onChange={(e) => setEditForm((f) => ({ ...f, jobTitle: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-industry">Industry</Label>
                  <Input
                    id="edit-industry"
                    value={editForm.companyIndustry}
                    onChange={(e) => setEditForm((f) => ({ ...f, companyIndustry: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="edit-website">Website</Label>
                  <Input
                    id="edit-website"
                    value={editForm.website}
                    onChange={(e) => setEditForm((f) => ({ ...f, website: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={editForm.location}
                    onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bio">Bio</Label>
                <Textarea
                  id="edit-bio"
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                <Label htmlFor="edit-active">Active account</Label>
                <Switch
                  id="edit-active"
                  checked={editForm.isActive}
                  onCheckedChange={(checked) => setEditForm((f) => ({ ...f, isActive: checked }))}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={savingEdit}>
              Cancel
            </Button>
            <Button onClick={() => void handleSaveEdit()} disabled={savingEdit || loadingDetails}>
              {savingEdit ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}