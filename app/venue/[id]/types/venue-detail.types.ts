export interface VenueManager {
  id: string
  name: string
  email?: string
  phone?: string
  avatar?: string
  isVerified: boolean
  bio?: string
  website?: string
  venueName?: string
}

export interface VenueLocation {
  address: string
  city: string
  state: string
  country: string
  zipCode: string
  coordinates?: { lat: number; lng: number }
}

export interface VenueMeetingSpace {
  id: string
  name: string
  capacity: number
  area: number
  hourlyRate: number
  isAvailable: boolean
}

export interface VenueDetail {
  venueName: string
  id: string
  name: string
  description: string
  venueDescription: string
  venueAddress: string
  manager: VenueManager
  location: VenueLocation
  contact: {
    phone?: string
    email?: string
    website?: string
  }
  capacity?: { total: number; halls: number }
  pricing?: { basePrice: number; currency: string }
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
  meetingSpaces?: VenueMeetingSpace[]
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
    capacity: { max: number; current: number }
    organizer?: { name: string; organization: string }
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

export interface VenueResponse {
  success: boolean
  data: VenueDetail
}

export interface ReviewReply {
  id: string
  content: string
  createdAt: string
  isOrganizerReply?: boolean
  user?: { id: string; firstName: string; lastName: string; avatar?: string | null } | null
}

export interface VenueReview {
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

export interface TicketType {
  name: string
  price: number
}

export interface VenueEvent {
  eventType: string
  ticketTypes?: TicketType[]
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

export interface EventsResponse {
  success: boolean
  events: VenueEvent[]
}

export type ComputedEventStatus = "UPCOMING" | "ONGOING" | "PAST"
