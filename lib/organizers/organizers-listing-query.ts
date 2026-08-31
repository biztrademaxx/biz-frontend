import type { GeoHint } from "@/lib/browse-geo"
import type { OrganizerFacets } from "@/components/organizers/organizers-filter-sidebar"

export const ORGANIZERS_LISTING_PAGE_SIZE = 20
export const ORGANIZERS_LISTING_REVALIDATE_SEC = 120

export type PublicOrganizerCard = {
  id: string
  publicSlug?: string
  name: string
  image?: string | null
  company: string
  city?: string
  country?: string
  category?: string
  eventsOrganized: number
  yearsOfExperience: number
  specialties?: string[]
  verified: boolean
  featured: boolean
  avgRating: number
  totalReviews: number
  planSlug?: string
  planTier?: string
}

export type OrganizersListingServerResult = {
  organizers: PublicOrganizerCard[]
  total: number
  totalPages: number
  facets: OrganizerFacets
  visitorGeo: GeoHint | null
}

export const EMPTY_ORGANIZER_FACETS: OrganizerFacets = {
  cities: [],
  countries: [],
  eventBuckets: [],
  followerBuckets: [],
}

export function normalizeOrganizerFacetsPayload(data: unknown): OrganizerFacets {
  if (!data || typeof data !== "object") return EMPTY_ORGANIZER_FACETS
  const raw = data as Record<string, unknown>

  const toCountItems = (arr: unknown): OrganizerFacets["cities"] => {
    if (!Array.isArray(arr)) return []
    return arr
      .map((item) => {
        if (typeof item === "string") return { value: item, label: item, count: 0 }
        const row = item as { value?: string; label?: string; count?: number }
        const value = String(row.value ?? row.label ?? "").trim()
        return {
          value,
          label: String(row.label ?? value).trim(),
          count: Number(row.count) || 0,
        }
      })
      .filter((x) => x.value)
  }

  const toBuckets = (arr: unknown): OrganizerFacets["eventBuckets"] => {
    if (!Array.isArray(arr)) return []
    return arr
      .map((item) => {
        const row = item as { id?: string; label?: string; count?: number }
        const id = String(row.id ?? "").trim()
        return {
          id,
          label: String(row.label ?? id).trim(),
          count: Number(row.count) || 0,
        }
      })
      .filter((x) => x.id)
  }

  return {
    cities: toCountItems(raw.cities),
    countries: toCountItems(raw.countries),
    eventBuckets: toBuckets(raw.eventBuckets),
    followerBuckets: toBuckets(raw.followerBuckets),
  }
}

export function buildOrganizersListingQuery(params: {
  page: number
  search: string
  cities: string[]
  countries: string[]
  eventBuckets: string[]
  followerBuckets: string[]
  visitorGeo: GeoHint | null
  limit?: number
}) {
  const qs = new URLSearchParams()
  qs.set("page", String(params.page))
  qs.set("limit", String(params.limit ?? ORGANIZERS_LISTING_PAGE_SIZE))
  const q = params.search.trim()
  if (q) qs.set("search", q)
  if (params.countries.length) qs.set("country", params.countries.join(","))
  if (params.cities.length) qs.set("city", params.cities.join(","))
  if (params.eventBuckets.length) qs.set("eventsBucket", params.eventBuckets.join(","))
  if (params.followerBuckets.length) qs.set("followersBucket", params.followerBuckets.join(","))
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
