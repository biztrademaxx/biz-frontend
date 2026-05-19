import type { GeoHint } from "@/lib/browse-geo"

export const EMPTY_GEO_HINT: GeoHint = {
  city: null,
  region: null,
  countryCode: null,
  countryName: null,
}

const COUNTRY_NAMES: Record<string, string> = {
  IN: "India",
  AE: "United Arab Emirates",
  US: "United States",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  SG: "Singapore",
  AU: "Australia",
  CA: "Canada",
  JP: "Japan",
  CN: "China",
  SA: "Saudi Arabia",
  QA: "Qatar",
  NL: "Netherlands",
  IT: "Italy",
  ES: "Spain",
  CH: "Switzerland",
  BR: "Brazil",
  MX: "Mexico",
  KR: "South Korea",
  MY: "Malaysia",
  TH: "Thailand",
  ID: "Indonesia",
  PH: "Philippines",
  HK: "Hong Kong",
  IE: "Ireland",
  BE: "Belgium",
  PL: "Poland",
  TR: "Turkey",
  ZA: "South Africa",
  EG: "Egypt",
}

export function countryNameFromCode(code: string | null | undefined): string | null {
  if (!code?.trim()) return null
  const cc = code.trim().toUpperCase()
  return COUNTRY_NAMES[cc] ?? cc
}

function isPrivateIP(ip: string): boolean {
  return (
    ip.startsWith("127.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.") ||
    ip === "::1"
  )
}

function clientIpFromHeaders(h: Headers): string | null {
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim()
  if (forwarded && !isPrivateIP(forwarded)) return forwarded
  const realIp = h.get("x-real-ip")?.trim()
  if (realIp && !isPrivateIP(realIp)) return realIp
  return null
}

/** Vercel / CDN edge headers (no external API call). */
export function geoFromEdgeHeaders(h: Headers): GeoHint | null {
  const countryCode = h.get("x-vercel-ip-country")?.trim()?.toUpperCase()
  if (!countryCode) return null
  return {
    city: h.get("x-vercel-ip-city")?.trim() || null,
    region: h.get("x-vercel-ip-country-region")?.trim() || null,
    countryCode,
    countryName: countryNameFromCode(countryCode),
  }
}

/** ipapi.co lookup (local dev + non-Vercel hosts). */
export async function geoFromIpapi(ip: string | null): Promise<GeoHint> {
  try {
    const url = ip
      ? `https://ipapi.co/${encodeURIComponent(ip)}/json/`
      : "https://ipapi.co/json/"
    const r = await fetch(url, { cache: "no-store" })
    if (!r.ok) return EMPTY_GEO_HINT
    const d = (await r.json()) as Record<string, unknown>
    if (d.error) return EMPTY_GEO_HINT
    const countryCode =
      typeof d.country_code === "string" ? d.country_code.trim().toUpperCase() : null
    return {
      city: typeof d.city === "string" ? d.city : null,
      region: typeof d.region === "string" ? d.region : null,
      countryCode,
      countryName:
        typeof d.country_name === "string"
          ? d.country_name
          : countryNameFromCode(countryCode),
    }
  } catch {
    return EMPTY_GEO_HINT
  }
}

/**
 * Resolve visitor geo from request headers (edge → ipapi fallback).
 * No browser permission required.
 */
export async function resolveGeoFromHeaders(h: Headers): Promise<GeoHint> {
  const edge = geoFromEdgeHeaders(h)
  if (edge?.countryCode || edge?.city) return edge
  const ip = clientIpFromHeaders(h)
  return geoFromIpapi(ip)
}

/** Cookie / storage value for detected location. */
export function geoToCookieValue(geo: GeoHint): string | null {
  return geo.city?.trim() || geo.countryCode?.trim() || geo.countryName?.trim() || null
}

export function geoDisplayLabel(geo: GeoHint): string | null {
  return (
    geo.city?.trim() ||
    geo.countryName?.trim() ||
    countryNameFromCode(geo.countryCode) ||
    geo.countryCode?.trim() ||
    null
  )
}
