"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getVenuePublicPath } from "@/lib/venue-dashboard-path"
import {
  canLinkAddressToMaps,
  getEncodedFullAddressForMaps,
  getMapAddress,
  getPublicVenueCityCountry,
} from "./event-page-utils"

type Variant = "about" | "venue"

export function EventPageVenueMapCard({ event, variant }: { event: any; variant: Variant }) {
  const title = variant === "about" ? "Venue Map & Directions" : "Venue Details"
  const venueNameClass =
    variant === "about" ? "font-semibold text-[#004A96] text-base hover:underline cursor-pointer" : "font-semibold text-[#FF131C] text-base hover:underline cursor-pointer"
  const showCapacity = variant === "venue"

  return (
    <Card className="border border-gray-200 rounded-lg shadow-sm">
      <CardHeader className="border-b border-gray-100 py-4">
        <CardTitle className="text-gray-800 text-lg font-semibold">{title}</CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-2/3 h-80 bg-gray-200 rounded-md overflow-hidden">
            <iframe
              src={`https://www.google.com/maps?q=${getMapAddress(event)}&z=15&output=embed`}
              width="100%"
              height="100%"
              className="border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="w-full md:w-1/3 flex flex-col justify-between space-y-4">
            <div>
              <Link
                href={
                  event?.venue?.id
                    ? getVenuePublicPath(
                        event.venue.id,
                        event.venue.venueName || event.venue.organizationName || null,
                      )
                    : "/venues"
                }
              >
                <h3 className={venueNameClass}>
                  {event?.venue?.venueName || event?.venue?.organizationName || "Venue"}
                </h3>
              </Link>
              {canLinkAddressToMaps(event) ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${getEncodedFullAddressForMaps(event)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 text-sm mt-1 whitespace-pre-wrap block hover:text-[#004A96] hover:underline"
                >
                  {getPublicVenueCityCountry(event)}
                </a>
              ) : (
                <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">{getPublicVenueCityCountry(event)}</p>
              )}

              {showCapacity && event?.venue?.capacity && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Capacity:</span> {event.venue.capacity.total || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Halls:</span> {event.venue.capacity.halls || "N/A"}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors"
                onClick={() => {
                  const address = getEncodedFullAddressForMaps(event)
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, "_blank")
                }}
              >
                Get Directions
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const address = getEncodedFullAddressForMaps(event)
                  window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, "_blank")
                }}
              >
                View in Maps
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
