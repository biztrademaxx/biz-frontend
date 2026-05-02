"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUserId, isAuthenticated } from "@/lib/api"
import Image from "next/image"
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Star,
  Share2,
  Heart,
  Award,
  Building,
  CheckCircle,
  ExternalLink,
  Package,
  TrendingUp,
  Link,
  MessageSquare,
  Reply,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import ScheduleMeetingButton from "@/components/ScheduleMeetingButton"
import { FollowButton } from "@/components/follow-button"
import { apiFetch } from "@/lib/api"
import { eventPublicPath } from "@/lib/event-path"
import { getPublicProfilePath } from "@/lib/profile-path"

// Define types for exhibitor data
interface Exhibitor {
  id: string
  publicSlug?: string
  firstName?: string
  lastName?: string
  email: string
  phone?: string
  avatar?: string
  bio?: string
  website?: string
  companyName?: string
  companyLogo?: string
  industry?: string
  companySize?: string
  foundedYear?: string
  headquarters?: string
  specialties?: string[]
  certifications?: string[]
  isVerified: boolean
  createdAt: string
}

// Define types for booth data based on your API response
interface Booth {
  id: string
  eventId: string
  exhibitorId: string
  spaceId: string
  spaceReference: string
  boothNumber: string
  companyName: string
  description: string
  additionalPower: number
  compressedAir: number
  setupRequirements: {
    requirements: string
  }
  specialRequests: string
  totalCost: number
  currency: string
  status: string
  createdAt: string
  updatedAt: string
  exhibitor: any
  event: {
    id: string
    title: string
    description: string
    shortDescription?: string
    slug: string
    status: "DRAFT" | "PUBLISHED" | "CANCELLED"
    category: string
    tags: string[]
    isFeatured: boolean
    isVIP: boolean
    startDate: string
    endDate: string
    registrationStart: string
    registrationEnd: string
    timezone: string
    venueId: string | null
    isVirtual: boolean
    virtualLink: string | null
    maxAttendees: number | null
    currentAttendees: number
    currency: string
    bannerImage: string | null
    thumbnailImage: string | null
    isPublic: boolean
    requiresApproval: boolean
    allowWaitlist: boolean
    refundPolicy: string | null
    metaTitle: string | null
    metaDescription: string | null
    organizerId: string
    createdAt: string
    updatedAt: string
    averageRating: number
    totalReviews: number
    organizer: {
      id: string
      firstName: string
      lastName: string
      company: string
    }
    venue: {
      id: string
      venueName: string
      venueDescription: string
      venueAddress: string
      venueCity: string
      venueState: string
      venueCountry: string
    }
  }
}

// Review Reply interface
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

// Review interface with replies
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
  replies: ReviewReply[]
}

