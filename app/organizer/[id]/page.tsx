"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Globe,
  Calendar,
  Star,
  Share2,
  Heart,
  Award,
  Building,
  CheckCircle,
  ExternalLink,
  X,
  Mail,
} from "lucide-react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { AddOrganizerReview } from "@/components/AddOrganizerReview"
import { ReviewCard } from "@/components/ReviewCard"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import { eventPublicPath } from "@/lib/event-path"
import { getPublicProfilePath } from "@/lib/profile-path"

interface Organizer {
  id: string
  publicSlug?: string
  name: string
  company: string
  email: string
  phone: string
  location: string
  website: string
  description: string
  avatar: string
  totalEvents: number
  activeEvents: number
  totalAttendees: number
  totalRevenue: number
  founded: string
  teamSize: string
  headquarters: string
  specialties: string[]
  achievements: string[]
  certifications: string[]
  organizationName: string
  businessEmail: string
  businessPhone: string
  businessAddress: string
  averageRating?: number
  totalReviews?: number
}

interface Event {
  id: number
  title: string
  description: string
  date: string
  startDate: string
  endDate: string
  location: string
  status: string
  attendees: number
  registrations: number
  revenue: number
  type: string
  maxAttendees: number
  isVirtual: boolean
  bannerImage?: string
  thumbnailImage?: string
  isPublic: boolean
}

interface ReviewReply {
  id: string
  content: string
  createdAt: string
  isOrganizerReply: boolean
  user: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
}

