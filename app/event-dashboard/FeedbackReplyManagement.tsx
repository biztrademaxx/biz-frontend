"use client"

import { AppImage } from "@/components/app-image"
import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Star, Filter, Calendar, User, MessageSquare, Reply, Send, ChevronDown, ChevronUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Review {
  id: string
  rating: number
  title: string
  comment: string
  isPublic: boolean
  isApproved: boolean
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    avatar: string | null
  }
  event: {
    id: string
    title: string
  }
  replies: ReviewReply[]
}

interface ReviewReply {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    avatar: string | null
  }
  isOrganizerReply: boolean
}

interface Event {
  id: string
  title: string
}

export default function FeedbackReplyManagement({ eventId }: { eventId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [replyFilter, setReplyFilter] = useState<string>("all")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState<string>("")
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState<{ id: string; title: string } | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchReviews()
  }, [eventId])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<{ reviews?: any[]; event?: any }>(`/api/events/${eventId}/reviews?includeReplies=true`, { auth: false })
      setReviews(data.reviews || [])
      setFilteredReviews(data.reviews || [])
      if (data.event) {
        setEvent(data.event)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = [...reviews]

    if (ratingFilter !== "all") {
      const ratingValue = Number.parseInt(ratingFilter)
      filtered = filtered.filter((review) => review.rating === ratingValue)
    }

    if (statusFilter !== "all") {
      if (statusFilter === "approved") {
        filtered = filtered.filter((review) => review.isApproved)
      } else if (statusFilter === "pending") {
        filtered = filtered.filter((review) => !review.isApproved)
      }
    }

    if (replyFilter !== "all") {
      if (replyFilter === "replied") {
        filtered = filtered.filter((review) => review.replies && review.replies.length > 0)
      } else if (replyFilter === "not_replied") {
        filtered = filtered.filter((review) => !review.replies || review.replies.length === 0)
      }
    }

    setFilteredReviews(filtered)
  }, [ratingFilter, statusFilter, replyFilter, reviews])

  const handleApproveReview = async (reviewId: string) => {
    try {
      await apiFetch(`/api/reviews/${reviewId}/approve`, {
        method: "PATCH",
        auth: true,
      })

      setReviews((prevReviews) =>
        prevReviews.map((review) => (review.id === reviewId ? { ...review, isApproved: true } : review)),
      )

      toast({
        title: "Success",
        description: "Review approved successfully",
      })
    } catch (error) {
      console.error("Error approving review:", error)
      toast({
        title: "Error",
        description: "Failed to approve review",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await apiFetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
        auth: true,
      })

      setReviews((prevReviews) => prevReviews.filter((review) => review.id !== reviewId))

      toast({
        title: "Success",
        description: "Review deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting review:", error)
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      })
    }
  }

  const handleSendReply = async (reviewId: string) => {
    if (!replyContent.trim()) {
      toast({
        title: "Error",
        description: "Reply cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      const newReply = await apiFetch<{
        id: string
        content: string
        isOrganizerReply: boolean
        createdAt: string
        user: { id: string; firstName: string; lastName: string; avatar?: string }
      }>(`/api/reviews/${reviewId}/replies`, {
        method: "POST",
        body: { content: replyContent.trim() },
        auth: true,
      })

      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                replies: [...(review.replies || []), newReply],
              }
            : review,
        ),
      )

      setReplyContent("")
      setReplyingTo(null)

      toast({
        title: "Success",
        description: "Reply sent successfully",
      })
    } catch (error) {
      console.error("Error sending reply:", error)
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReply = async (reviewId: string, replyId: string) => {
    try {
      await apiFetch(`/api/reviews/${reviewId}/replies/${replyId}`, {
        method: "DELETE",
        auth: true,
      })

      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                replies: review.replies.filter((reply) => reply.id !== replyId),
              }
            : review,
        ),
      )

      toast({
        title: "Success",
        description: "Reply deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting reply:", error)
      toast({
        title: "Error",
        description: "Failed to delete reply",
        variant: "destructive",
      })
    }
  }

  const toggleReplies = (reviewId: string) => {
    const newExpanded = new Set(expandedReplies)
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId)
    } else {
      newExpanded.add(reviewId)
    }
    setExpandedReplies(newExpanded)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}.0</span>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden sm:space-y-6">
      <div className="min-w-0">
        <h2 className="text-xl font-bold tracking-tight break-words sm:text-2xl md:text-3xl">
          {event ? `Feedback for ${event.title}` : "Feedback Replies"}
        </h2>
        <p className="text-sm text-muted-foreground sm:text-base">Respond to event feedback and manage replies</p>
      </div>

      {/* Filters */}
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="p-4 pb-3 sm:p-6">
          <div className="flex items-center">
            <Filter className="mr-2 h-5 w-5 shrink-0" />
            <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Ratings" />
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
            </div>

            {/* <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            <div>
              <label className="text-sm font-medium mb-2 block">Reply Status</label>
              <Select value={replyFilter} onValueChange={setReplyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Replies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reviews</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="not_replied">Not Replied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base sm:text-lg">Reviews ({filteredReviews.length})</CardTitle>
            <Button variant="outline" onClick={fetchReviews} className="w-full sm:w-auto">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="min-w-0 overflow-hidden p-4 pt-0 sm:p-6 sm:pt-0">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4 p-4 border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No reviews found</h3>
              <p className="text-muted-foreground">
                {reviews.length === 0
                  ? "No reviews have been submitted for your event yet."
                  : "No reviews match your current filters."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review.id} className="min-w-0 overflow-hidden rounded-lg border p-3 sm:p-4">
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 flex-1 items-start gap-3 sm:space-x-4">
                      <div className="shrink-0">
                        {review.user.avatar ? (
                          <AppImage
                            src={review.user.avatar}
                            alt={`${review.user.firstName} ${review.user.lastName}`}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="break-words font-semibold">
                            {review.user.firstName} {review.user.lastName}
                          </h4>
                          <Badge variant={review.isApproved ? "default" : "secondary"} className="text-xs">
                            {review.isApproved ? "Approved" : "Pending"}
                          </Badge>
                          {review.replies && review.replies.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {review.replies.length} {review.replies.length === 1 ? "Reply" : "Replies"}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1">{renderStars(review.rating)}</div>
                        {review.title && <p className="mt-2 break-words font-medium">{review.title}</p>}
                        <p className="mt-1 break-words text-muted-foreground">{review.comment}</p>
                        <div className="mt-2 flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-1 h-4 w-4 shrink-0" />
                          <span>{formatDate(review.createdAt)}</span>
                        </div>

                        {/* Replies Section */}
                        {review.replies && review.replies.length > 0 && (
                          <div className="mt-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center text-sm px-0"
                              onClick={() => toggleReplies(review.id)}
                            >
                              {expandedReplies.has(review.id) ? (
                                <ChevronUp className="w-4 h-4 mr-1" />
                              ) : (
                                <ChevronDown className="w-4 h-4 mr-1" />
                              )}
                              {review.replies.length} {review.replies.length === 1 ? "Reply" : "Replies"}
                            </Button>

                            {expandedReplies.has(review.id) && (
                              <div className="mt-2 min-w-0 space-y-3 border-l-2 border-gray-200 pl-3 sm:pl-6">
                                {review.replies.map((reply) => (
                                  <div key={reply.id} className="min-w-0 pt-2">
                                    <div className="flex min-w-0 items-start gap-3">
                                      <div className="shrink-0">
                                        {reply.user.avatar ? (
                                          <AppImage
                                            src={reply.user.avatar}
                                            alt={`${reply.user.firstName} ${reply.user.lastName}`}
                                            width={32}
                                            height={32}
                                            className="w-8 h-8 rounded-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            <User className="w-4 h-4 text-gray-500" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="min-w-0 flex-1 overflow-hidden">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                                            <span className="break-words font-medium">
                                              {reply.user.firstName} {reply.user.lastName}
                                            </span>
                                            {reply.isOrganizerReply && (
                                              <Badge variant="outline" className="text-xs">
                                                Organizer
                                              </Badge>
                                            )}
                                          </div>
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="sm" className="shrink-0 self-end sm:self-auto">
                                                •••
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                              <DropdownMenuItem
                                                onClick={() => handleDeleteReply(review.id, reply.id)}
                                                className="text-red-600"
                                              >
                                                Delete Reply
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                        <p className="mt-1 break-words text-sm">{reply.content}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {formatDateTime(reply.createdAt)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Reply Form */}
                        {replyingTo === review.id ? (
                          <div className="mt-4">
                            <Textarea
                              placeholder="Type your reply here..."
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              className="mb-2"
                            />
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <Button onClick={() => handleSendReply(review.id)} className="w-full sm:w-auto">
                                <Send className="mr-2 h-4 w-4" />
                                Send Reply
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full sm:w-auto"
                                onClick={() => {
                                  setReplyingTo(null)
                                  setReplyContent("")
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 w-full bg-transparent sm:w-auto"
                            onClick={() => setReplyingTo(review.id)}
                          >
                            <Reply className="w-4 h-4 mr-2" />
                            Reply
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
