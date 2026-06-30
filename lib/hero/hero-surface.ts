/** Travel Agency Card Slider — slide 1 surface (SR template). */

export const HERO_SURFACE_BASE = "#edece5"
export const HERO_SURFACE_BASE_END = "#cdcfd3"

/** Sticky navbar height — hero pulls up behind transparent nav on home. */
export const HERO_NAVBAR_CLEARANCE = "5.5rem"

/** Soft ink on light surface (not heavy black/navy blocks). */
export const HERO_INK_HEADING = "#3d3558"
export const HERO_INK = "#52525b"
export const HERO_INK_MUTED = "#6b6578"
export const HERO_ACCENT = "#bc1c4f"

/** Wipe panel between slides — matches surface start. */
export const HERO_FRAME_WIPE_BG = HERO_SURFACE_BASE

export const HERO_AMBIENT_PEACH =
    "radial-gradient(circle, rgba(252, 194, 118, 0.42) 0%, rgba(252, 206, 46, 0) 61%, rgba(252, 214, 0, 0) 100%)"

export const HERO_AMBIENT_CYAN =
    "radial-gradient(circle, rgba(171, 228, 242, 0.38) 0%, rgba(67, 244, 193, 0) 61%, rgba(0, 255, 161, 0) 100%)"

/** Layered cream surface — peach left, cyan right (navbar + hero share this). */
export const HERO_SURFACE_BACKGROUND_LAYERED = [
    "radial-gradient(circle at 14% 22%, rgba(252, 194, 118, 0.38) 0%, transparent 55%)",
    "radial-gradient(circle at 88% 20%, rgba(171, 228, 242, 0.32) 0%, transparent 55%)",
    `linear-gradient(180deg, ${HERO_SURFACE_BASE} 0%, ${HERO_SURFACE_BASE_END} 100%)`,
].join(", ")

export const HERO_SURFACE_STYLE = {
    backgroundColor: HERO_SURFACE_BASE,
    backgroundImage: HERO_SURFACE_BACKGROUND_LAYERED,
} as const

export const HERO_CTA_GRADIENT =
    "linear-gradient(225deg, rgb(255, 94, 58) 0%, rgb(255, 42, 104) 100%)"