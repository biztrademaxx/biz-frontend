import { filterByHomeLocation } from "@/lib/home-location"
import { resolveHomeLocation } from "@/lib/home-location-server"
import { normalizeExploreVenue } from "./normalize-explore-venue"
import type { ExploreVenueCard } from "./types"

const PATH = "/api/venues?requireVenueImage=1&limit=24"

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
}

export async function fetchExploreVenuesForHomeServer(): Promise<ExploreVenueCard[]> {
  try {
    const res = await fetch(`${getApiBaseUrl()}${PATH}`, { next: { revalidate: 120 } })
    if (!res.ok) return []
    const data: unknown = await res.json()
    const rawList: unknown[] =
      data && typeof data === "object" && !Array.isArray(data) && Array.isArray((data as { data?: unknown[] }).data)
        ? ((data as { data: unknown[] }).data)
        : Array.isArray(data)
          ? data
          : []
    const out: ExploreVenueCard[] = []
    for (const row of rawList) {
      const v = normalizeExploreVenue(row)
      if (v) out.push(v)
    }
    const loc = await resolveHomeLocation()
    return filterByHomeLocation(out, loc, {
      getCity: (v) => v.city,
      getCountry: (v) => v.city,
    })
  } catch (e) {
    console.error("fetchExploreVenuesForHomeServer:", e)
    return []
  }
}
