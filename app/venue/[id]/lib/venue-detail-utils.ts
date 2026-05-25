import type { VenueDetail, VenueEvent } from "../types/venue-detail.types"

const FALLBACK_IMAGE = "/logo/Logo-1.png"
const DEFAULT_EVENT_IMAGE = "/images/gpex.jpg"

export function getVenueImages(venue: VenueDetail | null): string[] {
  if (!venue) return []
  return venue.images?.length ? venue.images : venue.venueImages || []
}

export function getTotalCapacity(venue: VenueDetail | null): number {
  if (!venue) return 0
  if (venue.capacity?.total) return venue.capacity.total
  if (venue.meetingSpaces?.length) {
    return venue.meetingSpaces.reduce((sum, space) => sum + (space.capacity || 0), 0)
  }
  return 0
}

export function getHallsCount(venue: VenueDetail | null): number {
  if (!venue) return 0
  if (venue.capacity?.halls) return venue.capacity.halls
  return venue.meetingSpaces?.length ?? 0
}

export function formatVenueDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatVenueDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getGalleryImage(images: string[], index: number): string {
  if (images.length === 0) return FALLBACK_IMAGE
  return images[index] || FALLBACK_IMAGE
}

export function getEventImage(event: VenueEvent): string {
  return event.images?.[0] || event.bannerImage || DEFAULT_EVENT_IMAGE
}

export function getMapAddress(venue: VenueDetail | null): string {
  if (!venue) return ""
  if (venue.location?.coordinates?.lat && venue.location?.coordinates?.lng) {
    return `${venue.location.coordinates.lat},${venue.location.coordinates.lng}`
  }
  return encodeURIComponent(venue.location?.address || venue.venueAddress || "")
}

export function getVenueDisplayName(venue: VenueDetail): string {
  return venue.name || venue.venueName || "Venue"
}
