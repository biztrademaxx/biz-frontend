"use client"

import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { HeroSlideSurface } from "@/lib/hero/hero-surface"

const PEACH_ANCHOR_CLASS = {
  "top-left": "-left-[18%] -top-[32%]",
  "bottom-center": "left-[22%] -bottom-[36%]",
  "bottom-right": "-right-[10%] -bottom-[28%]",
} as const

const CYAN_ANCHOR_CLASS = {
  "top-right": "-right-[12%] -top-[30%]",
  "top-left": "-left-[8%] -top-[24%]",
} as const

type HeroAmbientLayerProps = {
  surface: Pick<HeroSlideSurface, "ambientPeach" | "ambientCyan" | "peachAnchor" | "cyanAnchor">
  parallax?: boolean
}

/** Soft peach/cyan blobs — per-slide colors, scroll with hero section. */
export default function HeroAmbientLayer({ surface, parallax = true }: HeroAmbientLayerProps) {
  const reduceMotion = useReducedMotion()
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!parallax || reduceMotion) return
    const onMove = (e: MouseEvent) => {
      setOffset({
        x: (e.clientX / window.innerWidth - 0.5) * 48,
        y: (e.clientY / window.innerHeight - 0.5) * 36,
      })
    }
    window.addEventListener("mousemove", onMove, { passive: true })
    return () => window.removeEventListener("mousemove", onMove)
  }, [parallax, reduceMotion])

  const peachTransform =
    parallax && !reduceMotion ? `translate(${offset.x * 0.55}px, ${offset.y * 0.35}px)` : undefined
  const cyanTransform =
    parallax && !reduceMotion ? `translate(${offset.x * -0.35}px, ${offset.y * 0.25}px)` : undefined

  return (
    <>
      <div
        className={cn(
          "absolute h-[min(140vw,90rem)] w-[min(140vw,90rem)]",
          PEACH_ANCHOR_CLASS[surface.peachAnchor],
        )}
        style={{ background: surface.ambientPeach, transform: peachTransform }}
      />
      <div
        className={cn(
          "absolute h-[min(140vw,90rem)] w-[min(140vw,90rem)]",
          CYAN_ANCHOR_CLASS[surface.cyanAnchor],
        )}
        style={{ background: surface.ambientCyan, transform: cyanTransform }}
      />
    </>
  )
}
