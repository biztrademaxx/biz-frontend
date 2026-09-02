// app/admin/approvals/components/VenueApprovals.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CheckCheck, Clock, RefreshCw, Users } from "lucide-react"
import {
    ApproveVenueDialog,
    RejectVenueDialog,
    ViewVenueDialog,
} from "../../venues/components"
import { useVenueManagement } from "../../venues/hooks/useVenueManagement"
import type { Venue, VenueTab } from "../../venues/types/venue.types"

export default function VenueApprovals() {
    const vm = useVenueManagement("pending")
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [bulkIds, setBulkIds] = useState<string[]>([])
    const [bulkApproving, setBulkApproving] = useState(false)

    const pendingList = vm.filteredPendingVenues || vm.pendingVenues || []

    useEffect(() => {
        const valid = new Set(pendingList.map((v) => v.id))
        setSelectedIds((prev) => {
            const next = new Set([...prev].filter((id) => valid.has(id)))
            if (next.size === prev.size) return prev
            return next
        })
    }, [pendingList])

    const openBulkApprove = (ids: string[]) => {
        if (ids.length === 0) return
        vm.setSelectedVenue(null)
        setBulkIds(ids)
        vm.setIsApproveDialogOpen(true)
    }

    const openSingleApprove = (venue: Venue) => {
        setBulkIds([])
        vm.setSelectedVenue(venue)
        vm.setIsApproveDialogOpen(true)
    }

    const handleConfirmApprove = async () => {
        if (bulkIds.length > 0) {
            setBulkApproving(true)
            try {
                await vm.handleBulkApproveVenues(bulkIds)
                setSelectedIds(new Set())
                setBulkIds([])
            } finally {
                setBulkApproving(false)
            }
            return
        }
        if (vm.selectedVenue) {
            await vm.handleApproveVenue(vm.selectedVenue.id)
        }
    }

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
                        venues={pendingList}
                        vm={vm}
                        type="pending"
                        selectedIds={selectedIds}
                        onSelectedIdsChange={setSelectedIds}
                        onApproveAll={() => openBulkApprove(pendingList.map((v) => v.id))}
                        onApproveSelected={() => openBulkApprove([...selectedIds])}
                        onApproveOne={openSingleApprove}
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
                onClose={() => {
                    if (bulkApproving) return
                    vm.setIsApproveDialogOpen(false)
                    setBulkIds([])
                }}
                onConfirm={() => void handleConfirmApprove()}
                count={bulkIds.length || 1}
                confirming={bulkApproving}
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

function VenueList({
    venues,
    vm,
    type,
    selectedIds,
    onSelectedIdsChange,
    onApproveAll,
    onApproveSelected,
    onApproveOne,
}: {
    venues: Venue[]
    vm: ReturnType<typeof useVenueManagement>
    type: "pending" | "active"
    selectedIds?: Set<string>
    onSelectedIdsChange?: (next: Set<string>) => void
    onApproveAll?: () => void
    onApproveSelected?: () => void
    onApproveOne?: (venue: Venue) => void
}) {
    const allIds = useMemo(() => venues.map((v) => v.id), [venues])
    const selectedCount = selectedIds?.size ?? 0
    const allSelected = type === "pending" && venues.length > 0 && selectedCount === venues.length
    const someSelected = selectedCount > 0 && !allSelected

    const toggleOne = (id: string, checked: boolean) => {
        if (!selectedIds || !onSelectedIdsChange) return
        const next = new Set(selectedIds)
        if (checked) next.add(id)
        else next.delete(id)
        onSelectedIdsChange(next)
    }

    const toggleAll = (checked: boolean) => {
        if (!onSelectedIdsChange) return
        onSelectedIdsChange(checked ? new Set(allIds) : new Set())
    }

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
            {type === "pending" && (
                <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                        <Checkbox
                            checked={allSelected ? true : someSelected ? "indeterminate" : false}
                            onCheckedChange={(value) => toggleAll(value === true)}
                            aria-label="Select all pending venues"
                        />
                        Select all ({venues.length})
                        {selectedCount > 0 && (
                            <span className="text-muted-foreground font-normal">
                                · {selectedCount} selected
                            </span>
                        )}
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={selectedCount === 0}
                            onClick={onApproveSelected}
                        >
                            Approve selected{selectedCount > 0 ? ` (${selectedCount})` : ""}
                        </Button>
                        <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={onApproveAll}
                        >
                            <CheckCheck className="mr-1.5 h-4 w-4" />
                            Approve all venues
                        </Button>
                    </div>
                </div>
            )}

            {venues.map((venue) => (
                <div key={venue.id} className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                            {type === "pending" && (
                                <Checkbox
                                    className="mt-1"
                                    checked={selectedIds?.has(venue.id) ?? false}
                                    onCheckedChange={(value) => toggleOne(venue.id, value === true)}
                                    aria-label={`Select ${venue.venueName || "venue"}`}
                                />
                            )}
                            <div className="min-w-0 flex-1">
                                <h3 className="text-lg font-semibold">{venue.venueName || "Unnamed Venue"}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {[venue.city, venue.country].filter(Boolean).join(", ") || "Location not set"}
                                </p>
                                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                    <span>Capacity: {venue.maxCapacity?.toLocaleString() || "N/A"}</span>
                                    <span>Email: {venue.email || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                        {type === "pending" && (
                            <div className="flex shrink-0 items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        vm.setSelectedVenue(venue)
                                        vm.setIsViewDialogOpen(true)
                                    }}
                                >
                                    Review
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => onApproveOne?.(venue)}
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
