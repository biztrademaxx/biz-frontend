"use client"

import { devLog } from "@/lib/dev-log"
import { useState, useMemo, useEffect, type CSSProperties } from "react"
import { Button } from "@/components/ui/button"
import { useSearchParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { isAuthenticated, getCurrentUserId, apiFetch } from "@/lib/api"
import {
  classifyExploreEventType,
  exploreKeyFromQueryParam,
  formatNameFromExploreKey,
  exploreKeyFromFormatName,
} from "@/lib/explore-event-types"
import { normalizeBrowseCategory } from "@/lib/categories/normalize-browse-category"
import EventsListingPageSkeleton from "@/components/EventsListingPageSkeleton"
import type { Event, EventsPageContentProps, NameCount } from "@/components/events-page/listing-types"
import {
  EVENTS_LISTING_BANNER_GRADIENT,
  EVENTS_LISTING_BANNER_GRADIENT_OVER_IMAGE,
  EVENTS_API,
  EVENTS_LISTING_PAGE_CHUNK_BEFORE_FEATURED_AD,
  EVENTS_LISTING_PAGE_CHUNK_AFTER_FEATURED_AD,
  EVENTS_LISTING_INLINE_PROMO_FALLBACK_MAX,
} from "@/components/events-page/listing-constants"
import {
  extractEventsFromResponse,
  mapApiEventToListingEvent,
  normalizeEventFormatName,
  isEventInTab,
  isEventOnDate,
  isEventInDateRange,
} from "@/components/events-page/listing-utils"
import { EventsListingDesktopFiltersSidebar } from "@/components/events-page/EventsListingDesktopFiltersSidebar"
import { EventsListingTabs } from "@/components/events-page/EventsListingTabs"
import { EventsListingActiveFilterBadges } from "@/components/events-page/EventsListingActiveFilterBadges"
import { EventsListingListBanner } from "@/components/events-page/EventsListingListBanner"
import { EventsListingResultsHeader } from "@/components/events-page/EventsListingResultsHeader"
import { EventsListingEventCard } from "@/components/events-page/EventsListingEventCard"
import { EventsListingInlineFeaturedCarousel } from "@/components/events-page/EventsListingInlineFeaturedCarousel"
import { EventsListingFeaturedSection } from "@/components/events-page/EventsListingFeaturedSection"
import { EventsListingRightRail } from "@/components/events-page/EventsListingRightRail"

export type { EventsPageContentProps } from "@/components/events-page/listing-types"

export default function EventsPageContent({
  initialBrowseCategoryMeta: initialBrowseCategoryMetaProp = [],
  initialEvents: initialEventsProp = [],
}: EventsPageContentProps) {
  const [activeTab, setActiveTab] = useState("All Events")
  const [selectedFormat, setSelectedFormat] = useState("All Formats")
  const [selectedLocation, setSelectedLocation] = useState("")
  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get("category")
  const typeFromUrl = searchParams.get("type")
  const locationQ = searchParams.get("location")
  const countryQ = searchParams.get("country")
  const venueQ = searchParams.get("venue")
  const searchQ = searchParams.get("search")
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || "All Events")

  const [events, setEvents] = useState<Event[]>(() => initialEventsProp)
  const [loading, setLoading] = useState(() => initialEventsProp.length === 0)
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
  const [entryFeeOpen, setEntryFeeOpen] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedRelatedTopics, setSelectedRelatedTopics] = useState<string[]>([])

  const [browseCategoryMeta, setBrowseCategoryMeta] = useState<Array<{ name: string; icon: string | null }>>(
    () => initialBrowseCategoryMetaProp,
  )

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const [visitorCounts, setVisitorCounts] = useState<Record<string, number>>({})
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("visitorCounts") : null
      if (raw) setVisitorCounts(JSON.parse(raw))
    } catch (e) {
      devLog("[v0] Failed to load visitorCounts:", e)
    }
  }, [])

  const persistVisitorCounts = (next: Record<string, number>) => {
    setVisitorCounts(next)
    try {
      localStorage.setItem("visitorCounts", JSON.stringify(next))
    } catch (e) {
      devLog("[v0] Failed to persist visitorCounts:", e)
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

  const handlePageChange = (page: number) => {
    if (page === 1) {
      setCurrentPage(1)
      return
    }
    if (!isLoggedIn) {
      toast({
        title: "Login required",
        description: "Please log in to view more events.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }
    setCurrentPage(page)
  }

  const fetchEvents = async (options?: { silent?: boolean }) => {
    try {
      if (!options?.silent) {
        setLoading(true)
      }
      setError(null)
      const response = await fetch(EVENTS_API)
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        const message =
          (payload as { error?: string })?.error ||
          (payload as { message?: string })?.message ||
          `Failed to fetch events (HTTP ${response.status})`
        throw new Error(message)
      }
      const rawEvents = extractEventsFromResponse(payload)
      const transformedEvents = rawEvents.map((row) => mapApiEventToListingEvent(row))
      setEvents(transformedEvents)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("[v0] Error fetching events:", err)
      if (!options?.silent) {
        toast({
          title: "Error",
          description: "Failed to load events",
          variant: "destructive",
        })
      }
    } finally {
      if (!options?.silent) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (initialEventsProp.length > 0) return
    void fetchEvents()
  }, [])

  useEffect(() => {
    if (initialBrowseCategoryMetaProp.length > 0) return
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
    } catch (visitErr) {
      console.error("[v0] Visit lead error:", visitErr)
      toast({
        title: "Error",
        description: "Failed to record your interest. Your local visit counter was still updated.",
        variant: "destructive",
      })
    }
  }

  const itemsPerPage =
    EVENTS_LISTING_PAGE_CHUNK_BEFORE_FEATURED_AD + EVENTS_LISTING_PAGE_CHUNK_AFTER_FEATURED_AD

  const categories = useMemo((): NameCount[] => {
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

  const filteredCategories = useMemo(() => categories, [categories])

  const filteredEvents = useMemo(() => {
    let filtered = events

    filtered = filtered.filter((event) => isEventInTab(event, activeTab))

    if (activeTab === "Verified") {
      filtered = filtered.filter((event) => event.isVerified)
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
          (event.venue?.venueCity?.toLowerCase() ?? "").includes(query) ||
          (event.venue?.venueCountry?.toLowerCase() ?? "").includes(query) ||
          (event.location?.city?.toLowerCase() ?? "").includes(query),
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
      })
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
      (sum, ev) => sum + (typeof ev.followersCount === "number" ? ev.followersCount : 0),
      0,
    )
    if (total >= 1000) return `${(total / 1000).toFixed(1).replace(/\.0$/, "")}K Followers`
    return `${total} Followers`
  }

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / itemsPerPage))
  const paginatedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const eventsBeforeFeaturedAd = paginatedEvents.slice(0, EVENTS_LISTING_PAGE_CHUNK_BEFORE_FEATURED_AD)
  const eventsAfterFeaturedAd = paginatedEvents.slice(EVENTS_LISTING_PAGE_CHUNK_BEFORE_FEATURED_AD)

  const featuredEvents = events.filter((event) => event.featured)

  const inlinePromoEvents = useMemo(() => {
    if (events.length === 0) return []
    const tagged = events.filter((e) => e.featured)
    if (tagged.length > 0) return tagged
    return [...events]
      .sort((a, b) => {
        const v = (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0)
        if (v !== 0) return v
        const ra = Number.isFinite(a.rating?.average) ? a.rating.average : 0
        const rb = Number.isFinite(b.rating?.average) ? b.rating.average : 0
        if (rb !== ra) return rb - ra
        const fa = typeof a.followersCount === "number" ? a.followersCount : 0
        const fb = typeof b.followersCount === "number" ? b.followersCount : 0
        return fb - fa
      })
      .slice(0, EVENTS_LISTING_INLINE_PROMO_FALLBACK_MAX)
  }, [events])

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
    activeTab,
  ])

  const tabs = ["All Events", "Upcoming", "This Week", "This Month", "Verified"]

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
      return newCategories
    })
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

  const handleListingShare = async () => {
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
  }

  if (loading) {
    return <EventsListingPageSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-500 mb-4 text-lg font-semibold">Error: {error}</p>
        <Button onClick={() => void fetchEvents()} variant="outline" className="font-medium bg-transparent">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full min-w-0 max-w-7xl px-3 py-6 sm:px-4 lg:px-6">
        <EventsListingTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <EventsListingActiveFilterBadges
          selectedDate={selectedDate}
          onClearDate={() => {
            setSelectedDate(null)
            setSelectedDateRange("")
          }}
          selectedLocation={selectedLocation}
          onClearLocation={() => setSelectedLocation("")}
          selectedFormat={selectedFormat}
          onClearFormat={() => setSelectedFormat("All Formats")}
          selectedCategory={selectedCategory}
          onClearCategory={() => setSelectedCategory("All Events")}
          selectedCategories={selectedCategories}
          onToggleCategory={handleCategoryToggle}
          activeTab={activeTab}
          onClearVerifiedTab={() => setActiveTab("All Events")}
          hasActiveFilters={hasActiveFilters}
          onClearAll={clearAllFilters}
        />

        <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-12 lg:gap-5 xl:gap-6">
          <EventsListingDesktopFiltersSidebar
            calendarOpen={calendarOpen}
            setCalendarOpen={setCalendarOpen}
            selectedDateRange={selectedDateRange}
            setSelectedDateRange={setSelectedDateRange}
            setSelectedDate={setSelectedDate}
            formatOpen={formatOpen}
            setFormatOpen={setFormatOpen}
            formats={formats}
            selectedFormat={selectedFormat}
            setSelectedFormat={setSelectedFormat}
            locationOpen={locationOpen}
            setLocationOpen={setLocationOpen}
            locations={locations}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            categoryOpen={categoryOpen}
            setCategoryOpen={setCategoryOpen}
            filteredCategories={filteredCategories}
            selectedCategories={selectedCategories}
            handleCategoryToggle={handleCategoryToggle}
            entryFeeOpen={entryFeeOpen}
            setEntryFeeOpen={setEntryFeeOpen}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            clearAllFilters={clearAllFilters}
          />

          <div className="lg:col-span-5 order-1 lg:order-2 w-full min-w-0">
            <EventsListingListBanner
              surfaceStyle={listingBannerSurfaceStyle}
              title={getBannerTitle()}
              followerLabel={getFollowerCount()}
              filteredCount={filteredEvents.length}
              paginatedCount={paginatedEvents.length}
              onShare={handleListingShare}
            />

            <EventsListingResultsHeader
              paginatedCount={paginatedEvents.length}
              filteredCount={filteredEvents.length}
              activeTab={activeTab}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />

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
                <>
                  {eventsBeforeFeaturedAd.map((event) => (
                    <EventsListingEventCard key={event.id} event={event} />
                  ))}
                  {inlinePromoEvents.length > 0 ? (
                    <EventsListingInlineFeaturedCarousel
                      key={`listing-inline-featured-p${currentPage}`}
                      featuredEvents={inlinePromoEvents}
                      promoSource={featuredEvents.length > 0 ? "featured" : "curated"}
                    />
                  ) : null}
                  {eventsAfterFeaturedAd.map((event) => (
                    <EventsListingEventCard key={event.id} event={event} />
                  ))}
                </>
              )}
            </div>

            <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
              <EventsListingFeaturedSection
                featuredEvents={featuredEvents}
                currentSlide={currentSlide}
                setCurrentSlide={setCurrentSlide}
                onVisit={handleVisitClick}
              />
            </div>
          </div>

          <EventsListingRightRail
            trendingSidebarEvents={trendingSidebarEvents}
            featuredFirst={featuredEvents[0]}
            onVisit={handleVisitClick}
          />
        </div>
      </div>
    </div>
  )
}

