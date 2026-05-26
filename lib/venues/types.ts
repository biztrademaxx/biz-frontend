/** Home “Explore venues” card (normalized). */
export interface ExploreVenueCard {
  id: string
  name: string
  imageUrl: string
  eventCount: number
  city: string
  country: string
  /** City + address + state for geo / city matching. */
  locationHay: string
  description: string
  averageRating: number
  totalReviews: number
}
