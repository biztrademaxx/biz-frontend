import { hasDisplayableEventImage } from "@/lib/event-card-meta"
import {
  filterByHomeCountryPrioritizeCity,
  getFeaturedEventCityLabel,
  getFeaturedEventCountryLabel,
} from "@/lib/home-location"
import { resolveHomeLocation } from "@/lib/home-location-server"
import type { FeaturedEventPayload } from "./types"
import { normalizeFeaturedEvent } from "./normalize-featured-event"

const FEATURED_EVENTS_PATH = "/api/events/featured"
const VIP_EVENTS_PATH = "/api/events/vip"

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
}

function rawEventsFromPayload(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === "object" && Array.isArray((data as { events?: unknown[] }).events)) {
    return (data as { events: unknown[] }).events
  }
  return []
}

function eventIdFromRaw(raw: unknown): string | null {
  if (!raw || typeof raw !== "object" || !("id" in raw)) return null
  const id = (raw as { id: unknown }).id
  return id != null ? String(id) : null
}

/**
 * Home featured grid: admin-featured events plus VIP events (same pool as hero),
 * then country filter + city-first ordering. Matches VIP when an event is VIP-only.
 */
export async function fetchFeaturedEventsForHomeSection(): Promise<FeaturedEventPayload[]> {
  try {
    const loc = await resolveHomeLocation()
    const base = getApiBaseUrl()

    const [featuredRes, vipRes] = await Promise.all([
      fetch(`${base}${FEATURED_EVENTS_PATH}`, { next: { revalidate: 120 } }),
      fetch(`${base}${VIP_EVENTS_PATH}`, { next: { revalidate: 120 } }),
    ])

    const featuredJson = featuredRes.ok ? await featuredRes.json() : null
    const vipJson = vipRes.ok ? await vipRes.json() : null

    const seen = new Set<string>()
    const out: FeaturedEventPayload[] = []

    for (const raw of [...rawEventsFromPayload(featuredJson), ...rawEventsFromPayload(vipJson)]) {
      const id = eventIdFromRaw(raw)
      if (!id || seen.has(id)) continue
      seen.add(id)
      const normalized = normalizeFeaturedEvent(raw)
      if (normalized) out.push(normalized)
    }

    return filterByHomeCountryPrioritizeCity(out, loc, {
      getCity: getFeaturedEventCityLabel,
      getCountry: getFeaturedEventCountryLabel,
    }).filter((e) => hasDisplayableEventImage(e))
  } catch (error) {
    console.error("Error fetching featured events from backend:", error)
    return []
  }
}
