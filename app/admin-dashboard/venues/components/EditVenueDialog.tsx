"use client"

import { AppImage } from "@/components/app-image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { uploadVenueImages, uploadVenueLogo } from "@/lib/upload-utils"
import { Image, Plus, Upload, X } from "lucide-react"
import { useEffect, useState, useRef, type FormEvent } from "react"
import { toast } from "sonner"
import type { Venue, VenueEditFormData } from "../types/venue.types"

const MAX_IMAGE_SIZE = 2 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg"]

function isValidVenueImageFile(file: File) {
  return ACCEPTED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_SIZE
}

type EditVenueDialogProps = {
  isOpen: boolean
  onClose: () => void
  venue: Venue | null
  onSave: (data: VenueEditFormData) => void | Promise<void>
}

export function EditVenueDialog({ isOpen, onClose, venue, onSave }: EditVenueDialogProps) {
  const [formData, setFormData] = useState({
    venueName: "",
    contactPerson: "",
    email: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    country: "",
    website: "",
    description: "",
    maxCapacity: "",
    totalHalls: "",
    amenitiesText: "",
    meetingSpaces: [] as Venue["meetingSpaces"],
    logoUrl: "",
    galleryUrls: [] as string[],
    newGalleryUrl: "",
    isVerified: false,
    status: "pending",
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("")
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (venue) {
      const gallery = (venue.venueImages || []).filter((u) => u && u !== venue.logo)
      setFormData({
        venueName: venue.venueName || "",
        contactPerson: venue.contactPerson || "",
        email: venue.email || "",
        mobile: venue.mobile || "",
        address: venue.address || "",
        city: venue.city || "",
        state: venue.state || "",
        country: venue.country || "",
        website: venue.website || "",
        description: venue.description || "",
        maxCapacity: venue.maxCapacity?.toString() || "",
        totalHalls: venue.totalHalls?.toString() || "",
        amenitiesText: (venue.amenities || []).join(", "),
        meetingSpaces: (venue.meetingSpaces || []).map((space, index) => ({
          ...space,
          id: space.id || venue.id + "-space-" + index,
          name: space.name || "",
          capacity: Number(space.capacity) || 0,
          area: Number(space.area) || 0,
          hourlyRate: Number(space.hourlyRate) || 0,
          isAvailable: space.isAvailable !== false,
          description: space.description || "",
          features: Array.isArray(space.features) ? space.features : [],
        })),
        logoUrl: venue.logo || "",
        galleryUrls: gallery,
        newGalleryUrl: "",
        isVerified: venue.isVerified || false,
        status: venue.status || (venue.isVerified ? "active" : "pending"),
      })
      setLogoFile(null)
      setLogoPreview(venue.logo || "")
      setGalleryFiles([])
      setGalleryPreviews([])
    }
  }, [venue])

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (!isValidVenueImageFile(file)) {
      toast.error("Choose a PNG or JPG image up to 2 MB.")
      return
    }
    if (logoPreview.startsWith("blob:")) URL.revokeObjectURL(logoPreview)
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ""
    if (files.length === 0) return
    const validFiles = files.filter(isValidVenueImageFile)
    if (validFiles.length !== files.length) toast.error("Some files were skipped. Choose PNG or JPG images up to 2 MB each.")
    if (validFiles.length === 0) return
    setGalleryFiles((current) => [...current, ...validFiles])
    setGalleryPreviews((current) => [...current, ...validFiles.map((file) => URL.createObjectURL(file))])
  }

  const removeGalleryImage = (index: number) => {
    setFormData((current) => ({
      ...current,
      galleryUrls: current.galleryUrls.filter((_, imageIndex) => imageIndex !== index),
    }))
  }

  const removePendingGalleryImage = (index: number) => {
    const preview = galleryPreviews[index]
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview)
    setGalleryFiles(galleryFiles.filter((_, imageIndex) => imageIndex !== index))
    setGalleryPreviews(galleryPreviews.filter((_, imageIndex) => imageIndex !== index))
  }

  const addGalleryUrl = () => {
    const value = formData.newGalleryUrl.trim()
    if (!value) return
    if (!/^https?:\/\//i.test(value)) {
      toast.error("Enter a full image URL beginning with https:// or http://.")
      return
    }
    setFormData((current) => ({
      ...current,
      galleryUrls: current.galleryUrls.includes(value) ? current.galleryUrls : [...current.galleryUrls, value],
      newGalleryUrl: "",
    }))
  }

  const removeLogo = () => {
    if (logoPreview.startsWith("blob:")) URL.revokeObjectURL(logoPreview)
    setLogoFile(null)
    setLogoPreview("")
    setFormData((current) => ({ ...current, logoUrl: "" }))
    if (logoInputRef.current) logoInputRef.current.value = ""
  }

  const updateMeetingSpace = (index: number, updates: Partial<Venue["meetingSpaces"][number]>) => {
    setFormData((current) => ({
      ...current,
      meetingSpaces: current.meetingSpaces.map((space, spaceIndex) =>
        spaceIndex === index ? { ...space, ...updates } : space,
      ),
    }))
  }

  const addMeetingSpace = () => {
    setFormData((current) => ({
      ...current,
      meetingSpaces: [
        ...current.meetingSpaces,
        {
          id: "space-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
          name: "",
          capacity: 0,
          area: 0,
          hourlyRate: 0,
          isAvailable: true,
          description: "",
          features: [],
        },
      ],
    }))
  }

  const removeMeetingSpace = (index: number) => {
    setFormData((current) => ({
      ...current,
      meetingSpaces: current.meetingSpaces.filter((_, spaceIndex) => spaceIndex !== index),
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.venueName.trim() || !formData.email.trim()) {
      toast.error("Venue name and email are required")
      return
    }

    setUploading(true)
    try {
      let logo = formData.logoUrl.trim()
      if (logoFile) {
        logo = await uploadVenueLogo(logoFile)
      }

      let uploadedGallery: string[] = []
      if (galleryFiles.length > 0) {
        uploadedGallery = await uploadVenueImages(galleryFiles)
      }
      const venueImages = [...new Set([logo, ...formData.galleryUrls, ...uploadedGallery].filter(Boolean))]

      const amenities = formData.amenitiesText
        .split(/[,|]/)
        .map((s) => s.trim())
        .filter(Boolean)

      await onSave({
        venueName: formData.venueName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        mobile: formData.mobile,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        website: formData.website,
        description: formData.description,
        amenities,
        meetingSpaces: formData.meetingSpaces.filter((space) => space.name.trim()),
        logo,
        venueImages,
        maxCapacity: parseInt(formData.maxCapacity, 10) || 0,
        totalHalls: parseInt(formData.totalHalls, 10) || 0,
        isVerified: formData.isVerified,
        status: formData.status,
      })
      toast.success("Venue updated successfully")
      onClose()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : "Failed to upload images")
    } finally {
      setUploading(false)
    }
  }

  const sectionClass = "space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
  const previewLogo = logoPreview || formData.logoUrl

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[92vh] max-w-4xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <DialogTitle className="text-xl font-bold text-slate-900">Edit Venue</DialogTitle>
          <DialogDescription className="text-slate-500">
            Update venue information, images, and settings
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
          {/* Images Section */}
          <div className={sectionClass}>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Venue Images</h3>
              <p className="mt-1 text-sm text-slate-500">Update the venue logo and manage gallery photos.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700">Venue logo</Label>
                <input ref={logoInputRef} type="file" accept="image/png,image/jpeg" onChange={handleLogoFileChange} className="hidden" />
                {previewLogo ? (
                  <div className="flex flex-col items-start gap-3">
                    <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      <AppImage src={previewLogo} alt="Venue logo" fill sizes="128px" className="object-cover" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Change logo
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={removeLogo} className="text-rose-600 hover:text-rose-700">
                        <X className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => logoInputRef.current?.click()} className="flex min-h-40 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-4 text-center transition hover:border-blue-400 hover:bg-blue-50/50">
                    <Upload className="mb-2 h-7 w-7 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Upload venue logo</span>
                    <span className="mt-1 text-xs text-slate-500">PNG or JPG, up to 2 MB</span>
                  </button>
                )}
                <p className="text-xs text-slate-500">Choose a clear image that represents this venue.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Gallery photos</Label>
                  <p className="mt-1 text-xs text-slate-500">Remove old photos or add multiple new images.</p>
                </div>
                <input ref={galleryInputRef} type="file" accept="image/png,image/jpeg" multiple onChange={handleGalleryFileChange} className="hidden" />
                <button type="button" onClick={() => galleryInputRef.current?.click()} className="flex min-h-24 w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-4 text-left transition hover:border-blue-400 hover:bg-blue-50/50">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm"><Image className="h-5 w-5" /></span>
                  <span>
                    <span className="block text-sm font-medium text-slate-700">Add gallery photos</span>
                    <span className="mt-1 block text-xs text-slate-500">PNG or JPG, up to 2 MB each</span>
                  </span>
                  <Plus className="ml-auto h-5 w-5 text-slate-400" />
                </button>
                {(formData.galleryUrls.length > 0 || galleryPreviews.length > 0) ? (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {formData.galleryUrls.map((imageUrl, index) => (
                      <div key={imageUrl + index} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <AppImage src={imageUrl} alt={"Venue photo " + (index + 1)} fill sizes="120px" className="object-cover" />
                        <button type="button" onClick={() => removeGalleryImage(index)} aria-label={"Remove venue photo " + (index + 1)} className="absolute right-1.5 top-1.5 rounded-full bg-slate-900/75 p-1.5 text-white opacity-100 transition hover:bg-rose-600 sm:opacity-0 sm:group-hover:opacity-100">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {galleryPreviews.map((preview, index) => (
                      <div key={preview} className="group relative aspect-square overflow-hidden rounded-xl border border-blue-200 bg-slate-50">
                        <AppImage src={preview} alt={"New venue photo " + (index + 1)} fill sizes="120px" className="object-cover" />
                        <span className="absolute bottom-1.5 left-1.5 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-blue-800">New</span>
                        <button type="button" onClick={() => removePendingGalleryImage(index)} aria-label={"Remove new venue photo " + (index + 1)} className="absolute right-1.5 top-1.5 rounded-full bg-slate-900/75 p-1.5 text-white transition hover:bg-rose-600">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center text-sm text-slate-500">No gallery photos added yet.</div>
                )}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input aria-label="Add gallery image URL" value={formData.newGalleryUrl} onChange={(e) => setFormData({ ...formData, newGalleryUrl: e.target.value })} onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addGalleryUrl()
                    }
                  }} placeholder="Or add an image URL" className="border-slate-200" />
                  <Button type="button" variant="outline" onClick={addGalleryUrl} className="shrink-0"><Plus className="mr-2 h-4 w-4" />Add URL</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information Section */}
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-venueName" className="text-xs font-medium text-slate-600">
                  Venue Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-venueName"
                  value={formData.venueName}
                  onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                  className="border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contactPerson" className="text-xs font-medium text-slate-600">Contact Person</Label>
                <Input
                  id="edit-contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="border-slate-200"
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-xs font-medium text-slate-600">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-mobile" className="text-xs font-medium text-slate-600">Mobile</Label>
                <Input
                  id="edit-mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="border-slate-200"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-website" className="text-xs font-medium text-slate-600">Website</Label>
                <Input
                  id="edit-website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://"
                  className="border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Location</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-address" className="text-xs font-medium text-slate-600">Address</Label>
                <Textarea
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className="border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-city" className="text-xs font-medium text-slate-600">City</Label>
                <Input
                  id="edit-city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-state" className="text-xs font-medium text-slate-600">State</Label>
                <Input
                  id="edit-state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="border-slate-200"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-country" className="text-xs font-medium text-slate-600">Country</Label>
                <Input
                  id="edit-country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Venue Details Section */}
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Venue Details</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-capacity" className="text-xs font-medium text-slate-600">Max Capacity</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  min={0}
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                  className="border-slate-200"
                  placeholder="e.g., 500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-totalHalls" className="text-xs font-medium text-slate-600">Total Halls</Label>
                <Input
                  id="edit-totalHalls"
                  type="number"
                  min={0}
                  value={formData.totalHalls}
                  onChange={(e) => setFormData({ ...formData, totalHalls: e.target.value })}
                  className="border-slate-200"
                  placeholder="e.g., 5"
                />
              </div>
              <div className="space-y-3 md:col-span-2">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Meeting spaces & halls</Label>
                    <p className="mt-1 text-xs text-slate-500">Edit each space's capacity, area, rate, and availability.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addMeetingSpace} className="self-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Add space
                  </Button>
                </div>
                {formData.meetingSpaces.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center text-sm text-slate-500">
                    No meeting spaces added.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.meetingSpaces.map((space, index) => (
                      <div key={space.id} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-800">Space {index + 1}</p>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeMeetingSpace(index)} className="text-rose-600 hover:text-rose-700">
                            <X className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor={"edit-space-name-" + index}>Space name</Label>
                            <Input id={"edit-space-name-" + index} value={space.name} onChange={(e) => updateMeetingSpace(index, { name: e.target.value })} placeholder="e.g. Main Hall" className="border-slate-200 bg-white" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={"edit-space-capacity-" + index}>Capacity</Label>
                            <Input id={"edit-space-capacity-" + index} type="number" min={0} value={space.capacity} onChange={(e) => updateMeetingSpace(index, { capacity: Number(e.target.value) || 0 })} className="border-slate-200 bg-white" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={"edit-space-area-" + index}>Area (sq. ft.)</Label>
                            <Input id={"edit-space-area-" + index} type="number" min={0} value={space.area} onChange={(e) => updateMeetingSpace(index, { area: Number(e.target.value) || 0 })} className="border-slate-200 bg-white" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={"edit-space-rate-" + index}>Hourly rate</Label>
                            <Input id={"edit-space-rate-" + index} type="number" min={0} value={space.hourlyRate} onChange={(e) => updateMeetingSpace(index, { hourlyRate: Number(e.target.value) || 0 })} className="border-slate-200 bg-white" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={"edit-space-features-" + index}>Features</Label>
                            <Input id={"edit-space-features-" + index} value={space.features?.join(", ") || ""} onChange={(e) => updateMeetingSpace(index, { features: e.target.value.split(/[,|]/).map((feature) => feature.trim()).filter(Boolean) })} placeholder="Stage, projector, WiFi" className="border-slate-200 bg-white" />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor={"edit-space-description-" + index}>Description</Label>
                            <Textarea id={"edit-space-description-" + index} value={space.description || ""} onChange={(e) => updateMeetingSpace(index, { description: e.target.value })} rows={2} className="border-slate-200 bg-white" />
                          </div>
                          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:col-span-2">
                            <Switch id={"edit-space-available-" + index} checked={space.isAvailable} onCheckedChange={(checked) => updateMeetingSpace(index, { isAvailable: checked })} />
                            <Label htmlFor={"edit-space-available-" + index} className="cursor-pointer text-sm text-slate-700">Available for booking</Label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-amenities" className="text-xs font-medium text-slate-600">
                  Amenities (comma-separated)
                </Label>
                <Input
                  id="edit-amenities"
                  value={formData.amenitiesText}
                  onChange={(e) => setFormData({ ...formData, amenitiesText: e.target.value })}
                  placeholder="WiFi, Parking, Catering, Projector"
                  className="border-slate-200"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-description" className="text-xs font-medium text-slate-600">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="border-slate-200"
                  placeholder="Describe the venue, its features, and what makes it special..."
                />
              </div>
            </div>
          </div>

          {/* Status & Verification Section */}
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Status & Verification</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-status" className="text-xs font-medium text-slate-600">Listing Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="edit-status" className="border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending Approval</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/30 px-4 py-3">
                <Switch
                  id="edit-verified"
                  checked={formData.isVerified}
                  onCheckedChange={(checked) => setFormData({ ...formData, isVerified: checked })}
                />
                <Label htmlFor="edit-verified" className="cursor-pointer text-sm text-slate-700">
                  Mark as verified venue
                </Label>
              </div>
            </div>
          </div>

          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={uploading} className="border-slate-200">
              Cancel
            </Button>
            <Button type="submit" disabled={uploading} className="bg-[#004A96] hover:bg-[#003d7a]">
              {uploading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}