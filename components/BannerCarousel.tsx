"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

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

  // autoplay
  useEffect(() => {
    if (!autoPlay) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, interval)
    return () => clearInterval(timer)
  }, [autoPlay, interval, images.length])

  return (
    <div
      className="relative w-full overflow-hidden shadow max-w-6xl mx-auto"
      style={{
        height: "130px", // reduced height (slimmer look)
        aspectRatio: "16/5", // slightly flatter aspect ratio for balance
      }}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={images[current]}
          alt={`banner-${current}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Dots */}
      {/* <div className="absolute bottom-2 w-full flex justify-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full ${
              current === index ? "bg-black" : "bg-black/40"
            }`}
          />
        ))}
      </div> */}
    </div>
  )
}
