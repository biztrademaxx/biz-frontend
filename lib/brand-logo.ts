/** Navbar/footer wordmark. Override with `NEXT_PUBLIC_BRAND_LOGO_URL` if needed (CDN URL). */
export function getBrandLogoSrc(): string {
  const fromEnv = process.env.NEXT_PUBLIC_BRAND_LOGO_URL?.trim()
  if (fromEnv) return fromEnv
  return "/images/biztradefairs.png"
}

/** Absolute URLs need `unoptimized` on `next/image` unless the host is in `next.config` `images.remotePatterns`. */
export function isBrandLogoRemoteUrl(src: string): boolean {
  return /^https?:\/\//i.test(src)
}
