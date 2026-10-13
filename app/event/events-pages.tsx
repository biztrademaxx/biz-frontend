"use client"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { apiFetch } from "@/lib/api"
import {
  Search,
  Share2,
  MapPin,
  Calendar,
  Heart,
  Bookmark,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  Users,
  TrendingUp,
  Star,
  Filter,
  X,
} from "lucide-react"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import { eventPublicPath } from "@/lib/event-path"

// Loading component for the suspense boundary
function EventsPageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="flex gap-6">
            <div className="w-80 h-96 bg-gray-200 rounded"></div>
            <div className="flex-1 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EventsPage() {
  return (
    <Suspense fallback={<EventsPageSkeleton />}>
      <EventsPageContent />
    </Suspense>
  )
}

interface Event {
  timings: any
  rating: any
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  registrationStart: string
  registrationEnd: string
  maxAttendees?: number
  isPublic: boolean
  organizerId: string
  venueId: string
  categories: string[]
  tags: string[]
  images: { url: string }[]
  location: {
    city: string
    venue: string
    country?: string
  }
  organizer: {
    id: string
    firstName: string
    avatar?: string
  }
  venue: {
    id: string
    firstName: string
    location: string
    venueCity: string
    venueState: string
    venueCountry: string
  }
  _count: {
    registrations: number
  }
  spotsRemaining?: number | null
  isRegistrationOpen: boolean
}

interface ApiResponse {
  events: Event[]
}

