function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * Best-effort city label from an event-like API row (venue or legacy location).
 */
export function eventCityNameFromRow(row: unknown): string {
  if (!isRecord(row)) return ""
  const venue = row.venue
  if (isRecord(venue) && typeof venue.venueCity === "string") {
    const vc = venue.venueCity.trim()
    if (vc) return vc
  }
  const loc = row.location
  if (isRecord(loc) && typeof loc.city === "string") {
    const lc = loc.city.trim()
    if (lc && lc !== "City not specified") return lc
  }
  return ""
}
