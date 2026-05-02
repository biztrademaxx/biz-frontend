"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Building2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Download,
  MoreHorizontal,
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
  averageRating?: number | null
  totalReviews?: number | null
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
  joinDate: string
  totalEvents: number
  totalRevenue: number
  averageRating: number
  totalReviews: number
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
    const location = organizer.headquarters || organizer.businessAddress || "Location not specified"
    const eventCount = organizer._count?.organizedEvents ?? organizer.totalEvents ?? 0
    const avg = Number(organizer.averageRating ?? 0)
    const reviewCount = organizer.totalReviews ?? 0

    const documents =
      organizer.certifications && organizer.certifications.length > 0
        ? organizer.certifications
        : ["Business Registration", "Tax ID"]

    return {
      id: organizer.id,
      name: organizer.organizationName || `${organizer.firstName} ${organizer.lastName}`,
      email: organizer.email,
      phone: organizer.phone || organizer.businessPhone || "Not provided",
      location,
      joinDate: new Date(organizer.createdAt).toISOString().split("T")[0],
      totalEvents: eventCount,
      totalRevenue: organizer.totalRevenue || 0,
      averageRating: avg,
      totalReviews: reviewCount,
      avatar:
        organizer.avatar || "/city/c4.jpg",
      category: organizer.specialties?.[0] || "General Events",
      description: organizer.description || "No description provided",
      documents,
      lastActive: organizer.lastLogin
        ? new Date(organizer.lastLogin).toISOString().split("T")[0]
        : new Date(organizer.updatedAt).toISOString().split("T")[0],
      originalData: organizer,
    }
  }

  const filteredOrganizers: TransformedOrganizer[] = organizers
    .map(transformOrganizerData)
    .filter((organizer) => {
      const q = searchTerm.trim().toLowerCase()
      if (!q) return true
      return (
        organizer.name.toLowerCase().includes(q) ||
        organizer.email.toLowerCase().includes(q) ||
        organizer.category.toLowerCase().includes(q)
      )
    })

  // Calculate statistics
  const stats = {
    total: organizers.length,
    active: organizers.filter((o) => o.isActive && o.isVerified).length,
    pending: organizers.filter((o) => !o.isVerified).length,
    suspended: organizers.filter((o) => !o.isActive).length,
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
              <div className="mb-6 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or category…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

          {/* Organizers Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 shrink-0 text-amber-400" />
                          <span className="font-medium tabular-nums">
                            {organizer.totalReviews > 0 ? organizer.averageRating.toFixed(1) : "—"}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {organizer.totalReviews} review{organizer.totalReviews !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
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
                                      <Star className="w-4 h-4 mr-2 text-amber-400" />
                                      {organizer.totalReviews > 0
                                        ? `${organizer.averageRating.toFixed(1)} (${organizer.totalReviews} reviews)`
                                        : "No reviews yet"}
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
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleSendMessage(organizer)}>
                              <Mail className="w-4 h-4 mr-2" />
                              Send account email
                            </DropdownMenuItem>
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

    </div>
  )
}