"use client"

import Navbar from "@/components/navbar"
import HeroSlideSurface from "@/components/hero/HeroSlideSurface"
import { useHeroTransition } from "@/lib/hero/hero-transition-context"

/**
 * One shared block: slide gradient + navbar + hero slideshow.
 * Matches the travel slider reference (single surface, no white nav strip).
 */
export default function HomeHeroUnified({ children }: { children: React.ReactNode }) {
  const { displayIdx, pendingIdx, phase, direction } = useHeroTransition()

  return (
    <div
      id="home-hero-section"
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen min-w-0"
    >
      <HeroSlideSurface
        displayIdx={displayIdx}
        pendingIdx={pendingIdx}
        phase={phase}
        direction={direction}
      />
      <div className="relative z-10">
        <Navbar />
        {children}
      </div>
    </div>
  )
}
