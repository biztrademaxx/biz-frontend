import type { OrganizerListEntry } from "./types"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function normalizeOne(raw: unknown): OrganizerListEntry | null {
  if (!isRecord(raw)) return null
  const id = raw.id
  if (id === undefined || id === null) return null
  return {
    id: typeof id === "number" || typeof id === "string" ? id : String(id),
    company: typeof raw.company === "string" ? raw.company : null,
    name: typeof raw.name === "string" ? raw.name : null,
    image: typeof raw.image === "string" ? raw.image : null,
    avatar: typeof raw.avatar === "string" ? raw.avatar : null,
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
