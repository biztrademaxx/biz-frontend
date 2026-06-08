"use client"

import Link from "next/link"
import { useCallback, useRef } from "react"
import { CalendarDays, ChevronRight, Crown, MapPin } from "lucide-react"
import { AppImage } from "@/components/app-image"
import { eventPublicPath } from "@/lib/event-path"
import { getHeroFeaturedImageUrl } from "@/lib/hero/hero-featured-image"
import type { HeroSlideshowEvent } from "@/lib/hero/types"

function formatVipDate(startIso: string, endIso?: string | null): string {
  const start = new Date(startIso)
  const end = endIso ? new Date(endIso) : null
  if (Number.isNaN(start.getTime())) return ""
  const s = start.getDate()
  const e = end && !Number.isNaN(end.getTime()) ? end.getDate() : null
  const mon = start.toLocaleString("en-GB", { month: "short" })
  const year = start.getFullYear()
  return e ? `${s} - ${e} ${mon} ${year}` : `${s} ${mon} ${year}`
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
  const imageUrl = getHeroFeaturedImageUrl(event)
  const date = formatVipDate(event.startDate, event.endDate)
  const loc = locationLine(event)

  return (
    <Link
      href={eventPublicPath(event)}
      className="group flex min-w-[280px] max-w-[320px] shrink-0 snap-start items-stretch gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#004A96]/25 hover:shadow-[0_8px_28px_-10px_rgba(0,74,150,0.22)] sm:min-w-[300px]"
    >
      <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-[96px] sm:w-[96px]">
        {imageUrl ? (
          <AppImage
            src={imageUrl}
            alt={event.title}
            fill
            sizes="96px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#004A96]/20 to-[#004A96]/40" />
        )}
        <span className="absolute bottom-1.5 left-1.5 rounded bg-[#004A96] px-1.5 py-0.5 text-[0.58rem] font-extrabold uppercase tracking-wide text-white shadow">
          VIP Event
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-0.5">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 group-hover:text-[#004A96]">
          {event.subTitle || event.title}
        </h3>
        {date ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2} />
            <span>{date}</span>
          </div>
        ) : null}
        {loc ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-red-500" strokeWidth={2} />
            <span className="truncate">{loc}</span>
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
    el.scrollBy({ left: Math.max(300, el.clientWidth * 0.75), behavior: "smooth" })
  }, [])

  if (events.length === 0) return null

  return (
    <section aria-label="Upcoming VIP events" className="w-full">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-[#004A96]" strokeWidth={2} aria-hidden />
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Upcoming VIP Events</h2>
        </div>
        <Link
          href="/event"
          className="shrink-0 text-sm font-semibold text-[#004A96] hover:text-[#003d7a]"
        >
          View All →
        </Link>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 pr-12"
          style={{ scrollbarWidth: "none" }}
        >
          {events.map((event) => (
            <VipEventCard key={event.id} event={event} />
          ))}
        </div>

        {events.length > 3 ? (
          <button
            type="button"
            aria-label="Scroll VIP events"
            onClick={scrollRight}
            className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition-colors hover:border-[#004A96]/30 hover:text-[#004A96]"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </button>
        ) : null}
      </div>
    </section>
  )
}
