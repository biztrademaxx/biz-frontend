import type { PublicBrowseCity } from "@/lib/browse-by-city/types"

export function resolvedEventCountForCity(
  city: PublicBrowseCity,
  cityEventCounts: Record<string, number>,
): number {
  if (city.eventCount != null) return city.eventCount
  return cityEventCounts[city.name.trim().toLowerCase()] ?? 0
}
