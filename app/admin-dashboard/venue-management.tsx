"use client"

import { useState, useEffect, JSX } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  MapPin,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building2,
  Phone,
  Mail,
  Globe,
  MoreHorizontal,
  RefreshCw,
  Clock,
  ThumbsUp,
  ThumbsDown,
  MailOpen,
  Image,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { adminApi } from "@/lib/admin-api"
import EntityBulkImport from "./entity-bulk-import"

// Updated Types based on your Prisma schema
interface Venue {
  id: string
  venueName: string
  logo: string
  contactPerson: string
  email: string
  mobile: string
  address: string
  city: string
  state: string
  country: string
  website: string
  description: string
  maxCapacity: number
  totalHalls: number
  totalEvents: number
  activeBookings: number
  averageRating: number
  totalReviews: number
  amenities: string[]
  meetingSpaces: MeetingSpace[]
  isVerified: boolean
  isActive: boolean
  venueImages: string[]
  status?: "active" | "pending" | "suspended" | string
  createdAt?: string
  updatedAt?: string
  rejectionReason?: string
  events: Event[] // Add events array
}

interface MeetingSpace {
  id: string
  name: string
  capacity: number
  area: number
  hourlyRate: number
  isAvailable: boolean
}

interface Event {
  id: string
  title: string // Changed from 'name' to 'title' to match API
  description: string
  startDate: string
  endDate: string
  status: string
  category: string[]
  eventType: string[]
  isVirtual: boolean
  venueId: string
}

