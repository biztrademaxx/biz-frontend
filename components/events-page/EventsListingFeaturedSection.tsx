"use client"

import { AppImage } from "@/components/app-image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, ChevronLeft, ChevronRight, Heart, MapPin, ShieldCheck } from "lucide-react"
import { EVENT_VENUE_LOCATION_PENDING } from "@/lib/event-location-copy"
import { resolvedVerifiedBadgeImageUrl } from "@/lib/verified-event-badge"
import type { Event } from "./listing-types"
import { formatListingDateShort, getListingEventPrimaryImage } from "./listing-utils"

export type EventsListingFeaturedSectionProps = {
  featuredEvents: Event[]
  currentSlide: number
  setCurrentSlide: React.Dispatch<React.SetStateAction<number>>
  onVisit: (eventId: string, eventTitle: string) => void
}

export function EventsListingFeaturedSection({
  featuredEvents,
  currentSlide,
  setCurrentSlide,
  onVisit,
}: EventsListingFeaturedSectionProps) {
  if (featuredEvents.length === 0) return null

  return (
    <section className="py-10 mt-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="type-section-heading text-2xl sm:text-3xl text-gray-900 underline decoration-blue-600 decoration-4">
          ✨ Featured Events
        </h2>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-green-600" />

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
              className="p-2 border rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentSlide((prev) => Math.min(Math.ceil(featuredEvents.length / 3) - 1, prev + 1))
              }
              className="p-2 border rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredEvents
          .sort((a, b) => (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0))
          .slice(currentSlide * 3, currentSlide * 3 + 3)
          .map((event) => {
            const badgeImgUrl = resolvedVerifiedBadgeImageUrl(event.isVerified, event.verifiedBadgeImage)
            return (
              <Card
                key={event.id}
                className="hover:shadow-xl transition-all duration-300 border border-gray-300 rounded-sm overflow-hidden group"
              >
                <div className="relative aspect-video overflow-hidden">
                  <AppImage
                    src={getListingEventPrimaryImage(event)}
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 cursor-pointer">
                    <Heart className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="absolute top-3 left-3 flex space-x-2">
                    <Badge className="bg-blue-600 text-white text-sm font-bold px-3 py-1.5 shadow-lg">
                      Featured ✨
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="type-event-card-title text-2xl text-gray-900 line-clamp-2 flex-1">{event.title}</h3>
                    {badgeImgUrl ? (
                      <AppImage src={badgeImgUrl} alt="Verified" width={40} height={40} className="ml-1 h-10 w-10 object-contain" />
                    ) : null}
                  </div>
                  <div className="flex items-center text-base text-gray-700 mb-2 font-bold">
                    <MapPin className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" />
                    <span className="truncate">{event.location?.city || EVENT_VENUE_LOCATION_PENDING}</span>
                  </div>
                  <div className="flex items-center text-base text-gray-700 mb-4 font-bold">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" />
                    <span>{formatListingDateShort(event.timings.startDate)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-5">
                    <Badge className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1.5 border border-blue-200">
                      {event.categories[0] || "Event"}
                    </Badge>
                    <span className="text-lg font-black text-green-700">
                      ⭐ {Number.isFinite(event.rating?.average) ? event.rating.average.toFixed(1) : "0.0"}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-3 px-4 rounded-sm text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onVisit(event.id, event.title)
                    }}
                  >
                    Visit Event
                  </button>
                </CardContent>
              </Card>
            )
          })}
      </div>

      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({ length: Math.ceil(featuredEvents.length / 3) }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentSlide(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === currentSlide ? "bg-blue-600 w-8" : "bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </section>
  )
}
