"use client"


import { devLog } from "@/lib/dev-log"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Briefcase } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatCityCountryLine } from "@/lib/location-data"

interface Exhibitor {
  id: string
  source: "ORGANIZER_ADDED" | "STALL_BOOK_REQUEST"
  leadType?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  avatar?: string
  locationDisplay?: string
  city?: string
  country?: string
  event: {
    id: string
    title: string
    startDate: string
  }
  registration: {
    id: string
    status: string
    registeredAt: string
  }
}

interface ExhibitorManagementProps {
  eventId: string
}

type ExhibitorTab = "EVENT_EXHIBITORS" | "STALL_REQUESTS"

const EVENT_EXHIBITOR_STATUSES = ["BOOKED", "CONFIRMED", "SETUP", "ACTIVE", "COMPLETED", "CANCELLED"] as const
const STALL_REQUEST_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "FOLLOW_UP", "REJECTED"] as const

export default function ExhibitorManagement({ eventId }: ExhibitorManagementProps) {
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([])
  const [filteredExhibitors, setFilteredExhibitors] = useState<Exhibitor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<ExhibitorTab>("EVENT_EXHIBITORS")
  const { toast } = useToast()

  // Stats
  const organizerAddedExhibitors = exhibitors.filter((e) => e.source === "ORGANIZER_ADDED")
  const stallRequestLeads = exhibitors.filter((e) => e.source === "STALL_BOOK_REQUEST")
  const totalExhibitors = organizerAddedExhibitors.length
  const confirmedExhibitors = exhibitors.filter((e) => e.registration.status === "CONVERTED").length
  const newExhibitors = stallRequestLeads.filter((e) => e.registration.status === "NEW").length

  useEffect(() => {
    fetchExhibitors()
  }, [eventId])

  useEffect(() => {
    filterExhibitors()
  }, [exhibitors, searchTerm, selectedStatus, activeTab])

  useEffect(() => {
    setSelectedStatus("all")
  }, [activeTab])

  const fetchExhibitors = async () => {
    try {
      setLoading(true)
      devLog('Fetching exhibitors for event:', eventId)
      
      const response = await fetch(`/api/events/${eventId}/exhibitors`)
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`Failed to fetch exhibitors: ${response.status}`)
      }

      const data = await response.json()
      devLog('API Response data:', data)

      // Backend /api/events/:id/exhibitors now returns:
      // { success, data: { exhibitors: ExhibitorBooths[], stallBookRequests: EventLead[] } }
      const rawExhibitors = data.data?.exhibitors ?? data.exhibitors ?? []
      const rawStallBookRequests = data.data?.stallBookRequests ?? []

      if (data.success !== false && Array.isArray(rawExhibitors)) {
        const transformedBooths = rawExhibitors.map((item: any) => {
          const user = item.exhibitor || item.user || {}
          const event = item.event || {}

          return {
            id: user.id || item.id || "",
            source: "ORGANIZER_ADDED",
            firstName: user.firstName || "Unknown",
            lastName: user.lastName || "",
            email: user.email || "No email",
            phone: user.phone || "",
            company: user.company || "No company",
            jobTitle: user.jobTitle || "",
            avatar: user.avatar,
            locationDisplay: user.locationDisplay,
            city: user.city,
            country: user.country,
            profileCity: user.profileCity,
            profileCountry: user.profileCountry,
            event: {
              id: event.id || eventId,
              title: event.title || "Event",
              startDate: event.startDate || new Date().toISOString(),
            },
            registration: {
              id: item.id || "",
              status: item.status || "BOOKED",
              registeredAt: item.createdAt || new Date().toISOString(),
            },
          } as Exhibitor
        })

        const transformedStallLeads = Array.isArray(rawStallBookRequests)
          ? rawStallBookRequests.map((lead: any) => {
              const user = lead.user || {}
              const event = lead.event || {}
              return {
                id: user.id || lead.userId || lead.id || "",
                source: "STALL_BOOK_REQUEST",
                leadType: lead.type || "",
                firstName: user.firstName || "Unknown",
                lastName: user.lastName || "",
                email: user.email || "No email",
                phone: user.phone || "",
                company: user.company || "No company",
                jobTitle: user.jobTitle || "",
                avatar: user.avatar,
                locationDisplay: user.locationDisplay,
                city: user.city || user.profileCity,
                country: user.country || user.profileCountry,
                event: {
                  id: event.id || eventId,
                  title: event.title || "Event",
                  startDate: event.startDate || new Date().toISOString(),
                },
                registration: {
                  id: lead.id || "",
                  status: lead.status || "NEW",
                  registeredAt: lead.createdAt || new Date().toISOString(),
                },
              } as Exhibitor
            })
          : []

        const transformedExhibitors = [...transformedBooths, ...transformedStallLeads]
        devLog('Transformed exhibitors:', transformedExhibitors)
        setExhibitors(transformedExhibitors)
      } else {
        console.warn('No exhibitors found or unexpected response structure:', data)
        setExhibitors([])
        toast({
          title: "Info",
          description: "No exhibitors found for this event",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error fetching exhibitors:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load exhibitors data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterExhibitors = () => {
    let filtered =
      activeTab === "EVENT_EXHIBITORS"
        ? organizerAddedExhibitors
        : stallRequestLeads

    if (searchTerm) {
      filtered = filtered.filter(
        (exhibitor) =>
          `${exhibitor.firstName} ${exhibitor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exhibitor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exhibitor.company?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((exhibitor) => exhibitor.registration.status === selectedStatus)
    }

    setFilteredExhibitors(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONVERTED":
        return "bg-green-100 text-green-800"
      case "NEW":
        return "bg-blue-100 text-blue-800"
      case "CONTACTED":
        return "bg-yellow-100 text-yellow-800"
      case "QUALIFIED":
        return "bg-purple-100 text-purple-800"
      case "FOLLOW_UP":
        return "bg-orange-100 text-orange-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "CONVERTED":
        return "Confirmed"
      case "BOOKED":
        return "Booked"
      case "CONFIRMED":
        return "Confirmed"
      case "NEW":
        return "New"
      case "CONTACTED":
        return "Contacted"
      case "QUALIFIED":
        return "Qualified"
      case "FOLLOW_UP":
        return "Follow Up"
      case "REJECTED":
        return "Rejected"
      default:
        return status
    }
  }

  const exportExhibitors = () => {
    const csvContent = [
      ["Name", "Email", "Phone", "Company", "Job Title", "Source", "Status", "Registration Date"],
      ...filteredExhibitors.map((exhibitor) => [
        `${exhibitor.firstName} ${exhibitor.lastName}`,
        exhibitor.email,
        exhibitor.phone || "",
        exhibitor.company || "",
        exhibitor.jobTitle || "",
        exhibitor.source === "ORGANIZER_ADDED" ? "Organizer Added" : "Stall Request",
        getStatusDisplayName(exhibitor.registration.status),
        new Date(exhibitor.registration.registeredAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `exhibitors-${eventId}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast({
      title: "Export Successful",
      description: "Exhibitors data has been exported to CSV",
    })
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Exhibitors</p>
              <p className="text-2xl font-bold">{totalExhibitors}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold">{confirmedExhibitors}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">New Leads</p>
              <p className="text-2xl font-bold">{newExhibitors}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex gap-4 flex-col sm:flex-row">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={activeTab === "EVENT_EXHIBITORS" ? "default" : "outline"}
              onClick={() => setActiveTab("EVENT_EXHIBITORS")}
            >
              Event Exhibitors ({organizerAddedExhibitors.length})
            </Button>
            <Button
              type="button"
              variant={activeTab === "STALL_REQUESTS" ? "default" : "outline"}
              onClick={() => setActiveTab("STALL_REQUESTS")}
            >
              Stall Booking Requests ({stallRequestLeads.length})
            </Button>
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={
                activeTab === "EVENT_EXHIBITORS"
                  ? "Search event exhibitors by name, email, or company..."
                  : "Search stall booking requests by name, email, or company..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Status</option>
            {(activeTab === "EVENT_EXHIBITORS" ? EVENT_EXHIBITOR_STATUSES : STALL_REQUEST_STATUSES).map((status) => (
              <option key={status} value={status}>
                {getStatusDisplayName(status)}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === "EVENT_EXHIBITORS" ? "Event Exhibitors" : "Stall Booking Requests"} ({filteredExhibitors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exhibitor</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExhibitors.map((exhibitor) => (
                <TableRow key={`${exhibitor.source}-${exhibitor.registration.id || exhibitor.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={exhibitor.avatar } />
                        <AvatarFallback>
                          {exhibitor.firstName[0]}
                          {exhibitor.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {exhibitor.firstName} {exhibitor.lastName}
                        </p>
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
                    <Badge className={getStatusColor(exhibitor.registration.status)}>
                      {getStatusDisplayName(exhibitor.registration.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={exhibitor.source === "ORGANIZER_ADDED" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-900"}>
                      {exhibitor.source === "ORGANIZER_ADDED" ? "Organizer Added" : "Stall Request"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{exhibitor.company || "N/A"}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{formatCityCountryLine(exhibitor) || "—"}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{new Date(exhibitor.registration.registeredAt).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(exhibitor.registration.registeredAt).toLocaleTimeString()}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredExhibitors.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {activeTab === "EVENT_EXHIBITORS"
                  ? (organizerAddedExhibitors.length === 0
                    ? "No exhibitors have been added to this event yet."
                    : "No event exhibitors found matching your criteria.")
                  : (stallRequestLeads.length === 0
                    ? "No stall booking requests received yet."
                    : "No stall booking requests found matching your criteria.")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}