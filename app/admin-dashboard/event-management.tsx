"use client"

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

// ✅ UPDATED Event Interface with verification fields
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
  
  // ✅ VERIFICATION FIELDS - MAKE SURE THESE ARE INCLUDED
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
                    <img
                      src={URL.createObjectURL(customBadgeFile)}
                      alt="Custom badge preview"
                      className="w-20 h-20 object-contain border rounded"
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

// Verified Badge Display Component
function VerifiedBadge({ event }: { event: Event }) {
  if (!event.isVerified) return null

  return (
    <Badge className="bg-green-100 text-green-800 border border-green-300">
      {event.verifiedBadgeImage ? (
        <img src={event.verifiedBadgeImage} alt="Verified" className="w-4 h-4 mr-1 object-contain" />
      ) : (
        <ShieldCheck className="w-4 h-4 mr-1" />
      )}
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
      <img
        src={src}
        alt="Preview"
        className="w-20 h-20 object-cover rounded-lg border"
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

// Edit Event Component (exported for use in events/page.tsx)
export function EditEventForm({ 
  event, 
  onSave, 
  onCancel,
  categories 
}: { 
  event: Event
  onSave: (updatedEvent: Event) => void
  onCancel: () => void
  categories: Category[]
}) {
  const toDateOnly = (value?: string | null) => {
    if (!value) return ""
    const s = value.toString()
    return s.includes("T") ? s.split("T")[0] : s
  }

  const [formData, setFormData] = useState<Event>({
    ...event,
    date: toDateOnly(event.date),
    endDate: toDateOnly(event.endDate),
    images: event.images || [],
    videos: event.videos || [],
    youtubeVideoUrl: (event as any).youtubeVideoUrl ?? "",
    documents: event.documents || [],
    tags: event.tags || [],
    shortDescription: event.shortDescription || "",
    subTitle: (event as any).subTitle || event.shortDescription || "",
    slug: event.slug || "",
    edition: event.edition || "",
    eventType: event.eventType || "in-person",
    timezone: event.timezone || "UTC",
    currency: event.currency || "USD",
    bannerImage: event.bannerImage || "",
    thumbnailImage: event.thumbnailImage || "",
    brochure: event.brochure || "",
    layout: event.layout || "",
    isVerified: event.isVerified || false,
    isPublic: event.isPublic ?? true,
    verifiedBadgeImage: event.verifiedBadgeImage || null,
    verifiedAt: event.verifiedAt || null,
    verifiedBy: event.verifiedBy || null,
    category: normalizeEventCategoryNames(event)[0] ?? "",
  })

  const [selectedCategoryNames, setSelectedCategoryNames] = useState<string[]>(() =>
    normalizeEventCategoryNames(event)
  )
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  useEffect(() => {
    setSelectedCategoryNames(normalizeEventCategoryNames(event))
  }, [event.id])

  useEffect(() => {
    setSlugManuallyEdited(false)
  }, [event.id])

  useEffect(() => {
    if (slugManuallyEdited) return
    setFormData((prev) => {
      const autoSlug = slugifyTitle(prev.title || "")
      if (prev.slug === autoSlug) return prev
      return { ...prev, slug: autoSlug }
    })
  }, [formData.title, slugManuallyEdited])

  const activeCategories = categories.filter((c) => c.isActive)

  const [uploading, setUploading] = useState(false)
  const [newImages, setNewImages] = useState<File[]>([])
  const [newVideos, setNewVideos] = useState<File[]>([])
  const [newDocuments, setNewDocuments] = useState<File[]>([])

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleImageUpload = async (files: File[]) => {
    setUploading(true)
    try {
      setNewImages(prev => [...prev, ...files])
    } catch (error) {
      console.error("Error processing images:", error)
      alert("Failed to process images")
    } finally {
      setUploading(false)
    }
  }

  const handleVideoUpload = async (files: File[]) => {
    setUploading(true)
    try {
      setNewVideos(prev => [...prev, ...files])
    } catch (error) {
      console.error("Error processing videos:", error)
      alert("Failed to process videos")
    } finally {
      setUploading(false)
    }
  }

  const handleDocumentUpload = async (files: File[]) => {
    setUploading(true)
    try {
      setNewDocuments(prev => [...prev, ...files])
    } catch (error) {
      console.error("Error processing documents:", error)
      alert("Failed to process documents")
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number, isNew: boolean = false) => {
    if (isNew) {
      setNewImages(prev => prev.filter((_, i) => i !== index))
    } else {
      setFormData(prev => ({
        ...prev,
        images: (prev.images || []).filter((_, i) => i !== index)
      }))
    }
  }

  const removeVideo = (index: number, isNew: boolean = false) => {
    if (isNew) {
      setNewVideos(prev => prev.filter((_, i) => i !== index))
    } else {
      setFormData(prev => ({
        ...prev,
        videos: (prev.videos || []).filter((_, i) => i !== index)
      }))
    }
  }

  const removeDocument = (index: number, isNew: boolean = false) => {
    if (isNew) {
      setNewDocuments(prev => prev.filter((_, i) => i !== index))
    } else {
      setFormData(prev => ({
        ...prev,
        documents: (prev.documents || []).filter((_, i) => i !== index)
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      const imageUploads = Promise.all(newImages.map(fileToBase64))
      const videoUploads = Promise.all(newVideos.map(fileToBase64))
      const documentUploads = Promise.all(newDocuments.map(fileToBase64))

      const [newImageBase64, newVideoBase64, newDocumentBase64] = await Promise.all([
        imageUploads,
        videoUploads,
        documentUploads
      ])

      // Only send fields that the backend updates; do not send venue/location/organizer (relations stay unchanged)
      const updateData: Record<string, unknown> = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription ?? "",
        subTitle: formData.subTitle ?? formData.shortDescription ?? "",
        slug: formData.slug,
        edition: formData.edition ?? "",
        startDate: formData.date,
        endDate: formData.endDate,
        status: formData.status,
        maxCapacity: formData.maxCapacity,
        currentAttendees: formData.attendees,
        featured: formData.featured,
        vip: formData.vip,
        isPublic: formData.isPublic,
        category: selectedCategoryNames,
        tags: formData.tags || [],
        eventType: Array.isArray(formData.eventType) ? formData.eventType : (formData.eventType ? [formData.eventType] : []),
        timezone: formData.timezone,
        currency: formData.currency ?? "USD",
        images: [...(formData.images || []), ...newImageBase64],
        videos: [...(formData.videos || []), ...newVideoBase64],
        documents: [...(formData.documents || []), ...newDocumentBase64],
        brochure: formData.brochure ?? "",
        layout: formData.layout ?? "",
        bannerImage: formData.bannerImage ?? "",
        thumbnailImage: formData.thumbnailImage ?? "",
        isVerified: formData.isVerified,
        verifiedBadgeImage: formData.verifiedBadgeImage ?? null,
        youtubeVideoUrl:
          typeof formData.youtubeVideoUrl === "string" && formData.youtubeVideoUrl.trim()
            ? formData.youtubeVideoUrl.trim()
            : null,
      }

      const result = await apiFetch<{ event?: any; data?: any }>(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        body: updateData,
        auth: true,
      })
      const savedEvent = result.event ?? result.data
      if (savedEvent) {
        onSave(savedEvent)
      } else {
        throw new Error("No event data returned from server")
      }
    } catch (error) {
      console.error("Error updating event:", error)
      alert(error instanceof Error ? error.message : "Failed to update event")
    } finally {
      setUploading(false)
    }
  }

  const currentImages = formData.images || []
  const currentVideos = formData.videos || []
  const currentDocuments = formData.documents || []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Event</h1>
          <p className="text-gray-600">Update event details</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter event title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => {
                      const next = slugifyTitle(e.target.value)
                      setSlugManuallyEdited(next.length > 0)
                      setFormData({ ...formData, slug: next })
                    }}
                    placeholder="event-slug"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edition">Edition</Label>
                  <Input
                    id="edition"
                    value={formData.edition}
                    onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                    placeholder="e.g., 2024, First Edition"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizer">Organizer *</Label>
                  <Input
                    id="organizer"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    placeholder="Enter organizer name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subTitle">Event Sub Title</Label>
                <Input
                  id="subTitle"
                  value={formData.subTitle ?? ""}
                  onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })}
                  placeholder="Enter event sub title"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500">
                  {(formData.subTitle ?? "").length}/200 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief description (max 200 characters)"
                  rows={2}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500">
                  {formData.shortDescription?.length || 0}/200 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed event description"
                  rows={4}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Date & Time</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Start Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone *</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                      <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                      <SelectItem value="CST">Central Time (CST)</SelectItem>
                      <SelectItem value="IST">India Standard Time (IST)</SelectItem>
                      <SelectItem value="GMT">Greenwich Mean Time (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location & Venue</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue Name *</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="Enter venue name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter event location"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Event Details</h3>

              <div className="rounded-xl border border-gray-200 bg-gradient-to-b from-slate-50/80 to-white p-5 shadow-sm">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Label className="text-base font-semibold text-gray-900">Categories</Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Select one or more categories from your admin list. Changes apply on save.
                    </p>
                  </div>
                  {selectedCategoryNames.length > 0 && (
                    <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 shrink-0">
                      {selectedCategoryNames.length} selected
                    </span>
                  )}
                </div>
                {activeCategories.length === 0 ? (
                  <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-3 mt-4">
                    No active event categories. Add them under <strong>Events → Event Categories</strong>.
                  </p>
                ) : (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {activeCategories.map((cat) => {
                      const checked = selectedCategoryNames.includes(cat.name)
                      return (
                        <label
                          key={cat.id}
                          className={[
                            "flex items-center gap-3 rounded-lg border px-3.5 py-3 cursor-pointer transition-all",
                            checked
                              ? "border-blue-500 bg-blue-50/90 shadow-sm ring-2 ring-blue-100"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80",
                          ].join(" ")}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => {
                              const on = v === true
                              if (on && !selectedCategoryNames.includes(cat.name)) {
                                setSelectedCategoryNames((prev) => [...prev, cat.name])
                              } else if (!on) {
                                setSelectedCategoryNames((prev) => prev.filter((n) => n !== cat.name))
                              }
                            }}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                          <span
                            className="h-3 w-3 rounded-full shrink-0 border border-white shadow-sm"
                            style={{ backgroundColor: cat.color || "#3B82F6" }}
                            title={cat.name}
                          />
                          <span className="text-sm font-medium text-gray-800 leading-snug flex-1 min-w-0">
                            {cat.name}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type</Label>
                  <Select
                    value={scalarEventType(formData.eventType)}
                    onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-person">In-Person</SelectItem>
                      <SelectItem value="virtual">Virtual</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={(formData.tags || []).join(', ')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) 
                  })}
                  placeholder="Enter tags separated by commas"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Capacity & Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxCapacity">Max Capacity *</Label>
                  <Input
                    id="maxCapacity"
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                    placeholder="Enter maximum capacity"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attendees">Current Attendees</Label>
                  <Input
                    id="attendees"
                    type="number"
                    value={formData.attendees}
                    onChange={(e) => setFormData({ ...formData, attendees: Number(e.target.value) })}
                    placeholder="Current number of attendees"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticketPrice">Ticket Price ({formData.currency})</Label>
                  <Input
                    id="ticketPrice"
                    type="number"
                    step="0.01"
                    value={formData.ticketPrice}
                    onChange={(e) => setFormData({ ...formData, ticketPrice: Number(e.target.value) })}
                    placeholder="Enter ticket price"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Media & Documents</h3>
              
              <div className="space-y-2">
                <Label>Banner Image</Label>
                <div className="flex items-center gap-4">
                  {formData.bannerImage && (
                    <ImagePreview
                      src={formData.bannerImage}
                      onRemove={() => setFormData({ ...formData, bannerImage: "" })}
                    />
                  )}
                  <FileUpload
                    label="Upload Banner Image"
                    accept="image/*"
                    onFileUpload={async (files) => {
                      if (files.length > 0) {
                        const base64 = await fileToBase64(files[0])
                        setFormData({ ...formData, bannerImage: base64 })
                      }
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Thumbnail Image</Label>
                <div className="flex items-center gap-4">
                  {formData.thumbnailImage && (
                    <ImagePreview
                      src={formData.thumbnailImage}
                      onRemove={() => setFormData({ ...formData, thumbnailImage: "" })}
                    />
                  )}
                  <FileUpload
                    label="Upload Thumbnail Image"
                    accept="image/*"
                    onFileUpload={async (files) => {
                      if (files.length > 0) {
                        const base64 = await fileToBase64(files[0])
                        setFormData({ ...formData, thumbnailImage: base64 })
                      }
                    }}
                  />
                </div>
              </div>

              <FileUpload
                label="Gallery Images"
                accept="image/*"
                multiple={true}
                currentFiles={currentImages}
                onFileUpload={handleImageUpload}
                onFileRemove={(index) => removeImage(index)}
              />
              
              {newImages.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">New Images to Upload:</Label>
                  <div className="flex flex-wrap gap-2">
                    {newImages.map((file, index) => (
                      <ImagePreview
                        key={index}
                        src={URL.createObjectURL(file)}
                        onRemove={() => removeImage(index, true)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="youtubeVideoUrl">YouTube video URL</Label>
                <Input
                  id="youtubeVideoUrl"
                  type="url"
                  inputMode="url"
                  placeholder="https://www.youtube.com/watch?v=… or youtu.be/…"
                  value={formData.youtubeVideoUrl ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, youtubeVideoUrl: e.target.value })
                  }
                />
                <p className="text-xs text-gray-500">
                  Optional. Paste a public YouTube link; it is saved on the server as a normalized watch URL.
                </p>
              </div>

              <FileUpload
                label="Videos"
                accept="video/*"
                multiple={true}
                currentFiles={currentVideos}
                onFileUpload={handleVideoUpload}
                onFileRemove={(index) => removeVideo(index)}
              />

              <FileUpload
                label="Documents (Brochure, Layout, etc.)"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                multiple={true}
                currentFiles={currentDocuments}
                onFileUpload={handleDocumentUpload}
                onFileRemove={(index) => removeDocument(index)}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Brochure</Label>
                  <FileUpload
                    label="Upload Brochure"
                    accept=".pdf,.doc,.docx"
                    onFileUpload={async (files) => {
                      if (files.length > 0) {
                        const base64 = await fileToBase64(files[0])
                        setFormData({ ...formData, brochure: base64 })
                      }
                    }}
                    currentFiles={formData.brochure ? [formData.brochure] : []}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Layout Plan</Label>
                  <FileUpload
                    label="Upload Layout Plan"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onFileUpload={async (files) => {
                      if (files.length > 0) {
                        const base64 = await fileToBase64(files[0])
                        setFormData({ ...formData, layout: base64 })
                      }
                    }}
                    currentFiles={formData.layout ? [formData.layout] : []}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Status & Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: Event["status"]) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Pending Review">Pending Review</SelectItem>
                      <SelectItem value="Flagged">Flagged</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Features</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={!!formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="featured" className="cursor-pointer">Featured Event</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="vip"
                        checked={!!formData.vip}
                        onChange={(e) => setFormData({ ...formData, vip: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="vip" className="cursor-pointer">VIP Event</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="public"
                        checked={!!formData.isPublic}
                        onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="public" className="cursor-pointer">Public Event</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="verified"
                        checked={!!formData.isVerified}
                        onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="verified" className="cursor-pointer">Verified Event</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Save Changes"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel} 
                className="flex-1"
                disabled={uploading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
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
  onVipToggle: (eventId: string, current: boolean) => void
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
                          <img
                            src={event.thumbnailImage || event.bannerImage || event.image || "https://placehold.co/400x300?text=Event"}
                            alt={event.title}
                            className="w-full h-24 md:h-28 rounded-lg object-cover"
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
                                <span>Category: {Array.isArray(event.category) ? event.category[0] : event.category || "—"}</span>
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

  const handleVipToggle = async (eventId: string, current: boolean) => {
    try {
      const result = await apiFetch<{ event?: any }>(`/api/admin/events/${eventId}`, {
        method: "PATCH",
        body: { vip: !current },
        auth: true,
      })
      
      const updated = result.data ?? result.event
      setEvents((prev) => prev.map((e) => {
        if (e.id === eventId) {
          return {
            ...e,
            vip: !current,
            isVerified: updated?.isVerified ?? e.isVerified,
            verifiedBadgeImage: updated?.verifiedBadgeImage ?? e.verifiedBadgeImage,
          }
        }
        return e
      }))
    } catch (error) {
      console.error("Failed to toggle VIP:", error)
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
      title: verify ? "✅ Event Verified" : "🗑️ Verification Removed",
      description: verify ? "Event has been marked as verified" : "Event verification has been removed",
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update verification status"
    toast({
      title: "❌ Error",
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
    </>
  )
}