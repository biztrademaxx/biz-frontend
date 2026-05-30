import {
  countryScopedHomeLocation,
  filterByHomeCountryPrioritizeCity,
  getOrganizerCityLabel,
  getOrganizerCountryLabel,
} from "@/lib/home-location"
import { resolveHomeLocation } from "@/lib/home-location-server"
import { filterOrganizersWithProfileImage } from "./organizer-visibility"
import { normalizeOrganizersFromApiPayload } from "./normalize-organizers-envelope"
import type { OrganizerListEntry } from "./types"

const FEATURED_STRIP_MAX = 20

const organizerLocationGetters = {
  getCity: getOrganizerCityLabel,
  getCountry: getOrganizerCountryLabel,
}

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
}

function buildFeaturedOrganizersPath(loc: Awaited<ReturnType<typeof resolveHomeLocation>>): string {
  const qs = new URLSearchParams()
  qs.set("requireProfileImage", "1")
  const country = loc.countryName?.trim()
  if (country) qs.set("country", country)
  return `/api/organizers?${qs.toString()}`
}

export interface FeaturedOrganizersServerResult {
  organizers: OrganizerListEntry[]
  fetchFailed: boolean
}

export async function fetchFeaturedOrganizersForHomeServer(): Promise<FeaturedOrganizersServerResult> {
  const empty: FeaturedOrganizersServerResult = { organizers: [], fetchFailed: true }
  try {
    const loc = await resolveHomeLocation()
    const path = buildFeaturedOrganizersPath(loc)
    const res = await fetch(`${getApiBaseUrl()}${path}`, { next: { revalidate: 120 } })
    if (!res.ok) {
      console.error("Featured organizers fetch failed:", res.status)
      return empty
    }
    const data: unknown = await res.json()
    const list = filterOrganizersWithProfileImage(normalizeOrganizersFromApiPayload(data))

    let filtered = filterByHomeCountryPrioritizeCity(list, loc, organizerLocationGetters)

    if (filtered.length === 0 && list.length > 0) {
      filtered = filterByHomeCountryPrioritizeCity(
        list,
        countryScopedHomeLocation(loc),
        organizerLocationGetters,
      )
    }

    filtered = filtered.slice(0, FEATURED_STRIP_MAX)

    return { organizers: filtered, fetchFailed: false }
  } catch (e) {
    console.error("Featured organizers fetch error:", e)
    return empty
  }
}
