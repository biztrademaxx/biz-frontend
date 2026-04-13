export interface HeroVenue {
  venueName?: string | null
  venueCity?: string | null
  venueCountry?: string | null
}

export interface HeroSlideshowEvent {
  id: string
  title: string
  subTitle: string | null
  slug?: string | null
  startDate: string
  endDate?: string | null
  bannerImage?: string | null
  images?: string[] | null
  venue?: HeroVenue | null
}
