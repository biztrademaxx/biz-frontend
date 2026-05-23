/**
 * Listing hero gradient — matches navbar navy system: deep hover blue → primary #002C71 → slate #1F5D84
 * (same as `navbar.tsx` `bg-[#002C71]` / `hover:bg-[#001a48]` and listing link color #1F5D84).
 */
export const EVENTS_LISTING_BANNER_GRADIENT =
  "linear-gradient(118deg, #001a48 0%, #002C71 42%, #163d5c 68%, #1F5D84 100%)"

/**
 * Same navy family over category background art — no orange so it stays on-brand with the nav.
 */
export const EVENTS_LISTING_BANNER_GRADIENT_OVER_IMAGE =
  "linear-gradient(118deg, rgba(0, 26, 72, 0.78) 0%, rgba(0, 44, 113, 0.64) 45%, rgba(22, 61, 92, 0.58) 72%, rgba(31, 93, 132, 0.62) 100%)"

export const EVENTS_API = "/api/events"

/** No stock image — listing UI uses gradient/initials when missing. */
export const LISTING_DEFAULT_EVENT_IMAGE = ""

/** Regular listing events shown above the inline featured ad on each page. */
export const EVENTS_LISTING_PAGE_CHUNK_BEFORE_FEATURED_AD = 5

/** Regular listing events shown below the inline featured ad on each page. */
export const EVENTS_LISTING_PAGE_CHUNK_AFTER_FEATURED_AD = 5

/** Auto-advance interval for the inline featured-events carousel (ms). */
export const EVENTS_LISTING_INLINE_FEATURED_AUTO_MS = 5500

/**
 * When no events carry the `featured` tag, the inline carousel still shows this many
 * curated cards (verified + rating + followers) so the promo slot is never empty.
 */
export const EVENTS_LISTING_INLINE_PROMO_FALLBACK_MAX = 15
