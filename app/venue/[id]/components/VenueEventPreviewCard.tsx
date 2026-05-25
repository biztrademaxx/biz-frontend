"use client"

import { Badge } from "@/components/ui/badge"
import { eventPublicPath } from "@/lib/event-path"
import { formatPublicTicketPriceLine } from "@/lib/ticket-price-display"
import { Star } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { getEventStatus, getStatusBadgeText, getStatusBadgeVariant } from "../lib/event-status"
import { formatVenueDate, getEventImage } from "../lib/venue-detail-utils"
import type { VenueEvent } from "../types/venue-detail.types"

type VenueEventPreviewCardProps = {
  event: VenueEvent
}

export function VenueEventPreviewCard({ event }: VenueEventPreviewCardProps) {
  const router = useRouter()
  const eventStatus = getEventStatus(event)

  return (
    <div
      className="flex w-full cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-200 shadow-sm transition hover:border-blue-300 hover:shadow-md sm:w-[48%] sm:flex-row"
      onClick={() => router.push(eventPublicPath(event))}
    >
      <div className="relative mb-4 h-44 sm:mb-0 sm:h-auto sm:w-2/5">
        <Image src={getEventImage(event)} alt={event.title} fill className="m-2 rounded-sm object-cover" />
      </div>
      <div className="flex flex-col justify-between p-4 sm:w-3/5">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <h3
              className="cursor-pointer text-sm font-semibold text-blue-800 hover:underline"
              onClick={(e) => {
                e.stopPropagation()
                router.push(eventPublicPath(event))
              }}
            >
              {event.title}
            </h3>
            <Badge variant={getStatusBadgeVariant(eventStatus)} className="px-2 py-0.5 text-xs">
              {getStatusBadgeText(eventStatus)}
            </Badge>
          </div>
          <p className="mb-2 text-xs text-gray-500">
            {formatVenueDate(event.startDate)} – {formatVenueDate(event.endDate)}
          </p>
          <p className="line-clamp-3 text-sm text-gray-600">{event.shortDescription || event.description}</p>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-gray-300 bg-gray-50 text-xs text-gray-700">
              {event.category}
            </Badge>
            {event.tags?.slice(0, 2).map((tag, i) => (
              <Badge
                key={`${event.id}-tag-${i}`}
                variant="outline"
                className="border-gray-300 bg-gray-50 text-xs text-gray-700"
              >
                {tag}
              </Badge>
            ))}
            <div className="flex items-center text-xs text-gray-600">
              <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{event.averageRating?.toFixed(1) || "0.0"}</span>
            </div>
          </div>
          <div className="text-sm font-semibold text-blue-700">
            {Array.isArray(event.ticketTypes) ? formatPublicTicketPriceLine(event.ticketTypes) : "Free"}
          </div>
        </div>
      </div>
    </div>
  )
}
