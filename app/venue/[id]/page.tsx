"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUserId, isAuthenticated } from "@/lib/api"
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  CheckCircle,
  ArrowLeft,
  Loader2,
  User,
  Building,
  Eye,
} from "lucide-react"
import VenueReviewCard from "./VenueReviewCard"
import { AddVenueReview } from "./AddVenueReview"
import { ShareButton } from "@/components/share-button"
import { apiFetch } from "@/lib/api"
import { eventPublicPath } from "@/lib/event-path"

interface Venue {
  venueName: string
  id: string
  name: string
  description: string
  venueDescription: string
  venueAddress: string
  manager: {
    id: string
    name: string
    email: string
    phone: string
    avatar?: string
    isVerified: boolean
    bio?: string
    website?: string
  }
  location: {
    address: string
    city: string
    state: string
    country: string
    zipCode: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  contact: {
    phone: string
    email: string
    website?: string
  }
  capacity?: {
    total: number
    halls: number
  }
  pricing?: {
    basePrice: number
    currency: string
  }
  stats: {
    averageRating: number
    totalReviews: number
    activeBookings: number
  }
  amenities: string[]
  images: string[]
  venueImages: string[]
  videos?: string[]
  floorPlans?: string[]
  virtualTour?: string
  meetingSpaces?: Array<{
    id: string
    name: string
    capacity: number
    area: number
    hourlyRate: number
    isAvailable: boolean
  }>
  reviews: Array<{
    id: string
    rating: number
    title: string
    comment: string
    author: string
    authorAvatar?: string
    createdAt: string
  }>
  bookings: Array<{
    id: string
    startDate: string
    endDate: string
    status: string
    totalAmount: number
    currency: string
    purpose: string
  }>
  events: Array<{
    id: string
    title: string
    description: string
    startDate: string
    endDate: string
    status: string
    images: string[]
    capacity: {
      max: number
      current: number
    }
    organizer?: {
      name: string
      organization: string
    }
  }>
  organizer?: {
    id: string
    name: string
    organization: string
    email: string
    phone: string
  }
  createdAt: string
  updatedAt: string
}

interface VenueResponse {
  success: boolean
  data: Venue
}

interface ReviewReply {
  id: string
  content: string
  createdAt: string
  isOrganizerReply?: boolean
  user?: { id: string; firstName: string; lastName: string; avatar?: string | null } | null
}
interface Review {
  id: string
  rating: number
  title: string
  comment: string
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
  replies?: ReviewReply[]
}

interface ticketTypes {
  name: string
  price: number
}

interface Event {
  eventType: string
  ticketTypes?: ticketTypes[]
  _id: string
  thumbnailImage: string
  tags: string[]
  price: string
  id: string
  title: string
  description: string
  shortDescription?: string
  startDate: string
  endDate: string
  status: string
  category: string
  images: string[]
  bannerImage?: string
  venueId: string
  organizerId: string
  maxAttendees?: number
  currentAttendees: number
  currency: string
  isVirtual: boolean
  virtualLink?: string
  averageRating: number
  totalReviews: number
  organizer?: {
    name: string
    organization: string
    avatar?: string
  }
}

interface EventsResponse {
  success: boolean
  events: Event[]
}

export default function VenueDetailPage() {
  const params = useParams()
  const router = useRouter()
  const venueId = params.id as string

  const [venue, setVenue] = useState<Venue | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [eventsLoading, setEventsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [schedulingMeeting, setSchedulingMeeting] = useState(false)
  const { toast } = useToast()

  // Show Schedule Meeting for any authenticated user (JWT)
  const showScheduleMeeting = isAuthenticated()

  useEffect(() => {
    if (venueId) {
      fetchVenue()
      fetchReviews()
      fetchEvents()
    }
  }, [venueId])

  const fetchVenue = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/venue-manager/${venueId}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: VenueResponse = await response.json()

      if (data.success && data.data) {
        setVenue(data.data)
        setError(null)
      } else {
        setError("Venue not found")
      }
    } catch (err) {
      setError("Error loading venue details")
      console.error("Error fetching venue:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    if (!venueId) return

    setReviewsLoading(true)
    try {
      const data = await apiFetch<{ success?: boolean; reviews?: Review[] }>(
        `/api/venues/${venueId}/reviews?includeReplies=true`,
        { auth: false }
      )
      const safeReviews = Array.isArray(data?.reviews)
        ? data.reviews.filter((r: any) => r && typeof r.rating === "number" && r.user)
        : []
      setReviews(safeReviews)
    } catch {
      setReviews([])
    } finally {
      setReviewsLoading(false)
    }
  }

  const fetchEvents = async () => {
    if (!venueId) return

    setEventsLoading(true)
    try {
      const data = await apiFetch<EventsResponse>(`/api/venues/${venueId}/events`, {
        auth: false,
      })
      console.log("Fetched events data:", data) // Debug log
      if (data.success) {
        setEvents(data.events || [])
        console.log("Events set:", data.events?.length) // Debug log
      } else {
        setEvents([])
      }
    } catch (error) {
      console.error("Error fetching events:", error)
      setEvents([])
    } finally {
      setEventsLoading(false)
    }
  }

  // Fixed function to determine event status
  const getEventStatus = (event: Event): string => {
    const now = new Date()
    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)

    // Normalize dates to start of day for date comparison
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())

    // Get timestamps for time comparison
    const nowTime = now.getTime()
    const startTime = startDate.getTime()
    const endTime = endDate.getTime()

    console.log('Event:', event.title)
    console.log('Now:', now.toISOString())
    console.log('Start:', startDate.toISOString())
    console.log('End:', endDate.toISOString())

    // Check if it's a multi-day event
    const isMultiDay = startDateOnly.getTime() !== endDateOnly.getTime()

    if (isMultiDay) {
      // For multi-day events, use date-only comparison
      if (nowDate < startDateOnly) {
        console.log('Status: UPCOMING (multi-day)')
        return "UPCOMING"
      } else if (nowDate > endDateOnly) {
        console.log('Status: PAST (multi-day)')
        return "PAST"
      } else {
        console.log('Status: ONGOING (multi-day)')
        return "ONGOING"
      }
    } else {
      // For single-day events, use precise time comparison
      if (nowTime < startTime) {
        console.log('Status: UPCOMING (single-day)')
        return "UPCOMING"
      } else if (nowTime >= startTime && nowTime <= endTime) {
        console.log('Status: ONGOING (single-day)')
        return "ONGOING"
      } else if (nowTime > endTime) {
        console.log('Status: PAST (single-day)')
        return "PAST"
      }
    }

    console.log('Status: UNKNOWN - defaulting to UPCOMING')
    return "UPCOMING"
  }

