/** Fixed Explore / navbar types (order = sidebar order). */
export const EXPLORE_EVENT_TYPE_KEYS = [
  "CONFERENCE",
  "EXHIBITION",
  "SEMINAR",
  "WORKSHOP",
] as const

export type ExploreEventTypeKey = (typeof EXPLORE_EVENT_TYPE_KEYS)[number]

/** Display label in Explore menu (uppercase style per product spec). */
export function exploreTypeMenuLabel(key: ExploreEventTypeKey): string {
  return key
}

/** Value used with `/event?type=` (uppercase key). */
export function exploreTypeQueryValue(key: ExploreEventTypeKey): string {
  return key
}

/** Align with events page sidebar labels (`Workshops`, etc.). */
export function formatNameFromExploreKey(key: ExploreEventTypeKey): string {
  switch (key) {
    case "CONFERENCE":
      return "Conference"
    case "EXHIBITION":
      return "Exhibition"
    case "SEMINAR":
      return "Seminar"
    case "WORKSHOP":
      return "Workshops"
    default:
      return key
  }
}

/** Map events listing sidebar format names → explore key. */
export function exploreKeyFromFormatName(name: string): ExploreEventTypeKey | null {
  const s = name.toLowerCase().trim()
  if (s === "conference") return "CONFERENCE"
  if (s === "exhibition") return "EXHIBITION"
  if (s === "seminar") return "SEMINAR"
  if (s === "workshop" || s === "workshops") return "WORKSHOP"
  return null
}

/** Map `?type=` param (any case) → key. */
export function exploreKeyFromQueryParam(param: string | null): ExploreEventTypeKey | null {
  if (!param) return null
  const u = param.toUpperCase().trim()
  if (EXPLORE_EVENT_TYPE_KEYS.includes(u as ExploreEventTypeKey)) return u as ExploreEventTypeKey
  return null
}

/**
 * Classify raw event type (string or string[]) into one explore key, or null if none match.
 */
export function classifyExploreEventType(raw: unknown): ExploreEventTypeKey | null {
  const parts: string[] = []
  if (Array.isArray(raw)) {
    for (const x of raw) {
      if (x != null && String(x).trim()) parts.push(String(x))
    }
  } else if (raw != null && String(raw).trim()) {
    parts.push(String(raw))
  }
  const s = parts.join(" ").toLowerCase()
  if (!s.trim()) return null
  if (s.includes("conference")) return "CONFERENCE"
  if (s.includes("exhibition")) return "EXHIBITION"
  if (s.includes("seminar")) return "SEMINAR"
  if (s.includes("workshop")) return "WORKSHOP"
  return null
}

/** Human-readable label for create-event / admin forms (stored value is the uppercase key). */
export function eventFormatSelectLabel(key: ExploreEventTypeKey): string {
  switch (key) {
    case "CONFERENCE":
      return "Conference"
    case "EXHIBITION":
      return "Exhibition"
    case "SEMINAR":
      return "Seminar"
    case "WORKSHOP":
      return "Workshop"
    default:
      return key
  }
}

/** Single source for Event Type dropdowns (organizer + admin create event). */
export const EVENT_FORMAT_SELECT_OPTIONS: { value: ExploreEventTypeKey; label: string }[] =
  EXPLORE_EVENT_TYPE_KEYS.map((value) => ({
    value,
    label: eventFormatSelectLabel(value),
  }))
