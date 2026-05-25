"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { Building } from "lucide-react"
import type { VenueDetail } from "../../types/venue-detail.types"

type VenueHallsTabProps = {
  venue: VenueDetail
}

export function VenueHallsTab({ venue }: VenueHallsTabProps) {
  return (
    <TabsContent value="spaces" className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {venue.meetingSpaces && venue.meetingSpaces.length > 0 ? (
          venue.meetingSpaces.map((space) => (
            <Card key={space.id} className="transition-shadow duration-300 hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-center">
                  <CardTitle className="text-lg">{space.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Capacity</span>
                    <span className="font-medium">{space.capacity} people</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Area</span>
                    <span className="font-medium">{space.area} sq ft</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <Building className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No meeting spaces available</h3>
            <p className="text-gray-600">This venue doesn&apos;t have any meeting spaces configured.</p>
          </div>
        )}
      </div>
    </TabsContent>
  )
}
