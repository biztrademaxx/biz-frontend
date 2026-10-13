import { NEARBY_COUNTRY_CODES } from "@/lib/browse-geo"
import { countryNameFromCode, ISO_COUNTRY_ALIASES } from "@/lib/country-data"
import { resolveCountryForCityName } from "@/lib/city-country"

export { ISO_COUNTRY_ALIASES } from "@/lib/country-data"

export const HOME_CITY_COOKIE = "biz_home_city"
export const HOME_CITY_STORAGE_KEY = "biz_home_city"
/** Set when city/country was auto-detected from IP (not manually chosen). */
export const HOME_LOCATION_AUTO_COOKIE = "biz_home_auto"

export type ResolvedHomeLocation = {
  city: string | null
  countryCode: string | null
  countryName: string | null
  nearbyCountryCodes: string[]
  /** Passed to backend `?location=` (city preferred, else country name). */
  locationQuery: string | null
  /** Human label for section headings / navbar. */
  displayLabel: string | null
  isManual: boolean
}

export const EMPTY_HOME_LOCATION: ResolvedHomeLocation = {
  city: null,
  countryCode: null,
  countryName: null,
  nearbyCountryCodes: [],
  locationQuery: null,
  displayLabel: null,
  isManual: false,
}

/** Common city aliases (e.g. Bengaluru ↔ Bangalore). */
const CITY_MATCH_ALIASES: Record<string, string[]> = {
  bengaluru: ["bangalore"],
  bangalore: ["bengaluru"],
  mumbai: ["bombay"],
  bombay: ["mumbai"],
  kolkata: ["calcutta"],
  calcutta: ["kolkata"],
  chennai: ["madras"],
  madras: ["chennai"],
}

/** Case-insensitive partial match (e.g. "Bengaluru" matches "Bengaluru, Karnataka"). */
export function cityMatches(value: string | null | undefined, city: string): boolean {
  const needle = city.trim().toLowerCase()
  if (!needle) return true
  const hay = (value ?? "").trim().toLowerCase()
  if (!hay) return false
  if (hay.includes(needle) || needle.includes(hay)) return true
  for (const alias of CITY_MATCH_ALIASES[needle] ?? []) {
    if (hay.includes(alias) || alias.includes(hay)) return true
  }
  return false
}

export function countryMatchesValue(
  value: string | null | undefined,
  needles: string[],
): boolean {
  const hay = (value ?? "").trim().toLowerCase()
  if (!hay || needles.length === 0) return false
  return needles.some((n) => countryNeedleMatchesHay(hay, n))
}

/** Build lowercase needles for the visitor's country only (no nearby-region fallback). */
export function countryMatchNeedles(loc: ResolvedHomeLocation): string[] {
  const out = new Set<string>()
  if (loc.countryName?.trim()) out.add(loc.countryName.trim().toLowerCase())
  if (loc.countryCode?.trim()) {
    const cc = loc.countryCode.trim().toUpperCase()
    out.add(cc.toLowerCase())
    for (const alias of ISO_COUNTRY_ALIASES[cc] ?? []) out.add(alias)
  }
  return [...out]
}

/** Avoid false positives (e.g. ISO `in` matching inside "singapore"). */
function countryNeedleMatchesHay(hay: string, needle: string): boolean {
  const n = needle.trim().toLowerCase()
  if (!n) return false
  if (hay === n) return true
  if (n.length <= 3) {
    const tokens = hay.split(/[\s,./|&()-]+/).filter(Boolean)
    return tokens.some((t) => t === n)
  }
  return hay.includes(n) || n.includes(hay)
}

/** Country-only scope for API `?location=` (navbar shows country; city used for ordering). */
export function countryScopedHomeLocation(loc: ResolvedHomeLocation): ResolvedHomeLocation {
  if (!loc.countryName?.trim() && !loc.countryCode?.trim()) {
    return { ...loc, city: null, locationQuery: null }
  }
  return buildResolvedHomeLocation({
    city: null,
    countryCode: loc.countryCode,
    countryName: loc.countryName,
    isManual: loc.isManual,
  })
}

