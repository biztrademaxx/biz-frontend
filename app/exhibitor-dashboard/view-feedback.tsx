"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"

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
  replies: {
    id: string
    content: string
    createdAt: string
    isOrganizerReply: boolean
    user: {
      firstName: string
      lastName: string
    }
  }[]
}

export default function ViewFeedback({ exhibitorId }: { exhibitorId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [replying, setReplying] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  useEffect(() => {
    fetchReviews()
  }, [exhibitorId])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<{ reviews?: Review[] }>(
        `/api/exhibitors/${exhibitorId}/reviews`,
        { auth: false }
      )
      setReviews(Array.isArray(data?.reviews) ? data.reviews : [])
    } catch (err) {
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (reviewId: string) => {
    if (!replyContent.trim()) return
    try {
      await apiFetch(`/api/exhibitors/${exhibitorId}/reviews/${reviewId}/replies`, {
        method: "POST",
        body: { content: replyContent.trim() },
        auth: true,
      })
      setReplyContent("")
      setReplying(null)
      await fetchReviews()
    } catch (err) {
      // Reply endpoint may not exist on backend yet; refresh to clear form
      setReplyContent("")
      setReplying(null)
      await fetchReviews()
    }
  }


  if (loading) {
    return <p className="text-center text-gray-500">Loading feedback...</p>
  }

  const list = Array.isArray(reviews) ? reviews : []
  if (list.length === 0) {
    return <p className="text-center text-gray-500">No feedback yet.</p>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Customer Feedback</h2>

      {list.map((review) => (
        <Card key={review.id}>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={review.user.avatar || "/city/c4.jpg"} />
              <AvatarFallback>
                {review.user?.firstName?.[0] ?? ""}
                {review.user?.lastName?.[0] ?? ""}
              </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">
                  {[review.user?.firstName, review.user?.lastName].filter(Boolean).join(" ").trim() || "Anonymous"}
                </h3>
                <div className="flex items-center text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < review.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-2">{review.comment}</p>
            <p className="text-xs text-gray-400">
              {new Date(review.createdAt).toLocaleString()}
            </p>

            {/* Replies */}
            {(review.replies?.length ?? 0) > 0 && (
              <div className="mt-4 space-y-2">
                {(review.replies ?? []).map((rep) => (
                  <div key={rep.id} className="pl-4 border-l-2 border-gray-200">
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold">
                        {rep.isOrganizerReply ? "You" : ([rep.user?.firstName, rep.user?.lastName].filter(Boolean).join(" ").trim() || "Anonymous")}
                      </span>
                      : {rep.content}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(rep.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply form */}
            {replying === review.id ? (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleReply(review.id)}>
                    Send Reply
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplying(null)
                      setReplyContent("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={() => setReplying(review.id)}
              >
                Reply
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
