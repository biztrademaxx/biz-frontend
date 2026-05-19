import { filterByHomeLocation } from "@/lib/home-location"
import { resolveHomeLocation } from "@/lib/home-location-server"
import { normalizeFeaturedSpeakerTile } from "./normalize-featured-speaker"
import type { FeaturedSpeakerTile } from "./types"

const PATH = "/api/speakers?requireProfileImage=1"

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
}

export async function fetchFeaturedSpeakersForHomeServer(): Promise<FeaturedSpeakerTile[]> {
  try {
    const res = await fetch(`${getApiBaseUrl()}${PATH}`, { next: { revalidate: 120 } })
    if (!res.ok) return []
    const data: unknown = await res.json()
    const rawList: unknown[] = Array.isArray((data as { speakers?: unknown[] })?.speakers)
      ? ((data as { speakers: unknown[] }).speakers)
      : []
    const out: FeaturedSpeakerTile[] = []
    for (const row of rawList) {
      const s = normalizeFeaturedSpeakerTile(row)
      if (s) out.push(s)
    }
    const loc = await resolveHomeLocation()
    return filterByHomeLocation(out, loc, {
      getCity: (s) => s.location,
      getCountry: (s) => s.location,
    })
  } catch (e) {
    console.error("fetchFeaturedSpeakersForHomeServer:", e)
    return []
  }
}
