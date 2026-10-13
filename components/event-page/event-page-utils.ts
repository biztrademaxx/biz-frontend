import { EVENT_VENUE_LOCATION_PENDING } from "@/lib/event-location-copy"
import { formatEventSidebarTimeRange } from "@/lib/event-sidebar-time-range"
import { formatPublicTicketPriceLine } from "@/lib/ticket-price-display"
import { COUNTRY_CURRENCY_MAP } from "./event-page-constants"
import type { TicketType } from "./event-page-types"

export function getCurrencyByCountry(event: any): string {
  const countryCandidates = [
    event?.country,
    event?.eventCountry,
    event?.venue?.country,
    event?.venue?.venueCountry,
    event?.organizer?.country,
    event?.location?.country,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase())

  for (const country of countryCandidates) {
    if (COUNTRY_CURRENCY_MAP[country]) {
      return COUNTRY_CURRENCY_MAP[country]
    }

    const matchedKey = Object.keys(COUNTRY_CURRENCY_MAP).find((key) => country.includes(key))
    if (matchedKey) {
      return COUNTRY_CURRENCY_MAP[matchedKey]
    }
  }

  return "EUR"
}

export function getCompanyInitials(companyName?: string): string {
  if (!companyName || companyName.trim() === "") return "EV"

  const cleanedName = companyName
    .replace(/\b(Inc|LLC|Ltd|GmbH|Corp|Co)\b\.?/gi, "")
    .trim()

  const words = cleanedName.split(/\s+/)

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase()
  }

  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
}

export function normalizeListedStrings(raw: unknown): string[] {
  if (raw == null) return []
  if (Array.isArray(raw)) {
    return raw.map((x) => String(x).trim()).filter(Boolean)
  }
  const one = String(raw).trim()
  return one ? [one] : []
}

