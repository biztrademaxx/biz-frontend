import { eventCityNameFromRow } from "./event-city-name-from-row"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * Builds lowercase city name → count from raw event rows.
 */
export function buildCityEventCounts(events: unknown[]): Record<string, number> {
  const m: Record<string, number> = {}
  for (const row of events) {
    if (!isRecord(row)) continue
    if (row.id == null) continue
    const city = eventCityNameFromRow(row)
    if (!city) continue
    const k = city.toLowerCase()
    m[k] = (m[k] ?? 0) + 1
  }
  return m
}
