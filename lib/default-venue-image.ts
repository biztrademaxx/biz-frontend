import { sanitizeImageUrl } from "@/lib/placeholder"

/** Fallback when a venue has no usable photo (home explore, listings). */
export const DEFAULT_VENUE_IMAGE = "/placeholder.svg"

function firstCleanFromList(raw: unknown): string | undefined {
  if (!Array.isArray(raw)) return undefined
  for (const item of raw) {
    if (typeof item === "string") {
      const clean = sanitizeImageUrl(item)
      if (clean) return clean
    }
  }
  return undefined
}

/** Resolve display image for venue cards from API / Prisma shapes. */
export function getVenueDisplayImageUrl(venue: {
  images?: unknown
  venueImages?: unknown
  avatar?: string | null
  logo?: string | null
}): string {
  const fromImages = firstCleanFromList(venue.images)
  if (fromImages) return fromImages

  const fromVenueImages = firstCleanFromList(venue.venueImages)
  if (fromVenueImages) return fromVenueImages

  const avatar = sanitizeImageUrl(venue.avatar)
  if (avatar) return avatar

  const logo = sanitizeImageUrl(venue.logo)
  if (logo) return logo

  return DEFAULT_VENUE_IMAGE
}

export function getVenueDisplayImageFromRecord(venue: Record<string, unknown>): string {
  return getVenueDisplayImageUrl({
    images: venue.images,
    venueImages: venue.venueImages,
    avatar: typeof venue.avatar === "string" ? venue.avatar : null,
    logo: typeof venue.logo === "string" ? venue.logo : null,
  })
}

/** True when the venue has at least one non-placeholder image URL. */
export function venueHasDisplayableImage(venue: Record<string, unknown>): boolean {
  return getVenueDisplayImageFromRecord(venue) !== DEFAULT_VENUE_IMAGE
}
