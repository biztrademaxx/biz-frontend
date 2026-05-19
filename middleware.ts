import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {
  HOME_CITY_COOKIE,
  HOME_LOCATION_AUTO_COOKIE,
} from "@/lib/home-location"

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7

/**
 * Prime home location cookie from Vercel edge geo (no browser permission).
 * Server components still call resolveHomeLocation() → /api/geo when cookie is absent (local dev).
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  if (request.cookies.has(HOME_CITY_COOKIE)) {
    return response
  }

  const city = request.headers.get("x-vercel-ip-city")?.trim()
  const countryCode = request.headers.get("x-vercel-ip-country")?.trim()?.toUpperCase()
  const value = city || countryCode

  if (!value) {
    return response
  }

  response.cookies.set(HOME_CITY_COOKIE, value, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
  })
  response.cookies.set(HOME_LOCATION_AUTO_COOKIE, "1", {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
  })

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
