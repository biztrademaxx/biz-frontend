import type { FeaturedSpeakerTile } from "./types"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

export function normalizeFeaturedSpeakerTile(raw: unknown): FeaturedSpeakerTile | null {
  if (!isRecord(raw)) return null
  const idRaw = raw.id
  if (idRaw === undefined || idRaw === null) return null
  const id = String(idRaw)
  const fn = readString(raw.firstName)
  const ln = readString(raw.lastName)
  const joined = [fn, ln].filter(Boolean).join(" ").trim()
  const displayName = joined || readString(raw.name) || "Speaker"
  const imageUrl = readString(raw.avatar) || readString(raw.image)
  if (!imageUrl) return null
  return { id, displayName, imageUrl }
}
