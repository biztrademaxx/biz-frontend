/**
 * Event and category types for admin event management.
 * Use display helpers for organizer/category to avoid rendering objects in JSX.
 */

export interface EventOrganizer {
  id?: string
  name?: string
  email?: string
  company?: string
  phone?: string
}

export interface Event {
  country: import("react/jsx-runtime").JSX.Element
  // subHeading: string | undefined
  subTitle: string | undefined
  id: string
  title: string
  /** Normalized to string for display; backend may return object */
  organizer: string | EventOrganizer
  organizerId?: string
  date: string
  endDate: string
  location: string
  venue: string
  status: "Approved" | "Pending Review" | "Flagged" | "Rejected" | "Draft"
  attendees: number
  maxCapacity: number
  revenue?: number
  ticketPrice?: number
  category: string | string[]
  featured: boolean
  vip: boolean
  priority?: "High" | "Medium" | "Low"
  description?: string
  shortDescription?: string
  slug?: string
  edition?: string
  tags?: string[]
  eventType?: string
  timezone?: string
  currency?: string
  createdAt?: string
  lastModified?: string
  views?: number
  registrations?: number
  rating?: number
  reviews?: number
  image?: string
  bannerImage?: string
  thumbnailImage?: string
  images?: string[]
  videos?: string[]
  youtubeVideoUrl?: string | null
  brochure?: string
  layout?: string
  documents?: string[]
  isVerified: boolean
  verifiedAt: string | null
  verifiedBy: string | null
  verifiedBadgeImage: string | null
  /** Whether event is visible on public listings; from DB isPublic */
  isPublic?: boolean
}

export interface Category {
  id: string
  name: string
  icon?: string
  color?: string
  isActive: boolean
  eventCount?: number
}

/** Safe display string for organizer (object or string) */
export function getOrganizerDisplay(organizer: Event["organizer"]): string {
  if (typeof organizer === "string") return organizer
  if (organizer && typeof organizer === "object")
    return (organizer as EventOrganizer).name ?? (organizer as EventOrganizer).email ?? ""
  return "—"
}

/** Safe display string for category (string or array) */
export function getCategoryDisplay(category: Event["category"]): string {
  if (Array.isArray(category)) return category[0] ?? "—"
  return typeof category === "string" ? category : "—"
}
