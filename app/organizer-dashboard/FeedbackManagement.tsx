"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Star, Filter, Calendar, User, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

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
}

interface Event {
  id: string
  title: string
}

export default function FeedbackManagement({ organizerId }: { organizerId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>("all")
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchEvents()
    fetchReviews()
  }, [organizerId])

  const fetchEvents = async () => {
    try {
      const data = await apiFetch<{ events?: Event[] }>(
        `/api/organizers/${organizerId}/events?page=1&limit=100`,
        { auth: true },
      )
      setEvents(data.events || [])
    } catch (error) {
      console.error("Error fetching events:", error)
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      })
    }
  }

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<{ reviews?: any[]; data?: { reviews?: any[] } }>(
        `/api/organizers/${organizerId}/reviews?includeReplies=true`,
        { auth: false }
      )
      const list = data.reviews ?? data.data?.reviews ?? []
      setReviews(Array.isArray(list) ? list : [])
      setFilteredReviews(Array.isArray(list) ? list : [])
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

    // Filter by event
    if (selectedEvent !== "all") {
      filtered = filtered.filter(review => review.event?.id === selectedEvent)
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

    setFilteredReviews(filtered)
  }, [selectedEvent, ratingFilter, statusFilter, reviews])

  const handleApproveReview = async (reviewId: string) => {
    try {
      await apiFetch(`/api/reviews/${reviewId}/approve`, {
        method: "PATCH",
        auth: true,
      })

      // Update the review status locally
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review.id === reviewId ? { ...review, isApproved: true } : review
        )
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

      // Remove the review from the list
      setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId))

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Feedback & Reviews</h2>
          <p className="text-muted-foreground">Manage and respond to event feedback</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Event</label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="All Events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {events.map(event => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
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
                  ? "No reviews have been submitted for your events yet."
                  : "No reviews match your current filters."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map(review => (
                <div key={review.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4">
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
                        </div>
                        <div className="mt-1">{renderStars(review.rating)}</div>
                        {review.title && <p className="font-medium mt-2">{review.title}</p>}
                        <p className="text-muted-foreground mt-1">{review.comment}</p>
                        <div className="flex items-center mt-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(review.createdAt)}</span>
                          <span className="mx-2">•</span>
                          <span className="font-medium">{review.event.title}</span>
                        </div>
                      </div>
                    </div>
                    {!review.isApproved && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveReview(review.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
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