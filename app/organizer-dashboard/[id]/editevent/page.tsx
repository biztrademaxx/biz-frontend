"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"
import {
  Search,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Edit,
  Trash2,
  Save,
  X,
  Users,
  Tag,
  ArrowLeft,
} from "lucide-react"
import Image from "next/image"

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  categories: string[]
  tags: string[]
  images: { url: string }[]
  location: {
    city: string
    venue: string
    country?: string
  }
  venue?: {
    venueCity?: string
    venueCountry?: string
  }
  pricing: {
    general: number
  }
  rating: {
    average: number
  }
  featured?: boolean
  status: string
  timings: {
    startDate: string
    endDate: string
  }
  capacity?: number
  organizer?: string
  generalPrice?: number
  vipPrice?: number
  premiumPrice?: number
  city?: string
  eventType?: string
}

// Helper function to normalize event data
const normalizeEvent = (event: any): Event => ({
  id: event.id || "",
  title: event.title || "",
  description: event.description || "",
  startDate: event.startDate || new Date().toISOString(),
  endDate: event.endDate || new Date().toISOString(),
  categories: event.categories || [],
  tags: event.tags || [],
  images: event.images || [],
  location: event.location || {
    city: event.city || "",
    venue: event.venue || "",
    country: "",
  },
  venue: event.venue || {},
  pricing: event.pricing || { general: event.generalPrice || 0 },
  rating: event.rating || { average: 0 },
  featured: event.featured || false,
  status: event.status || "draft",
  timings: event.timings || {
    startDate: event.startDate || new Date().toISOString(),
    endDate: event.endDate || new Date().toISOString(),
  },
  capacity: event.capacity || 0,
  organizer: event.organizer || "",
  generalPrice: event.generalPrice || event.pricing?.general || 0,
  vipPrice: event.vipPrice || 0,
  premiumPrice: event.premiumPrice || 0,
  city: event.city || event.location?.city || "",
  eventType: event.eventType || "",
})

export default function EditEventPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const organizerId = params.id as string
  const eventIdFromUrl = searchParams.get("id")

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Sidebar state
  const [categoryOpen, setCategoryOpen] = useState(true)
  const [statusOpen, setStatusOpen] = useState(true)
  const [featuredOpen, setFeaturedOpen] = useState(true)
  const [categorySearch, setCategorySearch] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [selectedFeatured, setSelectedFeatured] = useState<string[]>([])

  const DEFAULT_EVENT_IMAGE = "/herosection-images/test.jpg"

  const getEventImage = (event: Event) => {
    return event.images?.[0]?.url || DEFAULT_EVENT_IMAGE
  }

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiFetch<{ events?: any[] }>(
        `/api/organizers/${organizerId}/events?page=1&limit=100`,
        { auth: true },
      )

      const raw = data.events ?? []
      const validatedEvents = raw.map((event: any) => normalizeEvent(event))

      setEvents(validatedEvents)

      // Auto-select event from URL if provided
      if (eventIdFromUrl) {
        const eventToEdit = validatedEvents.find((e: Event) => e.id === eventIdFromUrl)
        if (eventToEdit) {
          setEditingEvent(eventToEdit)
          setIsEditing(true)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error fetching events:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (organizerId) {
      fetchEvents()
    }
  }, [organizerId])

  const handleEdit = (event: Event) => {
    setEditingEvent(normalizeEvent(event))
    setIsEditing(true)
    // Update URL to reflect the selected event
    router.replace(`/organizer-dashboard/${organizerId}/editevent?id=${event.id}`)
  }

const handleCancelEdit = () => {
  setEditingEvent(null)
  setIsEditing(false)
  router.back() // Use router.back() instead of replace
}

