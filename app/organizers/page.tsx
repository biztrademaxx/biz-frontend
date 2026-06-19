"use client"

import { useState, useEffect, useCallback } from "react"
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
import { apiFetch } from "@/lib/api"
import { fetchGeoHint, type GeoHint } from "@/lib/browse-geo"
import { getPublicProfilePath } from "@/lib/profile-path"
import {
  OrganizersFilterSidebar,
  type OrganizerFacets,
} from "@/components/organizers/organizers-filter-sidebar"

const PAGE_SIZE = 20

interface Organizer {
  id: string
  publicSlug?: string
  name: string
  image?: string | null
  company: string
  city?: string
  country?: string
  category?: string
  eventsOrganized: number
  yearsOfExperience: number
  specialties?: string[]
  verified: boolean
  featured: boolean
  avgRating: number
  totalReviews: number
}

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

const EMPTY_FACETS: OrganizerFacets = {
  cities: [],
  countries: [],
  eventBuckets: [],
  followerBuckets: [],
}

function normalizeFacetsPayload(data: unknown): OrganizerFacets {
  if (!data || typeof data !== "object") return EMPTY_FACETS
  const raw = data as Record<string, unknown>

  const toCountItems = (arr: unknown): OrganizerFacets["cities"] => {
    if (!Array.isArray(arr)) return []
    return arr.map((item) => {
      if (typeof item === "string") return { value: item, label: item, count: 0 }
      const row = item as { value?: string; label?: string; count?: number }
      const value = String(row.value ?? row.label ?? "").trim()
      return {
        value,
        label: String(row.label ?? value).trim(),
        count: Number(row.count) || 0,
      }
    }).filter((x) => x.value)
  }

  const toBuckets = (arr: unknown): OrganizerFacets["eventBuckets"] => {
    if (!Array.isArray(arr)) return []
    return arr.map((item) => {
      const row = item as { id?: string; label?: string; count?: number }
      const id = String(row.id ?? "").trim()
      return {
        id,
        label: String(row.label ?? id).trim(),
        count: Number(row.count) || 0,
      }
    }).filter((x) => x.id)
  }

  return {
    cities: toCountItems(raw.cities),
    countries: toCountItems(raw.countries),
    eventBuckets: toBuckets(raw.eventBuckets),
    followerBuckets: toBuckets(raw.followerBuckets),
  }
}

function buildOrganizersQuery(params: {
  page: number
  search: string
  cities: string[]
  countries: string[]
  eventBuckets: string[]
  followerBuckets: string[]
  visitorGeo: GeoHint | null
}) {
  const qs = new URLSearchParams()
  qs.set("page", String(params.page))
  qs.set("limit", String(PAGE_SIZE))
  const q = params.search.trim()
  if (q) qs.set("search", q)
  if (params.countries.length) qs.set("country", params.countries.join(","))
  if (params.cities.length) qs.set("city", params.cities.join(","))
  if (params.eventBuckets.length) qs.set("eventsBucket", params.eventBuckets.join(","))
  if (params.followerBuckets.length) qs.set("followersBucket", params.followerBuckets.join(","))
  if (params.countries.length === 0 && params.visitorGeo) {
    if (params.visitorGeo.countryName?.trim()) {
      qs.set("prioritizeCountry", params.visitorGeo.countryName.trim())
    }
    if (params.visitorGeo.countryCode?.trim()) {
      qs.set("prioritizeCountryCode", params.visitorGeo.countryCode.trim())
    }
    if (params.visitorGeo.city?.trim()) {
      qs.set("prioritizeCity", params.visitorGeo.city.trim())
    }
  }
  return qs.toString()
}

export default function OrganizersPage() {
  const router = useRouter()
  const [organizers, setOrganizers] = useState<Organizer[]>([])
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedEventBuckets, setSelectedEventBuckets] = useState<string[]>([])
  const [visitorGeo, setVisitorGeo] = useState<GeoHint | null>(null)
  const [selectedFollowerBuckets, setSelectedFollowerBuckets] = useState<string[]>([])
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [facets, setFacets] = useState<OrganizerFacets>(EMPTY_FACETS)

  useEffect(() => {
    fetchGeoHint().then(setVisitorGeo).catch(() => setVisitorGeo(null))
  }, [])

  useEffect(() => {
    const fetchFacets = async () => {
      try {
        const data = await apiFetch<unknown>("/api/organizers/facets", { auth: false })
        setFacets(normalizeFacetsPayload(data))
      } catch (error) {
        console.error("Error fetching organizer facets:", error)
      }
    }

    fetchFacets()
  }, [])

  useEffect(() => {
    const fetchOrganizers = async () => {
      setLoading(true)
      try {
        const query = buildOrganizersQuery({
          page,
          search: searchTerm,
          cities: selectedCities,
          countries: selectedCountries,
          eventBuckets: selectedEventBuckets,
          followerBuckets: selectedFollowerBuckets,
          visitorGeo,
        })
        const data = await apiFetch<{
          organizers: Organizer[]
          total: number
          totalPages: number
        }>(`/api/organizers?${query}`, {
          auth: false,
        })
        setOrganizers(data.organizers || [])
        setTotal(data.total ?? 0)
        setTotalPages(data.totalPages ?? 1)
      } catch (error) {
        console.error("Error fetching organizers:", error)
        setOrganizers([])
        setTotal(0)
        setTotalPages(1)
      } finally {
        setLoading(false)
        setInitialLoad(false)
      }
    }

    fetchOrganizers()
  }, [
    page,
    searchTerm,
    selectedCities,
    selectedCountries,
    selectedEventBuckets,
    selectedFollowerBuckets,
    visitorGeo,
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
    return (
      <div className="min-h-screen bg-[#f1f7fb] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#004A96] border-t-transparent" />
          <h1 className="text-xl font-semibold text-gray-900">Loading organizers</h1>
          <p className="mt-2 text-sm text-muted-foreground">Fetching professional event organizers…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
            {/* Mobile filter bar */}
      <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-gray-200/80 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
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
        <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block xl:w-72">
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
          <div className="border-b border-gray-200 bg-white px-4 py-6 sm:px-8">
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

            {organizers.length === 0 ? (
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
                        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">{title}</h3>
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
