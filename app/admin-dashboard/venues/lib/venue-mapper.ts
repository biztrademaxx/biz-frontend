import {
  deriveVenueStatus,
  inferCapacityAndHallsFromMeetingSpaces,
  parseIsActive,
  parseIsVerified,
} from "./venue-utils"
import type { Venue } from "../types/venue.types"

export function mapVenueFromApi(v: Record<string, unknown>): Venue {
  const inferred = inferCapacityAndHallsFromMeetingSpaces(v.meetingSpaces)
  let maxCap =
    v.maxCapacity != null && v.maxCapacity !== ""
      ? Number(v.maxCapacity)
      : inferred.capacity
  if (Number.isFinite(maxCap) && maxCap <= 0 && inferred.capacity > 0) maxCap = inferred.capacity
  let halls =
    v.totalHalls != null && v.totalHalls !== "" ? Number(v.totalHalls) : inferred.halls
  if (Number.isFinite(halls) && halls <= 0 && inferred.halls > 0) halls = inferred.halls
  const avg = Number(v.averageRating ?? 0)
  const reviews = Number(v.totalReviews ?? 0)
  const isVerified = parseIsVerified(v.isVerified)
  const isActive = parseIsActive(v.isActive)

  return {
    id: String(v.id ?? ""),
    venueName: String(v.venueName ?? v.name ?? ""),
    logo: String(v.logo ?? ""),
    contactPerson: String(
      v.contactPerson ??
        v.name ??
        `${v.firstName ?? ""} ${v.lastName ?? ""}`.trim() ??
        "",
    ),
    email: String(v.email ?? ""),
    mobile: String(v.phone ?? v.mobile ?? ""),
    address: String(v.venueAddress ?? v.address ?? ""),
    city: String(v.venueCity ?? v.city ?? ""),
    state: String(v.venueState ?? v.state ?? ""),
    country: String(v.venueCountry ?? v.country ?? ""),
    website: String(v.website ?? v.venueWebsite ?? ""),
    description: String(v.description ?? v.venueDescription ?? ""),
    maxCapacity: Number.isFinite(maxCap) ? maxCap : 0,
    totalHalls: Number.isFinite(halls) ? halls : 0,
    totalEvents: Number(v.totalEvents ?? 0),
    activeBookings: Number(v.activeBookings ?? 0),
    averageRating: Number.isFinite(avg) ? avg : 0,
    totalReviews: Number.isFinite(reviews) ? reviews : 0,
    amenities: Array.isArray(v.amenities) ? (v.amenities as string[]) : [],
    meetingSpaces: Array.isArray(v.meetingSpaces) ? (v.meetingSpaces as Venue["meetingSpaces"]) : [],
    isVerified,
    isActive,
    venueImages: Array.isArray(v.venueImages) ? (v.venueImages as string[]) : [],
    status: deriveVenueStatus(isVerified, isActive),
    createdAt: v.createdAt as string | undefined,
    updatedAt: v.updatedAt as string | undefined,
    rejectionReason: v.rejectionReason as string | undefined,
    events: Array.isArray(v.events) ? (v.events as Venue["events"]) : [],
  }
}
