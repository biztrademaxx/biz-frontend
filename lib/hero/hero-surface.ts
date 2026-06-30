/** Travel Agency Card Slider — shared surface tokens (navbar + hero). */

import type { CSSProperties } from "react"

export const HERO_SURFACE_BASE = "#edece5"
export const HERO_SURFACE_BASE_END = "#cdcfd3"
export const HERO_FRAME_WIPE_BG = "#edece5"

/** Primary ink — headings, nav, body, controls (reference: rgb(26, 9, 63)). */
export const HERO_INK = "#1a093f"
export const HERO_INK_HEADING = "#1a093f"
export const HERO_INK_MUTED = "#1a093f"
export const HERO_INK_BORDER = "rgba(26, 9, 63, 0.35)"

export const HERO_ACCENT = "#bc1c4f"
export const HERO_CTA_GRADIENT = "linear-gradient(225deg, rgb(255, 94, 58) 0%, rgb(255, 42, 104) 100%)"

/** Large radial blobs — Slider Revolution destinations-card-slider (slide 7587). */
export const HERO_AMBIENT_PEACH =
  "radial-gradient(circle, rgba(249, 188, 137, 0.55) 0%, rgba(253, 73, 53, 0) 61%, rgba(255, 0, 0, 0) 100%)"
export const HERO_AMBIENT_CYAN =
  "radial-gradient(circle, rgba(155, 247, 241, 0.5) 0%, rgba(214, 227, 94, 0) 61%, rgba(252, 214, 0, 0) 100%)"

export const HERO_SURFACE_GRADIENT = `linear-gradient(180deg, ${HERO_SURFACE_BASE} 0%, ${HERO_SURFACE_BASE_END} 100%)`

export const HERO_SURFACE_STYLE: CSSProperties = {
  backgroundColor: HERO_SURFACE_BASE,
  backgroundImage: `
    radial-gradient(circle at 14% 22%, rgba(249, 188, 137, 0.45) 0%, transparent 58%),
    radial-gradient(circle at 88% 18%, rgba(155, 247, 241, 0.4) 0%, transparent 58%),
    ${HERO_SURFACE_GRADIENT}
  `,
}

/** Sticky navbar height — hero pulls up under navbar for one continuous surface. */
export const HERO_NAVBAR_CLEARANCE = "5.5rem"
