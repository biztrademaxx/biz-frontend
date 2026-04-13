export interface FeaturedEventVenue {
  venueName: string | null
  venueAddress: string | null
  venueCity: string | null
  venueCountry: string | null
}

/** Normalized home “Featured Events” row (server + client safe). */
export interface FeaturedEventPayload {
  id: string
  title: string
  slug: string | null
  startDate: string
  endDate: string
  bannerImage: string | null
  edition: string | null
  tags: string[]
  eventType: string[]
  categories: string[]
  averageRating: number
  totalReviews: number
  venue: FeaturedEventVenue | null
  /** When true and there is no usable venue line, cards show “Online” instead of “Venue TBA”. */
  isVirtual?: boolean
}
