"use client"


import { devLog } from "@/lib/dev-log"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Download, Mail, Phone, MoreHorizontal, Users, Calendar, DollarSign, Eye, Briefcase } from "lucide-react"
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

export default function ExhibitorManagement({ eventId }: ExhibitorManagementProps) {
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([])
  const [filteredExhibitors, setFilteredExhibitors] = useState<Exhibitor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const { toast } = useToast()

  // Stats
  const totalExhibitors = exhibitors.length
  const confirmedExhibitors = exhibitors.filter((e) => e.registration.status === "CONVERTED").length
  const newExhibitors = exhibitors.filter((e) => e.registration.status === "NEW").length

  useEffect(() => {
    fetchExhibitors()
  }, [eventId])

  useEffect(() => {
    filterExhibitors()
  }, [exhibitors, searchTerm, selectedStatus])

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

      // Backend /api/events/:id/exhibitors returns { success, data: { exhibitors } }
      const rawExhibitors = data.data?.exhibitors ?? data.exhibitors ?? []

      if (data.success !== false && Array.isArray(rawExhibitors)) {
        const transformedExhibitors = rawExhibitors.map((item: any) => {
          const user = item.exhibitor || item.user || {}
          const event = item.event || {}

          return {
            id: user.id || item.id || "",
            firstName: user.firstName || "Unknown",
            lastName: user.lastName || "",
            email: user.email || "No email",
            phone: user.phone || "",
            company: user.company || "No company",
            jobTitle: user.jobTitle || "",
            avatar: user.avatar,
            event: {
              id: event.id || eventId,
              title: event.title || "Event",
              startDate: event.startDate || new Date().toISOString(),
            },
            registration: {
              id: item.id || "",
              status: item.status || "NEW",
              registeredAt: item.createdAt || new Date().toISOString(),
            },
          } as Exhibitor
        })

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
    let filtered = exhibitors

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
      ["Name", "Email", "Phone", "Company", "Job Title", "Status", "Registration Date"],
      ...filteredExhibitors.map((exhibitor) => [
        `${exhibitor.firstName} ${exhibitor.lastName}`,
        exhibitor.email,
        exhibitor.phone || "",
        exhibitor.company || "",
        exhibitor.jobTitle || "",
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
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search exhibitors by name, email, or company..."
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
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="CONVERTED">Confirmed</option>
            <option value="FOLLOW_UP">Follow Up</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </CardContent>
      </Card>

      {/* Table */}
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
                <TableHead>Status</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Registered</TableHead>
                {/* <TableHead>Actions</TableHead> */}
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
                    <p className="text-sm">{exhibitor.company || "N/A"}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{new Date(exhibitor.registration.registeredAt).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(exhibitor.registration.registeredAt).toLocaleTimeString()}
                    </p>
                  </TableCell>
                  {/* <TableCell>
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredExhibitors.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {exhibitors.length === 0 
                  ? "No exhibitors have registered for this event yet." 
                  : "No exhibitors found matching your criteria."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}