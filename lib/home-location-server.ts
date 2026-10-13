import "server-only"

import { cache } from "react"
import { cookies } from "next/headers"
import { fetchGeoHintServer } from "@/lib/browse-geo-server"
import { resolveCountryForCityName } from "@/lib/city-country"
import { countryNameFromCode, parseHomeLocationCookie } from "@/lib/geo-from-request"
import {
  buildResolvedHomeLocation,
  EMPTY_HOME_LOCATION,
  HOME_CITY_COOKIE,
  type ResolvedHomeLocation,
} from "@/lib/home-location"
import type { HomeLocationClientSeed } from "@/lib/home-location-seed"

export type { HomeLocationClientSeed } from "@/lib/home-location-seed"

/**
 * Home filtering location: always from current request IP / VPN (geo hint),
 * with cookie city as fallback when geo has no city.
 */
export const resolveHomeLocation = cache(async (): Promise<ResolvedHomeLocation> => {
  try {
    const geo = await fetchGeoHintServer()
    const jar = await cookies()
    const cookieVal = jar.get(HOME_CITY_COOKIE)?.value?.trim()
    const parsed = cookieVal ? parseHomeLocationCookie(cookieVal) : { city: null, countryCode: null }

    let countryCode =
      geo?.countryCode?.trim().toUpperCase() || parsed.countryCode?.trim().toUpperCase() || null
    let countryName =
      geo?.countryName?.trim() || countryNameFromCode(countryCode) || null
    let city = geo?.city?.trim() || parsed.city?.trim() || null

    if (!countryCode && city) {
      const mapped = resolveCountryForCityName(city)
      if (mapped) {
        countryCode = mapped.countryCode
        countryName = mapped.countryName
      }
    }

    if (!countryCode && !countryName && !city) {
      return EMPTY_HOME_LOCATION
    }

    return buildResolvedHomeLocation({
      city,
      countryCode,
      countryName,
      isManual: false,
    })
  } catch {
    return EMPTY_HOME_LOCATION
  }
})

/** @deprecated Use resolveHomeLocation().displayLabel */
export async function getHomeCityFromCookies(): Promise<string | null> {
  const loc = await resolveHomeLocation()
  return loc.displayLabel
}

/** City from IP geo (used in section empty-state copy). */
export async function getHomeCityDisplayLabel(): Promise<string | null> {
  const loc = await resolveHomeLocation()
  return loc.city?.trim() || null
}

/** @deprecated Prefer getHomeCountryDisplayLabel. */
export async function getHomeLocationDisplayLabel(): Promise<string | null> {
  return getHomeCountryDisplayLabel()
}

/** Country label for home section headings. */
export async function getHomeCountryDisplayLabel(): Promise<string | null> {
  const loc = await resolveHomeLocation()
  return (
    loc.countryName?.trim() ||
    (loc.countryCode ? countryNameFromCode(loc.countryCode) : null) ||
    null
  )
}

export async function getHomeLocationClientSeed(): Promise<HomeLocationClientSeed> {
  const loc = await resolveHomeLocation()
  const countryCode = loc.countryCode?.trim().toUpperCase() || null
  const countryName =
    loc.countryName?.trim() || (countryCode ? countryNameFromCode(countryCode) : null) || null
  return {
    city: loc.city?.trim() || null,
    countryCode,
    countryName,
  }
}
