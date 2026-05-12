import { slugify } from "@/utils/slugify"

/** Public URL segment for the venue manager dashboard: slug from venue name when set, else UUID. */
export function getVenueDashboardPath(userId: string, venueName?: string | null): string {
  const raw = typeof venueName === "string" ? venueName.trim() : ""
  const segment = raw ? slugify(raw) : ""
  if (segment.length > 0) {
    return `/venue-dashboard/${encodeURIComponent(segment)}`
  }
  return `/venue-dashboard/${userId}`
}

/** Public venue detail URL: `/venue/{slug}` when name exists, else `/venue/{uuid}`. */
export function getVenuePublicPath(venueUserId: string, venueName?: string | null): string {
  const raw = typeof venueName === "string" ? venueName.trim() : ""
  const segment = raw ? slugify(raw) : ""
  if (segment.length > 0) {
    return `/venue/${encodeURIComponent(segment)}`
  }
  return `/venue/${venueUserId}`
}
