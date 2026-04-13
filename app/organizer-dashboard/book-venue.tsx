"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Search,
  MapPin,
  Users,
  CalendarIcon,
  Star,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Accessibility,
  Camera,
  Mic,
  Projector,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface Venue {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  venueName?: string
  venueDescription?: string
  venueAddress?: string
  city?: string
  state?: string
  country?: string
  maxCapacity?: number
  totalHalls?: number
  averageRating?: number
  totalReviews?: number
  amenities: string[]
  venueImages: string[]
  basePrice?: number
  meetingSpaces: MeetingSpace[]
}

interface MeetingSpace {
  id: string
  name: string
  capacity: number
  area: number
  hourlyRate: number
  isAvailable: boolean
}

interface BookVenueProps {
  organizerId: string
}

export default function BookVenue({ organizerId }: BookVenueProps) {
  const [venues, setVenues] = useState<Venue[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([])
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [purpose, setPurpose] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")
  const [loading, setLoading] = useState(false)
  const [filterCapacity, setFilterCapacity] = useState("")
  const [filterAmenities, setFilterAmenities] = useState<string[]>([])
  const { toast } = useToast()

  const amenityIcons = {
    WiFi: Wifi,
    Parking: Car,
    Catering: Utensils,
    Coffee: Coffee,
    Accessibility: Accessibility,
    Photography: Camera,
    "Audio System": Mic,
    Projector: Projector,
  }

  useEffect(() => {
    fetchVenues()
  }, [])

  const fetchVenues = async () => {
    try {
      const response = await fetch("/api/venues")
      if (response.ok) {
        const data = await response.json()
        setVenues(data.venues || [])
      }
    } catch (error) {
      console.error("Error fetching venues:", error)
    }
  }

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.venueName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.venueAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${venue.firstName} ${venue.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCapacity =
      !filterCapacity || (venue.maxCapacity && venue.maxCapacity >= Number.parseInt(filterCapacity))

    const matchesAmenities =
      filterAmenities.length === 0 || filterAmenities.every((amenity) => venue.amenities.includes(amenity))

    return matchesSearch && matchesCapacity && matchesAmenities
  })

  const handleSpaceSelect = (spaceId: string) => {
    setSelectedSpaces((prev) => (prev.includes(spaceId) ? prev.filter((id) => id !== spaceId) : [...prev, spaceId]))
  }

  const handleAmenityFilter = (amenity: string) => {
    setFilterAmenities((prev) => (prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]))
  }

  const calculateTotalCost = () => {
    if (!selectedVenue || !startDate || !endDate) return 0

    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const baseVenueCost = (selectedVenue.basePrice || 0) * days

    const spacesCost = selectedSpaces.reduce((total, spaceId) => {
      const space = selectedVenue.meetingSpaces.find((s) => s.id === spaceId)
      return total + (space ? space.hourlyRate * 8 * days : 0) // Assuming 8 hours per day
    }, 0)

    return baseVenueCost + spacesCost
  }

  const handleBookVenue = async () => {
    if (!selectedVenue || !startDate || !endDate || !purpose) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/venue-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueId: selectedVenue.id,
          organizerId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          meetingSpaces: selectedSpaces,
          purpose,
          specialRequests,
          totalAmount: calculateTotalCost(),
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Venue booking request submitted successfully.",
        })

        // Reset form
        setSelectedVenue(null)
        setSelectedSpaces([])
        setStartDate(undefined)
        setEndDate(undefined)
        setPurpose("")
        setSpecialRequests("")
      } else {
        throw new Error("Failed to book venue")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit venue booking request.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const allAmenities = Array.from(new Set(venues.flatMap((venue) => venue.amenities)))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Book Venue for Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search venues by name, location, or manager..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="capacity-filter">Min Capacity:</Label>
                  <Input
                    id="capacity-filter"
                    type="number"
                    placeholder="100"
                    value={filterCapacity}
                    onChange={(e) => setFilterCapacity(e.target.value)}
                    className="w-24"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Label>Amenities:</Label>
                  {allAmenities.slice(0, 6).map((amenity) => {
                    const IconComponent = amenityIcons[amenity as keyof typeof amenityIcons]
                    return (
                      <Badge
                        key={amenity}
                        variant={filterAmenities.includes(amenity) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleAmenityFilter(amenity)}
                      >
                        {IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
                        {amenity}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Venue List */}
            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {filteredVenues.map((venue) => (
                <Card
                  key={venue.id}
                  className={`cursor-pointer transition-colors ${
                    selectedVenue?.id === venue.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedVenue(venue)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={venue.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {venue.firstName[0]}
                          {venue.lastName[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {venue.venueName || `${venue.firstName} ${venue.lastName}'s Venue`}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Managed by {venue.firstName} {venue.lastName}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {venue.venueAddress || `${venue.city}, ${venue.state}`}
                          </div>
                          {venue.maxCapacity && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Up to {venue.maxCapacity} guests
                            </div>
                          )}
                          {venue.averageRating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {venue.averageRating} ({venue.totalReviews} reviews)
                            </div>
                          )}
                        </div>

                        {venue.venueDescription && (
                          <p className="text-sm text-gray-600 line-clamp-2">{venue.venueDescription}</p>
                        )}

                        <div className="flex flex-wrap gap-1">
                          {venue.amenities.slice(0, 4).map((amenity) => {
                            const IconComponent = amenityIcons[amenity as keyof typeof amenityIcons]
                            return (
                              <Badge key={amenity} variant="secondary" className="text-xs">
                                {IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
                                {amenity}
                              </Badge>
                            )
                          })}
                          {venue.amenities.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{venue.amenities.length - 4} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            {venue.meetingSpaces.length} meeting spaces available
                          </div>
                          <div className="text-lg font-semibold text-blue-600">${venue.basePrice || 0}/day</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Booking Form */}
            {selectedVenue && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Book {selectedVenue.venueName || `${selectedVenue.firstName} ${selectedVenue.lastName}'s Venue`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-transparent"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label>End Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-transparent"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="purpose">Event Purpose *</Label>
                    <Input
                      id="purpose"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="Conference, Workshop, Meeting, etc."
                    />
                  </div>

                  {/* Meeting Spaces Selection */}
                  {selectedVenue.meetingSpaces.length > 0 && (
                    <div>
                      <Label>Additional Meeting Spaces</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        {selectedVenue.meetingSpaces.map((space) => (
                          <div
                            key={space.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedSpaces.includes(space.id)
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            } ${!space.isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() => space.isAvailable && handleSpaceSelect(space.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{space.name}</h4>
                                <p className="text-sm text-gray-500">
                                  Capacity: {space.capacity} | Area: {space.area} sq ft
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">${space.hourlyRate}/hr</div>
                                <div className="text-xs text-gray-500">
                                  {space.isAvailable ? "Available" : "Unavailable"}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="specialRequests">Special Requests</Label>
                    <Textarea
                      id="specialRequests"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Any special requirements, setup needs, catering preferences, etc."
                      rows={3}
                    />
                  </div>

                  {/* Cost Summary */}
                  {startDate && endDate && (
                    <div className="p-4 bg-white rounded-lg border">
                      <h4 className="font-semibold mb-2">Booking Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>
                            Venue rental ({Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))}{" "}
                            days)
                          </span>
                          <span>
                            $
                            {(selectedVenue.basePrice || 0) *
                              Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))}
                          </span>
                        </div>
                        {selectedSpaces.length > 0 && (
                          <div className="flex justify-between">
                            <span>Meeting spaces ({selectedSpaces.length} spaces)</span>
                            <span>
                              $
                              {selectedSpaces.reduce((total, spaceId) => {
                                const space = selectedVenue.meetingSpaces.find((s) => s.id === spaceId)
                                const days = Math.ceil(
                                  (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
                                )
                                return total + (space ? space.hourlyRate * 8 * days : 0)
                              }, 0)}
                            </span>
                          </div>
                        )}
                        <div className="border-t pt-1 flex justify-between font-semibold">
                          <span>Total</span>
                          <span>${calculateTotalCost()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button onClick={handleBookVenue} disabled={loading}>
                      {loading ? "Submitting..." : "Submit Booking Request"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
