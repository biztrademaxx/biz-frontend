import { fetchGeoHintServer } from "@/lib/browse-geo-server"
import { getBackendUrlForServerFetch } from "@/lib/server-backend-url"
import { normalizeCountriesListResponse } from "./normalize-countries-response"
import { pickCountriesForHome } from "./pick-countries-for-home"
import type { BrowseByCountryServerPayload } from "./types"

const COUNTRIES_PATH = "/api/location/countries"

/**
 * Loads countries and geo; returns safe defaults on failure.
 */
export async function fetchBrowseByCountryServerPayload(): Promise<BrowseByCountryServerPayload> {
  const empty: BrowseByCountryServerPayload = {
    displayCountries: [],
  }

  try {
    const base = getBackendUrlForServerFetch()
    const [countriesRes, geo] = await Promise.all([
      fetch(`${base}${COUNTRIES_PATH}`, { cache: "no-store" }).catch(() => null),
      fetchGeoHintServer(),
    ])

    if (!countriesRes?.ok) {
      console.error(
        "fetchBrowseByCountryServerPayload: countries request failed",
        countriesRes?.status,
        base + COUNTRIES_PATH,
      )
    }

    // Use all active countries from the API (backend already filters `isActive`).
    // Do not shrink to `isPermitted` only — that often leaves far fewer than 12 tiles.
    const countries = countriesRes?.ok ? normalizeCountriesListResponse(await countriesRes.json()) : []

    const byEventsThenName = [...countries].sort((a, b) => {
      const ca = a.eventCount ?? 0
      const cb = b.eventCount ?? 0
      if (cb !== ca) return cb - ca
      return a.name.localeCompare(b.name)
    })

    const displayCountries = pickCountriesForHome(byEventsThenName, geo)

    return { displayCountries }
  } catch (error) {
    console.error("fetchBrowseByCountryServerPayload:", error)
    return empty
  }
}