/** First two browse categories, then hashtag-style tags; counts extras for "+N more types". */
export function buildListedInDisplay(event: any): {
  categoryChips: string[]
  hashtagLabels: string[]
  moreCount: number
} {
  const fromCategories = normalizeListedStrings(event?.categories)
  const legacySingle = normalizeListedStrings(event?.category)
  const allCategories = fromCategories.length > 0 ? fromCategories : legacySingle

  const tagsRaw = normalizeListedStrings(event?.tags)
  const categoryKeys = new Set(allCategories.map((c) => c.toLowerCase()))

  const tagsDeduped = tagsRaw.filter((t) => {
    const core = t.replace(/^#+\s*/, "").trim().toLowerCase()
    return core && !categoryKeys.has(core)
  })

  const primaryCats = allCategories.slice(0, 2)
  const extraCats = Math.max(0, allCategories.length - 2)

  const MAX_TAGS_VISIBLE = 14
  const sliceTags = tagsDeduped.slice(0, MAX_TAGS_VISIBLE)
  const hiddenTags = Math.max(0, tagsDeduped.length - sliceTags.length)

  const hashtagLabels = sliceTags.map((t) => {
    const s = t.trim()
    return s.startsWith("#") ? s : `#${s}`
  })

  let categoryChips = [...primaryCats]
  if (categoryChips.length === 0 && hashtagLabels.length === 0 && legacySingle.length > 0) {
    categoryChips = [legacySingle[0]]
  }

  return {
    categoryChips,
    hashtagLabels,
    moreCount: extraCats + hiddenTags,
  }
}

/** Same clock times as EventHero sidebar, plus " (General)" for the About details card. */
export function formatGeneralTimingsLine(event: any): string {
  const line = formatEventSidebarTimeRange(event)
  if (line === "Time to be announced") return "To be announced (General)"
  return `${line} (General)`
}

/** Human-readable address from selected venue + event fallbacks (API uses flat `venue` fields from User). */
export function getDisplayAddress(event: any): string {
  const v = event?.venue
  if (v) {
    const joined = typeof v.location === "string" && v.location.trim().length > 0 ? v.location.trim() : ""
    if (joined) return joined

    const street = v.venueAddress || v.address || v.streetAddress || ""
    const cityPart = [v.venueCity, v.venueState].filter(Boolean).join(", ")
    const tail = [v.venueZipCode, v.venueCountry].filter(Boolean).join(" ")
    const parts = [street, cityPart, tail].filter((p) => p && String(p).trim() !== "")
    if (parts.length > 0) return parts.join(", ")
  }

  const loc = event?.location
  if (loc && typeof loc === "object") {
    const o = loc as Record<string, string | undefined>
    const line = [o.address, o.venueAddress, o.streetAddress, o.city, o.area, o.country]
      .filter((x) => x && String(x).trim() !== "")
      .join(", ")
    if (line) return line
  }

  const direct = event?.address || event?.venueAddress || event?.streetAddress
  if (direct) return String(direct)

  if (event?.isVirtual) {
    return event?.virtualLink ? "Online event (link in event details)" : "Online event"
  }

  return EVENT_VENUE_LOCATION_PENDING
}

/** Public label under the title: venue city + country only (full address stays on map links). */
export function getPublicVenueCityCountry(event: any): string {
  if (event?.isVirtual) return getDisplayAddress(event)

  const v = event?.venue
  let city = ""
  let country = ""

  if (v) {
    city = String(v.venueCity || v.city || v.area || "").trim()
    country = String(v.venueCountry || v.country || "").trim()
  }

  if (!city || !country) {
    const loc = event?.location
    if (loc && typeof loc === "object") {
      const o = loc as Record<string, string | undefined>
      if (!city) city = String(o.city || o.area || "").trim()
      if (!country) country = String(o.country || "").trim()
    }
  }

  if (!city) city = String(event?.city || event?.eventCity || "").trim()
  if (!country) country = String(event?.country || event?.eventCountry || "").trim()

  const parts = [city, country].filter(Boolean)
  if (parts.length > 0) return parts.join(", ")

  return getDisplayAddress(event)
}

/** Encoded maps query from full display address (what users navigate to when tapping the short city/country line). */
export function getEncodedFullAddressForMaps(event: any): string {
  const display = getDisplayAddress(event)
  if (display !== EVENT_VENUE_LOCATION_PENDING && !display.startsWith("Online event")) {
    return encodeURIComponent(display)
  }
  return getDirectionsDestination(event)
}

/** Query fragment for Google Maps (`q=` / destination=); prefers coordinates, then encoded address. */
export function getMapAddress(event: any): string {
  const v = event?.venue
  const latRaw = v?.latitude ?? v?.location?.coordinates?.lat
  const lngRaw = v?.longitude ?? v?.location?.coordinates?.lng
  if (latRaw != null && lngRaw != null) {
    const lat = Number(latRaw)
    const lng = Number(lngRaw)
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      return `${lat},${lng}`
    }
  }

  let address = ""
  let city = ""
  let country = ""
  if (v) {
    address = v.venueAddress || v.address || v.streetAddress || ""
    city = v.venueCity || v.city || v.area || ""
    country = v.venueCountry || v.country || ""
    if (!address && typeof v.location === "string" && v.location.trim()) {
      return encodeURIComponent(v.location.trim())
    }
  }

  const loc = event?.location
  if (loc && typeof loc === "object") {
    const o = loc as Record<string, string | undefined>
    address = address || o.address || o.streetAddress || o.venueAddress || ""
    city = city || o.city || o.area || ""
    country = country || o.country || ""
  }

  if (!address && !city && !country) {
    address = event?.address || event?.venueAddress || event?.streetAddress || ""
    city = event?.city || event?.eventCity || ""
    country = event?.country || event?.eventCountry || ""
  }

  const parts = [address, city, country].filter((p) => p && String(p).trim() !== "")
  if (parts.length > 0) return encodeURIComponent(parts.join(", "))

  const display = getDisplayAddress(event)
  if (display && display !== EVENT_VENUE_LOCATION_PENDING) return encodeURIComponent(display)

  return encodeURIComponent(
    event?.title ? `${event.title} — ${EVENT_VENUE_LOCATION_PENDING}` : EVENT_VENUE_LOCATION_PENDING,
  )
}

/** For "Get Directions", prefer full venue address text (more accurate than stale coordinates). */
export function getDirectionsDestination(event: any): string {
  const v = event?.venue
  const street = v?.venueAddress || v?.address || v?.streetAddress || ""
  const city = v?.venueCity || v?.city || ""
  const state = v?.venueState || v?.state || ""
  const postal = v?.venueZipCode || v?.zipCode || ""
  const country = v?.venueCountry || v?.country || ""
  const fullVenueAddress = [street, city, state, postal, country]
    .filter((p) => p && String(p).trim() !== "")
    .join(", ")
    .trim()

  if (fullVenueAddress) return encodeURIComponent(fullVenueAddress)
  return getMapAddress(event)
}

/** True when the displayed address should open in an external maps app. */
export function canLinkAddressToMaps(event: any): boolean {
  const d = getDisplayAddress(event)
  if (d === EVENT_VENUE_LOCATION_PENDING) return false
  if (d === "Online event" || d.startsWith("Online event (")) return false
  return true
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

export function formatDateTimeRange(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const isSameDay = start.toDateString() === end.toDateString()

  if (isSameDay) {
    return `${formatDate(startDate)}, ${formatTime(startDate)} - ${formatTime(endDate)}`
  }
  return `${formatDate(startDate)} ${formatTime(startDate)} - ${formatDate(endDate)} ${formatTime(endDate)}`
}

export function getTicketPriceDisplay(event: any) {
  return formatPublicTicketPriceLine(event.ticketTypes as TicketType[])
}
