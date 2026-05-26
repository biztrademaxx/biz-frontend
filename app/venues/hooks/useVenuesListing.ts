"use client"

import { getVenuePublicPath } from "@/lib/venue-dashboard-path"
import type { GeoHint } from "@/lib/browse-geo"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  fetchAllPublicVenues,
  filterPublicVenues,
  paginateVenues,
  popularCitiesForGeo,
  POPULAR_COUNTRIES,
  resolvePopularCountryName,
  sortVenuesByGeoCountry,
  VENUES_PER_PAGE,
  type PublicVenue,
} from "../lib/venues-listing"

export function useVenuesListing() {
  const searchParams = useSearchParams()
  const searchFromUrl = searchParams.get("search")
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [venues, setVenues] = useState<PublicVenue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [geo, setGeo] = useState<GeoHint | null>(null)

  const popularCities = useMemo(() => popularCitiesForGeo(geo), [geo])
  const detectedCountry = useMemo(() => resolvePopularCountryName(geo), [geo])

  const loadVenues = useCallback(async () => {
    try {
      setLoading(true)
      const list = await fetchAllPublicVenues()
      setVenues(list)
      setError(null)
    } catch {
      setError("Failed to load venues. Please try again.")
      setVenues([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadVenues()
  }, [loadVenues])

  useEffect(() => {
    if (searchFromUrl) setSearchQuery(searchFromUrl)
  }, [searchFromUrl])

  useEffect(() => {
    let cancelled = false
    fetch("/api/geo", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: GeoHint | null) => {
        if (cancelled || !data) return
        setGeo(data)
      })
      .catch(() => {})
      .finally(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const filteredVenues = useMemo(() => {
    const filtered = filterPublicVenues(venues, {
      searchQuery,
      selectedCities,
      selectedCountries,
    })
    return sortVenuesByGeoCountry(filtered, detectedCountry)
  }, [venues, searchQuery, selectedCities, selectedCountries, detectedCountry])

  const totalPages =
    filteredVenues.length > 0 ? Math.ceil(filteredVenues.length / VENUES_PER_PAGE) : 0

  const paginatedVenues = useMemo(
    () => paginateVenues(filteredVenues, currentPage, VENUES_PER_PAGE),
    [filteredVenues, currentPage],
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCities, selectedCountries])

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

  const toggleCityFilter = (city: string) => {
    setSelectedCities((prev) => (prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]))
  }

  const toggleCountryFilter = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country],
    )
  }

  const clearFilters = () => {
    setSearchQuery("")
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
    filteredVenues,
    paginatedVenues,
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
  }
}
