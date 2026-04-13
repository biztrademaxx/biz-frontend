"use client"

import { useState, useEffect } from "react"
import { adminApi } from "@/lib/admin-api"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Eye, Calendar, Users, CheckCircle, XCircle } from 'lucide-react'

interface VisitorEvent {
  id: string
  visitor: {
    id: string
    name: string
    email: string
    phone: string | null
    avatar: string | null
  }
  registrations: Array<{
    id: string
    eventId: string
    eventTitle: string
    eventDate: string
    status: string
    registeredAt: string
    ticketType: string
    totalAmount: number
  }>
  stats: {
    totalRegistrations: number
    confirmedEvents: number
    pendingEvents: number
    cancelledEvents: number
  }
}

export default function VisitorEventsPage() {
  const [visitors, setVisitors] = useState<VisitorEvent[]>([])
  const [filteredVisitors, setFilteredVisitors] = useState<VisitorEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorEvent | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  useEffect(() => {
    fetchVisitors()
  }, [])

  useEffect(() => {
    filterVisitors()
  }, [searchQuery, statusFilter, visitors])

  const fetchVisitors = async () => {
    try {
      const data = await adminApi<VisitorEvent[]>("/visitors/visitor-events")
      const list = Array.isArray(data) ? data : (data as any)?.data ?? []
      setVisitors(list)
      setFilteredVisitors(list)
    } catch (error) {
      console.error("Error fetching visitors:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterVisitors = () => {
    let filtered = visitors

    if (searchQuery) {
      filtered = filtered.filter(
        (visitor) =>
          visitor.visitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          visitor.visitor.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((visitor) =>
        visitor.registrations.some((reg) => reg.status.toLowerCase() === statusFilter.toLowerCase())
      )
    }

    setFilteredVisitors(filtered)
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      CONFIRMED: { label: "Confirmed", variant: "default" },
      PENDING: { label: "Pending", variant: "secondary" },
      CANCELLED: { label: "Cancelled", variant: "destructive" },
      WAITLISTED: { label: "Waitlisted", variant: "outline" },
    }
    const statusInfo = statusMap[status] || { label: status, variant: "outline" as const }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const handleViewDetails = (visitor: VisitorEvent) => {
    setSelectedVisitor(visitor)
    setDetailsDialogOpen(true)
  }

  const stats = {
    totalVisitors: visitors.length,
    totalRegistrations: visitors.reduce((acc, v) => acc + v.stats.totalRegistrations, 0),
    confirmedEvents: visitors.reduce((acc, v) => acc + v.stats.confirmedEvents, 0),
    pendingEvents: visitors.reduce((acc, v) => acc + v.stats.pendingEvents, 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading visitor events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Events by Visitor</h1>
        <p className="text-muted-foreground">Manage visitor event registrations and attendance</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVisitors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmedEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <XCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingEvents}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Visitor Event Registrations</CardTitle>
          <CardDescription>View and manage all visitor event registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by visitor name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="waitlisted">Waitlisted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Events</TableHead>
                  <TableHead>Confirmed</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Cancelled</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisitors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No visitors found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVisitors.map((visitor) => (
                    <TableRow key={visitor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {visitor.visitor.avatar ? (
                              <img
                                src={visitor.visitor.avatar || "/placeholder.svg"}
                                alt={visitor.visitor.name}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <span className="text-sm font-medium text-primary">
                                {visitor.visitor.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{visitor.visitor.name}</div>
                            {visitor.visitor.phone && (
                              <div className="text-sm text-muted-foreground">{visitor.visitor.phone}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{visitor.visitor.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{visitor.stats.totalRegistrations}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-green-600 font-medium">{visitor.stats.confirmedEvents}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-orange-600 font-medium">{visitor.stats.pendingEvents}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-red-600 font-medium">{visitor.stats.cancelledEvents}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(visitor)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Events
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Visitor Event Registrations</DialogTitle>
            <DialogDescription>
              {selectedVisitor && `${selectedVisitor.visitor.name}'s event registrations`}
            </DialogDescription>
          </DialogHeader>

          {selectedVisitor && (
            <div className="space-y-6">
              {/* Visitor Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Visitor Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedVisitor.visitor.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedVisitor.visitor.email}</p>
                    </div>
                    {selectedVisitor.visitor.phone && (
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{selectedVisitor.visitor.phone}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Event Registrations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Event Registrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedVisitor.registrations.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No event registrations found</p>
                    ) : (
                      selectedVisitor.registrations.map((registration) => (
                        <div key={registration.id} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{registration.eventTitle}</h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(registration.eventDate).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                            {getStatusBadge(registration.status)}
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Ticket Type</p>
                              <p className="font-medium">{registration.ticketType}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Amount</p>
                              <p className="font-medium">${registration.totalAmount.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Registered</p>
                              <p className="font-medium">
                                {new Date(registration.registeredAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
