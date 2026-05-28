"use client"

import { Button } from "@/components/ui/button"
import { MapPin, Plus, Share2, Star, Bookmark } from "lucide-react"
import {
  canLinkAddressToMaps,
  getEncodedFullAddressForMaps,
  getPublicVenueCityCountry,
} from "./event-page-utils"
import { getEventPostponedNotice, isEventPostponed } from "@/lib/event-schedule-display"

type Props = {
  event: any
  averageRating: number
  totalReviews: number
  isSaved: boolean
  saving: boolean
  onSave: () => void
  showActionButtons: boolean
  interestVisit: boolean
  interestExhibit: boolean
  interestSubmitting: "visit" | "exhibit" | null
  onVisitClick: () => void
  onExhibitClick: () => void
}

export function EventPageSummaryBar({
  event,
  averageRating,
  totalReviews,
  isSaved,
  saving,
  onSave,
  showActionButtons,
  interestVisit,
  interestExhibit,
  interestSubmitting,
  onVisitClick,
  onExhibitClick,
}: Props) {
  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:px-6">
      <div className="mb-8 rounded-sm bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#004A96] mb-3">{event.title || "Event Title"}</h1>

            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <MapPin className="w-4 h-4 shrink-0" />
              {canLinkAddressToMaps(event) ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${getEncodedFullAddressForMaps(event)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#004A96] hover:underline"
                >
                  {getPublicVenueCityCountry(event)}
                </a>
              ) : (
                <span>{getPublicVenueCityCountry(event)}</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-[#004A96] hover:text-[#003a75]"
                onClick={() => {
                  const address = getEncodedFullAddressForMaps(event)
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, "_blank")
                }}
              >
                <Plus className="w-4 h-4" />
                Get Directions
              </Button>

              <div className="flex items-center text-sm">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 font-medium">{averageRating > 0 ? averageRating.toFixed(1) : "No ratings"}</span>
                {totalReviews > 0 && (
                  <span className="ml-1 text-gray-500">
                    ({totalReviews} review{totalReviews !== 1 ? "s" : ""})
                  </span>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onSave}
                disabled={saving}
                className={`flex items-center gap-2 ${isSaved ? "text-[#FF131C]" : ""}`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                {isSaved ? "Saved" : "Save"}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  if (navigator.share) {
                    navigator
                      .share({
                        title: event.title,
                        text: "Check out this event!",
                        url: window.location.href,
                      })
                      .catch((err) => console.error("Error sharing:", err))
                  } else {
                    alert("Sharing is not supported in this browser.")
                  }
                }}
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>

          {showActionButtons && (
            <div className="flex flex-col gap-3 lg:-ml-8">
              <p className="text-center lg:text-left text-gray-700 font-medium text-base sm:text-lg">
                Interested in this Event?
              </p>

              {/* {isEventPostponed(event) && (
                <p
                  className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm font-medium text-amber-900 lg:text-left"
                  role="status"
                >
                  {getEventPostponedNotice(event)}
                </p>
              )} */}

              <div className="flex gap-3 flex-col sm:flex-row sm:justify-start">
                <Button
                  variant="outline"
                  className={
                    interestVisit
                      ? "sm:w-[180px] w-full cursor-default border-[#004A96] bg-[#004A96]/8 font-semibold text-[#004A96] hover:bg-[#004A96]/10"
                      : "sm:w-[180px] w-full border-gray-300 bg-transparent hover:bg-gray-50"
                  }
                  onClick={onVisitClick}
                  disabled={interestVisit || interestSubmitting === "visit"}
                >
                  {interestSubmitting === "visit" ? "Saving…" : interestVisit ? "Visiting" : "Visit"}
                </Button>

                <Button
                  variant="outline"
                  className={
                    interestExhibit
                      ? "sm:w-[180px] w-full cursor-default border-[#FF131C] bg-red-50 font-semibold text-[#FF131C] hover:bg-red-50 hover:text-[#FF131C]"
                      : "sm:w-[180px] w-full border-[#FF131C] bg-transparent text-[#FF131C] hover:text-[#FF131C] hover:bg-red-50"
                  }
                  onClick={onExhibitClick}
                  disabled={interestExhibit || interestSubmitting === "exhibit"}
                >
                  {interestSubmitting === "exhibit" ? "Saving…" : interestExhibit ? "Exhibiting" : "Exhibit"}
                </Button>
              </div>
            </div>
          )}
        </div>
        {showActionButtons && (
          <p className="mt-3 text-sm text-gray-500 text-center lg:text-right">
            Please verify schedules and participation details with organizers before finalizing travel plans.
          </p>
        )}
      </div>
    </div>
  )
}
