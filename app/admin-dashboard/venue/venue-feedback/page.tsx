"use client"

import { useState, useEffect } from "react"
import { adminApi } from "@/lib/admin-api"
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

interface VenueFeedback {
  id: string
  venueId: string
  venueName: string
  venueEmail: string
  venueAddress: string | null
  avatar: string | null
  userName: string
  userEmail: string
  eventName: string | null
  rating: number
  title: string | null
  comment: string | null
  isApproved: boolean
  createdAt: string
}

interface Stats {
  totalFeedback: number
  pendingReviews: number
  approvedFeedback: number
  averageRating: number
}

export default function VenueFeedbackPage() {
  const [feedback, setFeedback] = useState<VenueFeedback[]>([])
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

  const [selectedFeedback, setSelectedFeedback] = useState<VenueFeedback | null>(null)
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
      const data = await adminApi<{ feedback: VenueFeedback[]; stats: Stats }>("/venue/venue-feedback")
      setFeedback(data?.feedback ?? [])
      setStats(data?.stats ?? { totalFeedback: 0, pendingReviews: 0, approvedFeedback: 0, averageRating: 0 })
    } catch (error) {
      console.error("Error fetching venue feedback:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedFeedback) return

    try {
      setActionLoading(true)
      await adminApi(`/venue/venue-feedback/${selectedFeedback.id}`, {
        method: "PATCH",
        body: { action: "approve" },
      })
      await fetchFeedback()
      setIsApproveOpen(false)
      setSelectedFeedback(null)
    } catch (error) {
      console.error("Error approving venue feedback:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedFeedback) return

    try {
      setActionLoading(true)
      await adminApi(`/venue/venue-feedback/${selectedFeedback.id}`, {
        method: "PATCH",
        body: { action: "reject", reason: rejectionReason },
      })
      await fetchFeedback()
      setIsRejectOpen(false)
      setSelectedFeedback(null)
      setRejectionReason("")
    } catch (error) {
      console.error("Error rejecting venue feedback:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const filteredFeedback = feedback.filter((item) => {
    const matchesSearch =
      item.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.venueEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.venueAddress && item.venueAddress.toLowerCase().includes(searchQuery.toLowerCase()))

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
          <p className="text-gray-600">Loading venue feedback...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Venue Feedback</h1>
        <p className="text-gray-600 mt-1">Manage and review feedback for venues</p>
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
            <p className="text-xs text-gray-600 mt-1">All venue reviews</p>
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
                  placeholder="Search by venue name, email, address, or reviewer..."
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
                <TableHead>Venue</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Event</TableHead>
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
                    No venue feedback found
                  </TableCell>
                </TableRow>
              ) : (
                filteredFeedback.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                          {item.venueName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{item.venueName}</div>
                          <div className="text-sm text-gray-500">{item.venueEmail}</div>
                          {item.venueAddress && (
                            <div className="text-xs text-gray-400 truncate max-w-xs">{item.venueAddress}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.userName}</div>
                        <div className="text-sm text-gray-500">{item.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.eventName && <div className="font-medium text-sm">{item.eventName}</div>}
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
                              className="text-green-600 hover:text-green-700 bg-transparent"
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
                              className="text-red-600 hover:text-red-700 bg-transparent"
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Venue Feedback Details</DialogTitle>
            <DialogDescription>Complete venue feedback information</DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Venue Information</h3>
                  <p className="text-sm">
                    <span className="text-gray-600">Name:</span> {selectedFeedback.venueName}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600">Email:</span> {selectedFeedback.venueEmail}
                  </p>
                  {selectedFeedback.venueAddress && (
                    <p className="text-sm">
                      <span className="text-gray-600">Address:</span> {selectedFeedback.venueAddress}
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Reviewer Information</h3>
                  <p className="text-sm">
                    <span className="text-gray-600">Name:</span> {selectedFeedback.userName}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600">Email:</span> {selectedFeedback.userEmail}
                  </p>
                </div>
              </div>

              {selectedFeedback.eventName && (
                <div>
                  <h3 className="font-semibold mb-2">Event</h3>
                  <p className="text-sm">{selectedFeedback.eventName}</p>
                </div>
              )}

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
            <DialogTitle>Approve Venue Feedback</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this venue feedback? It will become visible to users.
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
            <DialogTitle>Reject Venue Feedback</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this venue feedback.</DialogDescription>
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