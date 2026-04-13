"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea" // ✅ shadcn/ui textarea

interface StarRatingCardProps {
  title?: string
  description?: string
  initialRating?: number
  maxRating?: number
  onRatingChange?: (rating: number) => void
  readOnly?: boolean
  className?: string
}

export default function StarRatingCard({
  title = "Rate this item",
  description = "Click on the stars to rate this item. Your feedback helps us improve our services.",
  initialRating = 0,
  maxRating = 5,
  onRatingChange,
  readOnly = false,
  className,
}: StarRatingCardProps) {
  const [rating, setRating] = useState(initialRating)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedback, setFeedback] = useState("") // ✅ description state
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStarClick = (starIndex: number) => {
    if (readOnly) return
    const newRating = starIndex + 1
    setRating(newRating)
    onRatingChange?.(newRating)
  }

  const handleStarHover = (starIndex: number) => {
    if (readOnly) return
    setHoverRating(starIndex + 1)
  }

  const handleMouseLeave = () => {
    if (readOnly) return
    setHoverRating(0)
  }

  const displayRating = hoverRating || rating

  const handleSubmit = async () => {
    if (rating === 0) return

    setIsSubmitting(true)
    try {
      // Example API call
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
body: JSON.stringify({
  rating,
  comment: feedback, // ✅ match backend schema
  userId: "some-user-id", // ✅ must send (backend requires it)
}),

      })

      if (!res.ok) {
        throw new Error("Failed to submit rating")
      }

      alert("Feedback submitted successfully ✅")
      setFeedback("") // reset after submit
    } catch (error) {
      console.error(error)
      alert("Something went wrong ❌")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader>
        <CardTitle className="text-center text-lg font-semibold text-gray-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center gap-1" onMouseLeave={handleMouseLeave}>
          {Array.from({ length: maxRating }, (_, index) => (
            <button
              key={index}
              type="button"
              className={cn(
                "transition-all duration-200 hover:scale-110",
                readOnly ? "cursor-default" : "cursor-pointer",
              )}
              onClick={() => handleStarClick(index)}
              onMouseEnter={() => handleStarHover(index)}
              disabled={readOnly}
            >
              <Star
                className={cn(
                  "w-8 h-8 transition-colors duration-200",
                  index < displayRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200 hover:fill-yellow-200 hover:text-yellow-200",
                )}
              />
            </button>
          ))}
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800 mb-2">
            {rating > 0 ? `${rating}/${maxRating}` : "Not rated"}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>

        {rating > 0 && (
          <div className="text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </span>
          </div>
        )}

        {/* ✅ Textarea for description */}
        <div>
          <Textarea
            placeholder="Write your feedback here..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={readOnly}
          />
        </div>

        {/* ✅ Submit button */}
        <div className="flex justify-center pt-4">
          <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
