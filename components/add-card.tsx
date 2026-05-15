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
      <div className="p-[3px]">
        <div className="hero-card-shimmer h-[186px] w-full sm:h-[218px]" />
      </div>
    </div>
  )
}

function EditorialAdBody() {
  const title = DEFAULT_PROMO_TITLE
  const click = resolveClickTarget("")
  const body = (
    <div className="bg-gray-100 p-[3px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={FALLBACK_IMAGE}
        alt={title}
        className="block h-[186px] w-full object-cover object-center sm:h-[218px]"
        loading="lazy"
        decoding="async"
      />
    </div>
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

/** Inside `p-[3px]` wrapper; fixed image band height (above previous 170/202). */
const SLIDE_MIN_H = "min-h-[186px] sm:min-h-[218px]"

function CmsAdCarousel({ banners }: { banners: PublicBannerAd[] }) {
  const [imgFallback, setImgFallback] = useState<Record<string, boolean>>({})
  const hasMultiple = banners.length > 1

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: hasMultiple,
    slides: { perView: 1, spacing: 0 },
  })

  useEffect(() => {
    instanceRef.current?.update()
  }, [banners])

  useEffect(() => {
    if (!hasMultiple) return
    const id = window.setInterval(() => {
      instanceRef.current?.next()
    }, 5000)
    return () => window.clearInterval(id)
  }, [hasMultiple, banners.length])

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
      <div className="bg-gray-100 p-[3px]">
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
      </div>
    </div>
  )
}

function SingleCmsAdCard({ banner }: { banner: PublicBannerAd }) {
  const [imageSrc, setImageSrc] = useState(banner.imageUrl?.trim() || FALLBACK_IMAGE)
  const alt = (banner.title || "Sponsored").trim() || "Sponsored"
  const click = resolveClickTarget(banner.link ?? "")

  const body = (
    <div className="bg-gray-100 p-[3px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={alt}
        className="block h-[186px] w-full object-cover object-center sm:h-[218px]"
        loading="lazy"
        decoding="async"
        onError={() => setImageSrc(FALLBACK_IMAGE)}
      />
    </div>
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
 * Sidebar ad from `/api/public/content-banners`. One or more images: multiple banners auto-slide every 5s;
 * a single banner keeps the whole card as one link when a URL is set.
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
