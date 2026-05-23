/** Public navbar wordmark (PNG). */
export const NAVBAR_LOGO_SRC = "/logo/biztradefairs_new2.png"

/** Footer wordmark on navy background (PNG, light artwork). */
export const FOOTER_LOGO_SRC = "/logo/biztradefairs_newFooter.png"

/** Match `components/navbar.tsx` — intrinsic size for `next/image`. */
export const NAVBAR_LOGO_WIDTH = 440
export const NAVBAR_LOGO_HEIGHT = 120

/** Match `components/navbar.tsx` `sizes` attribute. */
export const NAVBAR_LOGO_SIZES =
  "(min-width: 1024px) 440px, (min-width: 640px) 280px, 200px"

/** Match `components/navbar.tsx` logo height caps (not full nav row height). */
export const NAVBAR_LOGO_CLASSNAME =
  "block h-[44px] w-auto max-h-[44px] max-w-full shrink object-contain object-left sm:h-[52px] sm:max-h-[52px] md:h-[60px] md:max-h-[60px] lg:h-[72px] lg:max-h-[72px]"

/** Wrapper around logo link — same max-width behavior as public navbar. */
export const NAVBAR_LOGO_LINK_CLASSNAME =
  "inline-flex min-w-0 max-w-[min(58vw,220px)] shrink items-center sm:max-w-[300px] sm:shrink-0 md:max-w-[360px] lg:max-w-[440px]"

/** Dashboard / admin sidebar compact wordmark. */
export const NAVBAR_LOGO_COMPACT_CLASSNAME =
  "h-8 w-auto max-h-8 shrink-0 object-contain object-left"

/** Navbar row height on home + dashboards (fits logo up to lg:72px). */
export const NAVBAR_ROW_CLASSNAME = "flex h-[5.5rem] min-h-[5.5rem] items-center"

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

export function isNavbarLogoUnoptimized(src: string): boolean {
  return isBrandLogoRemoteUrl(src) || isBrandLogoSvg(src)
}

/** Props for `<Image />` — same dimensions as the public site navbar. */
export function getNavbarLogoImageProps() {
  const src = getNavbarLogoSrc()
  return {
    src,
    width: NAVBAR_LOGO_WIDTH,
    height: NAVBAR_LOGO_HEIGHT,
    sizes: NAVBAR_LOGO_SIZES,
    className: NAVBAR_LOGO_CLASSNAME,
    unoptimized: isNavbarLogoUnoptimized(src) ? true : undefined,
  } as const
}
