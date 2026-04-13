/** Normalized city row for the home “Browse events by city” section. */
export interface PublicBrowseCity {
  id: string
  name: string
  image: string | null
  countryCode: string | null
  countryName: string | null
  isPublic: boolean
  /** Backend-provided count when present. */
  eventCount: number | null
}

/** Serializable props assembled on the server for the client grid. */
export interface BrowseByCityServerPayload {
  displayCities: PublicBrowseCity[]
  /** Lowercase trimmed city name → event count from aggregated events list. */
  cityEventCounts: Record<string, number>
}
