"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { getMapAddress } from "../../lib/venue-detail-utils"
import type { VenueDetail } from "../../types/venue-detail.types"

type VenueLocationTabProps = {
  venue: VenueDetail
}

export function VenueLocationTab({ venue }: VenueLocationTabProps) {
  const mapAddress = getMapAddress(venue)

  return (
    <TabsContent value="location" className="space-y-6">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Map View</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-between">
          <div className="mb-4 h-80 w-full overflow-hidden rounded-md bg-gray-200">
            <iframe
              src={`https://www.google.com/maps?q=${mapAddress}&z=15&output=embed`}
              width="100%"
              height="100%"
              className="border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Venue location map"
            />
          </div>

          <CardHeader className="px-0">
            <CardTitle>Address & Directions</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <p className="text-gray-700">{venue.location?.address || venue.venueAddress}</p>
            {venue.location?.city ? (
              <p className="text-gray-600">
                {venue.location.city}
                {venue.location.state ? `, ${venue.location.state}` : ""}
                {venue.location.zipCode ? ` ${venue.location.zipCode}` : ""}
              </p>
            ) : null}
            {venue.location?.country ? <p className="text-gray-600">{venue.location.country}</p> : null}
          </CardContent>

          <div className="mt-5 flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${mapAddress}`, "_blank")
              }}
            >
              Get Directions
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                window.open(`https://www.google.com/maps/search/?api=1&query=${mapAddress}`, "_blank")
              }}
            >
              View in Maps
            </Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}
