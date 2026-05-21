import "server-only"

import { cache } from "react"
import { cookies } from "next/headers"
import { fetchGeoHintServer } from "@/lib/browse-geo-server"
import { countryNameFromCode, parseHomeLocationCookie } from "@/lib/geo-from-request"
import {
  buildResolvedHomeLocation,
  EMPTY_HOME_LOCATION,
  HOME_CITY_COOKIE,
  HOME_LOCATION_AUTO_COOKIE,
  type ResolvedHomeLocation,
} from "@/lib/home-location"

/**
 * Resolves visitor location for home filtering:
 * 1. Manual cookie (navbar picker)
 * 2. IP geo via `/api/geo` (no browser permission)
 */
export const resolveHomeLocation = cache(async (): Promise<ResolvedHomeLocation> => {
  try {
    const jar = await cookies()
    const cookieVal = jar.get(HOME_CITY_COOKIE)?.value?.trim()
    const isAuto = jar.get(HOME_LOCATION_AUTO_COOKIE)?.value === "1"

    if (cookieVal) {
      const parsed = parseHomeLocationCookie(cookieVal)
      let countryCode = parsed.countryCode
      let countryName = countryCode ? countryNameFromCode(countryCode) : null

      if (!countryCode && parsed.city) {
        const geo = await fetchGeoHintServer()
        countryCode = geo?.countryCode?.trim().toUpperCase() || null
        countryName = geo?.countryName?.trim() || countryNameFromCode(countryCode)
      }

      return buildResolvedHomeLocation({
        city: parsed.city,
        countryCode,
        countryName,
        isManual: !isAuto,
      })
    }

    const geo = await fetchGeoHintServer()
    if (!geo?.city && !geo?.countryCode && !geo?.countryName) {
      return EMPTY_HOME_LOCATION
    }

    return buildResolvedHomeLocation({
      city: geo.city,
      countryCode: geo.countryCode,
      countryName: geo.countryName ?? countryNameFromCode(geo.countryCode),
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

/** City label for navbar only (never falls back to country). */
export async function getHomeCityDisplayLabel(): Promise<string | null> {
  const loc = await resolveHomeLocation()
  return loc.city?.trim() || null
}

/** @deprecated Prefer getHomeCityDisplayLabel (navbar) or getHomeCountryDisplayLabel (sections). */
export async function getHomeLocationDisplayLabel(): Promise<string | null> {
  return getHomeCityDisplayLabel()
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
