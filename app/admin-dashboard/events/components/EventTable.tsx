"use client"

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShieldCheck } from "lucide-react"
import { EventFilters } from "./EventFilters"
import { EventRow } from "./EventRow"
import type { Event, Category } from "../types/event.types"
import { getOrganizerDisplay, getCategoryDisplay } from "../types/event.types"

interface EventTableProps {
  events: Event[]
  searchTerm: string
  selectedStatus: string
  selectedCategory: string
  activeTab: string
  eventCounts: Record<string, number>
  categories: Category[]
  onEdit: (event: Event) => void
  onStatusChange: (eventId: string, status: Event["status"]) => void
  onFeatureToggle: (eventId: string, current: boolean) => void
  onVipToggle: (eventId: string, current: boolean) => void
  onPublicToggle: (eventId: string, current: boolean) => void
  onDelete: (eventId: string) => void
  onPromote: (event: Event) => void
  onVerify: (event: Event) => void
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onCategoryFilterChange: (value: string) => void
  onTabChange: (value: string) => void
}

function getStatusColor(status: Event["status"]): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "Approved": return "default"
    case "Pending Review": return "secondary"
    case "Flagged":
    case "Rejected": return "destructive"
    case "Draft": return "outline"
    default: return "secondary"
  }
}

function filterEventsByTab(
  events: Event[],
  tab: string,
  searchTerm: string,
  selectedStatus: string,
  selectedCategory: string
): Event[] {
  const filtered = events.filter((event) => {
    const organizerStr = getOrganizerDisplay(event.organizer)
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      organizerStr.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      selectedStatus === "all" ||
      event.status.toLowerCase().replace(" ", "") === selectedStatus
    const categoryStr = getCategoryDisplay(event.category).toLowerCase()
    const matchesCategory =
      selectedCategory === "all" || categoryStr === selectedCategory
    return matchesSearch && matchesStatus && matchesCategory
  })
  switch (tab) {
    case "pending": return filtered.filter((e) => e.status === "Pending Review")
    case "approved": return filtered.filter((e) => e.status === "Approved")
    case "flagged": return filtered.filter((e) => e.status === "Flagged")
    case "featured": return filtered.filter((e) => e.featured)
    case "vip": return filtered.filter((e) => e.vip)
    case "verified": return filtered.filter((e) => e.isVerified)
    default: return filtered
  }
}

export function EventTable({
  events,
  searchTerm,
  selectedStatus,
  selectedCategory,
  activeTab,
  eventCounts,
  categories,
  onEdit,
  onStatusChange,
  onFeatureToggle,
  onVipToggle,
  onPublicToggle,
  onDelete,
  onPromote,
  onVerify,
  onSearchChange,
  onStatusFilterChange,
  onCategoryFilterChange,
  onTabChange,
}: EventTableProps) {
  const tabs = ["all", "pending", "approved", "flagged", "featured", "vip", "verified"]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
        <Badge className="bg-green-100 text-green-800">
          <ShieldCheck className="w-4 h-4 mr-1" />
          {eventCounts.verified} Verified
        </Badge>
      </div>
      <EventFilters
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        selectedStatus={selectedStatus}
        onStatusFilterChange={onStatusFilterChange}
        selectedCategory={selectedCategory}
        onCategoryFilterChange={onCategoryFilterChange}
        categories={categories}
      />
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All ({eventCounts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({eventCounts.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({eventCounts.approved})</TabsTrigger>
          <TabsTrigger value="flagged">Flagged ({eventCounts.flagged})</TabsTrigger>
          <TabsTrigger value="featured">Featured ({eventCounts.featured})</TabsTrigger>
          <TabsTrigger value="vip">VIP ({eventCounts.vip})</TabsTrigger>
          <TabsTrigger value="verified">
            <ShieldCheck className="w-4 h-4 mr-1" />
            Verified ({eventCounts.verified})
          </TabsTrigger>
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {filterEventsByTab(events, tab, searchTerm, selectedStatus, selectedCategory).map((event) => (
              <EventRow
                key={event.id}
                event={event}
                onEdit={onEdit}
                onStatusChange={onStatusChange}
                onFeatureToggle={onFeatureToggle}
                onVipToggle={onVipToggle}
                onPublicToggle={onPublicToggle}
                onDelete={onDelete}
                onPromote={onPromote}
                onVerify={onVerify}
                getStatusColor={getStatusColor}
              />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
