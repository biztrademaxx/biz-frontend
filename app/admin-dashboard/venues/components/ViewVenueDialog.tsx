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
import { Calendar, CheckCircle, Globe, Mail, Phone, MapPin, Building2, Users, Wifi, Coffee, Utensils, Wind, Dumbbell, Lock, Car, Tv } from "lucide-react"
import type { Venue } from "../types/venue.types"
import { VenueEventStatusBadge, VenueStatusBadge } from "./venue-status-badges"

type ViewVenueDialogProps = {
  isOpen: boolean
  onClose: () => void
  venue: Venue | null
  loading: boolean
}

// Helper function to get amenity icon
const getAmenityIcon = (amenity: string) => {
  const amenityLower = amenity.toLowerCase()
  if (amenityLower.includes("wifi") || amenityLower.includes("internet")) return <Wifi className="h-4 w-4" />
  if (amenityLower.includes("parking")) return <Car className="h-4 w-4" />
  if (amenityLower.includes("catering") || amenityLower.includes("food") || amenityLower.includes("restaurant")) return <Utensils className="h-4 w-4" />
  if (amenityLower.includes("ac") || amenityLower.includes("air conditioning") || amenityLower.includes("climate")) return <Wind className="h-4 w-4" />
  if (amenityLower.includes("gym") || amenityLower.includes("fitness")) return <Dumbbell className="h-4 w-4" />
  if (amenityLower.includes("security")) return <Lock className="h-4 w-4" />
  if (amenityLower.includes("valet")) return <Car className="h-4 w-4" />
  if (amenityLower.includes("av") || amenityLower.includes("audio") || amenityLower.includes("projector")) return <Tv className="h-4 w-4" />
  return <Building2 className="h-4 w-4" />
}