function EventsPageContent() {
  const [activeMainTab, setActiveMainTab] = useState("events")
  const [activeTab, setActiveTab] = useState("All Events")
  const [selectedLocation, setSelectedLocation] = useState("")
  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get("category")
  const venueFromUrl = searchParams.get("venue")
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || "")

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState("Trending")
  const [selectedDateRange, setSelectedDateRange] = useState("")
  const [selectedFormat, setSelectedFormat] = useState("All")
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Sidebar state
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [formatOpen, setFormatOpen] = useState(true)
  const [locationOpen, setLocationOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState<string[]>([])

  const router = useRouter()

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiFetch<ApiResponse>("/api/events", { auth: false })
      setEvents(data.events)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error fetching events:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
    }
    if (venueFromUrl) {
      setSelectedLocation(venueFromUrl)
    }
  }, [categoryFromUrl, venueFromUrl])

  const itemsPerPage = 6

  // Get unique categories
  const categories = useMemo(() => {
    const categoryMap = new Map()
    events.forEach((event) => {
      if (event.categories && Array.isArray(event.categories)) {
        event.categories.forEach((cat) => {
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
        })
      }
    })
    return Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count }))
  }, [events])

  const locations = useMemo(() => {
    const locationMap = new Map()
    events.forEach((event) => {
      if (event.venue?.venueCity) {
        const city = event.venue.venueCity
        locationMap.set(city, (locationMap.get(city) || 0) + 1)
      }
      if (event.venue?.venueCountry) {
        const country = event.venue.venueCountry
        locationMap.set(country, (locationMap.get(country) || 0) + 1)
      }
    })
    return Array.from(locationMap.entries()).map(([name, count]) => ({ name, count }))
  }, [events])

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = events

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.categories.some((cat) => cat.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((event) => event.categories.some((cat) => selectedCategories.includes(cat)))
    } else if (selectedCategory) {
      filtered = filtered.filter((event) =>
        event.categories.some((cat) => cat.toLowerCase().includes(selectedCategory.toLowerCase()))
      )
    }

    // Location filter
    if (selectedLocation) {
      filtered = filtered.filter(
        (event) =>
          event.venue?.venueCity?.toLowerCase().includes(selectedLocation.toLowerCase()) ||
          event.venue?.venueCountry?.toLowerCase().includes(selectedLocation.toLowerCase())
      )
    }

    return filtered
  }, [events, searchQuery, selectedCategories, selectedCategory, selectedLocation])

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage)
  const paginatedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName) ? prev.filter((c) => c !== categoryName) : [...prev, categoryName]
    )
    setCurrentPage(1)
  }

  const handleBusinessTypeToggle = (type: string) => {
    setSelectedBusinessTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedCategory("")
    setSelectedCategories([])
    setSelectedBusinessTypes([])
    setSelectedLocation("")
    setSelectedFormat("All")
    setSelectedDateRange("")
    setActiveTab("All Events")
    setCurrentPage(1)
    router.push("/event")
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchQuery, selectedCategory, selectedCategories, selectedBusinessTypes, selectedLocation, selectedFormat, selectedDateRange])

  const isEventPostponed = (eventId: string) => false
  const getOriginalEventDates = (eventId: string) => ({ startDate: null, endDate: null })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading events...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <Button onClick={fetchEvents} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white w-full overflow-x-hidden">
      {/* Top Navigation Bar - Full Width - Force full width */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => setActiveMainTab("events")}
              className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeMainTab === "events"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveMainTab("companies")}
              className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeMainTab === "companies"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              Companies
            </button>
            <button
              onClick={() => setActiveMainTab("people")}
              className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeMainTab === "people"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              People
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Full width with negative margins to override parent constraints */}
      <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
          {/* Who's in Town Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-900">Who's in Town?</h2>
              <Link href="/whos-in-town" className="text-blue-600 text-sm hover:underline">
                Explore →
              </Link>
            </div>
            <p className="text-gray-600 text-sm">Network with professionals & companies visiting your town.</p>
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-10">
            {/* Left Sidebar */}
            <div className={`lg:w-[300px] xl:w-[340px] 2xl:w-[380px] ${showMobileFilters ? "block" : "hidden lg:block"} space-y-4 flex-shrink-0`}>
              <Card className="border border-gray-200 rounded-lg">
                <CardContent className="p-5">
                  {/* Calendar Section */}
                  <div className="border-b border-gray-100 pb-4 mb-4">
                    <button
                      onClick={() => setCalendarOpen(!calendarOpen)}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <span className="text-gray-700 font-medium">Calendar</span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${calendarOpen ? "rotate-180" : ""}`} />
                    </button>
                    {calendarOpen && (
                      <div className="mt-3">
                        <select
                          className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm"
                          value={selectedDateRange}
                          onChange={(e) => setSelectedDateRange(e.target.value)}
                        >
                          <option value="">Select Date</option>
                          <option value="today">Today</option>
                          <option value="tomorrow">Tomorrow</option>
                          <option value="this-week">This Week</option>
                          <option value="this-month">This Month</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Format Section */}
                  <div className="border-b border-gray-100 pb-4 mb-4">
                    <button
                      onClick={() => setFormatOpen(!formatOpen)}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <span className="text-gray-700 font-medium">Format</span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${formatOpen ? "rotate-180" : ""}`} />
                    </button>
                    {formatOpen && (
                      <div className="mt-3 space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Business Events</h4>
                          <div className="space-y-2 pl-2">
                            {["All", "Trade Shows", "Conferences", "Workshops"].map((type) => (
                              <div key={type} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name="business-type"
                                  checked={selectedFormat === type}
                                  onChange={() => setSelectedFormat(type)}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">{type}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Social Events</h4>
                          <div className="space-y-2 pl-2">
                            {["All", "Networking", "Parties", "Meetups"].map((type) => (
                              <div key={type} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name="social-type"
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">{type}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Location Section */}
                  <div>
                    <button
                      onClick={() => setLocationOpen(!locationOpen)}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <span className="text-gray-700 font-medium">Location</span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${locationOpen ? "rotate-180" : ""}`} />
                    </button>
                    {locationOpen && (
                      <div className="mt-3">
                        <Input
                          placeholder="Search locations..."
                          value={selectedLocation}
                          onChange={(e) => setSelectedLocation(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Premium Ad */}
              <Card className="border border-gray-200 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                <CardContent className="p-5 text-center">
                  <h3 className="text-lg font-bold text-purple-900 mb-2">Premium</h3>
                  <p className="text-sm text-purple-700 mb-3">Get access to exclusive events</p>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full">
                    Upgrade Now
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Header Stats */}
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">1 Million+ Followers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">{events.length} Events</span>
                  </div>
                  <div className="flex items-center -space-x-1">
                    {[1, 2, 3].map((i) => (
                      <Avatar key={i} className="w-6 h-6 border-2 border-white">
                        <AvatarFallback className="bg-purple-500 text-white text-xs">U</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm">Follow</Button>
                  <Button variant="outline" className="px-4 py-2 text-sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Search and View Toggle */}
              <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode("Trending")}
                    className={`flex items-center px-3 py-1 text-sm rounded-md ${viewMode === "Trending" ? "bg-orange-100 text-orange-600" : "text-gray-600 hover:text-gray-800"
                      }`}
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Trending 🔥
                  </button>
                  <button
                    onClick={() => setViewMode("Date")}
                    className={`flex items-center px-3 py-1 text-sm rounded-md ${viewMode === "Date" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:text-gray-800"
                      }`}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Date
                  </button>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategories.length > 0 || selectedLocation || searchQuery || selectedFormat !== "All") && (
                <div className="mb-4 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500">Active filters:</span>
                  {selectedCategories.map((cat) => (
                    <Badge key={cat} variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                      {cat}
                      <button onClick={() => handleCategoryToggle(cat)} className="ml-1">×</button>
                    </Badge>
                  ))}
                  {selectedLocation && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                      {selectedLocation}
                      <button onClick={() => setSelectedLocation("")} className="ml-1">×</button>
                    </Badge>
                  )}
                  {selectedFormat !== "All" && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      {selectedFormat}
                      <button onClick={() => setSelectedFormat("All")} className="ml-1">×</button>
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-xs">
                      "{searchQuery}"
                      <button onClick={() => setSearchQuery("")} className="ml-1">×</button>
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
                    Clear all
                  </Button>
                </div>
              )}

              {/* Coming up in Guangzhou Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Coming up in Guangzhou</h3>
                  <span className="text-sm text-gray-500">2176 following</span>
                </div>
                <Card className="border border-gray-200 rounded-lg overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative h-56">
                      <Image
                        src={events[0]?.images[0]?.url || "/api/placeholder/800/224"}
                        alt="China International Building Decoration Fair"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h4 className="text-white font-semibold text-lg">China International Building Decoration Fair</h4>
                        <div className="flex gap-2 mt-2">
                          <Badge className="bg-white/20 text-white">Building & Construction</Badge>
                          <Badge className="bg-white/20 text-white">Home & Office</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Events List */}
              <div className="space-y-4">
                {paginatedEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No events found matching your criteria</p>
                    <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                ) : (
                  paginatedEvents.map((event) => (
                    <Link href={eventPublicPath(event)} key={event.id} className="block">
                      <Card className="hover:shadow-md transition-shadow rounded-lg border border-gray-200">
                        <CardContent className="p-5">
                          <div className="flex gap-5">
                            <div className="relative w-36 h-36 flex-shrink-0">
                              <Image
                                src={event.images[0]?.url || "/api/placeholder/144/144"}
                                alt={event.title}
                                fill
                                className="rounded-lg object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="text-sm text-gray-500 mb-1">
                                    {formatDate(event.startDate)}
                                  </div>
                                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h3>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {event.venue?.venueCity || event.location.city}, {event.venue?.venueCountry || event.location.country || "Saudi Arabia"}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Heart className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Bookmark className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description || "Be Part of Saudi Food Expo"}</p>
                              <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-2">
                                  {event.categories.slice(0, 2).map((category, idx) => (
                                    <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-700">
                                      {category}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex items-center gap-4">
                                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                    Interested
                                  </Button>
                                  <span className="text-sm text-gray-600">{event._count?.registrations || 8757} interested</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-md text-sm ${currentPage === page ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                          }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className={`lg:w-[300px] xl:w-[340px] 2xl:w-[380px] space-y-4 flex-shrink-0`}>
              {/* Small Event Cards */}
              {events.slice(0, 3).map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow border border-gray-200 rounded-lg">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={event.images[0]?.url || "/api/placeholder/80/80"}
                          alt={event.title}
                          fill
                          className="rounded-md object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">{formatDate(event.startDate)}</p>
                        <h4 className="font-medium text-sm text-gray-900 truncate">{event.title}</h4>
                        <p className="text-xs text-gray-600 truncate">{event.venue?.venueCity || event.location.city}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center text-xs text-gray-500">
                            <Users className="w-3 h-3 mr-1" />
                            <span>{event._count?.registrations || 1253} Members</span>
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Heart className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* CRAFTED Ad */}
              <Card className="border border-gray-200 rounded-lg bg-gray-50">
                <CardContent className="p-5 text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">CRAFTED</h3>
                  <p className="text-sm text-gray-600">Premium Events Platform</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}