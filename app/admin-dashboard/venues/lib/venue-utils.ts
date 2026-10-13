import type { PaginatedVenueList, Venue, VenueListingStatus } from "../types/venue.types"

function spaceCapacityFromRow(row: object): number {
  const r = row as Record<string, unknown>
  for (const key of ["capacity", "maxCapacity", "seatingCapacity", "maxAttendees"] as const) {
    if (!(key in r)) continue
    const n = Number(r[key])
    if (!Number.isNaN(n) && n > 0) return n
  }
  return 0
}

/** Align with public /venue page: sum per-space capacity; halls = meetingSpaces.length. */
export function inferCapacityAndHallsFromMeetingSpaces(meetingSpaces: unknown): {
  capacity: number
  halls: number
} {
  if (!Array.isArray(meetingSpaces) || meetingSpaces.length === 0) return { capacity: 0, halls: 0 }
  let capacity = 0
  for (const row of meetingSpaces) {
    if (row && typeof row === "object") capacity += spaceCapacityFromRow(row as object)
  }
  return { capacity, halls: meetingSpaces.length }
}

export function parseIsVerified(value: unknown): boolean {
  if (value === true || value === 1) return true
  if (typeof value === "string") return value.trim().toLowerCase() === "true"
  return false
}

export function parseIsActive(value: unknown): boolean {
  if (value === false || value === 0) return false
  if (typeof value === "string") return value.trim().toLowerCase() !== "false"
  return value !== false
}

export function deriveVenueStatus(
  isVerified: boolean,
  isActive: boolean,
): VenueListingStatus {
  if (!isVerified) return "pending"
  if (!isActive) return "suspended"
  return "active"
}

export function isApprovedVenue(venue: Venue): boolean {
  return venue.isVerified === true
}

export function venueMatchesSearch(venue: Venue, q: string): boolean {
  const term = q.trim().toLowerCase()
  if (!term) return true
  const blob = [
    venue.venueName,
    venue.contactPerson,
    venue.email,
    venue.mobile,
    venue.address,
    venue.city,
    venue.state,
    venue.country,
    venue.website,
    ...(venue.events?.map((e) => e.title) ?? []),
  ]
    .join(" ")
    .toLowerCase()
  return blob.includes(term)
}

export function paginateVenueList<T>(items: T[], page: number, perPage: number): PaginatedVenueList<T> {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / perPage) || 1)
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * perPage
  return {
    items: items.slice(start, start + perPage),
    total,
    totalPages,
    page: safePage,
    rangeStart: total === 0 ? 0 : start + 1,
    rangeEnd: Math.min(start + perPage, total),
  }
}