export function ViewVenueDialog({ isOpen, onClose, venue, loading }: ViewVenueDialogProps) {
  if (!venue) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-[95vw] w-[95vw] overflow-hidden p-0">
        <DialogHeader className="px-8 pt-6 pb-4 border-b bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                {venue.venueName}
                {venue.isVerified && <CheckCircle className="h-6 w-6 text-green-500" />}
              </DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Detailed venue information and statistics
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />
                <span>{venue.city}, {venue.country}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto px-8 py-6 max-h-[calc(90vh-100px)]">
          {loading ? (
            <div className="py-8 text-center text-sm text-gray-500">Loading venue details...</div>
          ) : null}

          <Tabs defaultValue="details" className="w-full">
            {/* Tabs without scroll - using flex wrap */}
            <div className="mb-6">
              <TabsList className="flex flex-wrap gap-2 h-auto w-full bg-transparent p-0">
                <TabsTrigger value="details" className="whitespace-nowrap px-5 py-2.5 text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white bg-gray-100 rounded-lg">
                  Details
                </TabsTrigger>
                <TabsTrigger value="contact" className="whitespace-nowrap px-5 py-2.5 text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white bg-gray-100 rounded-lg">
                  Contact
                </TabsTrigger>
                <TabsTrigger value="stats" className="whitespace-nowrap px-5 py-2.5 text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white bg-gray-100 rounded-lg">
                  Statistics
                </TabsTrigger>
                <TabsTrigger value="amenities" className="whitespace-nowrap px-5 py-2.5 text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white bg-gray-100 rounded-lg">
                  Amenities & Space
                </TabsTrigger>
                <TabsTrigger value="events" className="whitespace-nowrap px-5 py-2.5 text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white bg-gray-100 rounded-lg">
                  Events ({venue.events?.length || 0})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="details" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-5">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <p className="text-base text-gray-900 leading-relaxed">
                      {[venue.city, venue.state, venue.country].filter(Boolean).join(", ") || "-"}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-5">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                      <Building2 className="h-4 w-4" />
                      Address
                    </Label>
                    <p className="text-base text-gray-900 leading-relaxed">{venue.address || "-"}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-5">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                      <Users className="h-4 w-4" />
                      Meeting Spaces
                    </Label>
                    <p className="text-2xl font-bold text-gray-900">{venue.totalHalls || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">total halls / meeting spaces</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-5">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                      <Users className="h-4 w-4" />
                      Capacity
                    </Label>
                    <p className="text-3xl font-bold text-gray-900">
                      {(venue.maxCapacity || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">maximum people</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-5">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                      Status
                    </Label>
                    <div className="mt-1">
                      <VenueStatusBadge status={venue.status || "active"} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description - Full Width */}
              <div className="bg-gray-50 rounded-lg p-5">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
                  Description
                </Label>
                <p className="text-base leading-relaxed text-gray-700">
                  {venue.description || "No description provided"}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-5 rounded-lg border-2 p-5 hover:border-blue-200 transition-all">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mobile Number</p>
                      <p className="text-lg font-medium text-gray-900 mt-1">{venue.mobile || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 rounded-lg border-2 p-5 hover:border-blue-200 transition-all">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</p>
                      <p className="text-lg font-medium text-gray-900 break-all mt-1">{venue.email || "Not provided"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-5 rounded-lg border-2 p-5 hover:border-blue-200 transition-all">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Globe className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Website</p>
                      {venue.website ? (
                        <a
                          href={`https://${venue.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-medium text-blue-600 hover:underline break-all mt-1 inline-block"
                        >
                          {venue.website}
                        </a>
                      ) : (
                        <p className="text-lg text-gray-500 mt-1">Not provided</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-6 text-center">
                    <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Calendar className="h-7 w-7 text-blue-600" />
                    </div>
                    <p className="text-4xl font-bold text-blue-600">{venue.totalEvents || 0}</p>
                    <p className="text-sm font-medium text-gray-600 mt-2">Total Events</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-6 text-center">
                    <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-7 w-7 text-green-600" />
                    </div>
                    <p className="text-4xl font-bold text-green-600">{venue.activeBookings || 0}</p>
                    <p className="text-sm font-medium text-gray-600 mt-2">Active Bookings</p>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-white shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-6 text-center">
                    <div className="bg-yellow-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Building2 className="h-7 w-7 text-yellow-600" />
                    </div>
                    <p className="text-4xl font-bold text-yellow-600">
                      {venue.totalReviews > 0 ? venue.averageRating.toFixed(1) : "—"}
                    </p>
                    <p className="text-sm font-medium text-gray-600 mt-2">Average Rating</p>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-6 text-center">
                    <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="h-7 w-7 text-purple-600" />
                    </div>
                    <p className="text-4xl font-bold text-purple-600">{venue.totalReviews || 0}</p>
                    <p className="text-sm font-medium text-gray-600 mt-2">Total Reviews</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="amenities" className="space-y-8 mt-0">
              <div>
                <Label className="text-base font-semibold text-gray-800 mb-4 block flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Amenities & Facilities
                </Label>
                <div className="flex flex-wrap gap-3">
                  {venue.amenities && venue.amenities.length > 0 ? (
                    venue.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="bg-gray-100 px-4 py-2.5 text-sm font-normal flex items-center gap-2">
                        {getAmenityIcon(amenity)}
                        {amenity}
                      </Badge>
                    ))
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 text-center w-full">
                      <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">No amenities listed</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold text-gray-800 mb-4 block flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Meeting Spaces & Halls
                </Label>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {venue.meetingSpaces && venue.meetingSpaces.length > 0 ? (
                    venue.meetingSpaces.map((space) => (
                      <Card key={space.id} className="border-2 hover:border-blue-200 transition-all shadow-sm hover:shadow-md">
                        <CardContent className="p-5">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-start justify-between flex-wrap gap-3">
                              <div>
                                <h4 className="font-bold text-gray-900 text-lg">{space.name}</h4>
                                <div className="flex flex-wrap gap-3 mt-2">
                                  <Badge variant="outline" className="bg-blue-50 px-3 py-1">
                                    Capacity: {space.capacity} people
                                  </Badge>
                                  <Badge variant="outline" className="bg-green-50 px-3 py-1">
                                    Area: {space.area} sq.ft
                                  </Badge>
                                </div>
                              </div>
                              <Badge variant={space.isAvailable ? "default" : "secondary"} className="px-3 py-1.5">
                                {space.isAvailable ? "Available" : "Not Available"}
                              </Badge>
                            </div>
                            {space.description && (
                              <p className="text-sm text-gray-600 mt-2">{space.description}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 text-center col-span-2">
                      <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">No meeting spaces configured</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="events" className="space-y-4 mt-0">
              {venue.events && venue.events.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {venue.events.map((event) => (
                    <Card key={event.id} className="border-2 hover:border-blue-200 transition-all shadow-sm hover:shadow-md">
                      <CardContent className="p-5">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-start justify-between flex-wrap gap-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 text-lg">{event.title}</h4>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</p>
                            </div>
                            <VenueEventStatusBadge status={event.status} />
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2 pt-2 border-t">
                            <span className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${event.isVirtual
                              ? "bg-purple-100 text-purple-700"
                              : "bg-green-100 text-green-700"
                              }`}>
                              {event.isVirtual ? "Virtual Event" : "In-Person Event"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No events found for this venue</p>
                  <p className="text-sm text-gray-400 mt-1">Events hosted at this venue will appear here</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}