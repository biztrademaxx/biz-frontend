import { sanitizeImageUrl } from "@/lib/placeholder"

/** Watermark logo when an event has no banner / gallery image (dashboards, listing, etc.). */
export const DEFAULT_EVENT_IMAGE = "/logo/default-user.png"

/** `true` when the event has no real thumbnail/banner to show. */
export function eventUsesWatermarkImage(event: {
  thumbnailImage?: string | null
  bannerImage?: string | null
  image?: string | null
  images?: unknown
}): boolean {
  return getEventDisplayImageUrl(event) === DEFAULT_EVENT_IMAGE
}

/** Cover for real photos; centered watermark logo on a light panel when missing. */
export function eventCardImageClassName(
  event: Parameters<typeof getEventDisplayImageUrl>[0],
): string {
  return eventUsesWatermarkImage(event)
    ? "object-contain object-center p-3"
    : "object-cover"
}

export function eventImageOrDefault(url: string | null | undefined): string {
  const clean = url ? sanitizeImageUrl(url) : undefined
  return clean ?? DEFAULT_EVENT_IMAGE
}

function firstCleanUrl(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined
  return sanitizeImageUrl(raw)
}

/** Resolve display image for event cards across dashboards and home strips. */
export function getEventDisplayImageUrl(event: {
  thumbnailImage?: string | null
  bannerImage?: string | null
  image?: string | null
  images?: unknown
}): string {
  const thumb = firstCleanUrl(event.thumbnailImage)
  if (thumb) return thumb

  const banner = firstCleanUrl(event.bannerImage)
  if (banner) return banner

  const single = firstCleanUrl(event.image)
  if (single) return single

  if (Array.isArray(event.images)) {
    for (const item of event.images) {
      if (typeof item === "string") {
        const u = firstCleanUrl(item)
        if (u) return u
      } else if (item && typeof item === "object" && "url" in item) {
        const u = firstCleanUrl((item as { url?: string }).url)
        if (u) return u
      }
    }
  }

  return DEFAULT_EVENT_IMAGE
}

/** Loose API / dashboard records (`Record<string, unknown>`). */
export function getEventDisplayImageFromRecord(event: Record<string, unknown>): string {
  return getEventDisplayImageUrl({
    thumbnailImage: event.thumbnailImage,
    bannerImage: event.bannerImage,
    image: event.image,
    images: event.images,
  })
}
