"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Eye, CheckCircle, XCircle, Star, MessageSquare, TrendingUp, AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Feedback {
  id: string
  organizer: {
    id: string
    name: string
    email: string
  }
  exhibitor: {
    id: string
    name: string
    email: string
  }
  event: {
    id: string | null
    title: string | null
  }
  rating: number
  title: string | null
  comment: string | null
  isApproved: boolean
  isPublic: boolean
  createdAt: string
}

export default function OrganizerFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [actionOpen, setActionOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject">("approve")
  const [actionReason, setActionReason] = useState("")

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const fetchFeedbacks = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<Feedback[] | { data?: Feedback[] }>(
        "/api/admin/exhibitors/exhibitor-feedback",
        { auth: true },
      )
      const list = Array.isArray(data) ? data : data?.data ?? []
      setFeedbacks(list)
    } catch (error) {
      console.error("Error fetching feedbacks:", error)
      setFeedbacks([])
    } finally {
      setLoading(false)
    }
  }

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      (feedback.organizer?.name ?? "").toLowerCase().includes(q) ||
      (feedback.organizer?.email ?? "").toLowerCase().includes(q) ||
      (feedback.exhibitor?.name ?? "").toLowerCase().includes(q) ||
      (feedback.event?.title ?? "").toLowerCase().includes(q)

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "approved" && feedback.isApproved) ||
      (statusFilter === "pending" && !feedback.isApproved)

    const matchesRating =
      ratingFilter === "all" ||
      (ratingFilter === "5" && feedback.rating === 5) ||
      (ratingFilter === "4" && feedback.rating === 4) ||
      (ratingFilter === "3" && feedback.rating === 3) ||
      (ratingFilter === "1-2" && feedback.rating <= 2)

    return matchesSearch && matchesStatus && matchesRating
  })

  const stats = {
    total: feedbacks.length,
    pending: feedbacks.filter((f) => !f.isApproved).length,
    approved: feedbacks.filter((f) => f.isApproved).length,
    averageRating:
      feedbacks.length > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : "0.0",
  }

  const handleViewDetails = (feedback: Feedback) => {
    setSelectedFeedback(feedback)
    setDetailsOpen(true)
  }

  const handleAction = (feedback: Feedback, action: "approve" | "reject") => {
    setSelectedFeedback(feedback)
    setActionType(action)
    setActionReason("")
    setActionOpen(true)
  }

  const handleConfirmAction = async () => {
    if (!selectedFeedback) return

    try {
      await apiFetch(`/api/admin/exhibitors/exhibitor-feedback/${selectedFeedback.id}`, {
        method: "PATCH",
        auth: true,
        body: { action: actionType, reason: actionReason },
      })
      await fetchFeedbacks()
      setActionOpen(false)
      setSelectedFeedback(null)
    } catch (error) {
      console.error("Error updating feedback:", error)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feedbacks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Organizer Feedback</h1>
        <p className="text-gray-600 mt-1">Manage and review organizer feedback and ratings</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Feedback</CardTitle>
            <MessageSquare className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
            <AlertCircle className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.averageRating} / 5.0</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by organizer, event, or reviewer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="1-2">1-2 Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organizer</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Exhibitor</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
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
                        <div className="font-medium text-gray-900">{feedback.organizer?.name}</div>
                        <div className="text-sm text-gray-500">{feedback.organizer?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {feedback.event.title && feedback.event.title !== "Unknown Event" ? (
                        <div className="text-sm text-gray-900">{feedback.event.title}</div>
                      ) : (
                        <span className="text-gray-400">General</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm text-gray-900">{feedback.exhibitor?.name}</div>
                        <div className="text-xs text-gray-500">{feedback.exhibitor?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{renderStars(feedback.rating)}</TableCell>
                    <TableCell>
                      {feedback.title ? (
                        <div className="max-w-[200px] truncate text-sm">{feedback.title}</div>
                      ) : (
                        <span className="text-gray-400">No title</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {feedback.isApproved ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approved</Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(feedback)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!feedback.isApproved && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleAction(feedback, "approve")}>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleAction(feedback, "reject")}>
                              <XCircle className="w-4 h-4 text-red-600" />
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
            <DialogDescription>Complete feedback information</DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Organizer</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedFeedback.organizer?.name}</p>
                  <p className="text-xs text-gray-500">{selectedFeedback.organizer?.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Event</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedFeedback.event.title || "General Feedback"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Exhibitor</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedFeedback.exhibitor?.name}</p>
                  <p className="text-xs text-gray-500">{selectedFeedback.exhibitor?.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Rating</Label>
                  <div className="mt-1">{renderStars(selectedFeedback.rating)}</div>
                  <p className="text-sm text-gray-900 mt-1">{selectedFeedback.rating} out of 5 stars</p>
                </div>
              </div>

              {selectedFeedback.title && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Title</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedFeedback.title}</p>
                </div>
              )}

              {selectedFeedback.comment && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Comment</Label>
                  <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{selectedFeedback.comment}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div className="mt-1">
                    {selectedFeedback.isApproved ? (
                      <Badge className="bg-green-100 text-green-700">Approved</Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-700">Pending</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Visibility</Label>
                  <div className="mt-1">
                    {selectedFeedback.isPublic ? (
                      <Badge className="bg-blue-100 text-blue-700">Public</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-700">Private</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Submitted On</Label>
                  <p className="text-sm text-gray-900 mt-1">{new Date(selectedFeedback.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={actionOpen} onOpenChange={setActionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "approve" ? "Approve Feedback" : "Reject Feedback"}</DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "This feedback will be visible to users."
                : "Please provide a reason for rejection."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {actionType === "reject" && (
              <div>
                <Label htmlFor="reason">Rejection Reason</Label>
                <Textarea
                  id="reason"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="mt-1"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              className={actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
