"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import type { PaginatedVenueList } from "../types/venue.types"

type VenueListSectionProps = {
  icon: LucideIcon
  title: string
  description: string
  count: number
  pagination: PaginatedVenueList<unknown>
  headerClassName?: string
  cardClassName?: string
  badgeClassName?: string
  emptyMessage: string
  children: ReactNode
  footer?: ReactNode
}

export function VenueListSection({
  icon: Icon,
  title,
  description,
  count,
  pagination,
  headerClassName,
  cardClassName,
  badgeClassName,
  emptyMessage,
  children,
  footer,
}: VenueListSectionProps) {
  return (
    <Card className={cardClassName}>
      <CardHeader className={headerClassName}>
        <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
          <Icon className="h-5 w-5" />
          {title}
          <Badge variant="secondary" className={badgeClassName}>
            {count}
          </Badge>
          {pagination.total > 0 ? (
            <span className="text-sm font-normal text-muted-foreground">
              · {pagination.rangeStart}–{pagination.rangeEnd} of {pagination.total}
            </span>
          ) : null}
        </CardTitle>
        <p className="mt-1 text-sm font-normal text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {count === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            <Search className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p>{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
        {footer}
      </CardContent>
    </Card>
  )
}
