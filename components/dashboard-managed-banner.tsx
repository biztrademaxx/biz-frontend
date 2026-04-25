"use client"

import { useEffect, useMemo, useState } from "react"
import { X } from "lucide-react"

type PublicBanner = {
  id: string
  title: string
  description?: string
  imageUrl: string
  page: string
  position: string
  link?: string
  isActive: boolean
}

type DashboardManagedBannerProps = {
  page: "exhibitor-dashboard" | "organizer-dashboard" | "venue-dashboard" | "speaker-dashboard"
}

const DEFAULT_BANNER = "/dashboard_image.png"

export function DashboardManagedBanner({ page }: DashboardManagedBannerProps) {
  const [banner, setBanner] = useState<PublicBanner | null>(null)
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadBanner = async () => {
      try {
        const res = await fetch(`/api/public/content-banners?page=${encodeURIComponent(page)}&position=hero`, {
          cache: "no-store",
        })
        if (!res.ok) return
        const rows = (await res.json()) as PublicBanner[]
        if (!cancelled && Array.isArray(rows) && rows.length > 0) {
          setBanner(rows[0])
        }
      } catch {
        // Keep default banner when API fails.
      }
    }

    loadBanner()
    return () => {
      cancelled = true
    }
  }, [page])

  const href = useMemo(() => banner?.link?.trim() || "", [banner?.link])
  const src = banner?.imageUrl || DEFAULT_BANNER
  const alt = banner?.title || "Dashboard banner"
  const title = banner?.title?.trim() || "Grow your events with BizTradeFairs.com"
  const description =
    banner?.description?.trim() || "Promote your events to a global audience and connect with the right people."

  const imageNode = (
    <div className="relative h-full w-full overflow-hidden rounded-sm">
      <img src={src || "/placeholder.svg"} alt={alt} className="h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950/60 via-slate-900/35 to-transparent" />
      <div className="absolute inset-0 flex items-center px-5 md:px-8">
        <div className="max-w-md">
          <h3 className="text-lg md:text-2xl font-semibold text-white leading-tight">{title}</h3>
          <p className="mt-2 text-xs md:text-sm text-blue-100 line-clamp-2">{description}</p>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center rounded-sm bg-blue-600 px-3 py-1.5 text-xs md:text-sm font-medium text-white hover:bg-blue-500"
            >
              Advertise Now
            </a>
          ) : (
            <span className="mt-3 inline-flex items-center rounded-sm bg-blue-600/90 px-3 py-1.5 text-xs md:text-sm font-medium text-white">
              Featured Banner
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        aria-label="Close banner"
        onClick={() => setIsHidden(true)}
        className="absolute right-2 top-2 rounded-sm bg-black/40 p-1 text-white hover:bg-black/60"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )

  useEffect(() => {
    if (!isHidden) return
    const timer = window.setTimeout(() => {
      setIsHidden(false)
    }, 60 * 1000)
    return () => window.clearTimeout(timer)
  }, [isHidden])

  if (isHidden) return null

  return (
    <div className="relative h-32 w-full md:h-40 lg:h-44">
      {imageNode}
    </div>
  )
}