export function buildResolvedHomeLocation(input: {
  city?: string | null
  countryCode?: string | null
  countryName?: string | null
  isManual?: boolean
}): ResolvedHomeLocation {
  const city = input.city?.trim() || null
  const countryCode = input.countryCode?.trim().toUpperCase() || null
  const countryName =
    input.countryName?.trim() || countryNameFromCode(countryCode) || null
  const nearbyCountryCodes = countryCode ? (NEARBY_COUNTRY_CODES[countryCode] ?? []) : []
  const locationQuery = city || countryName || null
  const displayLabel =
    city ||
    countryName ||
    (countryCode && (ISO_COUNTRY_ALIASES[countryCode]?.[0] ?? countryCode)) ||
    null
  return {
    city,
    countryCode,
    countryName,
    nearbyCountryCodes,
    locationQuery,
    displayLabel,
    isManual: input.isManual ?? false,
  }
}

export function getEventCityLabel(event: {
  city?: string | null
  venue?: { venueCity?: string | null; venueState?: string | null; venueCountry?: string | null } | null
}): string {
  if (event.city?.trim()) return event.city.trim()
  if (event.venue?.venueCity?.trim()) return event.venue.venueCity.trim()
  return ""
}

export function getEventCountryLabel(event: {
  venue?: { venueCountry?: string | null } | null
  country?: string | null
}): string {
  if (event.venue?.venueCountry?.trim()) return event.venue.venueCountry.trim()
  if (event.country?.trim()) return event.country.trim()
  return ""
}

/** When a home city is set, keep only matching rows; if none match, return empty (no silent fallback). */
export function filterByHomeCity<T>(
  items: T[],
  city: string | null | undefined,
  getCity: (item: T) => string | null | undefined,
): T[] {
  const c = city?.trim()
  if (!c) return items
  return items.filter((item) => cityMatches(getCity(item), c))
}

/** City first, then same country only (no cross-country fallback). */
export function filterByHomeLocation<T>(
  items: T[],
  loc: ResolvedHomeLocation,
  getters: {
    getCity: (item: T) => string | null | undefined
    getCountry: (item: T) => string | null | undefined
  },
): T[] {
  if (!loc.locationQuery) return items

  if (loc.city) {
    const byCity = filterByHomeCity(items, loc.city, getters.getCity)
    if (byCity.length > 0) return byCity
  }

  const needles = countryMatchNeedles(loc)
  if (needles.length === 0) return items

  return items.filter((item) => countryMatchesValue(getters.getCountry(item), needles))
}

/** Match item to visitor country (IP/geo): country field, full address line, or known city → country. */
export function matchesHomeCountry<T>(
  item: T,
  loc: ResolvedHomeLocation,
  getters: {
    getCity: (item: T) => string | null | undefined
    getCountry: (item: T) => string | null | undefined
  },
): boolean {
  const needles = countryMatchNeedles(loc)
  if (needles.length === 0) return !loc.countryCode && !loc.countryName

  const countryRaw = getters.getCountry(item)?.trim() ?? ""
  const locationLine = getters.getCity(item)?.trim() ?? ""

  if (countryRaw) {
    if (countryMatchesValue(countryRaw, needles)) return true
    if (/^[A-Za-z]{2}$/.test(countryRaw)) {
      const expanded = countryNameFromCode(countryRaw.toUpperCase())
      if (expanded && countryMatchesValue(expanded, needles)) return true
    }
  }

  if (locationLine && countryMatchesValue(locationLine, needles)) return true

  const cityLine = getters.getCity(item)?.trim() ?? ""
  if (cityLine) {
    const mappedFromCity = resolveCountryForCityName(cityLine)
    if (mappedFromCity?.countryCode === loc.countryCode) return true
  }

  if (!loc.countryCode) return false

  const cityMapped = resolveCountryForCityName(locationLine || countryRaw)
  if (cityMapped?.countryCode === loc.countryCode) return true

  return false
}

/**
 * Home sections: every item in the visitor's country (from IP), home city first when set.
 * Does not limit results to the home city only.
 */
