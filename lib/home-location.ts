export const HOME_CITY_COOKIE = "biz_home_city"
export const HOME_CITY_STORAGE_KEY = "biz_home_city"

/** Case-insensitive partial match (e.g. "Bengaluru" matches "Bengaluru, Karnataka"). */
export function cityMatches(value: string | null | undefined, city: string): boolean {
  const needle = city.trim().toLowerCase()
  if (!needle) return true
  const hay = (value ?? "").trim().toLowerCase()
  if (!hay) return false
  return hay.includes(needle) || needle.includes(hay)
}

export function getEventCityLabel(event: {
  city?: string | null
  venue?: { venueCity?: string | null; venueState?: string | null; venueCountry?: string | null } | null
}): string {
  if (event.city?.trim()) return event.city.trim()
  if (event.venue?.venueCity?.trim()) return event.venue.venueCity.trim()
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

export function getTrendingEventCityLabel(event: {
  venue?: { venueCity?: string | null } | null
  location?: { city?: string | null } | null
}): string {
  return event.venue?.venueCity?.trim() || event.location?.city?.trim() || ""
}

export function getFeaturedEventCityLabel(event: {
  venue?: { venueCity?: string | null } | null
}): string {
  return event.venue?.venueCity?.trim() || ""
}

export function getHeroSlideshowCityLabel(event: {
  venue?: { venueCity?: string | null } | null
}): string {
  return event.venue?.venueCity?.trim() || ""
}

export function getOrganizerCityLabel(organizer: {
  headquarters?: string | null
  location?: string | null
}): string {
  return organizer.headquarters?.trim() || organizer.location?.trim() || ""
}
