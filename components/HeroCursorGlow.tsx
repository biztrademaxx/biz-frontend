// components/hero/HeroCursorGlow.tsx
"use client"

import { useEffect } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { getHeroSlideSurface } from "@/lib/hero/hero-surface"
import type { HeroSlideSurface } from "@/lib/hero/hero-surface"

interface HeroCursorGlowProps {
    slideIndex: number
    containerRef: React.RefObject<HTMLElement | null>
    className?: string
}

export function HeroCursorGlow({ slideIndex, containerRef, className = "" }: HeroCursorGlowProps) {
    const cursorX = useMotionValue(0)
    const cursorY = useMotionValue(0)

    // Smooth springs for cursor position
    const smoothX = useSpring(cursorX, {
        damping: 25,
        stiffness: 120,
        mass: 0.5,
        restDelta: 0.001,
    })
    const smoothY = useSpring(cursorY, {
        damping: 25,
        stiffness: 120,
        mass: 0.5,
        restDelta: 0.001,
    })

    // Glow opacity with spring
    const glowOpacity = useMotionValue(0)
    const smoothOpacity = useSpring(glowOpacity, {
        damping: 30,
        stiffness: 150,
        mass: 0.3,
    })

    // Get slide colors
    const surface = getHeroSlideSurface(slideIndex)

    // Create transform values for glow positioning
    const glowX = useTransform(smoothX, (x) => x - 200)
    const glowY = useTransform(smoothY, (y) => y - 200)

    // Build gradient layers from slide colors
    const buildGlowGradients = (surface: HeroSlideSurface) => {
        const gradients: string[] = []

        // Primary glow from radialA
        if (surface.radialA) {
            const { at, rgb, opacity } = surface.radialA
            gradients.push(
                `radial-gradient(circle at ${at}, rgba(${rgb}, ${opacity * 1.2}) 0%, rgba(${rgb}, ${opacity * 0.3}) 40%, transparent 70%)`
            )
        }

        // Secondary glow from radialB
        if (surface.radialB) {
            const { at, rgb, opacity } = surface.radialB
            gradients.push(
                `radial-gradient(circle at ${at}, rgba(${rgb}, ${opacity * 1.1}) 0%, rgba(${rgb}, ${opacity * 0.2}) 45%, transparent 75%)`
            )
        }

        // Optional tertiary glow from radialC
        if (surface.radialC) {
            const { at, rgb, opacity } = surface.radialC
            gradients.push(
                `radial-gradient(circle at ${at}, rgba(${rgb}, ${opacity}) 0%, rgba(${rgb}, ${opacity * 0.15}) 50%, transparent 80%)`
            )
        }

        return gradients.join(", ")
    }

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        let isHovering = false

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top

            // Clamp values within container bounds
            const clampedX = Math.max(0, Math.min(rect.width, x))
            const clampedY = Math.max(0, Math.min(rect.height, y))

            cursorX.set(clampedX)
            cursorY.set(clampedY)

            if (!isHovering) {
                isHovering = true
                glowOpacity.set(0.85)
            }
        }

        const handleMouseLeave = () => {
            isHovering = false
            glowOpacity.set(0)
        }

        const handleMouseEnter = () => {
            isHovering = true
            glowOpacity.set(0.85)
        }

        container.addEventListener("mousemove", handleMouseMove, { passive: true })
        container.addEventListener("mouseleave", handleMouseLeave, { passive: true })
        container.addEventListener("mouseenter", handleMouseEnter, { passive: true })

        return () => {
            container.removeEventListener("mousemove", handleMouseMove)
            container.removeEventListener("mouseleave", handleMouseLeave)
            container.removeEventListener("mouseenter", handleMouseEnter)
        }
    }, [containerRef, cursorX, cursorY, glowOpacity])

    // Update gradients when slide changes
    const glowGradients = buildGlowGradients(surface)

    return (
        <motion.div
            className={`pointer-events-none fixed inset-0 z-10 overflow-hidden ${className}`}
            style={{
                opacity: smoothOpacity,
            }}
            initial={{ opacity: 0 }}
        >
            <motion.div
                className="absolute h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2"
                style={{
                    left: glowX,
                    top: glowY,
                    background: glowGradients,
                    filter: "blur(40px) brightness(1.1)",
                    mixBlendMode: "screen",
                    willChange: "transform, opacity",
                }}
            />

            {/* Secondary glow for more depth */}
            <motion.div
                className="absolute h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 opacity-30"
                style={{
                    left: useTransform(smoothX, (x) => x - 250),
                    top: useTransform(smoothY, (y) => y - 250),
                    background: glowGradients,
                    filter: "blur(80px) brightness(0.8)",
                    mixBlendMode: "screen",
                    willChange: "transform, opacity",
                }}
            />
        </motion.div>
    )
}