"use client"

import { useToast } from "@/hooks/use-toast"
import { isAuthenticated } from "@/lib/api"
import { getVenuePublicPath } from "@/lib/venue-dashboard-path"
import { useParams, usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import {
  createVenueAppointment,
  fetchVenueBySegment,
  fetchVenueEvents,
  fetchVenueReviews,
  sendVenueConnectionRequest,
} from "../services/venue-detail.api"
import type { VenueDetail, VenueEvent, VenueReview } from "../types/venue-detail.types"

export function useVenueDetail() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const segment = params.id as string
  const { toast } = useToast()

  const [venue, setVenue] = useState<VenueDetail | null>(null)
  const [reviews, setReviews] = useState<VenueReview[]>([])
  const [events, setEvents] = useState<VenueEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [eventsLoading, setEventsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [schedulingMeeting, setSchedulingMeeting] = useState(false)
  const [sendingConnection, setSendingConnection] = useState(false)
  const [connectionSent, setConnectionSent] = useState(false)

  const showScheduleMeeting = isAuthenticated()

  const loadVenue = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchVenueBySegment(segment)
      if (data) {
        setVenue(data)
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
  }, [segment])

  const loadReviews = useCallback(async (venueId: string) => {
    setReviewsLoading(true)
    try {
      setReviews(await fetchVenueReviews(venueId))
    } finally {
      setReviewsLoading(false)
    }
  }, [])

  const loadEvents = useCallback(async (venueId: string) => {
    setEventsLoading(true)
    try {
      setEvents(await fetchVenueEvents(venueId))
    } finally {
      setEventsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (segment) void loadVenue()
  }, [segment, loadVenue])

  useEffect(() => {
    const resolvedId = venue?.id
    if (!resolvedId) return
    void loadReviews(resolvedId)
    void loadEvents(resolvedId)
  }, [venue?.id, loadReviews, loadEvents])

  useEffect(() => {
    if (!venue?.id) return
    const displayName =
      venue.manager?.venueName?.trim() ||
      (typeof venue.venueName === "string" ? venue.venueName.trim() : "") ||
      (typeof venue.name === "string" ? venue.name.trim() : "")
    const canonical = getVenuePublicPath(venue.id, displayName || null)
    if (pathname && canonical !== pathname) {
      router.replace(canonical)
    }
  }, [venue?.id, venue?.name, venue?.venueName, venue?.manager?.venueName, pathname, router])

  const handleReviewAdded = (newReview: VenueReview) => {
    if (!newReview || typeof newReview.rating !== "number") {
      toast({
        title: "Error",
        description: "Failed to add review. Please try again.",
        variant: "destructive",
      })
      return
    }

    setReviews((prev) => [newReview, ...prev])

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
            averageRating:
              (currentAverageRating * currentTotalReviews + newReview.rating) /
              (currentTotalReviews + 1),
          },
        }
      })
    }

    toast({ title: "Success", description: "Your review has been added!" })
  }

  const handleSendConnection = async () => {
    if (!venue?.manager?.id) return

    try {
      setSendingConnection(true)
      await sendVenueConnectionRequest(venue.manager.id)
      setConnectionSent(true)
      toast({
        title: "Connection request sent",
        description: `Your request was sent to ${venue.manager.name || "the venue manager"}.`,
      })
    } catch (err) {
      console.error("Error sending connection:", err)
      toast({
        title: "Could not send connection",
        description:
          err instanceof Error
            ? err.message === "Authentication required"
              ? "Please log in to send a connection request."
              : err.message
            : "Failed to send connection request",
        variant: "destructive",
      })
    } finally {
      setSendingConnection(false)
    }
  }

  const handleScheduleMeeting = async () => {
    if (!venue) return

    try {
      setSchedulingMeeting(true)
      await createVenueAppointment(venue)
      toast({
        title: "Success",
        description: `Meeting request sent to ${venue.manager.name}!`,
      })
    } catch (err) {
      console.error("Error scheduling meeting:", err)
      toast({
        title: "Error",
        description:
          err instanceof Error
            ? err.message === "Authentication required"
              ? "Please log in to schedule meetings."
              : err.message
            : "Failed to schedule meeting",
        variant: "destructive",
      })
    } finally {
      setSchedulingMeeting(false)
    }
  }

  const nextImage = (imageCount: number) => {
    if (imageCount > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % imageCount)
    }
  }

  const prevImage = (imageCount: number) => {
    if (imageCount > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + imageCount) % imageCount)
    }
  }

  return {
    router,
    venue,
    reviews,
    events,
    loading,
    reviewsLoading,
    eventsLoading,
    error,
    currentImageIndex,
    setCurrentImageIndex,
    schedulingMeeting,
    sendingConnection,
    connectionSent,
    showScheduleMeeting,
    handleReviewAdded,
    handleSendConnection,
    handleScheduleMeeting,
    nextImage,
    prevImage,
  }
}
