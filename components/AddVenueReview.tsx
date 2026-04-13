"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, CheckCircle } from "lucide-react"

interface AddVenueReviewProps {
  venueId: string
  onReviewAdded: (review: any) => void
}

export function AddVenueReview({ venueId, onReviewAdded }: AddVenueReviewProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || rating === 0) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/venues/${venueId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, title, comment }),
      })

      if (res.ok) {
        const newReview = await res.json()
        onReviewAdded(newReview)
        setShowSuccessMessage(true)
        setRating(0)
        setTitle("")
        setComment("")

        setTimeout(() => {
          setShowSuccessMessage(false)
        }, 3000)
      } else {
        const error = await res.json()
        alert(`❌ ${error.error || "Failed to add review"}`)
      }
    } catch (err) {
      console.error(err)
      alert("⚠️ Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Review Form */}
      <Card>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
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
              placeholder="Share your experience with this venue..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={4}
              required
            />

            <Button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="w-48 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Thank you for your review!</span>
          </div>
        </div>
      )}
    </div>
  )
}