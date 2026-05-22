"use client"


import { devLog } from "@/lib/dev-log"
import VenuesListingPageSkeleton from "@/components/VenuesListingPageSkeleton"
import { getVenuePublicPath } from "@/lib/venue-dashboard-path"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Star,
  Wifi,
  Car,
  Coffee,
  Shield,
  Camera,
  Building2,
  Users2,
  Utensils,
  Trophy,
  Music,
} from "lucide-react"

interface Venue {
  id: string
  venueName: string
  logo: string
  contactPerson: string
  email: string
  mobile: string
  address: string
  city: string
  state: string
  country: string
  website: string
  description: string
  maxCapacity: number
  totalHalls: number
  totalEvents: number
  activeBookings: number
  averageRating: number
  totalReviews: number
  amenities: string[]
  meetingSpaces: any[]
  isVerified: boolean
  venueImages: string[]
}

export default function VenuesPage() {
  const searchParams = useSearchParams()
  const searchFromUrl = searchParams.get("search")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const router = useRouter()

  const activeFilterCount = selectedCities.length + selectedCountries.length

  // Fetch venues only once on component mount
  useEffect(() => {
    fetchVenues()
  }, []) // Empty dependency array - fetch only once

  useEffect(() => {
    if (searchFromUrl) setSearchQuery(searchFromUrl)
  }, [searchFromUrl])

  const fetchVenues = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/venues")
      if (!response.ok) {
        throw new Error("Failed to fetch venues")
      }

      const data = await response.json()
      devLog("API Response:", data) // Debug log
      
      // Backend /api/venues returns { success, data: venues, pagination }
      const list = Array.isArray(data.venues) ? data.venues : data.data
      if (data.success && Array.isArray(list)) {
        setVenues(list)
      } else {
        setVenues([])
      }
      setError(null)
    } catch (err) {
      setError("Failed to load venues. Please try again.")
      setVenues([])
      console.error("Error fetching venues:", err)
    } finally {
      setLoading(false)
    }
  }

  const popularCities = ["Bangalore", "Hyderabad", "Chennai", "Pune", "Gurgaon", "Noida", "Mumbai", "Delhi", "Kolkata"]

  const popularCountries = [
    { name: "United States", flag: "🇺🇸" },
    { name: "India", flag: "🇮🇳" },
    { name: "United Kingdom", flag: "🇬🇧" },
    { name: "Canada", flag: "🇨🇦" },
    { name: "Australia", flag: "🇦🇺" },
    { name: "Germany", flag: "🇩🇪" },
    { name: "France", flag: "🇫🇷" },
    { name: "Japan", flag: "🇯🇵" },
    { name: "Brazil", flag: "🇧🇷" },
    { name: "South Korea", flag: "🇰🇷" },
    { name: "Italy", flag: "🇮🇹" },
    { name: "South Africa", flag: "🇿🇦" },
  ]

  const collections = [
    { name: "Hotels & Resorts", icon: Building2 },
    { name: "Conference Centres", icon: Users2 },
    { name: "Banquets & Halls", icon: Utensils },
    { name: "Exhibition & Convention Centres", icon: Building2 },
    { name: "Sports Complexes", icon: Trophy },
    { name: "Auditoriums", icon: Music },
  ]

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "wifi":
        return <Wifi className="w-4 h-4" />
      case "parking":
        return <Car className="w-4 h-4" />
      case "catering":
        return <Coffee className="w-4 h-4" />
      case "security":
        return <Shield className="w-4 h-4" />
      case "av":
        return <Camera className="w-4 h-4" />
      default:
        return null
    }
  }

  const getAmenityLabel = (amenity: string) => {
    switch (amenity) {
      case "wifi":
        return "WiFi"
      case "parking":
        return "Parking"
      case "catering":
        return "Catering"
      case "security":
        return "Security"
      case "av":
        return "AV Equipment"
      default:
        return amenity
    }
  }

  const toggleCityFilter = (city: string) => {
    setSelectedCities((prev) => (prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]))
  }

  const toggleCountryFilter = (country: string) => {
    setSelectedCountries((prev) => (prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]))
  }

  const toggleCollectionFilter = (collection: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collection) ? prev.filter((c) => c !== collection) : [...prev, collection],
    )
  }

  const displayName = (v: Venue) => (v.venueName && v.venueName.trim() ? v.venueName : "Unnamed Venue")

  const displayDesc = (v: Venue) => {
    return v.description && v.description.trim() ? v.description : "No description available"
  }

  // Updated displayAddress to use the separate address fields from API
  const displayAddress = (v: Venue) => {
    const parts = []
    if (v.address && v.address.trim()) parts.push(v.address.trim())
    if (v.city && v.city.trim()) parts.push(v.city.trim())
    if (v.state && v.state.trim()) parts.push(v.state.trim())
    if (v.country && v.country.trim()) parts.push(v.country.trim())
    
    return parts.length > 0 ? parts.join(", ") : "Address not provided"
  }

  const displayCapacity = (v: Venue) => (v.maxCapacity && v.maxCapacity > 0 ? v.maxCapacity : "N/A")

  const displayHalls = (v: Venue) => (v.totalHalls && v.totalHalls > 0 ? v.totalHalls : "N/A")

  // Improved filtering logic that uses the separate address fields from API
  const filteredVenues = Array.isArray(venues)
    ? venues.filter((venue) => {
        const name = displayName(venue)
        const address = displayAddress(venue)
        const city = venue.city || ""
        const country = venue.country || ""
        
        // Search filter
        const matchesSearch =
          searchQuery === "" ||
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          country.toLowerCase().includes(searchQuery.toLowerCase())

        // City filter - use city field directly from API
        const matchesCity =
          selectedCities.length === 0 || 
          selectedCities.some((selectedCity) => 
            city.toLowerCase().includes(selectedCity.toLowerCase()) ||
            address.toLowerCase().includes(selectedCity.toLowerCase())
          )

        // Country filter - use country field directly from API
        const matchesCountry =
          selectedCountries.length === 0 ||
          selectedCountries.some((selectedCountry) => 
            country.toLowerCase().includes(selectedCountry.toLowerCase()) ||
            address.toLowerCase().includes(selectedCountry.toLowerCase())
          )

        return matchesSearch && matchesCity && matchesCountry
      })
    : []

  const handleVenueClick = (venue: Venue) => {
    router.push(getVenuePublicPath(venue.id, venue.venueName))
  }

  if (loading) {
    return <VenuesListingPageSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchVenues}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:py-6">
          <div className="mb-2 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Find Perfect Venues</h1>
            <p className="mt-1 text-sm text-gray-600 sm:text-base">Discover amazing venues for your next event</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          {/* Venue results — first on mobile, right column on desktop */}
          <div className="order-1 min-w-0 w-full flex-1 lg:order-2">
            <div className="mb-4 space-y-3 lg:hidden">
              <input
                type="text"
                placeholder="Search venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setMobileFiltersOpen((v) => !v)}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm"
              >
                {mobileFiltersOpen ? "Hide filters" : "City & country filters"}
                {activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ""}
              </button>
            </div>

            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                {filteredVenues.length} venue{filteredVenues.length !== 1 ? "s" : ""} found
                {(selectedCities.length > 0 || selectedCountries.length > 0) && (
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    {selectedCities.length > 0 && `in ${selectedCities.join(", ")}`}
                    {selectedCountries.length > 0 && ` from ${selectedCountries.join(", ")}`}
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-600 sm:text-base">Best venues for your events</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {filteredVenues.map((venue, index) => (
                <div
                  key={venue.id || index}
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group rounded-sm border cursor-pointer bg-white"
                  onClick={() => handleVenueClick(venue)}
                >
                  {/* Image */}
                  <div className="relative">
                    <img
                      src={venue.venueImages?.[0] || "/placeholder.svg"}
                      alt={venue.venueName || "Venue"}
                      className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-48"
                      onError={(e) => {
                        if (e.currentTarget.src.endsWith("/placeholder.svg")) return
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />

                    {/* {venue.isVerified && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-green-500 text-white text-xs">
                          Verified
                        </Badge>
                      </div>
                    )} */}
                  </div>

                  {/* Card Content */}
                  <CardContent className="p-5">
                    {/* Venue Name & Rating */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{displayName(venue)}</h3>

                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{venue.averageRating?.toFixed(1) || "0.0"}</span>
                        <span className="text-sm text-gray-500">({venue.totalReviews || 0})</span>
                      </div>
                    </div>

                    {/* Description */}
                    {/* <p className="text-sm text-gray-600 mb-2 line-clamp-2">{displayDesc(venue)}</p>  */}

                    {/* Address - Now shows formatted address with all components */}
                    <div className="flex items-start text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{displayAddress(venue)}</span>
                    </div>

                    {/* Capacity & Halls */}
                    {/* <div className="flex justify-between text-sm text-gray-500"> */}
                      {/* <div> */}
                        {/* <span className="font-medium">Capacity:</span> {displayCapacity(venue)} */}
                         {/* <span className="font-medium">Capacity:</span> {venue.maxCapacity} */}
                      {/* </div> */}
                      {/* <div> */}
                        {/* <span className="font-medium">Halls:</span> {displayHalls(venue)} */}
                         {/* <span className="font-medium">Halls:</span> {venue.totalHalls} */}
                      {/* </div> */}
                    {/* </div> */}

                    {/* Amenities */}
                    {/* {venue.amenities && venue.amenities.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {venue.amenities.slice(0, 3).map((amenity, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {getAmenityIcon(amenity)}
                            <span className="ml-1">{getAmenityLabel(amenity)}</span>
                          </Badge>
                        ))}
                        {venue.amenities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{venue.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )} */}
                  </CardContent>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredVenues.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No venues found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery || selectedCities.length > 0 || selectedCountries.length > 0
                      ? "Try adjusting your search criteria or browse all available venues."
                      : "No venues are currently available in the database."}
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedCities([])
                      setSelectedCountries([])
                      setSelectedCollections([])
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {searchQuery || selectedCities.length > 0 || selectedCountries.length > 0 ? "Clear Filters" : "Refresh"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Filters — left on desktop; collapsible below venues on mobile */}
          <aside className="order-2 w-full shrink-0 lg:order-1 lg:w-64 xl:w-72">
            <div
              className={`rounded-lg border bg-white p-4 sm:p-6 lg:sticky lg:top-8 ${
                mobileFiltersOpen ? "block" : "hidden lg:block"
              }`}
            >
              <h2 className="mb-4 hidden text-lg font-semibold text-gray-900 lg:block xl:text-xl">
                Discover Venues
              </h2>

              <div className="mb-4 hidden lg:block">
                <input
                  type="text"
                  placeholder="Search venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {(selectedCities.length > 0 || selectedCountries.length > 0) && (
                <div className="mb-4 rounded-md bg-blue-50 p-3">
                  <h4 className="mb-2 text-sm font-medium text-blue-800">Active filters</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedCities.map((city) => (
                      <Badge key={city} variant="secondary" className="bg-blue-100 text-blue-700">
                        {city}
                      </Badge>
                    ))}
                    {selectedCountries.map((country) => (
                      <Badge key={country} variant="secondary" className="bg-blue-100 text-blue-700">
                        {country}
                      </Badge>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCities([])
                      setSelectedCountries([])
                    }}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Clear all
                  </button>
                </div>
              )}

              <div className="mb-6">
                <h3 className="mb-3 text-sm font-medium text-gray-700">Popular cities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {popularCities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => toggleCityFilter(city)}
                      className={`rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        selectedCities.includes(city)
                          ? "bg-blue-100 font-medium text-blue-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-medium text-gray-700">Popular countries</h3>
                <div className="grid max-h-[min(40vh,320px)] grid-cols-2 gap-2 overflow-y-auto pr-1 lg:max-h-none">
                  {popularCountries.map((country) => (
                    <button
                      key={country.name}
                      type="button"
                      onClick={() => toggleCountryFilter(country.name)}
                      className={`flex items-center rounded-md px-2 py-2 text-left text-sm transition-colors ${
                        selectedCountries.includes(country.name)
                          ? "bg-blue-100 font-medium text-blue-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span className="mr-1.5 shrink-0">{country.flag}</span>
                      <span className="truncate">{country.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}