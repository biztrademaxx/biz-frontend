import {
  EVENTS_LISTING_PAGE_SIZE,
  EVENTS_LISTING_PREMIUM_LIMIT,
  EVENTS_LISTING_RAILS_LIMIT,
  EVENTS_LISTING_REVALIDATE_SEC,
} from "@/components/events-page/listing-constants"
import type { Event } from "@/components/events-page/listing-types"
import {
  extractEventsFromResponse,
  mapApiEventToListingEvent,
} from "@/components/events-page/listing-utils"
import {
  buildEventsListingSearchParams,
  emptyListingPagination,
  extractPaginationFromResponse,
  type EventsListingPagination,
  type EventsListingQueryInput,
} from "@/components/events-page/listing-query"

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
}

export type EventsListingServerResult = {
  events: Event[]
  pagination: EventsListingPagination
}

/** Server-side events for /event listing — cached, direct to Express (skips Next proxy hop). */
export async function fetchEventsListingServer(
  input: EventsListingQueryInput = {},
): Promise<EventsListingServerResult> {
  try {
    const qs = buildEventsListingSearchParams({
      page: 1,
      limit: EVENTS_LISTING_PAGE_SIZE,
      sort: "ranked",
      excludePast: true,
      ...input,
    })
    const res = await fetch(`${getApiBaseUrl()}/api/events?${qs.toString()}`, {
      next: { revalidate: EVENTS_LISTING_REVALIDATE_SEC },
    })
    if (!res.ok) {
      return { events: [], pagination: emptyListingPagination() }
    }
    const payload: unknown = await res.json()
    const rawEvents = extractEventsFromResponse(payload)
    return {
      events: rawEvents.map((row) => mapApiEventToListingEvent(row)),
      pagination: extractPaginationFromResponse(payload),
    }
  } catch (e) {
    console.error("fetchEventsListingServer:", e)
    return { events: [], pagination: emptyListingPagination() }
  }
}

/** Compact popular set for facets / trending / featured rails. */
export async function fetchEventsListingRailsServer(): Promise<Event[]> {
  try {
    const qs = new URLSearchParams({
      limit: String(EVENTS_LISTING_RAILS_LIMIT),
      sort: "popular",
      excludePast: "true",
    })
    const res = await fetch(`${getApiBaseUrl()}/api/events?${qs.toString()}`, {
      next: { revalidate: EVENTS_LISTING_REVALIDATE_SEC },
    })
    if (!res.ok) return []
    const payload: unknown = await res.json()
    return extractEventsFromResponse(payload).map((row) => mapApiEventToListingEvent(row))
  } catch (e) {
    console.error("fetchEventsListingRailsServer:", e)
    return []
  }
}

/** Gold + Platinum subscription events for the /event right rail. */
export async function fetchEventsListingPremiumServer(
  input: Pick<EventsListingQueryInput, "category" | "categories" | "location" | "country"> = {},
): Promise<Event[]> {
  try {
    const qs = new URLSearchParams({
      limit: String(EVENTS_LISTING_PREMIUM_LIMIT),
      sort: "ranked",
      excludePast: "true",
      planTier: "gold,platinum",
    })
    const cats =
      input.categories && input.categories.length > 0
        ? input.categories.map((c) => c.trim()).filter(Boolean)
        : input.category && input.category !== "All Events"
          ? [input.category.trim()].filter(Boolean)
          : []
    if (cats.length > 0) qs.set("category", cats.join(","))
    const location = input.location?.trim()
    if (location) qs.set("location", location)
    const country = input.country?.trim()
    if (country) qs.set("country", country)

    const res = await fetch(`${getApiBaseUrl()}/api/events?${qs.toString()}`, {
      next: { revalidate: EVENTS_LISTING_REVALIDATE_SEC },
    })
    if (!res.ok) return []
    const payload: unknown = await res.json()
    return extractEventsFromResponse(payload).map((row) => mapApiEventToListingEvent(row))
  } catch (e) {
    console.error("fetchEventsListingPremiumServer:", e)
    return []
  }
}
