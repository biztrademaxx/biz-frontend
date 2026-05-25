"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { Star } from "lucide-react"
import { AddVenueReview } from "../AddVenueReview"
import VenueReviewCard from "../VenueReviewCard"
import type { VenueDetail, VenueReview } from "../../types/venue-detail.types"

type VenueReviewsTabProps = {
  venue: VenueDetail
  reviews: VenueReview[]
  reviewsLoading: boolean
  onReviewAdded: (review: VenueReview) => void
}

export function VenueReviewsTab({ venue, reviews, reviewsLoading, onReviewAdded }: VenueReviewsTabProps) {
  return (
    <TabsContent value="reviews" className="space-y-6">
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-3">
            <AddVenueReview venueId={venue.id} onReviewAdded={onReviewAdded} />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  All Reviews ({reviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {reviewsLoading ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
                    <p className="mt-2 text-gray-500">Loading reviews...</p>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="max-h-[600px] space-y-4 overflow-y-auto p-6 pt-0">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <VenueReviewCard
                          review={review}
                          venueName={venue.name || venue.venueName}
                          venueManagerName={venue.manager?.name}
                          venueManagerAvatar={venue.manager?.avatar}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <Star className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                    <h3 className="mb-2 text-lg font-semibold text-gray-700">No Reviews Yet</h3>
                    <p className="mx-auto max-w-md text-gray-500">
                      Be the first to share your experience with this venue! Your review will help others
                      make better decisions.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TabsContent>
  )
}
