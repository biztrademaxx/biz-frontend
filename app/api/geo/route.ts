import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { EMPTY_GEO_HINT, resolveGeoFromHeaders } from "@/lib/geo-from-request"

export const dynamic = "force-dynamic"

/**
 * Approximate visitor location from request IP (Vercel edge headers or ipapi).
 * No browser permission required — IP is sent on every HTTP request.
 */
export async function GET() {
  try {
    const h = await headers()
    const geo = await resolveGeoFromHeaders(h)
    if (!geo.countryCode && !geo.city && !geo.countryName) {
      return NextResponse.json(EMPTY_GEO_HINT)
    }
    return NextResponse.json(geo)
  } catch (err) {
    console.error("[geo] GET failed:", err)
    return NextResponse.json(EMPTY_GEO_HINT)
  }
}
