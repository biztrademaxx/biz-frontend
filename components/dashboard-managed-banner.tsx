"use client"

import { useEffect, useMemo, useState } from "react"

type PublicBanner = {
  id: string
  title: string
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

  const imageNode = (
    <div className="relative h-full w-full overflow-hidden rounded-sm">
      <img src={src || "/placeholder.svg"} alt={alt} className="h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-950/70 via-indigo-900/55 to-blue-700/35" />
    </div>
  )

  return (
    <div className="relative h-48 w-full md:h-60 lg:h-72">
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full w-full" aria-label={alt}>
          {imageNode}
        </a>
      ) : (
        imageNode
      )}
    </div>
  )
}
