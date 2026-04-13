"use client"

import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

type AnimatedBizzBotProps = {
  /** Pixel size (width & height). */
  size?: number
  className?: string
  /** When true, only subtle idle motion (e.g. chat panel open). */
  calm?: boolean
}

/**
 * Small SVG “Bizz” assistant with looping animations: float, antenna wiggle,
 * eye blink, smile pulse, and arm wave — respects `prefers-reduced-motion`.
 */
export function AnimatedBizzBot({ size = 44, className, calm = false }: AnimatedBizzBotProps) {
  const reduce = useReducedMotion()
  const slow = reduce || calm

  return (
    <div
      className={cn("relative flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {!slow && (
        <motion.span
          className="pointer-events-none absolute inset-[-6px] rounded-full bg-cyan-400/25 blur-lg"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <motion.div
        className="relative h-full w-full text-violet-600"
        animate={
          slow
            ? undefined
            : {
                y: [0, -4, 0, -2, 0],
              }
        }
        transition={
          slow ? undefined : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          {/* Antenna */}
          <motion.g
            style={{ transformOrigin: "32px 10px", transformBox: "fill-box" as const }}
            animate={slow ? undefined : { rotate: [0, 14, -10, 0] }}
            transition={
              slow ? undefined : { duration: 1.6, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }
            }
          >
            <line x1="32" y1="10" x2="32" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-violet-300" />
            <circle cx="32" cy="3" r="3" className="fill-amber-400" />
          </motion.g>

          {/* Head */}
          <rect
            x="14"
            y="12"
            width="36"
            height="28"
            rx="10"
            className="fill-white stroke-violet-400/90"
            strokeWidth="2"
          />

          {/* Eyes */}
          <motion.ellipse
            cx="24"
            cy="24"
            rx="4"
            ry="5"
            className="fill-[#002c71]"
            animate={slow ? undefined : { scaleY: [1, 0.12, 1, 1] }}
            transition={
              slow ? undefined : { duration: 4.2, repeat: Infinity, times: [0, 0.06, 0.1, 1] }
            }
          />
          <motion.ellipse
            cx="40"
            cy="24"
            rx="4"
            ry="5"
            className="fill-[#002c71]"
            animate={slow ? undefined : { scaleY: [1, 0.12, 1, 1] }}
            transition={
              slow ? undefined : { duration: 4.2, repeat: Infinity, times: [0, 0.06, 0.1, 1], delay: 0.04 }
            }
          />

          {/* Smile */}
          <path
            d="M 24 32 Q 32 38 40 32"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            className="text-violet-500"
          />

          {/* Body */}
          <rect x="18" y="42" width="28" height="16" rx="6" className="fill-violet-500 stroke-violet-700/50" strokeWidth="1.5" />

          {/* Left arm — wave */}
          <motion.g
            style={{ transformOrigin: "14px 26px", transformBox: "fill-box" as const }}
            animate={slow ? undefined : { rotate: [0, 22, -6, 0] }}
            transition={
              slow ? undefined : { duration: 2, repeat: Infinity, repeatDelay: 1.8, ease: "easeInOut" }
            }
          >
            <path d="M 14 26 L 5 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-violet-400" />
          </motion.g>
          <path d="M 50 26 L 59 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-violet-400" />
        </svg>
      </motion.div>
    </div>
  )
}
