"use client"

import { Button } from "@/components/ui/button"

export function EventsListingResultsHeader({
  paginatedCount,
  filteredCount,
  activeTab,
  currentPage,
  totalPages,
  onPageChange,
}: {
  paginatedCount: number
  filteredCount: number
  activeTab: string
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
      <span className="text-xs sm:text-sm font-bold text-gray-700">
        Showing <span className="text-blue-600">{paginatedCount}</span> of{" "}
        <span className="text-blue-600">{filteredCount}</span> events
        {activeTab === "Verified" && <span className="text-green-600 ml-2">• All verified events</span>}
      </span>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="font-bold text-gray-700 border text-xs sm:text-sm"
        >
          Previous
        </Button>

        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
          const page = i + 1
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded text-xs sm:text-sm font-bold ${
                currentPage === page
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              {page}
            </button>
          )
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="font-bold text-gray-700 border text-xs sm:text-sm"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
