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
} from "lucide-react"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import { eventPublicPath } from "@/lib/event-path"

// Loading component for the suspense boundary
function EventsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
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
            <div className="w-80 h-96 bg-gray-200 rounded"></div>
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
  const [activeTab, setActiveTab] = useState("All Events")
  const [selectedFormat, setSelectedFormat] = useState("All Formats")
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
  const [priceRange, setPriceRange] = useState("")
  const [rating, setRating] = useState("")

  // New sidebar state
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [formatOpen, setFormatOpen] = useState(false)
  const [locationOpen, setLocationOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(true)
  const [relatedTopicOpen, setRelatedTopicOpen] = useState(true)
  const [entryFeeOpen, setEntryFeeOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedRelatedTopics, setSelectedRelatedTopics] = useState<string[]>([])

  // Auto-scroll state for featured events
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

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
      setSelectedLocation(venueFromUrl) // Use same location filter for venues
    }
  }, [categoryFromUrl, venueFromUrl])

  const itemsPerPage = 6

  // Get unique categories, locations, and other filter options from data
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
      // Add city
      if (event.venue?.venueCity) {
        const city = event.venue.venueCity
        locationMap.set(city, (locationMap.get(city) || 0) + 1)
      }
      // Add country
      if (event.venue?.venueCountry) {
        const country = event.venue.venueCountry
        locationMap.set(country, (locationMap.get(country) || 0) + 1)
      }
    })
    return Array.from(locationMap.entries()).map(([name, count]) => ({ name, count }))
  }, [events])

  // Enhanced categories with search functionality
  const filteredCategories = useMemo(() => {
    return categories.filter((category) => category.name.toLowerCase().includes(categorySearch.toLowerCase()))
  }, [categories, categorySearch])

  // Create a mapping of categories to their related topics
  const categoryRelatedTopics = useMemo(() => {
    const mapping: Record<string, string[]> = {
      Technology: ["AI & Machine Learning", "Blockchain", "Cloud Computing", "Cybersecurity", "IoT", "Data Science"],
      Healthcare: [
        "Medical Devices",
        "Telemedicine",
        "Pharmaceuticals",
        "Digital Health",
        "Biotechnology",
        "Mental Health",
      ],
      Marketing: [
        "Content Marketing",
        "Social Media",
        "Email Marketing",
        "Influencer Marketing",
        "Brand Strategy",
        "Analytics",
      ],
      "Business Event": ["Entrepreneurship", "Leadership", "Finance", "Strategy", "Operations", "HR Management"],
      Conference: [
        "Networking",
        "Keynote Speakers",
        "Panel Discussions",
        "Workshops",
        "Industry Insights",
        "Professional Development",
      ],
      Expo: [
        "Product Launches",
        "Trade Shows",
        "B2B Networking",
        "Industry Trends",
        "Innovation Showcase",
        "Market Research",
      ],
      Workshop: [
        "Hands-on Training",
        "Skill Development",
        "Certification",
        "Interactive Learning",
        "Best Practices",
        "Tools & Techniques",
      ],
      Startup: [
        "Funding",
        "Pitch Competitions",
        "Accelerators",
        "Venture Capital",
        "Product Development",
        "Market Validation",
      ],
      Environment: [
        "Climate Change",
        "Renewable Energy",
        "Sustainability",
        "Green Technology",
        "Conservation",
        "Environmental Policy",
      ],
      Education: [
        "E-learning",
        "EdTech",
        "Curriculum Development",
        "Student Engagement",
        "Online Education",
        "Educational Research",
      ],
    }
    return mapping
  }, [])

  // Get related topics based on selected categories
  const relatedTopics = useMemo(() => {
    const activeCategories =
      selectedCategories.length > 0 ? selectedCategories : categoryFromUrl ? [categoryFromUrl] : []

    if (activeCategories.length === 0) {
      // If no categories selected, show general related topics
      return [
        { name: "Networking", count: 150 },
        { name: "Professional Development", count: 120 },
        { name: "Industry Insights", count: 100 },
        { name: "Innovation", count: 90 },
        { name: "Best Practices", count: 80 },
        { name: "Market Trends", count: 75 },
      ]
    }

    // Get related topics for selected categories
    const relatedSet = new Set<string>()
    activeCategories.forEach((category) => {
      const related = categoryRelatedTopics[category] || []
      related.forEach((topic) => relatedSet.add(topic))
    })

    // Convert to array with mock counts
    return Array.from(relatedSet)
      .map((topic) => ({
        name: topic,
        count: Math.floor(Math.random() * 100) + 50, // Mock count between 50-150
      }))
      .sort((a, b) => b.count - a.count) // Sort by count descending
  }, [selectedCategories, categoryFromUrl, categoryRelatedTopics])

  // Helper function to check if event is in date range
  const isEventInDateRange = (event: any, dateRange: string) => {
    const eventDate = new Date(event.startDate)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())

    switch (dateRange) {
      case "today":
        return eventDate >= today && eventDate < tomorrow
      case "tomorrow":
        return eventDate >= tomorrow && eventDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
      case "this-week":
        return eventDate >= today && eventDate <= weekFromNow
      case "this-month":
        return eventDate >= today && eventDate <= monthFromNow
      case "next-month":
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
        const monthAfter = new Date(today.getFullYear(), today.getMonth() + 2, 1)
        return eventDate >= nextMonth && eventDate < monthAfter
      default:
        return true
    }
  }

  // Helper function to check if event matches tab filter
  const isEventInTab = (event: any, tab: string) => {
    const eventDate = new Date(event.startDate)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())

    switch (tab) {
      case "All Events":
        return true
      case "Upcoming":
        return eventDate >= today && event.status === "upcoming"
      case "This Week":
        return eventDate >= today && eventDate <= weekFromNow
      case "This Month":
        return eventDate >= today && eventDate <= monthFromNow
      default:
        return true
    }
  }

  // Filter events based on selected criteria
  const filteredEvents = useMemo(() => {
    let filtered = events

    // Tab filter
    filtered = filtered.filter((event) => {
      const now = new Date()
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)

      switch (activeTab) {
        case "Upcoming":
          return eventStart > now
        case "Past":
          return eventEnd < now
        case "This Week":
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          return eventStart >= now && eventStart <= weekFromNow
        case "This Month":
          const monthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
          return eventStart >= now && eventStart <= monthFromNow
        default:
          return true
      }
    })

    // Search filter - enhanced
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          event.categories.some((cat) => cat.toLowerCase().includes(query)) ||
          event.venue?.venueCity?.toLowerCase().includes(query) ||
          event.venue?.venueCountry?.toLowerCase().includes(query),
      )
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((event) => event.categories.some((cat) => selectedCategories.includes(cat)))
    } else if (selectedCategory) {
      filtered = filtered.filter((event) =>
        event.categories.some((cat) => cat.toLowerCase().includes(selectedCategory.toLowerCase())),
      )
    }

    // Location filter
    if (selectedLocation) {
      filtered = filtered.filter(
        (event) =>
          event.venue?.venueCity?.toLowerCase().includes(selectedLocation.toLowerCase()) ||
          event.venue?.venueCountry?.toLowerCase().includes(selectedLocation.toLowerCase()),
      )
    }

    return filtered
  }, [events, activeTab, searchQuery, selectedCategories, selectedCategory, selectedLocation])

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage)
  const paginatedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Featured events (events with featured flag)
  const featuredEvents = events.filter((event) => event.tags.includes("featured"))

  // Auto-scroll effect for featured events
  useEffect(() => {
    if (featuredEvents.length === 0 || isHovered || isTransitioning) return

    const totalSlides = Math.ceil(featuredEvents.length / 3)
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setCurrentSlide((prev) => (prev + 1) % totalSlides)
    }, 3000) // Change slide every 3 seconds

    return () => clearInterval(interval)
  }, [featuredEvents.length, isHovered, isTransitioning])

  // Handle transition end
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false)
      }, 500) // Match the CSS transition duration
      return () => clearTimeout(timer)
    }
  }, [isTransitioning])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const tabs = ["All Events", "Upcoming", "This Week", "This Month"]

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName) ? prev.filter((c) => c !== categoryName) : [...prev, categoryName],
    )
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const handleRelatedTopicToggle = (topicName: string) => {
    setSelectedRelatedTopics((prev) =>
      prev.includes(topicName) ? prev.filter((t) => t !== topicName) : [...prev, topicName],
    )
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedCategory("")
    setSelectedCategories([])
    setSelectedRelatedTopics([])
    setSelectedLocation("")
    setPriceRange("")
    setRating("")
    setSelectedFormat("All Formats")
    setSelectedDateRange("")
    setActiveTab("All Events")
    setCurrentPage(1)

    // Navigate to clean /event URL
    router.push("/event")
  }

  // Navigation functions for featured events
  const goToPrevSlide = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    const totalSlides = Math.ceil(featuredEvents.length / 3)
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const goToNextSlide = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    const totalSlides = Math.ceil(featuredEvents.length / 3)
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return
    setIsTransitioning(true)
    setCurrentSlide(index)
  }

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [
    activeTab,
    searchQuery,
    selectedCategory,
    selectedCategories,
    selectedRelatedTopics,
    selectedLocation,
    selectedFormat,
    selectedDateRange,
    priceRange,
    rating,
  ])

  // Mock functions for postponed events and original dates
  const isEventPostponed = (eventId: string) => {
    // Replace with actual logic to check if event is postponed
    return false
  }

  const getOriginalEventDates = (eventId: string) => {
    // Replace with actual logic to fetch original event dates
    return {
      startDate: null,
      endDate: null,
    }
  }

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
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {categoryFromUrl
                ? `${categoryFromUrl} Events`
                : selectedCategories.length > 0
                  ? `${selectedCategories.join(", ")} Events`
                  : selectedLocation
                    ? `Events in ${selectedLocation}`
                    : activeTab === "All Events"
                      ? "All Events"
                      : activeTab}
            </h1>
            <p className="text-gray-600">
              {categoryFromUrl
                ? `Discover amazing ${categoryFromUrl.toLowerCase()} events happening around you`
                : selectedCategories.length > 0
                  ? `Discover amazing ${selectedCategories.join(", ").toLowerCase()} events happening around you`
                  : selectedLocation
                    ? `Discover amazing events happening in ${selectedLocation}`
                    : "Discover amazing events happening around you"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-1">
                {[1, 2, 3].map((i) => (
                  <Avatar key={i} className="w-6 h-6 border-2 border-white">
                    <AvatarFallback className="bg-purple-500 text-white text-xs">U</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {/* {allEvents.reduce((sum, event) => sum + event.followers, 0)} Followers */}
              </span>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2">Follow</Button>
            <Button variant="outline" className="px-4 py-2 bg-transparent">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(categoryFromUrl ||
          searchParams.get("location") ||
          searchParams.get("country") ||
          searchParams.get("venue") ||
          selectedCategories.length > 0 ||
          selectedRelatedTopics.length > 0 ||
          selectedLocation ||
          selectedFormat !== "All Formats" ||
          selectedDateRange ||
          priceRange ||
          rating ||
          searchQuery) && (
          <div className="mb-4 flex items-center space-x-2 flex-wrap">
            <span className="text-sm text-gray-500">Active filters:</span>
            <div className="flex items-center space-x-2 flex-wrap">
              {categoryFromUrl && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Category: {categoryFromUrl}
                </Badge>
              )}
              {selectedCategories.map((cat) => (
                <Badge key={cat} variant="secondary" className="bg-green-100 text-green-800">
                  {cat}
                  <button
                    onClick={() => handleCategoryToggle(cat)}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {selectedRelatedTopics.map((topic) => (
                <Badge key={topic} variant="secondary" className="bg-purple-100 text-purple-800">
                  Related: {topic}
                  <button
                    onClick={() => handleRelatedTopicToggle(topic)}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {selectedLocation && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Location: {selectedLocation}
                  <button
                    onClick={() => setSelectedLocation("")}
                    className="ml-1 text-orange-600 hover:text-orange-800"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedFormat !== "All Formats" && (
                <Badge variant="secondary" className="bg-pink-100 text-pink-800">
                  Format: {selectedFormat}
                  <button
                    onClick={() => setSelectedFormat("All Formats")}
                    className="ml-1 text-pink-600 hover:text-pink-800"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedDateRange && (
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                  Date: {selectedDateRange}
                  <button
                    onClick={() => setSelectedDateRange("")}
                    className="ml-1 text-indigo-600 hover:text-indigo-800"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {priceRange && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Price: {priceRange}
                  <button onClick={() => setPriceRange("")} className="ml-1 text-yellow-600 hover:text-yellow-800">
                    ×
                  </button>
                </Badge>
              )}
              {rating && (
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  Rating: {rating}+
                  <button onClick={() => setRating("")} className="ml-1 text-red-600 hover:text-red-800">
                    ×
                  </button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="ml-1 text-gray-600 hover:text-gray-800">
                    ×
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear all filters
              </Button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Left Sidebar - Enhanced Design */}
          <div className="w-80 sticky top-6 self-start">
            <Card className="border border-gray-200 rounded-sm">
              <CardContent className="p-0">
                {/* Calendar Section */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setCalendarOpen(!calendarOpen)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                  >
                    <span className="text-gray-700 font-medium">Calendar</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${calendarOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {calendarOpen && (
                    <div className="px-4 pb-4">
                      <select
                        className="w-full p-2 border border-gray-300 rounded-sm bg-white text-sm"
                        value={selectedDateRange}
                        onChange={(e) => setSelectedDateRange(e.target.value)}
                      >
                        <option value="">Select Date</option>
                        <option value="today">Today</option>
                        <option value="tomorrow">Tomorrow</option>
                        <option value="this-week">This Week</option>
                        <option value="this-month">This Month</option>
                        <option value="next-month">Next Month</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Format Section */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setFormatOpen(!formatOpen)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                  >
                    <span className="text-gray-700 font-medium">Format</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${formatOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {formatOpen && (
                    <div className="px-4 pb-4">
                      <select
                        className="w-full p-2 border border-gray-300 rounded-sm bg-white text-sm"
                        value={selectedFormat}
                        onChange={(e) => setSelectedFormat(e.target.value)}
                      >
                        <option value="All Formats">Trade Shows, Conferences...</option>
                        <option value="Conference">Conference</option>
                        <option value="Trade Show">Trade Show</option>
                        <option value="Expo">Expo</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Festival">Festival</option>
                        <option value="Seminar">Seminar</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Location Section */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setLocationOpen(!locationOpen)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                  >
                    <span className="text-gray-700 font-medium">Location</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${locationOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {locationOpen && (
                    <div className="px-4 pb-4">
                      <select
                        className="w-full p-2 border border-gray-300 rounded-sm bg-white text-sm"
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                      >
                        <option value="">All Locations</option>
                        {locations.map((location) => (
                          <option key={location.name} value={location.name}>
                            {location.name} ({location.count})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Category Section */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setCategoryOpen(!categoryOpen)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                  >
                    <span className="text-gray-700 font-medium">Category</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${categoryOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {categoryOpen && (
                    <div className="px-4 pb-4">
                      {/* Search for Topics */}
                      <div className="relative mb-3">
                        <Input
                          type="text"
                          placeholder="Search for Topics"
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="text-sm pr-8"
                        />
                        <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      </div>
                      {/* Category List */}
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {filteredCategories.slice(0, 8).map((category, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={selectedCategories.includes(category.name)}
                                onChange={() => handleCategoryToggle(category.name)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">{category.name}</span>
                            </div>
                            <span className="text-xs text-gray-500">{(category.count / 1000).toFixed(1)}k</span>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3 text-xs bg-transparent"
                        onClick={() => setCategoryOpen(false)}
                      >
                        View All
                      </Button>
                    </div>
                  )}
                </div>

                {/* Related Topic Section */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setRelatedTopicOpen(!relatedTopicOpen)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                  >
                    <span className="text-gray-700 font-medium">Related Topic</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${relatedTopicOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {relatedTopicOpen && (
                    <div className="px-4 pb-4">
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {relatedTopics.slice(0, 8).map((topic, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={selectedRelatedTopics.includes(topic.name)}
                                onChange={() => handleRelatedTopicToggle(topic.name)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">{topic.name}</span>
                            </div>
                            <span className="text-xs text-gray-500">{(topic.count / 1000).toFixed(1)}k</span>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3 text-xs bg-transparent"
                        onClick={() => setRelatedTopicOpen(false)}
                      >
                        View All
                      </Button>
                    </div>
                  )}
                </div>

                {/* Entry Fee Section */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setEntryFeeOpen(!entryFeeOpen)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                  >
                    <span className="text-gray-700 font-medium">Entry Fee</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${entryFeeOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {entryFeeOpen && (
                    <div className="px-4 pb-4 space-y-3">
                      {[
                        { value: "", label: "All Prices" },
                        { value: "free", label: "Free" },
                        { value: "under-1000", label: "Under ₹1,000" },
                        { value: "1000-5000", label: "₹1,000 - ₹5,000" },
                        { value: "above-5000", label: "Above ₹5,000" },
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="price"
                            checked={priceRange === option.value}
                            onChange={() => setPriceRange(option.value)}
                            className="w-4 h-4 text-blue-600 border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Navigation Sections */}
                
                
                <Link href="/event?filter=company" className="block border-b border-gray-200 hover:bg-gray-50">
                  <div className="p-4">
                    <h3 className="text-red-500 font-medium mb-1">Search by Company</h3>
                    <p className="text-sm text-gray-500">Discover and track top events</p>
                  </div>
                </Link>
                <Link href="/speakers" className="block border-b border-gray-200 hover:bg-gray-50">
                  <div className="p-4">
                    <h3 className="text-red-500 font-medium mb-1">Explore Speaker</h3>
                    <p className="text-sm text-gray-500">Discover and track top events</p>
                  </div>
                </Link>
                <button
                  onClick={clearAllFilters}
                  className="w-full text-left border-b border-gray-200 hover:bg-gray-50"
                >
                  <div className="p-4">
                    <h3 className="text-red-500 font-medium mb-1">Filter</h3>
                    <p className="text-sm text-gray-500">Discover and track top events</p>
                  </div>
                </button>
                <Link href="/events" className="block hover:bg-gray-50">
                  <div className="p-4">
                    <h3 className="text-blue-600 font-medium">All Events</h3>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            {/* View Toggle and Results Count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Showing {paginatedEvents.length} of {filteredEvents.length} events
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode("Trending")}
                    className={`px-3 py-1 text-sm rounded ${
                      viewMode === "Trending" ? "bg-orange-100 text-orange-600" : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Trending 🔥
                  </button>
                  <button
                    onClick={() => setViewMode("Date")}
                    className={`px-3 py-1 text-sm rounded ${
                      viewMode === "Date" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Date
                  </button>
                </div>
              </div>
              {/* Pagination */}
              <div className="flex items-center space-x-2">
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
                      className={`w-8 h-8 rounded text-sm ${
                        currentPage === page ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
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
            </div>

            {/* Event Listings */}
            <div className="space-y-4">
              {paginatedEvents.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No events found matching your criteria</p>
                  <Button variant="outline" className="mt-4 bg-transparent" onClick={clearAllFilters}>
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                paginatedEvents.map((event) => {
                  const isPostponed = isEventPostponed(event.id)
                  const originalDates = getOriginalEventDates(event.id)
                  return (
                    <Link href={eventPublicPath(event)} key={event.id} className="block">
                      <Card key={event.id} className="hover:shadow-md transition-shadow rounded-sm">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="relative">
                              <Image
                                src={event.images[0]?.url || "/city/c4.jpg"}
                                alt={event.title}
                                width={176}
                                height={112}
                                className="w-48 h-full rounded-sm"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h3>
                                  <div className="flex items-center text-sm text-gray-600 mb-1">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {isPostponed && originalDates.startDate && originalDates.endDate ? (
                                      <span className="text-gray-400 line-through">
                                        {formatDate(originalDates.startDate)} - {formatDate(originalDates.endDate)}
                                      </span>
                                    ) : (
                                      <span className={isPostponed ? "text-gray-400" : ""}>
                                        {formatDate(event.startDate)} - {formatDate(event.endDate)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {event.location.city}, {event.location.venue}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Heart className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Share2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2 mt-5">{event.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {event.categories.slice(0, 2).map((category, idx) => (
                                <Badge key={idx} variant="secondary">
                                  {category}
                                </Badge>
                              ))}
                              <div className="flex items-center text-sm text-gray-600"></div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                  {event.rating.average}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-blue-600"></span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })
              )}
            </div>

            {/* Auto-Scrolling Featured Events */}
            {featuredEvents.length > 0 && (
              <section className="w-auto max-w-xl py-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-black underline">Featured Events</h2>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPrevSlide}
                      className="p-2 bg-transparent"
                      disabled={isTransitioning}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextSlide}
                      className="p-2 bg-transparent"
                      disabled={isTransitioning}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div
                  className="relative overflow-hidden"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  {/* Carousel Container */}
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                      transform: `translateX(-${currentSlide * 100}%)`,
                    }}
                  >
                    {/* Group events into sets of 3 */}
                    {Array.from({ length: Math.ceil(featuredEvents.length / 3) }, (_, slideIndex) => (
                      <div key={slideIndex} className="w-full flex-shrink-0 flex gap-6">
                        {featuredEvents.slice(slideIndex * 3, (slideIndex + 1) * 3).map((event, index) => {
                          const isPostponed = isEventPostponed(event.id)
                          const originalDates = getOriginalEventDates(event.id)
                          return (
                            <div key={event.id} className="flex-1 min-w-0">
                              <Link href={eventPublicPath(event)} className="block h-full">
                                <div className="relative bg-white rounded-sm shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full">
                                  <div className="relative h-48 w-full">
                                    <Image
                                      src={event.images[0]?.url || "/city/c4.jpg"}
                                      alt={event.title}
                                      fill
                                      className="object-cover"
                                    />
                                    <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
                                      <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                                    </div>
                                    <div className="absolute bottom-2 left-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                                      Featured ✨
                                    </div>
                                  </div>
                                  <div className="p-4">
                                    <h3 className="font-semibold text-base text-gray-800 mb-2 line-clamp-2 leading-tight">
                                      {event.title}
                                    </h3>
                                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                                    <div className="space-y-2 mb-3">
                                      <div className="flex items-center text-xs text-gray-600">
                                        <MapPin className="w-3 h-3 mr-1 text-blue-500" />
                                        <span className="font-medium truncate">{event.location.city}</span>
                                      </div>
                                      <div className="flex items-center text-xs">
                                        <Calendar className="w-3 h-3 mr-1 text-green-500" />
                                        <span
                                          className={`font-medium ${isPostponed ? "text-gray-400 line-through" : "text-blue-600"}`}
                                        >
                                          {isPostponed && originalDates.startDate
                                            ? formatDate(originalDates.startDate)
                                            : formatDate(event.startDate)}
                                        </span>
                                      </div>
                                    </div>
                                    {/* {isPostponed && (
                                      <div className="mb-3">
                                        <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                                          Postponed
                                        </span>
                                      </div>
                                    )} */}
                                    <div className="flex items-center justify-between">
                                      <div className="flex flex-wrap gap-1">
                                        {event.categories.slice(0, 1).map((category, idx) => (
                                          <Badge
                                            key={idx}
                                            variant="secondary"
                                            className="text-xs bg-gray-100 text-gray-700"
                                          >
                                            {category}
                                          </Badge>
                                        ))}
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">
                                          {event.rating.average}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            </div>
                          )
                        })}
                        {/* Fill empty slots if less than 3 cards in the last group */}
                        {featuredEvents.slice(slideIndex * 3, (slideIndex + 1) * 3).length < 3 &&
                          Array.from(
                            { length: 3 - featuredEvents.slice(slideIndex * 3, (slideIndex + 1) * 3).length },
                            (_, emptyIndex) => <div key={`empty-${emptyIndex}`} className="flex-1 min-w-0" />,
                          )}
                      </div>
                    ))}
                  </div>

                  {/* Navigation Dots */}
                  <div className="flex justify-center mt-4 space-x-2">
                    {Array.from({ length: Math.ceil(featuredEvents.length / 3) }, (_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        disabled={isTransitioning}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentSlide ? "bg-blue-600 scale-110" : "bg-gray-300 hover:bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Slide Counter */}
                  <div className="text-center mt-2">
                    <span className="text-xs text-gray-500">
                      {currentSlide + 1} of {Math.ceil(featuredEvents.length / 3)}
                    </span>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-80 space-y-6">
            {/* Large Featured Event */}
            {featuredEvents[0] && (
              <div className="overflow-hidden">
                <div className="relative">
                  <Image
                    src={featuredEvents[0].images[0]?.url || "/city/c4.jpg"}
                    alt={featuredEvents[0].title}
                    width={320}
                    height={240}
                    className="w-full h-85 object-cover rounded-sm"
                  />
                </div>
              </div>
            )}

            {/* Event List */}
            <div className="space-y-4">
              {events.slice(0, 3).map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Image
                        src={event.images[0]?.url || "/city/c4.jpg"}
                        alt={event.title}
                        width={48}
                        height={48}
                        className="w-15 h-15 rounded-4xl"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900 mb-1">{event.title}</h4>
                        <p className="text-xs text-gray-600 mb-1">{new Date(event.startDate).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-600 mb-2">{event.venue?.venueCity}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-1">
                            {event.categories.slice(0, 2).map((category, idx) => (
                              <Button key={idx} size="sm" className="h-6 px-2 text-xs bg-blue-600 hover:bg-blue-700">
                                {category}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="p-1">
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}