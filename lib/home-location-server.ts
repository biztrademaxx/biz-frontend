import "server-only"

import { cache } from "react"
import { cookies } from "next/headers"
import { fetchGeoHintServer } from "@/lib/browse-geo-server"
import { countryNameFromCode } from "@/lib/geo-from-request"
import {
  buildResolvedHomeLocation,
  EMPTY_HOME_LOCATION,
  HOME_CITY_COOKIE,
  HOME_LOCATION_AUTO_COOKIE,
  type ResolvedHomeLocation,
} from "@/lib/home-location"

function parseCookieValue(value: string): { city: string | null; countryCode: string | null } {
  const v = value.trim()
  if (/^[A-Za-z]{2}$/.test(v)) {
    return { city: null, countryCode: v.toUpperCase() }
  }
  return { city: v, countryCode: null }
}

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
      const parsed = parseCookieValue(cookieVal)
      return buildResolvedHomeLocation({
        city: parsed.city,
        countryCode: parsed.countryCode,
        countryName: parsed.countryCode ? countryNameFromCode(parsed.countryCode) : parsed.city,
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

export async function getHomeLocationDisplayLabel(): Promise<string | null> {
  const loc = await resolveHomeLocation()
  return loc.displayLabel
}
