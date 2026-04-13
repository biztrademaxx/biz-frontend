import type { PublicBrowseCountry } from "./types"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readString(value: unknown): string | null {
  return typeof value === "string" ? value : null
}

function readFiniteInt(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null
  return Math.round(value)
}

function isPublicFromRaw(raw: Record<string, unknown>): boolean {
  if (raw.isPublic === true) return true
  if (raw.is_public === true) return true
  if (raw.isPermitted === true) return true
  if (raw.is_permitted === true) return true
  if (raw.public === true) return true
  if (raw.status === "public") return true
  if (raw.visibility === "PUBLIC") return true
  return false
}

function readCountryCode(raw: Record<string, unknown>): string | null {
  const code = readString(raw.code)?.trim()
  if (code && code.length === 2) return code.toUpperCase()
  return null
}

/**
 * Maps one API country object to {@link PublicBrowseCountry}, or `null` if unusable.
 */
export function normalizePublicBrowseCountry(raw: unknown): PublicBrowseCountry | null {
  if (!isRecord(raw)) return null
  const idRaw = raw.id
  if (idRaw === undefined || idRaw === null) return null
  const id = String(idRaw)
  const name = readString(raw.name)?.trim() ?? ""
  if (!name) return null

  const eventCount =
    readFiniteInt(raw.eventCount) ?? readFiniteInt(raw.event_count)

  return {
    id,
    name,
    code: readCountryCode(raw),
    flag: readString(raw.flag),
    isPublic: isPublicFromRaw(raw),
    eventCount,
  }
}
