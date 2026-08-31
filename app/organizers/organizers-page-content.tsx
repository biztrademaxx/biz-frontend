"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Star,
  Award,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react"
import { AppImage } from "@/components/app-image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { fetchGeoHint, type GeoHint } from "@/lib/browse-geo"
import { getPublicProfilePath } from "@/lib/profile-path"
import { getPlanColor, getPlanDisplayName } from "@/lib/subscription-features"
import { OrganizersFilterSidebar } from "@/components/organizers/organizers-filter-sidebar"
import OrganizersListingPageSkeleton from "@/components/OrganizersListingPageSkeleton"
import {
  buildOrganizersListingQuery,
  EMPTY_ORGANIZER_FACETS,
  normalizeOrganizerFacetsPayload,
  ORGANIZERS_LISTING_PAGE_SIZE,
  type OrganizersListingServerResult,
  type PublicOrganizerCard,
} from "@/lib/organizers/organizers-listing-query"

const PAGE_SIZE = ORGANIZERS_LISTING_PAGE_SIZE
const SEARCH_DEBOUNCE_MS = 400

async function fetchPublicJson<T>(path: string): Promise<T> {
  const res = await fetch(path)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      (typeof data?.error === "string" && data.error) ||
      (typeof data?.message === "string" && data.message) ||
      `Request failed (${res.status})`
    throw new Error(message)
  }
  return data as T
}

type Organizer = PublicOrganizerCard

function organizerDisplayName(o: Organizer): string {
  return o.company?.trim() || o.name?.trim() || "Organizer"
}

function organizerLocationLine(o: Organizer): string {
  const city = o.city?.trim()
  const country = o.country?.trim()
  if (city && country) return `${city}, ${country}`
  if (country) return country
  if (city) return city
  return "Location not specified"
}

