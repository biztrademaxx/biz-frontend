// components/super-admin/support-tickets.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Eye, Search, Filter, MessageSquare, Clock, CheckCircle, AlertCircle, Plus, Reply } from "lucide-react"

interface SupportTicket {
  id: string
  title: string
  description: string
  category: string
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
  userRole: string
  createdAt: string
  user: {
    firstName: string
    lastName: string
    email: string
    role: string
  }
  replies?: Array<{
    id: string
    content: string
    createdAt: string
    user: {
      firstName: string
      lastName: string
      email: string
    }
  }>
}

export default function SupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [filters, setFilters] = useState({
    status: "",
    userRole: "",
    search: ""
  })
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(filters.search.trim()), 400)
    return () => window.clearTimeout(id)
  }, [filters.search])

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.status && filters.status !== "all") params.append("status", filters.status)
      if (filters.userRole && filters.userRole !== "all") params.append("userRole", filters.userRole)
      if (debouncedSearch) params.append("search", debouncedSearch)

      const res = await apiFetch<{
        success?: boolean
        data?: SupportTicket[]
        pagination?: unknown
      }>(`/api/admin/support/tickets?${params.toString()}`, { auth: true })
      const rows = Array.isArray(res.data) ? res.data : []
      setTickets(rows)
    } catch (error) {
      console.error("Error fetching tickets:", error)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }, [filters.status, filters.userRole, debouncedSearch])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setIsViewDialogOpen(true)
  }

  const handleReply = async () => {
    if (!selectedTicket || !replyContent.trim()) return

    try {
      await apiFetch(`/api/admin/support/tickets/${selectedTicket.id}/replies`, {
        method: "POST",
        body: { content: replyContent },
        auth: true,
      })
      setReplyContent("")
      setIsReplyDialogOpen(false)
      fetchTickets()
    } catch (error) {
      console.error("Error sending reply:", error)
    }
  }

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      await apiFetch(`/api/admin/support/tickets/${ticketId}`, {
        method: "PUT",
        body: { status },
        auth: true,
      })
      fetchTickets()
    } catch (error) {
      console.error("Error updating ticket status:", error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'destructive'
      case 'HIGH': return 'destructive'
      case 'MEDIUM': return 'secondary'
      case 'LOW': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'IN_PROGRESS': return <Clock className="h-4 w-4 text-blue-500" />
      case 'RESOLVED': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <MessageSquare className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return <div className="flex justify-center py-8">Loading tickets...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Support Tickets</h2>
          <p className="text-muted-foreground">
            Manage and respond to user support requests
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search tickets..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.userRole}
                onValueChange={(value) => setFilters(prev => ({ ...prev, userRole: value }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="User Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="ORGANIZER">Organizer</SelectItem>
                  <SelectItem value="EXHIBITOR">Exhibitor</SelectItem>
                  <SelectItem value="SPEAKER">Speaker</SelectItem>
                  <SelectItem value="VENUE_MANAGER">Venue Manager</SelectItem>
                  <SelectItem value="ATTENDEE">Attendee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
          <CardDescription>
            {tickets.length} tickets found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Replies</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(tickets) ? tickets : []).map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ticket.status)}
                      <div>
                        <div className="font-medium">{ticket.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {ticket.category}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{ticket.user.firstName} {ticket.user.lastName}</div>
                      <div className="text-sm text-muted-foreground">
                        {ticket.user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ticket.userRole}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={ticket.status}
                      onValueChange={(value) => updateTicketStatus(ticket.id, value)}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{ticket.replies?.length ?? 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewTicket(ticket)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedTicket(ticket)
                          setIsReplyDialogOpen(true)
                        }}
                      >
                        <Reply className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Ticket Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.title}</DialogTitle>
            <DialogDescription>
              Ticket from {selectedTicket?.user.firstName} {selectedTicket?.user.lastName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <p className="text-sm">{selectedTicket.category}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge variant={getPriorityColor(selectedTicket.priority)}>
                    {selectedTicket.priority}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <p className="text-sm">{selectedTicket.status}</p>
                </div>
                <div>
                  <Label>User Role</Label>
                  <p className="text-sm">{selectedTicket.userRole}</p>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">
                  {selectedTicket.description}
                </p>
              </div>

              {(selectedTicket.replies?.length ?? 0) > 0 && (
                <div>
                  <Label>Conversation History</Label>
                  <div className="mt-2 space-y-3 max-h-60 overflow-y-auto">
                    {(selectedTicket.replies ?? []).map((reply) => (
                      <div key={reply.id} className="p-3 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">
                            {reply.user.firstName} {reply.user.lastName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(reply.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Ticket</DialogTitle>
            <DialogDescription>
              Send a response to {selectedTicket?.user.firstName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reply">Your Response</Label>
              <Textarea
                id="reply"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Type your response here..."
                rows={6}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleReply}>
                Send Response
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}