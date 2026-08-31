import { countryMatchNeedles, countryMatchesValue } from "@/lib/home-location"
import { buildResolvedHomeLocation } from "@/lib/home-location"
import { countryNameFromCode } from "@/lib/country-data"
import type { GeoHint } from "@/lib/browse-geo"

/** 3 cards × 7 rows per page */
export const VENUES_PER_PAGE = 21
export const VENUES_LISTING_REVALIDATE_SEC = 120

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

export function mapApiVenueToPublic(raw: unknown): PublicVenue | null {
  if (!raw || typeof raw !== "object") return null
  const v = raw as Record<string, unknown>
  if (typeof v.id !== "string" || !v.id) return null

  const images = Array.isArray(v.venueImages)
    ? v.venueImages.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    : Array.isArray(v.images)
      ? v.images.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      : []
  const venueName =
    String(v.venueName ?? v.name ?? "").trim() ||
    String(v.company ?? "").trim() ||
    "Unnamed Venue"

  return {
    id: v.id,
    venueName,
    logo: String(v.logo ?? v.avatar ?? ""),
    contactPerson: "",
    address: String(v.venueAddress ?? v.address ?? ""),
    city: String(v.venueCity ?? v.city ?? ""),
    state: String(v.venueState ?? v.state ?? ""),
    country: String(v.venueCountry ?? v.country ?? ""),
    website: "",
    description: "",
    maxCapacity: Number(v.maxCapacity) || 0,
    totalHalls: Number(v.totalHalls) || 0,
    totalEvents: Number(v.totalEvents ?? v.eventCount) || 0,
    activeBookings: 0,
    averageRating: Number(v.averageRating ?? v.rating) || 0,
    totalReviews: Number(v.totalReviews ?? v.reviewCount) || 0,
    amenities: [],
    meetingSpaces: [],
    isVerified: true,
    venueImages: images.slice(0, 4),
  }
}

export function extractVenuesFromApiPayload(data: unknown): {
  venues: PublicVenue[]
  total: number
  totalPages: number
} {
  const payload = data && typeof data === "object" ? (data as Record<string, unknown>) : {}
  const rawList = Array.isArray(payload.venues)
    ? payload.venues
    : Array.isArray(payload.data)
      ? payload.data
      : []
  const venues = rawList.map(mapApiVenueToPublic).filter((v): v is PublicVenue => !!v)
  const pagination =
    payload.pagination && typeof payload.pagination === "object"
      ? (payload.pagination as { total?: number; totalPages?: number; limit?: number })
      : null
  const total = Number(pagination?.total) || venues.length
  const totalPages = Math.max(
    1,
    Number(pagination?.totalPages) || Math.ceil(total / VENUES_PER_PAGE) || 1,
  )
  return { venues, total, totalPages }
}

export function buildVenuesListingQuery(params: {
  page: number
  search: string
  cities: string[]
  countries: string[]
  visitorGeo: GeoHint | null
  limit?: number
}) {
  const qs = new URLSearchParams()
  qs.set("page", String(params.page))
  qs.set("limit", String(params.limit ?? VENUES_PER_PAGE))
  const q = params.search.trim()
  if (q) qs.set("search", q)
  if (params.countries.length) qs.set("country", params.countries.join(","))
  if (params.cities.length) qs.set("city", params.cities.join(","))
  if (params.countries.length === 0 && params.visitorGeo) {
    if (params.visitorGeo.countryName?.trim()) {
      qs.set("prioritizeCountry", params.visitorGeo.countryName.trim())
    }
    if (params.visitorGeo.countryCode?.trim()) {
      qs.set("prioritizeCountryCode", params.visitorGeo.countryCode.trim())
    }
    if (params.visitorGeo.city?.trim()) {
      qs.set("prioritizeCity", params.visitorGeo.city.trim())
    }
  }
  return qs.toString()
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
