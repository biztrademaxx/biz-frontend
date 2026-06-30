"use client"

import HeroAmbientLayer, { useHeroPointerNorm } from "@/components/hero/HeroAmbientLayer"
import HeroWipeFrame from "@/components/hero/HeroWipeFrame"
import { getHeroSlideSurface } from "@/lib/hero/hero-surface"

type HeroSlideSurfaceProps = {
  displayIdx: number
  pendingIdx: number
  phase: "idle" | "exit" | "swap"
  direction: 1 | -1
}

/** Per-slide mesh gradient — reacts to mouse movement (shift + spread). */
export default function HeroSlideSurface({
  displayIdx,
  pendingIdx,
  phase,
  direction,
}: HeroSlideSurfaceProps) {
  const visibleIdx = phase === "swap" ? pendingIdx : displayIdx
  const surface = getHeroSlideSurface(visibleIdx)
  const pointer = useHeroPointerNorm()

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: surface.base,
          backgroundImage: `linear-gradient(180deg, ${surface.base} 0%, ${surface.baseEnd} 100%)`,
        }}
      />
      <div className="absolute inset-0 overflow-hidden">
        <HeroAmbientLayer surface={surface} pointer={pointer} />
      </div>
      {phase === "swap" ? (
        <HeroWipeFrame direction={direction} wipeColor="#1a093f" />
      ) : null}
    </div>
  )
} 
