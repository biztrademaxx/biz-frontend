import { filterByHomeCountryPrioritizeCity } from "@/lib/home-location"
import { resolveHomeLocation } from "@/lib/home-location-server"
import { normalizeExploreVenue } from "./normalize-explore-venue"
import type { ExploreVenueCard } from "./types"

const PATH = "/api/venues?requireVenueImage=1&limit=24"

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
}

function extractVenueRows(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  if (!data || typeof data !== "object") return []
  const o = data as Record<string, unknown>
  if (Array.isArray(o.data)) return o.data
  if (Array.isArray(o.venues)) return o.venues
  return []
}

export async function fetchExploreVenuesForHomeServer(): Promise<ExploreVenueCard[]> {
  try {
    const res = await fetch(`${getApiBaseUrl()}${PATH}`, { next: { revalidate: 120 } })
    if (!res.ok) return []
    const data: unknown = await res.json()
    const rawList = extractVenueRows(data)
    const out: ExploreVenueCard[] = []
    for (const row of rawList) {
      const v = normalizeExploreVenue(row)
      if (v) out.push(v)
    }
    const loc = await resolveHomeLocation()
    return filterByHomeCountryPrioritizeCity(out, loc, {
      getCity: (v) => v.city,
      getCountry: (v) => v.country,
    })
  } catch (e) {
    console.error("fetchExploreVenuesForHomeServer:", e)
    return []
  }
}
