"use client"

import { devLog } from "@/lib/dev-log"
import { useState, useMemo, useEffect, useRef, type CSSProperties } from "react"
import { Button } from "@/components/ui/button"
import { useSearchParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { isAuthenticated, getCurrentUserId, apiFetch } from "@/lib/api"
import {
  exploreKeyFromQueryParam,
  formatNameFromExploreKey,
} from "@/lib/explore-event-types"
import { normalizeBrowseCategory } from "@/lib/categories/normalize-browse-category"
import EventsListingPageSkeleton from "@/components/EventsListingPageSkeleton"
import type { Event, EventsPageContentProps, NameCount } from "@/components/events-page/listing-types"
import {
  EVENTS_LISTING_BANNER_GRADIENT,
  EVENTS_LISTING_BANNER_GRADIENT_OVER_IMAGE,
  EVENTS_LISTING_PAGE_CHUNK_BEFORE_FEATURED_AD,
  EVENTS_LISTING_INLINE_PROMO_FALLBACK_MAX,
  EVENTS_LISTING_PAGE_SIZE,
  EVENTS_TOP_MUST_VISIT_LIMIT,
} from "@/components/events-page/listing-constants"
import {
  emptyListingPagination,
  extractPaginationFromResponse,
  getEventsListingApiUrl,
  getEventsListingPremiumApiUrl,
  getEventsListingRailsApiUrl,
  toLocalIsoDate,
  type EventsListingPagination,
} from "@/components/events-page/listing-query"
import {
  extractEventsFromResponse,
  mapApiEventToListingEvent,
  formatListingFollowerTotal,
  getEventsListingBannerTitle,
  sortEventsByPlanTierThenStartDate,
  listingPlanTierRank,
  applyTopMustVisitRanking,
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
  initialPagination: initialPaginationProp,
  initialRailEvents: initialRailEventsProp = [],
  initialPremiumEvents: initialPremiumEventsProp = [],
}: EventsPageContentProps) {
  const [activeTab, setActiveTab] = useState("All Events")
  const [selectedFormat, setSelectedFormat] = useState("All Formats")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get("category")
  const typeFromUrl = searchParams.get("type")
  const locationQ = searchParams.get("location")
  const countryQ = searchParams.get("country")
  const venueQ = searchParams.get("venue")
  const searchQ = searchParams.get("search")
  const fromQ = searchParams.get("from")
  const toQ = searchParams.get("to")
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || "All Events")

  const [events, setEvents] = useState<Event[]>(() => initialEventsProp)
  const [railEvents, setRailEvents] = useState<Event[]>(() =>
    initialRailEventsProp.length > 0 ? initialRailEventsProp : initialEventsProp,
  )
  const [premiumSidebarEvents, setPremiumSidebarEvents] = useState<Event[]>(
    () => initialPremiumEventsProp,
  )
  const [pagination, setPagination] = useState<EventsListingPagination>(
    () => initialPaginationProp ?? emptyListingPagination(EVENTS_LISTING_PAGE_SIZE),
  )
  const [loading, setLoading] = useState(() => initialEventsProp.length === 0)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDateRange, setSelectedDateRange] = useState("")
  const [customFromDate, setCustomFromDate] = useState("")
  const [customToDate, setCustomToDate] = useState("")
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

  const [facetCategories, setFacetCategories] = useState<NameCount[]>([])
  const [facetFormats, setFacetFormats] = useState<NameCount[]>([{ name: "All Formats", count: 0 }])
  const [facetLocations, setFacetLocations] = useState<NameCount[]>([])

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

  const buildListingQuery = (page: number) => {
    const relatedCats = selectedRelatedTopics.map((topic) => topic.replace(" Related", "").trim()).filter(Boolean)
    const categories =
      selectedCategories.length > 0
        ? [...selectedCategories, ...relatedCats]
        : selectedCategory && selectedCategory !== "All Events"
          ? [selectedCategory, ...relatedCats]
          : relatedCats

    return {
      page,
      limit: EVENTS_LISTING_PAGE_SIZE,
      sort: "ranked" as const,
      excludePast: true,
      search: searchQuery,
      categories,
      location: selectedLocation || venueQ || "",
      country: selectedCountry,
      format: selectedFormat,
      from: customFromDate,
      to: customToDate,
      tab: activeTab,
      dateRange: selectedDateRange,
      selectedDateIso: selectedDate ? toLocalIsoDate(selectedDate) : undefined,
      verified: activeTab === "Verified",
      minRating: rating || undefined,
      price: priceRange || undefined,
    }
  }

  const fetchEvents = async (options?: { silent?: boolean; page?: number }) => {
    const page = options?.page ?? currentPage
    try {
      if (!options?.silent) {
        setLoading(true)
      }
      setError(null)
      const response = await fetch(getEventsListingApiUrl(buildListingQuery(page)))
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
      setPagination(extractPaginationFromResponse(payload))
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

  const fetchRailEvents = async () => {
    try {
      const response = await fetch(getEventsListingRailsApiUrl())
      if (!response.ok) return
      const payload = await response.json().catch(() => ({}))
      const rawEvents = extractEventsFromResponse(payload)
      setRailEvents(rawEvents.map((row) => mapApiEventToListingEvent(row)))
    } catch (e) {
      console.error("[v0] Error fetching listing rails:", e)
    }
  }

  const fetchPremiumEvents = async () => {
    try {
      const relatedCats = selectedRelatedTopics
        .map((topic) => topic.replace(" Related", "").trim())
        .filter(Boolean)
      const categories =
        selectedCategories.length > 0
          ? [...selectedCategories, ...relatedCats]
          : selectedCategory && selectedCategory !== "All Events"
            ? [selectedCategory, ...relatedCats]
            : relatedCats
      const response = await fetch(
        getEventsListingPremiumApiUrl({
          categories,
          location: selectedLocation || venueQ || "",
          country: selectedCountry,
        }),
      )
      if (!response.ok) return
      const payload = await response.json().catch(() => ({}))
      const rawEvents = extractEventsFromResponse(payload)
      setPremiumSidebarEvents(rawEvents.map((row) => mapApiEventToListingEvent(row)))
    } catch (e) {
      console.error("[v0] Error fetching premium listing events:", e)
    }
  }

  const fetchFacets = async () => {
    try {
      const response = await fetch("/api/events/facets?excludePast=true")
      if (!response.ok) return
      const payload = (await response.json().catch(() => ({}))) as {
        success?: boolean
        categories?: NameCount[]
        formats?: NameCount[]
        locations?: NameCount[]
      }
      if (payload.success === false) return
      if (Array.isArray(payload.categories)) setFacetCategories(payload.categories)
      if (Array.isArray(payload.formats) && payload.formats.length > 0) {
        setFacetFormats(payload.formats)
      }
      if (Array.isArray(payload.locations)) setFacetLocations(payload.locations)
    } catch (e) {
      console.error("[v0] Error fetching listing facets:", e)
    }
  }

  useEffect(() => {
    void fetchRailEvents()
    void fetchFacets()
  }, [])

  // Premium rail follows category / location filters (gold + platinum only).
  useEffect(() => {
    void fetchPremiumEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- filter-driven premium refetch
  }, [
    selectedCategory,
    selectedCategories,
    selectedRelatedTopics,
    selectedLocation,
    selectedCountry,
    venueQ,
  ])

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
    } else if (venueQ) {
      setSelectedLocation(venueQ)
    } else {
      setSelectedLocation("")
    }
    setSelectedCountry(countryQ ?? "")
    if (searchQ) {
      setSearchQuery(searchQ)
    } else {
      setSearchQuery("")
    }
    setCustomFromDate(fromQ ?? "")
    setCustomToDate(toQ ?? "")
    const exploreKey = exploreKeyFromQueryParam(typeFromUrl)
    if (exploreKey) {
      setSelectedFormat(formatNameFromExploreKey(exploreKey))
    }
  }, [categoryFromUrl, typeFromUrl, locationQ, countryQ, venueQ, searchQ, fromQ, toQ])

  // Reset to page 1 when filters change (not when only page changes).
  useEffect(() => {
    setCurrentPage(1)
  }, [
    activeTab,
    searchQuery,
    selectedCategory,
    selectedCategories,
    selectedRelatedTopics,
    selectedCountry,
    selectedLocation,
    selectedFormat,
    selectedDate,
    selectedDateRange,
    priceRange,
    rating,
    customFromDate,
    customToDate,
  ])

  // Server-side list fetch whenever filters or page change.
  const listingFetchReadyRef = useRef(false)
  useEffect(() => {
    const isFirstPaint = !listingFetchReadyRef.current
    listingFetchReadyRef.current = true
    const silent = isFirstPaint && initialEventsProp.length > 0 && currentPage === 1
    void fetchEvents({ silent, page: currentPage })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional filter/page-driven refetch
  }, [
    currentPage,
    activeTab,
    searchQuery,
    selectedCategory,
    selectedCategories,
    selectedRelatedTopics,
    selectedCountry,
    selectedLocation,
    selectedFormat,
    selectedDate,
    selectedDateRange,
    priceRange,
    rating,
    customFromDate,
    customToDate,
  ])
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
      await apiFetch(`/api/events/${eventId}/save`, {
        method: "POST",
        auth: true,
      }).catch(() => undefined)
      toast({
        title: "Visit recorded",
        description: `"${eventTitle}" was added to your interested events.`,
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


  /** Rail source for trending / featured / must-visit widgets. */
  const listingEvents = railEvents

  const categories = useMemo((): NameCount[] => {
    if (facetCategories.length > 0) return facetCategories
    return browseCategoryMeta.map((c) => ({ name: c.name, count: 0 }))
  }, [facetCategories, browseCategoryMeta])

  const formats = facetFormats

  const locations = facetLocations

  const filteredCategories = useMemo(() => categories, [categories])

  /** Main list is already filtered + paginated by the API (sort=ranked). */
  const paginatedEvents = events
  const filteredCount = pagination.total
  const totalPages = Math.max(1, pagination.totalPages)
  const eventsBeforeFeaturedAd = paginatedEvents.slice(0, EVENTS_LISTING_PAGE_CHUNK_BEFORE_FEATURED_AD)
  const eventsAfterFeaturedAd = paginatedEvents.slice(EVENTS_LISTING_PAGE_CHUNK_BEFORE_FEATURED_AD)

  const mustVisitRail = useMemo(() => {
    return applyTopMustVisitRanking(listingEvents, EVENTS_TOP_MUST_VISIT_LIMIT)
  }, [listingEvents])

  const bannerTitle = useMemo(
    () =>
      getEventsListingBannerTitle({
        searchQuery,
        selectedDate,
        selectedDateRange,
        selectedCategories,
        selectedCategory,
        selectedLocation,
        selectedCountry,
        customFromDate,
        customToDate,
        selectedFormat,
        priceRange,
        rating,
        activeTab,
      }),
    [
      searchQuery,
      selectedDate,
      selectedDateRange,
      selectedCategories,
      selectedCategory,
      selectedLocation,
      selectedCountry,
      customFromDate,
      customToDate,
      selectedFormat,
      priceRange,
      rating,
      activeTab,
    ],
  )

  const followerLabel = useMemo(() => formatListingFollowerTotal(mustVisitRail), [mustVisitRail])

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

  const featuredEvents = listingEvents.filter((event) => event.featured)

  /**
   * Mid-list carousel: Platinum/Gold for the active category/location first,
   * then nearest start date. Falls back to silver from the ranked page list.
   */
  const inlinePromoEvents = useMemo(() => {
    const limit = EVENTS_LISTING_INLINE_PROMO_FALLBACK_MAX
    const premium = sortEventsByPlanTierThenStartDate(
      premiumSidebarEvents.filter((e) => listingPlanTierRank(e.organizerPlanTier) >= 2),
    )
    if (premium.length > 0) return premium.slice(0, limit)

    const fromPage = sortEventsByPlanTierThenStartDate(
      events.filter((e) => listingPlanTierRank(e.organizerPlanTier) >= 1),
    )
    if (fromPage.length > 0) return fromPage.slice(0, limit)

    const tagged = listingEvents.filter((e) => e.featured)
    if (tagged.length > 0) {
      return sortEventsByPlanTierThenStartDate(tagged).slice(0, limit)
    }
    return sortEventsByPlanTierThenStartDate(listingEvents).slice(0, limit)
  }, [premiumSidebarEvents, events, listingEvents])

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
    const hasSelectedCountry = selectedCountry.trim().length > 0
    const hasCustomDateRange = customFromDate.trim().length > 0 || customToDate.trim().length > 0
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
      hasSelectedCountry ||
      hasCustomDateRange ||
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
    selectedCountry,
    selectedLocation,
    selectedFormat,
    selectedCategory,
    selectedCategories,
    selectedRelatedTopics,
    priceRange,
    rating,
    activeTab,
    customFromDate,
    customToDate,
  ])

  const tabs = ["All Events", "Upcoming", "This Week", "This Month", "Verified"]

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategory("All Events")
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
    setSelectedCountry("")
    setCustomFromDate("")
    setCustomToDate("")
    setSelectedDate(null)
    setSelectedDateRange("")
    setSelectedFormat("All Formats")
    setPriceRange("")
    setRating("")
    setActiveTab("All Events")
    setCurrentPage(1)
    router.push("/event")
  }

  const handleListingShare = async () => {
    const title = bannerTitle
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
          selectedCountry={selectedCountry}
          onClearCountry={() => setSelectedCountry("")}
          selectedLocation={selectedLocation}
          onClearLocation={() => setSelectedLocation("")}
          customFromDate={customFromDate}
          customToDate={customToDate}
          onClearCustomDateRange={() => {
            setCustomFromDate("")
            setCustomToDate("")
          }}
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
              title={bannerTitle}
              followerLabel={followerLabel}
              filteredCount={filteredCount}
              paginatedCount={paginatedEvents.length}
              onShare={handleListingShare}
            />

            <EventsListingResultsHeader
              paginatedCount={paginatedEvents.length}
              filteredCount={filteredCount}
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
                  {eventsBeforeFeaturedAd.map((event, index) => (
                    <EventsListingEventCard
                      key={event.id}
                      event={event}
                      searchQuery={searchQuery}
                      position={(currentPage - 1) * EVENTS_LISTING_PAGE_SIZE + index}
                      page={currentPage}
                    />
                  ))}
                  {inlinePromoEvents.length > 0 ? (
                    <EventsListingInlineFeaturedCarousel
                      key={`listing-inline-featured-p${currentPage}`}
                      featuredEvents={inlinePromoEvents}
                      promoSource={featuredEvents.length > 0 ? "featured" : "curated"}
                    />
                  ) : null}
                  {eventsAfterFeaturedAd.map((event, index) => (
                    <EventsListingEventCard
                      key={event.id}
                      event={event}
                      searchQuery={searchQuery}
                      position={
                        (currentPage - 1) * EVENTS_LISTING_PAGE_SIZE +
                        EVENTS_LISTING_PAGE_CHUNK_BEFORE_FEATURED_AD +
                        index
                      }
                      page={currentPage}
                    />
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
            premiumSidebarEvents={premiumSidebarEvents}
            featuredFirst={featuredEvents[0]}
            onVisit={handleVisitClick}
          />
        </div>
      </div>
    </div>
  )
}
