"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, RefreshCw } from "lucide-react"
import {
  ApproveVenueDialog,
  EditVenueDialog,
  RejectVenueDialog,
  VenueSearchBar,
  VenueStatsCards,
  VenueTabsContent,
  ViewVenueDialog,
} from "./components"
import { useVenueManagement } from "./hooks/useVenueManagement"
import type { VenueTab } from "./types/venue.types"

// Add default export here
export default function VenueManagementPage({
  initialTab = "all",
}: {
  initialTab?: VenueTab
}) {
  const vm = useVenueManagement(initialTab)

  if (vm.loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Venue Management</h1>
          <p className="mt-1 text-gray-600">Manage and monitor all venues on the platform</p>
        </div>
        <Button variant="outline" onClick={() => void vm.loadVenues()} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      <VenueStatsCards
        totalVenues={vm.stats.totalVenues}
        activeVenues={vm.stats.activeVenues}
        pendingVenuesCount={vm.stats.pendingVenuesCount}
        verifiedVenues={vm.stats.verifiedVenues}
      />

      {vm.activeTab !== "bulk-import" ? (
        <VenueSearchBar
          searchTerm={vm.searchTerm}
          onSearchChange={vm.setSearchTerm}
          matchCount={vm.searchMatchCount}
        />
      ) : null}

      <Tabs
        value={vm.activeTab}
        onValueChange={(value) => vm.setActiveTab(value as VenueTab)}
        className="w-full"
      >
        <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-1 rounded-lg bg-muted/60 p-1 sm:grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All Venues
            <Badge variant="secondary" className="ml-1">
              {vm.stats.totalVenues}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending
            {vm.stats.pendingVenuesCount > 0 ? (
              <Badge variant="secondary" className="ml-1 bg-yellow-100 text-yellow-800">
                {vm.stats.pendingVenuesCount}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            Active
            <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800">
              {vm.stats.activeVenues}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="bulk-import">Bulk Import</TabsTrigger>
        </TabsList>

        <VenueTabsContent
          loading={vm.loading}
          statusFilter={vm.statusFilter}
          setStatusFilter={vm.setStatusFilter}
          filteredVenues={vm.filteredVenues}
          filteredPendingVenues={vm.filteredPendingVenues}
          filteredActiveVenues={vm.filteredActiveVenues}
          pendingVenues={vm.pendingVenues}
          paginatedAll={vm.paginatedAll}
          paginatedPending={vm.paginatedPending}
          paginatedActive={vm.paginatedActive}
          setListPage={vm.setListPage}
          cardActions={vm.cardActions}
          setSelectedVenue={vm.setSelectedVenue}
          setIsApproveDialogOpen={vm.setIsApproveDialogOpen}
          setIsRejectDialogOpen={vm.setIsRejectDialogOpen}
        />
      </Tabs>

      <ViewVenueDialog
        isOpen={vm.isViewDialogOpen}
        onClose={() => vm.setIsViewDialogOpen(false)}
        venue={vm.selectedVenue}
        loading={vm.detailLoading}
      />

      <EditVenueDialog
        isOpen={vm.isEditDialogOpen}
        onClose={() => vm.setIsEditDialogOpen(false)}
        venue={vm.selectedVenue}
        onSave={(formData) =>
          vm.selectedVenue ? vm.handleEditVenue(vm.selectedVenue.id, formData) : undefined
        }
      />

      <ApproveVenueDialog
        isOpen={vm.isApproveDialogOpen}
        onClose={() => vm.setIsApproveDialogOpen(false)}
        onConfirm={() => vm.selectedVenue && void vm.handleApproveVenue(vm.selectedVenue.id)}
      />

      <RejectVenueDialog
        isOpen={vm.isRejectDialogOpen}
        onClose={() => vm.setIsRejectDialogOpen(false)}
        onReject={(reason) => vm.selectedVenue && void vm.handleRejectVenue(vm.selectedVenue.id, reason)}
        venueName={vm.selectedVenue?.venueName}
      />
    </div>
  )
}