interface Review {
  id: string
  rating: number
  title?: string
  comment: string
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
  event?: {
    id: string
    title: string
  }
  replies: ReviewReply[]
}

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export default function OrganizerPage() {
  const params = useParams()
  const router = useRouter()
  const organizerId = (params.slug ?? params.id) as string

  const [activeTab, setActiveTab] = useState("overview")
  const [currentPage, setCurrentPage] = useState(1)
  const [organizer, setOrganizer] = useState<Organizer | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Contact modal states
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [contactFormData, setContactFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")

  const eventsPerPage = 6

  useEffect(() => {
    const fetchOrganizerData = async () => {
      try {
        setLoading(true)

        // Fetch organizer details
        const organizerData = await apiFetch<{ organizer: Organizer }>(`/api/organizers/${organizerId}`, {
          auth: false,
        })
        setOrganizer(organizerData.organizer)
        if (organizerData.organizer?.publicSlug) {
          const canonical = getPublicProfilePath("organizer", {
            id: organizerData.organizer.id,
            publicSlug: organizerData.organizer.publicSlug,
            organizationName: organizerData.organizer.organizationName || organizerData.organizer.name,
          })
          if (typeof window !== "undefined" && window.location.pathname !== canonical) {
            router.replace(canonical)
          }
        }

        const eventsData = await apiFetch<{ events?: Event[] }>(
          `/api/organizers/${organizerId}/events?page=1&limit=100`,
          { auth: false },
        )
        setEvents(eventsData.events || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load organizer")
      } finally {
        setLoading(false)
      }
    }

    if (organizerId) {
      fetchOrganizerData()
    }
  }, [organizerId])

  // Fetch reviews when reviews tab is active
  useEffect(() => {
    const fetchReviews = async () => {
      if (activeTab === "reviews") {
        setReviewsLoading(true)
        try {
          const data = await apiFetch<{ reviews?: any[]; data?: { reviews?: any[] }; organizer?: any }>(`/api/organizers/${organizerId}/reviews`, { auth: false })
          const list = data.reviews ?? data.data?.reviews ?? []
          setReviews(Array.isArray(list) ? list : [])
          if (data.organizer) {
            setOrganizer(prev => prev ? {
              ...prev,
              averageRating: data.organizer.averageRating,
              totalReviews: data.organizer.totalReviews
            } : null)
          }
        } catch (error) {
          console.error("Error fetching reviews:", error)
        } finally {
          setReviewsLoading(false)
        }
      }
    }

    fetchReviews()
  }, [activeTab, organizerId])

  // Calculate organizer statistics
  const stats = useMemo(() => {
    if (!organizer || !events)
      return {
        totalEvents: 0,
        avgRating: 0,
        upcomingEvents: 0,
        completedEvents: 0,
        totalReviews: 0,
      }

    const totalEvents = events.length
    const avgRating = organizer.averageRating || 0
    const totalReviews = organizer.totalReviews || reviews.length
    const upcomingEvents = events.filter((event) => event.status === "Active").length
    const completedEvents = events.filter((event) => event.status === "Completed").length

    return {
      totalEvents,
      avgRating,
      upcomingEvents,
      completedEvents,
      totalReviews,
    }
  }, [organizer, events, reviews])

  // Handle new review submission
  const handleReviewAdded = (newReview: Review) => {
    setReviews(prevReviews => [newReview, ...prevReviews])

    // Update organizer stats
    if (organizer) {
      const newTotalReviews = (organizer.totalReviews || reviews.length) + 1
      const newAvgRating = ((organizer.averageRating || 0) * (newTotalReviews - 1) + newReview.rating) / newTotalReviews

      setOrganizer(prev => prev ? {
        ...prev,
        totalReviews: newTotalReviews,
        averageRating: Math.round(newAvgRating * 10) / 10
      } : null)
    }
  }

  // Handle new reply submission
  const handleReplyAdded = (reviewId: string, newReply: ReviewReply) => {
    setReviews(prev => prev.map(review =>
      review.id === reviewId
        ? { ...review, replies: [...review.replies, newReply] }
        : review
    ))
  }

  // Contact form handler
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage("")

    try {
      const response = await fetch('/api/contact-organizer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...contactFormData,
          organizerId: organizerId,
          organizerName: organizer?.name,
          organizerEmail: organizer?.email
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitMessage(result.message || "Message sent successfully!")
        setContactFormData({
          name: "",
          email: "",
          subject: "",
          message: ""
        })
        setTimeout(() => {
          setIsContactModalOpen(false)
          setSubmitMessage("")
        }, 3000)
      } else {
        setSubmitMessage(result.error || "Failed to send message. Please try again.")
      }
    } catch (error) {
      setSubmitMessage("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setContactFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Quick subject buttons handler
  const handleQuickSubject = (subject: string) => {
    setContactFormData(prev => ({
      ...prev,
      subject
    }))
  }

  // Reset contact form when modal closes
  const handleCloseContactModal = () => {
    setIsContactModalOpen(false)
    setContactFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    })
    setSubmitMessage("")
  }

  // Handle contact button click - redirect to website
  const handleContactClick = () => {
    if (organizer?.website) {
      window.open(organizer.website, '_blank', 'noopener,noreferrer')
    } else {
      // If no website, open contact modal as fallback
      setIsContactModalOpen(true)
    }
  }

  // Share functionality
  const handleShare = (platform: string) => {
    const shareUrl = window.location.href
    const shareText = `Check out ${organizer?.name} on our platform!`

    const shareUrls = {
      gmail: `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(organizer?.name || '')}&body=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      outlook: `https://outlook.office.com/mail/deeplink/compose?subject=${encodeURIComponent(organizer?.name || '')}&body=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    }

    const url = shareUrls[platform as keyof typeof shareUrls]
    if (url) {
      window.open(url, '_blank', 'width=600,height=400')
    }
  }

  // Copy to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Organizer...</h1>
          <p className="text-gray-600">Please wait while we fetch the organizer details.</p>
        </div>
      </div>
    )
  }

  if (error || !organizer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Organizer Not Found</h1>
          <p className="text-gray-600 mb-4">{error || "The organizer you're looking for doesn't exist."}</p>
          <Button onClick={() => router.push("/organizers")}>Back to Organizers</Button>
        </div>
      </div>
    )
  }

  // Pagination for events
  const totalPages = Math.ceil(events.length / eventsPerPage)
  const paginatedEvents = events.slice((currentPage - 1) * eventsPerPage, currentPage * eventsPerPage)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  // Calculate rating distribution
  const ratingDistribution = [0, 0, 0, 0, 0]
  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingDistribution[5 - review.rating]++
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-[#002C71] text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Organizer Avatar */}
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={organizer.avatar || "/placeholder.svg"} alt={organizer.company} />
                <AvatarFallback className="text-2xl font-bold bg-white text-blue-600">
                  {organizer.company
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Organizer Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{organizer.company}</h1>
                <Badge className="bg-yellow-500 text-yellow-900">Verified</Badge>
              </div>
              <p className="text-xl text-blue-100 mb-4">{organizer.description}</p>

              {/* Contact Info - Simplified */}
              <div className="flex flex-wrap gap-6 text-blue-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{organizer.headquarters}</span>
                </div>
                 <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                onClick={() => setIsShareModalOpen(true)}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
             
              {/* <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                onClick={handleContactClick}
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact
              </Button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - Updated */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{organizer.totalEvents}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{organizer.activeEvents}</div>
              <div className="text-sm text-gray-600">Active Events</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-2xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</span>
              </div>
              <div className="text-sm text-gray-600">Avg Rating ({stats.totalReviews})</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{organizer.founded}</div>
              <div className="text-sm text-gray-600">Founded</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events ({stats.totalEvents})</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({stats.totalReviews})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Company Highlights */}
              <div className="lg:col-span-2 space-y-6">
                {/* About Section */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      About {organizer.organizationName}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{organizer.description}</p>
                  </CardContent>
                </Card>

                {/* Recent Events */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Recent Events</h3>
                    <div className="space-y-4">
                      {events.slice(0, 3).map((event) => (
                        <Link href={eventPublicPath(event)} key={event.id}>
                          <div className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                            <Image
                              src={event.bannerImage || "/placeholder.svg?height=60&width=80"}
                              alt={event.title}
                              width={80}
                              height={60}
                              className="w-20 h-15 rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">{event.title}</h4>
                              <div className="flex items-center text-sm text-gray-600 mb-1">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(event.startDate)}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mr-1" />
                                {event.location}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-4 text-center">
                      <Button variant="outline" onClick={() => setActiveTab("events")}>
                        View All Events
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Specialties */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {organizer.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Achievements
                    </h3>
                    <div className="space-y-2">
                      {organizer.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Certifications */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Certifications</h3>
                    <div className="space-y-2">
                      {organizer.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-600">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">All Events by {organizer.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Showing {paginatedEvents.length} of {events.length} events
                </span>
              </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedEvents.map((event) => (
                <div key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer border-2 rounded-xl">
                  <Link href={eventPublicPath(event)}>
                    <div className="p-0">
                      <div className="relative">
                        <Image
                          src={event.bannerImage || "/placeholder.svg?height=200&width=400"}
                          alt={event.title}
                          width={400}
                          height={200}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-lg mb-2 line-clamp-1">{event.title}</h4>
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(event.startDate)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            {event.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
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
                      className={`w-8 h-8 rounded text-sm ${currentPage === page ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
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
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Company Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Founded</label>
                      <p className="text-gray-900">{organizer.founded}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Headquarters</label>
                      <p className="text-gray-900">{organizer.headquarters}</p>
                    </div>
                    {organizer.website && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Website</label>
                        <a
                          href={organizer.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {organizer.website}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Event Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Events Organized</span>
                      <span className="font-semibold">{organizer.totalEvents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Events</span>
                      <span className="font-semibold">{organizer.activeEvents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Team Size</span>
                      <span className="font-semibold">{organizer.teamSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-semibold">{stats.avgRating}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Full Description</h3>
                <p className="text-gray-600 leading-relaxed">{organizer.description}</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Reviews List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">
                    Reviews ({reviews.length})
                  </h3>
                </div>

                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading reviews...</p>
                  </div>
                ) : reviews.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h4>
                      <p className="text-gray-600">Be the first to share your experience with this organizer!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        organizerId={organizerId}
                        onReplyAdded={handleReplyAdded}
                        hideReplyButton={true}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Add Review Form */}
              <div className="space-y-6">
                <AddOrganizerReview
                  organizerId={organizerId}
                  onReviewAdded={handleReviewAdded}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Contact Modal - Only shown if no website exists */}
      {isContactModalOpen && !organizer?.website && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Contact {organizer?.name}</h3>
              <button
                onClick={handleCloseContactModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Subject Buttons */}
            <div className="p-6 border-b">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Options</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSubject("Event Partnership Inquiry")}
                  className="text-xs"
                >
                  Partnership
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSubject("Speaking Opportunity")}
                  className="text-xs"
                >
                  Speaking
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSubject("Sponsorship Inquiry")}
                  className="text-xs"
                >
                  Sponsorship
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSubject("General Question")}
                  className="text-xs"
                >
                  General
                </Button>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={contactFormData.name}
                  onChange={handleContactFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={contactFormData.email}
                  onChange={handleContactFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={contactFormData.subject}
                  onChange={handleContactFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Subject of your message"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={contactFormData.message}
                  onChange={handleContactFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter your message..."
                />
              </div>

              {submitMessage && (
                <div className={`p-3 rounded-md ${submitMessage.includes("successfully")
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                  }`}>
                  {submitMessage}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseContactModal}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Share {organizer?.name}</h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => handleShare('gmail')}
                >
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">G</span>
                  </div>
                  <span className="text-xs">Gmail</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => handleShare('whatsapp')}
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">W</span>
                  </div>
                  <span className="text-xs">WhatsApp</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => handleShare('linkedin')}
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">in</span>
                  </div>
                  <span className="text-xs">LinkedIn</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => handleShare('outlook')}
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">O</span>
                  </div>
                  <span className="text-xs">Outlook</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => handleShare('twitter')}
                >
                  <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">X</span>
                  </div>
                  <span className="text-xs">Twitter</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => handleShare('facebook')}
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">f</span>
                  </div>
                  <span className="text-xs">Facebook</span>
                </Button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="whitespace-nowrap"
                >
                  Copy Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}