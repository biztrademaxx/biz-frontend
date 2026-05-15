"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, ShieldCheck } from "lucide-react"

export type EventsListingActiveFilterBadgesProps = {
  selectedDate: Date | null
  onClearDate: () => void
  selectedLocation: string
  onClearLocation: () => void
  selectedFormat: string
  onClearFormat: () => void
  selectedCategory: string
  onClearCategory: () => void
  selectedCategories: string[]
  onToggleCategory: (name: string) => void
  activeTab: string
  onClearVerifiedTab: () => void
  hasActiveFilters: boolean
  onClearAll: () => void
}

export function EventsListingActiveFilterBadges({
  selectedDate,
  onClearDate,
  selectedLocation,
  onClearLocation,
  selectedFormat,
  onClearFormat,
  selectedCategory,
  onClearCategory,
  selectedCategories,
  onToggleCategory,
  activeTab,
  onClearVerifiedTab,
  hasActiveFilters,
  onClearAll,
}: EventsListingActiveFilterBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {selectedDate && (
        <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 text-xs sm:text-sm font-medium">
          <span className="font-bold">Date:</span> {selectedDate.toLocaleDateString()}
          <X className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer ml-1" onClick={onClearDate} />
        </Badge>
      )}
      {selectedLocation && (
        <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 text-xs sm:text-sm font-medium">
          <span className="font-bold">Location:</span> {selectedLocation}
          <X className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer ml-1" onClick={onClearLocation} />
        </Badge>
      )}
      {selectedFormat !== "All Formats" && (
        <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 text-xs sm:text-sm font-medium">
          <span className="font-bold">Format:</span> {selectedFormat}
          <X className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer ml-1" onClick={onClearFormat} />
        </Badge>
      )}
      {selectedCategory !== "All Events" && (
        <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 text-xs sm:text-sm font-medium">
          <span className="font-bold">Category:</span> {selectedCategory}
          <X className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer ml-1" onClick={onClearCategory} />
        </Badge>
      )}
      {selectedCategories.length > 0 &&
        selectedCategories.map((category) => (
          <Badge
            variant="secondary"
            key={category}
            className="flex items-center gap-1 px-3 py-1 text-xs sm:text-sm font-medium"
          >
            <span className="font-bold">Cat:</span> {category}
            <X className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer ml-1" onClick={() => onToggleCategory(category)} />
          </Badge>
        ))}

      {activeTab === "Verified" && (
        <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 text-xs sm:text-sm font-medium">
          <ShieldCheck className="w-3 h-3" />
          <span className="font-bold">Verified Only</span>
          <X className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer ml-1" onClick={onClearVerifiedTab} />
        </Badge>
      )}

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          className="text-xs sm:text-sm font-medium bg-transparent border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  )
}
