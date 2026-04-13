"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddOrganizerReview } from "../../components/AddOrganizerReview"
import { ReviewCard } from "../../components/ReviewCard"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"
import { Loader2, MessageSquare } from "lucide-react"

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

interface FeedbackSectionProps {
  organizerId: string
}

export function FeedbackSection({ organizerId }: FeedbackSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchReviews()
  }, [organizerId])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<{ reviews?: any[]; data?: { reviews?: any[] }; organizer?: { averageRating?: number; totalReviews?: number }; stats?: any }>(
        `/api/organizers/${organizerId}/reviews`,
        { auth: false }
      )
      const list = data.reviews ?? data.data?.reviews ?? []
      setReviews(Array.isArray(list) ? list : [])
      const org = data.organizer
      setStats(data.stats ?? (org ? {
        averageRating: org.averageRating ?? 0,
        totalReviews: org.totalReviews ?? list.length,
        ratingDistribution: (Array.isArray(list) ? list : []).reduce((acc, r) => {
          const star = r.rating ?? 0
          acc[star] = (acc[star] ?? 0) + 1
          return acc
        }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>)
      } : {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      }))
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

  const handleReviewAdded = (newReview: Review) => {
    setReviews(prev => [newReview, ...prev])
    // Update stats optimistically
    setStats(prev => ({
      averageRating: ((prev.averageRating * prev.totalReviews) + newReview.rating) / (prev.totalReviews + 1),
      totalReviews: prev.totalReviews + 1,
      ratingDistribution: {
        ...prev.ratingDistribution,
        [newReview.rating]: prev.ratingDistribution[newReview.rating as keyof typeof prev.ratingDistribution] + 1
      }
    }))
  }

  const handleReplyAdded = (reviewId: string, newReply: ReviewReply) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, replies: [...review.replies, newReply] }
        : review
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading reviews...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="lg:col-span-2 space-y-6">
        <Tabs defaultValue="reviews" className="w-full">
          <TabsContent value="reviews" className="space-y-4">
            {reviews.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Reviews Yet
                  </h3>
                  <p className="text-gray-600">
                    This organizer hasn't received any reviews yet. Be the first to share your experience!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <ReviewCard 
                    key={review.id} 
                    review={review} 
                    organizerId={organizerId}
                    onReplyAdded={handleReplyAdded}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="add-review">
            <AddOrganizerReview
              organizerId={organizerId}
              onReviewAdded={handleReviewAdded}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}