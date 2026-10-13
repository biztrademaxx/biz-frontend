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

const BLOB_TRANSITION = "transform 0.85s cubic-bezier(0.22, 1, 0.36, 1)"

type PointerNorm = { x: number; y: number }

type HeroAmbientLayerProps = {
  surface: Pick<
    HeroSlideSurface,
    "ambientPeach" | "ambientCyan" | "peachAnchor" | "cyanAnchor" | "radialA" | "radialB" | "radialC"
  >
  pointer: PointerNorm
  interactive?: boolean
}

function parseAt(at: string): [number, number] {
  const [x, y] = at.split(" ")
  return [parseFloat(x), parseFloat(y)]
}

function blobMotion(norm: PointerNorm, flipX = 1, flipY = 1) {
  const spread = Math.min(0.22, Math.hypot(norm.x, norm.y) * 0.42)
  return {
    transform: `translate(${norm.x * flipX * 120}px, ${norm.y * flipY * 88}px) scale(${1 + spread})`,
    transition: BLOB_TRANSITION,
  }
}

/** Mouse-reactive mesh blobs — colors shift and spread with cursor. */
export default function HeroAmbientLayer({
  surface,
  pointer,
  interactive = true,
}: HeroAmbientLayerProps) {
  const reduceMotion = useReducedMotion()
  const active = interactive && !reduceMotion
  const norm = active ? pointer : { x: 0, y: 0 }

  const peachMotion = blobMotion(norm, 1, 1)
  const cyanMotion = blobMotion(norm, -1, -1)

  return (
    <>
      {[surface.radialA, surface.radialB, ...(surface.radialC ? [surface.radialC] : [])].map((radial, i) => {
        const [px, py] = parseAt(radial.at)
        const flip = i % 2 === 0 ? 1 : -1
        const shiftX = norm.x * flip * 14
        const shiftY = norm.y * flip * 10
        const scale = 1 + Math.hypot(norm.x, norm.y) * (0.12 + i * 0.04)
        return (
          <div
            key={`mesh-${i}`}
            className="absolute h-[min(100vw,72rem)] w-[min(100vw,72rem)] rounded-full"
            style={{
              left: `${px + shiftX}%`,
              top: `${py + shiftY}%`,
              background: `radial-gradient(circle, rgba(${radial.rgb}, ${radial.opacity}) 0%, transparent 62%)`,
              transform: `translate(-50%, -50%) translate(${norm.x * flip * 48}px, ${norm.y * flip * 36}px) scale(${scale})`,
              transition: BLOB_TRANSITION,
            }}
            aria-hidden
          />
        )
      })}

      <div
        className={cn(
          "absolute h-[min(150vw,95rem)] w-[min(150vw,95rem)]",
          PEACH_ANCHOR_CLASS[surface.peachAnchor],
        )}
        style={{ background: surface.ambientPeach, ...peachMotion }}
        aria-hidden
      />
      <div
        className={cn(
          "absolute h-[min(150vw,95rem)] w-[min(150vw,95rem)]",
          CYAN_ANCHOR_CLASS[surface.cyanAnchor],
        )}
        style={{ background: surface.ambientCyan, ...cyanMotion }}
        aria-hidden
      />
    </>
  )
}

/** Track cursor as normalized offset from viewport center (-0.5 … 0.5). */
export function useHeroPointerNorm(): PointerNorm {
  const reduceMotion = useReducedMotion()
  const [pointer, setPointer] = useState<PointerNorm>({ x: 0, y: 0 })

  useEffect(() => {
    if (reduceMotion) return
    const onMove = (e: MouseEvent) => {
      setPointer({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      })
    }
    window.addEventListener("mousemove", onMove, { passive: true })
    return () => window.removeEventListener("mousemove", onMove)
  }, [reduceMotion])

  return pointer
}
