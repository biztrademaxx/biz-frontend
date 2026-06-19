import { DEFAULT_EVENT_IMAGE } from "@/lib/default-event-image"
import { avatarUrlFromRecord } from "@/lib/user-avatar-url"
import { EVENT_VENUE_LOCATION_PENDING } from "@/lib/event-location-copy"
import { sanitizeImageUrl } from "@/lib/placeholder"
import { resolvedVerifiedBadgeImageUrl } from "@/lib/verified-event-badge"
import type { ListingFollowerFace } from "@/components/event-listing/EventCardFollowStrip"
import type { Event } from "./listing-types"
import { EVENTS_TOP_MUST_VISIT_LIMIT, LISTING_DEFAULT_EVENT_IMAGE } from "./listing-constants"

export function normalizeListingFollowerPreview(rawEvent: Record<string, unknown>): ListingFollowerFace[] {
  const raw = rawEvent.followerPreview ?? rawEvent.goingPreview ?? rawEvent.followersPreview
  if (!Array.isArray(raw)) return []
  return raw.slice(0, 3).map((item: unknown) => {
    if (!item || typeof item !== "object") return {}
    const row = item as Record<string, unknown>
    const nested =
      row.user && typeof row.user === "object" && !Array.isArray(row.user)
        ? (row.user as Record<string, unknown>)
        : {}
    const merged: Record<string, unknown> = { ...row, ...nested }
    const photo = avatarUrlFromRecord(merged)
    return {
      avatar: photo,
      image: null,
      firstName:
        (typeof merged.firstName === "string" ? merged.firstName : null) ??
        (typeof merged.first_name === "string" ? merged.first_name : null),
      lastName:
        (typeof merged.lastName === "string" ? merged.lastName : null) ??
        (typeof merged.last_name === "string" ? merged.last_name : null),
      name: typeof merged.name === "string" ? merged.name : typeof row.name === "string" ? row.name : null,
      displayName:
        (typeof merged.displayName === "string" ? merged.displayName : null) ??
        (typeof merged.display_name === "string" ? merged.display_name : null),
    }
  })
}

export function formatTrendingEventDateRange(startDate: string, endDate?: string | null): string {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : start
  const sameDay =
    start.getDate() === end.getDate() &&
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()

  const single = (d: Date) =>
    d.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })

  if (sameDay) return single(start)

  const wkS = start.toLocaleDateString("en-US", { weekday: "short" })
  const wkE = end.toLocaleDateString("en-US", { weekday: "short" })
  const dS = start.getDate()
  const dE = end.getDate()
  const mS = start.toLocaleDateString("en-US", { month: "short" })
  const mE = end.toLocaleDateString("en-US", { month: "short" })
  const yS = start.getFullYear()
  const yE = end.getFullYear()

  if (yS === yE && start.getMonth() === end.getMonth()) {
    return `${wkS}, ${dS} - ${wkE}, ${dE} ${mS} ${yS}`
  }
  if (yS === yE) {
    return `${wkS}, ${dS} ${mS} - ${wkE}, ${dE} ${mE} ${yS}`
  }
  return `${wkS}, ${dS} ${mS} ${yS} - ${wkE}, ${dE} ${mE} ${yE}`
}

export function formatMembersShort(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0"
  if (n >= 1_000_000) {
    const v = n / 1_000_000
    return `${v >= 10 ? v.toFixed(0) : v.toFixed(1).replace(/\.0$/, "")}M`
  }
  if (n >= 1_000) {
    const k = n / 1_000
    return `${k >= 10 ? k.toFixed(0) : k.toFixed(1).replace(/\.0$/, "")}k`
  }
  return String(Math.round(n))
}

export function trendingCardSubtitle(event: Event): string {
  const raw = typeof event.subTitle === "string" ? event.subTitle.trim() : ""
  if (raw) return raw.length > 90 ? `${raw.slice(0, 87)}…` : raw
  const t = (event.title || "").trim()
  if (t.length <= 48) return t
  return `${t.slice(0, 45)}…`
}

export function trendingLocationLine(event: Event): string {
  const loc = event.location
  if (loc?.city && loc.city !== "City not specified") {
    const country = loc.country && loc.country !== "Country not specified" ? loc.country : ""
    return country ? `${loc.city}, ${country}` : loc.city
  }
  if (loc?.venue && loc.venue !== "Venue not specified") return loc.venue
  if (loc?.address && loc.address !== "Address not available") return loc.address
  if (loc?.country && loc.country !== "Country not specified") return loc.country
  return EVENT_VENUE_LOCATION_PENDING
}

