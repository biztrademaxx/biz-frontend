import { normalizeExploreVenue } from "./normalize-explore-venue"
import type { ExploreVenueCard } from "./types"

const PATH = "/api/venues?requireVenueImage=1&limit=24"

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
}

export async function fetchExploreVenuesForHomeServer(): Promise<ExploreVenueCard[]> {
  try {
    const res = await fetch(`${getApiBaseUrl()}${PATH}`, { cache: "no-store" })
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
    return out
  } catch (e) {
    console.error("fetchExploreVenuesForHomeServer:", e)
    return []
  }
}
