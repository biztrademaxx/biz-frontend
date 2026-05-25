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
import { Calendar, CheckCircle, Globe, Mail, Phone } from "lucide-react"
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
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {venue.venueName}
            {venue.isVerified ? <CheckCircle className="h-5 w-5 text-green-500" /> : null}
          </DialogTitle>
          <DialogDescription>Detailed venue information and statistics</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-sm text-gray-500">Loading venue details...</div>
        ) : null}

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-1 md:grid-cols-5">
            <TabsTrigger value="details" className="whitespace-nowrap px-2 text-xs md:text-sm">
              Details
            </TabsTrigger>
            <TabsTrigger value="contact" className="whitespace-nowrap px-2 text-xs md:text-sm">
              Contact
            </TabsTrigger>
            <TabsTrigger value="stats" className="whitespace-nowrap px-2 text-xs md:text-sm">
              Statistics
            </TabsTrigger>
            <TabsTrigger value="amenities" className="whitespace-nowrap px-2 text-xs md:text-sm">
              Amenities & Spaces
            </TabsTrigger>
            <TabsTrigger value="events" className="whitespace-nowrap px-2 text-xs md:text-sm">
              Events ({venue.events?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Contact Person</Label>
                  <p className="mt-1 text-sm text-gray-600">{venue.contactPerson}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Location</Label>
                  <p className="mt-1 break-words text-sm text-gray-600">
                    {[venue.city, venue.state, venue.country].filter(Boolean).join(", ") || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Address</Label>
                  <p className="mt-1 break-words text-sm text-gray-600">{venue.address || "-"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Capacity</Label>
                  <p className="mt-1 text-sm text-gray-600">
                    {(venue.maxCapacity || 0).toLocaleString()} people
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Meeting Spaces</Label>
                  <p className="mt-1 text-sm text-gray-600">{venue.totalHalls || 0} halls</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <div className="mt-1">
                    <VenueStatusBadge status={venue.status || "active"} />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Description</Label>
              <p className="mt-2 break-words text-sm leading-relaxed text-gray-600">
                {venue.description || "-"}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Mobile</Label>
                    <p className="break-all text-sm text-gray-600">{venue.mobile || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                    <p className="break-all text-sm text-gray-600">{venue.email || "-"}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Website</Label>
                    <a
                      href={venue.website ? `https://${venue.website}` : "#"}
                      className="block text-sm text-blue-600 hover:underline"
                      onClick={(e) => !venue.website && e.preventDefault()}
                    >
                      {venue.website || "No website"}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{venue.totalEvents}</p>
                  <p className="text-sm text-gray-600">Total Events</p>
                </CardContent>
              </Card>
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{venue.activeBookings}</p>
                  <p className="text-sm text-gray-600">Active Bookings</p>
                </CardContent>
              </Card>
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {venue.totalReviews > 0 ? venue.averageRating.toFixed(1) : "—"}
                  </p>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </CardContent>
              </Card>
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">{venue.totalReviews}</p>
                  <p className="text-sm text-gray-600">Total Reviews</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="amenities" className="space-y-6">
            <div>
              <Label className="mb-3 text-sm font-medium text-gray-700">Amenities</Label>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {venue.amenities.length === 0 ? (
                  <p className="text-sm text-gray-500">No amenities added.</p>
                ) : null}
                {venue.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2 rounded bg-gray-50 p-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-3 text-sm font-medium text-gray-700">Meeting Spaces</Label>
              <div className="space-y-3">
                {venue.meetingSpaces.length === 0 ? (
                  <p className="text-sm text-gray-500">No spaces configured.</p>
                ) : null}
                {venue.meetingSpaces.map((space) => (
                  <Card key={space.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{space.name}</p>
                          <p className="text-sm text-gray-600">
                            Capacity: {space.capacity} • Area: {space.area} sq.ft • ₹
                            {space.hourlyRate}/hour
                          </p>
                        </div>
                        <Badge variant={space.isAvailable ? "default" : "secondary"}>
                          {space.isAvailable ? "Available" : "Not Available"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            {venue.events && venue.events.length > 0 ? (
              <div className="space-y-4">
                {venue.events.map((event) => (
                  <Card key={event.id} className="border transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-start gap-2">
                            <h4 className="font-semibold text-gray-900">{event.title}</h4>
                            <VenueEventStatusBadge status={event.status} />
                          </div>
                          <p className="mb-2 line-clamp-2 text-sm text-gray-600">{event.description}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            <span>Start: {new Date(event.startDate).toLocaleDateString()}</span>
                            <span>End: {new Date(event.endDate).toLocaleDateString()}</span>
                            <span
                              className={`rounded-full px-2 py-1 ${
                                event.isVirtual
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {event.isVirtual ? "Virtual" : "In-Person"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <p>No events found for this venue</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
