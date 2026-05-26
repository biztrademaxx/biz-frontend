import { parseSpeakerLocationParts } from "./parse-speaker-location"
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

  const legacyLocation = readString(raw.location) || null
  const parts = parseSpeakerLocationParts({
    profileCity: readString(raw.profileCity) || null,
    profileState: readString(raw.profileState) || null,
    profileCountry: readString(raw.profileCountry) || null,
    city: readString(raw.city) || null,
    state: readString(raw.state) || null,
    country: readString(raw.country) || null,
    location: legacyLocation,
  })
  const locationLine =
    [parts.city, parts.state, parts.country].filter(Boolean).join(", ") || legacyLocation
  const locationHay = [parts.city, parts.state, parts.country, legacyLocation].filter(Boolean).join(" ")

  return {
    id,
    displayName,
    imageUrl,
    location: locationLine || null,
    city: parts.city,
    state: parts.state,
    country: parts.country,
    locationHay,
  }
}
