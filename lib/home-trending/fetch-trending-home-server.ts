import {
  filterByHomeLocation,
  getTrendingEventCityLabel,
  getTrendingEventCountryLabel,
  homeLocationQueryString,
} from "@/lib/home-location"
import { resolveHomeLocation } from "@/lib/home-location-server"
import { mergeGoingBundleFromJson } from "./followers-bundle"
import { normalizeTrendingHomeEvent } from "./normalize-trending-event"
import { pickTrendingHomeEvents } from "./pick-trending-events"
import type { GoingBundle, TrendingHomeEvent } from "./types"
import { TRENDING_HOME_MAX_EVENTS } from "./types"

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

export interface TrendingHomePayload {
  events: TrendingHomeEvent[]
  goingBundles: Record<string, GoingBundle>
}

/**
 * Home “trending” strip: one `/api/events` fetch + pick top N.
 * Per-event `/leads` / “going” data is **not** fetched here — `TrendingEventsGridClient` loads it
 * after hydration. Doing 4× many SSR fetches was blocking home for 10s+ when the API was slow.
 */
export async function fetchTrendingHomePayloadServer(): Promise<TrendingHomePayload> {
  const empty: TrendingHomePayload = { events: [], goingBundles: {} }
  try {
    const loc = await resolveHomeLocation()
    const locationQs = homeLocationQueryString(loc)
    const url = `${getApiBaseUrl()}/api/events${locationQs ? `?${locationQs}` : ""}`
    const res = await fetch(url, { next: { revalidate: 60 } })
    if (!res.ok) return empty
    const data: unknown = await res.json()
    const rawList = rawEventsFromPayload(data)
    const normalized: TrendingHomeEvent[] = []
    for (const row of rawList) {
      const ev = normalizeTrendingHomeEvent(row)
      if (ev) normalized.push(ev)
    }
    const locationFiltered = filterByHomeLocation(normalized, loc, {
      getCity: getTrendingEventCityLabel,
      getCountry: getTrendingEventCountryLabel,
    })
    const picked = pickTrendingHomeEvents(locationFiltered, TRENDING_HOME_MAX_EVENTS)
    if (picked.length === 0) return empty

    const goingBundles: Record<string, GoingBundle> = {}
    for (const ev of picked) {
      goingBundles[ev.id] = mergeGoingBundleFromJson(ev, null)
    }

    return { events: picked, goingBundles }
  } catch (e) {
    console.error("fetchTrendingHomePayloadServer:", e)
    return empty
  }
}
