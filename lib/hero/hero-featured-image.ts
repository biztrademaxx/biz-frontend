import type { HeroSlideshowEvent } from "@/lib/hero/types"
import { getHeroSlideshowImageUrl, getVipCardImageUrl } from "@/lib/cloudinary-image-url"

function baseFeaturedImageUrl(event: HeroSlideshowEvent): string {
  if (event.vipImage?.trim()) return event.vipImage.trim()
  if (event.bannerImage?.trim()) return event.bannerImage.trim()
  const first = event.images?.[0]
  if (typeof first === "string" && first.trim()) return first.trim()
  return ""
}

/** Large VIP hero card: prefer dedicated VIP artwork, then banner / gallery. */
export function getHeroFeaturedImageUrl(event: HeroSlideshowEvent): string {
  const base = baseFeaturedImageUrl(event)
  return base ? getHeroSlideshowImageUrl(base) : ""
}

/** Upcoming VIP strip thumbnails — VIP art first, Cloudinary-sharpened for small cards. */
export function getVipStripCardImageUrl(event: HeroSlideshowEvent): string {
  const base = baseFeaturedImageUrl(event)
  return base ? getVipCardImageUrl(base) : ""
}

/** Thumbnail row under the hero — banner / gallery (not VIP-only art). */
export function getHeroPreviewImageUrl(event: HeroSlideshowEvent): string {
  if (event.bannerImage?.trim()) return event.bannerImage.trim()
  const first = event.images?.[0]
  if (typeof first === "string" && first.trim()) return first.trim()
  if (event.vipImage?.trim()) return event.vipImage.trim()
  return ""
}
