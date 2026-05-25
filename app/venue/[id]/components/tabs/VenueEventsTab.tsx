"use client"

import { Button } from "@/components/ui/button"
import { TabsContent } from "@/components/ui/tabs"
import { Calendar, Loader2 } from "lucide-react"
import type { VenueEvent } from "../../types/venue-detail.types"
import { VenueEventGridCard } from "../VenueEventGridCard"

type VenueEventsTabProps = {
  events: VenueEvent[]
  eventsLoading: boolean
  showScheduleMeeting: boolean
  onScheduleMeeting: () => void
}

export function VenueEventsTab({
  events,
  eventsLoading,
  showScheduleMeeting,
  onScheduleMeeting,
}: VenueEventsTabProps) {
  return (
    <TabsContent value="events" className="space-y-6">
      {eventsLoading ? (
        <div className="py-12 text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-gray-600">Loading events...</p>
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <VenueEventGridCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">No events scheduled</h3>
          <p className="mb-6 text-gray-600">This venue doesn&apos;t have any upcoming events.</p>
          {showScheduleMeeting ? (
            <Button onClick={onScheduleMeeting} className="bg-red-600 hover:bg-red-700">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Event at this Venue
            </Button>
          ) : null}
        </div>
      )}
    </TabsContent>
  )
}
