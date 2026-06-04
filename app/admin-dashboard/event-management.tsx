"use client"

import { AppImage } from "@/components/app-image"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { apiFetch } from "@/lib/api"
import { uploadEventFileToBackend } from "@/components/organizer-create-event/upload-backend"
import { resolvedVerifiedBadgeImageUrl } from "@/lib/verified-event-badge"
import {
  Download,
  Edit,
  MoreHorizontal,
  Building2,
  Calendar,
  MapPin,
  Users,
  Star,
  Crown,
  TrendingUp,
  Search,
  Plus,
  Trash2,
  MessageSquare,
  ArrowLeft,
  Upload,
  X,
  Image,
  Video,
  FileText,
  ShieldCheck,
  ShieldOff,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

// âœ… UPDATED Event Interface with verification fields
interface Event {
  id: string
  title: string
  organizer: string
  organizerId: string
  date: string
  endDate: string
  location: string
  venue: string
  status: "Approved" | "Pending Review" | "Flagged" | "Rejected" | "Draft"
  attendees: number
  maxCapacity: number
  revenue: number
  ticketPrice: number
  category: string
  featured: boolean
  vip: boolean
  priority: "High" | "Medium" | "Low"
  description: string
  shortDescription: string
  subTitle?: string
  slug: string
  edition: string
  tags: string[]
  eventType: string
  timezone: string
  currency: string
  createdAt: string
  lastModified: string
  views: number
  registrations: number
  rating: number
  reviews: number
  image: string
  bannerImage: string
  vipImage?: string | null
  thumbnailImage: string
  images: string[]
  videos: string[]
  /** Single YouTube promo URL (stored normalized on backend) */
  youtubeVideoUrl?: string | null
  brochure: string
  layout: string
  documents: string[]
  promotionBudget: number
  socialShares: number
  
  // âœ… VERIFICATION FIELDS - MAKE SURE THESE ARE INCLUDED
  isVerified: boolean
  verifiedAt: string | null
  verifiedBy: string | null
  verifiedBadgeImage: string | null
}

interface Category {
  id: string
  name: string
  icon?: string
  color?: string
  isActive: boolean
  eventCount?: number
}

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

function normalizeEventCategoryNames(event: Event): string[] {
  const raw = (event as unknown as { category?: string | string[] }).category
  if (Array.isArray(raw)) {
    return raw.map((x) => String(x).trim()).filter(Boolean)
  }
  if (typeof raw === "string" && raw.trim()) {
    return [raw.trim()]
  }
  return []
}

/** API returns `eventType` as string[]; Radix Select requires a scalar `value`. */
function scalarEventType(raw: unknown): string {
  if (Array.isArray(raw)) {
    const first = raw.find((x) => typeof x === "string" && String(x).trim()) as string | undefined
    return first?.trim() || "in-person"
  }
  if (typeof raw === "string" && raw.trim()) return raw.trim()
  return "in-person"
}

function slugifyTitle(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

// Verification Dialog Component
function VerifyEventDialog({
  event,
  open,
  onOpenChange,
  onVerify,
  loading,
}: {
  event: Event | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerify: (verify: boolean, customBadge?: File) => void
  loading: boolean
}) {
  const [customBadgeFile, setCustomBadgeFile] = useState<File | null>(null)

  if (!event || !open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {event.isVerified ? "Remove Verification" : "Verify Event"}
          </h3>
          <button onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {!event.isVerified ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Verify "{event.title}" and optionally upload a custom badge image.
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="badge-upload">Custom Badge (Optional)</Label>
                <Input
                  id="badge-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCustomBadgeFile(e.target.files?.[0] || null)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, or SVG. Recommended: 100x100px
                </p>
              </div>

              {customBadgeFile && (
                <div>
                  <Label>Preview:</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <AppImage
                      src={URL.createObjectURL(customBadgeFile)}
                      alt="Custom badge preview"
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded border object-contain"
                      unoptimized
                    />
                    <div className="text-sm text-gray-600">
                      <p>Custom badge will be used</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </>
        ) : (
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to remove verification from "{event.title}"?
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setCustomBadgeFile(null)
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={event.isVerified ? "destructive" : "default"}
            onClick={() => {
              onVerify(!event.isVerified, customBadgeFile ?? undefined)

              if (!event.isVerified) {
                setCustomBadgeFile(null)
              }
            }}
            disabled={loading}
          >
            {loading ? "Processing..." : 
              event.isVerified ? "Remove Verification" : "Verify Event"}
          </Button>
        </div>
      </div>
    </div>
  )
}

function VipEventDialog({
  event,
  open,
  onOpenChange,
  onConfirm,
  loading,
}: {
  event: Event | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (file?: File) => void
  loading: boolean
}) {
  const [vipFile, setVipFile] = useState<File | null>(null)

  if (!event || !open) return null

  const enablingVip = !event.vip

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{enablingVip ? "Enable VIP Event" : "Disable VIP Event"}</h3>
          <button onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {enablingVip ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Upload VIP image for "{event.title}". This image is used only in homepage VIP events section.
            </p>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setVipFile(e.target.files?.[0] || null)}
            />
            {vipFile && (
              <AppImage
                src={URL.createObjectURL(vipFile)}
                alt="VIP image preview"
                width={96}
                height={96}
                className="h-24 w-24 rounded border object-cover"
                unoptimized
              />
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            Disable VIP for "{event.title}"? VIP image will be cleared.
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(vipFile ?? undefined)}
            disabled={loading || (enablingVip && !vipFile)}
            variant={enablingVip ? "default" : "destructive"}
          >
            {loading ? "Saving..." : enablingVip ? "Enable VIP" : "Disable VIP"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Verified Badge Display Component
function VerifiedBadge({ event }: { event: Event }) {
  if (!event.isVerified) return null
  const src = resolvedVerifiedBadgeImageUrl(true, event.verifiedBadgeImage)
  if (!src) return null

  return (
    <Badge className="bg-green-100 text-green-800 border border-green-300">
      <AppImage src={src} alt="Verified" width={16} height={16} className="mr-1 h-4 w-4 object-contain" />
      Verified
    </Badge>
  )
}

// File Upload Component
function FileUpload({
  label,
  accept,
  onFileUpload,
  multiple = false,
  currentFiles = [],
  onFileRemove,
}: {
  label: string
  accept: string
  onFileUpload: (files: File[]) => void
  multiple?: boolean
  currentFiles?: string[]
  onFileRemove?: (index: number) => void
}) {
  const [dragOver, setDragOver] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onFileUpload(files)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      onFileUpload(files)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById(`file-upload-${label}`)?.click()}
      >
        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">
          Drag & drop files here or click to upload
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {accept.includes("image") ? "Images" : accept.includes("video") ? "Videos" : "Documents"} accepted
        </p>
        <input
          id={`file-upload-${label}`}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      
      {/* Current files preview */}
      {currentFiles && currentFiles.length > 0 && (
        <div className="mt-3">
          <Label className="text-sm">Current Files:</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {currentFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm">
                {file.includes("image") ? (
                  <Image className="w-4 h-4" />
                ) : file.includes("video") ? (
                  <Video className="w-4 h-4" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                <span className="truncate max-w-32">
                  {file.split('/').pop()}
                </span>
                {onFileRemove && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onFileRemove(index)
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Image Preview Component
function ImagePreview({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <div className="relative group">
      <AppImage
        src={src}
        alt="Preview"
        width={80}
        height={80}
        className="h-20 w-20 rounded-lg border object-cover"
        unoptimized
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}

export { EditEventForm } from "./events/components/EditEventForm"
// Updated EventList component with CARD design (like the reference image)

function EventList({
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
  onDelete,
  onPromote,
  onVerify,
  onSearchChange,
  onStatusFilterChange,
  onCategoryFilterChange,
  onTabChange,
}: {
  events: Event[]
  searchTerm: string
  selectedStatus: string
  selectedCategory: string
  activeTab: string
  eventCounts: any
  categories: Category[]
  onEdit: (event: Event) => void
  onStatusChange: (eventId: string, status: Event["status"]) => void
  onFeatureToggle: (eventId: string, current: boolean) => void
  onVipToggle: (event: Event) => void
  onDelete: (eventId: string) => void
  onPromote: (event: Event) => void
  onVerify: (event: Event) => void
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onCategoryFilterChange: (value: string) => void
  onTabChange: (value: string) => void
}) {
  const getFilteredEvents = () => {
    return events.filter((event) => {
      const organizerStr = typeof event.organizer === "string" ? event.organizer : (event.organizer?.name ?? event.organizer?.email ?? "")
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        organizerStr.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus =
        selectedStatus === "all" ||
        event.status.toLowerCase().replace(" ", "") === selectedStatus
      const categoryStr = Array.isArray(event.category) ? (event.category[0] ?? "") : String(event.category ?? "")
      const matchesCategory =
        selectedCategory === "all" ||
        categoryStr.toLowerCase() === selectedCategory
      return matchesSearch && matchesStatus && matchesCategory
    })
  }

  const getFilteredByTab = () => {
    const baseFiltered = getFilteredEvents()
    switch (activeTab) {
      case "pending":
        return baseFiltered.filter((e) => e.status === "Pending Review")
      case "approved":
        return baseFiltered.filter((e) => e.status === "Approved")
      case "flagged":
        return baseFiltered.filter((e) => e.status === "Flagged")
      case "featured":
        return baseFiltered.filter((e) => e.featured)
      case "vip":
        return baseFiltered.filter((e) => e.vip)
      case "verified":
        return baseFiltered.filter((e) => e.isVerified)
      default:
        return baseFiltered
    }
  }

  const getStatusBadgeStyle = (status: Event["status"]) => {
    switch (status) {
      case "Approved":
        return { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500", label: "Live" }
      case "Pending Review":
        return { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "Upcoming" }
      case "Flagged":
        return { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", label: "Flagged" }
      case "Rejected":
        return { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-500", label: "Rejected" }
      case "Draft":
        return { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400", label: "Draft" }
      default:
        return { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400", label: status }
    }
  }

  const filteredEvents = getFilteredByTab()

  return (
    <div className="space-y-6">
      {/* Header with stats - like image */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Event</h1>
          <p className="text-gray-500 mt-1">Submit a new event listing</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" /> Add Event
          </Button>
        </div>
      </div>

      {/* Filter Tabs - Live, Upcoming, Ended, Draft, Featured */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-4">
        {[
          { id: "live", label: "Live", count: events.filter(e => e.status === "Approved").length },
          { id: "upcoming", label: "Upcoming", count: events.filter(e => e.status === "Pending Review").length },
          { id: "ended", label: "Ended", count: events.filter(e => e.status === "Flagged").length },
          { id: "draft", label: "Draft", count: events.filter(e => e.status === "Draft").length },
          { id: "featured", label: "Featured", count: events.filter(e => e.featured).length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === "live") onStatusFilterChange("approved")
              else if (tab.id === "upcoming") onStatusFilterChange("pendingreview")
              else if (tab.id === "ended") onStatusFilterChange("flagged")
              else if (tab.id === "draft") onStatusFilterChange("draft")
              else if (tab.id === "featured") onTabChange("featured")
            }}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${(tab.id === "live" && selectedStatus === "approved") ||
                (tab.id === "upcoming" && selectedStatus === "pendingreview") ||
                (tab.id === "ended" && selectedStatus === "flagged") ||
                (tab.id === "draft" && selectedStatus === "draft") ||
                (tab.id === "featured" && activeTab === "featured")
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {tab.label} <span className="ml-1 text-xs opacity-80">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Event Listings</span>
          <Badge className="bg-gray-100 text-gray-800">{filteredEvents.length} events found</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800">
            <ShieldCheck className="w-3 h-3 mr-1" />
            {events.filter(e => e.isVerified).length} Verified
          </Badge>
        </div>
      </div>

      {/* Categories Sidebar + Cards Grid Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar - Categories */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Categories</h3>
              <span className="text-xs text-gray-400">{categories.filter(c => c.isActive).length} total</span>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => onCategoryFilterChange("all")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center ${selectedCategory === "all" ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <span>All Categories</span>
                <span className="text-xs text-gray-400">{events.length}</span>
              </button>
              {categories.filter(c => c.isActive).slice(0, 10).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryFilterChange(cat.name.toLowerCase())}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center ${selectedCategory === cat.name.toLowerCase() ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color || "#3b82f6" }}></div>
                    <span>{cat.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{events.filter(e => {
                    const catStr = Array.isArray(e.category) ? e.category[0] : e.category
                    return catStr?.toLowerCase() === cat.name.toLowerCase()
                  }).length}</span>
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <Upload className="w-4 h-4 text-gray-500" />
                Import CSV
                <span className="text-xs text-gray-400 ml-auto">Bulk upload</span>
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <Download className="w-4 h-4 text-gray-500" />
                Export Report
                <span className="text-xs text-gray-400 ml-auto">Download events data</span>
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                Pending (86)
                <span className="text-xs text-amber-600 ml-auto">Review submissions</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Event Cards Grid */}
        <div className="flex-1">
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search events or organizers..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-white border-gray-200 rounded-lg"
              />
            </div>
            <Select value={selectedStatus} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-full sm:w-40 bg-white border-gray-200">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved / Live</SelectItem>
                <SelectItem value="pendingreview">Pending Review</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={onCategoryFilterChange}>
              <SelectTrigger className="w-full sm:w-40 bg-white border-gray-200">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.filter(c => c.isActive).map((cat) => (
                  <SelectItem key={cat.id} value={cat.name.toLowerCase()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Event Cards Grid - Beautiful card design like reference image */}
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-400">No events found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => {
                const statusStyle = getStatusBadgeStyle(event.status)
                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex flex-col md:flex-row gap-5">
                        {/* Event Image */}
                        <div className="md:w-32 lg:w-36 flex-shrink-0">
                          <AppImage
                            src={event.thumbnailImage || event.bannerImage || event.image || "https://placehold.co/400x300?text=Event"}
                            alt={event.title}
                            width={400}
                            height={112}
                            className="h-24 w-full rounded-lg object-cover md:h-28"
                          />
                        </div>

                        {/* Event Details */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                                {event.featured && (
                                  <Badge className="bg-purple-100 text-purple-800 border-0">
                                    <Star className="w-3 h-3 mr-1 fill-purple-500" /> Featured
                                  </Badge>
                                )}
                                {event.vip && (
                                  <Badge className="bg-yellow-100 text-yellow-800 border-0">
                                    <Crown className="w-3 h-3 mr-1" /> VIP
                                  </Badge>
                                )}
                                {event.isVerified && (
                                  <Badge className="bg-green-100 text-green-800 border-0">
                                    <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                                  </Badge>
                                )}
                              </div>
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text} mb-3`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                                {statusStyle.label}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span>{event.date} {event.endDate ? `- ${event.endDate}` : ""}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span className="truncate">{event.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span>{event.attendees.toLocaleString()} / {event.maxCapacity.toLocaleString()} attendees</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Building2 className="w-4 h-4 text-gray-400" />
                                  <span className="truncate">{typeof event.organizer === "string" ? event.organizer : event.organizer?.name || "Organizer"}</span>
                                </div>
                              </div>
                              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                                <span className="capitalize">Type: {event.eventType || "In-Person"}</span>
                                <span>Category: {Array.isArray(event.category) ? event.category[0] : event.category || "â€”"}</span>
                                {event.edition && <span>Edition: {event.edition}</span>}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(event)}
                                className="h-9 w-9 text-gray-500 hover:text-blue-600"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => onStatusChange(event.id, event.status === "Approved" ? "Pending Review" : "Approved")}>
                                    <i className="fas fa-exchange-alt w-4 mr-2 text-xs"></i>
                                    Change Status
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => onFeatureToggle(event.id, event.featured)}>
                                    <Star className="w-4 h-4 mr-2" />
                                    {event.featured ? "Remove Featured" : "Make Featured"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => onVipToggle(event)}>
                                    <Crown className="w-4 h-4 mr-2" />
                                    {event.vip ? "Remove VIP" : "Make VIP"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => onVerify(event)}>
                                    <ShieldCheck className="w-4 h-4 mr-2" />
                                    {event.isVerified ? "Remove Verification" : "Verify Event"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => onPromote(event)}>
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    Promote Event
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600" onClick={() => onDelete(event.id)}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Event
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
// Main Component
export default function EventManagement() {
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false)
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false)
  const [isVipDialogOpen, setIsVipDialogOpen] = useState(false)
  const [vipUpdating, setVipUpdating] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const router = useRouter()

  const fetchEvents = async () => {
    try {
      const data = await apiFetch<{ events?: any[]; data?: { events?: any[] } }>("/api/admin/events", { auth: true })
      const eventsList = data.events ?? data.data?.events ?? []
      const eventsWithVerification = (eventsList ?? []).map((event: any) => {
        const organizerStr =
          typeof event.organizer === "object" && event.organizer !== null
            ? (event.organizer.name ?? event.organizer.email ?? "")
            : String(event.organizer ?? "")
        const categoryStr = Array.isArray(event.category)
          ? event.category[0] ?? ""
          : String(event.category ?? "")
        return {
          ...event,
          organizer: organizerStr,
          category: categoryStr,
          date: event.startDate ?? event.date ?? "",
          endDate: event.endDate ?? "",
          location: event.city ?? event.location ?? event.venue ?? "",
          venue: typeof event.venue === "string" ? event.venue : (event.venue?.venueName ?? event.venue?.name ?? ""),
          status: normalizeStatusLabel(event.status),
          attendees: event.currentAttendees ?? event.attendees ?? 0,
          maxCapacity: event.maxAttendees ?? event.maxCapacity ?? 0,
          featured: event.featured ?? event.isFeatured ?? false,
          vip: event.vip ?? event.isVIP ?? false,
          vipImage: event.vipImage ?? null,
          eventType: scalarEventType(event.eventType),
          isVerified: !!event.isVerified,
          verifiedAt: event.verifiedAt ?? null,
          verifiedBy: event.verifiedBy ?? null,
          verifiedBadgeImage: event.verifiedBadgeImage ?? null,
        }
      })
      setEvents(eventsWithVerification)
    } catch (error) {
      console.error("Error fetching events:", error)
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiFetch<Category[] | { data?: Category[] }>("/api/admin/event-categories", { auth: true })
        const list = Array.isArray(data) ? data : (data as any)?.data ?? []
        setCategories(list)
      } catch (error) {
        console.error("Error fetching categories:", error)
        setCategories([])
      } finally {
        setCategoriesLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const handleStatusChange = async (eventId: string, newStatus: Event["status"]) => {
    try {
      const result = await apiFetch<{ success?: boolean; data?: any; event?: any }>(`/api/admin/events/${eventId}`, {
        method: "PATCH",
        body: { status: newStatus },
        auth: true,
      })
      const updated = result.data ?? result.event
      setEvents((prev) => prev.map((e) => {
        if (e.id === eventId) {
          return {
            ...e,
            status: newStatus,
            isVerified: updated?.isVerified ?? e.isVerified,
            verifiedBadgeImage: updated?.verifiedBadgeImage ?? e.verifiedBadgeImage,
            verifiedAt: updated?.verifiedAt ?? e.verifiedAt,
            verifiedBy: updated?.verifiedBy ?? e.verifiedBy,
          }
        }
        return e
      }))
      toast({
        title: "Status Updated",
        description: `Event status changed to ${newStatus}`,
      })
    } catch (error) {
      console.error("Failed to update event status:", error)
      toast({
        title: "Error",
        description: "Failed to update event status",
        variant: "destructive",
      })
    }
  }

  const handleFeatureToggle = async (eventId: string, current: boolean) => {
    try {
      const result = await apiFetch<{ event?: any }>(`/api/admin/events/${eventId}`, {
        method: "PATCH",
        body: { featured: !current },
        auth: true,
      })
      
      const updated = result.data ?? result.event
      setEvents((prev) => prev.map((e) => {
        if (e.id === eventId) {
          return {
            ...e,
            featured: !current,
            isVerified: updated?.isVerified ?? e.isVerified,
            verifiedBadgeImage: updated?.verifiedBadgeImage ?? e.verifiedBadgeImage,
          }
        }
        return e
      }))
    } catch (error) {
      console.error("Failed to toggle featured:", error)
    }
  }

  const handleVipToggle = (event: Event) => {
    setSelectedEvent(event)
    setIsVipDialogOpen(true)
  }

  const handleConfirmVipToggle = async (file?: File) => {
    if (!selectedEvent) return
    try {
      setVipUpdating(true)
      const enablingVip = !selectedEvent.vip
      let vipImage: string | null = null

      if (enablingVip) {
        if (!file) {
          toast({
            title: "VIP image required",
            description: "Please upload VIP image before enabling VIP.",
            variant: "destructive",
          })
          return
        }
        vipImage = await uploadEventFileToBackend(file, "image")
      }

      const result = await apiFetch<{ event?: any; data?: any }>(`/api/admin/events/${selectedEvent.id}`, {
        method: "PATCH",
        body: enablingVip ? { vip: true, vipImage } : { vip: false, vipImage: null },
        auth: true,
      })
      
      const updated = result.data ?? result.event
      setEvents((prev) => prev.map((e) => {
        if (e.id === selectedEvent.id) {
          return {
            ...e,
            vip: enablingVip,
            vipImage: updated?.vipImage ?? (enablingVip ? vipImage : null),
            isVerified: updated?.isVerified ?? e.isVerified,
            verifiedBadgeImage: updated?.verifiedBadgeImage ?? e.verifiedBadgeImage,
          }
        }
        return e
      }))
      setIsVipDialogOpen(false)
    } catch (error) {
      console.error("Failed to toggle VIP:", error)
      toast({
        title: "Error",
        description: "Failed to update VIP status",
        variant: "destructive",
      })
    } finally {
      setVipUpdating(false)
    }
  }

  const handlePublicToggle = async (eventId: string, current: boolean) => {
    try {
      const result = await apiFetch<{ event?: any }>(`/api/admin/events/${eventId}`, {
        method: "PATCH",
        body: { isPublic: !current },
        auth: true,
      })

      const updated = result.data ?? result.event
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? {
                ...e,
                isPublic: !current,
                isVerified: updated?.isVerified ?? e.isVerified,
                verifiedBadgeImage: updated?.verifiedBadgeImage ?? e.verifiedBadgeImage,
              }
            : e,
        ),
      )
    } catch (error) {
      console.error("Failed to toggle public flag:", error)
    }
  }

const handleVerifyToggle = async (event: Event, verify: boolean, customBadge?: File) => {
  try {
    setVerifying(true)
    const fd = new FormData()
    fd.append("isVerified", verify ? "true" : "false")
    if (verify && customBadge) {
      fd.append("badgeFile", customBadge)
    }
    const result = await apiFetch<{ success?: boolean; data?: any }>(`/api/admin/events/${event.id}/verify`, {
      method: "POST",
      body: fd,
      auth: true,
    })
    const updated = result.data
    setEvents(prev => prev.map((e) => {
      if (e.id === event.id) {
        return {
          ...e,
          isVerified: verify,
          verifiedAt: updated?.verifiedAt
            ? (typeof updated.verifiedAt === "string" ? updated.verifiedAt : new Date(updated.verifiedAt).toISOString())
            : verify
              ? new Date().toISOString()
              : null,
          verifiedBy: verify ? (updated?.verifiedBy ?? undefined) : null,
          verifiedBadgeImage: verify ? (updated?.verifiedBadgeImage ?? null) : null,
        }
      }
      return e
    }))
    setIsVerifyDialogOpen(false)
    toast({
      title: verify ? "âœ… Event Verified" : "ðŸ—‘ï¸ Verification Removed",
      description: verify ? "Event has been marked as verified" : "Event verification has been removed",
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update verification status"
    toast({
      title: "âŒ Error",
      description: errorMessage,
      variant: "destructive",
      duration: 5000,
    })
  } finally {
    setVerifying(false)
  }
}

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return
    try {
      await apiFetch(`/api/admin/events/${eventId}`, { method: "DELETE", auth: true })
      setEvents((prev) => prev.filter((e) => e.id !== eventId))
      toast({
        title: "Event Deleted",
        description: "Event has been deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete event:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete event",
        variant: "destructive",
      })
    }
  }

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event)
    setIsEditing(true)
  }

  const handleSaveEvent = (updatedEvent: Event) => {
    setEvents((prev) => prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)))
    setIsEditing(false)
    setSelectedEvent(null)
    
    toast({
      title: "Event Updated",
      description: "Event details have been saved successfully",
    })
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setSelectedEvent(null)
  }

  const handleVerifyEvent = (event: Event) => {
    setSelectedEvent(event)
    setIsVerifyDialogOpen(true)
  }

  const eventCounts = {
    all: events.length,
    approved: events.filter((e) => e.status === "Approved").length,
    pending: events.filter((e) => e.status === "Pending Review").length,
    flagged: events.filter((e) => e.status === "Flagged").length,
    featured: events.filter((e) => e.featured).length,
    vip: events.filter((e) => e.vip).length,
    verified: events.filter((e) => e.isVerified).length,
  }

  if (loading || categoriesLoading)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <p className="text-gray-500">Loading events...</p>
      </div>
    )

  if (isEditing && selectedEvent) {
    return (
      <EditEventForm
        event={selectedEvent}
        onSave={handleSaveEvent}
        onCancel={handleCancelEdit}
        categories={categories}
      />
    )
  }

  return (
    <>
      <EventList
        events={events}
        searchTerm={searchTerm}
        selectedStatus={selectedStatus}
        selectedCategory={selectedCategory}
        activeTab={activeTab}
        eventCounts={eventCounts}
        categories={categories}
        onEdit={handleEditEvent}
        onStatusChange={handleStatusChange}
        onFeatureToggle={handleFeatureToggle}
        onVipToggle={handleVipToggle}
        onPublicToggle={handlePublicToggle}
        onDelete={handleDeleteEvent}
        onPromote={(event) => {
          setSelectedEvent(event)
          setIsPromoteDialogOpen(true)
        }}
        onVerify={handleVerifyEvent}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setSelectedStatus}
        onCategoryFilterChange={setSelectedCategory}
        onTabChange={setActiveTab}
      />

      <VerifyEventDialog
        event={selectedEvent}
        open={isVerifyDialogOpen}
        onOpenChange={setIsVerifyDialogOpen}
        onVerify={(verify, customBadge) => {
          if (selectedEvent) {
            handleVerifyToggle(selectedEvent, verify, customBadge)
          }
        }}
        loading={verifying}
      />
      <VipEventDialog
        event={selectedEvent}
        open={isVipDialogOpen}
        onOpenChange={setIsVipDialogOpen}
        onConfirm={handleConfirmVipToggle}
        loading={vipUpdating}
      />
    </>
  )
}
