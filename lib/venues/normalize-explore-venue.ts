import { getVenueDisplayImageFromRecord, venueHasDisplayableImage } from "@/lib/default-venue-image"
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

function venueCountry(v: Record<string, unknown>): string {
  const loc = v.location as { country?: string } | undefined
  if (typeof loc?.country === "string" && loc.country.trim()) return loc.country.trim()
  if (typeof v.country === "string" && v.country.trim()) return v.country.trim()
  if (typeof v.venueCountry === "string" && v.venueCountry.trim()) return v.venueCountry.trim()
  return ""
}

function venueState(v: Record<string, unknown>): string {
  const loc = v.location as { state?: string } | undefined
  if (typeof loc?.state === "string" && loc.state.trim()) return loc.state.trim()
  if (typeof v.state === "string" && v.state.trim()) return v.state.trim()
  if (typeof v.venueState === "string" && v.venueState.trim()) return v.venueState.trim()
  return ""
}

function venueAddress(v: Record<string, unknown>): string {
  const loc = v.location as { address?: string } | undefined
  if (typeof loc?.address === "string" && loc.address.trim()) return loc.address.trim()
  if (typeof v.address === "string" && v.address.trim()) return v.address.trim()
  if (typeof v.venueAddress === "string" && v.venueAddress.trim()) return v.venueAddress.trim()
  return ""
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

export function normalizeExploreVenue(raw: unknown, options?: { requirePhoto?: boolean }): ExploreVenueCard | null {
  if (!isRecord(raw)) return null
  if (options?.requirePhoto && !venueHasDisplayableImage(raw)) return null

  const idRaw = raw.id
  if (idRaw === undefined || idRaw === null) return null
  const id = String(idRaw)
  const name =
    (typeof raw.venueName === "string" && raw.venueName.trim()) ||
    (typeof raw.name === "string" && raw.name.trim()) ||
    "Venue"
  const desc =
    typeof raw.description === "string"
      ? raw.description
      : typeof raw.venueDescription === "string"
        ? raw.venueDescription
        : ""
  const { avg, reviews } = venueRating(raw)
  const city = venueCity(raw)
  const country = venueCountry(raw)
  const locationHay = [city, venueState(raw), country, venueAddress(raw)].filter(Boolean).join(" ")

  return {
    id,
    name,
    imageUrl: getVenueDisplayImageFromRecord(raw),
    eventCount: venueEventCount(raw),
    city,
    country,
    locationHay,
    description: desc,
    averageRating: avg,
    totalReviews: reviews,
  }
}
