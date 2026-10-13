export type VenueTab = "all" | "pending" | "active" | "bulk-import"

export type VenueListingStatus = "active" | "pending" | "suspended"

export type VenueCardAccent = "blue" | "amber" | "emerald"

export const VENUES_PER_PAGE = 10

export interface MeetingSpace {
  id: string
  name: string
  capacity: number
  area: number
  hourlyRate: number
  isAvailable: boolean
}

export interface VenueEvent {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  status: string
  category: string[]
  eventType: string[]
  isVirtual: boolean
  venueId: string
}

export interface Venue {
  id: string
  venueName: string
  logo: string
  contactPerson: string
  email: string
  mobile: string
  address: string
  city: string
  state: string
  country: string
  website: string
  description: string
  maxCapacity: number
  totalHalls: number
  totalEvents: number
  activeBookings: number
  averageRating: number
  totalReviews: number
  amenities: string[]
  meetingSpaces: MeetingSpace[]
  isVerified: boolean
  isActive: boolean
  venueImages: string[]
  status?: VenueListingStatus | string
  createdAt?: string
  updatedAt?: string
  rejectionReason?: string
  events: VenueEvent[]
}

export interface VenueEditFormData {
  venueName: string
  contactPerson: string
  email: string
  mobile: string
  address: string
  city: string
  state: string
  country: string
  website: string
  description: string
  maxCapacity: number
  totalHalls: number
  amenities: string[]
  logo?: string
  venueImages?: string[]
  isVerified?: boolean
  status?: string
}

export interface PaginatedVenueList<T> {
  items: T[]
  total: number
  totalPages: number
  page: number
  rangeStart: number
  rangeEnd: number
}
