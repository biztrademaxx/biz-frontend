/**
 * Image URL helpers — legacy stock paths are treated as “no image”.
 */

/** Paths that were used as placeholders; never treat as a real event photo. */
const LEGACY_PLACEHOLDER_PATHS = [
  "/images/gpex.jpg",
  "/city/c1.jpg",
  "/city/c2.jpg",
  "/city/c3.jpg",
  "/city/c4.jpg",
] as const

/** @deprecated Use `isLegacyDummyImage` — kept for callers that imported the constant. */
export const LEGACY_DUMMY_IMAGE_PATH = "/images/gpex.jpg"

export function isLegacyDummyImage(url: string | null | undefined): boolean {
  const t = url?.trim()
  if (!t) return true
  if (LEGACY_PLACEHOLDER_PATHS.some((p) => t === p || t.endsWith(p))) return true
  // Seed data used /city/cN.jpg stock paths that are not in public/
  if (/^\/city\/c\d+\.jpg$/i.test(t)) return true
  return false
}

/** Returns a trimmed URL or `undefined` when empty / legacy dummy. */
export function sanitizeImageUrl(url: string | null | undefined): string | undefined {
  const t = url?.trim()
  if (!t || isLegacyDummyImage(t)) return undefined
  return t
}

/** @deprecated No default stock image — use `sanitizeImageUrl` and conditional UI. */
export const DEFAULT_IMAGE_PLACEHOLDER = ""

/** Home/public event strips should omit cards without real images; no fallback URL. */
export const EVENT_IMAGE_FALLBACK = ""
