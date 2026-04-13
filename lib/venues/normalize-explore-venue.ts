import type { ExploreVenueCard } from "./types"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function venueEventCount(v: Record<string, unknown>): number {
  const c = v._count as { events?: number } | undefined
  if (typeof c?.events === "number") return c.events
  if (typeof v.eventCount === "number") return v.eventCount
  if (typeof v.eventsCount === "number") return v.eventsCount
  const ev = v.events
  if (Array.isArray(ev)) return ev.length
  return 0
}

function venueCity(v: Record<string, unknown>): string {
  const loc = v.location as { city?: string } | undefined
  if (typeof loc?.city === "string" && loc.city.trim()) return loc.city.trim()
  if (typeof v.city === "string" && v.city.trim()) return v.city.trim()
  if (typeof v.venueCity === "string" && v.venueCity.trim()) return v.venueCity.trim()
  return ""
}

function firstImage(v: Record<string, unknown>): string {
  const images = v.images
  if (Array.isArray(images) && typeof images[0] === "string" && images[0]) return images[0]
  const venueImages = v.venueImages
  if (Array.isArray(venueImages) && typeof venueImages[0] === "string" && venueImages[0]) {
    return venueImages[0]
  }
  return "/city/c1.jpg"
}

function venueRating(v: Record<string, unknown>): { avg: number; reviews: number } {
  const stats = v.stats as { averageRating?: number; totalReviews?: number } | undefined
  const avg =
    typeof v.averageRating === "number"
      ? v.averageRating
      : typeof stats?.averageRating === "number"
        ? stats.averageRating
        : 0
  const reviews =
    typeof v.totalReviews === "number"
      ? v.totalReviews
      : typeof stats?.totalReviews === "number"
        ? stats.totalReviews
        : 0
  return { avg, reviews }
}

export function normalizeExploreVenue(raw: unknown): ExploreVenueCard | null {
  if (!isRecord(raw)) return null
  const idRaw = raw.id
  if (idRaw === undefined || idRaw === null) return null
  const id = String(idRaw)
  const name = typeof raw.name === "string" ? raw.name : "Venue"
  const desc =
    typeof raw.description === "string"
      ? raw.description
      : typeof raw.venueDescription === "string"
        ? raw.venueDescription
        : ""
  const { avg, reviews } = venueRating(raw)
  return {
    id,
    name,
    imageUrl: firstImage(raw),
    eventCount: venueEventCount(raw),
    city: venueCity(raw),
    description: desc,
    averageRating: avg,
    totalReviews: reviews,
  }
}
