import { cookies, headers } from "next/headers"
import { NextResponse } from "next/server"
import {
  geoFromHomeLocationCookie,
  geoToCookieValue,
  countryNameFromCode,
  resolveGeoFromHeaders,
} from "@/lib/geo-from-request"
import type { GeoHint } from "@/lib/browse-geo"
import { resolveCountryForCityName } from "@/lib/city-country"
import { buildResolvedHomeLocation, HOME_CITY_COOKIE, HOME_LOCATION_AUTO_COOKIE } from "@/lib/home-location"

async function resolveGeoForHomeLocationRequest(): Promise<GeoHint> {
  const h = await headers()
  let geo = await resolveGeoFromHeaders(h)

  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "")
  if (apiBase && !geo.countryCode && !geo.city && !geo.countryName) {
    try {
      const forward = new Headers()
      const forwarded = h.get("x-forwarded-for")
      if (forwarded) forward.set("x-forwarded-for", forwarded)
      const country = h.get("x-vercel-ip-country")
      if (country) forward.set("x-vercel-ip-country", country)
      const city = h.get("x-vercel-ip-city")
      if (city) forward.set("x-vercel-ip-city", city)
      const region = h.get("x-vercel-ip-country-region")
      if (region) forward.set("x-vercel-ip-country-region", region)

      const r = await fetch(`${apiBase}/api/geo/visitor`, {
        cache: "no-store",
        headers: forward,
        signal: AbortSignal.timeout(8_000),
      })
      if (r.ok) {
        const d = (await r.json()) as Record<string, unknown>
        geo = {
          city: typeof d.city === "string" ? d.city : null,
          region: typeof d.region === "string" ? d.region : null,
          countryCode: typeof d.countryCode === "string" ? d.countryCode : null,
          countryName: typeof d.countryName === "string" ? d.countryName : null,
        }
      }
    } catch {
      /* keep header/ipapi geo */
    }
  }

  return geo
}

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
  try {
    const refresh = new URL(req.url).searchParams.get("refresh") === "1"
    const jar = await cookies()
    const previousCookie = refresh ? undefined : jar.get(HOME_CITY_COOKIE)?.value?.trim()

    const cookieRaw = jar.get(HOME_CITY_COOKIE)?.value?.trim()
    let geo = await resolveGeoForHomeLocationRequest()
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
    if (storeCookie) {
      try {
        setLocationCookies(res, storeCookie, true)
      } catch (cookieErr) {
        console.error("[home-location] set cookie failed:", cookieErr)
      }
    }
    return res
  } catch (err) {
    console.error("[home-location] GET failed:", err)
    try {
      const jar = await cookies()
      const fromCookie = geoFromHomeLocationCookie(jar.get(HOME_CITY_COOKIE)?.value?.trim())
      if (fromCookie?.countryCode || fromCookie?.countryName || fromCookie?.city) {
        const enriched = enrichCountry(
          fromCookie.city,
          fromCookie.countryCode,
          fromCookie.countryName,
          true,
        )
        const loc = buildResolvedHomeLocation({
          city: fromCookie.city,
          countryCode: enriched.countryCode,
          countryName: enriched.countryName,
          isManual: false,
        })
        return NextResponse.json(jsonFromResolved(loc, true, false))
      }
    } catch {
      /* fall through */
    }
    return NextResponse.json({
      city: null,
      countryCode: null,
      countryName: null,
      displayLabel: null,
      auto: true,
      primed: false,
    })
  }
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