export default function VenueManagement({
  initialTab = "all",
}: {
  initialTab?: "all" | "pending" | "active" | "bulk-import"
}) {
  const [venues, setVenues] = useState<Venue[]>([])
  const [pendingVenues, setPendingVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingLoading, setPendingLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "active" | "bulk-import">(initialTab)
  const [expandedVenues, setExpandedVenues] = useState<Set<string>>(new Set())
  const [detailLoading, setDetailLoading] = useState(false)

  const mapVenueFromApi = (v: any): Venue => ({
    id: v.id,
    venueName: v.venueName ?? v.name ?? "",
    logo: v.logo ?? "",
    contactPerson:
      v.contactPerson ??
      v.name ??
      `${v.firstName ?? ""} ${v.lastName ?? ""}`.trim() ??
      "",
    email: v.email ?? "",
    mobile: v.phone ?? v.mobile ?? "",
    address: v.venueAddress ?? v.address ?? "",
    city: v.venueCity ?? v.city ?? "",
    state: v.venueState ?? v.state ?? "",
    country: v.venueCountry ?? v.country ?? "",
    website: v.website ?? "",
    description: v.description ?? "",
    maxCapacity: Number(v.maxCapacity ?? 0),
    totalHalls: Number(v.totalHalls ?? 0),
    totalEvents: Number(v.totalEvents ?? 0),
    activeBookings: Number(v.activeBookings ?? 0),
    averageRating: Number(v.averageRating ?? 0),
    totalReviews: Number(v.totalReviews ?? 0),
    amenities: Array.isArray(v.amenities) ? v.amenities : [],
    meetingSpaces: Array.isArray(v.meetingSpaces) ? v.meetingSpaces : [],
    isVerified: Boolean(v.isVerified),
    isActive: v.isActive ?? true,
    venueImages: Array.isArray(v.venueImages) ? v.venueImages : [],
    status: v.status ?? (v.isActive ? "active" : "suspended"),
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
    rejectionReason: v.rejectionReason,
    events: Array.isArray(v.events) ? v.events : [],
  })

  const fetchVenueById = async (venueId: string) => {
    setDetailLoading(true)
    try {
      const result = await adminApi<{ success?: boolean; data?: any }>(`/venues/${venueId}`)
      const raw = result?.data ?? (result as any)
      if (!raw || !raw.id) return null
      return mapVenueFromApi(raw)
    } catch (error) {
      console.error("Error fetching venue details:", error)
      toast.error("Failed to load venue details")
      return null
    } finally {
      setDetailLoading(false)
    }
  }

  const fetchVenues = async () => {
    try {
      setLoading(true)
      const result = await adminApi<{ success?: boolean; data?: any[]; venues?: any[] }>("/venues")
      const list = result?.data ?? (result as any)?.venues ?? []
      const raw = Array.isArray(list) ? list : []
      setVenues(raw.map((v: any) => mapVenueFromApi(v)))
    } catch (error) {
      console.error("Error fetching venues:", error)
      toast.error("Failed to load venues")
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingVenues = async () => {
    try {
      setPendingLoading(true)
      setPendingVenues([])
    } catch (error) {
      console.error("Error fetching pending venues:", error)
    } finally {
      setPendingLoading(false)
    }
  }

  useEffect(() => {
    fetchVenues()
    fetchPendingVenues()
  }, [])

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  // Filter venues based on search and status
  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.venueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.events?.some(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) // Changed to event.title
      )
    const matchesStatus = statusFilter === "all" || venue.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const toggleVenueEvents = (venueId: string) => {
    const newExpanded = new Set(expandedVenues)
    if (newExpanded.has(venueId)) {
      newExpanded.delete(venueId)
    } else {
      newExpanded.add(venueId)
    }
    setExpandedVenues(newExpanded)
  }

  const handleStatusChange = async (
    venueId: string,
    newStatus: "active" | "pending" | "suspended"
  ) => {
    try {
      await adminApi(`/venues/${venueId}`, {
        method: "PATCH",
        body: { isActive: newStatus === "active" },
      })
      setVenues(venues.map((venue) =>
        venue.id === venueId ? { ...venue, status: newStatus } : venue
      ))
      setPendingVenues(pendingVenues.filter((venue) => venue.id !== venueId))
      toast.success(`Venue status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating venue status:", error)
      toast.error("Failed to update venue status")
    }
  }

  const handleVerificationToggle = async (venueId: string) => {
    try {
      const venue = venues.find((v) => v.id === venueId)
      if (!venue) return
      await adminApi(`/venues/${venueId}`, { method: "PATCH", body: { isActive: !venue.isVerified } })
      setVenues(venues.map((v) => (v.id === venueId ? { ...v, isVerified: !v.isVerified } : v)))
      setPendingVenues(pendingVenues.filter((v) => v.id !== venueId))
      toast.success(`Venue verification ${!venue.isVerified ? "added" : "removed"}`)
    } catch (error) {
      console.error("Error updating verification:", error)
      toast.error("Failed to update verification status")
    }
  }

  const handleApproveVenue = async (venueId: string) => {
    try {
      await import("@/lib/admin-api").then((m) =>
        m.adminApi(`/venues/${venueId}`, { method: "PATCH", body: { isActive: true } })
      )
      setPendingVenues(pendingVenues.filter((v) => v.id !== venueId))
      fetchVenues()
      setIsApproveDialogOpen(false)
      toast.success("Venue approved successfully")
    } catch (error) {
      console.error("Error approving venue:", error)
      toast.error("Failed to approve venue")
    }
  }

  const handleRejectVenue = async (venueId: string, _reason: string) => {
    try {
      await adminApi(`/venues/${venueId}`, { method: "PATCH", body: { isActive: false } })
      setPendingVenues(pendingVenues.filter((v) => v.id !== venueId))
      setIsRejectDialogOpen(false)
      toast.success("Venue rejected successfully")
    } catch (error) {
      console.error("Error rejecting venue:", error)
      toast.error("Failed to reject venue")
    }
  }

  const handleDeleteVenue = async (venueId: string) => {
    if (!confirm("Are you sure you want to delete this venue?")) return
    try {
      await adminApi(`/venues/${venueId}`, { method: "DELETE" })
      setVenues(venues.filter((v) => v.id !== venueId))
      setPendingVenues(pendingVenues.filter((v) => v.id !== venueId))
      toast.success("Venue deleted successfully")
    } catch (error) {
      console.error("Error deleting venue:", error)
      toast.error("Failed to delete venue")
    }
  }

  const handleSendVenueMessage = (venue: Venue) => {
    if (!venue.email?.trim()) {
      toast.error("Venue email is missing")
      return
    }
    adminApi("/venues/send-account-email", {
      method: "POST",
      body: { venueId: venue.id },
    })
      .then(() => {
        toast.success(`Account email sent to ${venue.email}`)
      })
      .catch((error) => {
        console.error("Error sending venue email:", error)
        toast.error("Failed to send venue email")
      })
  }

  const handleAddVenue = async (formData: any) => {
    try {
      const result = await adminApi<{ success?: boolean; error?: string }>("/venues", { method: "POST", body: formData })
      if ((result as any)?.error) throw new Error((result as any).error)
      setIsAddDialogOpen(false)
      fetchVenues()
      fetchPendingVenues()
      toast.success("Venue created successfully")
    } catch (error) {
      console.error("Error creating venue:", error)
      toast.error("Failed to create venue")
    }
  }

  const handleEditVenue = async (venueId: string, formData: any) => {
    try {
      await adminApi(`/venues/${venueId}`, {
        method: "PATCH",
        body: {
          firstName: formData.contactPerson?.split(" ")[0],
          lastName: formData.contactPerson?.split(" ").slice(1).join(" ") ?? "",
          email: formData.email,
          phone: formData.mobile,
          venueName: formData.venueName,
          venueCity: formData.city,
          venueState: formData.state,
          venueCountry: formData.country,
          venueAddress: formData.address,
          maxCapacity: formData.maxCapacity,
          isActive: formData.status === "active",
        },
      })
      setIsEditDialogOpen(false)
      fetchVenues()
      fetchPendingVenues()
      toast.success("Venue updated successfully")
    } catch (error) {
      console.error("Error updating venue:", error)
      toast.error("Failed to update venue")
    }
  }

  const getStatusBadge = (status: string = "active") => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Suspended</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getEventStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Published</Badge>
      case "DRAFT":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs">Draft</Badge>
      case "COMPLETED":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">Completed</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Cancelled</Badge>
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>
    }
  }

  const totalVenues = venues.length
  const activeVenues = venues.filter((v) => v.status === "active").length
  const pendingVenuesCount = pendingVenues.length
  const verifiedVenues = venues.filter((v) => v.isVerified).length

  const refreshAll = () => {
    fetchVenues()
    fetchPendingVenues()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Venue Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all venues on the platform</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={refreshAll} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              {/* <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>Add Venue</span>
              </Button> */}
            </DialogTrigger>
            {/* <AddVenueDialog 
              onAddVenue={handleAddVenue}
              onClose={() => setIsAddDialogOpen(false)}
            /> */}
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Venues</p>
                <p className="text-2xl md:text-3xl font-bold text-blue-900">{totalVenues}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Venues</p>
                <p className="text-2xl md:text-3xl font-bold text-green-900">{activeVenues}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending Approval</p>
                <p className="text-2xl md:text-3xl font-bold text-yellow-900">{pendingVenuesCount}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Verified Venues</p>
                <p className="text-2xl md:text-3xl font-bold text-purple-900">{verifiedVenues}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "all" | "pending" | "active" | "bulk-import")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 mb-6">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All Venues
            <Badge variant="secondary" className="ml-1">{totalVenues}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending
            {pendingVenuesCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-yellow-100 text-yellow-800">
                {pendingVenuesCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            Active
            <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800">
              {activeVenues}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="bulk-import" className="flex items-center gap-2">
            Bulk Import
          </TabsTrigger>
        </TabsList>

        {/* All Venues Tab */}
        <TabsContent value="all" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search venues by name, location, contact, or event names..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Venues Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                All Venues
                <Badge variant="secondary">{filteredVenues.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VenuesList
                venues={filteredVenues}
                expandedVenues={expandedVenues}
                onToggleEvents={toggleVenueEvents}
                onSendMessage={handleSendVenueMessage}
                onView={async (venue) => {
                  const detailed = await fetchVenueById(venue.id)
                  setSelectedVenue(detailed ?? venue)
                  setIsViewDialogOpen(true)
                }}
                onEdit={async (venue) => {
                  const detailed = await fetchVenueById(venue.id)
                  setSelectedVenue(detailed ?? venue)
                  setIsEditDialogOpen(true)
                }}
                onStatusChange={handleStatusChange}
                onVerificationToggle={handleVerificationToggle}
                onDelete={handleDeleteVenue}
                getStatusBadge={getStatusBadge}
                getEventStatusBadge={getEventStatusBadge}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Approval Tab */}
        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                Pending Approval
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {pendingVenues.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-yellow-600" />
                </div>
              ) : pendingVenues.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p>No pending venues for approval</p>
                </div>
              ) : (
                <PendingVenuesList
                  venues={pendingVenues}
                  expandedVenues={expandedVenues}
                  onToggleEvents={toggleVenueEvents}
                  onView={(venue) => {
                    setSelectedVenue(venue)
                    setIsViewDialogOpen(true)
                  }}
                  onApprove={(venue) => {
                    setSelectedVenue(venue)
                    setIsApproveDialogOpen(true)
                  }}
                  onReject={(venue) => {
                    setSelectedVenue(venue)
                    setIsRejectDialogOpen(true)
                  }}
                  getStatusBadge={getStatusBadge}
                  getEventStatusBadge={getEventStatusBadge}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Venues Tab */}
        <TabsContent value="active" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Active Venues
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {activeVenues}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VenuesList
                venues={venues.filter(v => v.status === "active")}
                expandedVenues={expandedVenues}
                onToggleEvents={toggleVenueEvents}
                onSendMessage={handleSendVenueMessage}
                onView={async (venue) => {
                  const detailed = await fetchVenueById(venue.id)
                  setSelectedVenue(detailed ?? venue)
                  setIsViewDialogOpen(true)
                }}
                onEdit={async (venue) => {
                  const detailed = await fetchVenueById(venue.id)
                  setSelectedVenue(detailed ?? venue)
                  setIsEditDialogOpen(true)
                }}
                onStatusChange={handleStatusChange}
                onVerificationToggle={handleVerificationToggle}
                onDelete={handleDeleteVenue}
                getStatusBadge={getStatusBadge}
                getEventStatusBadge={getEventStatusBadge}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-import" className="space-y-6">
          <EntityBulkImport
            title="Venue Bulk Import"
            description="Import venues using the same core fields as Add Venue."
            endpoint="/venues/import"
            templateHeaders={[
              "venueName",
              "contactPerson",
              "email",
              "mobile",
              "address",
              "city",
              "state",
              "country",
              "maxCapacity",
              "isActive",
            ]}
            sampleRow={[
              "Grand Convention Center",
              "Alex Johnson",
              "manager@grandcc.com",
              "+1 555 120 4567",
              "123 Main Street, Downtown",
              "Chicago",
              "Illinois",
              "United States",
              "2500",
              "true",
            ]}
          />
        </TabsContent>
      </Tabs>

      {/* View Venue Dialog */}
      <ViewVenueDialog
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        venue={selectedVenue}
        loading={detailLoading}
        getStatusBadge={getStatusBadge}
        getEventStatusBadge={getEventStatusBadge}
      />

      {/* Edit Venue Dialog */}
      <EditVenueDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        venue={selectedVenue}
        onSave={(formData) => selectedVenue && handleEditVenue(selectedVenue.id, formData)}
      />

      {/* Approve Venue Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <ThumbsUp className="w-5 h-5" />
              Approve Venue
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this venue? This will make it active and visible to users.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              onClick={() => selectedVenue && handleApproveVenue(selectedVenue.id)}
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Approve Venue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Venue Dialog */}
      <RejectVenueDialog
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onReject={(reason) => selectedVenue && handleRejectVenue(selectedVenue.id, reason)}
        venueName={selectedVenue?.venueName}
      />
    </div>
  )
}

// Updated Venues List Component with Expandable Events
function VenuesList({ 
  venues, 
  expandedVenues,
  onToggleEvents,
  onSendMessage,
  onView, 
  onEdit, 
  onStatusChange, 
  onVerificationToggle, 
  onDelete, 
  getStatusBadge,
  getEventStatusBadge
}: {
  venues: Venue[]
  expandedVenues: Set<string>
  onToggleEvents: (venueId: string) => void
  onSendMessage: (venue: Venue) => void
  onView: (venue: Venue) => void
  onEdit: (venue: Venue) => void
  onStatusChange: (venueId: string, status: "active" | "pending" | "suspended") => void
  onVerificationToggle: (venueId: string) => void
  onDelete: (venueId: string) => void
  getStatusBadge: (status: string) => JSX.Element
  getEventStatusBadge: (status: string) => JSX.Element
}) {
  if (venues.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-lg font-medium">No venues found</p>
        <p className="text-sm">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-1">
      {venues.map((venue) => {
        const isExpanded = expandedVenues.has(venue.id)
        const displayEvents = venue.events?.slice(0, isExpanded ? venue.events.length : 2) || []
        const remainingEvents = venue.events?.length - displayEvents.length

        return (
          <Card key={venue.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Venue Image */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center border">
                    {venue.logo ? (
                      <img 
                        src={venue.logo} 
                        alt={venue.venueName} 
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
                    )}
                  </div>
                </div>

                {/* Venue Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <div className="flex items-start gap-2 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900 truncate max-w-[18rem]">
                        {venue.venueName}
                      </h3>
                      {venue.isVerified && (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(venue.status || "active")}
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{[venue.city, venue.state, venue.country].filter(Boolean).join(", ") || "-"}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>Contact: {venue.contactPerson}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                        <Users className="w-3 h-3" />
                        <span>Capacity</span>
                      </div>
                      <p className="font-semibold text-gray-900">{venue.maxCapacity.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                        <Building2 className="w-3 h-3" />
                        <span>Halls</span>
                      </div>
                      <p className="font-semibold text-gray-900">{venue.totalHalls}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>Events</span>
                      </div>
                      <p className="font-semibold text-gray-900">{venue.totalEvents || 0}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                        <Star className="w-3 h-3" />
                        <span>Rating</span>
                      </div>
                      <p className="font-semibold text-gray-900">{venue.averageRating}</p>
                    </div>
                  </div>

                  {/* Event Names Section with Expandable Feature */}
                  {venue.events && venue.events.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1 items-center mb-2">
                        <span className="text-xs font-medium text-gray-500">Recent Events:</span>
                        {displayEvents.map((event) => (
                          <Badge 
                            key={event.id} 
                            variant="outline" 
                            className="text-xs bg-blue-50 border-blue-200 text-blue-700 max-w-full"
                          >
                            <span className="truncate inline-block max-w-[14rem]">{event.title}</span>
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Expand/Collapse Button */}
                      {venue.events.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => onToggleEvents(venue.id)}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-3 h-3 mr-1" />
                              Show less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3 mr-1" />
                              +{remainingEvents} more
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(venue)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">View</span>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(venue)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Venue
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSendMessage(venue)}>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onVerificationToggle(venue.id)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {venue.isVerified ? "Remove Verification" : "Verify Venue"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onStatusChange(venue.id, (venue.status === "active" ? "suspended" : "active") as "active" | "pending" | "suspended")}
                        >
                          {venue.status === "active" ? (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Suspend Venue
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Activate Venue
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDelete(venue.id)} 
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Venue
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// Pending Venues List Component with Expandable Events
function PendingVenuesList({ 
  venues, 
  expandedVenues,
  onToggleEvents,
  onView, 
  onApprove, 
  onReject, 
  getStatusBadge,
  getEventStatusBadge
}: {
  venues: Venue[]
  expandedVenues: Set<string>
  onToggleEvents: (venueId: string) => void
  onView: (venue: Venue) => void
  onApprove: (venue: Venue) => void
  onReject: (venue: Venue) => void
  getStatusBadge: (status: string) => JSX.Element
  getEventStatusBadge: (status: string) => JSX.Element
}) {
  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-1">
      {venues.map((venue) => {
        const isExpanded = expandedVenues.has(venue.id)
        const displayEvents = venue.events?.slice(0, isExpanded ? venue.events.length : 2) || []
        const remainingEvents = venue.events?.length - displayEvents.length

        return (
          <Card key={venue.id} className="border-yellow-200 bg-yellow-50 hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Venue Image */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center border border-yellow-200">
                    {venue.logo ? (
                      <img 
                        src={venue.logo} 
                        alt={venue.venueName} 
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 md:w-10 md:h-10 text-yellow-600" />
                    )}
                  </div>
                </div>

                {/* Venue Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <div className="flex items-start gap-2 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900 truncate max-w-[18rem]">
                        {venue.venueName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(venue.status || "pending")}
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{[venue.city, venue.state, venue.country].filter(Boolean).join(", ") || "-"}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{venue.email}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                        <Users className="w-3 h-3" />
                        <span>Capacity</span>
                      </div>
                      <p className="font-semibold text-gray-900">{venue.maxCapacity.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                        <Building2 className="w-3 h-3" />
                        <span>Halls</span>
                      </div>
                      <p className="font-semibold text-gray-900">{venue.totalHalls}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>Events</span>
                      </div>
                      <p className="font-semibold text-gray-900">{venue.totalEvents || 0}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                        <Star className="w-3 h-3" />
                        <span>Rating</span>
                      </div>
                      <p className="font-semibold text-gray-900">{venue.averageRating}</p>
                    </div>
                  </div>

                  {/* Event Names for Pending Venues with Expandable Feature */}
                  {venue.events && venue.events.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1 items-center mb-2">
                        <span className="text-xs font-medium text-gray-500">Recent Events:</span>
                        {displayEvents.map((event) => (
                          <Badge 
                            key={event.id} 
                            variant="outline" 
                            className="text-xs bg-yellow-50 border-yellow-200 text-yellow-700 max-w-full"
                          >
                            <span className="truncate inline-block max-w-[14rem]">{event.title}</span>
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Expand/Collapse Button */}
                      {venue.events.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                          onClick={() => onToggleEvents(venue.id)}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-3 h-3 mr-1" />
                              Show less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3 mr-1" />
                              +{remainingEvents} more
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}

                  {venue.createdAt && (
                    <div className="text-xs text-gray-500 mb-3">
                      Submitted on {new Date(venue.createdAt).toLocaleDateString()}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-yellow-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(venue)}
                      className="flex-1 sm:flex-none"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-200 hover:bg-green-50 flex-1 sm:flex-none"
                      onClick={() => onApprove(venue)}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50 flex-1 sm:flex-none"
                      onClick={() => onReject(venue)}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// Updated View Venue Dialog Component with Better Tab Layout
function ViewVenueDialog({ 
  isOpen, 
  onClose, 
  venue, 
  loading,
  getStatusBadge,
  getEventStatusBadge
}: {
  isOpen: boolean
  onClose: () => void
  venue: Venue | null
  loading: boolean
  getStatusBadge: (status: string) => JSX.Element
  getEventStatusBadge: (status: string) => JSX.Element
}) {
  if (!venue) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {venue.venueName}
            {venue.isVerified && <CheckCircle className="w-5 h-5 text-green-500" />}
          </DialogTitle>
          <DialogDescription>Detailed venue information and statistics</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-sm text-gray-500">Loading venue details...</div>
        ) : null}

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6 gap-1 h-auto">
            <TabsTrigger value="details" className="text-xs md:text-sm whitespace-nowrap px-2">Details</TabsTrigger>
            <TabsTrigger value="contact" className="text-xs md:text-sm whitespace-nowrap px-2">Contact</TabsTrigger>
            <TabsTrigger value="stats" className="text-xs md:text-sm whitespace-nowrap px-2">Statistics</TabsTrigger>
            <TabsTrigger value="amenities" className="text-xs md:text-sm whitespace-nowrap px-2">Amenities & Spaces</TabsTrigger>
            <TabsTrigger value="events" className="text-xs md:text-sm whitespace-nowrap px-2">
              Events ({venue.events?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Contact Person</Label>
                  <p className="text-sm text-gray-600 mt-1">{venue.contactPerson}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Location</Label>
                  <p className="text-sm text-gray-600 mt-1 break-words">{[venue.city, venue.state, venue.country].filter(Boolean).join(", ") || "-"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Address</Label>
                  <p className="text-sm text-gray-600 mt-1 break-words">{venue.address || "-"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Capacity</Label>
                  <p className="text-sm text-gray-600 mt-1">{venue.maxCapacity.toLocaleString()} people</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Meeting Spaces</Label>
                  <p className="text-sm text-gray-600 mt-1">{venue.totalHalls} halls</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <div className="mt-1">{getStatusBadge(venue.status || "active")}</div>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Description</Label>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed break-words">{venue.description || "-"}</p>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Mobile</Label>
                    <p className="text-sm text-gray-600 break-all">{venue.mobile || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                    <p className="text-sm text-gray-600 break-all">{venue.email || "-"}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Website</Label>
                    <a 
                      href={venue.website ? `https://${venue.website}` : '#'} 
                      className="text-blue-600 hover:underline text-sm block"
                      onClick={(e) => !venue.website && e.preventDefault()}
                    >
                      {venue.website || 'No website'}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{venue.totalEvents}</p>
                  <p className="text-sm text-gray-600">Total Events</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{venue.activeBookings}</p>
                  <p className="text-sm text-gray-600">Active Bookings</p>
                </CardContent>
              </Card>
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{venue.averageRating}</p>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">{venue.totalReviews}</p>
                  <p className="text-sm text-gray-600">Total Reviews</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="amenities" className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3">Amenities</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {venue.amenities.length === 0 ? <p className="text-sm text-gray-500">No amenities added.</p> : null}
                {venue.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3">Meeting Spaces</Label>
              <div className="space-y-3">
                {venue.meetingSpaces.length === 0 ? <p className="text-sm text-gray-500">No spaces configured.</p> : null}
                {venue.meetingSpaces.map((space) => (
                  <Card key={space.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-medium">{space.name}</p>
                          <p className="text-sm text-gray-600">
                            Capacity: {space.capacity} • Area: {space.area} sq.ft • ₹{space.hourlyRate}/hour
                          </p>
                        </div>
                        <Badge variant={space.isAvailable ? "default" : "secondary"}>
                          {space.isAvailable ? "Available" : "Not Available"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            {venue.events && venue.events.length > 0 ? (
              <div className="space-y-4">
                {venue.events.map((event) => (
                  <Card key={event.id} className="border hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{event.title}</h4>
                            {getEventStatusBadge(event.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{event.description}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            <span>Start: {new Date(event.startDate).toLocaleDateString()}</span>
                            <span>End: {new Date(event.endDate).toLocaleDateString()}</span>
                            <span className={`px-2 py-1 rounded-full ${
                              event.isVirtual 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {event.isVirtual ? 'Virtual' : 'In-Person'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p>No events found for this venue</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// Edit Venue Dialog Component (unchanged but responsive)
function EditVenueDialog({ 
  isOpen, 
  onClose, 
  venue, 
  onSave 
}: {
  isOpen: boolean
  onClose: () => void
  venue: Venue | null
  onSave: (data: any) => void
}) {
  const [formData, setFormData] = useState({
    venueName: "",
    contactPerson: "",
    email: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    country: "",
    website: "",
    description: "",
    maxCapacity: "",
    totalHalls: "",
    amenities: [] as string[],
    isVerified: false,
    status: "active",
  })

  useEffect(() => {
    if (venue) {
      setFormData({
        venueName: venue.venueName || "",
        contactPerson: venue.contactPerson || "",
        email: venue.email || "",
        mobile: venue.mobile || "",
        address: venue.address || "",
        city: venue.city || "",
        state: venue.state || "",
        country: venue.country || "",
        website: venue.website || "",
        description: venue.description || "",
        maxCapacity: venue.maxCapacity?.toString() || "",
        totalHalls: venue.totalHalls?.toString() || "",
        amenities: venue.amenities || [],
        isVerified: venue.isVerified || false,
        status: venue.status || "active",
      })
    }
  }, [venue])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.venueName.trim() || !formData.contactPerson.trim() || !formData.email.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    onSave({
      ...formData,
      maxCapacity: parseInt(formData.maxCapacity) || 0,
      totalHalls: parseInt(formData.totalHalls) || 0,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Venue</DialogTitle>
          <DialogDescription>Update venue information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-venueName">Venue Name</Label>
              <Input
                id="edit-venueName"
                value={formData.venueName}
                onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contactPerson">Contact Person</Label>
              <Input
                id="edit-contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-mobile">Mobile</Label>
              <Input
                id="edit-mobile"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-city">City</Label>
              <Input
                id="edit-city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-state">State</Label>
              <Input
                id="edit-state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-country">Country</Label>
              <Input
                id="edit-country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-website">Website</Label>
              <Input
                id="edit-website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-capacity">Capacity</Label>
              <Input
                id="edit-capacity"
                type="number"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-totalHalls">Total Halls</Label>
              <Input
                id="edit-totalHalls"
                type="number"
                value={formData.totalHalls}
                onChange={(e) => setFormData({ ...formData, totalHalls: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="md:col-span-2 flex items-center space-x-2">
              <Switch
                id="edit-verified"
                checked={formData.isVerified}
                onCheckedChange={(checked) => setFormData({ ...formData, isVerified: checked })}
              />
              <Label htmlFor="edit-verified">Verified Venue</Label>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Reject Venue Dialog Component (unchanged but responsive)
function RejectVenueDialog({ 
  isOpen, 
  onClose, 
  onReject, 
  venueName 
}: {
  isOpen: boolean
  onClose: () => void
  onReject: (reason: string) => void
  venueName?: string
}) {
  const [reason, setReason] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (reason.trim()) {
      onReject(reason)
      setReason("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <ThumbsDown className="w-5 h-5" />
            Reject Venue
          </DialogTitle>
          <DialogDescription>
            {venueName ? `Are you sure you want to reject "${venueName}"?` : "Are you sure you want to reject this venue?"} Please provide a reason for rejection.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Reason for Rejection</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Please provide the reason for rejecting this venue..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              disabled={!reason.trim()}
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Reject Venue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Add Venue Dialog Component (unchanged but responsive)
// function AddVenueDialog({ onAddVenue, onClose }: { onAddVenue: (data: any) => void; onClose: () => void }) {
//   const [formData, setFormData] = useState({
//     venueName: "",
//     contactPerson: "",
//     email: "",
//     mobile: "",
//     address: "",
//     city: "",
//     state: "",
//     country: "",
//     website: "",
//     description: "",
//     maxCapacity: "",
//     totalHalls: "",
//     amenities: [] as string[],
//     isVerified: false,
//     status: "active",
//   })

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     onAddVenue({
//       ...formData,
//       maxCapacity: parseInt(formData.maxCapacity) || 0,
//       totalHalls: parseInt(formData.totalHalls) || 0,
//     })
//   }

//   return (
//     <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//       <DialogHeader>
//         <DialogTitle>Add New Venue</DialogTitle>
//         <DialogDescription>Add a new venue to the platform</DialogDescription>
//       </DialogHeader>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <Label htmlFor="venueName">Venue Name *</Label>
//             <Input
//               id="venueName"
//               value={formData.venueName}
//               onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
//               required
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="contactPerson">Contact Person *</Label>
//             <Input
//               id="contactPerson"
//               value={formData.contactPerson}
//               onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
//               required
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="email">Email *</Label>
//             <Input
//               id="email"
//               type="email"
//               value={formData.email}
//               onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//               required
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="mobile">Mobile</Label>
//             <Input
//               id="mobile"
//               value={formData.mobile}
//               onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
//             />
//           </div>
//           <div className="md:col-span-2 space-y-2">
//             <Label htmlFor="address">Address</Label>
//             <Input
//               id="address"
//               value={formData.address}
//               onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="city">City</Label>
//             <Input
//               id="city"
//               value={formData.city}
//               onChange={(e) => setFormData({ ...formData, city: e.target.value })}
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="state">State</Label>
//             <Input
//               id="state"
//               value={formData.state}
//               onChange={(e) => setFormData({ ...formData, state: e.target.value })}
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="country">Country</Label>
//             <Input
//               id="country"
//               value={formData.country}
//               onChange={(e) => setFormData({ ...formData, country: e.target.value })}
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="website">Website</Label>
//             <Input
//               id="website"
//               value={formData.website}
//               onChange={(e) => setFormData({ ...formData, website: e.target.value })}
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="maxCapacity">Max Capacity</Label>
//             <Input
//               id="maxCapacity"
//               type="number"
//               value={formData.maxCapacity}
//               onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="totalHalls">Total Halls</Label>
//             <Input
//               id="totalHalls"
//               type="number"
//               value={formData.totalHalls}
//               onChange={(e) => setFormData({ ...formData, totalHalls: e.target.value })}
//             />
//           </div>
//           <div className="md:col-span-2 space-y-2">
//             <Label htmlFor="description">Description</Label>
//             <Textarea
//               id="description"
//               value={formData.description}
//               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//             />
//           </div>
//           <div className="md:col-span-2 flex items-center space-x-2">
//             <Switch
//               id="isVerified"
//               checked={formData.isVerified}
//               onCheckedChange={(checked) => setFormData({ ...formData, isVerified: checked })}
//             />
//             <Label htmlFor="isVerified">Verified Venue</Label>
//           </div>
//         </div>
//         <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
//           <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
//             Cancel
//           </Button>
//           {/* <Button type="submit" className="w-full sm:w-auto">Add Venue</Button> */}
//         </DialogFooter>
//       </form>
//     </DialogContent>
//   )
// }