export interface TrendingVenue {
  id: string
  venueName: string
  venueCity: string
  venueCountry: string
  venueState?: string
  venueAddress?: string
}

export type FollowerPreviewItem = {
  avatar?: string | null
  image?: string | null
  firstName?: string | null
  lastName?: string | null
  name?: string | null
  displayName?: string | null
}

/** Serializable event row for home trending cards. */
export interface TrendingHomeEvent {
  id: string
  slug: string | null
  title: string
  leads: string
  bannerImage?: string
  logo?: string
  edition?: string
  categories?: string[]
  followers?: number
  followersCount?: number
  followerPreview?: FollowerPreviewItem[]
  /** From backend list payload when available — used as fallback count for “Going”. */
  goingCount?: number
  goingPreview?: FollowerPreviewItem[]
  startDate: string
  endDate?: string
  venueId?: string
  venue?: TrendingVenue
  location?: {
    city: string
    venue?: string
    country?: string
    address?: string
  }
}

export type FollowerProfile = {
  id: string
  name: string
  avatar: string | null
  subtitle?: string
}

export type FollowerBundle = { profiles: FollowerProfile[]; total: number }

/** People marked as going / visit intent (attendee leads), same shape as follower bundles for avatars + count. */
export type GoingBundle = FollowerBundle

export const TRENDING_AVATAR_COUNT = 3
export const TRENDING_HOME_MAX_EVENTS = 4
