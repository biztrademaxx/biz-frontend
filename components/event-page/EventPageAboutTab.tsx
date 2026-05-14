"use client"

import Image from "next/image"
import Link from "next/link"
import AddReviewCard from "@/components/AddReviewCard"
import EventFollowers from "@/components/EventFollowers"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPublicProfilePath } from "@/lib/profile-path"
import { formatOrganizerCityCountryLine } from "@/lib/organizer-location-display"
import { IndianRupee } from "lucide-react"
import { EventPageVenueMapCard } from "./EventPageVenueMapCard"
import {
  buildListedInDisplay,
  formatGeneralTimingsLine,
  getCompanyInitials,
  getTicketPriceDisplay,
} from "./event-page-utils"

type ListedIn = ReturnType<typeof buildListedInDisplay>

type Props = {
  event: any
  listedIn: ListedIn
  showActionButtons: boolean
  isOrganizer: boolean
  onVisitClick: () => void
}

export function EventPageAboutTab({ event, listedIn, showActionButtons, isOrganizer, onVisitClick }: Props) {
  return (
    <>
      <Card className="shadow-md border border-gray-200 rounded-lg overflow-hidden">
        <CardHeader className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-800">{event.title || "Event Title"}</CardTitle>
          <p className="text-gray-600 mt-1 text-sm leading-relaxed">
            {event.description || event.shortDescription || "Event description not available."}
          </p>
        </CardHeader>

        <CardContent className="px-6 py-4">
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Highlights</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
              {event.highlights?.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              )) || (
                <>
                  <li>Showcase and sample your favorite products.</li>
                  <li>Be visible to thousands of music lovers.</li>
                  <li>Enjoy trying high-end gadgets and accessories.</li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[#004A96] mb-2">Listed In</h3>
            <div className="flex flex-wrap gap-2">
              {listedIn.categoryChips.map((cat) => (
                <span
                  key={`listed-cat-${cat}`}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-[#004A96] bg-blue-50 border border-blue-200 rounded-full"
                >
                  {cat}
                </span>
              ))}
              {listedIn.hashtagLabels.map((label, idx) => (
                <span
                  key={`listed-tag-${idx}-${label}`}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-[#004A96] bg-red-50 border border-red-200 rounded-full hover:bg-red-100 transition-colors duration-200"
                >
                  {label}
                </span>
              ))}
              {listedIn.categoryChips.length === 0 && listedIn.hashtagLabels.length === 0 && (
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-[#004A96] bg-red-50 border border-red-200 rounded-full">
                  #{event.category || "Event"}
                </span>
              )}
            </div>
            {listedIn.moreCount > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                +{listedIn.moreCount} more {listedIn.moreCount === 1 ? "type" : "types"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
        <div>
          <div>
            <p className="font-medium text-gray-900">Timings</p>
            <p className="text-[#004A96] font-medium">{formatGeneralTimingsLine(event)}</p>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold text-gray-800 mb-1">Editions</h3>
            <p className="text-gray-700">
              {event.edition || "2nd"} Edition
              <span className="text-[#004A96] ml-2">({event.edition || "2nd"} time organized)</span>
            </p>
          </div>
        </div>

        <div>
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <IndianRupee className="w-4 h-4" />
              Entry Fees
            </h3>
            <p className="text-gray-700 text-sm ml-5">{getTicketPriceDisplay(event)}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-1">Event Type</h3>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-green-600 font-semibold">✓</span>
              {event.eventType?.map((type: string, index: number) => (
                <Badge key={index} variant="secondary" className="ml-2">
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-1">Official Links</h3>
            <div className="flex gap-2">
              {event.website && (
                <a
                  href={event.website}
                  className="px-3 py-1 border border-[#004A96] bg-red-50 text-[#FF131C] rounded-md text-xs font-medium hover:bg-red-100"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Website
                </a>
              )}
              <a
                href="#contact"
                className="px-3 py-1 border border-[#004A96] bg-red-50 text-[#004A96] rounded-md text-xs font-medium hover:bg-red-100"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>

      <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <Link
          href={getPublicProfilePath("organizer", {
            id: event.organizer?.id,
            publicSlug: event.organizer?.publicSlug,
            organizationName: event.organizer?.organizationName ?? event.organizer?.company,
            company: event.organizer?.company,
          })}
        >
          <CardHeader className="border-b border-gray-100 pb-2">
            <CardTitle className="text-gray-800 text-base font-semibold">Organizer</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col md:flex-row justify-between items-center gap-4 py-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 flex items-center justify-center border border-gray-100 rounded-full overflow-hidden bg-blue-50">
                {event.organizer?.avatar || event.organizer?.companyLogo ? (
                  <Image
                    src={event.organizer.avatar || event.organizer.companyLogo}
                    alt={event.organizer?.company || "Organizer"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold text-[#004A96]">
                    {getCompanyInitials(event.organizer?.company)}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{event.organizer?.company || "Event Organizer"}</h3>
                  <span className="bg-[#004A96] text-white text-[11px] font-medium px-2 py-[2px] rounded">Top Rated</span>
                </div>

                {(() => {
                  const line = formatOrganizerCityCountryLine(event.organizer)
                  return line ? <p className="text-sm text-gray-600 mt-0.5">{line}</p> : null
                })()}

                <p className="text-xs text-gray-500 mt-1">
                  {event.organizer?.upcomingEvents
                    ? `${event.organizer.upcomingEvents} Upcoming Events`
                    : "1 Upcoming Event"}{" "}
                </p>
              </div>
            </div>

            {showActionButtons && (
              <div className="flex flex-col items-center text-center">
                <button
                  type="button"
                  className="bg-[#FF131C] hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-md shadow"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onVisitClick()
                  }}
                >
                  Send Stall Book Request
                </button>
              </div>
            )}
          </CardContent>
        </Link>
      </Card>

      <EventPageVenueMapCard event={event} variant="about" />

      <EventFollowers eventId={event.id} />

      <AddReviewCard eventId={event.id} isOrganizer={isOrganizer} />
    </>
  )
}
