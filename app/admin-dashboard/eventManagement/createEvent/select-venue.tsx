"use client"

import { useState, useEffect, useMemo } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, MapPin, Building } from "lucide-react"
import { getCityOptions, getCountryOptions, getStateOptions } from "@/lib/location-data"

interface Venue {
  id: string
  venueName?: string
  venueAddress?: string
  venueCity?: string
  venueState?: string
  venueCountry?: string
  maxCapacity?: number
  amenities: string[]
}

const LOCATION_NONE = "__none__"

interface SelectVenueProps {
  selectedVenueId: string
  onVenueChange: (venueData: {
    venueId?: string
    venueName: string
    venueAddress: string
    city: string
    state?: string
    country?: string
  }) => void
}

export function SelectVenue({ selectedVenueId, onVenueChange }: SelectVenueProps) {
  const [venues, setVenues] = useState<Venue[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [countryPick, setCountryPick] = useState<string>(LOCATION_NONE)
  const [statePick, setStatePick] = useState<string>(LOCATION_NONE)
  const [cityPick, setCityPick] = useState<string>(LOCATION_NONE)
  const countryOptions = useMemo(() => getCountryOptions(), [])
  const [newVenue, setNewVenue] = useState({
    venueName: "",
    venueAddress: "",
    venueCity: "",
    venueState: "",
    venueCountry: "",
    maxCapacity: 0,
    amenities: [] as string[]
  })

  useEffect(() => {
    fetchVenues()
  }, [])

  const fetchVenues = async () => {
    try {
      setIsLoading(true)
      const data = await apiFetch<{ data?: Venue[]; users?: Venue[] }>(
        "/api/admin/users?role=VENUE_MANAGER&limit=500",
        { auth: true }
      )
      const list = Array.isArray(data?.data) ? data.data : data?.users ?? []
      setVenues(list)
    } catch (error) {
      console.error("Error fetching venues:", error)
      setVenues([])
    } finally {
      setIsLoading(false)
    }
  }

  // FIXED: Added null checks for venue fields
  const filteredVenues = venues.filter(venue => {
    if (!venue) return false
    
    const searchLower = searchTerm.toLowerCase()
    
    return (
      (venue.venueName?.toLowerCase() || '').includes(searchLower) ||
      (venue.venueCity?.toLowerCase() || '').includes(searchLower) ||
      (venue.venueAddress?.toLowerCase() || '').includes(searchLower)
    )
  })

  const handleCreateVenue = async () => {
    if (!newVenue.venueName || !newVenue.venueCity) {
      alert("Please fill in venue name and city")
      return
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newVenue,
          firstName: "Venue",
          lastName: "Manager",
          email: `venue-${Date.now()}@example.com`,
          password: "TEMP_PASSWORD",
          role: 'VENUE_MANAGER'
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const user = data?.data ?? data?.user ?? data
        onVenueChange({
          venueId: user.id,
          venueName: user.venueName ?? "",
          venueAddress: user.venueAddress ?? "",
          city: user.venueCity ?? "",
          state: user.venueState,
          country: user.venueCountry
        })
        setShowCreateForm(false)
        setCountryPick(LOCATION_NONE)
        setStatePick(LOCATION_NONE)
        setCityPick(LOCATION_NONE)
        setNewVenue({
          venueName: "",
          venueAddress: "",
          venueCity: "",
          venueState: "",
          venueCountry: "",
          maxCapacity: 0,
          amenities: []
        })
        fetchVenues()
      } else {
        alert("Error creating venue")
      }
    } catch (error) {
      console.error("Error creating venue:", error)
      alert("Error creating venue")
    }
  }

  const selectedVenue = venues.find(venue => venue.id === selectedVenueId)

  const resolvedCountryCode = useMemo(() => {
    if (countryPick !== LOCATION_NONE) return countryPick
    const typed = newVenue.venueCountry.trim().toLowerCase()
    if (!typed) return ""
    const row = countryOptions.find((c) => c.name.trim().toLowerCase() === typed)
    return row?.code ?? ""
  }, [countryPick, newVenue.venueCountry, countryOptions])

  const stateOptions = useMemo(() => getStateOptions(resolvedCountryCode), [resolvedCountryCode])
  const resolvedStateCode = useMemo(() => {
    if (statePick !== LOCATION_NONE) return statePick
    const typed = newVenue.venueState.trim().toLowerCase()
    if (!typed) return ""
    const row = stateOptions.find((s) => s.name.trim().toLowerCase() === typed)
    return row?.code ?? ""
  }, [statePick, newVenue.venueState, stateOptions])

  const cityOptions = useMemo(() => {
    return getCityOptions(resolvedCountryCode, resolvedStateCode)
  }, [resolvedCountryCode, resolvedStateCode])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Event Venue
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select an existing venue or create a new one
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Select */}
        <div className="space-y-3">
          <Label>Select Venue</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search venues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
          </div>

          {!showCreateForm && (
            <Select 
              value={selectedVenueId} 
              onValueChange={(value) => {
                const venue = venues.find(v => v.id === value)
                if (venue) {
                  onVenueChange({
                    venueId: venue.id,
                    venueName: venue.venueName || '',
                    venueAddress: venue.venueAddress || '',
                    city: venue.venueCity || '',
                    state: venue.venueState,
                    country: venue.venueCountry
                  })
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a venue" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : filteredVenues.length === 0 ? (
                  <SelectItem value="no-results" disabled>No venues found</SelectItem>
                ) : (
                  filteredVenues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{venue.venueName || "Unnamed Venue"}</div>
                          <div className="text-xs text-muted-foreground">
                            {venue.venueCity || "Unknown City"}, {venue.venueState || "N/A"} • Capacity: {venue.maxCapacity || "N/A"}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}

          {selectedVenue && !showCreateForm && (
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{selectedVenue.venueName || "Unnamed Venue"}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedVenue.venueAddress || "No address"}, {selectedVenue.venueCity || "Unknown City"}, {selectedVenue.venueState || "N/A"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Capacity: {selectedVenue.maxCapacity || "N/A"} • {selectedVenue.amenities?.length || 0} amenities
                  </div>
                </div>
                <Badge variant="secondary">Selected</Badge>
              </div>
            </div>
          )}
        </div>

        {/* Create New Venue Form */}
        {showCreateForm && (
          <div className="p-4 border rounded-lg space-y-4">
            <h4 className="font-medium">Create New Venue</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="venueName">Venue Name *</Label>
                <Input
                  id="venueName"
                  value={newVenue.venueName}
                  onChange={(e) => setNewVenue(prev => ({ ...prev, venueName: e.target.value }))}
                  placeholder="Grand Convention Center"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="venueAddress">Address</Label>
                <Input
                  id="venueAddress"
                  value={newVenue.venueAddress}
                  onChange={(e) => setNewVenue(prev => ({ ...prev, venueAddress: e.target.value }))}
                  placeholder="123 Main Street"
                />
              </div>
              <div>
                <Label className="mb-2 block">Choose Your Country</Label>
                <Select
                  value={countryPick}
                  onValueChange={(value) => {
                    setCountryPick(value)
                    if (value === LOCATION_NONE) return
                    const row = countryOptions.find((x) => x.code === value)
                    if (row) {
                      setNewVenue((prev) => ({
                        ...prev,
                        venueCountry: row.name,
                        venueState: "",
                        venueCity: "",
                      }))
                      setStatePick(LOCATION_NONE)
                      setCityPick(LOCATION_NONE)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LOCATION_NONE}>-- None --</SelectItem>
                    {countryOptions.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name} ({country.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">Choose Your State</Label>
                <Select
                  value={statePick}
                  onValueChange={(value) => {
                    setStatePick(value)
                    if (value === LOCATION_NONE) return
                    const state = stateOptions.find((s) => s.code === value)
                    if (!state) return
                    setCityPick(LOCATION_NONE)
                    setNewVenue((prev) => ({ ...prev, venueState: state.name, venueCity: "" }))
                  }}
                  disabled={!resolvedCountryCode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!resolvedCountryCode ? "Pick country first" : "Choose your state"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LOCATION_NONE}>-- None --</SelectItem>
                    {stateOptions.map((state) => (
                      <SelectItem key={state.code} value={state.code}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">Choose Your City</Label>
                <Select
                  disabled={!resolvedCountryCode || !resolvedStateCode}
                  value={cityPick}
                  onValueChange={(value) => {
                    setCityPick(value)
                    if (value === LOCATION_NONE) return
                    const city = cityOptions.find((c) => c.name === value)
                    if (city) {
                      setNewVenue((prev) => ({ ...prev, venueCity: city.name }))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !resolvedCountryCode
                          ? "Pick country first"
                          : !resolvedStateCode
                          ? "Pick state first"
                          : "Choose your city"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LOCATION_NONE}>-- None --</SelectItem>
                    {cityOptions.map((city) => (
                      <SelectItem key={city.name} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="maxCapacity">Maximum Capacity</Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  value={newVenue.maxCapacity || ""}
                  onChange={(e) => setNewVenue(prev => ({ ...prev, maxCapacity: Number(e.target.value) || 0 }))}
                  placeholder="1000"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateVenue}>
                <Plus className="w-4 h-4 mr-2" />
                Create Venue
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}