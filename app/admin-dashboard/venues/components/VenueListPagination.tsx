"use client"

import { Fragment } from "react"
import { Button } from "@/components/ui/button"
import { VENUES_PER_PAGE } from "../types/venue.types"

type VenueListPaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function VenueListPagination({ page, totalPages, onPageChange }: VenueListPaginationProps) {
  if (totalPages <= 1) return null
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b)

  return (
    <nav aria-label="Venue pagination" className="flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages} &middot; {VENUES_PER_PAGE} venues per page
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        {pages.map((value, index) => (
          <Fragment key={value}>
            {index > 0 && value - pages[index - 1] > 1 ? (
              <span className="px-1 text-muted-foreground" aria-hidden="true">...</span>
            ) : null}
            <Button
              type="button"
              variant={value === page ? "default" : "outline"}
              size="sm"
              aria-label={`Go to page ${value}`}
              aria-current={value === page ? "page" : undefined}
              onClick={() => onPageChange(value)}
            >
              {value}
            </Button>
          </Fragment>
        ))}
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
    </nav>
  )
}
