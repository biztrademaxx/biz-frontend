import { NextResponse } from "next/server"
import { fetchGeoHintServer } from "@/lib/browse-geo-server"
import { EMPTY_GEO_HINT } from "@/lib/geo-from-request"

export const dynamic = "force-dynamic"

/**
 * Approximate visitor location from request IP (Vercel edge headers, Express geo, or ipapi).
 * No browser permission required — IP is sent on every HTTP request.
 */
export async function GET() {
  try {
    const geo = await fetchGeoHintServer()
    if (!geo?.countryCode && !geo?.city && !geo?.countryName) {
      return NextResponse.json(EMPTY_GEO_HINT)
    }
    return NextResponse.json(geo)
  } catch {
    return NextResponse.json(EMPTY_GEO_HINT)
  }
}
