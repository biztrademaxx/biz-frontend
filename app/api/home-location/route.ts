import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { fetchGeoHintServer } from "@/lib/browse-geo-server"
import {
  geoFromHomeLocationCookie,
  geoToCookieValue,
  countryNameFromCode,
} from "@/lib/geo-from-request"
import type { GeoHint } from "@/lib/browse-geo"
import { resolveCountryForCityName } from "@/lib/city-country"
import { buildResolvedHomeLocation, HOME_CITY_COOKIE, HOME_LOCATION_AUTO_COOKIE } from "@/lib/home-location"

export const dynamic = "force-dynamic"

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function jsonFromResolved(
  loc: ReturnType<typeof buildResolvedHomeLocation>,
  auto: boolean,
  primed = false,
) {
  return {
    city: loc.city,
    countryCode: loc.countryCode,
    countryName: loc.countryName,
    displayLabel: loc.displayLabel,
    auto,
    /** True only when this response just set the cookie from IP detection. */
    primed,
  }
}

function setLocationCookies(
  res: NextResponse,
  value: string,
  isAuto: boolean,
) {
  res.cookies.set(HOME_CITY_COOKIE, value, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
  })
  if (isAuto) {
    res.cookies.set(HOME_LOCATION_AUTO_COOKIE, "1", {
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      sameSite: "lax",
    })
  } else {
    res.cookies.set(HOME_LOCATION_AUTO_COOKIE, "0", {
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      sameSite: "lax",
    })
  }
}

function enrichCountry(
  city: string | null,
  countryCode: string | null,
  countryName: string | null,
  isAuto: boolean,
): { countryCode: string | null; countryName: string | null } {
  if (countryCode) {
    return { countryCode, countryName: countryName ?? countryNameFromCode(countryCode) }
  }
  if (city) {
    const mapped = resolveCountryForCityName(city)
    if (mapped) return { countryCode: mapped.countryCode, countryName: mapped.countryName }
  }
  return { countryCode: null, countryName: null }
}

/** GET — detect country/city from request IP (VPN). `?refresh=1` always re-reads headers. */
export async function GET(req: Request) {
  const refresh = new URL(req.url).searchParams.get("refresh") === "1"
  const jar = await cookies()
  const previousCookie = refresh ? undefined : jar.get(HOME_CITY_COOKIE)?.value?.trim()

  const cookieRaw = jar.get(HOME_CITY_COOKIE)?.value?.trim()
  const fromServer = (await fetchGeoHintServer()) as GeoHint | null
  let geo: GeoHint = fromServer ?? {
    city: null,
    region: null,
    countryCode: null,
    countryName: null,
  }
  const fromCookie = geoFromHomeLocationCookie(cookieRaw)
  if (fromCookie) {
    geo = {
      city: geo.city ?? fromCookie.city,
      region: geo.region ?? fromCookie.region,
      countryCode: geo.countryCode ?? fromCookie.countryCode,
      countryName: geo.countryName ?? fromCookie.countryName,
    }
  }
  const cookieValue = geoToCookieValue(geo)

  if (!cookieValue && !geo.countryCode && !geo.countryName && !geo.city) {
    return NextResponse.json({
      city: null,
      countryCode: null,
      countryName: null,
      displayLabel: null,
      auto: true,
      primed: false,
    })
  }

  const enriched = enrichCountry(geo.city, geo.countryCode, geo.countryName, true)
  const loc = buildResolvedHomeLocation({
    city: geo.city,
    countryCode: enriched.countryCode ?? geo.countryCode,
    countryName: enriched.countryName ?? geo.countryName,
    isManual: false,
  })

  const storeCookie = cookieValue ?? geoToCookieValue(geo) ?? geo.countryCode ?? ""
  const primed = !previousCookie || (storeCookie.length > 0 && previousCookie !== storeCookie)
  const res = NextResponse.json(jsonFromResolved(loc, true, primed))
  if (storeCookie) setLocationCookies(res, storeCookie, true)
  return res
}

export async function POST(req: Request) {
  let city = ""
  let countryCode: string | null = null
  let countryName: string | null = null
  let isAuto = false
  try {
    const body = (await req.json()) as {
      city?: string
      countryCode?: string
      countryName?: string
      auto?: boolean
    }
    city = String(body?.city ?? "").trim()
    countryCode = body?.countryCode?.trim().toUpperCase() || null
    countryName = body?.countryName?.trim() || null
    isAuto = body?.auto === true
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const enriched = enrichCountry(city || null, countryCode, countryName, isAuto)
  countryCode = enriched.countryCode
  countryName = enriched.countryName

  const cookieValue = geoToCookieValue({
    city: city || null,
    countryCode,
    countryName,
    region: null,
  })
  if (!cookieValue) {
    return NextResponse.json({ error: "city or country is required" }, { status: 400 })
  }

  const loc = buildResolvedHomeLocation({
    city: city || null,
    countryCode,
    countryName,
    isManual: false,
  })

  const res = NextResponse.json({
    ok: true,
    ...jsonFromResolved(loc, isAuto),
  })
  setLocationCookies(res, cookieValue, isAuto)
  return res
}

export async function DELETE() {
  const res = NextResponse.json({
    ok: true,
    city: null,
    countryCode: null,
    countryName: null,
    displayLabel: null,
    auto: false,
  })
  res.cookies.set(HOME_CITY_COOKIE, "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  })
  res.cookies.set(HOME_LOCATION_AUTO_COOKIE, "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  })
  return res
}
