"use client"

import VenuesListingPageSkeleton from "@/components/VenuesListingPageSkeleton"
import { AppImage } from "@/components/app-image"
import { DEFAULT_VENUE_IMAGE, getVenueDisplayImageUrl } from "@/lib/default-venue-image"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { MapPin, Star } from "lucide-react"
import { VenuesDiscoverSidebar } from "./components/VenuesDiscoverSidebar"
import { VenuesListPagination } from "./components/VenuesListPagination"
import { useVenuesListing } from "./hooks/useVenuesListing"
import { displayCountryLabel, type PublicVenue } from "./lib/venues-listing"

function geoPrioritySubtitle(country: string | null): string {
  const label = displayCountryLabel(country) ?? country
  return label
    ? `Venues in ${label} are shown first, followed by other countries.`
    : "Best venues for your events"
}

function displayName(v: PublicVenue) {
  return v.venueName?.trim() || "Unnamed Venue"
}

function displayAddress(v: PublicVenue) {
  const country = displayCountryLabel(v.country) ?? v.country
  const parts = [v.address, v.city, v.state, country].filter((p) => p?.trim())
  return parts.length > 0 ? parts.join(", ") : "Address not provided"
}

export default function VenuesListingPage() {
  const vm = useVenuesListing()

  if (vm.loading) {
    return <VenuesListingPageSkeleton />
  }

  if (vm.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="mb-4 text-red-600">{vm.error}</p>
          <Button onClick={() => void vm.loadVenues()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:py-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Find Perfect Venues</h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            Discover amazing venues for your next event
            {vm.venues.length > 0 ? ` · ${vm.venues.length} listed` : ""}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <div className="order-1 min-w-0 w-full flex-1 lg:order-2">
            <div className="mb-4 space-y-3 lg:hidden">
              <input
                type="search"
                placeholder="Search venues..."
                value={vm.searchQuery}
                onChange={(e) => vm.setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => vm.setMobileFiltersOpen((v) => !v)}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm"
              >
                {vm.mobileFiltersOpen ? "Hide filters" : "Discover Venues — filters"}
                {vm.activeFilterCount > 0 ? ` (${vm.activeFilterCount} active)` : ""}
              </button>
            </div>

            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                {vm.filteredVenues.length} venue{vm.filteredVenues.length !== 1 ? "s" : ""} found
              </h2>
              <p className="text-sm text-gray-600 sm:text-base">{geoPrioritySubtitle(vm.detectedCountry)}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {vm.paginatedVenues.map((venue) => (
                <div
                  key={venue.id}
                  className="group cursor-pointer overflow-hidden rounded-sm border bg-white transition-shadow duration-300 hover:shadow-lg"
                  onClick={() => vm.handleVenueClick(venue)}
                >
                  <div className="relative h-44 w-full overflow-hidden sm:h-48">
                    <AppImage
                      src={getVenueDisplayImageUrl(venue)}
                      alt={venue.venueName || "Venue"}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      fallbackSrc={DEFAULT_VENUE_IMAGE}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4 sm:p-5">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 text-base font-semibold text-gray-900 sm:text-lg">
                        {displayName(venue)}
                      </h3>
                      <div className="flex shrink-0 items-center space-x-1">
                        <Star className="h-4 w-4 fill-current text-yellow-400" />
                        <span className="text-sm font-medium">{venue.averageRating?.toFixed(1) || "0.0"}</span>
                      </div>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <MapPin className="mr-1 mt-0.5 h-4 w-4 shrink-0" />
                      <span className="line-clamp-2 text-sm">{displayAddress(venue)}</span>
                    </div>
                  </CardContent>
                </div>
              ))}
            </div>

            <VenuesListPagination
              page={vm.currentPage}
              totalPages={vm.totalPages}
              totalItems={vm.filteredVenues.length}
              onPageChange={vm.goToPage}
            />

            {vm.filteredVenues.length === 0 && (
              <div className="py-12 text-center">
                <MapPin className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-xl font-semibold text-gray-900">No venues found</h3>
                <p className="mx-auto mb-6 max-w-md text-gray-600">
                  {vm.activeFilterCount > 0 || vm.searchQuery
                    ? "Try clearing filters or search to see more venues."
                    : "No verified venues are listed yet."}
                </p>
                <Button onClick={vm.clearFilters} className="bg-blue-600 hover:bg-blue-700">
                  Clear filters
                </Button>
              </div>
            )}
          </div>

          <VenuesDiscoverSidebar
            className={`order-2 w-full shrink-0 lg:order-1 lg:block lg:w-64 xl:w-72 ${
              vm.mobileFiltersOpen ? "block" : "hidden"
            }`}
            searchQuery={vm.searchQuery}
            onSearchChange={vm.setSearchQuery}
            selectedCities={vm.selectedCities}
            selectedCountries={vm.selectedCountries}
            popularCities={vm.popularCities}
            popularCountries={vm.popularCountries}
            detectedCountry={vm.detectedCountry}
            onToggleCity={vm.toggleCityFilter}
            onToggleCountry={vm.toggleCountryFilter}
            onClearFilters={vm.clearFilters}
          />
        </div>
      </div>
    </div>
  )
}
