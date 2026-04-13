/** Shared geo hint from `/api/geo` (ipapi.co via server). */
export type GeoHint = {
  city: string | null
  region: string | null
  countryCode: string | null
  countryName: string | null
}

/** ISO-3166 alpha-2 → nearby regions (trade / travel). */
export const NEARBY_COUNTRY_CODES: Record<string, string[]> = {
  AE: ["SA", "QA", "BH", "KW", "OM", "IN"],
  SA: ["AE", "QA", "BH", "KW", "OM"],
  QA: ["AE", "SA", "BH", "KW"],
  IN: ["AE", "SG", "LK", "BD", "NP"],
  SG: ["MY", "ID", "TH", "PH", "IN"],
  HK: ["CN", "MO", "TW", "SG"],
  US: ["CA", "MX", "GB"],
  GB: ["IE", "FR", "NL", "DE"],
  DE: ["NL", "FR", "AT", "CH"],
  FR: ["DE", "BE", "ES", "IT"],
}

export async function fetchGeoHint(): Promise<GeoHint | null> {
  try {
    const r = await fetch("/api/geo", { cache: "no-store" })
    if (!r.ok) return null
    const geoRes = await r.json()
    if (!geoRes || typeof geoRes !== "object") return null
    return {
      city: geoRes.city ?? null,
      region: geoRes.region ?? null,
      countryCode: geoRes.countryCode ?? null,
      countryName: geoRes.countryName ?? null,
    }
  } catch {
    return null
  }
}
