"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { isAuthenticated, apiFetch } from "@/lib/api"
import { Star, Loader2 } from "lucide-react"

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
  title?: string
  comment: string
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
  event?: {
    id: string
    title: string
  }
  replies: ReviewReply[]
}

interface AddOrganizerReviewProps {
  organizerId: string
  onReviewAdded: (review: Review) => void
}

export function AddOrganizerReview({ organizerId, onReviewAdded }: AddOrganizerReviewProps) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a review.",
        variant: "destructive",
      })
      return
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      })
      return
    }

    if (!comment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please write a comment for your review.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const reviewData = await apiFetch<Review>(`/api/organizers/${organizerId}/reviews`, {
        method: "POST",
        body: {
          rating,
          title: title.trim() || null,
          comment: comment.trim(),
        },
        auth: true,
      })

      if (!reviewData || typeof reviewData.rating !== "number" || !reviewData.user) {
        console.error("[v0] Invalid review data received:", reviewData)
        throw new Error("Invalid review data received from server")
      }

      // Ensure the review data includes an empty replies array
      const completeReviewData: Review = {
        ...reviewData,
        replies: [] // Add empty replies array to match the interface
      }

      // Call the callback with the validated review data
      onReviewAdded(completeReviewData)

      // Reset form
      setRating(0)
      setTitle("")
      setComment("")

      toast({
        title: "Success",
        description: "Your review has been submitted!",
      })
    } catch (error) {
      console.error("[v0] Error submitting review:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit review",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Experience with this Organizer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Overall Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          {/* Title Section */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title (Optional)</Label>
            <Input
              id="title"
              placeholder="Summarize your experience with this organizer..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">{title.length}/100</p>
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this organizer's events, communication, and overall service..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={5}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">{comment.length}/1000</p>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting || rating === 0 || !comment.trim()} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}