export function normalizeEventFormatName(event: Pick<Event, "eventType" | "categories">): string {
  let formatName = ""
  if (event.eventType && typeof event.eventType === "string") {
    formatName = event.eventType.trim()
  } else if (event.categories && Array.isArray(event.categories) && event.categories.length > 0) {
    const firstCategory = event.categories[0]
    if (typeof firstCategory === "string") {
      formatName = firstCategory.trim()
    }
  }
  if (!formatName) {
    return "Other"
  }
  const normalizedFormat = formatName.toLowerCase()
  if (normalizedFormat.includes("trade show") || normalizedFormat.includes("tradeshow")) {
    return "Exhibition"
  }
  if (normalizedFormat.includes("conference")) {
    return "Conference"
  }
  if (normalizedFormat.includes("workshop") || normalizedFormat.includes("workshops")) {
    return "Workshops"
  }
  if (normalizedFormat.includes("exhibition") || normalizedFormat.includes("expo")) {
    return "Exhibition"
  }
  if (normalizedFormat.includes("seminar")) {
    return "Seminar"
  }
  if (normalizedFormat.includes("meetup") || normalizedFormat.includes("meeting")) {
    return "Meetup"
  }
  return formatName
}

export function extractEventsFromResponse(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload
  const p = payload as Record<string, unknown> | null | undefined
  if (Array.isArray(p?.events)) return p.events as unknown[]
  if (Array.isArray(p?.data)) return p.data as unknown[]
  const data = p?.data as Record<string, unknown> | undefined
  if (Array.isArray(data?.events)) return data.events as unknown[]
  const result = p?.result as Record<string, unknown> | undefined
  if (Array.isArray(result?.events)) return result.events as unknown[]
  return []
}

export function coerceEventVerified(raw: unknown): boolean {
  if (raw === true || raw === 1) return true
  if (typeof raw === "string") {
    const s = raw.trim().toLowerCase()
    return s === "true" || s === "1" || s === "yes" || s === "verified"
  }
  return false
}

export function verifiedBadgeSrc(event: Event): string | null {
  return resolvedVerifiedBadgeImageUrl(event.isVerified, event.verifiedBadgeImage)
}

export function normalizeEventImageUrls(event: Record<string, unknown>): string[] {
  const out: string[] = []
  const seen = new Set<string>()

  const push = (raw: unknown) => {
    if (raw == null) return
    let s: string | null = null
    if (typeof raw === "string" && raw.trim()) s = raw.trim()
    else if (typeof raw === "object" && raw !== null && "url" in raw) {
      const u = (raw as { url: unknown }).url
      if (typeof u === "string" && u.trim()) s = u.trim()
    }
    const clean = s ? sanitizeImageUrl(s) : undefined
    if (clean && !seen.has(clean)) {
      seen.add(clean)
      out.push(clean)
    }
  }

  if (Array.isArray(event.images)) {
    for (const item of event.images) push(item)
  }
  push(event.image)
  push(event.bannerImage)
  push(event.thumbnailImage)

  return out
}

/** Primary image for cards: real event URL only, or default when none exist. */
export function getListingEventPrimaryImage(
  event: { images?: unknown; image?: unknown; bannerImage?: unknown; thumbnailImage?: unknown },
  defaultImage = LISTING_DEFAULT_EVENT_IMAGE,
): string {
  const urls = normalizeEventImageUrls(event as Record<string, unknown>)
  if (urls.length > 0) return urls[0]
  return defaultImage || DEFAULT_EVENT_IMAGE
}

export function formatListingDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  })
}

export function formatListingYear(dateString: string): number {
  return new Date(dateString).getFullYear()
}

function normalizeLocationToken(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ")
}

const CITY_ALIASES: Record<string, string[]> = {
  bengaluru: ["bangalore"],
  bangalore: ["bengaluru"],
  mumbai: ["bombay"],
  bombay: ["mumbai"],
}

function locationTokensMatch(term: string, candidate: string): boolean {
  const t = normalizeLocationToken(term)
  const c = normalizeLocationToken(candidate)
  if (!t || !c) return false
  if (c.includes(t) || t.includes(c)) return true
  const aliases = CITY_ALIASES[t] ?? []
  return aliases.some((alias) => c.includes(alias))
}

