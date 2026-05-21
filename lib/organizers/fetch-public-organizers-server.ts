import {
  countryScopedHomeLocation,
  filterByHomeLocation,
  getOrganizerCityLabel,
  getOrganizerCountryLabel,
} from "@/lib/home-location"
import { resolveHomeLocation } from "@/lib/home-location-server"
import { filterOrganizersWithProfileImage } from "./organizer-visibility"
import { normalizeOrganizersFromApiPayload } from "./normalize-organizers-envelope"
import type { OrganizerListEntry } from "./types"

const PATH = "/api/organizers?requireProfileImage=1"

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
}

export interface FeaturedOrganizersServerResult {
  organizers: OrganizerListEntry[]
  fetchFailed: boolean
}

export async function fetchFeaturedOrganizersForHomeServer(): Promise<FeaturedOrganizersServerResult> {
  const empty: FeaturedOrganizersServerResult = { organizers: [], fetchFailed: true }
  try {
    const res = await fetch(`${getApiBaseUrl()}${PATH}`, { next: { revalidate: 120 } })
    if (!res.ok) {
      console.error("Featured organizers fetch failed:", res.status)
      return empty
    }
    const data: unknown = await res.json()
    const list = normalizeOrganizersFromApiPayload(data)
    const visible = filterOrganizersWithProfileImage(list)
    const loc = countryScopedHomeLocation(await resolveHomeLocation())
    const filtered = filterByHomeLocation(visible, loc, {
      getCity: getOrganizerCityLabel,
      getCountry: getOrganizerCountryLabel,
    })
    return { organizers: filtered, fetchFailed: false }
  } catch (e) {
    console.error("Featured organizers fetch error:", e)
    return empty
  }
}
