import type { ListingFollowerFace } from "@/components/event-listing/EventCardFollowStrip"

export interface Event {
  image: string
  organizer: unknown
  id: string
  title: string
  /** Short listing line; falls back to truncated title in trending card when empty. */
  subTitle?: string | null
  description: string
  startDate: string
  endDate: string
  eventType: string
  categories: string[]
  tags: string[]
  images: { url: string }[]
  location: {
    address: string
    city: string
    venue: string
    country?: string
  }
  venue?: {
    venueAddress?: string
    venueCity?: string
    venueCountry?: string
    venueName?: string
  }
  pricing: {
    general: number
  }
  rating: {
    average: number
  }
  featured?: boolean
  status: string
  timings: {
    [x: string]: string
    startDate: string
    endDate: string
  }
  averageRating?: number
  totalReviews?: number
  isVerified?: boolean
  verifiedAt?: string
  verifiedBy?: string
  verifiedBadgeImage?: string | null
  slug?: string | null
  ticketTypes?: unknown[]
  followerPreview?: ListingFollowerFace[]
  followersCount?: number
}

export type EventsPageContentProps = {
  /** From RSC: category names + icon URLs so the banner matches DB on first paint (no default-image flash). */
  initialBrowseCategoryMeta?: Array<{ name: string; icon: string | null }>
  /** From RSC: preloaded listing rows so the page does not wait for a client fetch. */
  initialEvents?: Event[]
}

export type NameCount = { name: string; count: number }
