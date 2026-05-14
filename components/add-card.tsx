"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"

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

/** Shown when no CMS banner is configured — on-brand editorial, not third‑party demo copy. */
const DEFAULT_PROMO_TITLE = "Biz Trade Fairs"
const DEFAULT_PROMO_SUBTITLE =
  "Discover global trade fairs, connect with opportunities, and grow your business network."
const DEFAULT_PROMO_FOOTER = "BizTradeFairs.com"

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

/** Placeholder while the client fetches banners — same shimmer system as listing skeleton (no gray pulse boxes). */
function AdCardSkeleton() {
  return (
    <div
      className={shellClass}
      aria-busy="true"
      aria-label="Loading advertisement"
    >
      <div className="hero-card-shimmer h-44 w-full sm:h-52" />
      <div className="border-t border-gray-200 px-4 py-3 space-y-2">
        <div className="home-shimmer h-5 w-3/4 max-w-[200px] rounded-md" />
        <div className="home-shimmer h-4 w-full rounded-md" />
        <div className="mt-3 flex items-center justify-between">
          <div className="home-shimmer h-3 w-28 rounded-md" />
          <div className="home-shimmer h-10 w-10 shrink-0 rounded-full" />
        </div>
      </div>
    </div>
  )
}

function EditorialAdBody() {
  const title = DEFAULT_PROMO_TITLE
  const subtitle = DEFAULT_PROMO_SUBTITLE
  const click = resolveClickTarget("")
  const body = (
    <>
      <div className="relative w-full h-44 sm:h-52 bg-gray-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FALLBACK_IMAGE}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="border-t border-gray-200 px-4 py-3">
        <h3 className="text-lg font-semibold text-gray-800 leading-tight">{title}</h3>
        <p className="text-sm text-gray-600 mt-1 leading-6">{subtitle}</p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">{DEFAULT_PROMO_FOOTER}</span>
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
        aria-label={`${title} — opens in a new tab`}
      >
        {body}
      </a>
    )
  }
  if (click?.external === false) {
    return (
      <Link href={click.href} className={shellInteractiveClass} aria-label={title}>
        {body}
      </Link>
    )
  }
  return <div className={shellClass}>{body}</div>
}

const SLIDE_MIN_H = "min-h-[176px] sm:min-h-[208px]"

function CmsAdCarousel({ banners }: { banners: PublicBannerAd[] }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [imgFallback, setImgFallback] = useState<Record<string, boolean>>({})
  const hasMultiple = banners.length > 1

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: hasMultiple,
      slides: { perView: 1, spacing: 0 },
      slideChanged(s) {
        setActiveIdx(s.track.details.rel)
      },
    },
    [banners],
  )

  useEffect(() => {
    setActiveIdx(0)
  }, [banners])

  useEffect(() => {
    if (!hasMultiple) return
    const slider = instanceRef.current
    if (!slider) return
    const id = window.setInterval(() => {
      slider.next()
    }, 5000)
    return () => window.clearInterval(id)
  }, [hasMultiple, instanceRef, banners.length])

  const current = banners[activeIdx] ?? banners[0]
  const alt = (current?.title || "Sponsored").trim() || "Sponsored"
  const title = current?.title?.trim() || "Sponsored"
  const click = resolveClickTarget(current?.link ?? "")

  const slideImage = useCallback((b: PublicBannerAd) => {
    const src = imgFallback[b.id] ? FALLBACK_IMAGE : (b.imageUrl?.trim() || FALLBACK_IMAGE)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={b.title || "Advertisement"}
        className="h-full w-full object-cover object-center"
        loading="lazy"
        decoding="async"
        onError={() => setImgFallback((prev) => ({ ...prev, [b.id]: true }))}
      />
    )
  }, [imgFallback])

  return (
    <div className={shellClass} role="region" aria-roledescription="carousel" aria-label="Sponsored banners">
      <div ref={sliderRef} className={`keen-slider w-full bg-gray-100 ${SLIDE_MIN_H}`}>
        {banners.map((b) => {
          const c = resolveClickTarget(b.link ?? "")
          const inner = slideImage(b)
          return (
            <div key={b.id} className={`keen-slider__slide ${SLIDE_MIN_H} relative overflow-hidden`}>
              {c?.external === true ? (
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 block h-full w-full"
                  aria-label={`${b.title} — opens in a new tab`}
                >
                  {inner}
                </a>
              ) : c?.external === false ? (
                <Link href={c.href} className="absolute inset-0 block h-full w-full" aria-label={b.title}>
                  {inner}
                </Link>
              ) : (
                <div className="absolute inset-0 h-full w-full">{inner}</div>
              )}
            </div>
          )
        })}
      </div>

      <div className="border-t border-gray-200 px-4 py-3">
        {hasMultiple ? (
          <div className="mb-2 flex justify-center gap-1.5" role="tablist" aria-label="Banner slides">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                role="tab"
                aria-selected={i === activeIdx}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === activeIdx ? "w-6 bg-[#1F5D84]" : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
                onClick={() => instanceRef.current?.moveToIdx(i)}
              />
            ))}
          </div>
        ) : null}

        <h3 className="text-lg font-semibold text-gray-800 leading-tight">{title}</h3>
        <p className="text-sm text-gray-600 mt-1 leading-6">Sponsored</p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {click ? "Tap to open sponsor site" : "Advertisement"}
            {hasMultiple ? ` · ${activeIdx + 1} / ${banners.length}` : ""}
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
    </div>
  )
}

function SingleCmsAdCard({ banner }: { banner: PublicBannerAd }) {
  const [imageSrc, setImageSrc] = useState(banner.imageUrl?.trim() || FALLBACK_IMAGE)
  const alt = (banner.title || "Sponsored").trim() || "Sponsored"
  const title = banner.title?.trim() || "Sponsored"
  const click = resolveClickTarget(banner.link ?? "")

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
        <p className="text-sm text-gray-600 mt-1 leading-6">Sponsored</p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {click ? "Tap to open sponsor site" : "Advertisement"}
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

/**
 * Sidebar ad from `/api/public/content-banners`. One or more images: multiple banners auto-slide every 5s
 * with dot controls; a single banner keeps the whole card as one link when a URL is set.
 */
export default function AdCard({ page = "events", position = "sidebar" }: AdCardProps) {
  const [cmsBanners, setCmsBanners] = useState<PublicBannerAd[]>([])
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
          setCmsBanners(list)
        }
      } catch {
        if (!cancelled) {
          setCmsBanners([])
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

  if (cmsBanners.length === 0) {
    return <EditorialAdBody />
  }

  if (cmsBanners.length === 1) {
    return <SingleCmsAdCard banner={cmsBanners[0]} />
  }

  return <CmsAdCarousel banners={cmsBanners} />
}
