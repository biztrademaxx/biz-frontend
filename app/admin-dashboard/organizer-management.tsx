"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Building2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Download,
  MoreHorizontal,
  Ban,
  Clock,
  TrendingUp,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { adminApi } from "@/lib/admin-api"
import { useToast } from "@/components/ui/use-toast"
import EntityBulkImport from "./entity-bulk-import"

interface Organizer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  avatar: string | null
  role: string
  isActive: boolean
  isVerified: boolean
  lastLogin: string | null
  createdAt: string
  updatedAt: string
  organizationName: string | null
  description: string | null
  headquarters: string | null
  founded: string | null
  teamSize: string | null
  specialties: string[]
  achievements: string[]
  certifications: string[]
  businessEmail: string | null
  businessPhone: string | null
  businessAddress: string | null
  taxId: string | null
  totalEvents: number
  activeEvents: number
  totalAttendees: number
  totalRevenue: number
  location: string | null
  website: string | null
  linkedin: string | null
  twitter: string | null
  instagram: string | null
  timezone: string | null
  language: string | null
  _count?: {
    organizedEvents: number
    speakers: number
    exhibitors: number
    venueManagers: number
  }
}

interface TransformedOrganizer {
  id: string
  name: string
  email: string
  phone: string
  location: string
  status: "active" | "pending" | "suspended"
  joinDate: string
  totalEvents: number
  totalRevenue: number
  rating: number
  avatar: string
  category: string
  description: string
  documents: string[]
  lastActive: string
  originalData: Organizer
}

