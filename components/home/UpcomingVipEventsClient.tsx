"use client"

import Link from "next/link"
import { useCallback, useRef } from "react"
import { CalendarDays, ChevronRight, Crown, MapPin } from "lucide-react"
import { AppImage } from "@/components/app-image"
import { eventPublicPath } from "@/lib/event-path"
import { getVipStripCardImageUrl } from "@/lib/hero/hero-featured-image"
import type { HeroSlideshowEvent } from "@/lib/hero/types"

function formatVipDate(startIso: string, endIso?: string | null): string {
  const start = new Date(startIso)
  const end = endIso ? new Date(endIso) : null
  if (Number.isNaN(start.getTime())) return ""
  const s = start.getDate()
  const e = end && !Number.isNaN(end.getTime()) ? end.getDate() : null
  const mon = start.toLocaleString("en-GB", { month: "short" })
  const year = start.getFullYear()
  return e ? `${s} – ${e} ${mon} ${year}` : `${s} ${mon} ${year}`
}

function locationLine(event: HeroSlideshowEvent): string {
  const v = event.venue
  if (!v) return ""
  const city = v.venueCity?.trim()
  const country = v.venueCountry?.trim()
  if (city && country) return `${city}, ${country}`
  return city || country || ""
}

function VipEventCard({ event }: { event: HeroSlideshowEvent }) {
  const imageUrl = getVipStripCardImageUrl(event)
  const date = formatVipDate(event.startDate, event.endDate)
  const loc = locationLine(event)

  return (
    <Link
      href={eventPublicPath(event)}
      className="group flex w-[min(88vw,300px)] shrink-0 snap-start flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#004A96]/25 hover:shadow-[0_8px_28px_-10px_rgba(0,74,150,0.22)] min-[400px]:w-[300px] sm:flex-row sm:items-stretch"
    >
      <div className="relative mx-auto aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg bg-slate-50 ring-1 ring-inset ring-slate-200/70 sm:mx-0 sm:aspect-auto sm:h-[118px] sm:w-[118px] md:h-[128px] md:w-[128px]">
        <div className="absolute inset-2 sm:inset-2.5">
          {imageUrl ? (
            <AppImage
              src={imageUrl}
              alt={event.title}
              fill
              sizes="(max-width: 640px) 88vw, 128px"
              className="object-contain object-center"
            />
          ) : (
            <div className="absolute inset-0 rounded-md bg-gradient-to-br from-[#004A96]/20 to-[#004A96]/40" />
          )}
        </div>
        <span className="absolute left-1.5 top-1.5 rounded bg-[#004A96] px-1.5 py-0.5 text-[0.58rem] font-extrabold uppercase tracking-wide text-white shadow">
          VIP Event
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 group-hover:text-[#004A96]">
          {event.subTitle || event.title}
        </h3>
        {date ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2} />
            <span className="line-clamp-1">{date}</span>
          </div>
        ) : null}
        {loc ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-red-500" strokeWidth={2} />
            <span className="line-clamp-1">{loc}</span>
          </div>
        ) : null}
      </div>
    </Link>
  )
}

export default function UpcomingVipEventsClient({ events }: { events: HeroSlideshowEvent[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollRight = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: Math.max(280, el.clientWidth * 0.85), behavior: "smooth" })
  }, [])

  if (events.length === 0) return null

  return (
    <section aria-label="Upcoming VIP events" className="w-full min-w-0">
      <div className="mb-3 flex flex-col gap-2 min-[400px]:mb-4 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between sm:mb-4">
        <div className="flex min-w-0 items-center gap-2">
          <Crown className="h-5 w-5 shrink-0 text-[#004A96]" strokeWidth={2} aria-hidden />
          <h2 className="text-base font-bold text-slate-900 sm:text-lg md:text-xl">Upcoming VIP Events</h2>
        </div>
        <Link
          href="/event"
          className="shrink-0 text-sm font-semibold text-[#004A96] hover:text-[#003d7a]"
        >
          View All →
        </Link>
      </div>

      <div className="relative min-w-0">
        <div
          ref={scrollRef}
          className="no-scrollbar -mx-0.5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 pr-0 sm:gap-4 sm:pr-12"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        >
          {events.map((event) => (
            <VipEventCard key={event.id} event={event} />
          ))}
        </div>

        {events.length > 1 ? (
          <button
            type="button"
            aria-label="Scroll VIP events"
            onClick={scrollRight}
            className="absolute right-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition-colors hover:border-[#004A96]/30 hover:text-[#004A96] sm:flex"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </button>
        ) : null}
      </div>
    </section>
  )
}
