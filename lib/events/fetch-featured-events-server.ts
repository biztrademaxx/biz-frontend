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
    const res = await fetch(`${getApiBaseUrl()}${FEATURED_EVENTS_PATH}`, {
      cache: "no-store",
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
    return out
  } catch (error) {
    console.error("Error fetching featured events from backend:", error)
    return []
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
