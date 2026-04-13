"use client"

import Link from "next/link"
import { Share2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { FeaturedEventPayload } from "@/lib/events/types"
import { eventPublicPath } from "@/lib/event-path"
import {
  eventsForFeaturedSlots,
  featuredEventCategoryLabels,
  featuredEventLocationLine,
  formatFeaturedDateRange,
} from "./utils/featured-event-card.helpers"

const ROTATE_MS = 5000
const SLOT_COUNT = 9

async function shareFeaturedEvent(title: string, path: string) {
  const url =
    typeof window !== "undefined" && path.startsWith("/")
      ? `${window.location.origin}${path}`
      : path
  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title, url })
      return
    }
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url)
    }
  } catch {
    /* user cancelled or clipboard blocked */
  }
}

function FeaturedEventCard({ event }: { event: FeaturedEventPayload }) {
  const start = new Date(event.startDate)
  const end = new Date(event.endDate)
  const formattedDate = formatFeaturedDateRange(start, end)
  const href = eventPublicPath({ id: event.id, slug: event.slug })
  const labels = featuredEventCategoryLabels(event).slice(0, 3)
  const thumb = event.bannerImage || "/herosection-images/food.jpg"

  return (
    <div className="rounded-md border border-gray-200 bg-white p-2 shadow-sm transition-shadow hover:shadow-md">
      <Link href={href} className="block cursor-pointer">
        <div className="text-sm font-medium leading-snug text-gray-800">{formattedDate}</div>
        <div className="mt-1 flex w-full justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="min-h-[3rem]">
              <span className="line-clamp-2 font-bold text-gray-900">{event.title}</span>
            </div>
            <div className="mt-0.5 line-clamp-2 text-sm text-gray-800">
              {featuredEventLocationLine(event)}
            </div>
          </div>
          <img
            src={thumb}
            alt={event.title}
            width={64}
            height={64}
            className="mt-0.5 h-16 w-16 flex-shrink-0 rounded-md border border-gray-200 object-cover"
          />
        </div>
      </Link>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {labels.length > 0 ? (
            labels.map((label) => (
              <Link
                key={`${event.id}-${label}`}
                href={`/event?category=${encodeURIComponent(label)}`}
                className="inline-block max-w-[140px] truncate rounded-md bg-gray-100 px-1.5 py-0.5 text-xs leading-none text-gray-600 no-underline hover:text-gray-900"
              >
                {label}
              </Link>
            ))
          ) : (
            <span className="inline-block rounded-md bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
              Event
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label={`Share ${event.title}`}
          className="flex-shrink-0 rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
          onClick={() => shareFeaturedEvent(event.title, href)}
        >
          <Share2 className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}

function PlaceholderCard({ index }: { index: number }) {
  return (
    <div aria-hidden className="rounded-md border border-gray-200 bg-white p-2 shadow-sm">
      <div className="home-shimmer h-3 w-36 rounded" />
      <div className="mt-2 flex justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="home-shimmer h-10 w-full rounded" />
          <div className="home-shimmer h-4 w-[66%] max-w-[180px] rounded" />
        </div>
        <div className="home-shimmer h-16 w-16 flex-shrink-0 rounded-md" />
      </div>
      <div className="mt-3 flex justify-between gap-2">
        <div className="flex gap-1">
          <div className="home-shimmer h-5 w-16 rounded" />
          <div className="home-shimmer h-5 w-20 rounded" />
        </div>
        <div className="home-shimmer h-8 w-8 rounded-md" />
      </div>
      <span className="sr-only">Placeholder featured event {index + 1}</span>
    </div>
  )
}

export interface FeaturedEventsGridClientProps {
  events: FeaturedEventPayload[]
}

export default function FeaturedEventsGridClient({ events }: FeaturedEventsGridClientProps) {
  const n = events.length
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    setOffset(0)
  }, [n])

  useEffect(() => {
    if (n <= 1) return
    const id = window.setInterval(() => {
      setOffset((o) => (o + 1) % n)
    }, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [n])

  const slotEvents = useMemo(
    () => eventsForFeaturedSlots(events, offset, SLOT_COUNT),
    [events, offset],
  )

  if (events.length === 0) {
    return (
      <div className="col-12">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:grid-rows-3 md:gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <PlaceholderCard key={i} index={i} />
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <Link
            href="/organizer-signup"
            className="inline-flex w-[120px] items-center justify-center rounded-md border border-[#002C71] px-3 py-2 text-sm font-medium text-[#002C71] transition-colors hover:bg-[#002C71]/5"
          >
            Add Event
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative col-12" role="region" aria-label="Featured events">
      <div
        className="grid grid-cols-1 gap-3 md:grid-cols-3 md:grid-rows-3 md:gap-4"
        aria-live="polite"
        aria-atomic="false"
      >
        {slotEvents.map((event, slotIndex) => (
          <div key={slotIndex} className="min-h-0 min-w-0">
            <FeaturedEventCard event={event} />
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-4">
        <Link
          href="/organizer-signup"
          className="inline-flex w-[120px] items-center justify-center rounded-md border border-[#002C71] px-3 py-2 text-sm font-medium text-[#002C71] transition-colors hover:bg-[#002C71]/5"
        >
          Add Event
        </Link>
      </div>
    </div>
  )
}
