"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import type { PageBannerRecord } from "@/lib/banners/types"

export interface PageBannerClientProps {
  initialBanners: PageBannerRecord[]
  page: string
  height?: number
  fixedHeight?: boolean
  autoplay?: boolean
  autoplayInterval?: number
  showControls?: boolean
  className?: string
}

export function PageBannerClient({
  initialBanners,
  height = 400,
  fixedHeight = false,
  autoplay = true,
  autoplayInterval = 5000,
  showControls = true,
  className = "",
}: PageBannerClientProps) {
  const [banners, setBanners] = useState<PageBannerRecord[]>(initialBanners)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    setBanners(initialBanners)
    setCurrentIndex(0)
  }, [initialBanners])

  useEffect(() => {
    if (!autoplay || banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, autoplayInterval)

    return () => clearInterval(interval)
  }, [autoplay, autoplayInterval, banners.length])

  const handleBannerClick = async (banner: PageBannerRecord) => {
    try {
      await fetch(`/api/banners/track/${banner.id}`, {
        method: "POST",
      })
    } catch (error) {
      console.error("Error tracking banner click:", error)
    }

    if (banner.link) {
      window.location.href = banner.link
    }
  }

  const bannerHeightStyle = fixedHeight
    ? ({ height: `${height}px` } as const)
    : ({
        height: `clamp(88px, 32vw, ${height}px)`,
      } as const)

  if (banners.length === 0) {
    return null
  }

  const currentBanner = banners[currentIndex]

  return (
    <div className={`relative w-full min-h-[88px] overflow-hidden ${className}`} style={bannerHeightStyle}>
      <div
        className={`relative h-full w-full min-h-0 ${currentBanner.link ? "cursor-pointer" : ""}`}
        onClick={() => currentBanner.link && handleBannerClick(currentBanner)}
      >
        <Image
          src={currentBanner.imageUrl || "/placeholder.svg"}
          alt={currentBanner.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>

      {showControls && banners.length > 1 ? <></> : null}
    </div>
  )
}
