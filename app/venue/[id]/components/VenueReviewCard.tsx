"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import type { VenueReview } from "../types/venue-detail.types"

type VenueReviewCardProps = {
  review: VenueReview
  venueName?: string
  venueManagerName?: string
  venueManagerAvatar?: string
}

export default function VenueReviewCard({
  review,
  venueName,
  venueManagerName,
  venueManagerAvatar,
}: VenueReviewCardProps) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.user?.avatar} alt={review.user?.firstName ?? ""} />
            <AvatarFallback>
              {review.user?.firstName?.[0] ?? "?"}
              {review.user?.lastName?.[0] ?? ""}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900">
              {review.user?.firstName ?? ""} {review.user?.lastName ?? ""}
            </p>
            <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < review.rating ? "fill-current text-yellow-400" : "text-gray-300"}`}
            />
          ))}
        </div>
      </div>

      {review.title ? <p className="font-semibold text-gray-900">{review.title}</p> : null}
      <p className="leading-relaxed text-gray-700">{review.comment}</p>

      {review.replies && review.replies.length > 0 ? (
        <div className="mt-4 space-y-3 border-l-2 border-gray-200 pl-4">
          {review.replies.map((reply) => (
            <div key={reply.id} className="text-sm">
              {reply.isOrganizerReply ? (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage
                      src={reply.user?.avatar ?? venueManagerAvatar ?? ""}
                      alt={venueManagerName ?? reply.user?.firstName ?? "Venue"}
                    />
                    <AvatarFallback className="bg-blue-100 text-xs text-blue-700">
                      {(venueName ?? reply.user?.firstName ?? "V")[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-600">
                      <span className="text-blue-600">
                        {venueName ? `${venueName} (Venue)` : "Venue response"}
                      </span>
                      {venueManagerName ? (
                        <span className="font-normal text-gray-500"> · {venueManagerName}</span>
                      ) : null}
                      <span className="ml-2 font-normal text-gray-400">{formatDate(reply.createdAt)}</span>
                    </p>
                    <p className="mt-0.5 text-gray-700">{reply.content}</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-medium text-gray-600">
                    {`${reply.user?.firstName ?? ""} ${reply.user?.lastName ?? ""}`.trim() || "Reply"}
                    <span className="ml-2 font-normal text-gray-400">{formatDate(reply.createdAt)}</span>
                  </p>
                  <p className="mt-0.5 text-gray-700">{reply.content}</p>
                </>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
