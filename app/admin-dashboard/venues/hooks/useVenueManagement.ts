"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  deriveVenueStatus,
  isApprovedVenue,
  paginateVenueList,
  venueMatchesSearch,
} from "../lib/venue-utils"
import {
  buildStatusPatchBody,
  buildVenuePatchBody,
  createVenue,
  deleteVenue,
  fetchAllVenues,
  fetchVenueById,
  patchVenue,
  sendVenueAccountEmail,
} from "../services/venues.api"
import type { Venue, VenueEditFormData, VenueListingStatus, VenueTab } from "../types/venue.types"
import { VENUES_PER_PAGE } from "../types/venue.types"

export function useVenueManagement(initialTab: VenueTab = "all") {
  const [venues, setVenues] = useState<Venue[]>([])
  const [pendingVenues, setPendingVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<VenueTab>(initialTab)
  const [listPage, setListPage] = useState(1)
  const [detailLoading, setDetailLoading] = useState(false)

  const loadVenues = useCallback(async () => {
    try {
      setLoading(true)
      const mapped = await fetchAllVenues()
      setVenues(mapped)
      setPendingVenues(mapped.filter((v) => !v.isVerified))
    } catch (error) {
      console.error("Error fetching venues:", error)
      toast.error("Failed to load venues")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadVenues()
  }, [loadVenues])

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  const filteredVenues = useMemo(
    () =>
      venues.filter((venue) => {
        const matchesStatus = statusFilter === "all" || venue.status === statusFilter
        return venueMatchesSearch(venue, searchTerm) && matchesStatus
      }),
    [venues, searchTerm, statusFilter],
  )

  const filteredPendingVenues = useMemo(
    () => pendingVenues.filter((v) => venueMatchesSearch(v, searchTerm)),
    [pendingVenues, searchTerm],
  )

  const filteredActiveVenues = useMemo(
    () => venues.filter((v) => isApprovedVenue(v) && venueMatchesSearch(v, searchTerm)),
    [venues, searchTerm],
  )

  const paginatedAll = useMemo(
    () => paginateVenueList(filteredVenues, listPage, VENUES_PER_PAGE),
    [filteredVenues, listPage],
  )
  const paginatedPending = useMemo(
    () => paginateVenueList(filteredPendingVenues, listPage, VENUES_PER_PAGE),
    [filteredPendingVenues, listPage],
  )
  const paginatedActive = useMemo(
    () => paginateVenueList(filteredActiveVenues, listPage, VENUES_PER_PAGE),
    [filteredActiveVenues, listPage],
  )

  useEffect(() => {
    setListPage(1)
  }, [searchTerm, activeTab, statusFilter])

  useEffect(() => {
    const len =
      activeTab === "pending"
        ? filteredPendingVenues.length
        : activeTab === "active"
          ? filteredActiveVenues.length
          : activeTab === "all"
            ? filteredVenues.length
            : 0
    const totalPages = Math.max(1, Math.ceil(len / VENUES_PER_PAGE) || 1)
    if (listPage > totalPages) setListPage(totalPages)
  }, [
    activeTab,
    filteredVenues.length,
    filteredPendingVenues.length,
    filteredActiveVenues.length,
    listPage,
  ])

  const openView = useCallback(async (venue: Venue) => {
    setDetailLoading(true)
    try {
      const detailed = await fetchVenueById(venue.id)
      setSelectedVenue(detailed ?? venue)
      setIsViewDialogOpen(true)
    } catch {
      toast.error("Failed to load venue details")
    } finally {
      setDetailLoading(false)
    }
  }, [])

  const openEdit = useCallback(async (venue: Venue) => {
    setDetailLoading(true)
    try {
      const detailed = await fetchVenueById(venue.id)
      setSelectedVenue(detailed ?? venue)
      setIsEditDialogOpen(true)
    } catch {
      toast.error("Failed to load venue details")
    } finally {
      setDetailLoading(false)
    }
  }, [])

  const handleStatusChange = async (venueId: string, newStatus: VenueListingStatus) => {
    try {
      await patchVenue(venueId, buildStatusPatchBody(newStatus))
      const isVerified = newStatus === "active"
      const isActive = true
      const next = venues.map((venue) =>
        venue.id === venueId
          ? { ...venue, isVerified, isActive, status: deriveVenueStatus(isVerified, isActive) }
          : venue,
      )
      setVenues(next)
      setPendingVenues(next.filter((v) => !v.isVerified))
      toast.success(`Venue status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating venue status:", error)
      toast.error("Failed to update venue status")
    }
  }

  const handleVerificationToggle = async (venueId: string) => {
    try {
      const venue = venues.find((v) => v.id === venueId)
      if (!venue) return
      const nextVerified = !venue.isVerified
      await patchVenue(venueId, { isVerified: nextVerified, isActive: nextVerified })
      const updated = venues.map((v) =>
        v.id === venueId
          ? {
              ...v,
              isVerified: nextVerified,
              isActive: nextVerified,
              status: deriveVenueStatus(nextVerified, nextVerified),
            }
          : v,
      )
      setVenues(updated)
      setPendingVenues(updated.filter((v) => !v.isVerified))
      toast.success(`Venue verification ${!venue.isVerified ? "added" : "removed"}`)
    } catch (error) {
      console.error("Error updating verification:", error)
      toast.error("Failed to update verification status")
    }
  }

  const handleApproveVenue = async (venueId: string) => {
    try {
      await patchVenue(venueId, { isVerified: true, isActive: true })
      setIsApproveDialogOpen(false)
      await loadVenues()
      toast.success("Venue approved successfully")
    } catch (error) {
      console.error("Error approving venue:", error)
      toast.error("Failed to approve venue")
    }
  }

  const handleRejectVenue = async (venueId: string, _reason: string) => {
    try {
      await patchVenue(venueId, { isVerified: false, isActive: true })
      setIsRejectDialogOpen(false)
      await loadVenues()
      toast.success("Venue rejected successfully")
    } catch (error) {
      console.error("Error rejecting venue:", error)
      toast.error("Failed to reject venue")
    }
  }

  const handleDeleteVenue = async (venueId: string) => {
    if (!confirm("Are you sure you want to delete this venue?")) return
    try {
      await deleteVenue(venueId)
      setVenues(venues.filter((v) => v.id !== venueId))
      setPendingVenues(pendingVenues.filter((v) => v.id !== venueId))
      toast.success("Venue deleted successfully")
    } catch (error) {
      console.error("Error deleting venue:", error)
      toast.error("Failed to delete venue")
    }
  }

  const handleSendVenueMessage = (venue: Venue) => {
    if (!venue.email?.trim()) {
      toast.error("Venue email is missing")
      return
    }
    void sendVenueAccountEmail(venue.id)
      .then(() => toast.success(`Account email sent to ${venue.email}`))
      .catch((error) => {
        console.error("Error sending venue email:", error)
        toast.error("Failed to send venue email")
      })
  }

  const handleAddVenue = async (formData: Record<string, unknown>) => {
    try {
      const result = await createVenue(formData)
      if ((result as { error?: string })?.error) throw new Error((result as { error: string }).error)
      await loadVenues()
      toast.success("Venue created successfully")
    } catch (error) {
      console.error("Error creating venue:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create venue")
    }
  }

  const handleEditVenue = async (venueId: string, formData: VenueEditFormData) => {
    try {
      await patchVenue(venueId, buildVenuePatchBody(formData))
      setIsEditDialogOpen(false)
      await loadVenues()
      toast.success("Venue updated successfully")
    } catch (error) {
      console.error("Error updating venue:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update venue")
    }
  }

  const stats = useMemo(
    () => ({
      totalVenues: venues.length,
      activeVenues: venues.filter((v) => isApprovedVenue(v)).length,
      pendingVenuesCount: pendingVenues.length,
      verifiedVenues: venues.filter((v) => isApprovedVenue(v)).length,
    }),
    [venues, pendingVenues],
  )

  const searchMatchCount =
    activeTab === "pending"
      ? filteredPendingVenues.length
      : activeTab === "active"
        ? filteredActiveVenues.length
        : filteredVenues.length

  const cardActions = {
    onView: openView,
    onEdit: openEdit,
    onSendMessage: handleSendVenueMessage,
    onStatusChange: handleStatusChange,
    onVerificationToggle: handleVerificationToggle,
    onDelete: handleDeleteVenue,
  }

  return {
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    activeTab,
    setActiveTab,
    listPage,
    setListPage,
    selectedVenue,
    setSelectedVenue,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isViewDialogOpen,
    setIsViewDialogOpen,
    isApproveDialogOpen,
    setIsApproveDialogOpen,
    isRejectDialogOpen,
    setIsRejectDialogOpen,
    detailLoading,
    filteredVenues,
    filteredPendingVenues,
    filteredActiveVenues,
    pendingVenues,
    paginatedAll,
    paginatedPending,
    paginatedActive,
    stats,
    searchMatchCount,
    cardActions,
    loadVenues,
    handleApproveVenue,
    handleRejectVenue,
    handleEditVenue,
    handleAddVenue,
  }
}
