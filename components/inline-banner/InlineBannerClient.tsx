"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { InlineBannerRecord } from "@/lib/banners/types"

function getFallbackBanner(): InlineBannerRecord[] {
  return [
    {
      id: "1",
      page: "speakers",
      title: "Featured Speakers",
      description: "Meet industry experts and thought leaders",
      imageUrl: "https://s.bizcdn.com/insight/2024/05/featured-speakers-banner.jpg",
      link: "/speakers",
      buttonText: "Learn More",
      order: 1,
      isActive: true,
    },
  ]
}

export interface InlineBannerClientProps {
  initialBanners: InlineBannerRecord[]
  page: string
  maxBanners?: number
  dismissible?: boolean
  className?: string
  demoBanner?: InlineBannerRecord
}

export function InlineBannerClient({
  page,
  maxBanners = 3,
  dismissible = true,
  className = "",
  demoBanner,
  initialBanners,
}: InlineBannerClientProps) {
  const [banners, setBanners] = useState<InlineBannerRecord[]>(() => {
    if (demoBanner) return [demoBanner]
    const slice = initialBanners.slice(0, maxBanners)
    return slice.length > 0 ? slice : getFallbackBanner()
  })
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (demoBanner) {
      setBanners([demoBanner])
      return
    }
    const slice = initialBanners.slice(0, maxBanners)
    setBanners(slice.length > 0 ? slice : getFallbackBanner())
  }, [demoBanner, initialBanners, maxBanners])

  useEffect(() => {
    const dismissed = localStorage.getItem(`dismissed-banners-${page}`)
    if (dismissed) {
      setDismissedBanners(new Set(JSON.parse(dismissed)))
    }
  }, [page])

  const dismissBanner = (bannerId: string) => {
    const newDismissed = new Set(dismissedBanners)
    newDismissed.add(bannerId)
    setDismissedBanners(newDismissed)
    localStorage.setItem(`dismissed-banners-${page}`, JSON.stringify(Array.from(newDismissed)))
  }

  const visibleBanners = banners.filter((banner) => !dismissedBanners.has(banner.id))

  if (visibleBanners.length === 0) {
    return null
  }

  return (
    <div className={`w-full min-w-0 space-y-6 ${className}`}>
      {visibleBanners.map((banner) => (
        <div key={banner.id} className="group relative overflow-hidden rounded-sm shadow-lg">
          <div className="relative h-32 w-full sm:h-36 md:h-40">
            <Image
              src={banner.imageUrl || "/placeholder.svg"}
              alt={banner.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "https://via.placeholder.com/1200x200?text=Banner"
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />

            <div className="absolute inset-0 flex min-w-0 items-center px-4 py-4 sm:px-8 md:px-12">
              <div className="min-w-0 max-w-2xl pr-8">
                <h2 className="mb-1 text-lg font-bold text-white sm:mb-2 sm:text-xl md:text-2xl">
                  {banner.title}
                </h2>
                {banner.description ? (
                  <p className="mb-2 line-clamp-2 text-sm text-white/80 sm:mb-3 sm:line-clamp-none">
                    {banner.description}
                  </p>
                ) : null}
                {banner.link ? (
                  <Link
                    href={banner.link}
                    className="inline-block rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 sm:px-5"
                  >
                    {banner.buttonText || "Learn More"}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          {dismissible ? (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 h-7 w-7 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation()
                dismissBanner(banner.id)
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
      ))}
    </div>
  )
}