export function eventMatchesCountry(event: Event, countryTerm: string): boolean {
  if (!countryTerm.trim()) return true
  const fields = [event.venue?.venueCountry, event.location?.country].map((v) =>
    v ? String(v) : "",
  )
  return fields.some((f) => locationTokensMatch(countryTerm, f))
}

export function eventMatchesCity(event: Event, cityTerm: string): boolean {
  if (!cityTerm.trim()) return true
  const fields = [
    event.venue?.venueCity,
    event.location?.city,
    event.location?.address,
  ].map((v) => (v ? String(v) : ""))
  return fields.some((f) => locationTokensMatch(cityTerm, f))
}

function normalizeCategoryToken(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/** Lenient category match — handles "Education & Training" vs "Education Training". */
export function eventMatchesCategory(event: Event, categoryTerm: string): boolean {
  if (!categoryTerm.trim()) return true
  if (!event.categories?.length) return false
  const needle = normalizeCategoryToken(categoryTerm)
  if (!needle) return true
  return event.categories.some((cat) => {
    if (!cat || typeof cat !== "string") return false
    const hay = normalizeCategoryToken(cat)
    return hay === needle || hay.includes(needle) || needle.includes(hay)
  })
}

export function listingEventFollowerCount(event: Event): number {
  if (typeof event.followersCount === "number" && Number.isFinite(event.followersCount)) {
    return event.followersCount
  }
  return 0
}

export function listingEventRatingAverage(event: Event): number {
  const avg = event.rating?.average
  if (typeof avg === "number" && Number.isFinite(avg)) return avg
  if (typeof event.averageRating === "number" && Number.isFinite(event.averageRating)) {
    return event.averageRating
  }
  return 0
}

/** Top 100 Must Visit ranking: followers first, then rating, then soonest start date. */
export function sortEventsByFollowersAndRating(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    const byFollowers = listingEventFollowerCount(b) - listingEventFollowerCount(a)
    if (byFollowers !== 0) return byFollowers
    const byRating = listingEventRatingAverage(b) - listingEventRatingAverage(a)
    if (byRating !== 0) return byRating
    const aStart = new Date(a.timings?.startDate ?? a.startDate).getTime()
    const bStart = new Date(b.timings?.startDate ?? b.startDate).getTime()
    if (!Number.isNaN(aStart) && !Number.isNaN(bStart) && aStart !== bStart) {
      return aStart - bStart
    }
    return a.id.localeCompare(b.id)
  })
}

export function applyTopMustVisitRanking(
  events: Event[],
  limit: number = EVENTS_TOP_MUST_VISIT_LIMIT,
): Event[] {
  return sortEventsByFollowersAndRating(events).slice(0, limit)
}

export function formatListingFollowerTotal(events: Event[]): string {
  const total = events.reduce((sum, ev) => sum + listingEventFollowerCount(ev), 0)
  if (total >= 1000) return `${(total / 1000).toFixed(1).replace(/\.0$/, "")}K Followers`
  return `${total.toLocaleString()} Followers`
}

const DATE_RANGE_LABELS: Record<string, string> = {
  today: "Today",
  tomorrow: "Tomorrow",
  "this-week": "This Week",
  "this-month": "This Month",
  "next-month": "Next Month",
}

const PRICE_RANGE_LABELS: Record<string, string> = {
  free: "Free",
  "under-1000": "Under ₹1,000",
  "1000-5000": "₹1,000 – ₹5,000",
  "above-5000": "Above ₹5,000",
}

export type EventsListingBannerTitleInput = {
  searchQuery: string
  selectedDate: Date | null
  selectedDateRange: string
  selectedCategories: string[]
  selectedCategory: string
  selectedLocation: string
  selectedCountry: string
  customFromDate: string
  customToDate: string
  selectedFormat: string
  priceRange: string
  rating: string
  activeTab: string
}