  // Function to get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "UPCOMING":
        return "default"
      case "ONGOING":
        return "secondary"
      case "PAST":
        return "outline"
      default:
        return "default"
    }
  }

  // Function to get status badge text
  const getStatusBadgeText = (status: string) => {
    switch (status) {
      case "UPCOMING":
        return "Upcoming"
      case "ONGOING":
        return "Ongoing"
      case "PAST":
        return "Past"
      default:
        return status
    }
  }

  // Get events count by status
  const getEventsCountByStatus = () => {
    const counts = {
      total: events.length,
      upcoming: 0,
      ongoing: 0,
      past: 0
    }

    events.forEach(event => {
      const status = getEventStatus(event)
      if (status === "UPCOMING") counts.upcoming++
      else if (status === "ONGOING") counts.ongoing++
      else if (status === "PAST") counts.past++
    })

    return counts
  }

  const handleReviewAdded = (newReview: Review) => {
    if (!newReview || typeof newReview.rating !== "number") {
      console.error("Invalid review data:", newReview)
      toast({
        title: "Error",
        description: "Failed to add review. Please try again.",
        variant: "destructive",
      })
      return
    }

    setReviews((prevReviews) => [newReview, ...prevReviews])

    // Safely update venue stats
    if (venue) {
      setVenue((prev) => {
        if (!prev) return null

        const currentTotalReviews = prev.stats.totalReviews || 0
        const currentAverageRating = prev.stats.averageRating || 0

        return {
          ...prev,
          stats: {
            ...prev.stats,
            totalReviews: currentTotalReviews + 1,
            averageRating: (currentAverageRating * currentTotalReviews + newReview.rating) / (currentTotalReviews + 1),
          },
        }
      })
    }

    toast({
      title: "Success",
      description: "Your review has been added!",
    })
  }

  const handleScheduleMeeting = async () => {
    if (!venue) return

    const userId = getCurrentUserId()
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to schedule meetings.",
        variant: "destructive",
      })
      return
    }

    try {
      setSchedulingMeeting(true)

      const body = {
        venueId: venue.manager.id,
        visitorId: userId,
        title: `Meeting at ${venue.name}`,
        description: `Meeting request with ${venue.manager.name} at ${venue.name}`,
        type: "VENUE_TOUR",
        requestedDate: new Date().toISOString().split("T")[0],
        requestedTime: "09:00",
        duration: 30,
        meetingType: "IN_PERSON",
        purpose: "Venue Inquiry and Tour",
        location: venue.location?.address || venue.venueAddress,
        meetingSpacesInterested: venue.meetingSpaces?.map((space) => space.name) || [],
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
      const res = await fetch(`/api/venue-appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `Failed to create appointment: ${res.status}`)
      }

      toast({
        title: "Success",
        description: `Meeting request sent to ${venue.manager.name}!`,
      })
    } catch (err) {
      console.error("Error scheduling meeting:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to schedule meeting",
        variant: "destructive",
      })
    } finally {
      setSchedulingMeeting(false)
    }
  }

  // Get total events count
  const getTotalEventsCount = () => {
    return events.length
  }

  // Calculate total capacity from meeting spaces
  const getTotalCapacity = () => {
    // First check if venue has direct capacity info
    if (venue?.capacity?.total) return venue.capacity.total

    // Then check meeting spaces array
    if (venue?.meetingSpaces && venue.meetingSpaces.length > 0) {
      return venue.meetingSpaces.reduce((sum, space) => sum + (space.capacity || 0), 0)
    }

    // Fallback to 0
    return 0
  }

  // Get number of halls
  const getHallsCount = () => {
    // First check if venue has direct halls info
    if (venue?.capacity?.halls) return venue.capacity.halls

    // Then count meeting spaces
    if (venue?.meetingSpaces) return venue.meetingSpaces.length

    // Fallback to 0
    return 0
  }

  const nextImage = () => {
    const images = venue?.images || venue?.venueImages || []
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    const images = venue?.images || venue?.venueImages || []
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getCurrentImage = () => {
    const images = venue?.images || venue?.venueImages || []
    if (images.length === 0) {
      return "/logo/Logo-1.png"
    }
    const currentImage = images[currentImageIndex]
    return currentImage || "/logo/Logo-1.png"
  }

  const getEventImage = (event: Event) => {
    return event.images?.[0] || event.bannerImage || "/images/gpex.jpg"
  }

  // Get address for map
  const getMapAddress = () => {
    if (venue?.location?.coordinates?.lat && venue?.location?.coordinates?.lng) {
      return `${venue.location.coordinates.lat},${venue.location.coordinates.lng}`
    }
    return encodeURIComponent(venue?.location?.address || venue?.venueAddress || "")
  }

  // Safely calculate review statistics
  const reviewStats = {
    averageRating:
      reviews.length > 0 ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length : 0,
    totalReviews: reviews.length,
    ratingDistribution: [1, 2, 3, 4, 5].map((stars) => ({
      stars,
      count: reviews.filter((review) => (review.rating || 0) === stars).length,
      percentage:
        reviews.length > 0
          ? (reviews.filter((review) => (review.rating || 0) === stars).length / reviews.length) * 100
          : 0,
    })),
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading venue details...</p>
        </div>
      </div>
    )
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Venue Not Found</h1>
          <p className="text-gray-600 mb-4">{error || "The venue you're looking for doesn't exist."}</p>
          <Button onClick={() => router.push("/venues")}>Back to Venues</Button>
        </div>
      </div>
    )
  }

  const venueImages = venue.images || venue.venueImages || []
  const eventsCount = getEventsCountByStatus()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => router.push("/venues")} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Venues
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        {venueImages.length > 0 ? (
          <Image src={getCurrentImage()} alt={venue.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
            <div className="text-center">
              <Building className="w-24 h-24 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-700 mb-2">{venue.name}</h2>
              <p className="text-gray-600">No images available</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40" />

        {/* Image Navigation */}
        {venueImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </>
        )}

        {/* Venue Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-white">{venue.name || venue.venueName}</h1>
                  {venue.manager.isVerified && (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-white/90 mb-2">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>
                    {venue.location?.address || venue.venueAddress}
                    {venue.location?.city && `, ${venue.location.city}`}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-white/90">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                    <span className="font-medium">{venue.stats.averageRating.toFixed(1)}</span>
                    <span className="ml-1">({venue.stats.totalReviews} reviews)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShareButton
                  id={venueId}
                  title={venue.name || venue.venueName}
                  type="venue"
                />

                {/* Only show Schedule Meeting button for ORGANIZER and VENUE_MANAGER roles */}
                {showScheduleMeeting && (
                  <Button
                    onClick={handleScheduleMeeting}
                    disabled={schedulingMeeting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {schedulingMeeting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Meeting
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Image Indicators */}
        {venueImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {venueImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          {/* Tabs List */}
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="spaces">Halls ({getHallsCount()})</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="events">Events ({getTotalEventsCount()})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          {/* Overview Tab - Redesigned without sidebar */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Suitability Section */}
              <Card>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{getTotalCapacity()}</div>
                      <div className="text-sm text-gray-600">Max Capacity</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{getHallsCount()}</div>
                      <div className="text-sm text-gray-600">Halls</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{getTotalEventsCount()}</div>
                      <div className="text-sm text-gray-600">Events</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{venue.stats.averageRating.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Good Ratings</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* About The Venue Section */}
              <Card>
                <CardHeader>
                  <CardTitle>About The Venue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {venue.description || venue.venueDescription || "No description available for this venue."}
                  </p>
                </CardContent>
              </Card>

              {/* Amenities Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {venue.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contact & Pricing in a grid */}
              <div className="">
                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {venue.contact.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span>{venue.contact.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span>{venue.contact.email}</span>
                    </div>
                    {venue.contact.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-gray-400" />
                        <a href={venue.contact.website} className="text-blue-600 hover:underline">
                          Visit Website
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Events at This Venue */}
              <Card className="">
                <CardHeader>
                  <CardTitle>Events At This Venue</CardTitle>
                  <p className="text-sm text-gray-500">
                    {getTotalEventsCount()} events scheduled at {venue.name || venue.venueName}
                  </p>
                </CardHeader>

                <CardContent>
                  {events.length > 0 ? (
                    <div className="flex flex-wrap gap-6">
                      {events.slice(0, 4).map((event) => {
                        const eventStatus = getEventStatus(event)
                        return (
                          <div
                            key={event.id}
                            className="flex flex-col sm:flex-row w-full sm:w-[48%] border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer hover:border-blue-300"
                            onClick={() => router.push(eventPublicPath(event))}
                          >
                            {/* Event Image */}
                            <div className="sm:w-2/5 relative h-44 sm:h-auto mb-4">
                              <Image
                                src={getEventImage(event)}
                                alt={event.title}
                                fill
                                className="object-cover m-2 rounded-sm"
                              />
                            </div>

                            {/* Event Content */}
                            <div className="sm:w-3/5 p-4 flex flex-col justify-between">
                              {/* Header */}
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <h3
                                    className="font-semibold text-blue-800 text-sm hover:underline cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      router.push(eventPublicPath(event))
                                    }}
                                  >
                                    {event.title}
                                  </h3>
                                  <Badge
                                    variant={getStatusBadgeVariant(eventStatus)}
                                    className="text-xs px-2 py-0.5"
                                  >
                                    {getStatusBadgeText(eventStatus)}
                                  </Badge>
                                </div>

                                <p className="text-xs text-gray-500 mb-2">
                                  {formatDate(event.startDate)} – {formatDate(event.endDate)}
                                </p>

                                <p className="text-sm text-gray-600 line-clamp-3">
                                  {event.shortDescription || event.description}
                                </p>
                              </div>

                              {/* Tags, Rating, and Price */}
                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Category */}
                                  <Badge
                                    variant="outline"
                                    className="text-gray-700 border-gray-300 text-xs bg-gray-50"
                                  >
                                    {event.category}
                                  </Badge>

                                  {/* Tags */}
                                  {event.tags?.slice(0, 2).map((tag, i) => (
                                    <Badge
                                      key={`${event.id}-tag-${i}`}
                                      variant="outline"
                                      className="text-gray-700 border-gray-300 text-xs bg-gray-50"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}

                                  {/* Rating */}
                                  <div className="flex items-center text-xs text-gray-600">
                                    <Star className="w-4 h-4 text-yellow-400 mr-1 fill-yellow-400" />
                                    <span>{event.averageRating?.toFixed(1) || "0.0"}</span>
                                  </div>
                                </div>

                                {/* Price */}
                                <div className="text-blue-700 font-semibold text-sm">
                                  {Array.isArray(event.ticketTypes)
                                    ? event.ticketTypes.map((ticket) => `${ticket.name}: ₹${ticket.price}`).join(" | ")
                                    : "Free Entry"}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No events scheduled at this venue yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Meeting Spaces Tab - Redesigned as Halls */}
          <TabsContent value="spaces" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {venue.meetingSpaces && venue.meetingSpaces.length > 0 ? (
                venue.meetingSpaces.map((space) => (
                  <Card key={space.id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-center">
                        <CardTitle className="text-lg">{space.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Capacity</span>
                          <span className="font-medium">{space.capacity} people</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Area</span>
                          <span className="font-medium">{space.area} sq ft</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No meeting spaces available</h3>
                  <p className="text-gray-600">This venue doesn't have any meeting spaces configured.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="space-y-6">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Map View</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="w-full h-80 bg-gray-200 rounded-md mb-4 overflow-hidden">
                  <iframe
                    src={`https://www.google.com/maps?q=${getMapAddress()}&z=15&output=embed`}
                    width="100%"
                    height="100%"
                    className="border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>

                <CardHeader className="px-0">
                  <CardTitle>Address & Directions</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <p className="text-gray-700">{venue.location?.address || venue.venueAddress}</p>
                  {venue.location?.city && (
                    <p className="text-gray-600">
                      {venue.location.city}
                      {venue.location.state && `, ${venue.location.state}`}
                      {venue.location.zipCode && ` ${venue.location.zipCode}`}
                    </p>
                  )}
                  {venue.location?.country && (
                    <p className="text-gray-600">{venue.location.country}</p>
                  )}
                </CardContent>

                <div className="flex gap-2 mt-5">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const address = getMapAddress()
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${address}`,
                        "_blank",
                      )
                    }}
                  >
                    Get Directions
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const address = getMapAddress()
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${address}`,
                        "_blank",
                      )
                    }}
                  >
                    View in Maps
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab - Fixed white space issue */}
          <TabsContent value="events" className="space-y-6">
            {eventsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading events...</p>
              </div>
            ) : events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden border-2"
                    onClick={() => router.push(eventPublicPath(event))}
                  >
                    {/* Image Section */}
                    <div className="relative h-48 w-full">
                      <Image
                        src={getEventImage(event)}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge
                          variant={
                            event.status === "PUBLISHED"
                              ? "default"
                              : event.status === "DRAFT"
                                ? "secondary"
                                : "destructive"
                          }
                          className="bg-black/70 text-white"
                        >
                          {event.status}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant="outline" className="bg-white/90">
                          {event.eventType}
                        </Badge>
                      </div>
                    </div>

                    {/* Content Section */}
                    <CardHeader className="pb-3 pt-4">
                      <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDateTime(event.startDate)}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {event.shortDescription || event.description}
                      </p>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4 text-gray-500" />
                          <span>
                            {event.currentAttendees}
                            {event.maxAttendees ? ` / ${event.maxAttendees}` : ""} attendees
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span>{event.averageRating > 0 ? event.averageRating.toFixed(1) : "No ratings"}</span>
                          {event.totalReviews > 0 && <span className="text-gray-500">({event.totalReviews})</span>}
                        </div>
                      </div>

                      <div className="flex items-center justify-end pt-2 mb-3">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(eventPublicPath(event))
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events scheduled</h3>
                <p className="text-gray-600 mb-6">This venue doesn't have any upcoming events.</p>
                {showScheduleMeeting && (
                  <Button onClick={handleScheduleMeeting} className="bg-red-600 hover:bg-red-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Event at this Venue
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Reviews Tab - Keep existing design */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Review Form and All Reviews */}
                <div className="lg:col-span-3 space-y-6">
                  <AddVenueReview venueId={venueId} onReviewAdded={handleReviewAdded} />

                  {/* All Reviews Section */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400" />
                        All Reviews ({reviews.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {reviewsLoading ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-gray-500">Loading reviews...</p>
                        </div>
                      ) : reviews.length > 0 ? (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto p-6 pt-0">
                          {reviews.map((review) => (
                            <div key={review.id} className="pb-4 border-b last:border-b-0 last:pb-0">
                              <VenueReviewCard
                                review={review}
                                venueName={venue?.name || venue?.venueName}
                                venueManagerName={venue?.manager?.name}
                                venueManagerAvatar={venue?.manager?.avatar}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 px-6">
                          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2 text-gray-700">No Reviews Yet</h3>
                          <p className="text-gray-500 max-w-md mx-auto">
                            Be the first to share your experience with this venue! Your review will help others make
                            better decisions.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}