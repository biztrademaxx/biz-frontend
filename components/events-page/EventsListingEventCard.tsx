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

export function EventsListingEventCard({ event }: { event: Event }) {
  const path = eventPublicPath(event)
  const evRecord = event as unknown as Record<string, unknown>

  return (
    <div className="bg-white border border-gray-300 rounded-sm overflow-hidden w-full hover:shadow-lg transition-shadow duration-300">
      <div className="px-4 pt-2.5 sm:px-5 sm:pt-3">
        <Link href={path} className="group block">
          <p className="mb-0.5 text-[11px] font-medium text-gray-600 sm:text-xs">
            {formatListingDateShort(event.timings.startDate)}
            {event.timings.endDate && <> - {formatListingDateShort(event.timings.endDate)}</>} {formatListingYear(event.timings.startDate)}
          </p>
          <div className="flex flex-wrap items-start gap-2">
            <h3 className="min-w-0 flex-1 text-left text-[17px] font-bold leading-tight text-[#1F5D84] break-words sm:text-[19px] group-hover:underline">
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

      <div className="flex flex-col md:flex-row md:items-start md:min-h-[188px]">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col px-4 pb-2.5 pt-1.5 sm:px-5 sm:pb-2.5 sm:pt-2.5">
          <Link href={path} className="group flex min-h-0 min-w-0 flex-1 flex-col">
            <p className="mb-1.5 flex items-center text-[12px] font-normal font-sans text-[#212529] sm:text-[13px]">
              <MapPin className="mr-1 h-3.5 w-3.5 shrink-0 text-[#6C757D] sm:h-4 sm:w-4" />
              <span className="line-clamp-1">
                {event.location?.city}, {event.location?.country}
              </span>
            </p>

            <p
              className="
    mb-1.5
    max-w-[95%]
    text-left
    break-words
    whitespace-normal
    text-[12px]
    font-normal
    font-sans
    leading-snug
    text-gray-700
    line-clamp-5
    sm:text-[13px]
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
        text-[11px]
        font-normal
        leading-none
        font-sans
      "
                >
                  {cat}
                </span>
              ))}
            </div>
          </Link>
        </div>

        <div className="flex w-full shrink-0 flex-col items-stretch md:w-[156px] md:shrink-0">
          <div className="flex flex-1 flex-col px-3 pb-1.5 pt-1.5 md:px-3 md:pb-1.5 md:pl-0 md:pt-2.5">
            <div className="mt-auto w-full">
              <EventListingCardImages href={path} urls={normalizeEventImageUrls(evRecord)} title={event.title} />
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex flex-nowrap items-center gap-2 px-4 py-1.5 sm:px-5 sm:gap-3"
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
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="inline-flex h-8 items-center gap-1 rounded-md px-1.5 text-gray-700 sm:px-2" title="Rating">
            <Image
              src="/icons/rating-xxl.png"
              alt=""
              width={20}
              height={8}
              className="shrink-0 opacity-90"
            />
            <span className="text-sm font-semibold tabular-nums">
              {Number.isFinite(event.rating?.average) ? event.rating.average.toFixed(1) : "0.0"}
            </span>
          </div>
          <ShareButton
            id={event.id}
            title={event.title}
            type="event"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <Image
              src="/icons/sharing_icon.png"
              alt="Share"
              width={18}
              height={14}
              className="cursor-pointer opacity-80"
            />
          </ShareButton>
        </div>
      </div>
    </div>
  )
}
