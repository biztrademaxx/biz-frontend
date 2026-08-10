/**
 * Server-driven /event listing query helpers (Phase 1).
 * Filters + pagination go to GET /api/events — no 500-row client fetch.
 */

import { exploreKeyFromFormatName } from "@/lib/explore-event-types"
import {
  EVENTS_LISTING_PAGE_SIZE,
  EVENTS_LISTING_PREMIUM_LIMIT,
  EVENTS_LISTING_RAILS_LIMIT,
} from "./listing-constants"

export type EventsListingQueryInput = {
  page?: number
  limit?: number
  search?: string
  /** Single category or multiple (OR). */
  category?: string
  categories?: string[]
  location?: string
  country?: string
  /** Explore key (CONFERENCE) or sidebar format name (Conference). */
  type?: string
  format?: string
  from?: string
  to?: string
  startDate?: string
  startDateTo?: string
  verified?: boolean
  excludePast?: boolean
  sort?: string
  minRating?: number | string
  price?: string
  /** Listing tabs: All Events | Upcoming | This Week | This Month | Verified */
  tab?: string
  /** Sidebar preset: today | tomorrow | this-week | this-month | next-month */
  dateRange?: string
  /** ISO date (local calendar day) for single-day filter */
  selectedDateIso?: string
}

export type EventsListingPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

/** Local calendar YYYY-MM-DD */
export function toLocalIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export function getListingTodayStart(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/**
 * Map UI tab / date-range / custom dates into API date bounds.
 * Prefer overlap `from`/`to` for custom ranges; use startDate/startDateTo for tabs.
 */
export function resolveListingDateParams(input: EventsListingQueryInput): {
  from?: string
  to?: string
  startDate?: string
  startDateTo?: string
  verified?: boolean
} {
  const today = getListingTodayStart()
  const todayIso = toLocalIsoDate(today)

  if (input.selectedDateIso) {
    return {
      from: input.selectedDateIso,
      to: input.selectedDateIso,
    }
  }

  if (input.from || input.to) {
    return {
      from: input.from?.trim() || undefined,
      to: input.to?.trim() || undefined,
    }
  }

  if (input.dateRange) {
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
    switch (input.dateRange) {
      case "today":
        return { startDate: todayIso, startDateTo: todayIso }
      case "tomorrow":
        return { startDate: toLocalIsoDate(tomorrow), startDateTo: toLocalIsoDate(tomorrow) }
      case "this-week":
        return { startDate: todayIso, startDateTo: toLocalIsoDate(weekFromNow) }
      case "this-month":
        return { startDate: todayIso, startDateTo: toLocalIsoDate(monthFromNow) }
      case "next-month": {
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
        const monthAfter = new Date(today.getFullYear(), today.getMonth() + 2, 0)
        return {
          startDate: toLocalIsoDate(nextMonth),
          startDateTo: toLocalIsoDate(monthAfter),
        }
      }
      default:
        break
    }
  }

  const tab = input.tab?.trim() || "All Events"
  if (tab === "Verified") {
    return { verified: true }
  }
  if (tab === "Upcoming") {
    return { startDate: todayIso }
  }
  if (tab === "This Week") {
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return { startDate: todayIso, startDateTo: toLocalIsoDate(weekFromNow) }
  }
  if (tab === "This Month") {
    const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
    return { startDate: todayIso, startDateTo: toLocalIsoDate(monthFromNow) }
  }

  return {}
}

export function buildEventsListingSearchParams(input: EventsListingQueryInput): URLSearchParams {
  const qs = new URLSearchParams()
  const page = input.page && input.page > 0 ? input.page : 1
  const limit =
    input.limit && input.limit > 0 ? Math.min(input.limit, 500) : EVENTS_LISTING_PAGE_SIZE

  qs.set("page", String(page))
  qs.set("limit", String(limit))
  qs.set("sort", input.sort?.trim() || "ranked")
  qs.set("excludePast", input.excludePast === false ? "false" : "true")

  const search = input.search?.trim()
  if (search) qs.set("search", search)

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

  const formatName = input.format?.trim()
  const typeRaw = input.type?.trim()
  if (typeRaw) {
    qs.set("type", typeRaw)
  } else if (formatName && formatName !== "All Formats") {
    const key = exploreKeyFromFormatName(formatName)
    qs.set("type", key ?? formatName)
  }

  const dates = resolveListingDateParams(input)
  if (dates.from) qs.set("from", dates.from)
  if (dates.to) qs.set("to", dates.to)
  if (dates.startDate) qs.set("startDate", dates.startDate)
  if (dates.startDateTo) qs.set("startDateTo", dates.startDateTo)
  if (dates.verified || input.verified) qs.set("verified", "true")

  if (input.minRating != null && String(input.minRating).trim() !== "") {
    qs.set("minRating", String(input.minRating))
  }
  if (input.price?.trim()) qs.set("price", input.price.trim())

  return qs
}

export function getEventsListingApiUrl(input: EventsListingQueryInput = {}): string {
  return `/api/events?${buildEventsListingSearchParams(input).toString()}`
}

/** Compact set for sidebar facets + trending/featured rails (not the main ranked page). */
export function getEventsListingRailsApiUrl(): string {
  const qs = new URLSearchParams({
    limit: String(EVENTS_LISTING_RAILS_LIMIT),
    sort: "popular",
    excludePast: "true",
  })
  return `/api/events?${qs.toString()}`
}

/** Gold + Platinum organizer events for the /event right rail (respects category/location filters). */
export function getEventsListingPremiumApiUrl(
  input: Pick<EventsListingQueryInput, "category" | "categories" | "location" | "country"> = {},
): string {
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
  return `/api/events?${qs.toString()}`
}

export function emptyListingPagination(limit = EVENTS_LISTING_PAGE_SIZE): EventsListingPagination {
  return {
    page: 1,
    limit,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  }
}

export function extractPaginationFromResponse(payload: unknown): EventsListingPagination {
  const p =
    payload && typeof payload === "object" && "pagination" in payload
      ? (payload as { pagination?: Record<string, unknown> }).pagination
      : undefined
  if (!p || typeof p !== "object") return emptyListingPagination()
  const page = typeof p.page === "number" && p.page > 0 ? p.page : 1
  const limit = typeof p.limit === "number" && p.limit > 0 ? p.limit : EVENTS_LISTING_PAGE_SIZE
  const total = typeof p.total === "number" && p.total >= 0 ? p.total : 0
  const totalPages =
    typeof p.totalPages === "number" && p.totalPages > 0
      ? p.totalPages
      : Math.max(1, Math.ceil(total / limit))
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: Boolean(p.hasNextPage) || page * limit < total,
    hasPreviousPage: Boolean(p.hasPreviousPage) || page > 1,
  }
}
