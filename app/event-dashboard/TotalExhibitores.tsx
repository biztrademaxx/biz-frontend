"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Download,
  Mail,
  Phone,
  MoreHorizontal,
  Building,
  Calendar,
  DollarSign,
  Eye,
  MapPin,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Exhibitor {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  avatar?: string
  booth: {
    id: string
    boothNumber: string
    companyName: string
    description?: string
    totalCost: number
    status: string
    additionalPower: number
    compressedAir: number
    space: {
      name: string
      spaceType: string
    }
  }
  event: {
    id: string
    title: string
    startDate: string
  }
}

interface ExhibitorsManagementProps {
  eventId: string // Changed from organizerId to eventId
}

export default function ExhibitorsManagement({ eventId }: ExhibitorsManagementProps) {
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([])
  const [filteredExhibitors, setFilteredExhibitors] = useState<Exhibitor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const { toast } = useToast()

  // Stats
  const totalExhibitors = exhibitors.length
  const confirmedBooths = exhibitors.filter((e) => e.booth.status === "CONFIRMED").length
  const totalRevenue = exhibitors.reduce((sum, e) => sum + e.booth.totalCost, 0)
  const uniqueEvents = [...new Set(exhibitors.map((e) => e.event.id))].length

  useEffect(() => {
    fetchExhibitors()
  }, [eventId]) // Changed dependency from organizerId to eventId

  useEffect(() => {
    filterExhibitors()
  }, [exhibitors, searchTerm, selectedStatus])

  const fetchExhibitors = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/${eventId}/leads/exhibitor`)
      if (!response.ok) throw new Error("Failed to fetch exhibitors")

      const data = await response.json()

      // Transform backend response into frontend shape
      setExhibitors(
        data.attendeeLeads.map((lead: any) => ({
          id: lead.user.id,
          firstName: lead.user.firstName,
          lastName: lead.user.lastName,
          email: lead.user.email,
          phone: lead.user.phone,
          company: lead.user.company,
          jobTitle: lead.user.jobTitle,
          avatar: lead.user.avatar,
          booth: {
            id: lead.id,
            boothNumber: lead.notes || "N/A",
            companyName: lead.user.company || "Unknown",
            description: "",
            totalCost: 0,
            status: lead.status || "BOOKED",
            additionalPower: 0,
            compressedAir: 0,
            space: {
              name: lead.event.title,
              spaceType: "Standard",
            },
          },
          event: {
            id: lead.event.id,
            title: lead.event.title,
            startDate: lead.event.startDate,
          },
        })),
      )
    } catch (error) {
      console.error("Error fetching exhibitors:", error)
      toast({
        title: "Error",
        description: "Failed to load exhibitors data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterExhibitors = () => {
    let filtered = exhibitors

    if (searchTerm) {
      filtered = filtered.filter(
        (exhibitor) =>
          `${exhibitor.firstName} ${exhibitor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exhibitor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exhibitor.booth.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exhibitor.booth.boothNumber.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // if (selectedEvent !== "all") {
    //   filtered = filtered.filter((exhibitor) => exhibitor.event.id === selectedEvent)
    // }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((exhibitor) => exhibitor.booth.status === selectedStatus)
    }

    setFilteredExhibitors(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800"
      case "BOOKED":
        return "bg-blue-100 text-blue-800"
      case "SETUP":
        return "bg-yellow-100 text-yellow-800"
      case "ACTIVE":
        return "bg-purple-100 text-purple-800"
      case "COMPLETED":
        return "bg-gray-100 text-gray-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const exportExhibitors = () => {
    const csvContent = [
      ["Name", "Email", "Phone", "Company", "Booth Number", "Event", "Status", "Space Type", "Total Cost"],
      ...filteredExhibitors.map((exhibitor) => [
        `${exhibitor.firstName} ${exhibitor.lastName}`,
        exhibitor.email,
        exhibitor.phone || "",
        exhibitor.booth.companyName,
        exhibitor.booth.boothNumber,
        exhibitor.event.title,
        exhibitor.booth.status,
        exhibitor.booth.space.spaceType,
        exhibitor.booth.totalCost,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "exhibitors.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading exhibitors...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Exhibitors Management</h1>
          <p className="text-gray-600">Manage and track your event exhibitors</p>
        </div>
        <Button onClick={exportExhibitors} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Exhibitors</p>
                <p className="text-2xl font-bold">{totalExhibitors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Confirmed Booths</p>
                <p className="text-2xl font-bold">{confirmedBooths}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Active Events</p>
                <p className="text-2xl font-bold">{uniqueEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search exhibitors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="BOOKED">Booked</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SETUP">Setup</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Exhibitors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Exhibitors ({filteredExhibitors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exhibitor</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Booth Details</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExhibitors.map((exhibitor) => (
                <TableRow key={exhibitor.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={exhibitor.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {exhibitor.firstName[0]}
                          {exhibitor.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {exhibitor.firstName} {exhibitor.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{exhibitor.booth.companyName}</p>
                        {exhibitor.jobTitle && <p className="text-xs text-gray-500">{exhibitor.jobTitle}</p>}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm">{exhibitor.email}</p>
                      {exhibitor.phone && <p className="text-sm text-gray-600">{exhibitor.phone}</p>}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Booth {exhibitor.booth.boothNumber}
                      </p>
                      <p className="text-xs text-gray-600">{exhibitor.booth.space.name}</p>
                      <p className="text-xs text-gray-500">{exhibitor.booth.space.spaceType}</p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{exhibitor.event.title}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(exhibitor.event.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge className={getStatusColor(exhibitor.booth.status)}>{exhibitor.booth.status}</Badge>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      {exhibitor.booth.additionalPower > 0 && (
                        <p className="text-xs">Power: {exhibitor.booth.additionalPower} KW</p>
                      )}
                      {exhibitor.booth.compressedAir > 0 && (
                        <p className="text-xs">Air: {exhibitor.booth.compressedAir} HP</p>
                      )}
                      {exhibitor.booth.additionalPower === 0 && exhibitor.booth.compressedAir === 0 && (
                        <p className="text-xs text-gray-500">Basic</p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className="font-medium">₹{exhibitor.booth.totalCost.toLocaleString()}</p>
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredExhibitors.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No exhibitors found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
