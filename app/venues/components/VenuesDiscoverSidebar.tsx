"use client"

import { Badge } from "@/components/ui/badge"
import { displayCountryLabel } from "../lib/venues-listing"

type VenuesDiscoverSidebarProps = {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedCities: string[]
  selectedCountries: string[]
  popularCities: string[]
  popularCountries: readonly string[]
  detectedCountry: string | null
  onToggleCity: (city: string) => void
  onToggleCountry: (country: string) => void
  onClearFilters: () => void
  className?: string
}

export function VenuesDiscoverSidebar({
  searchQuery,
  onSearchChange,
  selectedCities,
  selectedCountries,
  popularCities,
  popularCountries,
  detectedCountry,
  onToggleCity,
  onToggleCountry,
  onClearFilters,
  className = "",
}: VenuesDiscoverSidebarProps) {
  return (
    <aside className={className}>
      <div className="rounded-lg border bg-white p-4 sm:p-6 lg:sticky lg:top-8">
        <h2 className="mb-1 text-lg font-semibold text-gray-900 xl:text-xl">Discover Venues</h2>
        {detectedCountry ? (
          <p className="mb-4 text-xs text-gray-600 sm:text-sm">
            Venues in{" "}
            <span className="font-medium text-blue-700">{displayCountryLabel(detectedCountry) ?? detectedCountry}</span>{" "}
            are listed first based on your location.
          </p>
        ) : (
          <p className="mb-4 text-xs text-gray-600 sm:text-sm">Filter by city or country.</p>
        )}

        <div className="mb-4 hidden lg:block">
          <input
            type="search"
            placeholder="Search venues..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {(selectedCities.length > 0 || selectedCountries.length > 0) && (
          <div className="mb-4 rounded-md bg-blue-50 p-3">
            <h4 className="mb-2 text-sm font-medium text-blue-800">Active filters</h4>
            <div className="flex flex-wrap gap-1">
              {selectedCities.map((city) => (
                <Badge key={city} variant="secondary" className="bg-blue-100 text-blue-700">
                  {city}
                </Badge>
              ))}
              {selectedCountries.map((country) => (
                <Badge key={country} variant="secondary" className="bg-blue-100 text-blue-700">
                  {displayCountryLabel(country) ?? country}
                </Badge>
              ))}
            </div>
            <button
              type="button"
              onClick={onClearFilters}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-gray-700">Popular cities</h3>
          <div className="grid grid-cols-2 gap-2">
            {popularCities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => onToggleCity(city)}
                className={`rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  selectedCities.includes(city)
                    ? "bg-blue-100 font-medium text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-700">Popular countries</h3>
          <div className="grid max-h-[min(40vh,320px)] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:max-h-none">
            {popularCountries.map((country) => (
              <button
                key={country}
                type="button"
                onClick={() => onToggleCountry(country)}
                className={`rounded-md px-2 py-2 text-left text-sm transition-colors ${
                  selectedCountries.includes(country)
                    ? "bg-blue-100 font-medium text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {country}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
