import type { GeoHint } from "@/lib/browse-geo"
import { resolveCountryForCityName } from "@/lib/city-country"

export const EMPTY_GEO_HINT: GeoHint = {
  city: null,
  region: null,
  countryCode: null,
  countryName: null,
}

export { COUNTRY_NAMES, countryNameFromCode } from "@/lib/country-data"

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

/** Secondary IP lookup when ipapi.co is rate-limited or blocked. */
export async function geoFromIpWhoIs(): Promise<GeoHint> {
  try {
    const r = await fetch("https://ipwho.is/", { cache: "no-store" })
    if (!r.ok) return EMPTY_GEO_HINT
    const d = (await r.json()) as Record<string, unknown>
    if (d.success === false) return EMPTY_GEO_HINT
    const countryCode =
      typeof d.country_code === "string" ? d.country_code.trim().toUpperCase() : null
    return {
      city: typeof d.city === "string" ? d.city : null,
      region: typeof d.region === "string" ? d.region : null,
      countryCode,
      countryName:
        typeof d.country === "string" ? d.country : countryNameFromCode(countryCode),
    }
  } catch {
    return EMPTY_GEO_HINT
  }
}

function hasGeoSignal(geo: GeoHint): boolean {
  return Boolean(geo.countryCode || geo.countryName || geo.city)
}

/** Build geo hint from `HOME_CITY_COOKIE` (`City::CC`, ISO code, or city name). */
export function geoFromHomeLocationCookie(cookieRaw: string | undefined): GeoHint | null {
  const v = cookieRaw?.trim()
  if (!v) return null
  const parsed = parseHomeLocationCookie(v)
  const countryCode = parsed.countryCode
  const city = parsed.city
  if (!countryCode && !city) return null
  const mapped = city ? resolveCountryForCityName(city) : null
  const cc = countryCode ?? mapped?.countryCode ?? null
  return {
    city,
    region: null,
    countryCode: cc,
    countryName: countryNameFromCode(cc) ?? mapped?.countryName ?? null,
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
  const fromIpapi = await geoFromIpapi(ip)
  if (hasGeoSignal(fromIpapi)) return fromIpapi
  const fromIpWho = await geoFromIpWhoIs()
  if (hasGeoSignal(fromIpWho)) return fromIpWho
  return fromIpapi
}

/** Cookie / storage value for detected location (`City::CC` when both are known). */
export function geoToCookieValue(geo: GeoHint): string | null {
  const city = geo.city?.trim()
  const cc = geo.countryCode?.trim().toUpperCase()
  if (city && cc) return `${city}::${cc}`
  return city || cc || geo.countryName?.trim() || null
}

/** Parse `HOME_CITY_COOKIE` value (plain city, ISO code, or `City::CC`). */
export function parseHomeLocationCookie(value: string): {
  city: string | null
  countryCode: string | null
} {
  const v = value.trim()
  if (!v) return { city: null, countryCode: null }
  const scoped = v.match(/^(.+)::([A-Za-z]{2})$/)
  if (scoped) {
    return { city: scoped[1].trim() || null, countryCode: scoped[2].toUpperCase() }
  }
  if (/^[A-Za-z]{2}$/.test(v)) {
    return { city: null, countryCode: v.toUpperCase() }
  }
  return { city: v, countryCode: null }
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
