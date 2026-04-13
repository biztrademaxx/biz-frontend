"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Building2,
  Plane,
  Car,
  MapPin,
  CheckCircle,
  Settings,
  RefreshCw,
  Plus,
  Eye,
  Globe,
  ExternalLink,
  Star,
  DollarSign,
  Calendar,
  Hotel,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { apiFetch } from "@/lib/api"

interface TravelPartner {
  id: string
  name: string
  type: "hotel" | "airline" | "car_rental" | "travel_agency"
  logo: string
  website: string
  email: string
  phone: string
  apiKey?: string
  apiEndpoint?: string
  isActive: boolean
  isVerified: boolean
  commissionRate: number
  rating: number
  totalBookings: number
  totalRevenue: number
  locations: string[]
  description: string
  contactPerson: string
  contractStartDate: string
  contractEndDate: string
  lastSyncAt: string | null
  createdAt: string
}

interface Booking {
  id: string
  partnerId: string
  partnerName: string
  type: string
  customerName: string
  customerEmail: string
  bookingDate: string
  checkIn?: string
  checkOut?: string
  amount: number
  commission: number
  status: string
  reference: string
}

export default function TravelIntegrationsPage() {
  const [partners, setPartners] = useState<TravelPartner[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPartner, setSelectedPartner] = useState<TravelPartner | null>(null)
  const [isConfigureDialogOpen, setIsConfigureDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("partners")
  const [addForm, setAddForm] = useState({
    name: "",
    type: "hotel" as TravelPartner["type"],
    email: "",
    phone: "",
    website: "",
    contactPerson: "",
    commissionRate: 10,
    description: "",
  })
  const [addingPartner, setAddingPartner] = useState(false)

  useEffect(() => {
    void fetchTravel()
  }, [])

  const fetchTravel = async () => {
    try {
      setLoading(true)
      const res = await apiFetch<{
        success?: boolean
        data?: { partners?: TravelPartner[]; bookings?: Booking[] }
      }>("/api/admin/integrations/travel", { auth: true })
      const d = res.data
      setPartners(d?.partners ?? [])
      setBookings(d?.bookings ?? [])
    } catch (error) {
      console.error("Error fetching travel partners:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPartner = async () => {
    if (!addForm.name.trim()) {
      alert("Partner name is required")
      return
    }
    try {
      setAddingPartner(true)
      const res = await apiFetch<{ success?: boolean; data?: TravelPartner }>("/api/admin/integrations/travel/partners", {
        method: "POST",
        body: addForm,
        auth: true,
      })
      if (res.data) setPartners((p) => [...p, res.data!])
      setIsAddDialogOpen(false)
      setAddForm({
        name: "",
        type: "hotel",
        email: "",
        phone: "",
        website: "",
        contactPerson: "",
        commissionRate: 10,
        description: "",
      })
      void fetchTravel()
    } catch (e) {
      console.error(e)
      alert("Failed to add partner")
    } finally {
      setAddingPartner(false)
    }
  }

  const handleTogglePartner = async (partnerId: string, isActive: boolean) => {
    try {
      await apiFetch(`/api/admin/integrations/travel/partners/${partnerId}`, {
        method: "PATCH",
        body: { isActive },
        auth: true,
      })
      setPartners(partners.map((p) => (p.id === partnerId ? { ...p, isActive } : p)))
    } catch (error) {
      console.error("Error toggling partner:", error)
    }
  }

  const handleSyncPartner = async (partnerId: string) => {
    try {
      await apiFetch(`/api/admin/integrations/travel/partners/${partnerId}/sync`, {
        method: "POST",
        auth: true,
      })
      void fetchTravel()
    } catch (error) {
      console.error("Error syncing partner:", error)
    }
  }

  const filteredPartners = partners.filter((partner) => {
    const matchesSearch =
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || partner.type === typeFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && partner.isActive) ||
      (statusFilter === "inactive" && !partner.isActive)
    return matchesSearch && matchesType && matchesStatus
  })

  const stats = {
    totalPartners: partners.length,
    activePartners: partners.filter((p) => p.isActive).length,
    totalBookings: partners.reduce((sum, p) => sum + p.totalBookings, 0),
    totalRevenue: partners.reduce((sum, p) => sum + p.totalRevenue, 0),
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "hotel":
        return <Hotel className="w-4 h-4" />
      case "airline":
        return <Plane className="w-4 h-4" />
      case "car_rental":
        return <Car className="w-4 h-4" />
      case "travel_agency":
        return <Globe className="w-4 h-4" />
      default:
        return <Building2 className="w-4 h-4" />
    }
  }

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      hotel: "bg-blue-100 text-blue-800",
      airline: "bg-purple-100 text-purple-800",
      car_rental: "bg-green-100 text-green-800",
      travel_agency: "bg-orange-100 text-orange-800",
    }
    const labels: Record<string, string> = {
      hotel: "Hotel",
      airline: "Airline",
      car_rental: "Car Rental",
      travel_agency: "Travel Agency",
    }
    return <Badge className={colors[type] || "bg-gray-100 text-gray-800"}>{labels[type] || type}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hotel & Travel Partners</h1>
          <p className="text-gray-600">Manage hotel and travel service integrations</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Partner
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Partners</p>
                <p className="text-2xl font-bold">{stats.totalPartners}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Partners</p>
                <p className="text-2xl font-bold">{stats.activePartners}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{stats.totalBookings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Partners Tab */}
        <TabsContent value="partners" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search partners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="hotel">Hotels</SelectItem>
                <SelectItem value="airline">Airlines</SelectItem>
                <SelectItem value="car_rental">Car Rentals</SelectItem>
                <SelectItem value="travel_agency">Travel Agencies</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Partners Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPartners.map((partner) => (
              <Card key={partner.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getTypeIcon(partner.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{partner.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {getTypeBadge(partner.type)}
                          {partner.isVerified && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={partner.isActive}
                      onCheckedChange={(checked) => handleTogglePartner(partner.id, checked)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Bookings</p>
                      <p className="font-semibold">{partner.totalBookings.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Revenue</p>
                      <p className="font-semibold">${partner.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Commission</p>
                      <p className="font-semibold">{partner.commissionRate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-current" />
                        <span className="font-semibold">{partner.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{partner.locations.slice(0, 2).join(", ")}</span>
                    {partner.locations.length > 2 && <span>+{partner.locations.length - 2} more</span>}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => {
                        setSelectedPartner(partner)
                        setIsViewDialogOpen(true)
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => {
                        setSelectedPartner(partner)
                        setIsConfigureDialogOpen(true)
                      }}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleSyncPartner(partner.id)}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPartners.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No partners found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Bookings made through travel partners</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono text-sm">{booking.reference}</TableCell>
                      <TableCell>{booking.partnerName}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.customerName}</p>
                          <p className="text-sm text-gray-500">{booking.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{booking.type}</TableCell>
                      <TableCell>{new Date(booking.bookingDate).toLocaleDateString()}</TableCell>
                      <TableCell>${booking.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-green-600">${booking.commission.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : booking.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Settings</CardTitle>
              <CardDescription>Configure global travel integration settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default Commission Rate (%)</Label>
                  <Input type="number" defaultValue="10" />
                </div>
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Select defaultValue="USD">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Booking Confirmation Email</Label>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label>Auto-sync Interval</Label>
                  <Select defaultValue="hourly">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="manual">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Partner Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Partner Details</DialogTitle>
          </DialogHeader>
          {selectedPartner && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  {getTypeIcon(selectedPartner.type)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedPartner.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeBadge(selectedPartner.type)}
                    <Badge variant={selectedPartner.isActive ? "default" : "secondary"}>
                      {selectedPartner.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Contact Person</p>
                  <p className="font-medium">{selectedPartner.contactPerson}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedPartner.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedPartner.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Website</p>
                  <a
                    href={selectedPartner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {selectedPartner.website}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-700">{selectedPartner.description}</p>
              </div>

              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedPartner.totalBookings.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Bookings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">${selectedPartner.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedPartner.commissionRate}%</p>
                  <p className="text-sm text-gray-500">Commission</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-5 h-5 text-amber-400 fill-current" />
                    <span className="text-2xl font-bold">{selectedPartner.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-sm text-gray-500">Rating</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Locations</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPartner.locations.map((location, idx) => (
                    <Badge key={idx} variant="outline">
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Contract Start</p>
                  <p>{new Date(selectedPartner.contractStartDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Contract End</p>
                  <p>{new Date(selectedPartner.contractEndDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Configure Partner Dialog */}
      <Dialog open={isConfigureDialogOpen} onOpenChange={setIsConfigureDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configure Partner</DialogTitle>
            <DialogDescription>Update integration settings for {selectedPartner?.name}</DialogDescription>
          </DialogHeader>
          {selectedPartner && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input type="password" defaultValue={selectedPartner.apiKey} />
              </div>
              <div className="space-y-2">
                <Label>API Endpoint</Label>
                <Input defaultValue={selectedPartner.apiEndpoint} />
              </div>
              <div className="space-y-2">
                <Label>Commission Rate (%)</Label>
                <Input type="number" defaultValue={selectedPartner.commissionRate} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active Status</Label>
                <Switch defaultChecked={selectedPartner.isActive} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigureDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsConfigureDialogOpen(false)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Partner Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Partner</DialogTitle>
            <DialogDescription>Add a new hotel or travel partner integration</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Partner Name</Label>
              <Input
                placeholder="Enter partner name"
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={addForm.type}
                onValueChange={(v) => setAddForm((f) => ({ ...f, type: v as TravelPartner["type"] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="airline">Airline</SelectItem>
                  <SelectItem value="car_rental">Car Rental</SelectItem>
                  <SelectItem value="travel_agency">Travel Agency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="partner@example.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  placeholder="+1 234 567 8900"
                  value={addForm.phone}
                  onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                placeholder="https://partner.com"
                value={addForm.website}
                onChange={(e) => setAddForm((f) => ({ ...f, website: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input
                placeholder="John Doe"
                value={addForm.contactPerson}
                onChange={(e) => setAddForm((f) => ({ ...f, contactPerson: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Commission Rate (%)</Label>
              <Input
                type="number"
                value={addForm.commissionRate}
                onChange={(e) => setAddForm((f) => ({ ...f, commissionRate: Number(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Enter partner description"
                value={addForm.description}
                onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleAddPartner()} disabled={addingPartner}>
              {addingPartner ? "Adding…" : "Add Partner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
