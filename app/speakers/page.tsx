"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronDown, Heart, User, Star, MapPin, Calendar, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { getPublicProfilePath } from "@/lib/profile-path"

interface Speaker {
  id: string
  publicSlug?: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar: string | null
  bio: string | null
  company: string | null
  jobTitle: string | null
  location: string | null
  website: string | null
  linkedin: string | null
  twitter: string | null
  specialties: string[]
  achievements: string[]
  certifications: string[]
  speakingExperience: string | null
  isVerified: boolean
  totalEvents: number
  activeEvents: number
  totalAttendees: number
  totalRevenue: number
  averageRating: number
  totalReviews: number
  createdAt: string
  updatedAt: string
  upcomingEventsCount?: number
  pastEventsCount?: number
}

interface ApiResponse {
  success: boolean
  speakers: Speaker[]
  filters: {
    expertise: string[]
  }
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface SpeakerEventsResponse {
  success: boolean
  upcoming: any[]
  past: any[]
}

export default function SpeakersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedExpertise, setSelectedExpertise] = useState("")
  const [sortBy, setSortBy] = useState("events")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [availableExpertise, setAvailableExpertise] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchSpeakers() {
      try {
        setLoading(true)

        // Build query parameters
        const params = new URLSearchParams()
        if (searchQuery) params.append('search', searchQuery)
        if (selectedExpertise) params.append('expertise', selectedExpertise)

        const data = await apiFetch<ApiResponse>(`/api/speakers?${params.toString()}`, {
          auth: false,
        })

        if (data.success) {
          // Extract expertise from speakers' specialties
          const allExpertise = data.speakers.flatMap(speaker => speaker.specialties || [])
          const uniqueExpertise = [...new Set(allExpertise)].filter(Boolean)

          // Fetch events count for each speaker
          const speakersWithEventsCount = await Promise.all(
            data.speakers.map(async (speaker) => {
              try {
                // Fetch events for each speaker to get counts
                const eventsData = await apiFetch<SpeakerEventsResponse>(
                  `/api/speakers/${speaker.id}/events`,
                  { auth: false },
                )
                if (eventsData.success) {
                  const upcomingCount = eventsData.upcoming?.length || 0
                  const pastCount = eventsData.past?.length || 0
                  const totalEventsCount = upcomingCount + pastCount

                  return {
                    ...speaker,
                    upcomingEventsCount: upcomingCount,
                    pastEventsCount: pastCount,
                    // Use calculated total if not provided by API, otherwise use API value
                    totalEvents: speaker.totalEvents || totalEventsCount,
                  }
                }
                // Return speaker with zero counts if API fails
                return {
                  ...speaker,
                  upcomingEventsCount: 0,
                  pastEventsCount: 0,
                  totalEvents: speaker.totalEvents || 0
                }
              } catch (error) {
                console.error(`Error fetching events for speaker ${speaker.id}:`, error)
                return {
                  ...speaker,
                  upcomingEventsCount: 0,
                  pastEventsCount: 0,
                  totalEvents: speaker.totalEvents || 0
                }
              }
            })
          )

          setSpeakers(speakersWithEventsCount)
          setAvailableExpertise(uniqueExpertise) // Use derived expertise instead of data.filters.expertise
        } else {
          throw new Error('Failed to load speakers')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching speakers:', err)
      } finally {
        setLoading(false)
      }
    }

    // Debounce the search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchSpeakers()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, selectedExpertise])
  const toggleFavorite = (speakerId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(speakerId)) {
      newFavorites.delete(speakerId)
    } else {
      newFavorites.add(speakerId)
    }
    setFavorites(newFavorites)
  }

  // Filter and sort speakers
  const filteredSpeakers = useMemo(() => {
    let filtered = [...speakers]

    // Sort speakers based on selected criteria
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.averageRating || 0) - (a.averageRating || 0)
        case "reviews":
          return (b.totalReviews || 0) - (a.totalReviews || 0)
        case "upcoming":
          return (b.upcomingEventsCount || 0) - (a.upcomingEventsCount || 0)
        case "past":
          return (b.pastEventsCount || 0) - (a.pastEventsCount || 0)
        case "events":
        default:
          return (b.totalEvents || 0) - (a.totalEvents || 0)
      }
    })

    return filtered
  }, [speakers, sortBy])

  const handleSpeakerClick = (speaker: Speaker) => {
    router.push(
      getPublicProfilePath("speaker", {
        id: speaker.id,
        publicSlug: speaker.publicSlug,
        firstName: speaker.firstName,
        lastName: speaker.lastName,
      }),
    )
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  // Calculate total events for a speaker
  const getTotalEvents = (speaker: Speaker) => {
    return speaker.totalEvents || (speaker.upcomingEventsCount || 0) + (speaker.pastEventsCount || 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-blue-900 text-xl">Loading speakers...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-xl">Error: {error}</div>
        <Button
          onClick={() => window.location.reload()}
          className="ml-4"
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search speakers by name, expertise, company, or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filters and Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          {/* Stats */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{filteredSpeakers.length}</div>
              <div className="text-sm text-gray-600">Speakers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {filteredSpeakers.reduce((sum, speaker) => sum + getTotalEvents(speaker), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {filteredSpeakers.reduce((sum, speaker) => sum + (speaker.upcomingEventsCount || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Upcoming Events</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Expertise Filter */}
            {/* <div className="relative">
              <select
                value={selectedExpertise}
                onChange={(e) => setSelectedExpertise(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Expertise</option>
                {availableExpertise.map((expertise) => (
                  <option key={expertise} value={expertise}>
                    {expertise}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div> */}

            {/* Sort By */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="events">Sort by Total Events</option>
                <option value="upcoming">Sort by Upcoming Events</option>
                <option value="past">Sort by Past Events</option>
                <option value="rating">Sort by Rating</option>
                <option value="reviews">Sort by Reviews</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        {(selectedExpertise || searchQuery) && (
          <div className="mb-6 flex items-center space-x-2">
            <span className="text-sm text-gray-500">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Search: {searchQuery}
              </Badge>
            )}
            {selectedExpertise && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Expertise: {selectedExpertise}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setSelectedExpertise("")
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Speakers Grid */}
        {filteredSpeakers.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No speakers found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedExpertise("")
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpeakers.map((speaker) => (
              <div
                key={speaker.id}
                className="bg-white rounded-lg border border-gray-200 p-4 flex hover:shadow-md transition-all duration-200 relative cursor-pointer group"
                onClick={() => handleSpeakerClick(speaker)}
              >
                {/* Favorite Button */}
                {/* <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(speaker.id)
                  }}
                  className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full z-10"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favorites.has(speaker.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-400 hover:text-red-500"
                    }`}
                  />
                </button> */}

                {/* Left: Image */}
                <div className="relative w-20 h-20 shrink-0">
                  <Avatar className="w-20 h-20 border-2 border-blue-100">
                    <AvatarImage
                      src={speaker.avatar || ""}
                      alt={`${speaker.firstName} ${speaker.lastName}`}
                    />
                    <AvatarFallback className="text-sm font-semibold bg-blue-100 text-blue-600">
                      {getInitials(speaker.firstName, speaker.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  {speaker.isVerified && (
                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 shadow">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Right: Content */}
                <div className="ml-4 flex flex-col justify-between flex-1">
                  {/* Top Info */}
                  <div>
                    <h3 className="text-sm font-semibold text-blue-600">
                      {speaker.firstName} {speaker.lastName}
                    </h3>
                    <p className="text-xs text-gray-500">{speaker.jobTitle}</p>
                    {speaker.company && (
                      <p className="text-xs text-blue-500">{speaker.company}</p>
                    )}
                    {speaker.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{speaker.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex flex-col gap-2 text-xs text-gray-600 mt-2">
                    <div className="flex items-center justify-between">
                      {/* <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span>{(speaker.averageRating || 0).toFixed(1)}</span>
                        <span>({speaker.totalReviews})</span>
                      </div> */}
                      <div className="font-semibold text-blue-600">
                        {getTotalEvents(speaker)} Total Events
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-green-600">
                        <Calendar className="w-3 h-3" />
                        <span>{speaker.upcomingEventsCount || 0} Upcoming Events</span>
                      </div>
                      <div className="text-gray-500">
                        {speaker.pastEventsCount || 0} Past Events
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(speaker.specialties || []).slice(0, 3).map((skill, index) => (
                      <Badge key={index} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-700">
                        {skill}
                      </Badge>
                    ))}
                    {(speaker.specialties?.length || 0) > 3 && (
                      <Badge className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-700">
                        +{speaker.specialties.length - 3}
                      </Badge>
                    )}

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button - Future Enhancement */}
        {filteredSpeakers.length > 0 && (
          <div className="flex justify-center mt-12">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Showing {filteredSpeakers.length} of {speakers.length} speakers
              </p>
              {/* Future: Add pagination or load more functionality */}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}