export function getEventsListingBannerTitle(input: EventsListingBannerTitleInput): string {
  const {
    searchQuery,
    selectedDate,
    selectedDateRange,
    selectedCategories,
    selectedCategory,
    selectedLocation,
    selectedCountry,
    customFromDate,
    customToDate,
    selectedFormat,
    priceRange,
    rating,
    activeTab,
  } = input

  if (searchQuery.trim()) {
    return `Search Results for "${searchQuery.trim()}"`
  }
  if (selectedDate) {
    return `Events on ${selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`
  }
  if (selectedDateRange.trim()) {
    const label = DATE_RANGE_LABELS[selectedDateRange] ?? selectedDateRange
    return `${label} Events`
  }
  if (selectedCategories.length > 0) {
    return `${selectedCategories.join(", ")} Events`
  }
  if (selectedCategory && selectedCategory !== "All Events") {
    return `${selectedCategory} Events`
  }
  if (selectedFormat && selectedFormat !== "All Formats") {
    return `${selectedFormat} Events`
  }
  if (selectedLocation && selectedCountry) {
    return `Events in ${selectedLocation}, ${selectedCountry}`
  }
  if (selectedLocation) {
    return `Events in ${selectedLocation}`
  }
  if (selectedCountry) {
    return `Events in ${selectedCountry}`
  }
  if (customFromDate || customToDate) {
    if (customFromDate && customToDate) {
      return `Events from ${customFromDate} to ${customToDate}`
    }
    if (customFromDate) return `Events from ${customFromDate}`
    return `Events until ${customToDate}`
  }
  if (priceRange.trim()) {
    const label = PRICE_RANGE_LABELS[priceRange] ?? priceRange
    return `${label} Events`
  }
  if (rating.trim()) {
    return `${rating}+ Star Events`
  }
  if (activeTab === "Verified") {
    return "Verified Events"
  }
  if (activeTab !== "All Events") {
    return `${activeTab} Events`
  }
  return "Top 100 Must Visit"
}

export function eventMatchesSearchQuery(event: Event, query: string): boolean {
  if (!query.trim()) return true
  const q = normalizeLocationToken(query)
  const haystack = [
    event.title,
    event.description,
    event.subTitle,
    ...(event.tags ?? []),
    ...(event.categories ?? []),
    event.venue?.venueCity,
    event.venue?.venueCountry,
    event.location?.city,
    event.location?.country,
    event.location?.address,
  ]
    .filter(Boolean)
    .map((v) => normalizeLocationToken(String(v)))
  return haystack.some((h) => h.includes(q))
}

export function isEventOnDate(event: Event, date: Date): boolean {
  const eventStartDate = new Date(event.timings.startDate)
  const eventEndDate = new Date(event.timings.endDate)
  return (
    date >= new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate()) &&
    date <= new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate())
  )
}

/** True when the event overlaps [from, to] (inclusive calendar days). Either bound may be omitted. */
export function isEventInCustomDateRange(event: Event, from?: string, to?: string): boolean {
  if (!from && !to) return true

  const eventStart = new Date(event.timings.startDate)
  const eventEnd = new Date(event.timings.endDate)
  const eventStartDay = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate())
  const eventEndDay = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate())

  if (from) {
    const [y, m, d] = from.split("-").map(Number)
    const fromDay = new Date(y, m - 1, d)
    if (eventEndDay < fromDay) return false
  }
  if (to) {
    const [y, m, d] = to.split("-").map(Number)
    const toDay = new Date(y, m - 1, d)
    if (eventStartDay > toDay) return false
  }
  return true
}

/** Local calendar start of today (midnight). */
export function getListingTodayStart(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/** True when the event end date is today or later (excludes fully past events). */
export function isEventNotPast(event: Event): boolean {
  const today = getListingTodayStart()
  const endRaw = event.timings?.endDate ?? event.timings?.startDate
  if (!endRaw) return true
  const eventEnd = new Date(endRaw)
  if (Number.isNaN(eventEnd.getTime())) return true
  const eventEndDay = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate())
  return eventEndDay >= today
}

export function isEventInDateRange(event: Event, dateRange: string): boolean {
  const eventDate = new Date(event.timings.startDate)
  const today = getListingTodayStart()
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())

  switch (dateRange) {
    case "today":
      return eventDate >= today && eventDate < tomorrow
    case "tomorrow":
      return eventDate >= tomorrow && eventDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
    case "this-week":
      return eventDate >= today && eventDate <= weekFromNow
    case "this-month":
      return eventDate >= today && eventDate <= monthFromNow
    case "next-month": {
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
      const monthAfter = new Date(today.getFullYear(), today.getMonth() + 2, 1)
      return eventDate >= nextMonth && eventDate < monthAfter
    }
    default:
      return true
  }
}

