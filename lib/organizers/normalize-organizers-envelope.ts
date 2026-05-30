import type { OrganizerListEntry } from "./types"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function isPlaceholderLocation(value: string): boolean {
  return /^location not specified$/i.test(value.trim())
}

function normalizeOne(raw: unknown): OrganizerListEntry | null {
  if (!isRecord(raw)) return null
  const id = raw.id
  if (id === undefined || id === null) return null

  const city = readString(raw.city)
  const state = readString(raw.state)
  const country = readString(raw.country)
  let headquarters = readString(raw.headquarters)
  let location = readString(raw.location)
  if (isPlaceholderLocation(headquarters)) headquarters = ""
  if (isPlaceholderLocation(location)) location = ""

  const structuredLine = [city, state, country].filter(Boolean).join(", ")
  const locationLine = structuredLine || headquarters || location
  const locationHay = [city, state, country, headquarters, location].filter(Boolean).join(" ")

  return {
    id: typeof id === "number" || typeof id === "string" ? id : String(id),
    company: typeof raw.company === "string" ? raw.company : null,
    name: typeof raw.name === "string" ? raw.name : null,
    image: typeof raw.image === "string" ? raw.image : null,
    avatar: typeof raw.avatar === "string" ? raw.avatar : null,
    city: city || null,
    state: state || null,
    country: country || null,
    headquarters: headquarters || locationLine || null,
    location: location || locationLine || null,
    locationHay: locationHay || null,
  }
}

/**
 * Parses `{ organizers: [...] }` or array payloads into typed rows.
 */
export function normalizeOrganizersFromApiPayload(data: unknown): OrganizerListEntry[] {
  let rawList: unknown[] = []
  if (Array.isArray(data)) rawList = data
  else if (isRecord(data) && Array.isArray(data.organizers)) rawList = data.organizers

  const out: OrganizerListEntry[] = []
  for (const row of rawList) {
    const o = normalizeOne(row)
    if (o) out.push(o)
  }
  return out
}
