"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MessageCircle, Send, CheckCircle2, X } from "lucide-react"
import { format } from "date-fns"
import { apiFetch } from "@/lib/api"

interface ReviewReply {
  id: string
  content: string
  createdAt: string
  isOrganizerReply: boolean
  user: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
}

interface Review {
  id: string
  rating: number
  title: string
  comment: string
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
  replies?: ReviewReply[]
}

interface ReviewsProps {
  eventId: string
  isOrganizer?: boolean
}

export default function Reviews({ eventId, isOrganizer = false }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = async () => {
    try {
      setLoading(true)
      // Always include replies so organizer replies display for everyone
      const data = await apiFetch<{ reviews?: Review[] }>(`/api/events/${eventId}/reviews?includeReplies=true`, { auth: false })
      setReviews(data.reviews || [])
    } catch (err) {
      console.error("Error in fetchReviews:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch reviews")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [eventId])

  const handleReviewAdded = () => {
    fetchReviews()
  }

  const handleReplyAdded = (reviewId: string) => {
    // Refresh specific review's replies or all reviews
    fetchReviews()
  }

  if (loading) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6">
          <div className="text-center">Loading reviews...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6">
          <div className="text-center text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add Review Form - only show for non-organizers */}
      {!isOrganizer && (
        <AddReviewCard eventId={eventId} onReviewAdded={handleReviewAdded} />
      )}
      
      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              No reviews yet. Be the first to review this event!
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Reviews ({reviews.length})</h3>
          {reviews.map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              isOrganizer={isOrganizer}
              onReplyAdded={handleReplyAdded}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Review Card Component with Replies
function ReviewCard({ 
  review, 
  isOrganizer = false, 
  onReplyAdded 
}: { 
  review: Review
  isOrganizer?: boolean
  onReplyAdded: (reviewId: string) => void
}) {
  const hasReplies = review.replies && review.replies.length > 0
  const [showReplies, setShowReplies] = useState(!!hasReplies)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const prevRepliesCount = useRef(review.replies?.length ?? 0)
  useEffect(() => {
    const count = review.replies?.length ?? 0
    if (count > 0 && count !== prevRepliesCount.current) {
      setShowReplies(true)
      prevRepliesCount.current = count
    }
  }, [review.replies?.length])

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {review.user?.avatar ? (
              <img
                src={review.user?.avatar}
                alt={`${review.user.firstName} ${review.user.lastName}`}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {review.user.firstName[0]}{review.user.lastName[0]}
                </span>
              </div>
            )}
            <div>
              <h4 className="font-medium">
                {review.user.firstName} {review.user.lastName}
              </h4>
              <p className="text-sm text-gray-500">
                {format(new Date(review.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                className={
                  star <= review.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }
              />
            ))}
            <span className="ml-1 text-sm font-medium">{review.rating}</span>
          </div>
        </div>

        {review.title && (
          <h5 className="font-semibold text-lg mb-2">{review.title}</h5>
        )}
        
        <p className="text-gray-700 mb-4">{review.comment}</p>

        {/* Reply Actions - Show for everyone, but only organizers can add replies */}
        <div className="flex items-center gap-3 pt-3 border-t">
          {/* Always show replies button if there are replies */}
          {hasReplies && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-2"
            >
              <MessageCircle size={16} />
              {showReplies ? 'Hide' : 'Show'} Replies ({review.replies?.length})
            </Button>
          )}
          
          {/* Only show reply form for organizers */}
          {isOrganizer && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-2"
            >
              <Send size={16} />
              {showReplyForm ? 'Cancel' : 'Reply'}
            </Button>
          )}

          {/* Debug info - remove in production */}
          <span className="text-xs text-gray-400 ml-auto">
            Replies: {review.replies?.length || 0} | Organizer: {isOrganizer ? 'Yes' : 'No'}
          </span>
        </div>

        {/* Reply Form */}
        {showReplyForm && isOrganizer && (
          <ReplyForm
            reviewId={review.id}
            onReplySubmitted={(reviewId) => {
              setShowReplyForm(false)
              onReplyAdded(reviewId)
            }}
          />
        )}

        {/* Replies List - show when user expands replies */}
        {showReplies && hasReplies && (
          <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-lg">
            <h6 className="font-medium text-sm text-gray-700">Replies</h6>
            {review.replies?.map((reply) => (
              <ReplyCard key={reply.id} reply={reply} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Reply Card Component
function ReplyCard({ reply }: { reply: ReviewReply }) {
  return (
    <div className="bg-white p-3 rounded border-l-4 border-blue-200">
      <div className="flex items-start gap-3">
        {reply.user.avatar ? (
          <img
            src={reply.user?.avatar}
            alt={`${reply.user.firstName} ${reply.user.lastName}`}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-xs font-medium">
              {reply.user.firstName[0]}{reply.user.lastName[0]}
            </span>
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="font-medium text-sm">
              {reply.user.firstName} {reply.user.lastName}
            </h5>
            {reply.isOrganizerReply && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                Organizer
              </span>
            )}
            <span className="text-xs text-gray-500">
              {format(new Date(reply.createdAt), 'MMM dd, yyyy')}
            </span>
          </div>
          <p className="text-sm text-gray-700">{reply.content}</p>
        </div>
      </div>
    </div>
  )
}

// Reply Form Component
function ReplyForm({ 
  reviewId, 
  onReplySubmitted 
}: { 
  reviewId: string
  onReplySubmitted: (reviewId: string) => void 
}) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      await apiFetch(`/api/reviews/${reviewId}/replies`, {
        method: "POST",
        body: { content: content.trim() },
        auth: true,
      })
      setContent("")
      onReplySubmitted(reviewId)
    } catch (err: any) {
      alert(err?.message || "Failed to add reply")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-50 rounded-lg">
      <textarea
        placeholder="Write your reply as the organizer..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
        rows={3}
        required
      />
      <div className="flex gap-2 mt-3">
        <Button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          size="sm"
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {isSubmitting ? "Sending..." : "Send Reply"}
        </Button>
      </div>
    </form>
  )
}

// AddReviewCard Component (unchanged)
interface AddReviewCardProps {
  eventId: string
  onReviewAdded: () => void
}

function AddReviewCard({ eventId, onReviewAdded }: AddReviewCardProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState("")
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showThankYouPopup, setShowThankYouPopup] = useState(false)

  const closeThankYouPopup = () => {
    setShowThankYouPopup(false)
    onReviewAdded()
  }

  useEffect(() => {
    if (!showThankYouPopup) return
    const id = window.setTimeout(() => {
      closeThankYouPopup()
    }, 2200)
    return () => window.clearTimeout(id)
  }, [showThankYouPopup])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedback.trim() || rating === 0) return

    setIsSubmitting(true)
    try {
      await apiFetch(`/api/events/${eventId}/reviews`, {
        method: "POST",
        body: { rating, title, comment: feedback },
        auth: true,
      })
      setShowThankYouPopup(true)
      setRating(0)
      setTitle("")
      setFeedback("")
    } catch (err: any) {
      console.error(err)
      alert(err?.message || "⚠️ Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {showThankYouPopup ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="Thank you popup"
        >
          <div className="relative w-full max-w-sm animate-[fadeIn_220ms_ease-out] rounded-2xl bg-white p-6 text-center shadow-2xl">
            <button
              type="button"
              onClick={closeThankYouPopup}
              className="absolute right-3 top-3 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close popup"
            >
              <X size={18} />
            </button>
            <div className="mx-auto mb-4 flex h-14 w-14 animate-bounce items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h4 className="mb-2 text-xl font-bold text-gray-900">Thank you for your review!</h4>
            <p className="mb-5 text-sm text-gray-600">
              Your feedback helps other visitors discover better events.
            </p>
            <Button
              type="button"
              onClick={closeThankYouPopup}
              className="w-full rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Continue
            </Button>
          </div>
        </div>
      ) : null}

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Add Your Review</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star
                  size={28}
                  className={
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-500">
              {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : "Select rating"}
            </span>
          </div>

          <input
            type="text"
            placeholder="Review title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          <textarea
            placeholder="Write your review..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows={3}
            required
          />

            <Button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="w-48 rounded-none bg-red-600 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Add Review"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}