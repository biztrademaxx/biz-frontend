"use client"

import { Button } from "@/components/ui/button"
import { VENUES_PER_PAGE } from "../types/venue.types"

type VenueListPaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function VenueListPagination({ page, totalPages, onPageChange }: VenueListPaginationProps) {
  if (totalPages <= 1) return null
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages} · {VENUES_PER_PAGE} venues per page
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
