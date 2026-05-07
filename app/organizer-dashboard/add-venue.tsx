"use client"


import { devLog } from "@/lib/dev-log"

import { useState, useEffect, useMemo } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Building, Mail, Phone, MapPin, Users, Star, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Venue {
  id?: string
  firstName: string
  lastName: string
  contactPerson?: string
  email: string
  phone?: string
  avatar?: string
  venueName?: string
  venueDescription?: string
  venueAddress?: string
  venueCity?: string
  venueCountry?: string
  venueState?: string
  venueZipCode?: string
  venuepostalCode?: string
  city?: string
  state?: string
  country?: string
  maxCapacity?: number
  totalHalls?: number
  averageRating?: number
  totalReviews?: number
  amenities: string[]
  basePrice?: number
  venueTimezone?: string
  timezone?: string
}

interface MeetingSpace {
  name: string
  capacity: number
  area: number
  hourlyRate: number
  features: string[]
}

interface AddVenueProps {
  organizerId: string
  onVenueChange?: (venueData: {
    venueId?: string
    venueName: string
    venueAddress: string
    city: string
    state?: string
    country?: string
    /** IANA time zone from venue profile when set */
    timezone?: string
  }) => void
  selectedVenueId?: string  // Add this prop
}

type DbCountryRow = {
  id: string
  name: string
  code: string
  cities: { id: string; name: string }[]
}

const LOCATION_NONE = "__none__"

