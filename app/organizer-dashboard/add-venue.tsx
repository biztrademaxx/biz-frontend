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
const FILTER_ALL_COUNTRIES = "__all__"

function getVenueCountryLabel(venue: Venue): string {
  return (venue.venueCountry || venue.country || "").trim()
}

function venueMatchesCountryName(venue: Venue, countryName: string): boolean {
  const venueCountry = getVenueCountryLabel(venue).toLowerCase()
  const target = countryName.trim().toLowerCase()
  if (!target || !venueCountry) return false
  return venueCountry === target || venueCountry.includes(target) || target.includes(venueCountry)
}

function formatVenueCityCountry(venue: Venue): string {
  const city = (venue.venueCity || venue.city || "").trim()
  const country = getVenueCountryLabel(venue)
  if (city && country) return `${city}, ${country}`
  if (city) return city
  if (country) return country
  return "Location not provided"
}

export default function AddVenue({ organizerId, onVenueChange, selectedVenueId }: AddVenueProps) {
  const [venues, setVenues] = useState<Venue[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [venuesLoading, setVenuesLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("existing")
  const { toast } = useToast()
  const [locationLoading, setLocationLoading] = useState(false)
  const [dbCountries, setDbCountries] = useState<DbCountryRow[]>([])
  const [filterCountryPick, setFilterCountryPick] = useState<string>(LOCATION_NONE)
  const [filterCityPick, setFilterCityPick] = useState<string>(LOCATION_NONE)
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
    fetchCountries()
  }, [])

  const filterCountryName = useMemo(() => {
    if (filterCountryPick === LOCATION_NONE || filterCountryPick === FILTER_ALL_COUNTRIES) return ""
    return dbCountries.find((c) => c.id === filterCountryPick)?.name ?? ""
  }, [filterCountryPick, dbCountries])

  const filterCityOptions = useMemo(() => {
    if (!filterCountryPick || filterCountryPick === LOCATION_NONE || filterCountryPick === FILTER_ALL_COUNTRIES) {
      return []
    }
    return dbCountries.find((c) => c.id === filterCountryPick)?.cities ?? []
  }, [filterCountryPick, dbCountries])

  const fetchVenues = async (countryName?: string) => {
    try {
      setVenuesLoading(true)
      const params = new URLSearchParams({ limit: "500" })
      if (countryName?.trim()) params.set("country", countryName.trim())
      const response = await fetch(`/api/venues?${params.toString()}`)
      if (response.ok) {
        const result = await response.json()
        devLog("[v0] Venues API response:", result)

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
      setVenues([])
    } finally {
      setVenuesLoading(false)
    }
  }

  useEffect(() => {
    if (filterCountryPick === LOCATION_NONE) {
      setVenues([])
      return
    }
    if (filterCountryPick === FILTER_ALL_COUNTRIES) {
      void fetchVenues()
      return
    }
    if (filterCountryName) {
      void fetchVenues(filterCountryName)
    }
  }, [filterCountryPick, filterCountryName])

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

  const filteredVenues = venues.filter((venue) => {
    if (filterCountryName && !venueMatchesCountryName(venue, filterCountryName)) {
      return false
    }

    if (filterCityPick !== LOCATION_NONE) {
      const cityName = filterCityOptions.find((c) => c.id === filterCityPick)?.name?.trim().toLowerCase()
      const venueCity = (venue.venueCity || venue.city || "").trim().toLowerCase()
      if (cityName && venueCity !== cityName && !venueCity.includes(cityName)) {
        return false
      }
    }

    const searchLower = searchTerm.toLowerCase()
    if (!searchLower) return true

    return (
      venue.venueName?.toLowerCase().includes(searchLower) ||
      `${venue.firstName} ${venue.lastName}`.toLowerCase().includes(searchLower) ||
      venue.email.toLowerCase().includes(searchLower) ||
      (venue.venueCity || venue.city || "").toLowerCase().includes(searchLower) ||
      venue.venueAddress?.toLowerCase().includes(searchLower) ||
      getVenueCountryLabel(venue).toLowerCase().includes(searchLower)
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
      if (filterCountryName) {
        void fetchVenues(filterCountryName)
      } else if (filterCountryPick === FILTER_ALL_COUNTRIES) {
        void fetchVenues()
      }
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select
                    value={filterCountryPick}
                    onValueChange={(value) => {
                      setFilterCountryPick(value)
                      setFilterCityPick(LOCATION_NONE)
                      setSearchTerm("")
                    }}
                    disabled={locationLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={locationLoading ? "Loading countries…" : "Select country"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={LOCATION_NONE}>Select country</SelectItem>
                      <SelectItem value={FILTER_ALL_COUNTRIES}>All countries</SelectItem>
                      {dbCountries.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose a country to load venues in that region (e.g. India).
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>City (optional)</Label>
                  <Select
                    value={filterCityPick}
                    onValueChange={setFilterCityPick}
                    disabled={
                      filterCountryPick === LOCATION_NONE ||
                      filterCountryPick === FILTER_ALL_COUNTRIES ||
                      filterCityOptions.length === 0
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={LOCATION_NONE}>All cities</SelectItem>
                      {filterCityOptions.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search venues by name, manager, email, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  disabled={filterCountryPick === LOCATION_NONE}
                />
              </div>

              {filterCountryPick !== LOCATION_NONE ? (
                <p className="text-sm text-muted-foreground">
                  {venuesLoading
                    ? "Loading venues…"
                    : `${filteredVenues.length} venue(s)${
                        filterCountryName ? ` in ${filterCountryName}` : ""
                      }${filterCityPick !== LOCATION_NONE ? " (city filtered)" : ""}`}
                </p>
              ) : null}

              {selectedVenueId && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Venue selected! This venue will be used when you publish the event.
                  </span>
                </div>
              )}

              <div className="grid max-h-[32rem] grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
                {filterCountryPick === LOCATION_NONE ? (
                  <div className="col-span-full rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    Select a country above to browse venues for your event.
                  </div>
                ) : venuesLoading ? (
                  <div className="col-span-full rounded-lg border p-8 text-center text-sm text-muted-foreground">
                    Loading venues…
                  </div>
                ) : filteredVenues.length === 0 ? (
                  <div className="col-span-full rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No venues found
                    {filterCountryName ? ` in ${filterCountryName}` : ""}
                    {searchTerm ? " matching your search" : ""}.
                  </div>
                ) : (
                filteredVenues.map((venue) => (
                  <Card
                    key={venue.id}
                    className={`flex h-full cursor-pointer flex-col transition-all ${
                      selectedVenueId === venue.id
                        ? "ring-2 ring-green-500 bg-green-50 shadow-md"
                        : "hover:bg-gray-50 hover:shadow-sm"
                    }`}
                    onClick={() => handleVenueSelect(venue.id!)}
                  >
                    <CardContent className="flex h-full flex-col p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12 shrink-0">
                          <AvatarImage src={venue.avatar} />
                          <AvatarFallback className="text-sm">
                            {(venue.firstName?.[0] || venue.venueName?.[0] || "V").toUpperCase()}
                            {(venue.lastName?.[0] || venue.venueName?.split(" ")[1]?.[0] || "").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <h3 className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-gray-900">
                            <span className="line-clamp-2">
                              {venue.venueName || `${venue.firstName} ${venue.lastName}'s Venue`}
                            </span>
                            {selectedVenueId === venue.id ? (
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                            ) : null}
                          </h3>
                          <p className="mt-1 truncate text-xs text-gray-600">
                            Managed by {getManagerName(venue)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="line-clamp-1">{formatVenueCityCountry(venue)}</span>
                      </div>

                      {getVenueDescription(venue) ? (
                        <p className="mt-2 line-clamp-2 text-xs text-gray-600">{getVenueDescription(venue)}</p>
                      ) : null}

                      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                        {(venue.maxCapacity ?? 0) > 0 ? (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Up to {venue.maxCapacity} guests
                          </div>
                        ) : null}
                        {(venue.totalHalls ?? 0) > 0 ? (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {venue.totalHalls} halls
                          </div>
                        ) : null}
                        {(venue.averageRating ?? 0) > 0 ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {venue.averageRating} ({venue.totalReviews ?? 0})
                          </div>
                        ) : null}
                      </div>

                      {getVisibleAmenities(venue).length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {getVisibleAmenities(venue).slice(0, 2).map((amenity) => (
                            <Badge key={amenity} variant="secondary" className="text-[10px] font-normal">
                              {amenity}
                            </Badge>
                          ))}
                          {getVisibleAmenities(venue).length > 2 ? (
                            <Badge variant="outline" className="text-[10px] font-normal">
                              +{getVisibleAmenities(venue).length - 2}
                            </Badge>
                          ) : null}
                        </div>
                      ) : null}

                      {(venue.basePrice ?? 0) > 0 ? (
                        <div className="mt-auto pt-3 text-sm font-semibold text-[#004A96]">
                          ${venue.basePrice}/day
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                ))
                )}
              </div>
            </TabsContent>

          
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
