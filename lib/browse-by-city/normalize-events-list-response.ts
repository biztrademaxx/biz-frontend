function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * Extracts a loose event array from `/api/events` style responses.
 */
export function normalizeEventsListResponse(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  if (isRecord(data) && Array.isArray(data.events)) return data.events
  return []
}
