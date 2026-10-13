// featured-organizers-server.ts
import {
  countryScopedHomeLocation,
  filterByHomeCountryPrioritizeCity,
  getOrganizerCityLabel,
  getOrganizerCountryLabel,
} from "@/lib/home-location"
import { resolveHomeLocation } from "@/lib/home-location-server"
import { filterOrganizersWithProfileImage } from "./organizer-visibility"
import { normalizeOrganizersFromApiPayload } from "./normalize-organizers-envelope"
import type { OrganizerListEntry } from "./types"

const FEATURED_STRIP_MAX = 20

const organizerLocationGetters = {
  getCity: getOrganizerCityLabel,
  getCountry: getOrganizerCountryLabel,
}

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
}

function buildFeaturedOrganizersPath(loc: Awaited<ReturnType<typeof resolveHomeLocation>>): string {
  const qs = new URLSearchParams()
  qs.set("requireProfileImage", "1")

  // OPTION 1: Remove country filter to see all organizers including India
  // const country = loc.countryName?.trim()
  // if (country) qs.set("country", country)

  // OPTION 2: Specifically include India for testing
  // qs.set("country", "India")

  return `/api/organizers?${qs.toString()}`
}

export interface FeaturedOrganizersServerResult {
  organizers: OrganizerListEntry[]
  fetchFailed: boolean
}

export async function fetchFeaturedOrganizersForHomeServer(): Promise<FeaturedOrganizersServerResult> {
  const empty: FeaturedOrganizersServerResult = { organizers: [], fetchFailed: true }
  try {
    const loc = await resolveHomeLocation()
    console.log("📍 Home location detected:", loc)

    const path = buildFeaturedOrganizersPath(loc)
    const fullUrl = `${getApiBaseUrl()}${path}`
    console.log("🔗 Fetching from API:", fullUrl)

    const res = await fetch(fullUrl, { next: { revalidate: 120 } })
    if (!res.ok) {
      console.error("Featured organizers fetch failed:", res.status)
      return empty
    }
    const data: unknown = await res.json()

    // Log raw data before filtering
    const rawList = normalizeOrganizersFromApiPayload(data)
    console.log("📊 Raw organizers from API:", rawList.length)

    if (rawList.length > 0) {
      console.log("📝 Sample organizer:", {
        name: rawList[0].name,
        company: rawList[0].company,
        country: rawList[0].country,
        city: rawList[0].city,
        hasImage: !!(rawList[0].image || rawList[0].avatar)
      })

      // Log all countries in raw data
      const allCountries = [...new Set(rawList.map(o => o.country).filter(Boolean))]
      console.log("🌍 Countries in raw data:", allCountries)

      // Specifically check for India
      const indianOrganizers = rawList.filter(o => o.country === "India" || o.country === "IN")
      console.log("🇮🇳 Indian organizers in raw data:", indianOrganizers.length)
    }

    const withImages = filterOrganizersWithProfileImage(rawList)
    console.log("🖼️ After image filter:", withImages.length)
    console.log("❌ Removed due to no image:", rawList.length - withImages.length)

    if (withImages.length > 0) {
      const countriesWithImages = [...new Set(withImages.map(o => o.country).filter(Boolean))]
      console.log("🌍 Countries after image filter:", countriesWithImages)

      const indianWithImages = withImages.filter(o => o.country === "India" || o.country === "IN")
      console.log("🇮🇳 Indian organizers with images:", indianWithImages.length)
    }

    let filtered = filterByHomeCountryPrioritizeCity(withImages, loc, organizerLocationGetters)
    console.log("🎯 After primary location filter:", filtered.length)

    // If no results with home country, try fallback
    if (filtered.length === 0 && withImages.length > 0) {
      console.log("⚠️ No results with home country, trying fallback...")
      filtered = filterByHomeCountryPrioritizeCity(
        withImages,
        countryScopedHomeLocation(loc),
        organizerLocationGetters,
      )
      console.log("🎯 After fallback location filter:", filtered.length)
    }

    // If STILL no results, show all organizers with images (bypass location filter)
    if (filtered.length === 0 && withImages.length > 0) {
      console.log("⚠️ No results after location filters, showing all organizers with images")
      filtered = withImages
      console.log("🎯 Showing all organizers:", filtered.length)
    }

    filtered = filtered.slice(0, FEATURED_STRIP_MAX)
    console.log("✅ Final featured organizers count:", filtered.length)

    if (filtered.length > 0) {
      console.log("🏆 Final organizers:", filtered.map(o => ({
        name: o.name || o.company,
        country: o.country,
        city: o.city
      })))
    }

    return { organizers: filtered, fetchFailed: false }
  } catch (e) {
    console.error("Featured organizers fetch error:", e)
    return empty
  }
}