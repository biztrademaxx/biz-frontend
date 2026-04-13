/**
 * Public URL segment for event detail pages.
 * Prefer stored `slug` (SEO-friendly); fall back to `id` (UUID) for older data or API-only use.
 */
export function eventPublicPath(event: { id: string; slug?: string | null }): string {
  const raw =
    typeof event.slug === "string" && event.slug.trim() !== "" ? event.slug.trim() : event.id
  return `/event/${encodeURIComponent(raw)}`
}
