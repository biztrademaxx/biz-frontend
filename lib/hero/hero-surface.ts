/** Travel Agency Card Slider — per-slide surface tokens (navbar + hero share one scrolling layer). */

import type { CSSProperties } from "react"

export const HERO_FRAME_WIPE_BG = "#edece5"

/** Primary ink — headings, nav, body, controls (reference: rgb(26, 9, 63)). */
export const HERO_INK = "#1a093f"
export const HERO_INK_HEADING = "#1a093f"
export const HERO_INK_MUTED = "#1a093f"
export const HERO_INK_BORDER = "rgba(26, 9, 63, 0.35)"

export const HERO_ACCENT = "#bc1c4f"
export const HERO_CTA_GRADIENT = "linear-gradient(225deg, rgb(255, 94, 58) 0%, rgb(255, 42, 104) 100%)"

/** Sticky navbar height — hero pulls up under navbar for one continuous surface. */
export const HERO_NAVBAR_CLEARANCE = "5.5rem"

export type HeroSlideSurface = {
  base: string
  baseEnd: string
  wipeBg: string
  radialA: { at: string; rgb: string; opacity: number }
  radialB: { at: string; rgb: string; opacity: number }
  radialC?: { at: string; rgb: string; opacity: number }
  ambientPeach: string
  ambientCyan: string
  /** Blob anchor — slide 3 uses bottom-right peach. */
  peachAnchor: "top-left" | "bottom-center" | "bottom-right"
  cyanAnchor: "top-right" | "top-left"
}

/** Three distinct mesh gradients — one per slider revolution slide. */
export const HERO_SLIDE_SURFACES: HeroSlideSurface[] = [
  {
    base: "#edece5",
    baseEnd: "#cdcfd3",
    wipeBg: "#edece5",
    radialA: { at: "14% 22%", rgb: "249, 188, 137", opacity: 0.48 },
    radialB: { at: "88% 18%", rgb: "155, 247, 241", opacity: 0.42 },
    ambientPeach:
      "radial-gradient(circle, rgba(249, 188, 137, 0.58) 0%, rgba(253, 73, 53, 0) 61%, rgba(255, 0, 0, 0) 100%)",
    ambientCyan:
      "radial-gradient(circle, rgba(155, 247, 241, 0.52) 0%, rgba(214, 227, 94, 0) 61%, rgba(252, 214, 0, 0) 100%)",
    peachAnchor: "top-left",
    cyanAnchor: "top-right",
  },
  {
    base: "#f0ebe4",
    baseEnd: "#d4d0cb",
    wipeBg: "#f0ebe4",
    radialA: { at: "38% 78%", rgb: "255, 178, 128", opacity: 0.5 },
    radialB: { at: "84% 14%", rgb: "168, 228, 222", opacity: 0.46 },
    ambientPeach:
      "radial-gradient(circle, rgba(255, 175, 120, 0.55) 0%, rgba(255, 120, 80, 0) 62%, transparent 100%)",
    ambientCyan:
      "radial-gradient(circle, rgba(170, 235, 228, 0.5) 0%, rgba(120, 200, 190, 0) 62%, transparent 100%)",
    peachAnchor: "bottom-center",
    cyanAnchor: "top-right",
  },
  {
    base: "#e8ebe6",
    baseEnd: "#cfcbc5",
    wipeBg: "#e8ebe6",
    radialA: { at: "10% 16%", rgb: "186, 218, 198", opacity: 0.5 },
    radialB: { at: "90% 20%", rgb: "155, 240, 232", opacity: 0.44 },
    radialC: { at: "78% 85%", rgb: "235, 195, 155", opacity: 0.4 },
    ambientPeach:
      "radial-gradient(circle, rgba(235, 195, 155, 0.48) 0%, rgba(210, 160, 120, 0) 62%, transparent 100%)",
    ambientCyan:
      "radial-gradient(circle, rgba(175, 225, 210, 0.52) 0%, rgba(140, 200, 180, 0) 62%, transparent 100%)",
    peachAnchor: "bottom-right",
    cyanAnchor: "top-left",
  },
]

export function getHeroSlideSurface(slideIndex: number): HeroSlideSurface {
  return HERO_SLIDE_SURFACES[((slideIndex % HERO_SLIDE_SURFACES.length) + HERO_SLIDE_SURFACES.length) % HERO_SLIDE_SURFACES.length]
}

export function heroSurfaceStyleForSlide(slideIndex: number): CSSProperties {
  const s = getHeroSlideSurface(slideIndex)
  const layers = [
    `radial-gradient(circle at ${s.radialA.at}, rgba(${s.radialA.rgb}, ${s.radialA.opacity}) 0%, transparent 58%)`,
    `radial-gradient(circle at ${s.radialB.at}, rgba(${s.radialB.rgb}, ${s.radialB.opacity}) 0%, transparent 58%)`,
  ]
  if (s.radialC) {
    layers.push(
      `radial-gradient(circle at ${s.radialC.at}, rgba(${s.radialC.rgb}, ${s.radialC.opacity}) 0%, transparent 58%)`,
    )
  }
  layers.push(`linear-gradient(180deg, ${s.base} 0%, ${s.baseEnd} 100%)`)
  return {
    backgroundColor: s.base,
    backgroundImage: layers.join(",\n"),
  }
}

/** @deprecated Use heroSurfaceStyleForSlide(0) — kept for skeleton / CSS fallback */
export const HERO_SURFACE_BASE = HERO_SLIDE_SURFACES[0].base
export const HERO_SURFACE_BASE_END = HERO_SLIDE_SURFACES[0].baseEnd
export const HERO_SURFACE_STYLE = heroSurfaceStyleForSlide(0)
export const HERO_AMBIENT_PEACH = HERO_SLIDE_SURFACES[0].ambientPeach
export const HERO_AMBIENT_CYAN = HERO_SLIDE_SURFACES[0].ambientCyan
