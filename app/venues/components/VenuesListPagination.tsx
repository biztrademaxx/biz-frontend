"use client"

import { Button } from "@/components/ui/button"
import { VENUES_PER_PAGE } from "../lib/venues-listing"

type VenuesListPaginationProps = {
  page: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
}

export function VenuesListPagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: VenuesListPaginationProps) {
  if (totalPages <= 1) return null

  const rangeStart = (page - 1) * VENUES_PER_PAGE + 1
  const rangeEnd = Math.min(page * VENUES_PER_PAGE, totalItems)

  return (
    <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-gray-200 pt-6 sm:flex-row">
      <p className="text-sm text-gray-600">
        Showing {rangeStart}–{rangeEnd} of {totalItems} venues · Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
