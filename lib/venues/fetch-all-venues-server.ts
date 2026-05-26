import { normalizeExploreVenue } from "./normalize-explore-venue"
import type { ExploreVenueCard } from "./types"

const PAGE_SIZE = 100

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

/** Load all verified public venues from the API (paginated). */
export async function fetchAllVenuesServer(): Promise<ExploreVenueCard[]> {
  let page = 1
  let totalPages = 1
  const all: ExploreVenueCard[] = []

  do {
    const res = await fetch(`${getApiBaseUrl()}/api/venues?limit=${PAGE_SIZE}&page=${page}`, {
      next: { revalidate: 120 },
    })
    if (!res.ok) break

    const data: unknown = await res.json()
    const rawList = extractVenueRows(data)
    for (const row of rawList) {
      const v = normalizeExploreVenue(row)
      if (v) all.push(v)
    }

    const pagination =
      data && typeof data === "object" && "pagination" in data
        ? (data as { pagination?: { totalPages?: number } }).pagination
        : null
    totalPages = Math.max(1, Number(pagination?.totalPages) || 1)
    page += 1
  } while (page <= totalPages)

  return all
}
