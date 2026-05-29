"use client"

import { AppImage } from "@/components/app-image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { DEFAULT_EVENT_IMAGE } from "@/lib/default-event-image"

/** Listing thumbnail: single image, or auto-sliding carousel every 5s when multiple URLs. */
export function EventListingCardImages({
  href,
  urls,
  title,
}: {
  href: string
  urls: string[]
  title: string
}) {
  const [index, setIndex] = useState(0)
  const slides = urls.length > 0 ? urls : [DEFAULT_EVENT_IMAGE]
  const count = slides.length
  const key = slides.join("|")

  useEffect(() => {
    setIndex(0)
  }, [key])

  useEffect(() => {
    if (count <= 1) return
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % count)
    }, 5000)
    return () => window.clearInterval(t)
  }, [count, key])

  const viewportClass =
    "relative mx-auto h-[96px] w-full max-w-lg overflow-hidden rounded-sm bg-slate-100 md:mx-0 md:h-[96px] md:w-[136px] md:max-w-none"

  const carouselDots = (
    <div
      className="flex min-h-[14px] items-center justify-center gap-1 px-1"
      role={count > 1 ? "tablist" : undefined}
      aria-label={count > 1 ? `${title} photos` : undefined}
    >
      {count > 1
        ? slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F5D84] focus-visible:ring-offset-1 ${
                i === index ? "w-4 bg-slate-700" : "w-1.5 bg-slate-300 hover:bg-slate-400"
              }`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIndex(i)
              }}
            />
          ))
        : null}
    </div>
  )

  if (count <= 1) {
    return (
      <>
        <Link href={href} className="block">
          <div className={viewportClass}>
            <AppImage
              src={slides[0]}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 136px"
              className="object-cover"
            />
          </div>
        </Link>
        {carouselDots}
      </>
    )
  }

  return (
    <>
      <Link href={href} className="block">
        <div className={viewportClass}>
          <div
            className="flex h-full transition-transform duration-500 ease-out"
            style={{
              width: `${count * 100}%`,
              transform: `translateX(-${index * (100 / count)}%)`,
            }}
          >
            {slides.map((src, i) => (
              <div key={`${src}-${i}`} className="relative h-full shrink-0" style={{ width: `${100 / count}%` }}>
                <AppImage
                  src={src}
                  alt={i === 0 ? title : ""}
                  fill
                  sizes="(max-width: 768px) 100vw, 136px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </Link>
      {carouselDots}
    </>
  )
}