export function isEventInTab(event: Event, tab: string): boolean {
  if (!isEventNotPast(event)) return false

  const eventDate = new Date(event.timings.startDate)
  const today = getListingTodayStart()
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())

  switch (tab) {
    case "All Events":
      return true
    case "Upcoming":
      return eventDate >= today
    case "This Week":
      return eventDate >= today && eventDate <= weekFromNow
    case "This Month":
      return eventDate >= today && eventDate <= monthFromNow
    default:
      return true
  }
}

/** Map one raw API event object into the listing `Event` shape. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- API payloads are loosely typed
export function mapApiEventToListingEvent(event: any): Event {
  const e = event
  const resolvedId =
    e.id ||
    e._id ||
    (typeof e._id === "object" && e._id?.$oid) ||
    (typeof e._id === "string" ? e._id : undefined)
  const avg =
    typeof e?.averageRating === "number" && Number.isFinite(e.averageRating)
      ? e.averageRating
      : typeof e?.rating?.average === "number" && Number.isFinite(e.rating.average)
        ? e.rating.average
        : 0
  const categories = Array.isArray(e.category) ? e.category : Array.isArray(e.categories) ? e.categories : []

  let address = "Address not available"
  let city = "City not specified"
  let venue = "Venue not specified"
  let country = "Country not specified"

  if (e.venue?.venueAddress) {
    address = e.venue.venueAddress
  } else if (e.location?.address) {
    address = e.location.address
  } else if (e.address) {
    address = e.address
  }

  if (e.venue?.venueCity) {
    city = e.venue.venueCity
  } else if (e.location?.city) {
    city = e.location.city
  } else if (e.city) {
    city = e.city
  }

  if (e.venue?.venueName) {
    venue = e.venue.venueName
  } else if (e.location?.venue) {
    venue = e.location.venue
  } else if (e.venue) {
    venue = typeof e.venue === "string" ? e.venue : "Venue"
  }

  if (e.venue?.venueCountry) {
    country = e.venue.venueCountry
  } else if (e.location?.country) {
    country = e.location.country
  } else if (e.country) {
    country = e.country
  }

  const evRec = event
  const countBlock = evRec._count as { savedEvents?: number } | undefined
  let followersCount = typeof e.followersCount === "number" ? e.followersCount : 0
  if (followersCount === 0 && typeof countBlock?.savedEvents === "number") {
    followersCount = countBlock.savedEvents
  }

  const verifiedFlag =
    coerceEventVerified(e.isVerified) ||
    coerceEventVerified(e.verified) ||
    coerceEventVerified(evRec.verificationStatus)

  const subTitleRaw = e.subTitle ?? e.subtitle ?? e.shortDescription
  const subTitle = typeof subTitleRaw === "string" && subTitleRaw.trim() ? subTitleRaw.trim() : null

  const description =
    typeof e.description === "string"
      ? e.description
      : typeof e.shortDescription === "string"
        ? e.shortDescription
        : ""

  return {
    ...e,
    id: String(resolvedId || ""),
    slug: typeof e.slug === "string" ? e.slug : null,
    subTitle,
    description,
    eventType: e.eventType || categories?.[0] || "Other",
    timings: {
      startDate: e.startDate,
      endDate: e.endDate,
    },
    location: {
      address,
      city,
      venue,
      country,
    },
    venue: e.venue || {
      venueAddress: address,
      venueCity: city,
      venueCountry: country,
    },
    ticketTypes: Array.isArray(e.ticketTypes) ? e.ticketTypes : [],
    followerPreview: normalizeListingFollowerPreview(event as Record<string, unknown>),
    followersCount,
    featured: e.tags?.includes("featured") || false,
    categories,
    tags: e.tags || [],
    images: normalizeEventImageUrls(event as Record<string, unknown>).map((url) => ({ url })),
    pricing: e.pricing || { general: 0 },
    rating: { average: avg },
    totalReviews: typeof e?.totalReviews === "number" ? e.totalReviews : undefined,
    isVerified: verifiedFlag,
    verifiedAt: e.verifiedAt || null,
    verifiedBy: e.verifiedBy || null,
    verifiedBadgeImage:
      typeof e.verifiedBadgeImage === "string" && e.verifiedBadgeImage.trim()
        ? e.verifiedBadgeImage.trim()
        : null,
  } as Event
}
