"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

const FALLBACK_IMAGE = "/images/gpex.jpg"

export type PublicBannerAd = {
  id: string
  title: string
  imageUrl: string
  page: string
  position: string
  link?: string
  isActive?: boolean
}

type AdCardProps = {
  page?: string
  position?: string
}

/** Normalize admin-entered URLs so clicks work (add https://, allow internal paths). */
function resolveClickTarget(raw: string): { href: string; external: boolean } | null {
  const t = raw.trim()
  if (!t) return null
  if (t.startsWith("/") && !t.startsWith("//")) {
    return { href: t, external: false }
  }
  let u = t.replace(/^\s+/, "")
  if (!/^https?:\/\//i.test(u)) {
    u = `https://${u.replace(/^\/+/, "")}`
  }
  try {
    const parsed = new URL(u)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null
    return { href: parsed.href, external: true }
  } catch {
    return null
  }
}

const shellClass =
  "bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden no-underline text-inherit"

const shellInteractiveClass =
  `${shellClass} block cursor-pointer hover:opacity-[0.97] transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F5D84] focus-visible:ring-offset-2`

/** Placeholder while the client fetches banners (avoids flashing the demo ad before DB data). */
function AdCardSkeleton() {
  return (
    <div
      className={shellClass}
      aria-busy="true"
      aria-label="Loading advertisement"
    >
      <div className="h-44 sm:h-52 w-full animate-pulse bg-gray-200" />
      <div className="border-t border-gray-200 px-4 py-3 space-y-2">
        <div className="h-5 w-3/4 max-w-[200px] animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
        <div className="mt-3 flex items-center justify-between">
          <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  )
}

/**
 * Sidebar ad from `/api/public/content-banners`. Image is full width of the card; when the
 * admin sets a destination URL, the whole ad (image + text block) is one clickable target.
 */
export default function AdCard({ page = "events", position = "sidebar" }: AdCardProps) {
  const [banner, setBanner] = useState<PublicBannerAd | null>(null)
  const [imageSrc, setImageSrc] = useState(FALLBACK_IMAGE)
  /** False until the first fetch for this page/position finishes — prevents dummy content flash. */
  const [fetchSettled, setFetchSettled] = useState(false)

  useEffect(() => {
    let cancelled = false
    setFetchSettled(false)
    const q = new URLSearchParams({ page, position })
    ;(async () => {
      try {
        const res = await fetch(`/api/public/content-banners?${q.toString()}`, {
          cache: "no-store",
        })
        const data = res.ok ? await res.json() : []
        const list = Array.isArray(data)
          ? data.filter((b: PublicBannerAd) => b.isActive !== false && b.imageUrl && String(b.imageUrl).trim())
          : []
        if (!cancelled) {
          const first = list[0] as PublicBannerAd | undefined
          setBanner(first ?? null)
          setImageSrc(first?.imageUrl?.trim() || FALLBACK_IMAGE)
        }
      } catch {
        if (!cancelled) {
          setBanner(null)
          setImageSrc(FALLBACK_IMAGE)
        }
      } finally {
        if (!cancelled) setFetchSettled(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [page, position])

  if (!fetchSettled) {
    return <AdCardSkeleton />
  }

  const alt = (banner?.title || "Sponsored").trim() || "Sponsored"
  const title = banner?.title?.trim() || "Demo Units Available"
  const subtitle = banner ? "Sponsored" : "Ultra-low phase fluctuation (0.002π rad)"
  const click = resolveClickTarget(banner?.link ?? "")

  const body = (
    <>
      <div className="relative w-full h-44 sm:h-52 bg-gray-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="lazy"
          decoding="async"
          onError={() => setImageSrc(FALLBACK_IMAGE)}
        />
      </div>

      <div className="border-t border-gray-200 px-4 py-3">
        <h3 className="text-lg font-semibold text-gray-800 leading-tight">{title}</h3>
        <p className="text-sm text-gray-600 mt-1 leading-6">{subtitle}</p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {click ? "Tap to open sponsor site" : banner ? "Advertisement" : "santec.com"}
          </span>
          <span
            aria-hidden
            className="w-10 h-10 rounded-full shadow-md bg-white border border-gray-200 flex items-center justify-center shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gray-800"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </>
  )

  if (click?.external === true) {
    return (
      <a
        href={click.href}
        target="_blank"
        rel="noopener noreferrer"
        className={shellInteractiveClass}
        aria-label={`${alt} — opens in a new tab`}
      >
        {body}
      </a>
    )
  }

  if (click?.external === false) {
    return (
      <Link href={click.href} className={shellInteractiveClass} aria-label={alt}>
        {body}
      </Link>
    )
  }

  return <div className={shellClass}>{body}</div>
}
