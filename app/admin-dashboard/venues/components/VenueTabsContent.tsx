"use client"

import EntityBulkImport from "@/app/admin-dashboard/entity-bulk-import"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TabsContent } from "@/components/ui/tabs"
import { Building2, CheckCircle, Clock, Filter, RefreshCw } from "lucide-react"
import type { useVenueManagement } from "../hooks/useVenueManagement"
import { VenueCardList } from "./VenueCardList"
import { VenueListPagination } from "./VenueListPagination"
import { VenueListSection } from "./VenueListSection"

type VenueManagementState = ReturnType<typeof useVenueManagement>

type VenueTabsContentProps = Pick<
  VenueManagementState,
  | "loading"
  | "statusFilter"
  | "setStatusFilter"
  | "filteredVenues"
  | "filteredPendingVenues"
  | "filteredActiveVenues"
  | "pendingVenues"
  | "paginatedAll"
  | "paginatedPending"
  | "paginatedActive"
  | "setListPage"
  | "cardActions"
  | "setSelectedVenue"
  | "setIsApproveDialogOpen"
  | "setIsRejectDialogOpen"
>

export function VenueTabsContent({
  loading,
  statusFilter,
  setStatusFilter,
  filteredVenues,
  filteredPendingVenues,
  filteredActiveVenues,
  pendingVenues,
  paginatedAll,
  paginatedPending,
  paginatedActive,
  setListPage,
  cardActions,
  setSelectedVenue,
  setIsApproveDialogOpen,
  setIsRejectDialogOpen,
}: VenueTabsContentProps) {
  return (
    <>
      <TabsContent value="all" className="space-y-6">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <Label className="shrink-0 text-sm text-muted-foreground">Status filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <VenueListSection
          icon={Building2}
          title="All Venues"
          description="Browse every venue; use search and status filter to narrow results."
          count={filteredVenues.length}
          pagination={paginatedAll}
          cardClassName="overflow-hidden border-slate-200/90 shadow-sm"
          headerClassName="border-b bg-gradient-to-r from-blue-50/90 to-indigo-50/40 pb-4 [&_svg]:text-blue-600"
          badgeClassName="border-blue-100 bg-blue-100 text-blue-900"
          emptyMessage="No venues match your search or filters."
          footer={
            <VenueListPagination
              page={paginatedAll.page}
              totalPages={paginatedAll.totalPages}
              onPageChange={setListPage}
            />
          }
        >
          <VenueCardList
            venues={paginatedAll.items}
            accent="blue"
            mode="manage"
            {...cardActions}
          />
        </VenueListSection>
      </TabsContent>

      <TabsContent value="pending" className="space-y-6">
        <VenueListSection
          icon={Clock}
          title="Pending Approval"
          description="Review submissions, edit details before approval, then approve or reject."
          count={pendingVenues.length === 0 ? 0 : filteredPendingVenues.length}
          pagination={paginatedPending}
          cardClassName="border-amber-200/80 shadow-sm"
          headerClassName="border-b bg-gradient-to-r from-amber-50/90 to-orange-50/50 pb-4 [&_svg]:text-amber-600"
          badgeClassName="border-amber-200 bg-amber-100 text-amber-900"
          emptyMessage={
            pendingVenues.length === 0
              ? "No pending venues for approval"
              : "No pending venues match your search."
          }
          footer={
            filteredPendingVenues.length > 0 ? (
              <VenueListPagination
                page={paginatedPending.page}
                totalPages={paginatedPending.totalPages}
                onPageChange={setListPage}
              />
            ) : null
          }
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-yellow-600" />
            </div>
          ) : pendingVenues.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <Clock className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p>No pending venues for approval</p>
            </div>
          ) : (
            <VenueCardList
              venues={paginatedPending.items}
              accent="amber"
              mode="pending"
              onView={cardActions.onView}
              onEdit={cardActions.onEdit}
              onApprove={(venue) => {
                setSelectedVenue(venue)
                setIsApproveDialogOpen(true)
              }}
              onReject={(venue) => {
                setSelectedVenue(venue)
                setIsRejectDialogOpen(true)
              }}
            />
          )}
        </VenueListSection>
      </TabsContent>

      <TabsContent value="active" className="space-y-6">
        <VenueListSection
          icon={CheckCircle}
          title="Active Venues"
          description="Published venues visible on the platform."
          count={filteredActiveVenues.length}
          pagination={paginatedActive}
          cardClassName="overflow-hidden border-emerald-200/80 shadow-sm"
          headerClassName="border-b bg-gradient-to-r from-emerald-50/90 to-teal-50/40 pb-4 [&_svg]:text-emerald-600"
          badgeClassName="border-emerald-100 bg-emerald-100 text-emerald-900"
          emptyMessage="No active venues match your search."
          footer={
            <VenueListPagination
              page={paginatedActive.page}
              totalPages={paginatedActive.totalPages}
              onPageChange={setListPage}
            />
          }
        >
          <VenueCardList
            venues={paginatedActive.items}
            accent="emerald"
            mode="manage"
            {...cardActions}
          />
        </VenueListSection>
      </TabsContent>

      <TabsContent value="bulk-import" className="space-y-6">
        <EntityBulkImport
          title="Venue Bulk Import"
          description="Import venues using the same core fields as Add Venue. Each venueName must be unique (not already in Biz and not repeated in the file)."
          endpoint="/venues/import"
          templateHeaders={[
            "venueName",
            "contactPerson",
            "email",
            "mobile",
            "venueImage",
            "address",
            "city",
            "state",
            "country",
            "maxCapacity",
            "isActive",
          ]}
          sampleRow={[
            "Grand Convention Center",
            "Alex Johnson",
            "manager@grandcc.com",
            "+1 555 120 4567",
            "https://cdn.example.com/venues/grand-convention-center.jpg",
            "123 Main Street, Downtown",
            "Chicago",
            "Illinois",
            "United States",
            "2500",
            "true",
          ]}
        />
      </TabsContent>
    </>
  )
}
