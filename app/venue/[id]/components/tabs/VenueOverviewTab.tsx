"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { isAuthenticated } from "@/lib/api"
import { Calendar, CheckCircle, Globe, UserPlus } from "lucide-react"
import { getHallsCount, getTotalCapacity, getVenueDisplayName } from "../../lib/venue-detail-utils"
import type { VenueDetail, VenueEvent } from "../../types/venue-detail.types"
import { VenueEventPreviewCard } from "../VenueEventPreviewCard"

type VenueOverviewTabProps = {
  venue: VenueDetail
  events: VenueEvent[]
  onSendConnection: () => void
  sendingConnection: boolean
  connectionSent: boolean
}

export function VenueOverviewTab({
  venue,
  events,
  onSendConnection,
  sendingConnection,
  connectionSent,
}: VenueOverviewTabProps) {
  const displayName = getVenueDisplayName(venue)
  const loggedIn = isAuthenticated()
  const website = venue.contact?.website?.trim()

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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {(venue.amenities ?? []).map((amenity, index) => (
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
            <p className="text-sm text-gray-600">
              Phone and email are not shown publicly. Send a connection request to reach the venue manager
              through the platform.
            </p>
            <Button
              type="button"
              className="w-full bg-red-600 hover:bg-red-700 sm:w-auto"
              disabled={!loggedIn || sendingConnection || connectionSent}
              onClick={onSendConnection}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {connectionSent
                ? "Connection request sent"
                : sendingConnection
                  ? "Sending..."
                  : "Send connection"}
            </Button>
            {!loggedIn ? (
              <p className="text-xs text-gray-500">Log in to send a connection request.</p>
            ) : null}
            {website ? (
              <div className="flex items-center gap-3 border-t pt-4">
                <Globe className="h-5 w-5 text-gray-400" />
                <a
                  href={website.startsWith("http") ? website : `https://${website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
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
