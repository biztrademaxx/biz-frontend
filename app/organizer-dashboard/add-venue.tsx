"use client"

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
  email: string
  phone?: string
  avatar?: string
  venueName?: string
  venueDescription?: string
  venueAddress?: string
  venueCity?: string
  venueCountry?: string
  venueState?: string
  city?: string
  state?: string
  country?: string
  maxCapacity?: number
  totalHalls?: number
  averageRating?: number
  totalReviews?: number
  amenities: string[]
  basePrice?: number
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
        console.log("[v0] Venues API response:", result)

        // API returns { success: true, data: venues, pagination: {...} }
        if (result.success && Array.isArray(result.data)) {
          setVenues(result.data)
          console.log("[v0] Loaded venues:", result.data.length)
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">Select Existing Venue</TabsTrigger>
              <TabsTrigger value="new">Create New Venue</TabsTrigger>
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
                          <AvatarImage src={venue.avatar || "/placeholder.svg"} />
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
                                Managed by {venue.firstName} {venue.lastName}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {venue.email}
                            </div>
                            {venue.phone && (
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
                          </div>

                          {venue.venueDescription && (
                            <p className="text-sm text-gray-600 line-clamp-2">{venue.venueDescription}</p>
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
                            {venue.amenities.slice(0, 4).map((amenity) => (
                              <Badge key={amenity} variant="secondary" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                            {venue.amenities.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{venue.amenities.length - 4} more
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

            <TabsContent value="new" className="space-y-6">
              {/* Create New Venue Form */}
              <div className="space-y-8">
                {/* Venue Manager Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Venue Manager</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Manager First Name</Label>
                        <Input
                          id="firstName"
                          value={newVenue.firstName}
                          onChange={(e) => setNewVenue({ ...newVenue, firstName: e.target.value })}
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Manager Last Name</Label>
                        <Input
                          id="lastName"
                          value={newVenue.lastName}
                          onChange={(e) => setNewVenue({ ...newVenue, lastName: e.target.value })}
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newVenue.email}
                        onChange={(e) => setNewVenue({ ...newVenue, email: e.target.value })}
                        placeholder="venue.manager@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tempPassword">Temporary Password</Label>
                      <Input
                        id="tempPassword"
                        type="password"
                        value={newVenue.tempPassword}
                        onChange={(e) => setNewVenue({ ...newVenue, tempPassword: e.target.value })}
                        placeholder="Leave blank to use default (TEMP_PASSWORD)"
                        autoComplete="new-password"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Venue manager can change this on first login.
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newVenue.phone}
                        onChange={(e) => setNewVenue({ ...newVenue, phone: e.target.value })}
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>
                </div>

                {/* Venue Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Venue Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="venueName">Venue Name *</Label>
                      <Input
                        id="venueName"
                        value={newVenue.venueName}
                        onChange={(e) => setNewVenue({ ...newVenue, venueName: e.target.value })}
                        placeholder="Grand Convention Center"
                      />
                    </div>

                    <div>
                      <Label htmlFor="venueDescription">Description</Label>
                      <Textarea
                        id="venueDescription"
                        value={newVenue.venueDescription}
                        onChange={(e) => setNewVenue({ ...newVenue, venueDescription: e.target.value })}
                        placeholder="Describe the venue, its features, and what makes it special..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Address Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="venueAddress">Street Address</Label>
                    <Input
                      id="venueAddress"
                      value={newVenue.venueAddress}
                      onChange={(e) => setNewVenue({ ...newVenue, venueAddress: e.target.value })}
                      placeholder="123 Convention Street"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="md:col-span-2 lg:col-span-1">
                      <Label>Choose Your Country</Label>
                      <Select
                        disabled={locationLoading}
                        value={countryPick}
                        onValueChange={(value) => {
                          setCountryPick(value)
                          if (value === LOCATION_NONE) return
                          const row = dbCountries.find((c) => c.id === value)
                          if (row) {
                            setNewVenue((prev) => ({
                              ...prev,
                              venuecountry: row.name,
                              venuecity: "",
                            }))
                            setCityPick(LOCATION_NONE)
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={locationLoading ? "Loading..." : "Choose your country"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={LOCATION_NONE}>-- None --</SelectItem>
                          {dbCountries.map((country) => (
                            <SelectItem key={country.id} value={country.id}>
                              {country.name} ({country.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2 lg:col-span-1">
                      <Label>Choose Your City</Label>
                      <Select
                        disabled={locationLoading || !resolvedCountryId}
                        value={cityPick}
                        onValueChange={(value) => {
                          setCityPick(value)
                          if (value === LOCATION_NONE) return
                          const city = cityOptions.find((c) => c.id === value)
                          if (city) setNewVenue((prev) => ({ ...prev, venuecity: city.name }))
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !resolvedCountryId
                                ? "Pick/Type country first"
                                : locationLoading
                                  ? "Loading..."
                                  : "Choose your city"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={LOCATION_NONE}>-- None --</SelectItem>
                          {cityOptions.map((city) => (
                            <SelectItem key={city.id} value={city.id}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={newVenue.venuecity}
                        onChange={(e) => {
                          setCityPick(LOCATION_NONE)
                          setNewVenue({ ...newVenue, venuecity: e.target.value })
                        }}
                        placeholder="San Francisco"
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={newVenue.venuestate}
                        onChange={(e) => setNewVenue({ ...newVenue, venuestate: e.target.value })}
                        placeholder="California"
                      />
                    </div>

                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={newVenue.venuecountry}
                        onChange={(e) => {
                          setCountryPick(LOCATION_NONE)
                          setCityPick(LOCATION_NONE)
                          setNewVenue({ ...newVenue, venuecountry: e.target.value })
                        }}
                        placeholder="United States"
                      />
                    </div>

                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={newVenue.venuepostalCode}
                        onChange={(e) => setNewVenue({ ...newVenue, venuepostalCode: e.target.value })}
                        placeholder="94102"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleCreateVenue} disabled={loading}>
                  {loading ? "Creating..." : "Create Venue"}
                </Button>
              </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}