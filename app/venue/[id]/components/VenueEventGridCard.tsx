"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { eventPublicPath } from "@/lib/event-path"
import { Calendar, Star, User } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { formatVenueDateTime, getEventImage } from "../lib/venue-detail-utils"
import type { VenueEvent } from "../types/venue-detail.types"

type VenueEventGridCardProps = {
  event: VenueEvent
}

export function VenueEventGridCard({ event }: VenueEventGridCardProps) {
  const router = useRouter()

  return (
    <div
      className="cursor-pointer overflow-hidden border-2 transition-shadow duration-300 hover:shadow-lg"
      onClick={() => router.push(eventPublicPath(event))}
    >
      <div className="relative h-48 w-full">
        <Image src={getEventImage(event)} alt={event.title} fill className="object-cover" />
        <div className="absolute left-3 top-3">
          <Badge
            variant={
              event.status === "PUBLISHED" ? "default" : event.status === "DRAFT" ? "secondary" : "destructive"
            }
            className="bg-black/70 text-white"
          >
            {event.status}
          </Badge>
        </div>
        <div className="absolute right-3 top-3">
          <Badge variant="outline" className="bg-white/90">
            {event.eventType}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-3 pt-4">
        <CardTitle className="line-clamp-2 text-lg">{event.title}</CardTitle>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{formatVenueDateTime(event.startDate)}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <p className="line-clamp-2 text-sm text-gray-600">{event.shortDescription || event.description}</p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4 text-gray-500" />
            <span>
              {event.currentAttendees}
              {event.maxAttendees ? ` / ${event.maxAttendees}` : ""} attendees
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400" />
            <span>{event.averageRating > 0 ? event.averageRating.toFixed(1) : "No ratings"}</span>
            {event.totalReviews > 0 ? <span className="text-gray-500">({event.totalReviews})</span> : null}
          </div>
        </div>
        <div className="mb-3 flex items-center justify-end pt-2">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              router.push(eventPublicPath(event))
            }}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </div>
  )
}
