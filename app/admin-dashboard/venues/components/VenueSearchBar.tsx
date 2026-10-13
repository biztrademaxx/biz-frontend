"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

type VenueSearchBarProps = {
  searchTerm: string
  onSearchChange: (value: string) => void
  matchCount: number
}

export function VenueSearchBar({ searchTerm, onSearchChange, matchCount }: VenueSearchBarProps) {
  return (
    <Card>
      <CardContent className="p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by venue name, email, city, contact, address, or event…"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchTerm ? (
            <Button type="button" variant="outline" size="sm" onClick={() => onSearchChange("")}>
              Clear search
            </Button>
          ) : null}
          <p className="text-sm text-muted-foreground md:shrink-0">
            {matchCount} match{matchCount === 1 ? "" : "es"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
