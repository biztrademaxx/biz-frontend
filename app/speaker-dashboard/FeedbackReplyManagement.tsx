"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Star, Filter, Calendar, User, MessageSquare, Reply, Send, ChevronDown, ChevronUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { apiFetch, getCurrentUserId } from "@/lib/api"

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
  session: {
    id: string
    title: string
    event: {
      id: string
      title: string
    }
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
  isSpeakerReply: boolean
}

interface Session {
  id: string
  title: string
  event: {
    id: string
    title: string
  }
}

export default function FeedbackReplyManagement({ speakerId }: { speakerId?: string }) {
  const userId = getCurrentUserId()
  const [reviews, setReviews] = useState<Review[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [selectedSession, setSelectedSession] = useState<string>("all")
  const [selectedEvent, setSelectedEvent] = useState<string>("all")
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [replyFilter, setReplyFilter] = useState<string>("all")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState<string>("")
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Use speakerId prop or fall back to current user id
  const currentSpeakerId = speakerId || userId

  useEffect(() => {
    if (currentSpeakerId) {
      fetchSessions()
      fetchReviews()
    } else {
      setLoading(false)
    }
  }, [currentSpeakerId])

  const fetchSessions = async () => {
    if (!currentSpeakerId) return
    try {
      const data = await apiFetch<{ success?: boolean; sessions?: Session[] }>(
        `/api/speakers/${currentSpeakerId}/sessions`,
        { auth: true }
      )
      setSessions(Array.isArray(data?.sessions) ? data.sessions : [])
    } catch (error) {
      console.error("Error fetching sessions:", error)
      toast({
        title: "Error",
        description: "Failed to load sessions",
        variant: "destructive",
      })
    }
  }

  const fetchReviews = async () => {
    if (!currentSpeakerId) return
    
    try {
      setLoading(true)
      // Fetch reviews with replies for all speaker sessions
      const response = await fetch(`/api/speakers/${currentSpeakerId}/reviews?includeReplies=true`)
      if (!response.ok) throw new Error("Failed to fetch reviews")
      const data = await response.json()
      setReviews(data.reviews || [])
      setFilteredReviews(data.reviews || [])
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

    // Filter by session
    if (selectedSession !== "all") {
      filtered = filtered.filter(review => review.session.id === selectedSession)
    }

    // Filter by event
    if (selectedEvent !== "all") {
      filtered = filtered.filter(review => review.session.event.id === selectedEvent)
    }

    // Filter by rating
    if (ratingFilter !== "all") {
      const ratingValue = parseInt(ratingFilter)
      filtered = filtered.filter(review => review.rating === ratingValue)
    }

    // Filter by status
    if (statusFilter !== "all") {
      if (statusFilter === "approved") {
        filtered = filtered.filter(review => review.isApproved)
      } else if (statusFilter === "pending") {
        filtered = filtered.filter(review => !review.isApproved)
      }
    }

    // Filter by reply status
    if (replyFilter !== "all") {
      if (replyFilter === "replied") {
        filtered = filtered.filter(review => review.replies && review.replies.length > 0)
      } else if (replyFilter === "not_replied") {
        filtered = filtered.filter(review => !review.replies || review.replies.length === 0)
      }
    }

    setFilteredReviews(filtered)
  }, [selectedSession, selectedEvent, ratingFilter, statusFilter, replyFilter, reviews])

  // Get unique events from sessions
  const getUniqueEvents = () => {
    const eventsMap = new Map()
    sessions.forEach(session => {
      if (!eventsMap.has(session.event.id)) {
        eventsMap.set(session.event.id, session.event)
      }
    })
    return Array.from(eventsMap.values())
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
        user: { id: string; firstName: string; lastName: string; avatar: string | null }
      }>(`/api/reviews/${reviewId}/replies`, {
        method: "POST",
        body: { content: replyContent.trim() },
        auth: true,
      })

      // Update the review with the new reply locally
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review.id === reviewId
            ? {
                ...review,
                replies: [...(review.replies || []), newReply],
              }
            : review
        )
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

      // Remove the reply from the review locally
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review.id === reviewId
            ? {
                ...review,
                replies: review.replies.filter(reply => reply.id !== replyId),
              }
            : review
        )
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
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
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

  // Show loading or error state if no speaker ID
  if (!currentSpeakerId) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Speaker ID Available</h3>
              <p className="text-muted-foreground">
                Please ensure you're logged in as a speaker or provide a valid speaker ID.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Session Feedback</h2>
          <p className="text-muted-foreground">Respond to feedback on your sessions</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            <CardTitle>Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Event</label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="All Events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {getUniqueEvents().map(event => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Session</label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sessions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  {sessions.map(session => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            <div>
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
            </div>

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
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Reviews ({filteredReviews.length})</CardTitle>
            <Button variant="outline" onClick={fetchReviews}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
                  ? "No reviews have been submitted for your sessions yet."
                  : "No reviews match your current filters."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map(review => (
                <div key={review.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        {review.user.avatar ? (
                          <img
                            src={review.user.avatar}
                            alt={`${review.user.firstName} ${review.user.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">
                            {review.user.firstName} {review.user.lastName}
                          </h4>
                          <Badge
                            variant={review.isApproved ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {review.isApproved ? "Approved" : "Pending"}
                          </Badge>
                          {review.replies && review.replies.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {review.replies.length} {review.replies.length === 1 ? "Reply" : "Replies"}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1">{renderStars(review.rating)}</div>
                        {review.title && <p className="font-medium mt-2">{review.title}</p>}
                        <p className="text-muted-foreground mt-1">{review.comment}</p>
                        <div className="flex items-center mt-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(review.createdAt)}</span>
                          <span className="mx-2">•</span>
                          <span className="font-medium">{review.session.title}</span>
                          <span className="mx-2">•</span>
                          <span className="text-gray-500">{review.session.event.title}</span>
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
                              <div className="mt-2 space-y-3 pl-6 border-l-2 border-gray-200">
                                {review.replies.map(reply => (
                                  <div key={reply.id} className="pt-3">
                                    <div className="flex items-start space-x-3">
                                      <div className="flex-shrink-0">
                                        {reply.user.avatar ? (
                                          <img
                                            src={reply.user.avatar}
                                            alt={`${reply.user.firstName} ${reply.user.lastName}`}
                                            className="w-8 h-8 rounded-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            <User className="w-4 h-4 text-gray-500" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-2">
                                            <span className="font-medium">
                                              {reply.user.firstName} {reply.user.lastName}
                                            </span>
                                            {reply.isSpeakerReply && (
                                              <Badge variant="outline" className="text-xs">
                                                Speaker
                                              </Badge>
                                            )}
                                          </div>
                                          {reply.isSpeakerReply && (
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
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
                                          )}
                                        </div>
                                        <p className="text-sm mt-1">{reply.content}</p>
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
                              onChange={e => setReplyContent(e.target.value)}
                              className="mb-2"
                            />
                            <div className="flex space-x-2">
                              <Button onClick={() => handleSendReply(review.id)}>
                                <Send className="w-4 h-4 mr-2" />
                                Send Reply
                              </Button>
                              <Button
                                variant="outline"
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
                            className="mt-4"
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