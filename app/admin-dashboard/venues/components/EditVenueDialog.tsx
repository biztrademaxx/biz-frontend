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
import { Image, Upload, X } from "lucide-react"
import { useEffect, useState, useRef, type FormEvent } from "react"
import { toast } from "sonner"
import type { Venue, VenueEditFormData } from "../types/venue.types"

type EditVenueDialogProps = {
  isOpen: boolean
  onClose: () => void
  venue: Venue | null
  onSave: (data: VenueEditFormData) => void | Promise<void>
}

export function EditVenueDialog({ isOpen, onClose, venue, onSave }: EditVenueDialogProps) {
  const [formData, setFormData] = useState({
    venueName: "",
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
    logoUrl: "",
    galleryUrlsText: "",
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
        logoUrl: venue.logo || "",
        galleryUrlsText: gallery.join(", "),
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
    if (file) {
      setLogoFile(file)
      const preview = URL.createObjectURL(file)
      setLogoPreview(preview)
    }
  }

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setGalleryFiles([...galleryFiles, ...files])
      const newPreviews = files.map(file => URL.createObjectURL(file))
      setGalleryPreviews([...galleryPreviews, ...newPreviews])
    }
  }

  const removeGalleryImage = (index: number) => {
    const newFiles = galleryFiles.filter((_, i) => i !== index)
    const newPreviews = galleryPreviews.filter((_, i) => i !== index)
    setGalleryFiles(newFiles)
    setGalleryPreviews(newPreviews)
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview("")
    if (logoInputRef.current) {
      logoInputRef.current.value = ""
    }
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

      const galleryFromText = formData.galleryUrlsText
        .split(/[,|]/)
        .map((s) => s.trim())
        .filter(Boolean)

      let uploadedGallery: string[] = []
      if (galleryFiles.length > 0) {
        uploadedGallery = await uploadVenueImages(galleryFiles)
      }
      const venueImages = [...new Set([logo, ...galleryFromText, ...uploadedGallery].filter(Boolean))]

      const amenities = formData.amenitiesText
        .split(/[,|]/)
        .map((s) => s.trim())
        .filter(Boolean)

      await onSave({
        venueName: formData.venueName,
        email: formData.email,
        mobile: formData.mobile,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        website: formData.website,
        description: formData.description,
        amenities,
        logo,
        venueImages,
        maxCapacity: parseInt(formData.maxCapacity, 10) || 0,
        totalHalls: parseInt(formData.totalHalls, 10) || 0,
        isVerified: formData.isVerified,
        status: formData.status,
        contactPerson: ""
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

  const sectionClass = "rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
  const previewLogo = logoPreview || formData.logoUrl

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[92vh] max-w-3xl gap-0 overflow-y-auto p-0">
        <DialogHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <DialogTitle className="text-xl font-bold text-slate-900">Edit Venue</DialogTitle>
          <DialogDescription className="text-slate-500">
            Update venue information, images, and settings
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
          {/* Images Section */}
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Venue Images</h3>

            {/* Logo Upload */}
            <div>
              <Label className="text-xs font-medium text-slate-600 mb-2 block">Upload Logo</Label>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  className="hidden"
                />

                {previewLogo ? (
                  <div className="relative inline-block">
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden border border-slate-200">
                      <AppImage
                        src={previewLogo}
                        alt="Venue logo"
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="flex flex-col items-center justify-center w-full py-6 text-center"
                  >
                    <Upload className="h-8 w-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600">Click to upload logo</p>
                    <p className="text-xs text-slate-400">PNG, JPG up to 2MB</p>
                  </button>
                )}
              </div>
            </div>

            {/* Additional Image URLs */}
            <div>
              <Label htmlFor="edit-galleryUrls" className="text-xs font-medium text-slate-600 mb-2 block">
                Additional Image URLs (comma-separated)
              </Label>
              <Input
                id="edit-galleryUrls"
                value={formData.galleryUrlsText}
                onChange={(e) => setFormData({ ...formData, galleryUrlsText: e.target.value })}
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                className="border-slate-200"
              />
            </div>

            {/* Upload More Photos */}
            <div>
              <Label className="text-xs font-medium text-slate-600 mb-2 block">Upload More Photos</Label>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryFileChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex flex-col items-center justify-center w-full py-6 text-center"
                >
                  <Image className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600">Click to upload photos</p>
                  <p className="text-xs text-slate-400">PNG, JPG up to 2MB each</p>
                </button>
              </div>

              {/* Gallery Previews */}
              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-3">
                  {galleryPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-slate-200">
                        <img
                          src={preview}
                          alt={`Photo ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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

          <DialogFooter className="flex flex-col-reverse gap-2 border-t border-slate-100 px-0 pt-4 sm:flex-row sm:justify-end">
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