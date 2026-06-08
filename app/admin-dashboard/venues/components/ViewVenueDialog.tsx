"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, CheckCircle, Globe, Mail, Phone, MapPin, Building2, Users } from "lucide-react"
import type { Venue } from "../types/venue.types"
import { VenueEventStatusBadge, VenueStatusBadge } from "./venue-status-badges"

type ViewVenueDialogProps = {
  isOpen: boolean
  onClose: () => void
  venue: Venue | null
  loading: boolean
}

export function ViewVenueDialog({ isOpen, onClose, venue, loading }: ViewVenueDialogProps) {
  if (!venue) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            {venue.venueName}
            {venue.isVerified ? <CheckCircle className="h-5 w-5 text-green-500" /> : null}
          </DialogTitle>
          <DialogDescription>Detailed venue information and statistics</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-4 max-h-[calc(90vh-100px)]">
          {loading ? (
            <div className="py-8 text-center text-sm text-gray-500">Loading venue details...</div>
          ) : null}

          <Tabs defaultValue="details" className="w-full">
            {/* Scrollable tabs with hidden scrollbar */}
            <div className="overflow-x-auto mb-6 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <TabsList className="inline-flex h-auto w-auto min-w-full gap-1 bg-muted/60 p-1 rounded-lg">
                <TabsTrigger value="details" className="whitespace-nowrap px-4 py-2 text-sm">
                  Details
                </TabsTrigger>
                <TabsTrigger value="contact" className="whitespace-nowrap px-4 py-2 text-sm">
                  Contact
                </TabsTrigger>
                <TabsTrigger value="stats" className="whitespace-nowrap px-4 py-2 text-sm">
                  Statistics
                </TabsTrigger>
                <TabsTrigger value="amenities" className="whitespace-nowrap px-4 py-2 text-sm">
                  Amenities & Space
                </TabsTrigger>
                <TabsTrigger value="events" className="whitespace-nowrap px-4 py-2 text-sm">
                  Events ({venue.events?.length || 0})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="details" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-5">
                  <div className="border-b pb-3">
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</Label>
                    <p className="mt-1.5 text-base text-gray-900">
                      {[venue.city, venue.state, venue.country].filter(Boolean).join(", ") || "-"}
                    </p>
                  </div>
                  <div className="border-b pb-3">
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</Label>
                    <p className="mt-1.5 text-base text-gray-900">{venue.address || "-"}</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                  <div className="border-b pb-3">
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Capacity</Label>
                    <p className="mt-1.5 text-base text-gray-900">
                      {(venue.maxCapacity || 0).toLocaleString()} people
                    </p>
                  </div>
                  <div className="border-b pb-3">
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Meeting Spaces</Label>
                    <p className="mt-1.5 text-base text-gray-900">{venue.totalHalls || 0} halls</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</Label>
                    <div className="mt-2">
                      <VenueStatusBadge status={venue.status || "active"} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description - Full Width */}
              <div className="pt-4 border-t">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</Label>
                <p className="mt-3 text-sm leading-relaxed text-gray-700">
                  {venue.description || "No description provided"}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 rounded-lg border p-4">
                    <Phone className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Mobile</p>
                      <p className="text-base font-medium text-gray-900">{venue.mobile || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-lg border p-4">
                    <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-base font-medium text-gray-900 break-all">{venue.email || "Not provided"}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 rounded-lg border p-4">
                    <Globe className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Website</p>
                      {venue.website ? (
                        <a
                          href={`https://${venue.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base font-medium text-blue-600 hover:underline break-all"
                        >
                          {venue.website}
                        </a>
                      ) : (
                        <p className="text-base text-gray-500">Not provided</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6 mt-0">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-5 text-center">
                    <p className="text-3xl font-bold text-blue-600">{venue.totalEvents || 0}</p>
                    <p className="text-xs text-gray-600 mt-1">Total Events</p>
                  </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-5 text-center">
                    <p className="text-3xl font-bold text-green-600">{venue.activeBookings || 0}</p>
                    <p className="text-xs text-gray-600 mt-1">Active Bookings</p>
                  </CardContent>
                </Card>
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-5 text-center">
                    <p className="text-3xl font-bold text-yellow-600">
                      {venue.totalReviews > 0 ? venue.averageRating.toFixed(1) : "—"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Avg Rating</p>
                  </CardContent>
                </Card>
                <Card className="border-purple-200 bg-purple-50">
                  <CardContent className="p-5 text-center">
                    <p className="text-3xl font-bold text-purple-600">{venue.totalReviews || 0}</p>
                    <p className="text-xs text-gray-600 mt-1">Total Reviews</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="amenities" className="space-y-6 mt-0">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Amenities</Label>
                <div className="flex flex-wrap gap-2">
                  {venue.amenities && venue.amenities.length > 0 ? (
                    venue.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="bg-gray-100 px-3 py-1 text-sm">
                        {amenity}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No amenities listed</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Meeting Spaces</Label>
                <div className="space-y-3">
                  {venue.meetingSpaces && venue.meetingSpaces.length > 0 ? (
                    venue.meetingSpaces.map((space) => (
                      <Card key={space.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{space.name}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                Capacity: {space.capacity} people • Area: {space.area} sq.ft
                              </p>
                            </div>
                            <Badge variant={space.isAvailable ? "default" : "secondary"}>
                              {space.isAvailable ? "Available" : "Not Available"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No meeting spaces configured</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="events" className="space-y-6 mt-0">
              {venue.events && venue.events.length > 0 ? (
                <div className="space-y-3">
                  {venue.events.map((event) => (
                    <Card key={event.id} className="border transition-shadow hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <h4 className="font-semibold text-gray-900">{event.title}</h4>
                            <VenueEventStatusBadge status={event.status} />
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${event.isVirtual
                                ? "bg-purple-100 text-purple-700"
                                : "bg-green-100 text-green-700"
                              }`}>
                              {event.isVirtual ? "Virtual" : "In-Person"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No events found for this venue</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}