// Review Card Component with Replies
function ReviewCard({ review, exhibitorId, onReplyAdded }: { 
  review: Review 
  exhibitorId: string
  onReplyAdded: (reviewId: string, reply: ReviewReply) => void 
}) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const isLoggedIn = isAuthenticated()

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim()) return

    setIsSubmittingReply(true)
    try {
      await apiFetch(`/api/exhibitors/${exhibitorId}/reviews/${review.id}/replies`, {
        method: "POST",
        body: { content: replyContent },
        auth: true,
      })
      const newReply: ReviewReply = {
        id: crypto.randomUUID(),
        content: replyContent,
        createdAt: new Date().toISOString(),
        isOrganizerReply: false,
        user: { id: "", firstName: "You", lastName: "", avatar: undefined },
      }
      onReplyAdded(review.id, newReply)
      setReplyContent("")
      setShowReplyForm(false)
    } catch (err) {
      console.error(err)
      alert("⚠️ Replies are not available yet. Please try again later.")
    } finally {
      setIsSubmittingReply(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {review.user?.avatar ? (
              <img
                src={review.user.avatar}
                alt={`${review.user.firstName} ${review.user.lastName}`}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium">
                        {([review.user?.firstName?.[0], review.user?.lastName?.[0]].filter(Boolean).join("") || "G").toUpperCase()}
                      </span>
              </div>
            )}
            <div>
              <h4 className="font-medium">
                {[review.user?.firstName, review.user?.lastName].filter(Boolean).join(" ").trim() || "Guest"}
              </h4>
              <p className="text-sm text-gray-500">
                {format(new Date(review.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                className={
                  star <= review.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }
              />
            ))}
            <span className="ml-1 text-sm font-medium">{review.rating}</span>
          </div>
        </div>

        {review.title && (
          <h5 className="font-semibold text-lg mb-2">{review.title}</h5>
        )}

        <p className="text-gray-700 mb-4">{review.comment}</p>

        {/* Replies Section */}
        {review.replies && review.replies.length > 0 && (
          <div className="ml-4 pl-4 border-l-2 border-gray-200 space-y-4">
            {review.replies.map((reply) => (
              <div key={reply.id} className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {reply.user?.avatar ? (
                    <img
                      src={reply.user.avatar}
                      alt={`${reply.user.firstName} ${reply.user.lastName}`}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {([reply.user?.firstName?.[0], reply.user?.lastName?.[0]].filter(Boolean).join("") || "G").toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {[reply.user?.firstName, reply.user?.lastName].filter(Boolean).join(" ").trim() || "Guest"}
                    </span>
                    {reply.isOrganizerReply && (
                      <Badge variant="secondary" className="text-xs">
                        Exhibitor
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {format(new Date(reply.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reply Button and Form */}
        {isLoggedIn && (
          <div className="mt-4">
            {!showReplyForm ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReplyForm(true)}
                className="text-sm flex items-center gap-2"
              >
                <Reply className="w-4 h-4" />
                Reply {review.replies && review.replies.length > 0 && `(${review.replies.length})`}
              </Button>
            ) : (
              <form onSubmit={handleSubmitReply} className="space-y-2">
                <textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  rows={3}
                  required
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSubmittingReply || !replyContent.trim()}
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {isSubmittingReply ? "Posting..." : "Post Reply"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowReplyForm(false)
                      setReplyContent("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Add Review Component
function AddReview({ exhibitorId, onReviewAdded }: { exhibitorId: string; onReviewAdded: (review: Review) => void }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || rating === 0) return

    setIsSubmitting(true)
    try {
      const newReview = await apiFetch<Review>(`/api/exhibitors/${exhibitorId}/reviews`, {
        method: "POST",
        body: { rating, title, comment },
        auth: true,
      })
      onReviewAdded(newReview)
      setShowSuccessMessage(true)
      setRating(0)
      setTitle("")
      setComment("")
      setTimeout(() => setShowSuccessMessage(false), 3000)
    } catch (err) {
      console.error(err)
      alert("⚠️ Failed to add review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Review Form */}
      <Card>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    size={28}
                    className={
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500">
                {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : "Select rating"}
              </span>
            </div>

            <input
              type="text"
              placeholder="Review title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            <textarea
              placeholder="Share your experience with this exhibitor..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={4}
              required
            />

            <Button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="w-48 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-none"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Thank you for your review!</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to safely extract date
const safeFormatDate = (dateInput: string | null | undefined): string => {
  if (!dateInput) return "Date TBD";

  try {
    return new Date(dateInput).toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

// Helper function to get location string
const getLocationString = (venue: any): string => {
  if (!venue) return "Location TBD";
  
  const { venueName, venueAddress, venueCity, venueState, venueCountry } = venue;
  
  const parts = [];
  if (venueName) parts.push(venueName);
  if (venueAddress) parts.push(venueAddress);
  if (venueCity) parts.push(venueCity);
  if (venueState) parts.push(venueState);
  if (venueCountry) parts.push(venueCountry);
  
  return parts.length > 0 ? parts.join(", ") : "Location TBD";
};

// Main Exhibitor Page Component
export default function ExhibitorPage() {
  const params = useParams()
  const router = useRouter()
  const exhibitorId = (params.slug ?? params.id) as string

  const userId = getCurrentUserId()

  const [activeTab, setActiveTab] = useState("overview")
  const [eventsTab, setEventsTab] = useState("upcoming")
  const [currentPage, setCurrentPage] = useState(1)
  const [exhibitor, setExhibitor] = useState<Exhibitor | null>(null)
  const [booths, setBooths] = useState<Booth[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [eventsLoading, setEventsLoading] = useState(false)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const eventsPerPage = 6

  // Fetch exhibitor data
  useEffect(() => {
    async function fetchExhibitor() {
      try {
        const data = await apiFetch<{ success: boolean; exhibitor: Exhibitor }>(
          `/api/exhibitors/${exhibitorId}`,
          { auth: false },
        )

        if (data.success) {
          setExhibitor(data.exhibitor)
          if (data.exhibitor?.publicSlug) {
            const canonical = getPublicProfilePath("exhibitor", {
              id: data.exhibitor.id,
              publicSlug: data.exhibitor.publicSlug,
              organizationName: data.exhibitor.organizationName,
              company: data.exhibitor.companyName || data.exhibitor.company,
            })
            if (typeof window !== "undefined" && window.location.pathname !== canonical) {
              router.replace(canonical)
            }
          }
        } else {
          console.error("Failed to fetch exhibitor")
        }
      } catch (error) {
        console.error("Error fetching exhibitor:", error)
      } finally {
        setLoading(false)
      }
    }

    if (exhibitorId) {
      fetchExhibitor()
    }
  }, [exhibitorId])

  // Fetch exhibitor booths (events) from backend
  useEffect(() => {
    async function fetchExhibitorBooths() {
      if (!exhibitorId) return;

      setEventsLoading(true);
      try {
        const data = await apiFetch<{ success?: boolean; events?: Array<{
          id: string
          eventId: string
          eventSlug?: string
          eventName: string
          bannerImage?: string | null
          thumbnailImage?: string | null
          boothNumber: string
          date?: string
          endDate?: string
          rawStartDate: string
          rawEndDate: string
          venue:
            | string
            | {
                venueName?: string
                venueAddress?: string
                venueCity?: string
                venueState?: string
                venueCountry?: string
                venueZipCode?: string
              }
            | null
          organizer?: { id: string; firstName: string; lastName: string; company?: string }
          currency?: string
          invoiceAmount?: number
          status?: string
        }> }>(`/api/exhibitors/${exhibitorId}/events`);

        if (data?.events && Array.isArray(data.events)) {
          const mapped: Booth[] = data.events.map((e) => ({
            id: e.id,
            eventId: e.eventId,
            exhibitorId,
            spaceId: "",
            spaceReference: "",
            boothNumber: e.boothNumber ?? "",
            companyName: "",
            description: "",
            additionalPower: 0,
            compressedAir: 0,
            setupRequirements: { requirements: "" },
            specialRequests: "",
            totalCost: e.invoiceAmount ?? 0,
            currency: e.currency ?? "USD",
            status: e.status ?? "BOOKED",
            createdAt: "",
            updatedAt: "",
            exhibitor: null,
            event: {
              id: e.eventId,
              slug: e.eventSlug ?? e.eventId,
              title: e.eventName,
              description: "",
              shortDescription: undefined,
              status: "PUBLISHED",
              category: "",
              tags: [],
              isFeatured: false,
              isVIP: false,
              startDate: e.rawStartDate || e.date || "",
              endDate: e.rawEndDate || e.endDate || "",
              registrationStart: "",
              registrationEnd: "",
              timezone: "",
              venueId: null,
              isVirtual: false,
              virtualLink: null,
              maxAttendees: null,
              currentAttendees: 0,
              currency: e.currency ?? "USD",
              bannerImage: e.bannerImage ?? null,
              thumbnailImage: e.thumbnailImage ?? null,
              isPublic: true,
              requiresApproval: false,
              allowWaitlist: false,
              refundPolicy: null,
              metaTitle: null,
              metaDescription: null,
              organizerId: e.organizer?.id ?? "",
              createdAt: "",
              updatedAt: "",
              averageRating: 0,
              totalReviews: 0,
              organizer: e.organizer
                ? { id: e.organizer.id, firstName: e.organizer.firstName, lastName: e.organizer.lastName, company: e.organizer.company ?? "" }
                : { id: "", firstName: "", lastName: "", company: "" },
              venue:
                typeof e.venue === "string"
                  ? {
                      id: "",
                      venueName: e.venue,
                      venueDescription: "",
                      venueAddress: "",
                      venueCity: "",
                      venueState: "",
                      venueCountry: "",
                    }
                  : {
                      id: "",
                      venueName: e.venue?.venueName ?? "",
                      venueDescription: "",
                      venueAddress: e.venue?.venueAddress ?? "",
                      venueCity: e.venue?.venueCity ?? "",
                      venueState: e.venue?.venueState ?? "",
                      venueCountry: e.venue?.venueCountry ?? "",
                    },
            },
          }));
          setBooths(mapped);
        } else {
          setBooths([]);
        }
      } catch (error) {
        console.error("Error fetching exhibitor booths:", error);
        setBooths([]);
      } finally {
        setEventsLoading(false);
      }
    }

    if (exhibitorId) {
      fetchExhibitorBooths();
    }
  }, [exhibitorId]);

  // Fetch reviews from backend
  useEffect(() => {
    async function fetchReviews() {
      if (!exhibitorId) return;

      setReviewsLoading(true);
      try {
        const data = await apiFetch<{ reviews?: Review[] }>(`/api/exhibitors/${exhibitorId}/reviews`);
        setReviews(data?.reviews ?? []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    }

    if (exhibitorId) {
      fetchReviews();
    }
  }, [exhibitorId]);

  // Handle new review submission
  const handleReviewAdded = (newReview: Review) => {
    setReviews(prevReviews => [newReview, ...prevReviews])
  }

  // Handle new reply submission
  const handleReplyAdded = (reviewId: string, newReply: ReviewReply) => {
    setReviews(prevReviews => 
      prevReviews.map(review => 
        review.id === reviewId 
          ? { ...review, replies: [...(review.replies || []), newReply] }
          : review
      )
    )
  }

  // Calculate exhibitor statistics
  const stats = useMemo(() => {
    const totalEvents = booths.length;

    // Get current date for comparison
    const currentDate = new Date();

    // Upcoming events: events that haven't ended yet
    const upcomingEvents = booths.filter(booth => {
      const eventEndDate = new Date(booth.event.endDate);
      return eventEndDate > currentDate;
    }).length;

    // Past events: events that have ended
    const pastEvents = booths.filter(booth => {
      const eventEndDate = new Date(booth.event.endDate);
      return eventEndDate <= currentDate;
    }).length;

    // Calculate average review rating
    const reviewAvgRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    // Calculate total replies
    const totalReplies = reviews.reduce((sum, review) => sum + (review.replies?.length || 0), 0);

    return {
      totalEvents,
      upcomingEvents,
      pastEvents,
      reviewAvgRating: Math.round(reviewAvgRating * 10) / 10,
      totalReviews: reviews.length,
      totalReplies,
      clientsServed: "500+", // Mock data
    };
  }, [booths, reviews]);

  // Filter events based on active events tab
  const filteredEvents = useMemo(() => {
    const currentDate = new Date();
    
    if (eventsTab === "upcoming") {
      return booths.filter(booth => {
        const eventEndDate = new Date(booth.event.endDate);
        return eventEndDate > currentDate;
      });
    } else {
      return booths.filter(booth => {
        const eventEndDate = new Date(booth.event.endDate);
        return eventEndDate <= currentDate;
      });
    }
  }, [booths, eventsTab]);

  // Pagination for events
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage)
  const paginatedEvents = filteredEvents.slice((currentPage - 1) * eventsPerPage, currentPage * eventsPerPage)

  // Reset to page 1 when events tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [eventsTab]);

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = safeFormatDate(startDate);
    const end = safeFormatDate(endDate);

    if (start === "Date TBD" && end === "Date TBD") return "Date TBD";
    if (start === end) return start;
    return `${start} - ${end}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading exhibitor details...</div>
      </div>
    )
  }

  if (!exhibitor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Exhibitor Not Found</h1>
          <Button onClick={() => router.push("/")}>Return to Home</Button>
        </div>
      </div>
    )
  }

  const exhibitorName = exhibitor.companyName || `${exhibitor.firstName} ${exhibitor.lastName}`.trim() || "Exhibitor"
  const exhibitorLogo = exhibitor.companyLogo || exhibitor.avatar
  const exhibitorDescription = exhibitor.bio || "No description available."
  const exhibitorSpecialties = exhibitor.specialties || ["Enterprise Software", "AI/ML Solutions", "Cloud Computing"]
  const exhibitorCertifications = exhibitor.certifications || ["ISO 27001:2013", "SOC 2 Type II", "GDPR Compliant"]

  // Mock data for achievements and social proof
  const mockDetails = {
    achievements: [
      "Best Tech Innovation Award 2023",
      "Top 50 Startups in India 2022",
      "Excellence in Customer Service",
      "Sustainability Leader Recognition",
    ],
    socialProof: {
      clientsServed: "500+",
      projectsCompleted: "1,200+",
      yearsExperience: "8+",
      teamSize: "150+",
    },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-[#002C71] text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Exhibitor Avatar */}
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={exhibitorLogo || "/city/c4.jpg"} alt={exhibitorName} />
                <AvatarFallback className="text-2xl font-bold bg-white text-blue-600">
                  {exhibitorName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {exhibitor.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            {/* Exhibitor Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{exhibitorName}</h1>
                <div className="space-x-8">
                  <Badge className="bg-gray-200 w-20 py-2 text-yellow-900 rounded-sm">
                    Active
                  </Badge>
                </div>
              </div>
              <p className="text-xl text-blue-100 mb-4">{exhibitorDescription}</p>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-6 text-blue-100">
                {exhibitor.headquarters && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{exhibitor.headquarters}</span>
                  </div>
                )}
                {/* {exhibitor.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{exhibitor.phone}</span>
                  </div>
                )} */}
                {/* <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{exhibitor.email}</span>
                </div> */}
                {exhibitor.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <a href={exhibitor.website} className="hover:text-white transition-colors">
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <FollowButton
                  userId={exhibitor.id}
                  currentUserId={userId ?? undefined}
                  variant="default"
                  size="default"
                  className="shadow-sm"
                />
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                  size="sm"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: exhibitor.firstName,
                        text: "Check out this event!",
                        url: window.location.href,
                      })
                        .catch((err) => console.error("Error sharing:", err));
                    } else {
                      alert("Sharing is not supported in this browser.");
                    }
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
              <div>
                <ScheduleMeetingButton exhibitor={exhibitor} eventId={booths[0]?.event.id} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalEvents}</div>
              <div className="text-sm text-gray-600">Events Participated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.clientsServed}</div>
              <div className="text-sm text-gray-600">Clients Served</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-2xl font-bold text-gray-900">{stats.reviewAvgRating}</span>
              </div>
              <div className="text-sm text-gray-600">Event Rating</div>
            </div>
            {/* <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalReplies}</div>
              <div className="text-sm text-gray-600">Total Replies</div>
            </div> */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{exhibitor.foundedYear || "2015"}</div>
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
            <div className="w-full space-y-6">
              {/* About Section */}
              <Card className="border-0 shadow-sm w-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">About {exhibitorName}</h3>
                      <p className="text-sm text-gray-500 mt-1">Company overview and background</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-[15px] w-full">{exhibitorDescription}</p>
                </CardContent>
              </Card>

              {/* Recent Events */}
              <Card className="border-0 shadow-sm w-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6 w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Recent Event Participation</h3>
                        <p className="text-sm text-gray-500 mt-1">Latest events and exhibitions</p>
                      </div>
                    </div>
                    {booths.length > 0 && (
                      <Badge variant="secondary" className="px-3 py-1">
                        {booths.length} events
                      </Badge>
                    )}
                  </div>

                  {eventsLoading ? (
                    <div className="text-center py-8 w-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading events...</p>
                    </div>
                  ) : booths.length === 0 ? (
                    <div className="text-center py-8 w-full">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h4 className="text-lg font-semibold text-gray-600 mb-2">No Events Found</h4>
                      <p className="text-gray-500">This exhibitor hasn't participated in any events yet.</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 w-full">
                        {booths.slice(0, 3).map((booth) => {
                          const event = booth.event;
                          const isUpcoming = new Date(event.endDate) > new Date();

                          return (
                            <div
                              key={booth.id}
                              className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer group w-full"
                              onClick={() => {
                                router.push(eventPublicPath(event));
                              }}
                            >
                              {/* Event Image */}
                              <div className="relative w-20 h-20 flex-shrink-0">
                                <Image
                                  alt={event.title || "Event"}
                                  src={event.bannerImage || event.thumbnailImage || "/images/signupimg.png"}
                                  fill
                                  className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                                />
                                {event.isFeatured && (
                                  <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-900 text-xs">
                                    Featured
                                  </Badge>
                                )}
                              </div>

                              {/* Event Details */}
                              <div className="flex-1 min-w-0 w-full">
                                <div className="flex items-start justify-between mb-2 w-full">
                                  <h4 className="font-semibold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors flex-1">
                                    {event.title || "Untitled Event"}
                                  </h4>
                                  <Badge
                                    variant={isUpcoming ? "default" : "secondary"}
                                    className="ml-2 flex-shrink-0"
                                  >
                                    {isUpcoming ? "Upcoming" : "Completed"}
                                  </Badge>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-2 mb-3 w-full">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="text-sm font-medium text-gray-700">
                                      {event.averageRating || "4.5"}
                                    </span>
                                  </div>
                                  <span className="text-sm text-gray-500">•</span>
                                  <span className="text-sm text-gray-500">{event.totalReviews || 0} reviews</span>
                                </div>

                                {/* Event Details */}
                                <div className="space-y-2 w-full">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span>{formatDateRange(event.startDate, event.endDate)}</span>
                                  </div>

                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span className="truncate">{getLocationString(event.venue)}</span>
                                  </div>

                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Building className="w-4 h-4 text-gray-400" />
                                    <span>Booth: {booth.boothNumber}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* View All Button */}
                      {booths.length > 3 && (
                        <div className="mt-6 text-center w-full">
                          <Button
                            variant="outline"
                            onClick={() => setActiveTab("events")}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-6 w-full sm:w-auto"
                          >
                            View All Events ({booths.length})
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Event Participation History</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {eventsTab === "upcoming"
                    ? `${stats.upcomingEvents} upcoming events`
                    : `${stats.pastEvents} past events`
                  }
                </span>
              </div>
            </div>

            {/* Events Sub-tabs */}
            <Tabs value={eventsTab} onValueChange={setEventsTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-xs">
                <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
                <TabsTrigger value="past">Past Events</TabsTrigger>
              </TabsList>

              {/* Upcoming Events Tab */}
              <TabsContent value="upcoming" className="space-y-6">
                {eventsLoading ? (
                  <div className="text-center py-12">Loading events...</div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h4 className="text-lg font-semibold mb-2">No Upcoming Events</h4>
                    <p>This exhibitor doesn't have any upcoming events scheduled.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedEvents.map((booth) => {
                        const event = booth.event;

                        return (
                          <div 
                            key={booth.id} 
                            className="hover:shadow-lg transition-shadow cursor-pointer border-2 rounded-lg"
                            onClick={() => router.push(eventPublicPath(event))}
                          >
                            <CardContent className="p-0">
                              <div className="relative">
                                <Image
                                  src={event.bannerImage || event.thumbnailImage || "/herosection-images/weld.jpg"}
                                  alt={event.title || "Event"}
                                  width={400}
                                  height={200}
                                  className="w-full h-48 object-cover rounded-t-lg"
                                />
                                {event.isFeatured && (
                                  <Badge className="absolute top-3 left-3 bg-yellow-500 text-yellow-900">Featured</Badge>
                                )}
                              </div>
                              <div className="p-4">
                                <h4 className="font-semibold text-lg mb-2 line-clamp-1">{event.title || "Untitled Event"}</h4>
                                <div className="space-y-2 mb-3">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {formatDateRange(event.startDate, event.endDate)}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    {getLocationString(event.venue)}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Building className="w-4 h-4 mr-2" />
                                    Booth: {booth.boothNumber}
                                  </div>
                                </div>
                                {/* <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="text-sm font-medium">{event.averageRating || "N/A"}</span>
                                    <span className="text-sm text-gray-500">({event.totalReviews || 0})</span>
                                  </div>
                                  <Badge variant="default">
                                    Upcoming
                                  </Badge>
                                </div> */}
                              </div>
                            </CardContent>
                          </div>
                        );
                      })}
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
                  </>
                )}
              </TabsContent>

              {/* Past Events Tab */}
              <TabsContent value="past" className="space-y-6">
                {eventsLoading ? (
                  <div className="text-center py-12">Loading events...</div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h4 className="text-lg font-semibold mb-2">No Past Events</h4>
                    <p>This exhibitor hasn't participated in any past events yet.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedEvents.map((booth) => {
                        const event = booth.event;

                        return (
                          <Card 
                            key={booth.id} 
                            className="hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => router.push(eventPublicPath(event))}
                          >
                            <CardContent className="p-0">
                              <div className="relative">
                                <Image
                                  src={event.bannerImage || event.thumbnailImage || "/herosection-images/weld.jpg"}
                                  alt={event.title || "Event"}
                                  width={400}
                                  height={200}
                                  className="w-full h-48 object-cover rounded-t-lg"
                                />
                                {event.isFeatured && (
                                  <Badge className="absolute top-3 left-3 bg-yellow-500 text-yellow-900">Featured</Badge>
                                )}
                              </div>
                              <div className="p-4">
                                <h4 className="font-semibold text-lg mb-2 line-clamp-1">{event.title || "Untitled Event"}</h4>
                                <div className="space-y-2 mb-3">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {formatDateRange(event.startDate, event.endDate)}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    {getLocationString(event.venue)}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Building className="w-4 h-4 mr-2" />
                                    Booth: {booth.boothNumber}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="text-sm font-medium">{event.averageRating || "4.5"}</span>
                                    <span className="text-sm text-gray-500">({event.totalReviews || 0})</span>
                                  </div>
                                  <Badge variant="secondary">
                                    Completed
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
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
                  </>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            {/* Company Information - Full Width */}
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Company Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Founded</label>
                      <p className="text-lg font-semibold text-gray-900">{exhibitor.foundedYear || "2015"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Headquarters</label>
                      <p className="text-lg font-semibold text-gray-900">{exhibitor.headquarters || "Bangalore, India"}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Industry</label>
                      <p className="text-lg font-semibold text-gray-900">{exhibitor.industry || "Technology"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Company Size</label>
                      <p className="text-lg font-semibold text-gray-900">{exhibitor.companySize || "201-500 employees"}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Website</label>
                      <a
                        href={exhibitor.website || "#"}
                        className="text-lg font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                      >
                        {exhibitor.website || "https://techcorp.com"}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    {/* <div>
                      <label className="text-sm font-medium text-gray-500">Contact</label>
                      <div className="space-y-1">
                        <p className="text-lg font-semibold text-gray-900">{exhibitor.phone || "+91 98765 43210"}</p>
                        <p className="text-sm text-gray-600">{exhibitor.email}</p>
                      </div>
                    </div> */}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Description */}
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Company Description</h3>
                <p className="text-gray-700 leading-relaxed text-lg">{exhibitorDescription}</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Review Form and All Reviews */}
                <div className="lg:col-span-3 space-y-6">
                  <AddReview exhibitorId={exhibitorId} onReviewAdded={handleReviewAdded} />

                  {/* All Reviews Section in Scrollable Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400" />
                        All Reviews ({reviews.length})
                        {stats.totalReplies > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {stats.totalReplies} {stats.totalReplies === 1 ? 'reply' : 'replies'}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {reviewsLoading ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-gray-500">Loading reviews...</p>
                        </div>
                      ) : reviews.length > 0 ? (
                        <div
                          className="space-y-4 max-h-[600px] overflow-y-auto p-6 pt-0"
                          style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#cbd5e0 #f7fafc'
                          }}
                        >
                          {reviews.map((review) => (
                            <div key={review.id} className="pb-4 border-b last:border-b-0 last:pb-0">
                              <ReviewCard 
                                review={review} 
                                exhibitorId={exhibitorId}
                                onReplyAdded={handleReplyAdded}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 px-6">
                          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2 text-gray-700">No Reviews Yet</h3>
                          <p className="text-gray-500 max-w-md mx-auto">
                            Be the first to share your experience with this exhibitor! Your review will help others make better decisions.
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