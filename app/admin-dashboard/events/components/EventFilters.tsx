"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { SearchInput } from "../../shared/components/SearchInput"
import type { Category } from "../types/event.types"

interface EventFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedStatus: string
  onStatusFilterChange: (value: string) => void
  selectedCategory: string
  onCategoryFilterChange: (value: string) => void
  categories: Category[]
}

export function EventFilters({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusFilterChange,
  selectedCategory,
  onCategoryFilterChange,
  categories,
}: EventFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search events or organizers..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={selectedStatus} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="pendingreview">Pending Review</SelectItem>
          <SelectItem value="flagged">Flagged</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
      <Select value={selectedCategory} onValueChange={onCategoryFilterChange}>
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories
            .filter((c) => c.isActive)
            .map((c) => (
              <SelectItem key={c.id} value={c.name.toLowerCase()}>
                {c.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  )
}
