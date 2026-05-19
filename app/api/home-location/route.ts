import { headers } from "next/headers"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  geoDisplayLabel,
  geoToCookieValue,
  resolveGeoFromHeaders,
} from "@/lib/geo-from-request"
import { buildResolvedHomeLocation, HOME_CITY_COOKIE, HOME_LOCATION_AUTO_COOKIE } from "@/lib/home-location"

export const dynamic = "force-dynamic"

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function parseCookieValue(value: string) {
  const v = value.trim()
  if (/^[A-Za-z]{2}$/.test(v)) {
    return { city: null as string | null, countryCode: v.toUpperCase() }
  }
  return { city: v, countryCode: null as string | null }
}

function jsonFromResolved(
  loc: ReturnType<typeof buildResolvedHomeLocation>,
  auto: boolean,
) {
  return {
    city: loc.city,
    countryCode: loc.countryCode,
    countryName: loc.countryName,
    displayLabel: loc.displayLabel,
    auto,
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
    res.cookies.set(HOME_LOCATION_AUTO_COOKIE, "", {
      path: "/",
      maxAge: 0,
      sameSite: "lax",
    })
  }
}

/** GET — read saved location; auto-detect from IP when cookie is missing. */
export async function GET() {
  const jar = await cookies()
  const cookieVal = jar.get(HOME_CITY_COOKIE)?.value?.trim()
  const isAuto = jar.get(HOME_LOCATION_AUTO_COOKIE)?.value === "1"

  if (cookieVal) {
    const parsed = parseCookieValue(cookieVal)
    const loc = buildResolvedHomeLocation({
      city: parsed.city,
      countryCode: parsed.countryCode,
      countryName: parsed.countryCode ? null : parsed.city,
      isManual: !isAuto,
    })
    return NextResponse.json(jsonFromResolved(loc, isAuto))
  }

  // No cookie — detect from IP and prime cookie for subsequent requests.
  const h = await headers()
  const geo = await resolveGeoFromHeaders(h)
  const cookieValue = geoToCookieValue(geo)

  if (!cookieValue) {
    return NextResponse.json({
      city: null,
      countryCode: null,
      countryName: null,
      displayLabel: null,
      auto: false,
    })
  }

  const loc = buildResolvedHomeLocation({
    city: geo.city,
    countryCode: geo.countryCode,
    countryName: geo.countryName,
    isManual: false,
  })

  const res = NextResponse.json(jsonFromResolved(loc, true))
  setLocationCookies(res, cookieValue, true)
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

  const cookieValue = city || countryCode || countryName
  if (!cookieValue) {
    return NextResponse.json({ error: "city or country is required" }, { status: 400 })
  }

  const loc = buildResolvedHomeLocation({
    city: city || null,
    countryCode,
    countryName,
    isManual: !isAuto,
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
