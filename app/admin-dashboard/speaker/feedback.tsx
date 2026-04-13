"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { Search, Star, Eye, Check, X, Filter, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface Feedback {
  id: string
  rating: number
  title: string | null
  comment: string | null
  isApproved: boolean
  isPublic: boolean
  createdAt: string
  updatedAt: string
  speaker: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar: string | null
    name?: string
  }
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar: string | null
    name?: string
  }
  event: {
    id: string
    title: string
    thumbnailImage: string | null
  }
  sessionTitle: string
}

interface Stats {
  totalFeedback: number
  pendingReviews: number
  approvedFeedback: number
  averageRating: number
}

export default function SpeakerFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [stats, setStats] = useState<Stats>({
    totalFeedback: 0,
    pendingReviews: 0,
    approvedFeedback: 0,
    averageRating: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    fetchFeedback()
  }, [])

  const fetchFeedback = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<{ feedback: Feedback[]; stats: Stats }>(
        "/api/admin/speaker/speaker-feedback",
        { auth: true }
      )
      setFeedback(data?.feedback ?? [])
      setStats(data?.stats ?? {
        totalFeedback: 0,
        pendingReviews: 0,
        approvedFeedback: 0,
        averageRating: 0,
      })
    } catch (error) {
      console.error("Error fetching feedback:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedFeedback) return
    try {
      setActionLoading(true)
      await apiFetch(`/api/admin/speaker/speaker-feedback/${selectedFeedback.id}`, {
        method: "PATCH",
        body: { isApproved: true },
        auth: true,
      })
      await fetchFeedback()
      setIsApproveOpen(false)
      setSelectedFeedback(null)
    } catch (error) {
      console.error("Error approving feedback:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedFeedback) return
    try {
      setActionLoading(true)
      await apiFetch(`/api/admin/speaker/speaker-feedback/${selectedFeedback.id}`, {
        method: "PATCH",
        body: { isApproved: false, isPublic: false },
        auth: true,
      })
      await fetchFeedback()
      setIsRejectOpen(false)
      setSelectedFeedback(null)
      setRejectionReason("")
    } catch (error) {
      console.error("Error rejecting feedback:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const filteredFeedback = feedback.filter((item) => {
    const speakerName = `${item.speaker?.firstName ?? ""} ${item.speaker?.lastName ?? ""}`.trim().toLowerCase()
    const userName = `${item.user?.firstName ?? ""} ${item.user?.lastName ?? ""}`.trim().toLowerCase()
    const speakerEmail = item.speaker?.email?.toLowerCase() || ""
    const searchLower = searchQuery.toLowerCase()

    const matchesSearch =
      speakerName.includes(searchLower) ||
      userName.includes(searchLower) ||
      speakerEmail.includes(searchLower)

    const matchesRating = ratingFilter === "all" || item.rating === Number.parseInt(ratingFilter)

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && !item.isApproved) ||
      (statusFilter === "approved" && item.isApproved)

    return matchesSearch && matchesRating && matchesStatus
  })

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading feedback...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Speaker Feedback</h1>
        <p className="text-gray-600 mt-1">Manage and review feedback for speakers</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFeedback}</div>
            <p className="text-xs text-gray-600 mt-1">All speaker reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Filter className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingReviews}</div>
            <p className="text-xs text-gray-600 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approvedFeedback}</div>
            <p className="text-xs text-gray-600 mt-1">Live reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-gray-600 mt-1">Out of 5 stars</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by speaker name, email, or reviewer..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Speaker</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Event/Session</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedback.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No feedback found
                  </TableCell>
                </TableRow>
              ) : (
                filteredFeedback.map((item) => {
                  const speakerName = `${item.speaker.firstName} ${item.speaker.lastName}`
                  const userName = `${item.user.firstName} ${item.user.lastName}`
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.speaker.avatar ? (
                            <img
                              src={item.speaker.avatar}
                              alt={speakerName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                              {item.speaker.firstName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{speakerName}</div>
                            <div className="text-sm text-gray-500">{item.speaker.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{userName}</div>
                          <div className="text-sm text-gray-500">{item.user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{item.event.title}</div>
                          <div className="text-xs text-gray-500">{item.sessionTitle}</div>
                        </div>
                      </TableCell>
                      <TableCell>{renderStars(item.rating)}</TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {item.title && <div className="font-medium text-sm">{item.title}</div>}
                          {item.comment && <div className="text-sm text-gray-600 line-clamp-2">{item.comment}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.isApproved ? "default" : "secondary"}
                          className={item.isApproved ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
                        >
                          {item.isApproved ? "Approved" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedFeedback(item)
                              setIsDetailsOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!item.isApproved && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => {
                                  setSelectedFeedback(item)
                                  setIsApproveOpen(true)
                                }}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setSelectedFeedback(item)
                                  setIsRejectOpen(true)
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>Complete feedback information</DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Speaker Information</h3>
                  <p className="text-sm">
                    <span className="text-gray-600">Name:</span> {selectedFeedback.speaker.firstName} {selectedFeedback.speaker.lastName}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600">Email:</span> {selectedFeedback.speaker.email}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Reviewer Information</h3>
                  <p className="text-sm">
                    <span className="text-gray-600">Name:</span> {selectedFeedback.user.firstName} {selectedFeedback.user.lastName}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600">Email:</span> {selectedFeedback.user.email}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Event</h3>
                <p className="text-sm">{selectedFeedback.event.title}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Session</h3>
                <p className="text-sm">{selectedFeedback.sessionTitle}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Rating</h3>
                {renderStars(selectedFeedback.rating)}
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
                  <p className="text-sm text-gray-700">{selectedFeedback.comment}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Status</h3>
                <Badge
                  variant={selectedFeedback.isApproved ? "default" : "secondary"}
                  className={
                    selectedFeedback.isApproved ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                  }
                >
                  {selectedFeedback.isApproved ? "Approved" : "Pending"}
                </Badge>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Submitted</h3>
                <p className="text-sm">{new Date(selectedFeedback.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Feedback</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this feedback? It will become visible to users.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={actionLoading}>
              {actionLoading ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Feedback</DialogTitle>
            <DialogDescription>Are you sure you want to reject this feedback?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Rejection reason (optional)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectOpen(false)
                setRejectionReason("")
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={actionLoading}>
              {actionLoading ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}