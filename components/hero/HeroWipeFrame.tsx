"use client"

import { motion } from "framer-motion"
import { HERO_FRAME_WIPE_BG } from "@/lib/hero/hero-surface"

export const HERO_SWAP_DURATION = 0.95
export const HERO_SWAP_EASE = [0.76, 0, 0.24, 1] as const

/** Cream panel wipe — sweeps across during slide swap. */
export default function HeroWipeFrame({
  direction,
  wipeColor = HERO_FRAME_WIPE_BG,
}: {
  direction: 1 | -1
  wipeColor?: string
}) {
  const from = direction > 0 ? "-100%" : "100%"
  const to = direction > 0 ? "100%" : "-100%"

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[2] min-h-full w-full"
      style={{ backgroundColor: wipeColor }}
      initial={{ x: from, y: 0 }}
      animate={{ x: to, y: 0 }}
      transition={{ duration: HERO_SWAP_DURATION, ease: HERO_SWAP_EASE }}
      aria-hidden
    />
  )
}
