"use client"

import Link from "next/link"
import { Users, Bookmark } from "lucide-react"
import { eventPublicPath } from "@/lib/event-path"
import type { Event } from "./listing-types"
import {
  formatMembersShort,
  formatTrendingEventDateRange,
  trendingCardSubtitle,
  trendingLocationLine,
} from "./listing-utils"

export function TrendingEventsSideCard({ event, imageUrl }: { event: Event; imageUrl: string }) {
  const path = eventPublicPath(event)
  const followers = typeof event.followersCount === "number" ? event.followersCount : 0
  const subtitle = trendingCardSubtitle(event)

  return (
    <Link href={path} className="group block">
      <article className="mb-3 rounded-sm border border-gray-100 bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.08),0_4px_20px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
        <div className="mb-1.5 flex items-center justify-end gap-1.5 text-xs font-medium leading-none text-gray-800">
          <span className="h-3.5 w-3.5 shrink-0 rounded-sm bg-amber-400" aria-hidden />
          <span>Trending</span>
        </div>
        <p className="mb-1 text-xs font-medium leading-tight text-gray-800">
          {formatTrendingEventDateRange(event.timings.startDate, event.timings.endDate)}
        </p>
        <div className="relative pr-14">
          <p className="line-clamp-2 pr-1 text-sm font-bold leading-snug text-[#1F5D84] group-hover:underline">
            {subtitle}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={event.title}
            className="absolute right-0 top-0 h-12 w-12 rounded-sm border border-gray-100 object-cover"
          />
        </div>
        <p className="mt-1 text-xs font-semibold leading-tight text-gray-900 line-clamp-1">
          {trendingLocationLine(event)}
        </p>
        {(event.categories?.length ?? 0) > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1 overflow-hidden max-h-[1.5rem]">
            {event.categories.slice(0, 2).map((cat) => (
              <span
                key={cat}
                className="inline-block max-w-[7.5rem] truncate rounded bg-gray-100 px-1.5 py-0.5 text-[11px] leading-none text-gray-600"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
        <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
          <span className="inline-flex items-center gap-1 text-xs text-gray-700">
            <Users className="h-3.5 w-3.5 shrink-0 text-gray-600" aria-hidden />
            {formatMembersShort(followers)} Members
          </span>
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors group-hover:bg-gray-200"
            aria-hidden
          >
            <Bookmark className="h-3.5 w-3.5" fill="currentColor" />
          </span>
        </div>
      </article>
    </Link>
  )
}