export default function OrganizerManagement({ initialTab = "all" }: { initialTab?: "all" | "bulk-import" }) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve")
  const [approvalMessage, setApprovalMessage] = useState("")
  const [organizers, setOrganizers] = useState<Organizer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"all" | "bulk-import">(initialTab)

  // Fetch organizers from API
  useEffect(() => {
    fetchOrganizers()
  }, [])

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  const fetchOrganizers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminApi<{ success?: boolean; data?: Organizer[]; organizers?: Organizer[] }>("/organizers")
      const list = data?.data ?? (data as any)?.organizers ?? []
      setOrganizers(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error("Error fetching organizers:", err)
      setError("Failed to load organizers")
      toast({
        title: "Error",
        description: "Failed to load organizers",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const transformOrganizerData = (organizer: Organizer): TransformedOrganizer => {
    // Determine status based on isActive and isVerified
    let status: "active" | "pending" | "suspended" = "pending"
    if (organizer.isActive && organizer.isVerified) {
      status = "active"
    } else if (!organizer.isActive) {
      status = "suspended"
    } else if (!organizer.isVerified) {
      status = "pending"
    }

    // Generate location from available data
    const location = organizer.headquarters || organizer.businessAddress || "Location not specified"
    
    // Calculate rating based on reviews or events
    const rating = organizer.totalEvents > 10 ? 4.5 : organizer.totalEvents > 5 ? 4.0 : organizer.totalEvents > 0 ? 3.5 : 0

    // Mock documents (replace with actual document data when available)
    const documents = organizer.certifications && organizer.certifications.length > 0 
      ? organizer.certifications 
      : ["Business Registration", "Tax ID"]

    return {
      id: organizer.id,
      name: organizer.organizationName || `${organizer.firstName} ${organizer.lastName}`,
      email: organizer.email,
      phone: organizer.phone || organizer.businessPhone || "Not provided",
      location: location,
      status: status,
      joinDate: new Date(organizer.createdAt).toISOString().split('T')[0],
      totalEvents: organizer.totalEvents || organizer._count?.organizedEvents || 0,
      totalRevenue: organizer.totalRevenue || 0,
      rating: rating,
      avatar: organizer.avatar || `/placeholder.svg?height=40&width=40&text=${organizer.firstName?.charAt(0) || 'O'}${organizer.lastName?.charAt(0) || 'R'}`,
      category: organizer.specialties?.[0] || "General Events",
      description: organizer.description || "No description provided",
      documents: documents,
      lastActive: organizer.lastLogin ? new Date(organizer.lastLogin).toISOString().split('T')[0] : new Date(organizer.updatedAt).toISOString().split('T')[0],
      originalData: organizer
    }
  }

  // Filter organizers based on search and status
  const filteredOrganizers: TransformedOrganizer[] = organizers
    .map(transformOrganizerData)
    .filter((organizer) => {
      const matchesSearch =
        organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        organizer.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || organizer.status === statusFilter
      return matchesSearch && matchesStatus
    })

  // Calculate statistics
  const stats = {
    total: organizers.length,
    active: organizers.filter((o) => o.isActive && o.isVerified).length,
    pending: organizers.filter((o) => !o.isVerified).length,
    suspended: organizers.filter((o) => !o.isActive).length,
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "suspended":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <Ban className="w-3 h-3 mr-1" />
            Suspended
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleApproval = (organizer: TransformedOrganizer, action: "approve" | "reject") => {
    setSelectedOrganizer(organizer.originalData)
    setApprovalAction(action)
    setShowApprovalDialog(true)
  }

  const submitApproval = async () => {
    if (!selectedOrganizer) return
    
    try {
      // Here you would implement the actual approval/rejection logic
      const response = await fetch(`/api/admin/organizers/${selectedOrganizer?.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: approvalAction,
          message: approvalMessage
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update organizer status')
      }

      // Refresh the organizers list
      await fetchOrganizers()
      setShowApprovalDialog(false)
      setApprovalMessage("")
    } catch (error: any) {
      console.error('Error updating organizer status:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update organizer status",
        variant: "destructive"
      })
    }
  }

  const handleExport = async () => {
    try {
      interface ExportResponse {
        csv?: string;
        data?: any[];
      }
      
      const response = await adminApi<ExportResponse>('/organizers/export', {
        method: 'GET'
      })
      
      // Create a blob from the response data
      const csv = response.csv || JSON.stringify(response, null, 2)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'organizers.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: "Data exported successfully!"
      })
    } catch (error: any) {
      console.error('Error exporting data:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to export data",
        variant: "destructive"
      })
    }
  }

  const handleSendMessage = async (organizer: TransformedOrganizer) => {
    try {
      await adminApi("/organizers/send-account-email", {
        method: "POST",
        body: { organizerId: organizer.id },
      })
      toast({
        title: "Email sent",
        description: `Account email sent to ${organizer.email}`,
      })
    } catch (error: any) {
      console.error("Error sending organizer email:", error)
      toast({
        title: "Failed to send email",
        description: error?.message || "Could not send organizer email",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading organizers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-destructive text-lg font-semibold mb-2">Error</p>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchOrganizers}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between ">
        <h1 className="text-3xl font-bold text-gray-900">Organizer Management</h1>
        <div className="flex gap-2 ">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "all" | "bulk-import")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Organizers</TabsTrigger>
          <TabsTrigger value="bulk-import">Bulk Import</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 ">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold">{stats.total}</h3>
                <p className="text-gray-600">Total Organizers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold">{stats.active}</h3>
                <p className="text-gray-600">Active</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-yellow-100 rounded-full w-fit mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold">{stats.pending}</h3>
                <p className="text-gray-600">Pending Review</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold">{stats.suspended}</h3>
                <p className="text-gray-600">Suspended</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardContent className="w-auto max-w-300">
              <div className="flex flex-col md:flex-row gap-2 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search organizers by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

          {/* Organizers Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizers.map((organizer) => (
                  <TableRow key={organizer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={organizer.avatar} />
                          <AvatarFallback>{organizer.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{organizer.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {organizer.location}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {organizer.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {organizer.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{organizer.category}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(organizer.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {organizer.totalEvents}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1 text-gray-400" />₹{organizer.totalRevenue.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-400" />
                        {organizer.rating || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {organizer.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproval(organizer, "approve")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleApproval(organizer, "reject")}>
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Organizer Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="flex items-center gap-4">
                                <Avatar className="w-16 h-16">
                                  <AvatarImage src={organizer.avatar} />
                                  <AvatarFallback>{organizer.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="text-xl font-semibold">{organizer.name}</h3>
                                  <p className="text-gray-600">{organizer.category}</p>
                                  {getStatusBadge(organizer.status)}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Contact Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center">
                                      <Mail className="w-4 h-4 mr-2" />
                                      {organizer.email}
                                    </div>
                                    <div className="flex items-center">
                                      <Phone className="w-4 h-4 mr-2" />
                                      {organizer.phone}
                                    </div>
                                    <div className="flex items-center">
                                      <MapPin className="w-4 h-4 mr-2" />
                                      {organizer.location}
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-medium mb-2">Performance Metrics</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-2" />
                                      {organizer.totalEvents} Events
                                    </div>
                                    <div className="flex items-center">
                                      <DollarSign className="w-4 h-4 mr-2" />₹{organizer.totalRevenue.toLocaleString()}{" "}
                                      Revenue
                                    </div>
                                    <div className="flex items-center">
                                      <Star className="w-4 h-4 mr-2" />
                                      {organizer.rating || "N/A"} Rating
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Description</h4>
                                <p className="text-sm text-gray-600">{organizer.description}</p>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Submitted Documents</h4>
                                <div className="flex flex-wrap gap-2">
                                  {organizer.documents.map((doc, index) => (
                                    <Badge key={index} variant="outline">
                                      {doc}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="text-sm text-gray-500">
                                <p>Joined: {new Date(organizer.joinDate).toLocaleDateString()}</p>
                                <p>Last Active: {new Date(organizer.lastActive).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleSendMessage(organizer)}>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <TrendingUp className="w-4 h-4 mr-2" />
                              View Analytics
                            </DropdownMenuItem>
                            {organizer.status === "active" && (
                              <DropdownMenuItem className="text-red-600">
                                <Ban className="w-4 h-4 mr-2" />
                                Suspend Account
                              </DropdownMenuItem>
                            )}
                            {organizer.status === "suspended" && (
                              <DropdownMenuItem className="text-green-600">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Reactivate Account
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-import">
          <EntityBulkImport
            title="Organizer Bulk Import"
            description="Import organizers using all core add-organizer fields."
            endpoint="/organizers/import"
            templateHeaders={[
              "firstName",
              "lastName",
              "email",
              "phone",
              "organizationName",
              "description",
              "city",
              "state",
              "country",
              "founded",
              "teamSize",
              "specialties",
              "businessEmail",
              "businessPhone",
              "businessAddress",
              "taxId",
              "isActive",
            ]}
            sampleRow={[
              "John",
              "Doe",
              "john@eventco.com",
              "+1 555 000 1000",
              "EventCo",
              "Corporate event specialists",
              "San Francisco",
              "California",
              "United States",
              "2018",
              "11-50",
              "Corporate Events|Conferences",
              "contact@eventco.com",
              "+1 555 000 1010",
              "Market Street, SF",
              "GST-1099",
              "true",
            ]}
          />
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{approvalAction === "approve" ? "Approve Organizer" : "Reject Organizer"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to {approvalAction} <strong>{selectedOrganizer?.organizationName || `${selectedOrganizer?.firstName} ${selectedOrganizer?.lastName}`}</strong>?
            </p>
            <div>
              <label className="block text-sm font-medium mb-2">
                {approvalAction === "approve" ? "Approval Message (Optional)" : "Rejection Reason"}
              </label>
              <Textarea
                placeholder={
                  approvalAction === "approve"
                    ? "Welcome message for the organizer..."
                    : "Please provide a reason for rejection..."
                }
                value={approvalMessage}
                onChange={(e) => setApprovalMessage(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={submitApproval}
                className={approvalAction === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
                variant={approvalAction === "reject" ? "destructive" : "default"}
              >
                {approvalAction === "approve" ? "Approve" : "Reject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}