"use client"

import { AppImage } from "@/components/app-image"
import Link from "next/link"
import { useCallback, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react"
import { eventPublicPath } from "@/lib/event-path"
import HomeSectionEmptyState, { homeEmptyDescription } from "@/components/home/HomeSectionEmptyState"
import { hasDisplayableEventImage } from "@/lib/event-card-meta"
import type { HeroSlideshowEvent } from "@/lib/hero/types"

export type Event = HeroSlideshowEvent

function cardImageUrl(event: Event): string {
  if (event.bannerImage?.trim()) return event.bannerImage.trim()
  const first = event.images?.[0]
  if (typeof first === "string" && first.trim()) return first.trim()
  return ""
}

/** Day, month, and year from event start only (end date is not shown). */
function heroCardDateParts(
  startIso: string,
  endIso?: string | null,
): { line1: string; line2: string; yearLine: string } {
  const start = new Date(startIso)
  const end = endIso ? new Date(endIso) : null

  if (Number.isNaN(start.getTime())) {
    return { line1: "—", line2: "", yearLine: "" }
  }

  const monUpper = (x: Date) =>
    x.toLocaleString("en-GB", { month: "short" }).toUpperCase()

  const startDay = start.getDate()
  const endDay = end && !Number.isNaN(end.getTime()) ? end.getDate() : null

  return {
    line1: endDay ? `${startDay}-${endDay}` : `${startDay}`,
    line2: monUpper(start),
    yearLine: String(start.getFullYear()),
  }
}

/** VIP card title: hide trailing calendar year (e.g. "… Event 2022") when the badge already shows the year. */
function vipCardTitleDisplay(title: string): string {
  return title.replace(/\s+(?:19|20)\d{2}$/, "").trim() || title
}

function formatLocationLine(event: Event): string {
  const v = event.venue
  if (!v) return ""
  const city = v.venueCity?.trim()
  const country = v.venueCountry?.trim()
  if (city && country) return `${city}, ${country}`
  if (city) return city
  if (country) return country
  const name = v.venueName?.trim()
  if (name) return name
  return ""
}

/**
 * Renders one card. Caller is expected to have already verified the event
 * has a usable image (via `cardImageUrl`) — this component assumes
 * `imageUrl` is non-empty and does not render its own "empty" fallback, so
 * that the parent never mounts an empty, correctly-sized slot for events
 * without an image.
 */
function EventCard({ event, imageUrl }: { event: Event; imageUrl: string }) {
  const { line1: dateLine1, line2: dateLine2, yearLine: dateYear } =
    heroCardDateParts(event.startDate, event.endDate)
  const location = formatLocationLine(event)
  const locationDisplay = location || "Venue coming soon"

  return (
    <Link
      href={eventPublicPath(event)}
      className="block h-full min-w-0 w-full snap-start"
      aria-label={vipCardTitleDisplay(event.title)}
    >
      <div className="group relative h-[448px] w-full min-w-0 overflow-hidden shadow-lg transition-all duration-300 ease-out hover:z-10 hover:scale-[1.02] hover:shadow-2xl md:h-[488px] lg:h-[528px] lg:hover:scale-105">
        <AppImage
          src={imageUrl}
          alt={event.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-950/40 to-transparent transition-all duration-300 group-hover:from-blue-950/95 group-hover:via-blue-950/50"
          aria-hidden
        />

        <div className="absolute bottom-0 left-0 right-0 transform p-4 transition-transform duration-300 group-hover:-translate-y-2 md:p-6">
          <div className="mb-3 flex w-full max-w-[min(100%,6.25rem)] flex-col items-start gap-2 md:mb-4 lg:max-w-[min(100%,5.75rem)]">
            <span className="w-fit shrink-0 whitespace-nowrap rounded-sm bg-[#dc2626] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm md:text-xs">
              Top events
            </span>
            <div
              className="relative flex min-h-[5.25rem] w-full flex-col items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-[#0b3c8a] via-[#0a2f6b] to-[#081f4d] px-2 py-2 text-center font-bold shadow-[0_8px_22px_rgba(1,45,114,0.32),0_3px_10px_rgba(0,0,0,0.12)] ring-1 ring-white/10 md:min-h-[5.75rem] md:px-2.5 md:py-2.5 lg:min-h-[6rem]"
              aria-hidden
            >
              <div
                className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-tr from-white/10 via-transparent to-white/5"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -left-6 top-0 z-[1] h-full w-16 bg-blue-400/30 blur-2xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute right-0 top-0 z-[1] h-full w-10 bg-white/20 blur-xl opacity-60"
                aria-hidden
              />
              <div className="relative z-10 flex w-full flex-col items-center justify-center text-center">
                <div className="text-lg font-black leading-[0.92] tracking-tight text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.45)] md:text-xl md:leading-[0.9] lg:text-2xl">
                  {dateLine1}
                </div>
                {dateLine2 ? (
                  <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.5)] md:mt-1 md:text-[10px] lg:text-xs">
                    {dateLine2}
                  </div>
                ) : null}
                {dateYear ? (
                  <div className="mt-0.5 text-[8px] font-semibold tabular-nums tracking-[0.08em] text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.5)] md:text-[9px] lg:text-[10px]">
                    {dateYear}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <h3 className="mb-2 line-clamp-2 min-h-[2.75rem] text-lg font-bold leading-tight tracking-tight text-white drop-shadow-md transition-transform duration-300 group-hover:translate-y-0.5 md:min-h-[3rem] md:text-xl lg:text-2xl">
            {vipCardTitleDisplay(event.subTitle || event.title)}
          </h3>

          <div className="flex items-center truncate text-sm text-white/85 transition-transform duration-300 group-hover:translate-y-0.5">
            <MapPin className="mr-1 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            <span className="truncate">{locationDisplay}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

const AUTO_ADVANCE_MS = 5000

export default function HeroSlideshowClient({
  initialEvents,
  homeCity,
  homeCountry,
}: {
  initialEvents: Event[]
  homeCity?: string | null
  homeCountry?: string | null
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Single source of truth for "does this event get a slot": resolve the
  // image URL once per event, and only keep events where one was found.
  // Previously the outer filter (`hasDisplayableEventImage`) and the inner
  // check inside EventCard (`cardImageUrl`) could disagree — an event would
  // pass the outer filter, get a sized wrapper `<div>` in the row, and then
  // EventCard would render `null` inside it, leaving a blank, correctly
  // sized gap in the slider. Filtering here with the exact same function
  // EventCard uses guarantees every rendered slot has real content.
  const events = initialEvents
    .filter((e) => hasDisplayableEventImage(e))
    .map((event) => ({ event, imageUrl: cardImageUrl(event) }))
    .filter((entry): entry is { event: Event; imageUrl: string } => Boolean(entry.imageUrl))

  const advance = useCallback((dir: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    if (el.scrollWidth <= el.clientWidth + 8) return
    const step = Math.max(280, el.clientWidth * 0.8)
    if (dir === "right") {
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
      if (atEnd) el.scrollTo({ left: 0, behavior: "smooth" })
      else el.scrollBy({ left: step, behavior: "smooth" })
    } else {
      const atStart = el.scrollLeft <= 4
      if (atStart) el.scrollTo({ left: el.scrollWidth - el.clientWidth, behavior: "smooth" })
      else el.scrollBy({ left: -step, behavior: "smooth" })
    }
  }, [])

  useEffect(() => {
    if (events.length <= 1) return
    const id = window.setInterval(() => {
      const el = scrollRef.current
      if (!el || el.scrollWidth <= el.clientWidth + 8) return
      advance("right")
    }, AUTO_ADVANCE_MS)
    return () => window.clearInterval(id)
  }, [events.length, advance])

  if (!events.length) {
    return (
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <HomeSectionEmptyState
          icon="trending"
          title="No VIP events in this region"
          description={homeEmptyDescription("VIP events with images", homeCity, homeCountry)}
          homeCity={homeCity}
          homeCountry={homeCountry}
          actions={[
            { label: "Browse all events", href: "/event" },
            { label: "Add event", href: "/organizer-signup", variant: "secondary" },
          ]}
          className="min-h-[280px] lg:min-h-[320px]"
        />
      </div>
    )
  }

  return (
    <div className="relative w-full min-w-0" aria-label="VIP events">
      <div
        ref={scrollRef}
        className="no-scrollbar flex w-full scroll-smooth snap-x snap-mandatory gap-0 overflow-x-auto overflow-y-hidden pt-0 pb-3"
        style={{ scrollbarWidth: "none" }}
      >
        {events.map(({ event, imageUrl }) => (
          <div
            key={event.id}
            className="w-[min(100%,88vw)] shrink-0 snap-start sm:w-80 lg:w-1/5 lg:min-w-0"
          >
            <EventCard event={event} imageUrl={imageUrl} />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => advance("left")}
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/95 p-2 shadow-lg ring-1 ring-black/5 hover:bg-white"
      >
        <ChevronLeft className="h-6 w-6 text-gray-700" strokeWidth={2} />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => advance("right")}
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/95 p-2 shadow-lg ring-1 ring-black/5 hover:bg-white"
      >
        <ChevronRight className="h-6 w-6 text-gray-700" strokeWidth={2} />
      </button>
    </div>
  )
}