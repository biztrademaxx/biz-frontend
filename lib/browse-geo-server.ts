import { headers } from "next/headers"
import type { GeoHint } from "@/lib/browse-geo"
import { EMPTY_GEO_HINT, resolveGeoFromHeaders } from "@/lib/geo-from-request"

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? ""
}

function normalizeGeo(data: unknown): GeoHint | null {
  if (!data || typeof data !== "object") return null
  const d = data as Record<string, unknown>
  return {
    city: typeof d.city === "string" ? d.city : null,
    region: typeof d.region === "string" ? d.region : null,
    countryCode: typeof d.countryCode === "string" ? d.countryCode : null,
    countryName: typeof d.countryName === "string" ? d.countryName : null,
  }
}

/**
 * Server-only geo hint: forwards visitor IP headers to Express `/api/geo/visitor`,
 * then falls back to same-origin `/api/geo` (Vercel edge + ipapi).
 */
export async function fetchGeoHintServer(): Promise<GeoHint | null> {
  try {
    const h = await headers()
    const apiBase = getApiBaseUrl()

    if (apiBase) {
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
      })
      if (r.ok) {
        const geo = normalizeGeo(await r.json())
        if (geo && (geo.city || geo.countryCode || geo.countryName)) return geo
      }
    }

    const geo = await resolveGeoFromHeaders(h)
    if (!geo.countryCode && !geo.city && !geo.countryName) return null
    return geo
  } catch {
    return null
  }
}

export { EMPTY_GEO_HINT }
