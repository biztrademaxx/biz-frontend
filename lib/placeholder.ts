/**
 * Image URL helpers — no stock `/city/c4.jpg` placeholder (removed).
 */

/** Legacy dummy path still stored on some records; treat as missing. */
export const LEGACY_DUMMY_IMAGE_PATH = ""

export function isLegacyDummyImage(url: string | null | undefined): boolean {
  const t = url?.trim()
  if (!t) return false
  return t === LEGACY_DUMMY_IMAGE_PATH || t.endsWith(LEGACY_DUMMY_IMAGE_PATH)
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
