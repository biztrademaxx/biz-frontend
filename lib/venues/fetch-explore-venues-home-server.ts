import { filterByHomeCountryPrioritizeCity } from "@/lib/home-location"
import { resolveHomeLocation } from "@/lib/home-location-server"
import { fetchAllVenuesServer } from "./fetch-all-venues-server"
import type { ExploreVenueCard } from "./types"

const HOME_VENUE_CARD_LIMIT = 6

const venueLocationGetters = {
  getCity: (v: ExploreVenueCard) => v.locationHay || v.city,
  getCountry: (v: ExploreVenueCard) => v.country,
}

export async function fetchExploreVenuesForHomeServer(): Promise<ExploreVenueCard[]> {
  try {
    const all = await fetchAllVenuesServer()
    if (all.length === 0) return []

    const loc = await resolveHomeLocation()
    const inVisitorCountry = filterByHomeCountryPrioritizeCity(all, loc, venueLocationGetters)

    return inVisitorCountry.slice(0, HOME_VENUE_CARD_LIMIT)
  } catch (e) {
    console.error("fetchExploreVenuesForHomeServer:", e)
    return []
  }
}