const handleSave = async () => {
  if (!editingEvent) return

  try {
    setSaving(true)
    await apiFetch(`/api/organizers/${organizerId}/events/${editingEvent.id}`, {
      method: "PUT",
      body: editingEvent,
      auth: true,
    })

    // Update local state
    setEvents(events.map((event) => (event.id === editingEvent.id ? editingEvent : event)))

    // Show success notification first
    toast({
      title: "Success",
      description: "Event updated successfully",
    })

    // Wait a moment for the toast to be visible, then navigate back
    setTimeout(() => {
      setIsEditing(false)
      setEditingEvent(null)
      router.back() // This will go back to the previous page (MyEvents page)
    }, 1000) // 1 second delay to see the toast

  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to save event")
    toast({
      title: "Error",
      description: "Failed to update event. Please try again.",
      variant: "destructive",
    })
    setSaving(false)
  }
}

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      await apiFetch(`/api/organizers/${organizerId}/events/${eventId}`, {
        method: "DELETE",
        auth: true,
      })

      setEvents(events.filter((event) => event.id !== eventId))
      toast({
        title: "Success",
        description: "Event deleted successfully",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event")
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (!editingEvent) return

    setEditingEvent((prev) =>
      prev
        ? {
            ...prev,
            [field]: value,
          }
        : null,
    )
  }

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    if (!editingEvent) return

    setEditingEvent((prev) => ({
      ...prev!,
      [parent]: {
        ...((prev as any)?.[parent] || {}),
        [field]: value,
      },
    }))
  }

  const handleCategoryChange = (index: number, value: string) => {
    if (!editingEvent) return

    const newCategories = [...(editingEvent.categories || [])]
    newCategories[index] = value
    setEditingEvent((prev) => (prev ? { ...prev, categories: newCategories } : null))
  }

  const addCategory = () => {
    if (!editingEvent) return
    setEditingEvent((prev) =>
      prev
        ? {
            ...prev,
            categories: [...(prev.categories || []), ""],
          }
        : null,
    )
  }

  const removeCategory = (index: number) => {
    if (!editingEvent) return
    const newCategories = (editingEvent.categories || []).filter((_, i) => i !== index)
    setEditingEvent((prev) => (prev ? { ...prev, categories: newCategories } : null))
  }

  // Filter events based on search and sidebar filters
  const filteredEvents = useMemo(() => {
    let filtered = events

    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (event.categories || []).some((cat) => cat.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((event) =>
        event.categories.some((cat) =>
          selectedCategories.some((selectedCat) => cat.toLowerCase().trim() === selectedCat.toLowerCase().trim()),
        ),
      )
    }

    if (selectedStatus.length > 0) {
      filtered = filtered.filter((event) => selectedStatus.includes(event.status))
    }

    if (selectedFeatured.length > 0) {
      if (selectedFeatured.includes("featured")) {
        filtered = filtered.filter((event) => event.featured)
      }
      if (selectedFeatured.includes("regular")) {
        filtered = filtered.filter((event) => !event.featured)
      }
    }

    return filtered
  }, [events, searchQuery, selectedCategories, selectedStatus, selectedFeatured])

  // Get unique categories for sidebar
  const categories = useMemo(() => {
    if (!events || events.length === 0) return []
    const categoryMap = new Map()
    events.forEach((event) => {
      if (event.categories && Array.isArray(event.categories)) {
        event.categories.forEach((cat) => {
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
        })
      }
    })
    return Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count }))
  }, [events])

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => category.name.toLowerCase().includes(categorySearch.toLowerCase()))
  }, [categories, categorySearch])

  // Pagination
  const itemsPerPage = 6
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage)
  const paginatedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
      return newCategories
    })
    setCurrentPage(1)
  }

  const handleStatusToggle = (status: string) => {
    setSelectedStatus((prev) => {
      const newStatus = prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
      return newStatus
    })
    setCurrentPage(1)
  }

  const handleFeaturedToggle = (type: string) => {
    setSelectedFeatured((prev) => {
      const newFeatured = prev.includes(type) ? prev.filter((f) => f !== type) : [...prev, type]
      return newFeatured
    })
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedCategories([])
    setSelectedStatus([])
    setSelectedFeatured([])
    setCategorySearch("")
    setCurrentPage(1)
  }

  const handleBackToMyEvents = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading events...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <Button onClick={fetchEvents} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBackToMyEvents} className="p-0 h-auto">
              <ArrowLeft className="w-5 h-5 mr-2" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{isEditing ? "Edit Event" : "Manage Events"}</h1>
              <p className="text-gray-600">{isEditing ? "Update event details" : "View and manage all events"}</p>
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Sidebar - Only show when not editing */}
          {!isEditing && (
            <div className="w-80 sticky top-6 self-start">
              <Card className="border border-gray-200 shadow-sm bg-white">
                <CardContent className="p-0">
                  {/* Search */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Category Section */}
                  <div className="border-b border-gray-100">
                    <button
                      onClick={() => setCategoryOpen(!categoryOpen)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                    >
                      <span className="text-gray-900 font-medium">Category</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${categoryOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {categoryOpen && (
                      <div className="px-4 pb-4">
                        <div className="relative mb-3">
                          <Input
                            type="text"
                            placeholder="Search categories..."
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            className="text-sm pr-8 border-gray-200"
                          />
                          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        </div>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {filteredCategories.map((category) => (
                            <div key={category.name} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.includes(category.name)}
                                  onChange={() => handleCategoryToggle(category.name)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{category.name}</span>
                              </div>
                              <span className="text-xs text-gray-500">{category.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Section */}
                  <div className="border-b border-gray-100">
                    <button
                      onClick={() => setStatusOpen(!statusOpen)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                    >
                      <span className="text-gray-900 font-medium">Status</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${statusOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {statusOpen && (
                      <div className="px-4 pb-4">
                        <div className="space-y-3">
                          {["draft", "published", "cancelled", "completed"].map((status) => (
                            <div key={status} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={selectedStatus.includes(status)}
                                  onChange={() => handleStatusToggle(status)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 capitalize">{status}</span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {events.filter((e) => e.status === status).length}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Featured Section */}
                  <div className="border-b border-gray-100">
                    <button
                      onClick={() => setFeaturedOpen(!featuredOpen)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                    >
                      <span className="text-gray-900 font-medium">Featured</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${featuredOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {featuredOpen && (
                      <div className="px-4 pb-4">
                        <div className="space-y-3">
                          {["featured", "regular"].map((type) => (
                            <div key={type} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={selectedFeatured.includes(type)}
                                  onChange={() => handleFeaturedToggle(type)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 capitalize">{type}</span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {type === "featured"
                                  ? events.filter((e) => e.featured).length
                                  : events.filter((e) => !e.featured).length}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Clear Filters */}
                  <div className="p-4">
                    <Button variant="outline" className="w-full bg-transparent" onClick={clearAllFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {isEditing && editingEvent ? (
              /* Edit Form */
              <Card className="bg-white shadow-lg mb-6">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold">Editing: {editingEvent.title}</h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center">
                          <Edit className="w-5 h-5 mr-2" />
                          Basic Information
                        </h3>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                          <Input
                            value={editingEvent.title}
                            onChange={(e) => handleInputChange("title", e.target.value)}
                            placeholder="Enter event title"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={editingEvent.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            placeholder="Enter event description"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <Input
                              type="date"
                              value={editingEvent.startDate ? editingEvent.startDate.split("T")[0] : ""}
                              onChange={(e) => handleInputChange("startDate", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <Input
                              type="date"
                              value={editingEvent.endDate ? editingEvent.endDate.split("T")[0] : ""}
                              onChange={(e) => handleInputChange("endDate", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Location Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center">
                          <MapPin className="w-5 h-5 mr-2" />
                          Location
                        </h3>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <Input
                            value={editingEvent.location?.city || editingEvent.city || ""}
                            onChange={(e) => {
                              handleNestedInputChange("location", "city", e.target.value)
                              handleInputChange("city", e.target.value)
                            }}
                            placeholder="Enter city"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                          <Input
                            value={editingEvent.location?.venue || ""}
                            onChange={(e) => handleNestedInputChange("location", "venue", e.target.value)}
                            placeholder="Enter venue name"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Categories */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium flex items-center">
                            <Tag className="w-5 h-5 mr-2" />
                            Categories
                          </h3>
                          <Button variant="outline" size="sm" onClick={addCategory}>
                            Add Category
                          </Button>
                        </div>

                        {(editingEvent.categories || []).map((category, index) => (
                          <div key={index} className="flex space-x-2">
                            <Input
                              value={category}
                              onChange={(e) => handleCategoryChange(index, e.target.value)}
                              placeholder="Enter category"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeCategory(index)}
                              disabled={(editingEvent.categories || []).length === 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Pricing & Status */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center">
                          <Users className="w-5 h-5 mr-2" />
                          Pricing & Status
                        </h3>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">General Price ($)</label>
                          <Input
                            type="number"
                            value={editingEvent.generalPrice || editingEvent.pricing?.general || 0}
                            onChange={(e) => {
                              const value = Number(e.target.value)
                              handleInputChange("generalPrice", value)
                              handleNestedInputChange("pricing", "general", value)
                            }}
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">VIP Price ($)</label>
                          <Input
                            type="number"
                            value={editingEvent.vipPrice || 0}
                            onChange={(e) => handleInputChange("vipPrice", Number(e.target.value))}
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Premium Price ($)</label>
                          <Input
                            type="number"
                            value={editingEvent.premiumPrice || 0}
                            onChange={(e) => handleInputChange("premiumPrice", Number(e.target.value))}
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                          <Input
                            value={editingEvent.eventType || ""}
                            onChange={(e) => handleInputChange("eventType", e.target.value)}
                            placeholder="Enter event type"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select
                            value={editingEvent.status}
                            onChange={(e) => handleInputChange("status", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="featured"
                            checked={editingEvent.featured || false}
                            onChange={(e) => handleInputChange("featured", e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                            Featured Event
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Events List View */
              <>
                {/* View Toggle and Results Count */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      Showing {paginatedEvents.length} of {filteredEvents.length} events
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="text-gray-600"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="text-gray-600"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>

                {/* Events Grid */}
                <div className="space-y-4">
                  {paginatedEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg">No events found</p>
                      <Button variant="outline" className="mt-4 bg-transparent" onClick={handleBackToMyEvents}>
                        Back to My Events
                      </Button>
                    </div>
                  ) : (
                    paginatedEvents.map((event) => (
                      <Card
                        key={event.id}
                        className="hover:shadow-md transition-shadow bg-white border border-gray-100"
                      >
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            {/* Event Image */}
                            <div className="flex-shrink-0">
                              <Image
                                src={getEventImage(event)}
                                alt={event.title}
                                width={200}
                                height={140}
                                className="w-48 h-32 object-cover rounded-lg"
                              />
                            </div>

                            {/* Event Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                                    <Badge variant={event.status === "published" ? "default" : "secondary"}>
                                      {event.status}
                                    </Badge>
                                    {event.featured && (
                                      <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                                    )}
                                  </div>

                                  <div className="flex items-center text-sm text-gray-600 mb-1">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span>{formatDate(event.startDate)}</span>
                                  </div>

                                  <div className="flex items-center text-sm text-gray-600 mb-3">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    <span>
                                      {event.location?.city || event.city || "TBD"}, {event.location?.venue || "TBD"}
                                    </span>
                                  </div>

                                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                                  <div className="flex items-center space-x-2">
                                    {(event.categories || []).slice(0, 2).map((category, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {category}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col items-end space-y-2 ml-4">
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(event)}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      <Edit className="w-4 h-4 mr-1" />
                                      Edit
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(event.id)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <Trash2 className="w-4 h-4 mr-1" />
                                      Delete
                                    </Button>
                                  </div>
                                  
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span>${event.generalPrice || event.pricing?.general || 0}</span>
                                    <span>•</span>
                                    <span>{event.rating?.average || "N/A"} ⭐</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
