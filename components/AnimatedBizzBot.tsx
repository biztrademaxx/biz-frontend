"use client"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

type AnimatedBizzBotProps = {
  size?: number
  className?: string
  calm?: boolean
}

export function AnimatedBizzBot({
  size = 44,
  className,
  calm = false,
}: AnimatedBizzBotProps) {
  const reduce = useReducedMotion()
  const slow = reduce || calm

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* Glow */}
      {!slow && (
        <motion.span
          className="pointer-events-none absolute inset-[-6px] rounded-full bg-cyan-400/20 blur-lg"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Floating animation */}
      <motion.div
        className="relative z-10"
        animate={
          slow
            ? undefined
            : {
                y: [0, -3, 0],
              }
        }
        transition={
          slow
            ? undefined
            : {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      >
        <DotLottieReact
          src="https://lottie.host/e04cabbd-6a4b-46ef-896a-3b3b8884c138/HNbIwcDRnk.lottie"
          loop
          autoplay={!reduce}
          style={{
            width: size,
            height: size,
          }}
        />
      </motion.div>
    </div>
  )
}