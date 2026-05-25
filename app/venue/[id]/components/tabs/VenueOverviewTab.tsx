"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { Calendar, CheckCircle, Globe, Mail, Phone } from "lucide-react"
import { getHallsCount, getTotalCapacity, getVenueDisplayName } from "../../lib/venue-detail-utils"
import type { VenueDetail, VenueEvent } from "../../types/venue-detail.types"
import { VenueEventPreviewCard } from "../VenueEventPreviewCard"

type VenueOverviewTabProps = {
  venue: VenueDetail
  events: VenueEvent[]
}

export function VenueOverviewTab({ venue, events }: VenueOverviewTabProps) {
  const displayName = getVenueDisplayName(venue)

  return (
    <TabsContent value="overview" className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{getTotalCapacity(venue)}</div>
                <div className="text-sm text-gray-600">Max Capacity</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{getHallsCount(venue)}</div>
                <div className="text-sm text-gray-600">Halls</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{events.length}</div>
                <div className="text-sm text-gray-600">Events</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{venue.stats.averageRating.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Good Ratings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About The Venue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-gray-600">
              {venue.description || venue.venueDescription || "No description available for this venue."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {venue.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">{amenity}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {venue.contact.phone ? (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <span>{venue.contact.phone}</span>
              </div>
            ) : null}
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <span>{venue.contact.email}</span>
            </div>
            {venue.contact.website ? (
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-gray-400" />
                <a href={venue.contact.website} className="text-blue-600 hover:underline">
                  Visit Website
                </a>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Events At This Venue</CardTitle>
            <p className="text-sm text-gray-500">
              {events.length} events scheduled at {displayName}
            </p>
          </CardHeader>
          <CardContent>
            {events.length > 0 ? (
              <div className="flex flex-wrap gap-6">
                {events.slice(0, 4).map((event) => (
                  <VenueEventPreviewCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <p className="text-gray-500">No events scheduled at this venue yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  )
}
