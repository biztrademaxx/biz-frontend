import type { GeoHint } from "@/lib/browse-geo"
import { NEARBY_COUNTRY_CODES } from "@/lib/browse-geo"
import type { PublicBrowseCountry } from "./types"

/** Two rows × six columns on desktop */
export const BROWSE_BY_COUNTRY_DISPLAY_COUNT = 12

export function pickCountriesForHome(
  all: PublicBrowseCountry[],
  geo: GeoHint | null,
): PublicBrowseCountry[] {
  const countries = all.filter((c) => c.id && c.name)
  if (countries.length <= BROWSE_BY_COUNTRY_DISPLAY_COUNT) return countries

  const result: PublicBrowseCountry[] = []
  const used = new Set<string>()

  const push = (c: PublicBrowseCountry | undefined) => {
    if (!c || used.has(c.id)) return
    result.push(c)
    used.add(c.id)
  }

  const geoCc = geo?.countryCode?.toUpperCase() ?? null
  const geoCn = geo?.countryName?.trim().toLowerCase() ?? ""

  if (geoCc) {
    const exact = countries.find((c) => c.code === geoCc)
    push(exact)
    for (const c of countries) {
      if (result.length >= BROWSE_BY_COUNTRY_DISPLAY_COUNT) break
      if (c.code === geoCc) push(c)
    }
  }

  if (geoCn) {
    for (const c of countries) {
      if (result.length >= BROWSE_BY_COUNTRY_DISPLAY_COUNT) break
      const n = c.name.trim().toLowerCase()
      if (n && (n === geoCn || n.includes(geoCn) || geoCn.includes(n))) push(c)
    }
  }

  const nearby = geoCc ? (NEARBY_COUNTRY_CODES[geoCc] ?? []) : []
  for (const code of nearby) {
    for (const c of countries) {
      if (result.length >= BROWSE_BY_COUNTRY_DISPLAY_COUNT) break
      if (c.code === code) push(c)
    }
  }

  for (const c of countries) {
    if (result.length >= BROWSE_BY_COUNTRY_DISPLAY_COUNT) break
    push(c)
  }

  return result.slice(0, BROWSE_BY_COUNTRY_DISPLAY_COUNT)
}
