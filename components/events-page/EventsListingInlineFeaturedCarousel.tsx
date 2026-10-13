"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EventsListingEventCard } from "./EventsListingEventCard"
import type { Event } from "./listing-types"
import { EVENTS_LISTING_INLINE_FEATURED_AUTO_MS } from "./listing-constants"

export type EventsListingInlineFeaturedCarouselProps = {
  featuredEvents: Event[]
  /** Defaults to `EVENTS_LISTING_INLINE_FEATURED_AUTO_MS` from listing constants. */
  autoAdvanceMs?: number
  /** Reserved for callers; carousel UI stays minimal regardless. */
  promoSource?: "featured" | "curated"
}

export function EventsListingInlineFeaturedCarousel({
  featuredEvents,
  autoAdvanceMs = EVENTS_LISTING_INLINE_FEATURED_AUTO_MS,
}: EventsListingInlineFeaturedCarouselProps) {
  // Keep caller order (plan tier → nearest start date). Do not re-rank by verified.
  const pool = featuredEvents

  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const len = pool.length
  const clamped = len === 0 ? 0 : ((index % len) + len) % len

  useEffect(() => {
    if (len === 0) {
      setIndex(0)
      return
    }
    setIndex((i) => ((i % len) + len) % len)
  }, [len])

  useEffect(() => {
    if (len <= 1 || paused) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % len)
    }, autoAdvanceMs)
    return () => clearInterval(timer)
  }, [len, paused, autoAdvanceMs])

  const go = useCallback(
    (delta: number) => {
      if (len === 0) return
      setIndex((i) => (i + delta + len) % len)
    },
    [len],
  )

  if (len === 0) return null

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-sm">
        <div
          className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{
            width: `${len * 100}%`,
            transform: `translateX(-${(100 / len) * clamped}%)`,
          }}
        >
          {pool.map((event) => (
            <div
              key={event.id}
              className="group relative shrink-0 overflow-hidden px-0.5"
              style={{ width: `${100 / len}%` }}
            >
              <div className="absolute left-0 top-0 h-full w-1 overflow-hidden">
                <div className="absolute bottom-0 h-0 w-full bg-red-500 transition-all duration-500 ease-out group-hover:h-full" />
              </div>

              <EventsListingEventCard event={event} />
            </div>
          ))}
        </div>
      </div>

      {len > 1 ? (
        <div className="mt-3 flex items-center justify-between gap-3 sm:mt-3.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => go(-1)}
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex min-w-0 flex-1 justify-center gap-1.5">
            {pool.map((event, i) => (
              <button
                key={event.id}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-1.5 shrink-0 rounded-full transition-all duration-300 ${
                  i === clamped ? "w-6 bg-[#1F5D84]" : "w-1.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to slide ${i + 1} of ${len}`}
              />
            ))}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => go(1)}
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </div>
  )
}
