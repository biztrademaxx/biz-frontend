import "server-only"

import { cookies, headers } from "next/headers"
import type { GeoHint } from "@/lib/browse-geo"
import { HOME_CITY_COOKIE } from "@/lib/home-location"
import { geoFromEdgeHeaders, geoFromHomeLocationCookie } from "@/lib/geo-from-request"
import { getBackendUrlForServerFetch } from "@/lib/server-backend-url"
import {
  buildOrganizersListingQuery,
  EMPTY_ORGANIZER_FACETS,
  normalizeOrganizerFacetsPayload,
  ORGANIZERS_LISTING_PAGE_SIZE,
  ORGANIZERS_LISTING_REVALIDATE_SEC,
  type OrganizersListingServerResult,
  type PublicOrganizerCard,
} from "./organizers-listing-query"

function isOrganizerCard(row: unknown): row is PublicOrganizerCard {
  if (!row || typeof row !== "object") return false
  const r = row as Record<string, unknown>
  return typeof r.id === "string"
}

/** Instant geo from CDN / location cookie — no ipapi round-trip on first paint. */
async function resolveOrganizersListingGeo(): Promise<GeoHint | null> {
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

export async function fetchOrganizersListingServer(): Promise<OrganizersListingServerResult> {
  const empty: OrganizersListingServerResult = {
    organizers: [],
    total: 0,
    totalPages: 1,
    facets: EMPTY_ORGANIZER_FACETS,
    visitorGeo: null,
  }

  try {
    const visitorGeo = await resolveOrganizersListingGeo()
    const base = getBackendUrlForServerFetch()
    const listQuery = buildOrganizersListingQuery({
      page: 1,
      search: "",
      cities: [],
      countries: [],
      eventBuckets: [],
      followerBuckets: [],
      visitorGeo,
      limit: ORGANIZERS_LISTING_PAGE_SIZE,
    })

    const [listRes, facetsRes] = await Promise.all([
      fetch(`${base}/api/organizers?${listQuery}`, {
        next: { revalidate: ORGANIZERS_LISTING_REVALIDATE_SEC },
      }),
      fetch(`${base}/api/organizers/facets`, {
        next: { revalidate: 300 },
      }),
    ])

    let organizers: PublicOrganizerCard[] = []
    let total = 0
    let totalPages = 1
    if (listRes.ok) {
      const payload = (await listRes.json()) as {
        organizers?: unknown[]
        total?: number
        totalPages?: number
      }
      organizers = Array.isArray(payload.organizers)
        ? payload.organizers.filter(isOrganizerCard)
        : []
      total = Number(payload.total) || 0
      totalPages = Number(payload.totalPages) || 1
    }

    const facets = facetsRes.ok
      ? normalizeOrganizerFacetsPayload(await facetsRes.json())
      : EMPTY_ORGANIZER_FACETS

    return { organizers, total, totalPages, facets, visitorGeo }
  } catch (e) {
    console.error("fetchOrganizersListingServer:", e)
    return empty
  }
}
