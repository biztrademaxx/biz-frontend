import { DEFAULT_EVENT_IMAGE } from "@/lib/default-event-image"

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

export const EVENTS_LISTING_REVALIDATE_SEC = 45

/** Regular listing events shown above the inline featured ad on each page. */
export const EVENTS_LISTING_PAGE_CHUNK_BEFORE_FEATURED_AD = 5

/** Regular listing events shown below the inline featured ad on each page. */
export const EVENTS_LISTING_PAGE_CHUNK_AFTER_FEATURED_AD = 5

/**
 * @deprecated Phase 1 no longer bulk-fetches 500 rows for the main list.
 * Kept for any legacy callers; prefer EVENTS_LISTING_PAGE_SIZE + query builder.
 */
export const EVENTS_LISTING_FETCH_LIMIT = 50

/** Main /event list page size (5 cards + inline ad + 5 cards). */
export const EVENTS_LISTING_PAGE_SIZE =
  EVENTS_LISTING_PAGE_CHUNK_BEFORE_FEATURED_AD + EVENTS_LISTING_PAGE_CHUNK_AFTER_FEATURED_AD

/** Compact fetch for sidebar facets / trending / inline promo rails. */
export const EVENTS_LISTING_RAILS_LIMIT = 50

/** Right-rail Gold + Platinum subscription events. */
export const EVENTS_LISTING_PREMIUM_LIMIT = 5

/** Top Must Visit rail cap (client sort over rails payload until Phase 2 ranking). */
export const EVENTS_TOP_MUST_VISIT_LIMIT = 100

/** @deprecated Use getEventsListingApiUrl() from listing-query. */
export const EVENTS_API = `/api/events?limit=${EVENTS_LISTING_PAGE_SIZE}&sort=ranked&excludePast=true`

/** Fallback image for listing / trending cards when event has no media. */
export const LISTING_DEFAULT_EVENT_IMAGE = DEFAULT_EVENT_IMAGE

/** Auto-advance interval for the inline featured-events carousel (ms). */
export const EVENTS_LISTING_INLINE_FEATURED_AUTO_MS = 5500

/**
 * When no events carry the `featured` tag, the inline carousel still shows this many
 * curated cards (verified + rating + followers) so the promo slot is never empty.
 */
export const EVENTS_LISTING_INLINE_PROMO_FALLBACK_MAX = 15

/** Pin side rails under the site nav (`navbar` uses h-[5.5rem]). */
export const EVENTS_LISTING_STICKY_TOP_CLASS = "top-[5.5rem]"
