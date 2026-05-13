/** Prefer structured organizer location; fall back to legacy free-text fields. */
export function formatOrganizerLocationLine(
  organizer:
    | {
        organizerCity?: string | null
        organizerState?: string | null
        organizerCountry?: string | null
        headquarters?: string | null
        location?: string | null
      }
    | null
    | undefined,
): string {
  if (!organizer) return ""
  const city = String(organizer.organizerCity ?? "").trim()
  const state = String(organizer.organizerState ?? "").trim()
  const country = String(organizer.organizerCountry ?? "").trim()
  if (city || state || country) {
    return [city, state, country].filter(Boolean).join(", ")
  }
  return String(organizer.headquarters ?? "").trim() || String(organizer.location ?? "").trim()
}

/** Public cards: city + country only (no state). Same legacy fallbacks when structured fields are empty. */
export function formatOrganizerCityCountryLine(
  organizer:
    | {
        organizerCity?: string | null
        organizerCountry?: string | null
        headquarters?: string | null
        location?: string | null
      }
    | null
    | undefined,
): string {
  if (!organizer) return ""
  const city = String(organizer.organizerCity ?? "").trim()
  const country = String(organizer.organizerCountry ?? "").trim()
  if (city || country) {
    return [city, country].filter(Boolean).join(", ")
  }
  return String(organizer.headquarters ?? "").trim() || String(organizer.location ?? "").trim()
}