export function filterByHomeCountryPrioritizeCity<T>(
  items: T[],
  loc: ResolvedHomeLocation,
  getters: {
    getCity: (item: T) => string | null | undefined
    getCountry: (item: T) => string | null | undefined
  },
): T[] {
  const hasCountryScope = Boolean(loc.countryCode?.trim() || loc.countryName?.trim())
  const inCountry = hasCountryScope
    ? items.filter((item) => matchesHomeCountry(item, loc, getters))
    : items

  const homeCity = loc.city?.trim()
  if (!homeCity) return inCountry

  const cityFirst: T[] = []
  const rest: T[] = []
  for (const item of inCountry) {
    if (cityMatches(getters.getCity(item), homeCity)) cityFirst.push(item)
    else rest.push(item)
  }
  return [...cityFirst, ...rest]
}

export function homeCityQueryParam(city: string | null | undefined): string {
  const c = city?.trim()
  if (!c) return ""
  return `&location=${encodeURIComponent(c)}`
}

export function homeCityLocationQuery(city: string | null | undefined): string {
  const c = city?.trim()
  if (!c) return ""
  return `location=${encodeURIComponent(c)}`
}

/** Append `?location=` or `&location=` depending on whether the URL already has query params. */
export function homeLocationQueryParam(
  loc: ResolvedHomeLocation,
  options?: { hasExistingQuery?: boolean },
): string {
  const q = loc.locationQuery?.trim()
  if (!q) return ""
  const prefix = options?.hasExistingQuery ? "&" : "?"
  return `${prefix}location=${encodeURIComponent(q)}`
}

export function homeLocationQueryString(loc: ResolvedHomeLocation): string {
  const q = loc.locationQuery?.trim()
  if (!q) return ""
  return `location=${encodeURIComponent(q)}`
}

export function getTrendingEventCityLabel(event: {
  venue?: { venueCity?: string | null } | null
  location?: { city?: string | null } | null
}): string {
  return event.venue?.venueCity?.trim() || event.location?.city?.trim() || ""
}

export function getTrendingEventCountryLabel(event: {
  venue?: { venueCountry?: string | null } | null
  location?: { country?: string | null } | null
}): string {
  return event.venue?.venueCountry?.trim() || event.location?.country?.trim() || ""
}

export function getFeaturedEventCityLabel(event: {
  city?: string | null
  venue?: { venueCity?: string | null } | null
}): string {
  return event.venue?.venueCity?.trim() || event.city?.trim() || ""
}

export function getFeaturedEventCountryLabel(event: {
  country?: string | null
  venue?: { venueCountry?: string | null } | null
}): string {
  return event.venue?.venueCountry?.trim() || event.country?.trim() || ""
}

export function getHeroSlideshowCityLabel(event: {
  venue?: { venueCity?: string | null } | null
}): string {
  return event.venue?.venueCity?.trim() || ""
}

export function getHeroSlideshowCountryLabel(event: {
  venue?: { venueCountry?: string | null } | null
}): string {
  return event.venue?.venueCountry?.trim() || ""
}

export function getOrganizerCityLabel(organizer: {
  city?: string | null
  headquarters?: string | null
  location?: string | null
}): string {
  const city = organizer.city?.trim()
  if (city) return city
  const hq = organizer.headquarters?.trim() ?? ""
  const loc = organizer.location?.trim() ?? ""
  if (hq && !/^location not specified$/i.test(hq)) return hq
  if (loc && !/^location not specified$/i.test(loc)) return loc
  return ""
}

export function getOrganizerCountryLabel(organizer: {
  city?: string | null
  country?: string | null
  headquarters?: string | null
  location?: string | null
}): string {
  const country = organizer.country?.trim()
  if (country) return country
  const hq = organizer.headquarters?.trim() ?? ""
  const loc = organizer.location?.trim() ?? ""
  if (hq && !/^location not specified$/i.test(hq)) return hq
  if (loc && !/^location not specified$/i.test(loc)) return loc
  const city = organizer.city?.trim()
  if (city) {
    const mapped = resolveCountryForCityName(city)
    if (mapped?.countryName) return mapped.countryName
  }
  return ""
}
