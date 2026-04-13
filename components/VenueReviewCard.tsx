"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { format } from "date-fns"

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
}

interface VenueReviewCardProps {
  review: Review
}

export function VenueReviewCard({ review }: VenueReviewCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {review.user?.avatar ? (
              <img
                src={review.user.avatar}
                alt={`${review.user.firstName} ${review.user.lastName}`}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {review.user.firstName?.[0]}{review.user.lastName?.[0]}
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

        <p className="text-gray-700">{review.comment}</p>
      </CardContent>
    </Card>
  )
}