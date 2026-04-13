import type { BrowseCategoryTile } from "./types"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readFiniteNumber(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return -1
  return value
}

export function normalizeBrowseCategory(raw: unknown): BrowseCategoryTile | null {
  if (!isRecord(raw)) return null
  const idRaw = raw.id
  if (idRaw === undefined || idRaw === null) return null
  const id = String(idRaw)
  const name = typeof raw.name === "string" ? raw.name.trim() : ""
  if (!name) return null
  const iconRaw = typeof raw.icon === "string" ? raw.icon.trim() : ""
  return {
    id,
    name,
    icon: iconRaw || null,
    color: typeof raw.color === "string" ? raw.color : "",
    eventCount: readFiniteNumber(raw.eventCount),
  }
}
