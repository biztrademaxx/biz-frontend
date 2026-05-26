"use client"

import { ShareButton } from "@/components/share-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building, Calendar, CheckCircle, ChevronLeft, ChevronRight, Loader2, MapPin, Star } from "lucide-react"
import Image from "next/image"
import type { VenueDetail } from "../types/venue-detail.types"
import { getGalleryImage, getVenueDisplayName } from "../lib/venue-detail-utils"

type VenueHeroGalleryProps = {
  venue: VenueDetail
  images: string[]
  currentImageIndex: number
  onSelectImage: (index: number) => void
  onPrev: () => void
  onNext: () => void
  showScheduleMeeting: boolean
  schedulingMeeting: boolean
  onScheduleMeeting: () => void
}

export function VenueHeroGallery({
  venue,
  images,
  currentImageIndex,
  onSelectImage,
  onPrev,
  onNext,
  showScheduleMeeting,
  schedulingMeeting,
  onScheduleMeeting,
}: VenueHeroGalleryProps) {
  const displayName = getVenueDisplayName(venue)
  const locationLine = [
    venue.location?.address || venue.venueAddress,
    venue.location?.city,
    venue.location?.state,
    venue.location?.country,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <div className="relative h-56 overflow-hidden sm:h-72 md:h-96">
      {images.length > 0 ? (
        <Image
          src={getGalleryImage(images, currentImageIndex)}
          alt={displayName}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
          <div className="px-4 text-center">
            <Building className="mx-auto mb-3 h-16 w-16 text-gray-400 sm:h-24 sm:w-24" />
            <h2 className="mb-1 text-lg font-bold text-gray-700 sm:text-2xl">{displayName}</h2>
            <p className="text-sm text-gray-600">No images available</p>
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-black/40" />

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/30 sm:left-4"
          >
            <ChevronLeft className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/30 sm:right-4"
          >
            <ChevronRight className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          </button>
        </>
      ) : null}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 to-transparent px-4 pb-6 pt-16 sm:px-6 sm:pb-8 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
                  {displayName}
                </h1>
                {venue.manager.isVerified ? (
                  <Badge className="shrink-0 bg-green-500 text-white">
                    <CheckCircle className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Verified
                  </Badge>
                ) : null}
              </div>
              <div className="mb-2 flex items-start gap-2 text-sm text-white/90 sm:text-base">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                <span className="line-clamp-2 sm:line-clamp-none">{locationLine || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/90 sm:text-base">
                <Star className="h-4 w-4 shrink-0 fill-current text-yellow-400 sm:h-5 sm:w-5" />
                <span className="font-medium">{venue.stats.averageRating.toFixed(1)}</span>
                <span>({venue.stats.totalReviews} reviews)</span>
              </div>
            </div>
            <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto sm:justify-end">
              <ShareButton id={venue.id} title={displayName} type="venue" />
              {showScheduleMeeting ? (
                <Button
                  onClick={onScheduleMeeting}
                  disabled={schedulingMeeting}
                  className="h-9 flex-1 bg-red-600 text-white hover:bg-red-700 sm:flex-none sm:px-4"
                  size="sm"
                >
                  {schedulingMeeting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="sr-only sm:not-sr-only">Scheduling...</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="mr-2 h-4 w-4 shrink-0" />
                      <span className="truncate">Schedule Meeting</span>
                    </>
                  )}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {images.length > 1 ? (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 sm:bottom-4 sm:gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Show image ${index + 1}`}
              onClick={() => onSelectImage(index)}
              className={`h-1.5 w-1.5 rounded-full transition-colors sm:h-2 sm:w-2 ${
                index === currentImageIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
