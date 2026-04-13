import type { PublicBrowseCountry } from "./types"
import { normalizePublicBrowseCountry } from "./normalize-country-row"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function rawCountryArrayFromPayload(res: unknown): unknown[] {
  if (Array.isArray(res)) return res
  if (isRecord(res) && Array.isArray(res.data)) return res.data
  return []
}

/**
 * Parses countries list payload (array or `{ data: [] }`) into normalized rows.
 */
export function normalizeCountriesListResponse(res: unknown): PublicBrowseCountry[] {
  const raw = rawCountryArrayFromPayload(res)
  const out: PublicBrowseCountry[] = []
  for (const row of raw) {
    const c = normalizePublicBrowseCountry(row)
    if (c) out.push(c)
  }
  return out
}
