import type { GeoHint } from "@/lib/browse-geo"
import { NEARBY_COUNTRY_CODES } from "@/lib/browse-geo"
import type { PublicBrowseCity } from "./types"

/** Two rows × six columns on desktop */
export const BROWSE_BY_CITY_DISPLAY_COUNT = 12

function countryNameLower(c: PublicBrowseCity): string {
  return (c.countryName ?? "").trim().toLowerCase()
}

export function pickCitiesForHome(
  all: PublicBrowseCity[],
  geo: GeoHint | null,
): PublicBrowseCity[] {
  const cities = all.filter((c) => c.id && c.name)
  if (cities.length <= BROWSE_BY_CITY_DISPLAY_COUNT) return cities

  const result: PublicBrowseCity[] = []
  const used = new Set<string>()

  const push = (c: PublicBrowseCity | undefined) => {
    if (!c || used.has(c.id)) return
    result.push(c)
    used.add(c.id)
  }

  const geoCity = geo?.city?.trim().toLowerCase()
  const geoCc = geo?.countryCode?.toUpperCase() ?? null
  const geoCn = geo?.countryName?.trim().toLowerCase() ?? ""

  if (geoCity) {
    const exact = cities.find((c) => c.name.trim().toLowerCase() === geoCity)
    push(exact)
  }

  if (geoCity && result.length === 0) {
    const partial = cities.find(
      (c) =>
        c.name.toLowerCase().includes(geoCity) ||
        (geoCity.length > 3 && geoCity.includes(c.name.toLowerCase())),
    )
    push(partial)
  }

  if (geoCc) {
    for (const c of cities) {
      if (result.length >= BROWSE_BY_CITY_DISPLAY_COUNT) break
      if (c.countryCode === geoCc) push(c)
    }
  }

  if (geoCn) {
    for (const c of cities) {
      if (result.length >= BROWSE_BY_CITY_DISPLAY_COUNT) break
      const n = countryNameLower(c)
      if (n && (n === geoCn || n.includes(geoCn) || geoCn.includes(n))) push(c)
    }
  }

  const nearby = geoCc ? (NEARBY_COUNTRY_CODES[geoCc] ?? []) : []
  for (const code of nearby) {
    for (const c of cities) {
      if (result.length >= BROWSE_BY_CITY_DISPLAY_COUNT) break
      if (c.countryCode === code) push(c)
    }
  }

  for (const c of cities) {
    if (result.length >= BROWSE_BY_CITY_DISPLAY_COUNT) break
    push(c)
  }

  return result.slice(0, BROWSE_BY_CITY_DISPLAY_COUNT)
}
