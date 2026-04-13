import { fetchGeoHintServer } from "@/lib/browse-geo-server"
import { getBackendUrlForServerFetch } from "@/lib/server-backend-url"
import { buildCityEventCounts } from "./build-city-event-counts"
import { normalizeCitiesListResponse } from "./normalize-cities-response"
import { normalizeEventsListResponse } from "./normalize-events-list-response"
import { pickCitiesForHome } from "./pick-cities-for-home"
import type { BrowseByCityServerPayload } from "./types"

const CITIES_PATH = "/api/location/cities"
const EVENTS_PATH = "/api/events?limit=500"

/**
 * Loads cities, event rows for city-name aggregation, and geo; returns safe defaults on failure.
 */
export async function fetchBrowseByCityServerPayload(): Promise<BrowseByCityServerPayload> {
  const empty: BrowseByCityServerPayload = {
    displayCities: [],
    cityEventCounts: {},
  }

  try {
    const base = getBackendUrlForServerFetch()
    const [citiesRes, eventsRes, geo] = await Promise.all([
      fetch(`${base}${CITIES_PATH}`, { cache: "no-store" }).catch(() => null),
      fetch(`${base}${EVENTS_PATH}`, { cache: "no-store" }).catch(() => null),
      fetchGeoHintServer(),
    ])

    if (!citiesRes?.ok) {
      console.error(
        "fetchBrowseByCityServerPayload: cities request failed",
        citiesRes?.status,
        base + CITIES_PATH,
      )
    }
    if (!eventsRes?.ok) {
      console.error(
        "fetchBrowseByCityServerPayload: events request failed",
        eventsRes?.status,
        base + EVENTS_PATH,
      )
    }

    // All active cities from the API; backend filters `isActive`. Same rationale as countries.
    const cities = citiesRes?.ok ? normalizeCitiesListResponse(await citiesRes.json()) : []

    const citiesSorted = [...cities].sort((a, b) => {
      const ca = a.eventCount ?? 0
      const cb = b.eventCount ?? 0
      if (cb !== ca) return cb - ca
      return a.name.localeCompare(b.name)
    })

    let eventsList: unknown[] = []
    if (eventsRes?.ok) {
      const data: unknown = await eventsRes.json()
      eventsList = normalizeEventsListResponse(data)
    }

    const cityEventCounts = buildCityEventCounts(eventsList)
    const displayCities = pickCitiesForHome(citiesSorted, geo)

    return {
      displayCities,
      cityEventCounts,
    }
  } catch (error) {
    console.error("fetchBrowseByCityServerPayload:", error)
    return empty
  }
}
