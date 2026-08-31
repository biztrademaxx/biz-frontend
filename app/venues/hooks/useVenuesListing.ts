"use client"

import { getVenuePublicPath } from "@/lib/venue-dashboard-path"
import type { GeoHint } from "@/lib/browse-geo"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  buildVenuesListingQuery,
  extractVenuesFromApiPayload,
  popularCitiesForGeo,
  POPULAR_COUNTRIES,
  resolvePopularCountryName,
  VENUES_PER_PAGE,
  type PublicVenue,
} from "../lib/venues-listing"

const SEARCH_DEBOUNCE_MS = 400

export type VenuesListingInitial = {
  venues?: PublicVenue[]
  total?: number
  totalPages?: number
  visitorGeo?: GeoHint | null
}

export function useVenuesListing(initial: VenuesListingInitial = {}) {
  const searchParams = useSearchParams()
  const searchFromUrl = searchParams.get("search")
  const router = useRouter()

  const hasServerList = (initial.venues?.length ?? 0) > 0 || (initial.total ?? 0) > 0
  const [searchQuery, setSearchQueryState] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [venues, setVenues] = useState<PublicVenue[]>(initial.venues ?? [])
  const [total, setTotal] = useState(initial.total ?? 0)
  const [totalPages, setTotalPages] = useState(initial.totalPages ?? 1)
  const [loading, setLoading] = useState(!hasServerList)
  const [error, setError] = useState<string | null>(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [geo, setGeo] = useState<GeoHint | null>(initial.visitorGeo ?? null)
  const listingFetchReadyRef = useRef(false)

  const popularCities = useMemo(() => popularCitiesForGeo(geo), [geo])
  const detectedCountry = useMemo(() => resolvePopularCountryName(geo), [geo])

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchQuery), SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [searchQuery])

  useEffect(() => {
    if (searchFromUrl) setSearchQueryState(searchFromUrl)
  }, [searchFromUrl])

  useEffect(() => {
    if (initial.visitorGeo?.countryCode || initial.visitorGeo?.countryName) return
    let cancelled = false
    fetch("/api/geo", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: GeoHint | null) => {
        if (cancelled || !data) return
        setGeo(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [initial.visitorGeo])

  const fetchPage = useCallback(async (page: number) => {
    const qs = buildVenuesListingQuery({
      page,
      search: debouncedSearch,
      cities: selectedCities,
      countries: selectedCountries,
      visitorGeo: geo,
      limit: VENUES_PER_PAGE,
    })
    const response = await fetch(`/api/venues?${qs}`)
    if (!response.ok) throw new Error("Failed to fetch venues")
    return extractVenuesFromApiPayload(await response.json())
  }, [debouncedSearch, selectedCities, selectedCountries, geo])

  const loadVenues = useCallback(async () => {
    try {
      setLoading(true)
      const result = await fetchPage(currentPage)
      setVenues(result.venues)
      setTotal(result.total)
      setTotalPages(result.totalPages)
      setError(null)
    } catch {
      setError("Failed to load venues. Please try again.")
      setVenues([])
      setTotal(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [currentPage, fetchPage])

  useEffect(() => {
    const isFirstPaint = !listingFetchReadyRef.current
    listingFetchReadyRef.current = true
    const silent =
      isFirstPaint &&
      hasServerList &&
      currentPage === 1 &&
      !debouncedSearch &&
      selectedCities.length === 0 &&
      selectedCountries.length === 0
    if (silent) {
      setLoading(false)
      return
    }
    void loadVenues()
  }, [
    loadVenues,
    hasServerList,
    currentPage,
    debouncedSearch,
    selectedCities.length,
    selectedCountries.length,
  ])

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const goToPage = (page: number) => {
    setCurrentPage(page)
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const activeFilterCount = selectedCities.length + selectedCountries.length

  const setSearchQuery = (value: string) => {
    setCurrentPage(1)
    setSearchQueryState(value)
  }

  const toggleCityFilter = (city: string) => {
    setCurrentPage(1)
    setSelectedCities((prev) => (prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]))
  }

  const toggleCountryFilter = (country: string) => {
    setCurrentPage(1)
    setSelectedCountries((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country],
    )
  }

  const clearFilters = () => {
    setCurrentPage(1)
    setSearchQueryState("")
    setSelectedCities([])
    setSelectedCountries([])
  }

  const handleVenueClick = (venue: PublicVenue) => {
    router.push(getVenuePublicPath(venue.id, venue.venueName))
  }

  return {
    router,
    searchQuery,
    setSearchQuery,
    selectedCities,
    selectedCountries,
    venues,
    filteredVenues: venues,
    paginatedVenues: venues,
    currentPage,
    totalPages,
    goToPage,
    venuesPerPage: VENUES_PER_PAGE,
    loading,
    error,
    mobileFiltersOpen,
    setMobileFiltersOpen,
    activeFilterCount,
    popularCities,
    popularCountries: POPULAR_COUNTRIES,
    detectedCountry,
    toggleCityFilter,
    toggleCountryFilter,
    clearFilters,
    handleVenueClick,
    loadVenues,
    total,
  }
}
