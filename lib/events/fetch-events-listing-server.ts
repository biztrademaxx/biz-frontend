import {
  EVENTS_LISTING_FETCH_LIMIT,
  EVENTS_LISTING_REVALIDATE_SEC,
} from "@/components/events-page/listing-constants"
import type { Event } from "@/components/events-page/listing-types"
import {
  extractEventsFromResponse,
  mapApiEventToListingEvent,
} from "@/components/events-page/listing-utils"

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
}

/** Server-side events for /event listing — cached, direct to Express (skips Next proxy hop). */
export async function fetchEventsListingServer(): Promise<Event[]> {
  try {
    const qs = new URLSearchParams({
      limit: String(EVENTS_LISTING_FETCH_LIMIT),
      sort: "newest",
      excludePast: "true",
    })
    const res = await fetch(`${getApiBaseUrl()}/api/events?${qs.toString()}`, {
      next: { revalidate: EVENTS_LISTING_REVALIDATE_SEC },
    })
    if (!res.ok) return []
    const payload: unknown = await res.json()
    const rawEvents = extractEventsFromResponse(payload)
    return rawEvents.map((row) => mapApiEventToListingEvent(row))
  } catch (e) {
    console.error("fetchEventsListingServer:", e)
    return []
  }
}
