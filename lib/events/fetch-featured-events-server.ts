import {
  buildResolvedHomeLocation,
  filterByHomeLocation,
  getFeaturedEventCityLabel,
  getFeaturedEventCountryLabel,
} from "@/lib/home-location"
import { resolveHomeLocation } from "@/lib/home-location-server"
import type { FeaturedEventPayload } from "./types"
import { normalizeFeaturedEvent } from "./normalize-featured-event"

const FEATURED_EVENTS_PATH = "/api/events/featured"

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
}

/**
 * Server-side fetch for home featured events (RSC): calls the Express API only (`NEXT_PUBLIC_API_URL`), not Next.js `/app/api`.
 */
export async function fetchFeaturedEventsForHomeSection(): Promise<FeaturedEventPayload[]> {
  try {
    const loc = await resolveHomeLocation()
    // Featured endpoint has no location filter; filtering is done below client-side.
    const res = await fetch(`${getApiBaseUrl()}${FEATURED_EVENTS_PATH}`, {
      next: { revalidate: 120 },
    })
    if (!res.ok) {
      console.error("Featured events backend error:", res.status, await res.text())
      return []
    }
    const data: unknown = await res.json()
    const rawEvents: unknown[] = Array.isArray(data)
      ? data
      : isRecord(data) && Array.isArray(data.events)
        ? data.events
        : []

    const out: FeaturedEventPayload[] = []
    for (const raw of rawEvents) {
      const normalized = normalizeFeaturedEvent(raw)
      if (normalized) out.push(normalized)
    }
    const filtered = filterByHomeLocation(out, loc, {
      getCity: getFeaturedEventCityLabel,
      getCountry: getFeaturedEventCountryLabel,
    })
    // If nothing matches the visitor city, show country-wide featured before going empty.
    if (filtered.length === 0 && loc.city && loc.countryName) {
      const countryOnly = buildResolvedHomeLocation({
        city: null,
        countryCode: loc.countryCode,
        countryName: loc.countryName,
        isManual: loc.isManual,
      })
      const byCountry = filterByHomeLocation(out, countryOnly, {
        getCity: getFeaturedEventCityLabel,
        getCountry: getFeaturedEventCountryLabel,
      })
      if (byCountry.length > 0) return byCountry
    }
    return filtered
  } catch (error) {
    console.error("Error fetching featured events from backend:", error)
    return []
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