export default function OrganizersPageContent({
  initialOrganizers = [],
  initialTotal = 0,
  initialTotalPages = 1,
  initialFacets = EMPTY_ORGANIZER_FACETS,
  visitorGeo: initialGeo = null,
}: {
  initialOrganizers?: PublicOrganizerCard[]
  initialTotal?: number
  initialTotalPages?: number
  initialFacets?: OrganizersListingServerResult["facets"]
  visitorGeo?: GeoHint | null
}) {
  const router = useRouter()
  const hasServerList = initialOrganizers.length > 0 || initialTotal > 0
  const [organizers, setOrganizers] = useState<Organizer[]>(initialOrganizers)
  const [loading, setLoading] = useState(!hasServerList)
  const [initialLoad, setInitialLoad] = useState(!hasServerList)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedEventBuckets, setSelectedEventBuckets] = useState<string[]>([])
  const [visitorGeo, setVisitorGeo] = useState<GeoHint | null>(initialGeo)
  const [selectedFollowerBuckets, setSelectedFollowerBuckets] = useState<string[]>([])
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(initialTotal)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [facets, setFacets] = useState(initialFacets)
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [retryTick, setRetryTick] = useState(0)
  const listingFetchReadyRef = useRef(false)

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchTerm), SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [searchTerm])

  useEffect(() => {
    if (initialGeo?.countryCode || initialGeo?.countryName) return
    fetchGeoHint()
      .then(setVisitorGeo)
      .catch(() => setVisitorGeo(null))
  }, [initialGeo])

  useEffect(() => {
    if (initialFacets.cities.length > 0 || initialFacets.countries.length > 0) return
    const fetchFacets = async () => {
      try {
        const data = await fetchPublicJson<unknown>("/api/organizers/facets")
        setFacets(normalizeOrganizerFacetsPayload(data))
      } catch (error) {
        console.error("Error fetching organizer facets:", error)
      }
    }

    fetchFacets()
  }, [initialFacets.cities.length, initialFacets.countries.length])

  useEffect(() => {
    const isFirstPaint = !listingFetchReadyRef.current
    listingFetchReadyRef.current = true
    const silent = isFirstPaint && hasServerList && page === 1 && !debouncedSearch
    if (silent) {
      setInitialLoad(false)
      setLoading(false)
      return
    }

    const fetchOrganizers = async () => {
      setLoading(true)
      setFetchError(null)
      try {
        const query = buildOrganizersListingQuery({
          page,
          search: debouncedSearch,
          cities: selectedCities,
          countries: selectedCountries,
          eventBuckets: selectedEventBuckets,
          followerBuckets: selectedFollowerBuckets,
          visitorGeo,
        })
        const data = await fetchPublicJson<{
          organizers: Organizer[]
          total: number
          totalPages: number
        }>(`/api/organizers?${query}`)
        setOrganizers(data.organizers || [])
        setTotal(data.total ?? 0)
        setTotalPages(data.totalPages ?? 1)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load organizers"
        console.error("Error fetching organizers:", error)
        setFetchError(message)
        setOrganizers([])
        setTotal(0)
        setTotalPages(1)
      } finally {
        setLoading(false)
        setInitialLoad(false)
      }
    }

    void fetchOrganizers()
  }, [
    page,
    debouncedSearch,
    selectedCities,
    selectedCountries,
    selectedEventBuckets,
    selectedFollowerBuckets,
    visitorGeo,
    retryTick,
    hasServerList,
  ])

  const handleCardClick = (organizer: Organizer) => {
    router.push(
      getPublicProfilePath("organizer", {
        id: organizer.id,
        publicSlug: organizer.publicSlug,
        organizationName: organizer.company || organizer.name,
        company: organizer.company,
      }),
    )
  }

  const toggleFilter = useCallback(
    (value: string, selectedArray: string[], setSelectedArray: (arr: string[]) => void) => {
      setPage(1)
      if (selectedArray.includes(value)) {
        setSelectedArray(selectedArray.filter((item) => item !== value))
      } else {
        setSelectedArray([...selectedArray, value])
      }
    },
    [],
  )

  const clearAllFilters = useCallback(() => {
    setPage(1)
    setSelectedCities([])
    setSelectedCountries([])
    setSelectedEventBuckets([])
    setSelectedFollowerBuckets([])
    setSearchTerm("")
  }, [])

  const toggleEventBucket = useCallback((id: string) => {
    setPage(1)
    setSelectedEventBuckets((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }, [])

  const toggleFollowerBucket = useCallback((id: string) => {
    setPage(1)
    setSelectedFollowerBuckets((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }, [])

  const activeFilterCount =
    selectedCities.length +
    selectedCountries.length +
    selectedEventBuckets.length +
    selectedFollowerBuckets.length +
    (searchTerm.trim() ? 1 : 0)

  const filterSidebar = (
    <OrganizersFilterSidebar
      facets={facets}
      selectedCities={selectedCities}
      selectedCountries={selectedCountries}
      selectedEventBuckets={selectedEventBuckets}
      selectedFollowerBuckets={selectedFollowerBuckets}
      onToggleCity={(v) => toggleFilter(v, selectedCities, setSelectedCities)}
      onToggleCountry={(v) => toggleFilter(v, selectedCountries, setSelectedCountries)}
      onToggleEventBucket={toggleEventBucket}
      onToggleFollowerBucket={toggleFollowerBucket}
      preferredCountryLabel={visitorGeo?.countryName}
    />
  )

  if (initialLoad) {
    return <OrganizersListingPageSkeleton />
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] pb-12 sm:pb-16">
      {/* Mobile filter bar */}
      <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-gray-200/80 bg-[#f9f9f9]/95 px-4 py-3 backdrop-blur lg:hidden">
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 border-[#004A96]/30 text-[#004A96]">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 ? (
                <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-xs">
                  {activeFilterCount}
                </Badge>
              ) : null}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-[min(100vw-1rem,22rem)] flex-col gap-0 p-0 sm:max-w-sm">
            <SheetHeader className="border-b px-4 py-4 text-left">
              <SheetTitle className="text-lg">Discover organizers</SheetTitle>
              <p className="text-sm font-normal text-muted-foreground">Narrow by location, events, or followers.</p>
            </SheetHeader>
            <ScrollArea className="min-h-0 flex-1 px-4 py-4">
              {filterSidebar}
              {activeFilterCount > 0 ? (
                <Button variant="outline" size="sm" onClick={clearAllFilters} className="mt-4 w-full">
                  Clear all filters
                </Button>
              ) : null}
            </ScrollArea>
            <SheetFooter className="border-t bg-muted/30 p-4 sm:flex-col sm:gap-2">
              <Button className="w-full bg-[#004A96] hover:bg-[#003a75]" onClick={() => setMobileFiltersOpen(false)}>
                Show {total} result{total !== 1 ? "s" : ""}
              </Button>
              <Button variant="ghost" size="sm" className="w-full" onClick={clearAllFilters}>
                Reset all
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search…"
            value={searchTerm}
            onChange={(e) => {
              setPage(1)
              setSearchTerm(e.target.value)
            }}
            className="h-9 pl-9 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-[#f9f9f9] lg:block xl:w-72">
          <div className="sticky top-0 max-h-[100dvh]">
            <div className="border-b border-gray-100 px-5 py-5">
              <h2 className="text-lg font-semibold text-gray-900">Discover organizers</h2>
              <p className="mt-1 text-xs text-muted-foreground">Filters use your current directory data.</p>
            </div>
            <ScrollArea className="h-[calc(100dvh-5.5rem)] px-5 py-2">
              {filterSidebar}
              {activeFilterCount > 0 ? (
                <Button variant="outline" size="sm" onClick={clearAllFilters} className="mb-4 mt-2 w-full">
                  Clear all filters
                </Button>
              ) : null}
            </ScrollArea>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="border-b border-gray-200 bg-[#f9f9f9] px-4 py-6 sm:px-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Find expert organizers</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Connect with verified teams for trade shows, conferences, and corporate events.
              {visitorGeo?.countryName ? (
                <span className="block mt-1 text-[#004A96]">
                  Showing organizers in {visitorGeo.countryName} first.
                </span>
              ) : null}
            </p>

            <div className="mt-6 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, company, specialty, or description…"
                  value={searchTerm}
                  onChange={(e) => {
                    setPage(1)
                    setSearchTerm(e.target.value)
                  }}
                  className="h-10 pl-10"
                />
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Active:</span>
                {searchTerm.trim() && (
                  <Badge variant="secondary" className="gap-1 pr-1 font-normal">
                    “{searchTerm.trim().slice(0, 32)}
                    {searchTerm.trim().length > 32 ? "…" : ""}”
                    <button
                      type="button"
                      className="ml-1 rounded p-0.5 hover:bg-muted"
                      aria-label="Clear search"
                      onClick={() => setSearchTerm("")}
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedCities.map((city) => (
                  <Badge key={city} variant="secondary" className="gap-1 pr-1 font-normal">
                    {city}
                    <button
                      type="button"
                      className="ml-1 rounded p-0.5 hover:bg-muted"
                      aria-label={`Remove ${city}`}
                      onClick={() => toggleFilter(city, selectedCities, setSelectedCities)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                {selectedCountries.map((country) => (
                  <Badge key={country} variant="secondary" className="gap-1 pr-1 font-normal">
                    {country}
                    <button
                      type="button"
                      className="ml-1 rounded p-0.5 hover:bg-muted"
                      aria-label={`Remove ${country}`}
                      onClick={() => toggleFilter(country, selectedCountries, setSelectedCountries)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                {selectedEventBuckets.map((bucketId) => {
                  const label =
                    facets.eventBuckets.find((b) => b.id === bucketId)?.label ?? bucketId
                  return (
                    <Badge key={bucketId} variant="secondary" className="gap-1 pr-1 font-normal">
                      Events: {label}
                      <button
                        type="button"
                        className="ml-1 rounded p-0.5 hover:bg-muted"
                        aria-label={`Remove ${label}`}
                        onClick={() => toggleEventBucket(bucketId)}
                      >
                        ×
                      </button>
                    </Badge>
                  )
                })}
                {selectedFollowerBuckets.map((bucketId) => {
                  const label =
                    facets.followerBuckets.find((b) => b.id === bucketId)?.label ?? bucketId
                  return (
                    <Badge key={bucketId} variant="secondary" className="gap-1 pr-1 font-normal">
                      Followers: {label}
                      <button
                        type="button"
                        className="ml-1 rounded p-0.5 hover:bg-muted"
                        aria-label={`Remove ${label}`}
                        onClick={() => toggleFollowerBucket(bucketId)}
                      >
                        ×
                      </button>
                    </Badge>
                  )
                })}
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={clearAllFilters}>
                  Clear all
                </Button>
              </div>
            )}
          </div>

          <div className="px-4 py-6 sm:px-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
                </span>{" "}
                of <span className="font-semibold text-foreground">{total}</span> organizers
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>

            {fetchError ? (
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="flex flex-col items-center py-14 text-center">
                  <Users className="mb-4 h-14 w-14 text-destructive/50" />
                  <h3 className="text-lg font-semibold text-gray-900">Could not load organizers</h3>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">{fetchError}</p>
                  <Button
                    className="mt-6 bg-[#004A96] hover:bg-[#003a75]"
                    onClick={() => {
                      setFetchError(null)
                      setRetryTick((t) => t + 1)
                    }}
                  >
                    Try again
                  </Button>
                </CardContent>
              </Card>
            ) : organizers.length === 0 ? (
              <Card className="border-dashed bg-white/80">
                <CardContent className="flex flex-col items-center py-14 text-center">
                  <Users className="mb-4 h-14 w-14 text-muted-foreground/40" />
                  <h3 className="text-lg font-semibold text-gray-900">No organizers match</h3>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Try clearing filters or searching with a shorter keyword.
                  </p>
                  <Button className="mt-6 bg-[#004A96] hover:bg-[#003a75]" onClick={clearAllFilters}>
                    Reset filters & search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {organizers.map((organizer) => {
                  const title = organizerDisplayName(organizer)
                  const locationLabel = organizerLocationLine(organizer)
                  const planSlug = organizer.planSlug || "organizer-free"
                  const planLabel = getPlanDisplayName(planSlug)
                  const planColors = getPlanColor(planSlug)
                  const showPlanBadge = planSlug !== "organizer-free"
                  return (
                    <Card
                      key={organizer.id}
                      className="group flex h-full cursor-pointer flex-col overflow-hidden border-gray-200/80 bg-white p-0 shadow-sm transition-shadow hover:shadow-md"
                      onClick={() => handleCardClick(organizer)}
                    >
                      <div className="relative aspect-[5/4] w-full shrink-0 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                        <AppImage
                          src={organizer.image}
                          alt={title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          className="object-contain object-center p-2"
                        />
                        {organizer.featured && (
                          <Badge className="absolute left-1.5 top-1.5 px-1.5 py-0 text-[10px] bg-orange-500 text-white hover:bg-orange-600">
                            Featured
                          </Badge>
                        )}
                        {organizer.verified && (
                          <Badge className="absolute right-1.5 top-1.5 px-1.5 py-0 text-[10px] bg-emerald-600 text-white hover:bg-emerald-700">
                            <Award className="mr-0.5 h-2.5 w-2.5" />
                            Verified
                          </Badge>
                        )}
                      </div>

                      <CardContent className="flex flex-1 flex-col p-3">
                        <div className="mb-1.5 flex items-start justify-between gap-1.5">
                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">{title}</h3>
                            {showPlanBadge ? (
                              <span
                                className="mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                style={{ backgroundColor: planColors.bg, color: planColors.text }}
                              >
                                {planLabel}
                              </span>
                            ) : null}
                          </div>
                          <div className="flex shrink-0 items-center gap-0.5 text-xs">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-medium tabular-nums">
                              {Number(organizer.avgRating || 0).toFixed(1)}
                            </span>
                            <span className="text-muted-foreground">({organizer.totalReviews ?? 0})</span>
                          </div>
                        </div>

                        <div className="mb-1.5 flex items-start gap-1 text-xs text-muted-foreground">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#004A96]/70" />
                          <span className="line-clamp-2">{locationLabel}</span>
                        </div>

                        <div className="mt-auto flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            {organizer.yearsOfExperience} yrs
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                            {organizer.eventsOrganized} events
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {totalPages > 1 && organizers.length > 0 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}