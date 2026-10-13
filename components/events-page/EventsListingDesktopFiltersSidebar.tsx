"use client"

import { useState } from "react"
import type { NameCount } from "./listing-types"
import { EVENTS_LISTING_STICKY_TOP_CLASS } from "./listing-constants"
import { SidebarCheckboxRow, SidebarSection } from "./EventsListingSidebarPrimitives"
import { LocationViewMoreModal } from "./LocationViewMoreModal"

const SIDEBAR_LOCATION_PREVIEW = 8

export type EventsListingDesktopFiltersSidebarProps = {
  calendarOpen: boolean
  setCalendarOpen: (v: boolean) => void
  selectedDateRange: string
  setSelectedDateRange: (v: string) => void
  setSelectedDate: (v: null) => void
  formatOpen: boolean
  setFormatOpen: (v: boolean) => void
  formats: NameCount[]
  selectedFormat: string
  setSelectedFormat: (v: string) => void
  locationOpen: boolean
  setLocationOpen: (v: boolean) => void
  locations: NameCount[]
  cities?: NameCount[]
  countries?: NameCount[]
  selectedLocation: string
  setSelectedLocation: (v: string) => void
  selectedCountry?: string
  setSelectedCountry?: (v: string) => void
  onNearYou?: () => void
  nearYouLoading?: boolean
  categoryOpen: boolean
  setCategoryOpen: (v: boolean) => void
  filteredCategories: NameCount[]
  selectedCategories: string[]
  handleCategoryToggle: (name: string) => void
  entryFeeOpen: boolean
  setEntryFeeOpen: (v: boolean) => void
  priceRange: string
  setPriceRange: (v: string) => void
  clearAllFilters: () => void
}

export function EventsListingDesktopFiltersSidebar({
  calendarOpen,
  setCalendarOpen,
  selectedDateRange,
  setSelectedDateRange,
  setSelectedDate,
  formatOpen,
  setFormatOpen,
  formats,
  selectedFormat,
  setSelectedFormat,
  locationOpen,
  setLocationOpen,
  locations,
  cities,
  countries,
  selectedLocation,
  setSelectedLocation,
  selectedCountry = "",
  setSelectedCountry,
  onNearYou,
  nearYouLoading,
  categoryOpen,
  setCategoryOpen,
  filteredCategories,
  selectedCategories,
  handleCategoryToggle,
  entryFeeOpen,
  setEntryFeeOpen,
  priceRange,
  setPriceRange,
  clearAllFilters,
}: EventsListingDesktopFiltersSidebarProps) {
  const [locationModalOpen, setLocationModalOpen] = useState(false)

  const cityList = cities && cities.length > 0 ? cities : locations
  const countryList = countries ?? []
  const previewLocations = locations.slice(0, SIDEBAR_LOCATION_PREVIEW)
  const hasMoreLocations = true

  return (
    <div className="lg:col-span-3 hidden lg:block">
      <div className={`sticky ${EVENTS_LISTING_STICKY_TOP_CLASS} z-10 self-start`}>
        <div className="border border-gray-200 bg-white">
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

          <SidebarSection title="🎯 Format" open={formatOpen} onToggle={() => setFormatOpen(!formatOpen)}>
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

          <SidebarSection
            title="📍 Location"
            open={locationOpen}
            onToggle={() => setLocationOpen(!locationOpen)}
          >
            {previewLocations.map((loc) => (
              <SidebarCheckboxRow
                key={loc.name}
                label={loc.name}
                count={loc.count}
                checked={selectedLocation === loc.name || selectedCountry === loc.name}
                onChange={() => {
                  if (selectedLocation === loc.name) {
                    setSelectedLocation("")
                    return
                  }
                  setSelectedLocation(loc.name)
                  setSelectedCountry?.("")
                }}
              />
            ))}
            {hasMoreLocations && (
              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                className="mx-4 mb-2 mt-1 w-[calc(100%-2rem)] rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-[#2563EB] transition-colors hover:bg-blue-50"
              >
                View More
              </button>
            )}
          </SidebarSection>

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

          <SidebarSection title="💰 Entry Fee" open={entryFeeOpen} onToggle={() => setEntryFeeOpen(!entryFeeOpen)}>
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

          <div
            role="button"
            tabIndex={0}
            onClick={clearAllFilters}
            onKeyDown={(ev) => {
              if (ev.key === "Enter" || ev.key === " ") {
                ev.preventDefault()
                clearAllFilters()
              }
            }}
            className="px-4 py-3 text-sm font-semibold text-blue-600 hover:bg-gray-50 cursor-pointer border-t"
          >
            Clear all filters
          </div>
        </div>
      </div>

      <LocationViewMoreModal
        open={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        cities={cityList}
        countries={countryList}
        selectedLocation={selectedLocation}
        selectedCountry={selectedCountry}
        onSelectCity={(name) => {
          setSelectedLocation(name)
          if (name) setSelectedCountry?.("")
        }}
        onSelectCountry={(name) => {
          setSelectedCountry?.(name)
          if (name) setSelectedLocation("")
        }}
        onNearYou={onNearYou}
        nearYouLoading={nearYouLoading}
      />
    </div>
  )
}
