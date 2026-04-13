import type { PublicBrowseCity } from "./types"
import { normalizePublicBrowseCity } from "./normalize-city-row"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function rawCityArrayFromPayload(res: unknown): unknown[] {
  if (Array.isArray(res)) return res
  if (isRecord(res) && Array.isArray(res.data)) return res.data
  return []
}

/**
 * Parses cities list payload (array or `{ data: [] }`) into normalized rows.
 */
export function normalizeCitiesListResponse(res: unknown): PublicBrowseCity[] {
  const raw = rawCityArrayFromPayload(res)
  const out: PublicBrowseCity[] = []
  for (const row of raw) {
    const c = normalizePublicBrowseCity(row)
    if (c) out.push(c)
  }
  return out
}
