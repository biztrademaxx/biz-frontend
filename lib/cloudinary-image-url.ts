/** Insert Cloudinary delivery transforms after `/upload/` (before version segment). */
export function withCloudinaryTransform(url: string, transform: string): string {
  const trimmed = url.trim()
  if (!trimmed || !trimmed.includes("res.cloudinary.com") || !trimmed.includes("/upload/")) {
    return trimmed
  }

  const marker = "/upload/"
  const idx = trimmed.indexOf(marker)
  const prefix = trimmed.slice(0, idx + marker.length)
  const after = trimmed.slice(idx + marker.length)

  if (!after.startsWith("v")) {
    return trimmed
  }

  return `${prefix}${transform}/${after}`
}

/** VIP strip thumbnails — fit full logo/artwork (no center crop). */
export function getVipCardImageUrl(url: string): string {
  if (!url.trim()) return ""
  return withCloudinaryTransform(
    url,
    "w_256,h_256,c_fit,q_auto:good,f_auto,b_rgb:f8fafc,dpr_2",
  )
}

/** Hero slideshow destination cards — sharp cover crop for large card frames. */
export function getHeroCardImageUrl(url: string): string {
  if (!url.trim()) return ""
  return withCloudinaryTransform(
    url,
    "w_1200,h_900,c_fill,g_auto,q_auto:best,f_auto,dpr_2",
  )
}

/** Hero featured carousel (large cover). */
export function getHeroSlideshowImageUrl(url: string): string {
  if (!url.trim()) return ""
  return withCloudinaryTransform(url, "w_1600,h_900,c_fill,q_auto:good,f_auto")
}
