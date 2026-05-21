/** Pick the best display image URL from common event API shapes. */
export function resolveEventBannerImage(input: {
  bannerImage?: string | null
  thumbnailImage?: string | null
  logo?: string | null
  images?: unknown
}): string | null {
  if (input.bannerImage?.trim()) return input.bannerImage.trim()
  if (input.thumbnailImage?.trim()) return input.thumbnailImage.trim()
  if (input.logo?.trim()) return input.logo.trim()
  const images = input.images
  if (!Array.isArray(images) || images.length === 0) return null
  const first = images[0]
  if (typeof first === "string" && first.trim()) return first.trim()
  if (first && typeof first === "object" && first !== null && "url" in first) {
    const url = (first as { url?: unknown }).url
    if (typeof url === "string" && url.trim()) return url.trim()
  }
  return null
}
