"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AppImage } from "@/components/app-image"

interface ImageBannerCarouselProps {
  images: string[]
  autoPlay?: boolean
  interval?: number
}

export default function ImageBannerCarousel({
  images,
  autoPlay = true,
  interval = 100000,
}: ImageBannerCarouselProps) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!autoPlay || images.length === 0) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, interval)
    return () => clearInterval(timer)
  }, [autoPlay, interval, images.length])

  if (images.length === 0) return null

  return (
    <div
      className="relative mx-auto w-full max-w-6xl overflow-hidden shadow"
      style={{
        height: "130px",
        aspectRatio: "16/5",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <AppImage
            src={images[current]}
            alt={`banner-${current + 1}`}
            fill
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
