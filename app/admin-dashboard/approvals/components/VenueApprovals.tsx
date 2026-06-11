// app/admin/approvals/components/VenueApprovals.tsx
"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Clock, RefreshCw, Users } from "lucide-react"
import {
    ApproveVenueDialog,
    RejectVenueDialog,
    ViewVenueDialog,
} from "../../venues/components"
import { useVenueManagement } from "../../venues/hooks/useVenueManagement"
import type { VenueTab } from "../../venues/types/venue.types"

export default function VenueApprovals() {
    const vm = useVenueManagement("pending")

    if (vm.loading) {
        return (
            <div className="flex min-h-64 items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Tabs
                value={vm.activeTab}
                onValueChange={(value) => vm.setActiveTab(value as VenueTab)}
                className="w-full"
            >
                <TabsList className="mb-6 grid h-auto w-full max-w-md grid-cols-2 gap-1 rounded-lg bg-muted/60 p-1">
                    <TabsTrigger value="pending" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Pending
                        {vm.stats.pendingVenuesCount > 0 && (
                            <Badge variant="secondary" className="ml-1 bg-yellow-100 text-yellow-800">
                                {vm.stats.pendingVenuesCount}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="active" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Active
                        <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800">
                            {vm.stats.activeVenues}
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                    <VenueList
                        venues={vm.filteredPendingVenues || vm.pendingVenues || []}
                        vm={vm}
                        type="pending"
                    />
                </TabsContent>

                <TabsContent value="active">
                    <VenueList
                        venues={vm.filteredActiveVenues || []}
                        vm={vm}
                        type="active"
                    />
                </TabsContent>
            </Tabs>

            <ViewVenueDialog
                isOpen={vm.isViewDialogOpen}
                onClose={() => vm.setIsViewDialogOpen(false)}
                venue={vm.selectedVenue}
                loading={vm.detailLoading}
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

// Venue List Component
function VenueList({ venues, vm, type }: { venues: any[]; vm: any; type: "pending" | "active" }) {
    if (venues.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    {type === "pending" ? (
                        <Clock className="h-8 w-8 text-gray-400" />
                    ) : (
                        <Users className="h-8 w-8 text-gray-400" />
                    )}
                </div>
                <h3 className="text-lg font-semibold mb-2">
                    No {type === "pending" ? "Pending" : "Active"} Venues
                </h3>
                <p className="text-gray-500">
                    {type === "pending"
                        ? "All venue submissions have been reviewed."
                        : "No approved venues found."}
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {venues.map((venue: any) => (
                <div key={venue.id} className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold">{venue.venueName || "Unnamed Venue"}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {venue.city}, {venue.country}
                            </p>
                            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                <span>Capacity: {venue.capacity?.toLocaleString() || "N/A"}</span>
                                <span>Email: {venue.email || venue.contactEmail || "N/A"}</span>
                            </div>
                        </div>
                        {type === "pending" && (
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => vm.setSelectedVenue(venue) || vm.setIsViewDialogOpen(true)}
                                >
                                    Review
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => {
                                        vm.setSelectedVenue(venue)
                                        vm.setIsApproveDialogOpen(true)
                                    }}
                                >
                                    Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                        vm.setSelectedVenue(venue)
                                        vm.setIsRejectDialogOpen(true)
                                    }}
                                >
                                    Reject
                                </Button>
                            </div>
                        )}
                        {type === "active" && (
                            <div className="flex items-center gap-2">
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}