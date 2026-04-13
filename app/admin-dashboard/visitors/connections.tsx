"use client"

import { useState, useEffect } from "react"
import { adminApi } from "@/lib/admin-api"
import { Search, Users, UserPlus, UserCheck, UserX, Eye, Calendar, Mail, Phone, Building2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Connection {
  id: string
  senderId: string
  receiverId: string
  status: string
  createdAt: string
  acceptedAt: string | null
}

interface Visitor {
  id: string
  name: string
  email: string
  avatar: string | null
  company: string | null
  jobTitle: string | null
  location: string | null
  totalConnections: number
  pendingRequests: number
  acceptedConnections: number
  rejectedRequests: number
  connectionsSent: Connection[]
  connectionsReceived: Connection[]
}

export default function VisitorConnectionsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    fetchVisitors()
  }, [searchQuery, statusFilter])

  const fetchVisitors = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      if (statusFilter !== "all") params.append("status", statusFilter)

      const data = await adminApi<{ visitors?: Visitor[] }>(`/visitors/visitor-connections?${params}`)
      setVisitors((data as any)?.visitors ?? [])
    } catch (error) {
      console.error("Error fetching visitors:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (visitor: Visitor) => {
    setSelectedVisitor(visitor)
    setDetailsOpen(true)
  }

  const filteredVisitors = visitors

  const totalVisitors = visitors.length
  const totalConnections = visitors.reduce((sum, v) => sum + v.acceptedConnections, 0)
  const pendingRequests = visitors.reduce((sum, v) => sum + v.pendingRequests, 0)
  const avgConnectionsPerVisitor = totalVisitors > 0 ? (totalConnections / totalVisitors).toFixed(1) : "0"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Visitor Connections</h1>
        <p className="text-gray-600 mt-2">
          View and manage visitor networking connections
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisitors}</div>
            <p className="text-xs text-gray-600 mt-1">Active network users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Connections</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConnections}</div>
            <p className="text-xs text-gray-600 mt-1">Accepted connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <UserPlus className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-gray-600 mt-1">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Connections</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgConnectionsPerVisitor}</div>
            <p className="text-xs text-gray-600 mt-1">Per visitor</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by visitor name, email, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Visitors</SelectItem>
            <SelectItem value="active">Active Networkers</SelectItem>
            <SelectItem value="pending">Has Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Visitors Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Visitors</CardTitle>
          <CardDescription>
            Complete list of visitors with their connection statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading visitors...</div>
          ) : filteredVisitors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No visitors found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor</TableHead>
                  <TableHead>Company</TableHead>
                  {/* <TableHead>Location</TableHead> */}
                  <TableHead className="text-center">Total Connections</TableHead>
                  <TableHead className="text-center">Accepted</TableHead>
                  <TableHead className="text-center">Pending</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisitors.map((visitor) => (
                  <TableRow key={visitor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{visitor.name}</div>
                          <div className="text-sm text-gray-500">{visitor.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {visitor.company && (
                          <>
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{visitor.company}</span>
                          </>
                        )}
                        {!visitor.company && (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </div>
                    </TableCell>
                    {/* <TableCell>
                      <span className="text-sm">{visitor.location || "N/A"}</span>
                    </TableCell> */}
                    <TableCell className="text-center">
                      <Badge variant="outline">{visitor.totalConnections}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {visitor.acceptedConnections}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        {visitor.pendingRequests}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(visitor)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Visitor Connection Details</DialogTitle>
            <DialogDescription>
              View all connections for this visitor
            </DialogDescription>
          </DialogHeader>

          {selectedVisitor && (
            <div className="space-y-6">
              {/* Visitor Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Visitor Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedVisitor.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedVisitor.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="font-medium">{selectedVisitor.company || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Job Title</p>
                    <p className="font-medium">{selectedVisitor.jobTitle || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{selectedVisitor.location || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Connections</p>
                    <p className="font-medium">{selectedVisitor.totalConnections}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Connection Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{selectedVisitor.acceptedConnections}</div>
                      <p className="text-sm text-gray-600">Accepted</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <UserPlus className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{selectedVisitor.pendingRequests}</div>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <UserX className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{selectedVisitor.rejectedRequests}</div>
                      <p className="text-sm text-gray-600">Rejected</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Connections Sent */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Connection Requests Sent</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedVisitor.connectionsSent.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No connection requests sent</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedVisitor.connectionsSent.map((conn) => (
                        <div key={conn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">Request ID: {conn.id.slice(0, 8)}</p>
                              <p className="text-xs text-gray-500">
                                Sent on {new Date(conn.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              conn.status === "ACCEPTED"
                                ? "default"
                                : conn.status === "PENDING"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {conn.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Connections Received */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Connection Requests Received</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedVisitor.connectionsReceived.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No connection requests received</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedVisitor.connectionsReceived.map((conn) => (
                        <div key={conn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">Request ID: {conn.id.slice(0, 8)}</p>
                              <p className="text-xs text-gray-500">
                                Received on {new Date(conn.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              conn.status === "ACCEPTED"
                                ? "default"
                                : conn.status === "PENDING"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {conn.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
