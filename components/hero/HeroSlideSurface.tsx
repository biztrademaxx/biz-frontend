"use client"

import HeroAmbientLayer from "@/components/hero/HeroAmbientLayer"
import HeroWipeFrame from "@/components/hero/HeroWipeFrame"
import { getHeroSlideSurface, heroSurfaceStyleForSlide } from "@/lib/hero/hero-surface"

type HeroSlideSurfaceProps = {
  displayIdx: number
  pendingIdx: number
  phase: "idle" | "exit" | "swap"
  direction: 1 | -1
}

/** Single per-slide mesh gradient — one layer for navbar + hero (no duplicate). */
export default function HeroSlideSurface({
  displayIdx,
  pendingIdx,
  phase,
  direction,
}: HeroSlideSurfaceProps) {
  const visibleIdx = phase === "swap" ? pendingIdx : displayIdx
  const surface = getHeroSlideSurface(visibleIdx)

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0" style={heroSurfaceStyleForSlide(visibleIdx)} />
      <div className="absolute inset-0 overflow-hidden">
        <HeroAmbientLayer surface={surface} />
      </div>
      {phase === "swap" ? (
        <HeroWipeFrame direction={direction} wipeColor={surface.wipeBg} />
      ) : null}
    </div>
  )
}
