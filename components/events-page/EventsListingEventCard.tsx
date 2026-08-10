"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { ShareButton } from "@/components/share-button"
import { EventCardFollowStrip } from "@/components/event-listing/EventCardFollowStrip"
import { eventPublicPath } from "@/lib/event-path"
import type { Event } from "./listing-types"
import { EventListingCardImages } from "./EventListingCardImages"
import { EventListingVerifiedBadge } from "./EventListingVerifiedBadge"
import { formatListingDateShort, formatListingYear, normalizeEventImageUrls } from "./listing-utils"
import { trackSearchClick } from "@/lib/search-click"

export function EventsListingEventCard({
  event,
  searchQuery,
  position,
  page,
}: {
  event: Event
  searchQuery?: string
  position?: number
  page?: number
}) {
  const path = eventPublicPath(event)
  const evRecord = event as unknown as Record<string, unknown>

  const onNavigate = () => {
    trackSearchClick({
      eventId: event.id,
      query: searchQuery,
      position,
      page,
      listingSource: "events_list",
    })
  }

  return (
    // Updated: Added border, shadow, and hover effects
    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden w-full shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:border-[#002C71]/30">
      {/* Reduced padding and spacing */}
      <div className="px-3 pt-2 sm:px-4 sm:pt-2.5">
        <Link href={path} className="group block" onClick={onNavigate}>
          <p className="mb-0.5 text-[10px] font-medium text-gray-600 sm:text-xs">
            {formatListingDateShort(event.timings.startDate)}
            {event.timings.endDate && <> - {formatListingDateShort(event.timings.endDate)}</>} {formatListingYear(event.timings.startDate)}
          </p>
          <div className="flex flex-wrap items-start gap-2">
            {/* Reduced heading font size */}
            <h3 className="type-event-card-title min-w-0 flex-1 text-left text-[15px] leading-tight text-[#1F5D84] break-words sm:text-[17px] group-hover:underline">
              {event.title}
            </h3>
            {event.isVerified ? (
              <EventListingVerifiedBadge
                event={event}
                className="shrink-0 self-start p-0 pt-0.5 [&_img]:h-7 [&_img]:max-h-7 [&_img]:max-w-[90px]"
              />
            ) : null}
          </div>
        </Link>
      </div>

      {/* Reduced min-height */}
      <div className="flex flex-col md:flex-row md:items-start">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col px-3 pb-2 pt-1 sm:px-4 sm:pb-2 sm:pt-2">
          <Link href={path} className="group flex min-h-0 min-w-0 flex-1 flex-col" onClick={onNavigate}>
            <p className="mb-1 flex items-center text-[11px] font-normal font-sans text-[#212529] sm:text-xs">
              <MapPin className="mr-1 h-3 w-3 shrink-0 text-[#6C757D] sm:h-3.5 sm:w-3.5" />
              <span className="line-clamp-1">
                {event.location?.city}, {event.location?.country}
              </span>
            </p>

            {/* Updated: 3 lines with truncation */}
            <p
              className="
                mb-1.5
                max-w-[95%]
                text-left
                break-words
                whitespace-normal
                text-[11px]
                font-normal
                font-sans
                leading-snug
                text-gray-700
                line-clamp-3
                sm:text-xs
              "
            >
              {event.description}
            </p>

            <div className="mt-auto flex flex-wrap gap-1.5">
              {event.categories.slice(0, 3).map((cat, i) => (
                <span
                  key={i}
                  className="
                    bg-[#F8F9FA]
                    text-[#666666]
                    px-1.5
                    py-0.5
                    rounded
                    text-[10px]
                    font-normal
                    leading-none
                    font-sans
                    sm:text-[11px]
                  "
                >
                  {cat}
                </span>
              ))}
            </div>
          </Link>
        </div>

        <div className="flex w-full shrink-0 flex-col items-stretch md:w-[140px] md:shrink-0">
          <div className="flex flex-1 flex-col px-3 pb-1.5 pt-1.5 md:px-3 md:pb-1.5 md:pl-0 md:pt-2">
            <div className="mt-auto w-full">
              <EventListingCardImages href={path} urls={normalizeEventImageUrls(evRecord)} title={event.title} />
            </div>
          </div>
        </div>
      </div>

      {/* Reduced padding */}
      <div
        className="flex flex-nowrap items-center gap-2 px-3 py-1 sm:px-4 sm:gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0 flex-1 overflow-hidden">
          <EventCardFollowStrip
            eventId={event.id}
            eventPath={path}
            eventTitle={event.title}
            followerPreview={event.followerPreview ?? []}
            followersCount={typeof event.followersCount === "number" ? event.followersCount : 0}
          />
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <div className="inline-flex h-7 items-center gap-1 rounded-md px-1 text-gray-700 sm:px-1.5" title="Rating">
            <Image
              src="/icons/rating-xxl.png"
              alt=""
              width={18}
              height={7}
              className="shrink-0 opacity-90"
            />
            <span className="text-xs font-semibold tabular-nums sm:text-sm">
              {Number.isFinite(event.rating?.average) ? event.rating.average.toFixed(1) : "0.0"}
            </span>
          </div>
          <ShareButton
            id={event.id}
            title={event.title}
            type="event"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 sm:h-8 sm:w-8"
          >
            <Image
              src="/icons/sharing_icon.png"
              alt="Share"
              width={16}
              height={12}
              className="cursor-pointer opacity-80 sm:w-[18px] sm:h-[14px]"
            />
          </ShareButton>
        </div>
      </div>
    </div>
  )
}