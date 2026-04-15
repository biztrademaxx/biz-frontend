"use client"
import { useState, useMemo, useEffect, useCallback, type CSSProperties } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import {
  Search,
  MapPin,
  Calendar,
  Heart,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
  CalendarDays,
  UserPlus,
  X,
  Share2,
  Bookmark,
  Users,
  Globe,
  ShieldCheck,
} from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import AdCard from "@/components/add-card"
import { useToast } from "@/hooks/use-toast"
import { ShareButton } from "@/components/share-button"
import { isAuthenticated, getCurrentUserId, apiFetch } from "@/lib/api"
import { eventPublicPath } from "@/lib/event-path"
import { avatarUrlFromRecord } from "@/lib/user-avatar-url"
import { EventCardFollowStrip, type ListingFollowerFace } from "@/components/event-listing/EventCardFollowStrip"
import EventsListingPageSkeleton from "@/components/EventsListingPageSkeleton"
import {
  classifyExploreEventType,
  exploreKeyFromFormatName,
  exploreKeyFromQueryParam,
  formatNameFromExploreKey,
} from "@/lib/explore-event-types"
import { normalizeBrowseCategory } from "@/lib/categories/normalize-browse-category"

// Use Next.js API (same-origin) to avoid CORS; API route proxies to backend when needed
const EVENTS_API = "/api/events"

/**
 * Listing hero gradient — matches navbar navy system: deep hover blue → primary #002C71 → slate #1F5D84
 * (same as `navbar.tsx` `bg-[#002C71]` / `hover:bg-[#001a48]` and listing link color #1F5D84).
 */
const EVENTS_LISTING_BANNER_GRADIENT =
  "linear-gradient(118deg, #001a48 0%, #002C71 42%, #163d5c 68%, #1F5D84 100%)"
/**
 * Same navy family over category background art — no orange so it stays on-brand with the nav.
 */
const EVENTS_LISTING_BANNER_GRADIENT_OVER_IMAGE =
  "linear-gradient(118deg, rgba(0, 26, 72, 0.78) 0%, rgba(0, 44, 113, 0.64) 45%, rgba(22, 61, 92, 0.58) 72%, rgba(31, 93, 132, 0.62) 100%)"

function normalizeListingFollowerPreview(rawEvent: Record<string, unknown>): ListingFollowerFace[] {
  const raw = rawEvent.followerPreview ?? rawEvent.goingPreview ?? rawEvent.followersPreview
  if (!Array.isArray(raw)) return []
  return raw.slice(0, 3).map((item: unknown) => {
    if (!item || typeof item !== "object") return {}
    const row = item as Record<string, unknown>
    const nested =
      row.user && typeof row.user === "object" && !Array.isArray(row.user)
        ? (row.user as Record<string, unknown>)
        : {}
    const merged: Record<string, unknown> = { ...row, ...nested }
    const photo = avatarUrlFromRecord(merged)
    return {
      avatar: photo,
      image: null,
      firstName:
        (typeof merged.firstName === "string" ? merged.firstName : null) ??
        (typeof merged.first_name === "string" ? merged.first_name : null),
      lastName:
        (typeof merged.lastName === "string" ? merged.lastName : null) ??
        (typeof merged.last_name === "string" ? merged.last_name : null),
      name: typeof merged.name === "string" ? merged.name : typeof row.name === "string" ? row.name : null,
      displayName:
        (typeof merged.displayName === "string" ? merged.displayName : null) ??
        (typeof merged.display_name === "string" ? merged.display_name : null),
    }
  })
}

interface Event {
  image: string
  organizer: any
  id: string
  title: string
  /** Short listing line; falls back to truncated title in trending card when empty. */
  subTitle?: string | null
  description: string
  startDate: string
  endDate: string
  eventType: string
  categories: string[]
  tags: string[]
  images: { url: string }[]
  location: {
    address: string
    city: string
    venue: string
    country?: string
  }
  venue?: {
    venueAddress?: string
    venueCity?: string
    venueCountry?: string
    venueName?: string
  }
  pricing: {
    general: number
  }
  rating: {
    average: number
  }
  featured?: boolean
  status: string
  timings: {
    [x: string]: string
    startDate: string
    endDate: string
  }
  averageRating?: number
  totalReviews?: number
  isVerified?: boolean
  verifiedAt?: string
  verifiedBy?: string
  /** Verified badge graphic URL from API (`verifiedBadgeImage`); listing shows it top-right above the thumbnail. */
  verifiedBadgeImage?: string | null
  slug?: string | null
  ticketTypes?: unknown[]
  followerPreview?: ListingFollowerFace[]
  followersCount?: number
}

function formatTrendingEventDateRange(startDate: string, endDate?: string | null): string {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : start
  const sameDay =
    start.getDate() === end.getDate() &&
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()

  const single = (d: Date) =>
    d.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })

  if (sameDay) return single(start)

  const wkS = start.toLocaleDateString("en-US", { weekday: "short" })
  const wkE = end.toLocaleDateString("en-US", { weekday: "short" })
  const dS = start.getDate()
  const dE = end.getDate()
  const mS = start.toLocaleDateString("en-US", { month: "short" })
  const mE = end.toLocaleDateString("en-US", { month: "short" })
  const yS = start.getFullYear()
  const yE = end.getFullYear()

  if (yS === yE && start.getMonth() === end.getMonth()) {
    return `${wkS}, ${dS} - ${wkE}, ${dE} ${mS} ${yS}`
  }
  if (yS === yE) {
    return `${wkS}, ${dS} ${mS} - ${wkE}, ${dE} ${mE} ${yS}`
  }
  return `${wkS}, ${dS} ${mS} ${yS} - ${wkE}, ${dE} ${mE} ${yE}`
}

function formatMembersShort(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0"
  if (n >= 1_000_000) {
    const v = n / 1_000_000
    return `${v >= 10 ? v.toFixed(0) : v.toFixed(1).replace(/\.0$/, "")}M`
  }
  if (n >= 1_000) {
    const k = n / 1_000
    return `${k >= 10 ? k.toFixed(0) : k.toFixed(1).replace(/\.0$/, "")}k`
  }
  return String(Math.round(n))
}

function trendingCardSubtitle(event: Event): string {
  const raw = typeof event.subTitle === "string" ? event.subTitle.trim() : ""
  if (raw) return raw.length > 90 ? `${raw.slice(0, 87)}…` : raw
  const t = (event.title || "").trim()
  if (t.length <= 48) return t
  return `${t.slice(0, 45)}…`
}

function trendingLocationLine(event: Event): string {
  const loc = event.location
  if (loc?.city && loc.city !== "City not specified") {
    const country = loc.country && loc.country !== "Country not specified" ? loc.country : ""
    return country ? `${loc.city}, ${country}` : loc.city
  }
  if (loc?.venue && loc.venue !== "Venue not specified") return loc.venue
  if (loc?.address && loc.address !== "Address not available") return loc.address
  if (loc?.country && loc.country !== "Country not specified") return loc.country
  return "Location TBD"
}

function normalizeEventFormatName(event: Pick<Event, "eventType" | "categories">): string {
  let formatName = ""
  if (event.eventType && typeof event.eventType === "string") {
    formatName = event.eventType.trim()
  } else if (event.categories && Array.isArray(event.categories) && event.categories.length > 0) {
    const firstCategory = event.categories[0]
    if (typeof firstCategory === "string") {
      formatName = firstCategory.trim()
    }
  }
  if (!formatName) {
    return "Other"
  }
  const normalizedFormat = formatName.toLowerCase()
  if (normalizedFormat.includes("trade show") || normalizedFormat.includes("tradeshow")) {
    return "Exhibition"
  }
  if (normalizedFormat.includes("conference")) {
    return "Conference"
  }
  if (normalizedFormat.includes("workshop") || normalizedFormat.includes("workshops")) {
    return "Workshops"
  }
  if (normalizedFormat.includes("exhibition") || normalizedFormat.includes("expo")) {
    return "Exhibition"
  }
  if (normalizedFormat.includes("seminar")) {
    return "Seminar"
  }
  if (normalizedFormat.includes("meetup") || normalizedFormat.includes("meeting")) {
    return "Meetup"
  }
  return formatName
}

