import { headers } from "next/headers"
import type { GeoHint } from "@/lib/browse-geo"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function normalizeGeoJson(data: unknown): GeoHint | null {
  if (!isRecord(data)) return null
  return {
    city: typeof data.city === "string" ? data.city : null,
    region: typeof data.region === "string" ? data.region : null,
    countryCode: typeof data.countryCode === "string" ? data.countryCode : null,
    countryName: typeof data.countryName === "string" ? data.countryName : null,
  }
}

/**
 * Server-only geo hint via same-origin `/api/geo` (uses request IP).
 */
export async function fetchGeoHintServer(): Promise<GeoHint | null> {
  try {
    const h = await headers()
    const host = h.get("x-forwarded-host") ?? h.get("host")
    if (!host) return null
    const proto = h.get("x-forwarded-proto") ?? "http"
    const origin = `${proto}://${host}`
    const r = await fetch(`${origin}/api/geo`, { cache: "no-store" })
    if (!r.ok) return null
    const data: unknown = await r.json()
    return normalizeGeoJson(data)
  } catch {
    return null
  }
}
