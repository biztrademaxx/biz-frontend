"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPublicProfilePath } from "@/lib/profile-path"
import { formatOrganizerCityCountryLine } from "@/lib/organizer-location-display"
import { getCompanyInitials } from "./event-page-utils"

type Props = {
  event: any
  onSendStallBookRequest?: () => void
  stallBookRequestSubmitting?: boolean
}

export function EventPageOrganizerTab({
  event,
  onSendStallBookRequest,
  stallBookRequestSubmitting = false,
}: Props) {
  return (
    <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>Event Organizer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link
            href={getPublicProfilePath("organizer", {
              id: event.organizer?.id || event.organizer?._id,
              publicSlug: event.organizer?.publicSlug,
              organizationName: event.organizer?.organizationName ?? event.organizer?.company,
              company: event.organizer?.company,
            })}
            className="flex items-start gap-4 min-w-0 flex-1"
          >
            <Avatar className="w-16 h-16">
              <AvatarImage src={event.organizer?.avatar || event.organizer?.companyLogo} alt={event.organizer?.company || "Organizer"} />
              <AvatarFallback className="bg-red-50 text-[#FF131C] text-lg font-semibold">
                {getCompanyInitials(event.organizer?.company)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-lg text-gray-900">{event.organizer?.company || "Event Organizer"}</h4>
              {(() => {
                const line = formatOrganizerCityCountryLine(event.organizer)
                return line ? <p className="text-gray-600 mb-3 text-sm">{line}</p> : null
              })()}

              <div className="mt-3 flex gap-4 text-sm text-gray-500">
                <span>{event.organizer?.totalEvents ?? 0} Total Events</span>
                <span>
                  {event.organizer?.averageRating != null ? Number(event.organizer.averageRating).toFixed(1) : "—"} ★
                  Rating
                </span>
                <span>{event.organizer?.totalReviews ?? 0} Reviews</span>
              </div>
            </div>
          </Link>

          {onSendStallBookRequest ? (
            <div className="shrink-0">
              <button
                type="button"
                disabled={stallBookRequestSubmitting}
                onClick={onSendStallBookRequest}
                className="bg-[#FF131C] hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-md shadow"
              >
                {stallBookRequestSubmitting ? "Submitting..." : "Send Stall Book Request"}
              </button>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
