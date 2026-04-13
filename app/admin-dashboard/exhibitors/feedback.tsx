"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Star, Eye, CheckCircle, XCircle, MessageSquare } from "lucide-react"
import { format } from "date-fns"

interface Feedback {
  id: string
  exhibitor: {
    id: string
    firstName: string
    lastName: string
    email: string
    company: string
  }
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  event: {
    id: string
    title: string
  } | null
  rating: number
  title: string | null
  comment: string | null
  isApproved: boolean
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export default function ExhibitorFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  useEffect(() => {
    filterFeedbacks()
  }, [feedbacks, searchQuery, ratingFilter, statusFilter])

  const fetchFeedbacks = async () => {
    try {
      const data = await apiFetch<Feedback[]>(
        "/api/admin/exhibitors/exhibitor-feedback",
        { auth: true }
      )
      setFeedbacks(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching feedbacks:", error)
      setFeedbacks([])
    } finally {
      setLoading(false)
    }
  }

  const filterFeedbacks = () => {
    let filtered = [...feedbacks]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (f) =>
          (f.exhibitor?.firstName ?? "").toLowerCase().includes(query) ||
          (f.exhibitor?.lastName ?? "").toLowerCase().includes(query) ||
          (f.exhibitor?.email ?? "").toLowerCase().includes(query) ||
          (f.exhibitor?.company ?? "").toLowerCase().includes(query) ||
          (f.user?.firstName ?? "").toLowerCase().includes(query) ||
          (f.user?.lastName ?? "").toLowerCase().includes(query) ||
          (f.title && f.title.toLowerCase().includes(query)) ||
          (f.comment && f.comment.toLowerCase().includes(query)),
      )
    }

    if (ratingFilter !== "all") {
      filtered = filtered.filter((f) => f.rating.toString() === ratingFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((f) => {
        if (statusFilter === "approved") return f.isApproved
        if (statusFilter === "pending") return !f.isApproved
        return true
      })
    }

    setFilteredFeedbacks(filtered)
  }

  const handleApprove = async (id: string) => {
    try {
      await apiFetch(`/api/admin/exhibitors/exhibitor-feedback/${id}`, {
        method: "PATCH",
        auth: true,
        body: { action: "approved", isApproved: true },
      })
      fetchFeedbacks()
    } catch (error) {
      console.error("Error approving feedback:", error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      await apiFetch(`/api/admin/exhibitors/exhibitor-feedback/${id}`, {
        method: "PATCH",
        auth: true,
        body: { action: "rejected", isApproved: false, isPublic: false },
      })
      fetchFeedbacks()
    } catch (error) {
      console.error("Error rejecting feedback:", error)
    }
  }

  const stats = {
    total: feedbacks.length,
    approved: feedbacks.filter((f) => f.isApproved).length,
    pending: feedbacks.filter((f) => !f.isApproved).length,
    averageRating: feedbacks.length
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : "0.0",
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading feedbacks...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Exhibitor Feedback</h1>
          <p className="text-gray-500">Manage and review exhibitor feedback from visitors</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <XCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.averageRating}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Feedback</CardTitle>
          <CardDescription>Search and filter exhibitor feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by exhibitor, visitor, or feedback content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback List</CardTitle>
          <CardDescription>
            Showing {filteredFeedbacks.length} of {feedbacks.length} feedback entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exhibitor</TableHead>
                <TableHead>Visitor</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedbacks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No feedback found
                  </TableCell>
                </TableRow>
              ) : (
                filteredFeedbacks.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {feedback.exhibitor.firstName} {feedback.exhibitor.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{feedback.exhibitor.company}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {feedback.user.firstName} {feedback.user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{feedback.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {feedback.event ? (
                        <div className="text-sm">{feedback.event.title}</div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {feedback.title || <span className="text-gray-400">No title</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={feedback.isApproved ? "default" : "secondary"}>
                        {feedback.isApproved ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{format(new Date(feedback.createdAt), "MMM dd, yyyy")}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedFeedback(feedback)
                            setDetailsOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!feedback.isApproved && (
                          <>
                            <Button size="sm" variant="default" onClick={() => handleApprove(feedback.id)}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(feedback.id)}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>Complete information about this feedback</DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Exhibitor Information</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-gray-500">Name:</span> {selectedFeedback.exhibitor.firstName}{" "}
                      {selectedFeedback.exhibitor.lastName}
                    </p>
                    <p>
                      <span className="text-gray-500">Company:</span> {selectedFeedback.exhibitor.company}
                    </p>
                    <p>
                      <span className="text-gray-500">Email:</span> {selectedFeedback.exhibitor.email}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Visitor Information</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-gray-500">Name:</span> {selectedFeedback.user.firstName}{" "}
                      {selectedFeedback.user.lastName}
                    </p>
                    <p>
                      <span className="text-gray-500">Email:</span> {selectedFeedback.user.email}
                    </p>
                  </div>
                </div>
              </div>

              {selectedFeedback.event && (
                <div>
                  <h3 className="font-semibold mb-2">Event</h3>
                  <p className="text-sm">{selectedFeedback.event.title}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Rating</h3>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < selectedFeedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">({selectedFeedback.rating}/5)</span>
                </div>
              </div>

              {selectedFeedback.title && (
                <div>
                  <h3 className="font-semibold mb-2">Title</h3>
                  <p className="text-sm">{selectedFeedback.title}</p>
                </div>
              )}

              {selectedFeedback.comment && (
                <div>
                  <h3 className="font-semibold mb-2">Comment</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedFeedback.comment}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  <Badge variant={selectedFeedback.isApproved ? "default" : "secondary"}>
                    {selectedFeedback.isApproved ? "Approved" : "Pending Review"}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Visibility</h3>
                  <Badge variant={selectedFeedback.isPublic ? "default" : "secondary"}>
                    {selectedFeedback.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <p>Created: {format(new Date(selectedFeedback.createdAt), "PPpp")}</p>
                <p>Updated: {format(new Date(selectedFeedback.updatedAt), "PPpp")}</p>
              </div>

              {!selectedFeedback.isApproved && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleApprove(selectedFeedback.id)
                      setDetailsOpen(false)
                    }}
                  >
                    Approve Feedback
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => {
                      handleReject(selectedFeedback.id)
                      setDetailsOpen(false)
                    }}
                  >
                    Reject Feedback
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
