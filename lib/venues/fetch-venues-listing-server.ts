import "server-only"

import { cookies, headers } from "next/headers"
import type { GeoHint } from "@/lib/browse-geo"
import { HOME_CITY_COOKIE } from "@/lib/home-location"
import { geoFromEdgeHeaders, geoFromHomeLocationCookie } from "@/lib/geo-from-request"
import { getBackendUrlForServerFetch } from "@/lib/server-backend-url"
import {
  buildVenuesListingQuery,
  extractVenuesFromApiPayload,
  VENUES_LISTING_REVALIDATE_SEC,
  VENUES_PER_PAGE,
  type PublicVenue,
} from "@/app/venues/lib/venues-listing"

export type VenuesListingServerResult = {
  venues: PublicVenue[]
  total: number
  totalPages: number
  visitorGeo: GeoHint | null
}

async function resolveVenuesListingGeo(): Promise<GeoHint | null> {
  try {
    const [h, jar] = await Promise.all([headers(), cookies()])
    const edge = geoFromEdgeHeaders(h)
    const cookieGeo = geoFromHomeLocationCookie(jar.get(HOME_CITY_COOKIE)?.value)
    if (!edge && !cookieGeo) return null
    return {
      city: cookieGeo?.city || edge?.city || null,
      region: edge?.region || cookieGeo?.region || null,
      countryCode: cookieGeo?.countryCode || edge?.countryCode || null,
      countryName: cookieGeo?.countryName || edge?.countryName || null,
    }
  } catch {
    return null
  }
}

export async function fetchVenuesListingServer(): Promise<VenuesListingServerResult> {
  const empty: VenuesListingServerResult = {
    venues: [],
    total: 0,
    totalPages: 1,
    visitorGeo: null,
  }

  try {
    const visitorGeo = await resolveVenuesListingGeo()
    const qs = buildVenuesListingQuery({
      page: 1,
      search: "",
      cities: [],
      countries: [],
      visitorGeo,
      limit: VENUES_PER_PAGE,
    })
    const res = await fetch(`${getBackendUrlForServerFetch()}/api/venues?${qs}`, {
      next: { revalidate: VENUES_LISTING_REVALIDATE_SEC },
    })
    if (!res.ok) return { ...empty, visitorGeo }
    const parsed = extractVenuesFromApiPayload(await res.json())
    return { ...parsed, visitorGeo }
  } catch (e) {
    console.error("fetchVenuesListingServer:", e)
    return empty
  }
}
