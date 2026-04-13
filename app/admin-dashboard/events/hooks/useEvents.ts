"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "@/hooks/use-toast"
import * as api from "../services/events.api"
import type { Event, Category } from "../types/event.types"
import { getOrganizerDisplay, getCategoryDisplay } from "../types/event.types"

function normalizeStatusLabel(status: unknown): Event["status"] {
  const raw = String(status ?? "").trim().toUpperCase()
  switch (raw) {
    case "PUBLISHED":
    case "APPROVED":
      return "Approved"
    case "PENDING_APPROVAL":
    case "PENDING REVIEW":
    case "PENDING_REVIEW":
      return "Pending Review"
    case "REJECTED":
      return "Rejected"
    case "CANCELLED":
    case "FLAGGED":
      return "Flagged"
    case "DRAFT":
    default:
      return "Draft"
  }
}

function normalizeEvent(raw: any): Event {
  const organizerStr = getOrganizerDisplay(raw.organizer)
  const categoryVal = Array.isArray(raw.category)
    ? raw.category
    : (typeof raw.category === "string" && raw.category.trim() ? [raw.category.trim()] : [])
  const categoryStr = categoryVal.length > 0 ? categoryVal : getCategoryDisplay(raw.category)
  return {
    ...raw,
    organizer: organizerStr,
    category: categoryStr,
    date: raw.startDate ?? raw.date ?? "",
    endDate: raw.endDate ?? "",
    location: raw.city ?? raw.location ?? raw.venue ?? "",
    venue: typeof raw.venue === "string" ? raw.venue : (raw.venue?.venueName ?? raw.venue?.name ?? ""),
    status: normalizeStatusLabel(raw.status),
    attendees: raw.currentAttendees ?? raw.attendees ?? 0,
    maxCapacity: raw.maxAttendees ?? raw.maxCapacity ?? 0,
    featured: raw.featured ?? raw.isFeatured ?? false,
    vip: raw.vip ?? raw.isVIP ?? false,
    isPublic: raw.isPublic ?? true,
    isVerified: !!raw.isVerified,
    verifiedAt: raw.verifiedAt ?? null,
    verifiedBy: raw.verifiedBy ?? null,
    verifiedBadgeImage: raw.verifiedBadgeImage ?? null,
  }
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.getEvents()
      const list = data.events ?? data.data?.events ?? []
      setEvents((Array.isArray(list) ? list : []).map(normalizeEvent))
    } catch (error) {
      console.error("Error fetching events:", error)
      toast({ title: "Error", description: "Failed to load events", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const data = await api.getEventCategories()
      const list = Array.isArray(data) ? data : (data as any)?.data ?? []
      setCategories(list)
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([])
    } finally {
      setCategoriesLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const eventCounts = {
    all: events.length,
    pending: events.filter((e) => e.status === "Pending Review").length,
    approved: events.filter((e) => e.status === "Approved").length,
    flagged: events.filter((e) => e.status === "Flagged").length,
    featured: events.filter((e) => e.featured).length,
    vip: events.filter((e) => e.vip).length,
    verified: events.filter((e) => e.isVerified).length,
  }

  const handleStatusChange = useCallback(async (eventId: string, newStatus: Event["status"]) => {
    try {
      const result = await api.updateEvent(eventId, { status: newStatus })
      const updated = (result as any)?.data ?? (result as any)?.event
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, status: newStatus, isVerified: updated?.isVerified ?? e.isVerified, verifiedBadgeImage: updated?.verifiedBadgeImage ?? e.verifiedBadgeImage, verifiedAt: updated?.verifiedAt ?? e.verifiedAt, verifiedBy: updated?.verifiedBy ?? e.verifiedBy }
            : e
        )
      )
      toast({ title: "Status Updated", description: `Event status changed to ${newStatus}` })
    } catch (error) {
      console.error("Failed to update event status:", error)
      toast({ title: "Error", description: "Failed to update event status", variant: "destructive" })
    }
  }, [])

  const handleFeatureToggle = useCallback(async (eventId: string, current: boolean) => {
    try {
      await api.updateEvent(eventId, { featured: !current })
      setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, featured: !current } : e)))
    } catch (error) {
      console.error("Failed to toggle featured:", error)
    }
  }, [])

  const handleVipToggle = useCallback(async (eventId: string, current: boolean) => {
    try {
      await api.updateEvent(eventId, { vip: !current })
      setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, vip: !current } : e)))
    } catch (error) {
      console.error("Failed to toggle VIP:", error)
    }
  }, [])

  const handlePublicToggle = useCallback(async (eventId: string, current: boolean) => {
    try {
      await api.updateEvent(eventId, { isPublic: !current })
      setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, isPublic: !current } : e)))
    } catch (error) {
      console.error("Failed to toggle public flag:", error)
    }
  }, [])

  const handleVerifyToggle = useCallback(async (event: Event, verify: boolean, customBadge?: File) => {
    try {
      setVerifying(true)
      const result = await api.verifyEvent(event.id, verify, customBadge)
      const u = (result as { data?: Record<string, unknown> })?.data
      setEvents((prev) =>
        prev.map((e) => {
          if (e.id !== event.id) return e
          if (!u) {
            return {
              ...e,
              isVerified: verify,
              verifiedAt: verify ? new Date().toISOString() : null,
              verifiedBy: verify ? e.verifiedBy : null,
              verifiedBadgeImage: verify ? e.verifiedBadgeImage : null,
            }
          }
          const at = u.verifiedAt
          return {
            ...e,
            isVerified: !!u.isVerified,
            verifiedAt:
              at == null
                ? null
                : typeof at === "string"
                  ? at
                  : new Date(at as Date).toISOString(),
            verifiedBy: (u.verifiedBy as string | null) ?? null,
            verifiedBadgeImage: (u.verifiedBadgeImage as string | null) ?? null,
          }
        })
      )
      setIsVerifyDialogOpen(false)
      toast({ title: verify ? "Event Verified" : "Verification Removed", description: verify ? "Event has been marked as verified" : "Event verification has been removed" })
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to update verification", variant: "destructive" })
    } finally {
      setVerifying(false)
    }
  }, [])

  const handleDeleteEvent = useCallback(async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return
    try {
      await api.deleteEvent(eventId)
      setEvents((prev) => prev.filter((e) => e.id !== eventId))
      toast({ title: "Event Deleted", description: "Event has been deleted successfully" })
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete event", variant: "destructive" })
    }
  }, [])

  const handleEditEvent = useCallback((event: Event) => {
    setSelectedEvent(event)
    setIsEditing(true)
  }, [])

  const handleSaveEvent = useCallback((updatedEvent: Event) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === updatedEvent.id ? normalizeEvent(updatedEvent as any) : e))
    )
    setIsEditing(false)
    setSelectedEvent(null)
    toast({ title: "Event Updated", description: "Event details have been saved successfully" })
  }, [])

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    setSelectedEvent(null)
  }, [])

  const handleVerifyEvent = useCallback((event: Event) => {
    setSelectedEvent(event)
    setIsVerifyDialogOpen(true)
  }, [])

  return {
    events,
    categories,
    loading,
    categoriesLoading,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    selectedCategory,
    setSelectedCategory,
    activeTab,
    setActiveTab,
    eventCounts,
    selectedEvent,
    isEditing,
    isVerifyDialogOpen,
    setIsVerifyDialogOpen,
    verifying,
    fetchEvents,
    fetchCategories,
    handleStatusChange,
    handleFeatureToggle,
    handleVipToggle,
    handlePublicToggle,
    handleVerifyToggle,
    handleDeleteEvent,
    handleEditEvent,
    handleSaveEvent,
    handleCancelEdit,
    handleVerifyEvent,
  }
}
