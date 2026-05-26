import { countryMatchNeedles, countryMatchesValue } from "@/lib/home-location"
import { buildResolvedHomeLocation } from "@/lib/home-location"
import { countryNameFromCode } from "@/lib/country-data"
import type { GeoHint } from "@/lib/browse-geo"

/** 3 cards × 7 rows per page */
export const VENUES_PER_PAGE = 21

export type PublicVenue = {
  id: string
  venueName: string
  logo: string
  contactPerson: string
  address: string
  city: string
  state: string
  country: string
  website: string
  description: string
  maxCapacity: number
  totalHalls: number
  totalEvents: number
  activeBookings: number
  averageRating: number
  totalReviews: number
  amenities: string[]
  meetingSpaces: unknown[]
  isVerified: boolean
  venueImages: string[]
}

const PAGE_SIZE = 100

export const DEFAULT_POPULAR_CITIES = [
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Gurgaon",
  "Noida",
  "Mumbai",
  "Delhi",
  "Kolkata",
]

export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  Australia: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
  India: DEFAULT_POPULAR_CITIES,
  "United States": ["New York", "Los Angeles", "Chicago", "Houston", "Las Vegas"],
  "United Kingdom": ["London", "Manchester", "Birmingham", "Edinburgh"],
  Canada: ["Toronto", "Vancouver", "Montreal", "Calgary"],
  Germany: ["Berlin", "Munich", "Frankfurt", "Hamburg"],
  France: ["Paris", "Lyon", "Marseille"],
  Japan: ["Tokyo", "Osaka", "Yokohama"],
  Singapore: ["Singapore"],
}

export const POPULAR_COUNTRIES = [
  "United States",
  "India",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "Brazil",
  "South Korea",
  "Italy",
  "South Africa",
] as const

export type PopularCountryName = (typeof POPULAR_COUNTRIES)[number]

function isIsoCountryCode(value: string): boolean {
  return /^[A-Za-z]{2}$/.test(value.trim())
}

/** Always return a full country name for UI (never ISO codes like AU, US). */
export function displayCountryLabel(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim()
  if (!trimmed) return null
  if (isIsoCountryCode(trimmed)) {
    return countryNameFromCode(trimmed) ?? trimmed
  }
  const fromList = POPULAR_COUNTRIES.find((c) => c.toLowerCase() === trimmed.toLowerCase())
  return fromList ?? trimmed
}

export function popularCitiesForGeo(geo: GeoHint | null): string[] {
  const name = geo?.countryName?.trim()
  if (name && CITIES_BY_COUNTRY[name]) return CITIES_BY_COUNTRY[name]
  return DEFAULT_POPULAR_CITIES
}

/** Resolve geo country name to a label in POPULAR_COUNTRIES when possible. */
export function resolvePopularCountryName(geo: GeoHint | null): string | null {
  if (!geo) return null
  const fromName = displayCountryLabel(geo.countryName)
  if (fromName) {
    const exact = POPULAR_COUNTRIES.find((c) => c.toLowerCase() === fromName.toLowerCase())
    if (exact) return exact
    return fromName
  }
  if (geo.countryCode) {
    return displayCountryLabel(geo.countryCode)
  }
  return null
}

export async function fetchAllPublicVenues(): Promise<PublicVenue[]> {
  let page = 1
  let totalPages = 1
  const all: PublicVenue[] = []

  do {
    const response = await fetch(`/api/venues?limit=${PAGE_SIZE}&page=${page}`, { cache: "no-store" })
    if (!response.ok) throw new Error("Failed to fetch venues")

    const data = await response.json()
    const list: PublicVenue[] = Array.isArray(data.venues)
      ? data.venues
      : Array.isArray(data.data)
        ? data.data
        : []

    all.push(...list)
    totalPages = Math.max(1, Number(data.pagination?.totalPages) || 1)
    page += 1
  } while (page <= totalPages)

  return all
}

function countryNeedlesForFilter(countryLabel: string): string[] {
  const loc = buildResolvedHomeLocation({
    countryName: countryLabel,
    countryCode: null,
    city: null,
    isManual: true,
  })
  return countryMatchNeedles(loc)
}

export function venueMatchesCountry(venueCountry: string, selectedCountries: string[]): boolean {
  if (selectedCountries.length === 0) return true
  const hay = venueCountry || ""
  return selectedCountries.some((label) => countryMatchesValue(hay, countryNeedlesForFilter(label)))
}

export function venueMatchesCity(
  city: string,
  address: string,
  selectedCities: string[],
): boolean {
  if (selectedCities.length === 0) return true
  const hay = `${city} ${address}`.toLowerCase()
  return selectedCities.some((selected) => {
    const needle = selected.trim().toLowerCase()
    return hay.includes(needle)
  })
}

export function paginateVenues<T>(items: T[], page: number, perPage: number): T[] {
  const safePage = Math.max(1, page)
  const start = (safePage - 1) * perPage
  return items.slice(start, start + perPage)
}

/** Put venues matching the visitor's country first; keep relative order within each group. */
export function sortVenuesByGeoCountry(
  venues: PublicVenue[],
  geoCountryLabel: string | null,
): PublicVenue[] {
  if (!geoCountryLabel?.trim()) return venues

  const local: PublicVenue[] = []
  const other: PublicVenue[] = []

  for (const venue of venues) {
    if (venueMatchesCountry(venue.country || "", [geoCountryLabel])) {
      local.push(venue)
    } else {
      other.push(venue)
    }
  }

  return [...local, ...other]
}

export function filterPublicVenues(
  venues: PublicVenue[],
  opts: {
    searchQuery: string
    selectedCities: string[]
    selectedCountries: string[]
  },
): PublicVenue[] {
  const q = opts.searchQuery.trim().toLowerCase()

  return venues.filter((venue) => {
    const name = (venue.venueName?.trim() || "Unnamed Venue").toLowerCase()
    const address = [venue.address, venue.city, venue.state, venue.country]
      .filter(Boolean)
      .join(", ")
      .toLowerCase()

    const matchesSearch =
      !q ||
      name.includes(q) ||
      address.includes(q) ||
      (venue.city || "").toLowerCase().includes(q) ||
      (venue.country || "").toLowerCase().includes(q)

    const matchesCity = venueMatchesCity(venue.city || "", address, opts.selectedCities)
    const matchesCountry = venueMatchesCountry(venue.country || "", opts.selectedCountries)

    return matchesSearch && matchesCity && matchesCountry
  })
}
