"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

interface ReviewReply {
  id: string
  content: string
  createdAt: string
  isOrganizerReply?: boolean
  user?: { id: string; firstName: string; lastName: string; avatar?: string | null } | null
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

interface VenueReviewCardProps {
  review: Review
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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.user?.avatar || "/city/c4.jpg"} alt={review.user?.firstName ?? ""} />
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
              className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
            />
          ))}
        </div>
      </div>

      {review.title && <p className="font-semibold text-gray-900">{review.title}</p>}
      <p className="text-gray-700 leading-relaxed">{review.comment}</p>

      {/* Venue replies - show venue profile (name, manager avatar/name) */}
      {review.replies && review.replies.length > 0 && (
        <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-3">
          {review.replies.map((reply) => (
            <div key={reply.id} className="text-sm">
              {reply.isOrganizerReply ? (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage
                      src={
                        reply.user?.avatar ??
                        venueManagerAvatar ??
                        "/city/c4.jpg"
                      }
                      alt={venueManagerName ?? reply.user?.firstName ?? "Venue"}
                    />
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                      {(venueName ?? reply.user?.firstName ?? "V")[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-600 font-medium">
                      <span className="text-blue-600">
                        {venueName ? `${venueName} (Venue)` : "Venue response"}
                      </span>
                      {venueManagerName && (
                        <span className="text-gray-500 font-normal">
                          {" "}
                          · {venueManagerName}
                        </span>
                      )}
                      <span className="text-gray-400 font-normal ml-2">
                        {formatDate(reply.createdAt)}
                      </span>
                    </p>
                    <p className="text-gray-700 mt-0.5">{reply.content}</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 font-medium">
                    {`${reply.user?.firstName ?? ""} ${reply.user?.lastName ?? ""}`.trim() || "Reply"}
                    <span className="text-gray-400 font-normal ml-2">
                      {formatDate(reply.createdAt)}
                    </span>
                  </p>
                  <p className="text-gray-700 mt-0.5">{reply.content}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
