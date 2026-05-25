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

  return (
    <div className="relative h-96 overflow-hidden">
      {images.length > 0 ? (
        <Image src={getGalleryImage(images, currentImageIndex)} alt={displayName} fill className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
          <div className="text-center">
            <Building className="mx-auto mb-4 h-24 w-24 text-gray-400" />
            <h2 className="mb-2 text-2xl font-bold text-gray-700">{displayName}</h2>
            <p className="text-gray-600">No images available</p>
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-black/40" />

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </>
      ) : null}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-4xl font-bold text-white">{displayName}</h1>
                {venue.manager.isVerified ? (
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Verified
                  </Badge>
                ) : null}
              </div>
              <div className="mb-2 flex items-center text-white/90">
                <MapPin className="mr-2 h-5 w-5" />
                <span>
                  {venue.location?.address || venue.venueAddress}
                  {venue.location?.city ? `, ${venue.location.city}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center">
                  <Star className="mr-1 h-5 w-5 fill-current text-yellow-400" />
                  <span className="font-medium">{venue.stats.averageRating.toFixed(1)}</span>
                  <span className="ml-1">({venue.stats.totalReviews} reviews)</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShareButton id={venue.id} title={displayName} type="venue" />
              {showScheduleMeeting ? (
                <Button
                  onClick={onScheduleMeeting}
                  disabled={schedulingMeeting}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {schedulingMeeting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Meeting
                    </>
                  )}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {images.length > 1 ? (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSelectImage(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentImageIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
