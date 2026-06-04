import type { HeroSlideshowEvent } from "@/lib/hero/types"

/** Large VIP hero card: prefer dedicated VIP artwork, then banner / gallery. */
export function getHeroFeaturedImageUrl(event: HeroSlideshowEvent): string {
  if (event.vipImage?.trim()) return event.vipImage.trim()
  if (event.bannerImage?.trim()) return event.bannerImage.trim()
  const first = event.images?.[0]
  if (typeof first === "string" && first.trim()) return first.trim()
  return ""
}

/** Thumbnail row under the hero — banner / gallery (not VIP-only art). */
export function getHeroPreviewImageUrl(event: HeroSlideshowEvent): string {
  if (event.bannerImage?.trim()) return event.bannerImage.trim()
  const first = event.images?.[0]
  if (typeof first === "string" && first.trim()) return first.trim()
  if (event.vipImage?.trim()) return event.vipImage.trim()
  return ""
}
