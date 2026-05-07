"use client"

import { useEffect, useMemo, useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

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
  page:
    | "exhibitor-dashboard"
    | "organizer-dashboard"
    | "venue-dashboard"
    | "speaker-dashboard"
    | "visitor-dashboard"
  /** Applied only while the banner is visible (hidden → `null`, no layout gap). */
  className?: string
}

/** After × close only: banner comes back (in-memory; reload always shows banner again). */
const SHOW_BANNER_AFTER_DISMISS_MS = 90 * 1000

/** Hero: admin image when present; otherwise solid gradient default (no missing `/dashboard_image.png` 404). */
function DashboardBannerBackdrop({
  remoteUrl,
  alt,
}: {
  remoteUrl: string | null
  alt: string
}) {
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => {
    setImgFailed(false)
  }, [remoteUrl])

  if (!remoteUrl || imgFailed) {
    return (
      <div
        className="h-full min-h-[8rem] w-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900"
        aria-hidden
      />
    )
  }

  return (
    <img
      src={remoteUrl}
      alt={alt}
      className="h-full w-full object-cover"
      onError={() => setImgFailed(true)}
    />
  )
}

export function DashboardManagedBanner({ page, className }: DashboardManagedBannerProps) {
  const [banner, setBanner] = useState<PublicBanner | null>(null)
  const [isHidden, setIsHidden] = useState(false)

  /** After user clicks × only — no sessionStorage (that caused “banner gone every visit”). */
  useEffect(() => {
    if (!isHidden) return
    const id = window.setTimeout(() => setIsHidden(false), SHOW_BANNER_AFTER_DISMISS_MS)
    return () => window.clearTimeout(id)
  }, [isHidden, page])

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
  /** Empty string from API must not fall through to a missing static file. */
  const imageUrl = useMemo(() => {
    const u = banner?.imageUrl?.trim()
    return u && u.length > 0 ? u : null
  }, [banner?.imageUrl])
  const alt = banner?.title?.trim() || "Dashboard banner"
  const title = banner?.title?.trim() || "Grow your events with BizTradeFairs.com"
  const description =
    banner?.description?.trim() || "Promote your events to a global audience and connect with the right people."

  const imageNode = (
    <div className="relative h-full w-full overflow-hidden rounded-sm">
      <DashboardBannerBackdrop remoteUrl={imageUrl} alt={alt} />
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

  if (isHidden) return null

  return (
    <div className={cn("relative h-32 w-full md:h-40 lg:h-44", className)}>
      {imageNode}
    </div>
  )
}
