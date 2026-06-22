"use client"

import { AppImage } from "@/components/app-image"
import { useEffect, useMemo, useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { safeResponseJson } from "@/lib/api"
import {
  getDashboardBannerTheme,
  type DashboardBannerPage,
} from "@/lib/dashboard-banner-theme"

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
  page: DashboardBannerPage
  /** Layout/sizing classes on the outer wrapper (compact keeps this space when dismissed). */
  className?: string
  /** Shorter inline strip (e.g. organizer overview header). */
  variant?: "default" | "compact"
}

/** After × close only: banner comes back (in-memory; reload always shows banner again). */
const SHOW_BANNER_AFTER_DISMISS_MS = 90 * 1000

/** Hero: admin image when present; otherwise solid gradient default (no missing `/dashboard_image.png` 404). */
function DashboardBannerBackdrop({
  remoteUrl,
  alt,
  backdropClassName,
}: {
  remoteUrl: string | null
  alt: string
  backdropClassName: string
}) {
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => {
    setImgFailed(false)
  }, [remoteUrl])

  if (!remoteUrl || imgFailed) {
    return <div className={cn("h-full min-h-0 w-full", backdropClassName)} aria-hidden />
  }

  return (
    <AppImage
      src={remoteUrl}
      alt={alt}
      fill
      sizes="100vw"
      className="object-cover"
      onError={() => setImgFailed(true)}
    />
  )
}

export function DashboardManagedBanner({
  page,
  className,
  variant = "default",
}: DashboardManagedBannerProps) {
  const isCompact = variant === "compact"
  const theme = getDashboardBannerTheme(page)
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
        const res = await fetch(`/api/banners?page=${encodeURIComponent(page)}&position=hero`, {
          cache: "no-store",
        })
        if (!res.ok) return
        const rows = await safeResponseJson<PublicBanner[]>(res)
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
    <div
      className={cn("relative h-full w-full overflow-hidden", isCompact ? "rounded-md" : "rounded-sm")}
    >
      <DashboardBannerBackdrop
        remoteUrl={imageUrl}
        alt={alt}
        backdropClassName={theme.backdrop}
      />
      <div className={cn("pointer-events-none absolute inset-0", theme.overlay)} />
      <div
        className={cn(
          "absolute inset-0 flex items-center",
          isCompact ? "px-3 pr-9 md:px-4" : "px-4 md:px-6",
        )}
      >
        <div className="max-w-md">
          <h3
            className={cn(
              "font-semibold leading-tight text-white",
              isCompact ? "text-sm md:text-base" : "text-base md:text-xl",
            )}
          >
            {title}
          </h3>
          <p className={cn("mt-1 line-clamp-2 text-xs md:text-sm max-sm:line-clamp-1", theme.descriptionText)}>
            {description}
          </p>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "mt-2 inline-flex items-center rounded-sm px-2.5 py-1 text-xs font-medium text-white md:text-sm max-sm:hidden",
                theme.badgeLink,
              )}
            >
              Advertise Now
            </a>
          ) : (
            <span
              className={cn(
                "mt-2 inline-flex items-center rounded-sm px-2.5 py-1 text-xs font-medium text-white md:text-sm max-sm:hidden",
                theme.badge,
              )}
            >
              Featured Banner
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        aria-label="Close banner"
        onClick={() => setIsHidden(true)}
        className={cn(
          "absolute rounded-sm bg-black/40 text-white hover:bg-black/60",
          isCompact ? "right-1 top-1 p-0.5" : "right-2 top-2 p-1",
        )}
      >
        <X className={isCompact ? "h-3 w-3" : "h-4 w-4"} />
      </button>
    </div>
  )

  if (isHidden) {
    if (isCompact) {
      return (
        <div
          className={cn("relative h-24 w-full max-sm:hidden md:h-32 lg:h-36", className)}
          aria-hidden
        />
      )
    }
    return null
  }

  return (
    <div className={cn("relative h-24 w-full md:h-32 lg:h-36", className)}>
      {imageNode}
    </div>
  )
}