function TrendingEventsSideCard({ event, imageUrl }: { event: Event; imageUrl: string }) {
  const path = eventPublicPath(event)
  const followers = typeof event.followersCount === "number" ? event.followersCount : 0
  const subtitle = trendingCardSubtitle(event)

  return (
    <Link href={path} className="group block">
      <article className="mb-3 rounded-sm border border-gray-100 bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.08),0_4px_20px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
        <div className="mb-1.5 flex items-center justify-end gap-1.5 text-xs font-medium leading-none text-gray-800">
          <span className="h-3.5 w-3.5 shrink-0 rounded-sm bg-amber-400" aria-hidden />
          <span>Trending</span>
        </div>
        <p className="mb-1 text-xs font-medium leading-tight text-gray-800">
          {formatTrendingEventDateRange(event.timings.startDate, event.timings.endDate)}
        </p>
        <div className="relative pr-14">
          <p className="line-clamp-2 pr-1 text-sm font-bold leading-snug text-[#1F5D84] group-hover:underline">
            {subtitle}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={event.title}
            className="absolute right-0 top-0 h-12 w-12 rounded-sm border border-gray-100 object-cover"
          />
        </div>
        <p className="mt-1 text-xs font-semibold leading-tight text-gray-900 line-clamp-1">
          {trendingLocationLine(event)}
        </p>
        {(event.categories?.length ?? 0) > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1 overflow-hidden max-h-[1.5rem]">
            {event.categories.slice(0, 2).map((cat) => (
              <span
                key={cat}
                className="inline-block max-w-[7.5rem] truncate rounded bg-gray-100 px-1.5 py-0.5 text-[11px] leading-none text-gray-600"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
        <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
          <span className="inline-flex items-center gap-1 text-xs text-gray-700">
            <Users className="h-3.5 w-3.5 shrink-0 text-gray-600" aria-hidden />
            {formatMembersShort(followers)} Members
          </span>
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors group-hover:bg-gray-200"
            aria-hidden
          >
            <Bookmark className="h-3.5 w-3.5" fill="currentColor" />
          </span>
        </div>
      </article>
    </Link>
  )
}

interface ApiResponse {
  events: Event[]
}
// Enhanced Verified Badge Component for public display
function SidebarSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="
          w-full flex items-center justify-between
          px-4 py-3
          text-sm font-semibold
          text-gray-400
          hover:text-red-600
          transition-colors
        "
      >
        <span>{title}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform text-green-700 ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      {open && <div className="pb-2">{children}</div>}
    </div>
  )
}

function SidebarCheckboxRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string
  count?: number
  checked: boolean
  onChange: () => void
}) {
  return (
    <div
      onClick={onChange}
      className={`
        flex items-center justify-between
        px-4 py-2 text-sm cursor-pointer
        rounded-md
        transition-colors
        hover:text-red-500
        ${checked
          ? "bg-green-50 text-red-500"
          : "text-gray-800 hover:bg-green-50"
        }
      `}
    >
      <div className="flex items-center gap-3 min-w-0">
        <input
          type="checkbox"
          checked={checked}
          readOnly
          className="w-4 h-4 accent-green-600"
        />
        <span
          className={`truncate ${checked ? "font-semibold" : "font-normal"
            }`}
        >
          {label}
        </span>
      </div>

      {typeof count === "number" && (
        <span className="text-xs text-gray-500">{count}</span>
      )}
    </div>
  )
}




function coerceEventVerified(raw: unknown): boolean {
  if (raw === true || raw === 1) return true
  if (typeof raw === "string") {
    const s = raw.trim().toLowerCase()
    return s === "true" || s === "1" || s === "yes" || s === "verified"
  }
  return false
}

function verifiedBadgeSrc(event: Event): string | null {
  const raw = event.verifiedBadgeImage
  if (typeof raw !== "string") return null
  const t = raw.trim()
  return t.length > 0 ? t : null
}

