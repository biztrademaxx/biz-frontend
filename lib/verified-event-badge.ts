/** Public asset used when an event is verified but no custom badge was uploaded (admin “Verify Event”). */
export const DEFAULT_VERIFIED_EVENT_BADGE_PATH = "/images/VerifiedBadge.png"

/**
 * Resolved image URL for the verified mark on cards and listings.
 * Custom Cloudinary (or other) URL wins when present; otherwise the platform default PNG.
 */
export function resolvedVerifiedBadgeImageUrl(
  isVerified: boolean | undefined,
  customBadgeUrl?: string | null,
): string | null {
  if (!isVerified) return null
  const t = typeof customBadgeUrl === "string" ? customBadgeUrl.trim() : ""
  return t.length > 0 ? t : DEFAULT_VERIFIED_EVENT_BADGE_PATH
}
