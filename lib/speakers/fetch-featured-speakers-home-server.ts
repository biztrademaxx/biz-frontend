import { EMPTY_HOME_LOCATION, filterByHomeCountryPrioritizeCity } from "@/lib/home-location"
import { resolveHomeLocation } from "@/lib/home-location-server"
import { normalizeFeaturedSpeakerTile } from "./normalize-featured-speaker"
import {
  getFeaturedSpeakerCityLabel,
  getFeaturedSpeakerCountryLabel,
} from "./speaker-location-labels"
import type { FeaturedSpeakerTile } from "./types"

const PATH = "/api/speakers?requireProfileImage=1"
const HOME_SPEAKER_STRIP_LIMIT = 24

const speakerLocationGetters = {
  getCity: getFeaturedSpeakerCityLabel,
  getCountry: getFeaturedSpeakerCountryLabel,
}

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
    let filtered = filterByHomeCountryPrioritizeCity(out, loc, speakerLocationGetters)

    const hasCountryScope = Boolean(loc.countryCode?.trim() || loc.countryName?.trim())
    if (filtered.length === 0 && hasCountryScope && out.length > 0) {
      filtered = filterByHomeCountryPrioritizeCity(out, { ...EMPTY_HOME_LOCATION, city: loc.city }, speakerLocationGetters)
    }

    return filtered.slice(0, HOME_SPEAKER_STRIP_LIMIT)
  } catch (e) {
    console.error("fetchFeaturedSpeakersForHomeServer:", e)
    return []
  }
}