/** Verified listing mark: uses uploaded badge image only; text fallback if no URL or image fails. */
function EventListingVerifiedBadge({
  event,
  className = "",
}: {
  event: Event
  className?: string
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const src = verifiedBadgeSrc(event)

  useEffect(() => {
    setImgFailed(false)
  }, [event.id, src])

  const onImgError = useCallback(() => {
    setImgFailed(true)
  }, [])

  if (!event.isVerified) return null

  const showImg = src && !imgFailed

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 ${className}`}
      title="Verified event"
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
     <img
  src={src}
  alt="Verified"
  className="h-6 max-h-6 w-auto max-w-[80px] object-contain object-left"
  onError={onImgError}
/>
      ) : (
        <span className="text-[11px] font-bold leading-none text-emerald-800 sm:text-xs">Verified</span>
      )}
    </span>
  )
}

const LISTING_DEFAULT_EVENT_IMAGE = "/city/c4.jpg"

/** Collect unique image URLs for listing carousel (strings or `{ url }` from API). */
function normalizeEventImageUrls(event: any): string[] {
  const out: string[] = []
  const seen = new Set<string>()

  const push = (raw: unknown) => {
    if (raw == null) return
    let s: string | null = null
    if (typeof raw === "string" && raw.trim()) s = raw.trim()
    else if (typeof raw === "object" && "url" in (raw as object)) {
      const u = (raw as { url: unknown }).url
      if (typeof u === "string" && u.trim()) s = u.trim()
    }
    if (s && !seen.has(s)) {
      seen.add(s)
      out.push(s)
    }
  }

  if (Array.isArray(event.images)) {
    for (const item of event.images) push(item)
  }
  push(event.image)
  push(event.bannerImage)
  push(event.thumbnailImage)

  if (out.length === 0) return [LISTING_DEFAULT_EVENT_IMAGE]
  return out
}

/** Listing thumbnail: single image, or auto-sliding carousel every 5s when multiple URLs. */
function EventListingCardImages({
  href,
  urls,
  title,
}: {
  href: string
  urls: string[]
  title: string
}) {
  const [index, setIndex] = useState(0)
  const count = urls.length
  const key = urls.join("|")

  useEffect(() => {
    setIndex(0)
  }, [key])

  useEffect(() => {
    if (count <= 1) return
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % count)
    }, 5000)
    return () => window.clearInterval(t)
  }, [count, key])

  const viewportClass =
    "relative mx-auto h-[84px] w-full max-w-lg overflow-hidden rounded-sm bg-slate-100 md:mx-0 md:h-[84px] md:w-[136px] md:max-w-none"

  const carouselDots = (
    <div
      className="flex min-h-[14px] items-center justify-center gap-1 px-1"
      role={count > 1 ? "tablist" : undefined}
      aria-label={count > 1 ? `${title} photos` : undefined}
    >
      {count > 1
        ? urls.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F5D84] focus-visible:ring-offset-1 ${
                i === index ? "w-4 bg-slate-700" : "w-1.5 bg-slate-300 hover:bg-slate-400"
              }`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIndex(i)
              }}
            />
          ))
        : null}
    </div>
  )

  if (count <= 1) {
    return (
      <>
        <Link href={href} className="block">
          <div className={viewportClass}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={urls[0]} alt={title} className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </Link>
        {carouselDots}
      </>
    )
  }

  return (
    <>
      <Link href={href} className="block">
        <div className={viewportClass}>
          <div
            className="flex h-full transition-transform duration-500 ease-out"
            style={{
              width: `${count * 100}%`,
              transform: `translateX(-${index * (100 / count)}%)`,
            }}
          >
            {urls.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="h-full shrink-0"
                style={{ width: `${100 / count}%` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={i === 0 ? title : ""}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </Link>
      {carouselDots}
    </>
  )
}

export type EventsPageContentProps = {
  /** From RSC: category names + icon URLs so the banner matches DB on first paint (no default-image flash). */
  initialBrowseCategoryMeta?: Array<{ name: string; icon: string | null }>
}

export default function EventsPageContent({
  initialBrowseCategoryMeta: initialBrowseCategoryMetaProp = [],
}: EventsPageContentProps) {
  const [activeTab, setActiveTab] = useState("All Events")
  const [selectedFormat, setSelectedFormat] = useState("All Formats")
  const [selectedLocation, setSelectedLocation] = useState("")
  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get("category")
  const typeFromUrl = searchParams.get("type")
  /** Primitives for URL-sync effect — `searchParams` in deps can change identity every render and retrigger. */
  const locationQ = searchParams.get("location")
  const countryQ = searchParams.get("country")
  const venueQ = searchParams.get("venue")
  const searchQ = searchParams.get("search")
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || "All Events")

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDateRange, setSelectedDateRange] = useState("")
  const [priceRange, setPriceRange] = useState("")
  const [rating, setRating] = useState("")

  const [calendarOpen, setCalendarOpen] = useState(true)
  const [formatOpen, setFormatOpen] = useState(true)
  const [locationOpen, setLocationOpen] = useState(true)
  const [categoryOpen, setCategoryOpen] = useState(true)
  const [relatedTopicOpen, setRelatedTopicOpen] = useState(true)
  const [entryFeeOpen, setEntryFeeOpen] = useState(true)
  const [categorySearch, setCategorySearch] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedRelatedTopics, setSelectedRelatedTopics] = useState<string[]>([])
  const [showAllCategories, setShowAllCategories] = useState(false)

  /** EventCategory rows from backend (name + optional icon URL) for listing banner — seeded from server */
  const [browseCategoryMeta, setBrowseCategoryMeta] = useState<Array<{ name: string; icon: string | null }>>(
    () => initialBrowseCategoryMetaProp,
  )

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const [visitorCounts, setVisitorCounts] = useState<Record<string, number>>({})
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("visitorCounts") : null
      if (raw) setVisitorCounts(JSON.parse(raw))
    } catch (e) {
      console.log("[v0] Failed to load visitorCounts:", e)
    }
  }, [])

  const persistVisitorCounts = (next: Record<string, number>) => {
    setVisitorCounts(next)
    try {
      localStorage.setItem("visitorCounts", JSON.stringify(next))
    } catch (e) {
      console.log("[v0] Failed to persist visitorCounts:", e)
    }
  }

  const incrementVisitorCount = (eventId: string) => {
    if (!eventId) return
    const next = { ...visitorCounts, [eventId]: (visitorCounts[eventId] || 0) + 1 }
    persistVisitorCounts(next)
  }

  const { toast } = useToast()
  const router = useRouter()
  const userId = getCurrentUserId()
  const isLoggedIn = isAuthenticated()

  const DEFAULT_EVENT_IMAGE = LISTING_DEFAULT_EVENT_IMAGE

  const getEventImage = (event: any) => {
    const image = event.images?.[0] || event.image || DEFAULT_EVENT_IMAGE
    if (typeof image === "string") {
      return image
    } else if (image && typeof image === "object" && image.url) {
      return image.url
    }
    return DEFAULT_EVENT_IMAGE
  }


  const handlePageChange = (page: number) => {
    // Allow first page without login
    if (page === 1) {
      setCurrentPage(1)
      return
    }

    // Block if not logged in
    if (!isLoggedIn) {
      toast({
        title: "Login required",
        description: "Please log in to view more events.",
        variant: "destructive",
      })

      router.push("/login")
      return
    }

    // Logged in → allow pagination
    setCurrentPage(page)
  }

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(EVENTS_API)
      if (!response.ok) {
        throw new Error("Failed to fetch events")
      }
      const data: ApiResponse = await response.json()
      const transformedEvents = data.events.map((event: any) => {
        const resolvedId =
          event.id ||
          event._id ||
          (typeof event._id === "object" && event._id.$oid) ||
          (typeof event._id === "string" ? event._id : undefined)
        const avg =
          typeof event?.averageRating === "number" && Number.isFinite(event.averageRating)
            ? event.averageRating
            : typeof event?.rating?.average === "number" && Number.isFinite(event.rating.average)
              ? event.rating.average
              : 0
        const categories = Array.isArray(event.category)
          ? event.category
          : Array.isArray(event.categories)
            ? event.categories
            : []

        let address = "Address not available"
        let city = "City not specified"
        let venue = "Venue not specified"
        let country = "Country not specified"

        if (event.venue?.venueAddress) {
          address = event.venue.venueAddress
        } else if (event.location?.address) {
          address = event.location.address
        } else if (event.address) {
          address = event.address
        }

        if (event.venue?.venueCity) {
          city = event.venue.venueCity
        } else if (event.location?.city) {
          city = event.location.city
        } else if (event.city) {
          city = event.city
        }

        if (event.venue?.venueName) {
          venue = event.venue.venueName
        } else if (event.location?.venue) {
          venue = event.location.venue
        } else if (event.venue) {
          venue = typeof event.venue === "string" ? event.venue : "Venue"
        }

        if (event.venue?.venueCountry) {
          country = event.venue.venueCountry
        } else if (event.location?.country) {
          country = event.location.country
        } else if (event.country) {
          country = event.country
        }

        const evRec = event as Record<string, unknown>
        const countBlock = evRec._count as { savedEvents?: number } | undefined
        let followersCount = typeof event.followersCount === "number" ? event.followersCount : 0
        if (followersCount === 0 && typeof countBlock?.savedEvents === "number") {
          followersCount = countBlock.savedEvents
        }

        const verifiedFlag =
          coerceEventVerified(event.isVerified) ||
          coerceEventVerified(event.verified) ||
          coerceEventVerified(evRec.verificationStatus)

        const subTitleRaw = event.subTitle ?? event.subtitle ?? event.shortDescription
        const subTitle =
          typeof subTitleRaw === "string" && subTitleRaw.trim() ? subTitleRaw.trim() : null

        return {
          ...event,
          id: String(resolvedId || ""),
          slug: typeof event.slug === "string" ? event.slug : null,
          subTitle,
          eventType: event.eventType || categories?.[0] || "Other",
          timings: {
            startDate: event.startDate,
            endDate: event.endDate,
          },
          location: {
            address: address,
            city: city,
            venue: venue,
            country: country,
          },
          venue: event.venue || {
            venueAddress: address,
            venueCity: city,
            venueCountry: country,
          },
          ticketTypes: Array.isArray(event.ticketTypes) ? event.ticketTypes : [],
          followerPreview: normalizeListingFollowerPreview(evRec),
          followersCount,
          featured: event.tags?.includes("featured") || false,
          categories: categories,
          tags: event.tags || [],
          images: event.images || ["/images/gpex.jpg"],
          pricing: event.pricing || { general: 0 },
          rating: { average: avg },
          totalReviews: typeof event?.totalReviews === "number" ? event.totalReviews : undefined,
          isVerified: verifiedFlag,
          verifiedAt: event.verifiedAt || null,
          verifiedBy: event.verifiedBy || null,
          verifiedBadgeImage:
            typeof event.verifiedBadgeImage === "string" && event.verifiedBadgeImage.trim()
              ? event.verifiedBadgeImage.trim()
              : null,
        }
      })
      setEvents(transformedEvents)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("[v0] Error fetching events:", err)
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await apiFetch<{ success?: boolean; categories?: unknown[] }>(
          "/api/events/categories/browse",
          { auth: false },
        )
        if (cancelled) return
        if (data?.success === false || !Array.isArray(data?.categories)) return
        const rows: Array<{ name: string; icon: string | null }> = []
        for (const raw of data.categories) {
          const c = normalizeBrowseCategory(raw)
          if (c) rows.push({ name: c.name, icon: c.icon })
        }
        setBrowseCategoryMeta(rows)
      } catch {
        /* keep default banner */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
    }
    if (locationQ) {
      setSelectedLocation(locationQ)
    }
    if (countryQ) {
      setSelectedLocation(countryQ)
    }
    if (venueQ) {
      setSelectedLocation(venueQ)
    }
    if (searchQ) {
      setSearchQuery(searchQ)
    }
    const exploreKey = exploreKeyFromQueryParam(typeFromUrl)
    if (exploreKey) {
      setSelectedFormat(formatNameFromExploreKey(exploreKey))
    }
  }, [categoryFromUrl, typeFromUrl, locationQ, countryQ, venueQ, searchQ])

  const handleVisitClick = async (eventId: string, eventTitle: string) => {
    if (!eventId) {
      toast({
        title: "Invalid event",
        description: "We could not identify this event. Please refresh and try again.",
        variant: "destructive",
      })
      return
    }

    incrementVisitorCount(eventId)

    if (!isLoggedIn || !userId) {
      try {
        alert(`Authentication Required\nPlease log in to visit "${eventTitle}".`)
      } catch {
        toast({
          title: "Authentication required",
          description: "Please log in to continue.",
          variant: "destructive",
        })
      }
      router.push("/login")
      return
    }

    try {
      await apiFetch(`/api/events/${eventId}/leads`, {
        method: "POST",
        body: { type: "attendee", eventId },
        auth: true,
      })
      toast({
        title: "Visit recorded",
        description: `Thanks for visiting "${eventTitle}".`,
      })
    } catch (error) {
      console.error("[v0] Visit lead error:", error)
      toast({
        title: "Error",
        description: "Failed to record your interest. Your local visit counter was still updated.",
        variant: "destructive",
      })
    }
  }

  const itemsPerPage = 6

  const categories = useMemo(() => {
    if (!events || events.length === 0) return []
    const categoryMap = new Map<string, number>()
    events.forEach((event) => {
      if (event.categories && Array.isArray(event.categories)) {
        event.categories.forEach((category) => {
          if (category && typeof category === "string") {
            const normalized = category.trim()
            if (normalized) {
              categoryMap.set(normalized, (categoryMap.get(normalized) || 0) + 1)
            }
          }
        })
      }
    })

    if (categoryMap.size > 0) {
      return Array.from(categoryMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    }

    const hardcodedCategories = [
      "All Events",
      "Education Training",
      "Medical & Pharma",
      "IT & Technology",
      "Banking & Finance",
      "Business Services",
      "Industrial Engineering",
      "Building & Construction",
      "Power & Energy",
      "Entertainment & Media",
      "Wellness, Health & Fitness",
    ]

    return hardcodedCategories
      .map((categoryName) => {
        const count = events.filter((event) => {
          if (!event.categories || !Array.isArray(event.categories)) return false
          return event.categories.some((cat) => {
            if (!cat || typeof cat !== "string") return false
            return cat.toLowerCase().includes(categoryName.toLowerCase())
          })
        }).length
        return { name: categoryName, count }
      })
      .filter((cat) => cat.count > 0)
  }, [events])

  const formats = useMemo(() => {
    const formatMap = new Map<string, number>()
    formatMap.set("All Formats", events.length)
    events.forEach((event) => {
      const formatName = normalizeEventFormatName(event)
      formatMap.set(formatName, (formatMap.get(formatName) || 0) + 1)
    })
    const allFormatsCount = formatMap.get("All Formats") || 0
    formatMap.delete("All Formats")
    const formatArray = Array.from(formatMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
    return [{ name: "All Formats", count: allFormatsCount }, ...formatArray]
  }, [events])

  const locations = useMemo(() => {
    if (!events || events.length === 0) return []
    const locationMap = new Map<string, number>()
    events.forEach((event) => {
      let locationKey = ""
      if (event.venue?.venueCity) {
        locationKey = event.venue.venueCity.trim()
      } else if (event.location?.city) {
        locationKey = event.location.city.trim()
      } else if (event.venue?.venueCountry) {
        locationKey = event.venue.venueCountry.trim()
      } else if (event.location?.address) {
        const addressParts = event.location.address.split(",")
        locationKey = addressParts[0]?.trim() || "Unknown"
      }
      if (locationKey && locationKey !== "Not Added" && locationKey !== "Unknown") {
        locationMap.set(locationKey, (locationMap.get(locationKey) || 0) + 1)
      }
    })
    return Array.from(locationMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count
        }
        return a.name.localeCompare(b.name)
      })
  }, [events])

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => category.name.toLowerCase().includes(categorySearch.toLowerCase()))
  }, [categories, categorySearch])

  const relatedTopics = useMemo(() => {
    return categories.map((cat) => ({ ...cat, name: `${cat.name} Related` }))
  }, [categories])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isEventOnDate = (event: Event, date: Date) => {
    const eventStartDate = new Date(event.timings.startDate)
    const eventEndDate = new Date(event.timings.endDate)
    return (
      date >= new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate()) &&
      date <= new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate())
    )
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setCalendarOpen(false)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const clearDateFilter = () => {
    setSelectedDate(null)
    setSelectedDateRange("")
  }

  const clearLocationFilter = () => {
    setSelectedLocation("")
  }

  const clearFormatFilter = () => {
    setSelectedFormat("All Formats")
  }

  const isEventInDateRange = (event: any, dateRange: string) => {
    const eventDate = new Date(event.timings.startDate)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())

    switch (dateRange) {
      case "today":
        return eventDate >= today && eventDate < tomorrow
      case "tomorrow":
        return eventDate >= tomorrow && eventDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
      case "this-week":
        return eventDate >= today && eventDate <= weekFromNow
      case "this-month":
        return eventDate >= today && eventDate <= monthFromNow
      case "next-month":
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
        const monthAfter = new Date(today.getFullYear(), today.getMonth() + 2, 1)
        return eventDate >= nextMonth && eventDate < monthAfter
      default:
        return true
    }
  }

  const isEventInTab = (event: any, tab: string) => {
    const eventDate = new Date(event.timings.startDate)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())

    switch (tab) {
      case "All Events":
        return true
      case "Upcoming":
        return eventDate >= today
 
      case "This Week":
        return eventDate >= today && eventDate <= weekFromNow
      case "This Month":
        return eventDate >= today && eventDate <= monthFromNow
      default:
        return true
    }
  }

  // Filter events to show only verified events
  const verifiedEvents = useMemo(() => {
    return events.filter(event => event.isVerified)
  }, [events])

  // Filter events with verified filter
  const filteredEvents = useMemo(() => {
    let filtered = events

    filtered = filtered.filter((event) => isEventInTab(event, activeTab))

    // Show only verified events if "Verified" tab is selected
    if (activeTab === "Verified") {
      filtered = filtered.filter(event => event.isVerified)
    }

    if (selectedDate) {
      filtered = filtered.filter((event) => isEventOnDate(event, selectedDate))
    }

    if (selectedDateRange && !selectedDate) {
      filtered = filtered.filter((event) => isEventInDateRange(event, selectedDateRange))
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          event.categories.some((cat) => cat.toLowerCase().includes(query)) ||
          event.venue?.venueCity?.toLowerCase().includes(query) ||
          event.venue?.venueCountry?.toLowerCase().includes(query) ||
          event.location?.city?.toLowerCase().includes(query),
      )
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((event) =>
        event.categories?.some((cat) =>
          selectedCategories.some((selectedCat) => cat.toLowerCase().trim() === selectedCat.toLowerCase().trim()),
        ),
      )
    } else if (selectedCategory && selectedCategory !== "All Events") {
      filtered = filtered.filter((event) =>
        event.categories?.some((cat) => cat.toLowerCase().trim() === selectedCategory.toLowerCase().trim()),
      )
    }

    if (selectedRelatedTopics.length > 0) {
      const relatedCats = selectedRelatedTopics.map((topic) => topic.replace(" Related", ""))
      filtered = filtered.filter((event) => event.categories.some((cat) => relatedCats.includes(cat)))
    }

    if (selectedLocation) {
      filtered = filtered.filter((event) => {
        const searchTerm = selectedLocation.toLowerCase()
        const venueCity = event.venue?.venueCity?.toLowerCase() || ""
        const venueCountry = event.venue?.venueCountry?.toLowerCase() || ""
        const eventCity = event.location?.city?.toLowerCase() || ""
        const eventAddress = event.location?.address?.toLowerCase() || ""
        return (
          venueCity.includes(searchTerm) ||
          venueCountry.includes(searchTerm) ||
          eventCity.includes(searchTerm) ||
          eventAddress.includes(searchTerm)
        )
      }
      )
    }

    if (selectedFormat && selectedFormat !== "All Formats") {
      const wantKey = exploreKeyFromFormatName(selectedFormat)
      filtered = filtered.filter((event) => {
        const normalizedEventFormat = normalizeEventFormatName(event)
        if (normalizedEventFormat.toLowerCase() === selectedFormat.toLowerCase().trim()) {
          return true
        }
        const eventKey = classifyExploreEventType(event.eventType || event.categories?.[0])
        if (wantKey && eventKey) return eventKey === wantKey
        return false
      })
    }

    if (priceRange) {
      filtered = filtered.filter((event) => {
        const price = event.pricing.general
        switch (priceRange) {
          case "free":
            return price === 0
          case "under-1000":
            return price < 1000
          case "1000-5000":
            return price >= 1000 && price <= 5000
          case "above-5000":
            return price > 5000
          default:
            return true
        }
      })
    }

    if (rating) {
      const minRating = Number.parseFloat(rating)
      filtered = filtered.filter((event) => event.rating.average >= minRating)
    }

    return filtered
  }, [
    events,
    activeTab,
    selectedDate,
    selectedDateRange,
    searchQuery,
    selectedCategory,
    selectedCategories,
    selectedRelatedTopics,
    selectedLocation,
    selectedFormat,
    priceRange,
    rating,
  ])

  const categoryBannerImageUrl = useMemo(() => {
    if (browseCategoryMeta.length === 0) return null
    const names: string[] =
      selectedCategories.length > 0
        ? selectedCategories.map((n) => n.trim()).filter(Boolean)
        : selectedCategory && selectedCategory !== "All Events"
          ? [selectedCategory.trim()].filter(Boolean)
          : []
    for (const name of names) {
      const lower = name.toLowerCase()
      const hit = browseCategoryMeta.find((c) => c.name.toLowerCase() === lower)
      const url = hit?.icon?.trim()
      if (url) return url
    }
    return null
  }, [browseCategoryMeta, selectedCategories, selectedCategory])

  const listingBannerSurfaceStyle = useMemo((): CSSProperties => {
    if (categoryBannerImageUrl) {
      const u = JSON.stringify(categoryBannerImageUrl)
      return {
        backgroundImage: `${EVENTS_LISTING_BANNER_GRADIENT_OVER_IMAGE}, url(${u})`,
        backgroundSize: "cover, cover",
        backgroundPosition: "center, center",
        backgroundRepeat: "no-repeat, no-repeat",
      }
    }
    return {
      backgroundImage: EVENTS_LISTING_BANNER_GRADIENT,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }
  }, [categoryBannerImageUrl])

  const getBannerTitle = () => {
    if (selectedDate) {
      return `Events on ${selectedDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`
    }
    if (selectedCategories.length > 0) {
      return `${selectedCategories.join(", ")} Events`
    }
    if (selectedCategory) {
      return `${selectedCategory}`
    }
    if (selectedLocation) {
      return `Events in ${selectedLocation}`
    }
    if (searchQuery) {
      return `Search Results for "${searchQuery}"`
    }
    if (activeTab === "Verified") {
      return "Verified Events"
    }
    if (activeTab !== "All Events") {
      return `${activeTab} Events`
    }
    return "Education & Training Events"
  }

  const getFollowerCount = () => {
    const total = filteredEvents.reduce(
      (sum, ev) => sum + (typeof (ev as any).followersCount === "number" ? (ev as any).followersCount : 0),
      0
    )
    if (total >= 1000) return `${(total / 1000).toFixed(1).replace(/\.0$/, "")}K Followers`
    return `${total} Followers`
  }

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage)
  const paginatedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const featuredEvents = events.filter((event) => event.featured)

  const trendingSidebarEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => {
        const aCount = typeof a.followersCount === "number" ? a.followersCount : 0
        const bCount = typeof b.followersCount === "number" ? b.followersCount : 0
        return bCount - aCount
      })
      .slice(0, 5)
  }, [events])

  useEffect(() => {
    if (featuredEvents.length === 0 || isHovered || isTransitioning) return
    const totalSlides = Math.ceil(featuredEvents.length / 3)
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setCurrentSlide((prev) => (prev + 1) % totalSlides)
    }, 3000)
    return () => clearInterval(interval)
  }, [featuredEvents.length, isHovered, isTransitioning])

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isTransitioning])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
  }

  // FIXED: Properly calculate hasActiveFilters
  const hasActiveFilters = useMemo(() => {
    const hasSearchQuery = searchQuery.trim().length > 0
    const hasSelectedDate = selectedDate !== null
    const hasSelectedDateRange = selectedDateRange.trim().length > 0
    const hasSelectedLocation = selectedLocation.trim().length > 0
    const hasSelectedFormat = selectedFormat !== "All Formats"
    const hasSelectedCategory = selectedCategory !== "All Events" && selectedCategory.trim().length > 0
    const hasSelectedCategories = selectedCategories.length > 0
    const hasSelectedRelatedTopics = selectedRelatedTopics.length > 0
    const hasPriceRange = priceRange.trim().length > 0
    const hasRating = rating.trim().length > 0
    const hasActiveTab = activeTab !== "All Events"

    return (
      hasSearchQuery ||
      hasSelectedDate ||
      hasSelectedDateRange ||
      hasSelectedLocation ||
      hasSelectedFormat ||
      hasSelectedCategory ||
      hasSelectedCategories ||
      hasSelectedRelatedTopics ||
      hasPriceRange ||
      hasRating ||
      hasActiveTab
    )
  }, [
    searchQuery,
    selectedDate,
    selectedDateRange,
    selectedLocation,
    selectedFormat,
    selectedCategory,
    selectedCategories,
    selectedRelatedTopics,
    priceRange,
    rating,
    activeTab
  ])

  const formatYear = (date: string) =>
    new Date(date).getFullYear()

  const tabs = ["All Events", "Upcoming",  "This Week", "This Month", "Verified"] // Added Verified tab

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
      return newCategories
    })
    setCurrentPage(1)
  }

  const handleRelatedTopicToggle = (topicName: string) => {
    setSelectedRelatedTopics((prev) =>
      prev.includes(topicName) ? prev.filter((t) => t !== topicName) : [...prev, topicName],
    )
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedCategory("All Events")
    setSelectedCategories([])
    setSelectedRelatedTopics([])
    setSelectedLocation("")
    setSelectedDate(null)
    setSelectedDateRange("")
    setSelectedFormat("All Formats")
    setPriceRange("")
    setRating("")
    setActiveTab("All Events")
    setCurrentPage(1)
    router.push("/event")
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth)
    const days = []

    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    const daysInPrevMonth = getDaysInPrevMonth(prevMonth)

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day)
      days.push(
        <div
          key={`prev-${day}`}
          className="h-8 w-8 flex items-center justify-center text-sm text-gray-400 cursor-not-allowed"
        >
          {day}
        </div>,
      )
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const hasEvents = events.some((event) => isEventOnDate(event, date))
      const isSelected = selectedDate && isSameDay(date, selectedDate)
      const isToday = isSameDay(date, new Date())

      days.push(
        <button
          key={`current-${day}`}
          onClick={() => handleDateSelect(date)}
          className={`h-8 w-8 flex items-center justify-center text-sm rounded-full relative
            ${isSelected ? "bg-blue-600 text-white" : isToday ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}
            ${hasEvents ? "font-semibold" : ""}
          `}
        >
          {day}
          {hasEvents && <div className="absolute bottom-0 w-1 h-1 bg-blue-500 rounded-full"></div>}
        </button>,
      )
    }

    return days
  }

  const getDaysInPrevMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [
    activeTab,
    searchQuery,
    selectedCategory,
    selectedCategories,
    selectedRelatedTopics,
    selectedLocation,
    selectedFormat,
    selectedDate,
    selectedDateRange,
    priceRange,
    rating,
  ])

  if (loading) {
    return <EventsListingPageSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-500 mb-4 text-lg font-semibold">Error: {error}</p>
        <Button onClick={fetchEvents} variant="outline" className="font-medium bg-transparent">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <div className="mx-auto w-full min-w-0 max-w-7xl px-3 py-6 sm:px-4 lg:px-6">
          {/* Tabs Navigation - Added Verified Tab */}
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-6 border-b border-gray-300 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm sm:text-base font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
                  ? "border-blue-600 text-blue-700 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  }`}
              >
                {tab === "Verified" ? (
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-10 h-10" />
                    Verified
                  </span>
                ) : (
                  tab
                )}

              </button>
            ))}
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedDate && (
              <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 text-xs sm:text-sm font-medium">
                <span className="font-bold">Date:</span> {selectedDate.toLocaleDateString()}
                <X className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer ml-1" onClick={clearDateFilter} />
              </Badge>
            )}
            {selectedLocation && (
              <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 text-xs sm:text-sm font-medium">
                <span className="font-bold">Location:</span> {selectedLocation}
                <X className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer ml-1" onClick={clearLocationFilter} />
              </Badge>
            )}
            {selectedFormat !== "All Formats" && (
              <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 text-xs sm:text-sm font-medium">
                <span className="font-bold">Format:</span> {selectedFormat}
                <X className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer ml-1" onClick={clearFormatFilter} />
              </Badge>
            )}
            {selectedCategory !== "All Events" && (
              <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 text-xs sm:text-sm font-medium">
                <span className="font-bold">Category:</span> {selectedCategory}
                <X className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer ml-1" onClick={() => setSelectedCategory("All Events")} />
              </Badge>
            )}
            {selectedCategories.length > 0 && selectedCategories.map((category) => (
              <Badge variant="secondary" key={category} className="flex items-center gap-1 px-3 py-1 text-xs sm:text-sm font-medium">
                <span className="font-bold">Cat:</span> {category}
                <X className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer ml-1" onClick={() => handleCategoryToggle(category)} />
              </Badge>
            ))}

            {/* Verified Filter Badge */}
            {activeTab === "Verified" && (
              <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 text-xs sm:text-sm font-medium">
                <ShieldCheck className="w-3 h-3" />
                <span className="font-bold">Verified Only</span>
                <X className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer ml-1" onClick={() => setActiveTab("All Events")} />
              </Badge>
            )}

            {/* ALWAYS SHOW CLEAR ALL BUTTON WHEN THERE ARE ACTIVE FILTERS */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs sm:text-sm font-medium bg-transparent border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Clear All Filters
              </Button>
            )}
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-12 lg:gap-5 xl:gap-6">
            {/* Left Sidebar - 3 columns on desktop */}
            <div className="lg:col-span-3 hidden lg:block">
              <div className="sticky top-6">
                <div className="border border-gray-200 bg-white">

                    {/* DATE */}
                    <SidebarSection
                      title="📅 Date"
                      open={calendarOpen}
                      onToggle={() => setCalendarOpen(!calendarOpen)}
                    >
                      {[
                        { label: "Today", value: "today" },
                        { label: "Tomorrow", value: "tomorrow" },
                        { label: "This Week", value: "this-week" },
                        { label: "This Month", value: "this-month" },
                      ].map((d) => (
                        <SidebarCheckboxRow
                          key={d.value}
                          label={d.label}
                          checked={selectedDateRange === d.value}
                          onChange={() => {
                            setSelectedDateRange(d.value)
                            setSelectedDate(null)
                          }}
                        />
                      ))}
                    </SidebarSection>


                    {/* FORMAT */}
                    <SidebarSection
                      title="🎯 Format"
                      open={formatOpen}
                      onToggle={() => setFormatOpen(!formatOpen)}
                    >
                      {formats.map((f) => (
                        <SidebarCheckboxRow
                          key={f.name}
                          label={f.name}
                          count={f.count}
                          checked={selectedFormat === f.name}
                          onChange={() => setSelectedFormat(f.name)}
                        />
                      ))}
                    </SidebarSection>


                    {/* LOCATION */}
                    <SidebarSection
                      title="📍 Location"
                      open={locationOpen}
                      onToggle={() => setLocationOpen(!locationOpen)}
                    >
                      {locations.map((loc) => (
                        <SidebarCheckboxRow
                          key={loc.name}
                          label={loc.name}
                          count={loc.count}
                          checked={selectedLocation === loc.name}
                          onChange={() => setSelectedLocation(loc.name)}
                        />
                      ))}
                    </SidebarSection>


                    {/* CATEGORY */}
                    <SidebarSection
                      title="🏷️ Category"
                      open={categoryOpen}
                      onToggle={() => setCategoryOpen(!categoryOpen)}
                    >
                      {filteredCategories.map((cat) => (
                        <SidebarCheckboxRow
                          key={cat.name}
                          label={cat.name}
                          count={cat.count}
                          checked={selectedCategories.includes(cat.name)}
                          onChange={() => handleCategoryToggle(cat.name)}
                        />
                      ))}
                    </SidebarSection>



                    {/* ENTRY FEE */}
                    <SidebarSection
                      title="💰 Entry Fee"
                      open={entryFeeOpen}
                      onToggle={() => setEntryFeeOpen(!entryFeeOpen)}
                    >
                      {[
                        { label: "Free", value: "free" },
                        { label: "Under ₹1,000", value: "under-1000" },
                        { label: "₹1,000 – ₹5,000", value: "1000-5000" },
                        { label: "Above ₹5,000", value: "above-5000" },
                      ].map((p) => (
                        <SidebarCheckboxRow
                          key={p.value}
                          label={p.label}
                          checked={priceRange === p.value}
                          onChange={() => setPriceRange(p.value)}
                        />
                      ))}
                    </SidebarSection>


                    {/* CLEAR */}
                    <div
                      onClick={clearAllFilters}
                      className="px-4 py-3 text-sm font-semibold text-blue-600 hover:bg-gray-50 cursor-pointer border-t"
                    >
                      Clear all filters
                    </div>

                   </div>
              </div>
            </div>


            {/* Main Content Area - 6 columns on desktop */}
            <div className="lg:col-span-5 order-1 lg:order-2 w-full">
              {/* Dynamic Banner Section — brand gradient + white type (10times-style listing header) */}
              <div
                className="relative mb-6 min-h-[128px] overflow-hidden rounded-sm border border-white/15 shadow-lg sm:min-h-[140px]"
                style={listingBannerSurfaceStyle}
              >
                <div className="relative z-10 w-full p-3 pb-0 sm:p-4 sm:pb-0">
                  <h1
                    className="mb-3 font-sans text-xl font-bold tracking-tight text-white sm:text-2xl"
                    style={{
                      textShadow:
                        "0 1px 2px rgba(0,0,0,0.5), 0 2px 16px rgba(0,0,0,0.35), 0 0 1px rgba(0,0,0,0.8)",
                    }}
                  >
                    {getBannerTitle()}
                  </h1>
                  <div
                    className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-white"
                    style={{
                      textShadow: "0 1px 2px rgba(0,0,0,0.45), 0 0 1px rgba(0,0,0,0.6)",
                    }}
                  >
                    <span className="flex items-center gap-1.5">
                      <Users className="h-[18px] w-[18px] shrink-0 opacity-95" aria-hidden />
                      {getFollowerCount()}
                    </span>
                    <span className="hidden h-4 w-px shrink-0 bg-white/35 sm:block" aria-hidden />
                    <span className="flex items-center gap-1.5">
                      <Globe className="h-[18px] w-[18px] shrink-0 opacity-95" aria-hidden />
                      {filteredEvents.length.toLocaleString()} Events
                    </span>
                    <span className="hidden h-4 w-px shrink-0 bg-white/35 sm:block" aria-hidden />
                    <span className="flex items-center gap-1.5 text-white/95">
                      Showing {paginatedEvents.length} of {filteredEvents.length}
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="ml-auto h-8 shrink-0 border-0 bg-white px-3 text-xs font-semibold text-gray-900 shadow-sm hover:bg-white/90"
                      onClick={async () => {
                        const title = getBannerTitle()
                        const url = typeof window !== "undefined" ? window.location.href : ""
                        try {
                          if (typeof navigator !== "undefined" && navigator.share) {
                            await navigator.share({ title, url })
                            return
                          }
                          if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                            await navigator.clipboard.writeText(url)
                            toast({ title: "Link copied", description: "Listing URL copied to clipboard." })
                          }
                        } catch {
                          /* user cancelled or unsupported */
                        }
                      }}
                    >
                      <Share2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                      Share
                    </Button>
                  </div>
                </div>
              </div>

              {/* View Toggle and Results Count */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
                <span className="text-xs sm:text-sm font-bold text-gray-700">
                  Showing <span className="text-blue-600">{paginatedEvents.length}</span> of{" "}
                  <span className="text-blue-600">{filteredEvents.length}</span> events
                  {activeTab === "Verified" && (
                    <span className="text-green-600 ml-2">
                      • All verified events
                    </span>
                  )}
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="font-bold text-gray-700 border text-xs sm:text-sm"
                  >
                    Previous
                  </Button>

                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded text-xs sm:text-sm font-bold ${currentPage === page
                          ? "bg-blue-600 text-white shadow"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                          }`}
                      >
                        {page}
                      </button>
                    )
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="font-bold text-gray-700 border text-xs sm:text-sm"
                  >
                    Next
                  </Button>

                </div>
              </div>

              {/* Events list — compact cards (text + thumbnail + footer strip) */}
              <div className="space-y-5">
                {paginatedEvents.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-sm shadow">
                    <p className="text-gray-500 text-lg sm:text-xl font-bold mb-4">
                      {activeTab === "Verified"
                        ? "No verified events found"
                        : "No events found matching your criteria"}
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 font-bold text-sm sm:text-base px-4 sm:px-6 py-2 bg-transparent"
                      onClick={clearAllFilters}
                    >
                      Clear All Filters
                    </Button>
                    {activeTab === "Verified" && (
                      <Button
                        variant="default"
                        className="mt-4 ml-4 font-bold text-sm sm:text-base px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700"
                        onClick={() => setActiveTab("All Events")}
                      >
                        View All Events
                      </Button>
                    )}
                  </div>
                ) : (
                  paginatedEvents.map((event) => {
                    const path = eventPublicPath(event)
                    return (
                      <div
                        key={event.id}
                        className="bg-white border border-gray-300 rounded-sm overflow-hidden w-full hover:shadow-lg transition-shadow duration-300"
                      >
                        {/* Date + title full width (wraps across card, including above image column — no ellipsis) */}
                        <div className="px-4 pt-2.5 sm:px-5 sm:pt-3">
                          <Link href={path} className="group block">
                            <p className="mb-0.5 text-[11px] font-medium text-gray-600 sm:text-xs">
                              {formatDate(event.timings.startDate)}
                              {event.timings.endDate && <> - {formatDate(event.timings.endDate)}</>}
                              {" "}
                              {formatYear(event.timings.startDate)}
                            </p>
                            <div className="flex flex-wrap items-start gap-2">
                              <h3 className="min-w-0 flex-1 text-left text-[17px] font-bold leading-tight text-[#1F5D84] break-words sm:text-[19px] group-hover:underline">
                                {event.title}
                              </h3>
                              {event.isVerified ? (
                                <EventListingVerifiedBadge
                                  event={event}
                                  className="shrink-0 self-start p-0 pt-0.5 [&_img]:h-7 [&_img]:max-h-7 [&_img]:max-w-[90px]"
                                />
                              ) : null}
                            </div>
                          </Link>
                        </div>

                        {/* Body: main content (left) + fixed-size image (right); min-height keeps card rows uniform */}
                        <div className="flex flex-col md:flex-row md:items-start md:min-h-[176px]">
                          <div className="flex min-h-0 min-w-0 flex-1 flex-col px-4 pb-2.5 pt-1.5 sm:px-5 sm:pb-2.5 sm:pt-2.5">
                            <Link href={path} className="group flex min-h-0 min-w-0 flex-1 flex-col">
                              <p className="mb-1.5 flex items-center text-[12px] font-normal font-sans text-[#212529] sm:text-[13px]">
                                <MapPin className="mr-1 h-3.5 w-3.5 shrink-0 text-[#6C757D] sm:h-4 sm:w-4" />
                                <span className="line-clamp-1">
                                  {event.location?.city}, {event.location?.country}
                                </span>
                              </p>

                              <p
                                className="
    mb-1.5
    max-w-[95%]
    text-left
    break-words
    whitespace-normal
    text-[12px]
    font-normal
    font-sans
    leading-snug
    text-gray-700
    line-clamp-5
    sm:text-[13px]
  "
                              >
                                {event.description}
                              </p>

                              <div className="mt-auto flex flex-wrap gap-1.5">
                                {event.categories.slice(0, 3).map((cat, i) => (
                                  <span
                                    key={i}
                                    className="
        bg-[#F8F9FA]
        text-[#666666]
        px-1.5
        py-0.5
        rounded
        text-[11px]
        font-normal
        leading-none
        font-sans
      "
                                  >
                                    {cat}
                                  </span>
                                ))}
                              </div>
                            </Link>
                          </div>

                          <div className="flex w-full shrink-0 flex-col items-stretch md:w-[156px] md:shrink-0">
                            <div className="flex flex-1 flex-col px-3 pb-1.5 pt-1.5 md:px-3 md:pb-1.5 md:pl-0 md:pt-2.5">
                              <div className="mt-auto w-full">
                                <EventListingCardImages
                                  href={path}
                                  urls={normalizeEventImageUrls(event)}
                                  title={event.title}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom: follow + rating + share on one row */}
                        <div
                          className="flex flex-nowrap items-center gap-2 px-4 py-1.5 sm:px-5 sm:gap-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <EventCardFollowStrip
                              eventId={event.id}
                              eventPath={path}
                              eventTitle={event.title}
                              followerPreview={event.followerPreview ?? []}
                              followersCount={
                                typeof event.followersCount === "number" ? event.followersCount : 0
                              }
                            />
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                            <div
                              className="inline-flex h-8 items-center gap-1 rounded-md px-1.5 text-gray-700 sm:px-2"
                              title="Rating"
                            >
                              <Image
                                src="/icons/rating-xxl.png"
                                alt=""
                                width={20}
                                height={8}
                                className="shrink-0 opacity-90"
                              />
                              <span className="text-sm font-semibold tabular-nums">
                                {Number.isFinite(event.rating?.average)
                                  ? event.rating.average.toFixed(1)
                                  : "0.0"}
                              </span>
                            </div>
                            <ShareButton
                              id={event.id}
                              title={event.title}
                              type="event"
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            >
                              <Image
                                src="/icons/sharing_icon.png"
                                alt="Share"
                                width={18}
                                height={14}
                                className="cursor-pointer opacity-80"
                              />
                            </ShareButton>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Featured Events - Show verified featured events first */}
              {featuredEvents.length > 0 && (
                <section className="py-10 mt-10">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 underline decoration-blue-600 decoration-4">
                      ✨ Featured Events
                    </h2>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-green-600" />

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
                          className="p-2 border rounded-full"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentSlide((prev) => Math.min(Math.ceil(featuredEvents.length / 3) - 1, prev + 1))
                          }
                          className="p-2 border rounded-full"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredEvents
                      .sort((a, b) => (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0))
                      .slice(currentSlide * 3, currentSlide * 3 + 3)
                      .map((event) => (
                        <Card
                          key={event.id}
                          className="hover:shadow-xl transition-all duration-300 border border-gray-300 rounded-sm overflow-hidden group"
                        >
                          <div className="relative aspect-video overflow-hidden">
                            <img
                              src={getEventImage(event) || "/placeholder.svg"}
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 cursor-pointer">
                              <Heart className="w-5 h-5 text-gray-700" />
                            </div>
                            <div className="absolute top-3 left-3 flex space-x-2">
                              <Badge className="bg-blue-600 text-white text-sm font-bold px-3 py-1.5 shadow-lg">
                                Featured ✨
                              </Badge>

                            </div>
                          </div>
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-2xl font-black text-gray-900 line-clamp-2 flex-1">{event.title}</h3>
                              {event.isVerified && event.verifiedBadgeImage && (
                                <img
                                  src={event.verifiedBadgeImage}
                                  alt="Verified"
                                  className="ml-1 h-10 w-10 object-contain"
                                />
                              )}
                            </div>
                            <div className="flex items-center text-base text-gray-700 mb-2 font-bold">
                              <MapPin className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" />
                              <span className="truncate">{event.location?.city || "Location TBD"}</span>
                            </div>
                            <div className="flex items-center text-base text-gray-700 mb-4 font-bold">
                              <Calendar className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" />
                              <span>{formatDate(event.timings.startDate)}</span>
                            </div>
                            <div className="flex items-center justify-between mb-5">
                              <Badge className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1.5 border border-blue-200">
                                {event.categories[0] || "Event"}
                              </Badge>
                              <span className="text-lg font-black text-green-700">
                                ⭐ {Number.isFinite(event.rating?.average) ? event.rating.average.toFixed(1) : "0.0"}
                              </span>
                            </div>
                            <button
                              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-3 px-4 rounded-sm text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleVisitClick(event.id, event.title)
                              }}
                            >
                              Visit Event
                            </button>
                          </CardContent>
                        </Card>
                      ))}
                  </div>

                  <div className="flex justify-center mt-6 space-x-2">
                    {Array.from({ length: Math.ceil(featuredEvents.length / 3) }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${i === currentSlide ? "bg-blue-600 w-8" : "bg-gray-300 hover:bg-gray-400"
                          }`}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column - Ads and Trending Events - 3 columns on desktop */}
            <div className="lg:col-span-4 order-3 w-full">
              <div className="lg:sticky lg:top-6 self-start space-y-6">
                {/* Single Ad Card */}
                <div className="w-full">
                  <AdCard />
                </div>
                {/* Trending/Premium Events */}
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold font-black text-gray-900">🔥 Trending Events</h3>
                </div>

                {/* Desktop View - Vertical List (10times-style premium cards) */}
                <div className="hidden lg:block">
                  {trendingSidebarEvents.map((event) => (
                    <TrendingEventsSideCard
                      key={event.id}
                      event={event}
                      imageUrl={getEventImage(event) || "/placeholder.svg"}
                    />
                  ))}
                </div>

                {/* Mobile View - Horizontal Scroll */}
                <div className="lg:hidden">
                  <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                    {trendingSidebarEvents.map((event) => (
                      <div key={event.id} className="w-[min(100%,340px)] shrink-0 snap-start">
                        <TrendingEventsSideCard
                          event={event}
                          imageUrl={getEventImage(event) || "/placeholder.svg"}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Featured Event Card */}
                {featuredEvents[0] && (
                  <Card className="bg-white shadow-xl border border-gray-300 rounded-sm overflow-hidden">
                    <div className="relative aspect-video">
                      <img
                        src={getEventImage(featuredEvents[0]) || "/placeholder.svg"}
                        alt={featuredEvents[0].title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg">
                        <Heart className="w-5 h-5 text-gray-700" />
                      </div>
                      <div className="absolute top-3 left-3 flex space-x-2">
                        <Badge className="bg-blue-600 text-white text-sm font-bold px-3 py-1.5 shadow-lg">Expo</Badge>
                        <Badge className="bg-blue-600 text-white text-sm font-bold px-3 py-1.5 shadow-lg">
                          Business
                        </Badge>
                        {featuredEvents[0].isVerified && (
                          <Badge className="bg-green-600 text-white text-sm font-bold px-3 py-1.5 shadow-lg">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-green-100 text-green-800 px-4 py-2 rounded-sm text-sm font-bold shadow-lg">
                        ⭐{" "}
                        {Number.isFinite(featuredEvents[0].rating?.average)
                          ? featuredEvents[0].rating.average.toFixed(1)
                          : "0.0"}
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-black text-gray-900 flex-1">{featuredEvents[0].title}</h3>
                        {featuredEvents[0].isVerified && featuredEvents[0].verifiedBadgeImage && (
                          <img
                            src={featuredEvents[0].verifiedBadgeImage}
                            alt="Verified"
                            className="w-6 h-6 ml-2"
                          />
                        )}
                      </div>
                      <button
                        className="w-full flex items-center justify-center bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-4 rounded-sm text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleVisitClick(featuredEvents[0].id, featuredEvents[0].title)
                        }}
                      >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Visit Event
                      </button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}