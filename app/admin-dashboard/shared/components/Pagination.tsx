"use client"

import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

function buildPageList(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const pages: (number | "ellipsis")[] = [1]
  const windowStart = Math.max(2, page - 1)
  const windowEnd = Math.min(totalPages - 1, page + 1)
  if (windowStart > 2) pages.push("ellipsis")
  for (let p = windowStart; p <= windowEnd; p++) pages.push(p)
  if (windowEnd < totalPages - 1) pages.push("ellipsis")
  pages.push(totalPages)
  return pages
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const items = buildPageList(page, totalPages)

  return (
    <PaginationRoot className="justify-center py-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (page > 1) onPageChange(page - 1)
            }}
            className={page <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        {items.map((item, idx) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onPageChange(item)
                }}
                isActive={page === item}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (page < totalPages) onPageChange(page + 1)
            }}
            className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  )
}
