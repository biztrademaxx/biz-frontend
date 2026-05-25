import { apiFetch, getCurrentUserId } from "@/lib/api"
import { devLog } from "@/lib/dev-log"
import type {
  EventsResponse,
  VenueDetail,
  VenueResponse,
  VenueReview,
} from "../types/venue-detail.types"

export async function fetchVenueBySegment(segment: string): Promise<VenueDetail | null> {
  const response = await fetch(`/api/venue-manager/${encodeURIComponent(segment)}`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data: VenueResponse = await response.json()
  if (data.success && data.data) return data.data
  return null
}

export async function fetchVenueReviews(venueId: string): Promise<VenueReview[]> {
  try {
    const data = await apiFetch<{ success?: boolean; reviews?: VenueReview[] }>(
      `/api/venues/${venueId}/reviews?includeReplies=true`,
      { auth: false },
    )
    return Array.isArray(data?.reviews)
      ? data.reviews.filter((r) => r && typeof r.rating === "number" && r.user)
      : []
  } catch {
    return []
  }
}

export async function fetchVenueEvents(venueId: string): Promise<EventsResponse["events"]> {
  try {
    const data = await apiFetch<EventsResponse>(`/api/venues/${venueId}/events`, { auth: false })
    devLog("Fetched events data:", data)
    if (data.success) {
      devLog("Events set:", data.events?.length)
      return data.events || []
    }
    return []
  } catch (error) {
    console.error("Error fetching events:", error)
    return []
  }
}

export async function createVenueAppointment(venue: VenueDetail): Promise<void> {
  const userId = getCurrentUserId()
  if (!userId) throw new Error("Authentication required")

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
}
