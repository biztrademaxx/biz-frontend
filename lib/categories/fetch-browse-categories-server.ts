import type { BrowseCategoryTile } from "./types"
import { normalizeBrowseCategory } from "./normalize-browse-category"

const PATH = "/api/events/categories/browse"

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
}

const FALLBACK: Pick<BrowseCategoryTile, "id" | "name" | "eventCount">[] = [
  { id: "fb-edu", name: "Education & Training", eventCount: -1 },
  { id: "fb-med", name: "Medical & Pharma", eventCount: -1 },
  { id: "fb-it", name: "IT & Technology", eventCount: -1 },
  { id: "fb-fin", name: "Banking & Finance", eventCount: -1 },
  { id: "fb-bus", name: "Business Services", eventCount: -1 },
]

function fallbackTiles(): BrowseCategoryTile[] {
  return FALLBACK.map((c) => ({
    ...c,
    icon: null,
    color: "",
  }))
}

/** Minimal rows for /event listing banner (name → icon URL). Empty on failure — no fake fallback names. */
export async function fetchBrowseCategoryMetaServer(): Promise<Array<{ name: string; icon: string | null }>> {
  try {
    const res = await fetch(`${getApiBaseUrl()}${PATH}`, { cache: "no-store" })
    if (!res.ok) return []
    const data: unknown = await res.json()
    if (!data || typeof data !== "object") return []
    const d = data as Record<string, unknown>
    if (d.success === false) return []
    const raw = d.categories
    if (!Array.isArray(raw)) return []
    const out: Array<{ name: string; icon: string | null }> = []
    for (const row of raw) {
      const c = normalizeBrowseCategory(row)
      if (c) out.push({ name: c.name, icon: c.icon })
    }
    return out
  } catch (e) {
    console.error("fetchBrowseCategoryMetaServer:", e)
    return []
  }
}

export async function fetchBrowseCategoriesForHomeServer(): Promise<BrowseCategoryTile[]> {
  try {
    const res = await fetch(`${getApiBaseUrl()}${PATH}`, { cache: "no-store" })
    if (!res.ok) return fallbackTiles()
    const data: unknown = await res.json()
    if (!data || typeof data !== "object") return fallbackTiles()
    const d = data as Record<string, unknown>
    if (d.success === false) return fallbackTiles()
    const raw = d.categories
    if (!Array.isArray(raw) || raw.length === 0) return fallbackTiles()
    const out: BrowseCategoryTile[] = []
    for (const row of raw) {
      const c = normalizeBrowseCategory(row)
      if (c) out.push(c)
    }
    return out.length > 0 ? out : fallbackTiles()
  } catch (e) {
    console.error("fetchBrowseCategoriesForHomeServer:", e)
    return fallbackTiles()
  }
}
