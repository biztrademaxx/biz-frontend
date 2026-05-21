import {
  filterByHomeCountryPrioritizeCity,
  getTrendingEventCityLabel,
  getTrendingEventCountryLabel,
} from "@/lib/home-location"
import { hasDisplayableEventImage } from "@/lib/event-card-meta"
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
function eventIdFromRaw(raw: unknown): string | null {
  if (!raw || typeof raw !== "object" || !("id" in raw)) return null
  const id = (raw as { id: unknown }).id
  return id != null ? String(id) : null
}

export async function fetchTrendingHomePayloadServer(): Promise<TrendingHomePayload> {
  const empty: TrendingHomePayload = { events: [], goingBundles: {} }
  try {
    const loc = await resolveHomeLocation()
    const base = getApiBaseUrl()
    const [listRes, vipRes] = await Promise.all([
      fetch(`${base}/api/events?limit=120`, { next: { revalidate: 60 } }),
      fetch(`${base}/api/events/vip`, { next: { revalidate: 60 } }),
    ])
    const listJson = listRes.ok ? await listRes.json() : null
    const vipJson = vipRes.ok ? await vipRes.json() : null

    const seen = new Set<string>()
    const normalized: TrendingHomeEvent[] = []
    for (const row of [...rawEventsFromPayload(listJson), ...rawEventsFromPayload(vipJson)]) {
      const id = eventIdFromRaw(row)
      if (!id || seen.has(id)) continue
      seen.add(id)
      const ev = normalizeTrendingHomeEvent(row)
      if (ev) normalized.push(ev)
    }
    const locationFiltered = filterByHomeCountryPrioritizeCity(normalized, loc, {
      getCity: getTrendingEventCityLabel,
      getCountry: getTrendingEventCountryLabel,
    }).filter((e) => hasDisplayableEventImage(e))
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
