"use client"


import { devLog } from "@/lib/dev-log"

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
  Loader2,
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
  const router = useRouter()

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

  const handleVenueClick = (venueId: string) => {
    router.push(`/venue/${venueId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading venues...</p>
        </div>
      </div>
    )
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
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find Perfect Venues</h1>
              <p className="text-gray-600 mt-1">Discover amazing venues for your next event</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Filters */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg border p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Discover Venues</h2>

              {/* Search Input */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Active Filters Display */}
              {(selectedCities.length > 0 || selectedCountries.length > 0) && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Active Filters:</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedCities.map(city => (
                      <Badge key={city} variant="secondary" className="bg-blue-100 text-blue-700">
                        {city} ×
                      </Badge>
                    ))}
                    {selectedCountries.map(country => (
                      <Badge key={country} variant="secondary" className="bg-blue-100 text-blue-700">
                        {country} ×
                      </Badge>
                    ))}
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedCities([])
                      setSelectedCountries([])
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Popular Cities */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Popular cities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {popularCities.map((city, index) => (
                    <button
                      key={index}
                      onClick={() => toggleCityFilter(city)}
                      className={`text-left text-sm py-2 px-3 rounded-md transition-colors ${
                        selectedCities.includes(city) ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Countries */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Popular countries</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {popularCountries.map((country, index) => (
                    <button
                      key={index}
                      onClick={() => toggleCountryFilter(country.name)}
                      className={`flex items-center text-left text-sm py-2 px-3 rounded-md transition-colors ${
                        selectedCountries.includes(country.name)
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span className="mr-2">{country.flag}</span>
                      {country.name}
                    </button>
                  ))}
                </div>
                {/* <Button variant="outline" className="w-full text-sm bg-transparent">
                  Browse All Countries
                </Button> */}
              </div>

              {/* Collections */}
              {/* <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Collections</h3>
                <div className="space-y-2 mb-4">
                  {collections.map((collection) => {
                    const IconComponent = collection.icon
                    return (
                      <button
                        key={collection.name}
                        onClick={() => toggleCollectionFilter(collection.name)}
                        className={`flex items-center w-full text-left text-sm py-3 px-3 rounded-md transition-colors ${
                          selectedCollections.includes(collection.name)
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <IconComponent className="w-4 h-4 mr-3" />
                        {collection.name}
                      </button>
                    )
                  })}
                </div>
                <Button variant="outline" className="w-full text-sm bg-transparent">
                  All Category
                </Button>
              </div> */}
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {filteredVenues.length} venue{filteredVenues.length !== 1 ? 's' : ''} found
                  {(selectedCities.length > 0 || selectedCountries.length > 0) && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      {selectedCities.length > 0 && `in ${selectedCities.join(', ')}`}
                      {selectedCountries.length > 0 && ` from ${selectedCountries.join(', ')}`}
                    </span>
                  )}
                </h2>
                <p className="text-gray-600">Best venues for your events</p>
              </div>
            </div>

            {/* Venues Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredVenues.map((venue, index) => (
                <div
                  key={venue.id || index}
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group rounded-sm border cursor-pointer bg-white"
                  onClick={() => handleVenueClick(venue.id)}
                >
                  {/* Image */}
                  <div className="relative">
                    <img
                      src={venue.venueImages?.[0] || "/placeholder.svg"}
                      alt={venue.venueName || "Venue"}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
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
        </div>
      </div>
    </div>
  )
}