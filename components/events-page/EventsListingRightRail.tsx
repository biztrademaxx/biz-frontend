"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ShieldCheck, UserPlus } from "lucide-react"
import { AppImage } from "@/components/app-image"
import AdCard from "@/components/add-card"
import { EVENT_VENUE_LOCATION_PENDING } from "@/lib/event-location-copy"
import { resolvedVerifiedBadgeImageUrl } from "@/lib/verified-event-badge"
import type { Event } from "./listing-types"
import { TrendingEventsSideCard } from "./TrendingEventsSideCard"
import { EVENTS_LISTING_STICKY_TOP_CLASS } from "./listing-constants"
import { getListingEventPrimaryImage } from "./listing-utils"

export type EventsListingRightRailProps = {
  trendingSidebarEvents: Event[]
  featuredFirst: Event | undefined
  onVisit: (eventId: string, eventTitle: string) => void
}

export function EventsListingRightRail({ trendingSidebarEvents, featuredFirst, onVisit }: EventsListingRightRailProps) {
  return (
    <div className="lg:col-span-4 order-3 w-full">
      <div className={`lg:sticky ${EVENTS_LISTING_STICKY_TOP_CLASS} z-10 space-y-6 self-start`}>
        <div className="w-full">
          <AdCard />
        </div>

        <div className="flex items-center justify-between">
          <h3 className="type-section-heading text-2xl text-gray-900">🔥 Trending Events</h3>
        </div>

        <div className="hidden lg:block">
          {trendingSidebarEvents.map((event) => (
            <TrendingEventsSideCard
              key={event.id}
              event={event}
              imageUrl={getListingEventPrimaryImage(event) }
            />
          ))}
        </div>

        <div className="lg:hidden">
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {trendingSidebarEvents.map((event) => (
              <div key={event.id} className="w-[min(100%,340px)] shrink-0 snap-start">
                <TrendingEventsSideCard
                  event={event}
                  imageUrl={getListingEventPrimaryImage(event) }
                />
              </div>
            ))}
          </div>
        </div>

        {featuredFirst && (
          <Card className="bg-white shadow-xl border border-gray-300 rounded-sm overflow-hidden">
            <div className="relative aspect-video">
              <AppImage
                src={getListingEventPrimaryImage(featuredFirst)}
                alt={featuredFirst.title}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
              />
              <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg">
                <Heart className="w-5 h-5 text-gray-700" />
              </div>
              <div className="absolute top-3 left-3 flex space-x-2">
                <Badge className="bg-blue-600 text-white text-sm font-bold px-3 py-1.5 shadow-lg">Expo</Badge>
                <Badge className="bg-blue-600 text-white text-sm font-bold px-3 py-1.5 shadow-lg">Business</Badge>
                {featuredFirst.isVerified && (
                  <Badge className="bg-green-600 text-white text-sm font-bold px-3 py-1.5 shadow-lg">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="absolute bottom-3 right-3 bg-green-100 text-green-800 px-4 py-2 rounded-sm text-sm font-bold shadow-lg">
                ⭐{" "}
                {Number.isFinite(featuredFirst.rating?.average) ? featuredFirst.rating.average.toFixed(1) : "0.0"}
              </div>
            </div>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="type-event-card-title text-xl text-gray-900 flex-1">{featuredFirst.title}</h3>
                {(() => {
                  const url = resolvedVerifiedBadgeImageUrl(
                    featuredFirst.isVerified,
                    featuredFirst.verifiedBadgeImage,
                  )
                  return url ? (
                    <AppImage src={url} alt="Verified" width={24} height={24} className="w-6 h-6 ml-2 object-contain" />
                  ) : null
                })()}
              </div>
              <button
                type="button"
                className="w-full flex items-center justify-center bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-4 rounded-sm text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onVisit(featuredFirst.id, featuredFirst.title)
                }}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Visit Event
              </button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
