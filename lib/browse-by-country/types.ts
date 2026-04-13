/** Normalized country row for the home “Browse events by country” section. */
export interface PublicBrowseCountry {
  id: string
  name: string
  code: string | null
  flag: string | null
  isPublic: boolean
  /** Backend-provided count when present. */
  eventCount: number | null
}

/** Serializable props assembled on the server for the client grid. */
export interface BrowseByCountryServerPayload {
  displayCountries: PublicBrowseCountry[]
}
