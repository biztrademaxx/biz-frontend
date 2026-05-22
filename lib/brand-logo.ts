/** Public navbar wordmark (PNG). */
export const NAVBAR_LOGO_SRC = "/logo/biztradefairs_new2.png"

/** Footer wordmark on navy background (PNG, light artwork). */
export const FOOTER_LOGO_SRC = "/logo/biztradefairs_newFooter.png"

/** Navbar logo. Override with `NEXT_PUBLIC_BRAND_LOGO_URL` if needed (CDN URL). */
export function getNavbarLogoSrc(): string {
  const fromEnv = process.env.NEXT_PUBLIC_BRAND_LOGO_URL?.trim()
  if (fromEnv) return fromEnv
  return NAVBAR_LOGO_SRC
}

/** Footer logo. Override with `NEXT_PUBLIC_FOOTER_LOGO_URL` if needed. */
export function getFooterLogoSrc(): string {
  const fromEnv = process.env.NEXT_PUBLIC_FOOTER_LOGO_URL?.trim()
  if (fromEnv) return fromEnv
  return FOOTER_LOGO_SRC
}

/** @deprecated Use getNavbarLogoSrc — kept for SEO / org schema */
export function getBrandLogoSrc(): string {
  return getNavbarLogoSrc()
}

/** Absolute URLs need `unoptimized` on `next/image` unless the host is in `next.config` `images.remotePatterns`. */
export function isBrandLogoRemoteUrl(src: string): boolean {
  return /^https?:\/\//i.test(src)
}

/** Local SVG wordmarks should use unoptimized `next/image`. */
export function isBrandLogoSvg(src: string): boolean {
  return /\.svg(\?|#|$)/i.test(src)
}