export default function AddVenue({ organizerId, onVenueChange, selectedVenueId }: AddVenueProps) {
  const [venues, setVenues] = useState<Venue[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("existing")
  const { toast } = useToast()
  const [locationLoading, setLocationLoading] = useState(false)
  const [dbCountries, setDbCountries] = useState<DbCountryRow[]>([])
  const [countryPick, setCountryPick] = useState<string>(LOCATION_NONE)
  const [cityPick, setCityPick] = useState<string>(LOCATION_NONE)

  // New venue form state
  const [newVenue, setNewVenue] = useState({
    // Venue Manager Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    tempPassword: "",

    // Venue Information
    venueName: "",
    venueDescription: "",
    website: "",
    maxCapacity: "",
    totalHalls: "",
    basePrice: "",

    // Address Information
    venueAddress: "",
    venuecity: "",
    venuestate: "",
    venuecountry: "",
    venuepostalCode: "",

    // Amenities
    amenities: [] as string[],
  })

  // Meeting spaces state
  const [meetingSpaces, setMeetingSpaces] = useState<MeetingSpace[]>([
    {
      name: "",
      capacity: 0,
      area: 0,
      hourlyRate: 0,
      features: [],
    },
  ])

  useEffect(() => {
    fetchVenues()
    fetchCountries()
  }, [])

  const fetchCountries = async () => {
    try {
      setLocationLoading(true)
      const res = await apiFetch<{ success?: boolean; data?: DbCountryRow[] }>(
        "/api/location/countries",
        { auth: false },
      )
      setDbCountries(res?.success && Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error("Error fetching location data:", error)
      setDbCountries([])
    } finally {
      setLocationLoading(false)
    }
  }

  const resolvedCountryId = useMemo(() => {
    if (countryPick !== LOCATION_NONE) return countryPick
    const typed = newVenue.venuecountry.trim().toLowerCase()
    if (!typed) return ""
    const row = dbCountries.find((c) => c.name.trim().toLowerCase() === typed)
    return row?.id ?? ""
  }, [countryPick, newVenue.venuecountry, dbCountries])

  const cityOptions = useMemo(() => {
    if (!resolvedCountryId) return []
    return dbCountries.find((c) => c.id === resolvedCountryId)?.cities ?? []
  }, [resolvedCountryId, dbCountries])

  const fetchVenues = async () => {
    try {
      const response = await fetch("/api/venues")
      if (response.ok) {
        const result = await response.json()
        devLog("[v0] Venues API response:", result)

        // API returns { success: true, data: venues, pagination: {...} }
        if (result.success && Array.isArray(result.data)) {
          setVenues(result.data)
          devLog("[v0] Loaded venues:", result.data.length)
        } else {
          console.error("[v0] Invalid API response format:", result)
          setVenues([])
        }
      }
    } catch (error) {
      console.error("Error fetching venues:", error)
    }
  }

  const filteredVenues = venues.filter((venue) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      venue.venueName?.toLowerCase().includes(searchLower) ||
      `${venue.firstName} ${venue.lastName}`.toLowerCase().includes(searchLower) ||
      venue.email.toLowerCase().includes(searchLower) ||
      (venue.venueCity || venue.city || "").toLowerCase().includes(searchLower) ||
      venue.venueAddress?.toLowerCase().includes(searchLower)
    )
  })

  const getManagerName = (venue: Venue) => {
    const byContactPerson = (venue.contactPerson || "").trim()
    if (byContactPerson) return byContactPerson
    const byFirstLast = `${venue.firstName || ""} ${venue.lastName || ""}`.trim()
    if (byFirstLast) return byFirstLast
    return "Venue Manager"
  }

  const isMeaningfulPhone = (value?: string) => {
    if (!value) return false
    const trimmed = value.trim()
    if (!trimmed) return false
    // Hide placeholder-like values such as 0, 00, 000
    if (/^0+$/.test(trimmed)) return false
    return true
  }

  const getVenuePostalCode = (venue: Venue) => {
    const postal = String(venue.venuepostalCode ?? venue.venueZipCode ?? "").trim()
    if (!postal || /^0+$/.test(postal)) return ""
    return postal
  }

  const getVenueDescription = (venue: Venue) => {
    const description = String(venue.venueDescription ?? "").trim()
    if (!description || /^0+$/.test(description)) return ""
    return description
  }

  const getVisibleAmenities = (venue: Venue) => {
    return (venue.amenities || []).filter((amenity) => {
      const value = String(amenity ?? "").trim()
      return value.length > 0 && !/^0+$/.test(value)
    })
  }

  const handleVenueSelect = (venueId: string) => {
    if (onVenueChange) {
      const selectedVenue = venues.find((v) => v.id === venueId)
      if (selectedVenue) {
        onVenueChange({
          venueId: selectedVenue.id,
          venueName: selectedVenue.venueName || `${selectedVenue.firstName} ${selectedVenue.lastName}'s Venue`,
          venueAddress: selectedVenue.venueAddress || "Address not provided",
          city: selectedVenue.venueCity || selectedVenue.city || "City not provided",
          state: selectedVenue.venueState || selectedVenue.state,
          country: selectedVenue.venueCountry || selectedVenue.country,
          timezone:
            (selectedVenue.venueTimezone || selectedVenue.timezone || "").trim() ||
            undefined,
        })

        toast({
          title: "Venue Selected",
          description: `${selectedVenue.venueName || "Venue"} has been added to your event.`,
        })
      }
    }
  }

  const handleAmenityToggle = (amenity: string) => {
    setNewVenue((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const removeMeetingSpace = (index: number) => {
    setMeetingSpaces((prev) => prev.filter((_, i) => i !== index))
  }

  const updateMeetingSpace = (index: number, field: keyof MeetingSpace, value: any) => {
    setMeetingSpaces((prev) => prev.map((space, i) => (i === index ? { ...space, [field]: value } : space)))
  }

  const toggleSpaceFeature = (spaceIndex: number, feature: string) => {
    setMeetingSpaces((prev) =>
      prev.map((space, i) =>
        i === spaceIndex
          ? {
              ...space,
              features: space.features.includes(feature)
                ? space.features.filter((f) => f !== feature)
                : [...space.features, feature],
            }
          : space,
      ),
    )
  }

  const handleCreateVenue = async () => {
    if (!newVenue.venueName?.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the venue name.",
        variant: "destructive",
      })
      return
    }
    if (!newVenue.email?.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the venue manager email.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const responseData = await apiFetch<{
        venueId?: string
        id?: string
        data?: { venueManager?: { id: string } }
      }>(`/api/venue-manager/${organizerId}`, {
        method: "POST",
        body: {
          venueName: newVenue.venueName.trim(),
          logo: "",
          contactPerson: `${newVenue.firstName} ${newVenue.lastName}`.trim() || undefined,
          firstName: newVenue.firstName.trim() || undefined,
          lastName: newVenue.lastName.trim() || undefined,
          email: newVenue.email.trim(),
          mobile: newVenue.phone.trim() || undefined,
          tempPassword: newVenue.tempPassword.trim() || undefined,
          venueAddress: newVenue.venueAddress.trim() || undefined,
          venueCity: newVenue.venuecity.trim() || undefined,
          venueState: newVenue.venuestate.trim() || undefined,
          venueCountry: newVenue.venuecountry.trim() || undefined,
          venueZipCode: newVenue.venuepostalCode.trim() || undefined,
          website: newVenue.website.trim() || undefined,
          venueDescription: newVenue.venueDescription.trim() || undefined,
          maxCapacity: newVenue.maxCapacity ? Number.parseInt(newVenue.maxCapacity, 10) : 0,
          totalHalls: newVenue.totalHalls ? Number.parseInt(newVenue.totalHalls, 10) : 0,
          activeBookings: 0,
          averageRating: 0,
          totalReviews: 0,
          amenities: newVenue.amenities,
          meetingSpaces: meetingSpaces.filter((space) => space.name.trim() !== ""),
        },
        auth: true,
      })

      const venueId =
        responseData.venueId ||
        responseData.id ||
        responseData.data?.venueManager?.id

      toast({
        title: "Success",
        description: "Venue created and added to your event.",
      })

      if (onVenueChange && venueId) {
        onVenueChange({
          venueId,
          venueName: newVenue.venueName,
          venueAddress: newVenue.venueAddress || "Address not provided",
          city: newVenue.venuecity || "City not provided",
          state: newVenue.venuestate,
          country: newVenue.venuecountry,
        })
      }

      setNewVenue({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        tempPassword: "",
        venueName: "",
        venueDescription: "",
        website: "",
        maxCapacity: "",
        totalHalls: "",
        basePrice: "",
        venueAddress: "",
        venuecity: "",
        venuestate: "",
        venuecountry: "",
        venuepostalCode: "",
        amenities: [],
      })
      setCountryPick(LOCATION_NONE)
      setCityPick(LOCATION_NONE)
      setMeetingSpaces([
        { name: "", capacity: 0, area: 0, hourlyRate: 0, features: [] },
      ])
      fetchVenues()
      setActiveTab("existing")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create venue.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Add Venue to Event
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select an existing venue or create a new one. The selected venue will be used when you publish the event.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="existing">Select Existing Venue</TabsTrigger>
              {/* <TabsTrigger value="new">Create New Venue</TabsTrigger> */}
            </TabsList>

            <TabsContent value="existing" className="space-y-6">
              {/* Search Venues */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search venues by name, manager, email, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {selectedVenueId && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Venue selected! This venue will be used when you publish the event.
                  </span>
                </div>
              )}

              {/* Venues List */}
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {filteredVenues.map((venue) => (
                  <Card
                    key={venue.id}
                    className={`cursor-pointer transition-all ${
                      selectedVenueId === venue.id
                        ? "ring-2 ring-green-500 bg-green-50 shadow-md"
                        : "hover:bg-gray-50 hover:shadow-sm"
                    }`}
                    onClick={() => handleVenueSelect(venue.id!)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={venue.avatar || "/city/c4.jpg"} />
                          <AvatarFallback>
                            {(venue.firstName?.[0] || venue.venueName?.[0] || "V").toUpperCase()}
                            {(venue.lastName?.[0] || venue.venueName?.split(" ")[1]?.[0] || "").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold flex items-center gap-2">
                                {venue.venueName || `${venue.firstName} ${venue.lastName}'s Venue`}
                                {selectedVenueId === venue.id && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Managed by {getManagerName(venue)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {/* <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {venue.email}
                            </div> */}
                            {isMeaningfulPhone(venue.phone) && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {venue.phone}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {venue.venueCity || venue.city || "City not provided"},{" "}
                              {venue.venueState || venue.state || "State not provided"},{" "}
                              {venue.venueCountry || venue.country || "Country not provided"}
                            </div>
                            {getVenuePostalCode(venue) && (
                              <div className="flex items-center gap-1">
                                Postal Code: {getVenuePostalCode(venue)}
                              </div>
                            )}
                          </div>

                          {getVenueDescription(venue) && (
                            <p className="text-sm text-gray-600 line-clamp-2">{getVenueDescription(venue)}</p>
                          )}

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {venue.maxCapacity && (
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Up to {venue.maxCapacity} guests
                              </div>
                            )}
                            {venue.totalHalls && (
                              <div className="flex items-center gap-1">
                                <Building className="w-3 h-3" />
                                {venue.totalHalls} halls
                              </div>
                            )}
                            {venue.averageRating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                {venue.averageRating} ({venue.totalReviews} reviews)
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {getVisibleAmenities(venue).slice(0, 4).map((amenity) => (
                              <Badge key={amenity} variant="secondary" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                            {getVisibleAmenities(venue).length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{getVisibleAmenities(venue).length - 4} more
                              </Badge>
                            )}
                          </div>

                          {venue.basePrice && (
                            <div className="text-lg font-semibold text-blue-600">${venue.basePrice}/day</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

          
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}