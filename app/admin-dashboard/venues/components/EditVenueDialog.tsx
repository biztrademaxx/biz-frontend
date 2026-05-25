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
import { Image } from "lucide-react"
import { useEffect, useState, type FormEvent } from "react"
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
    logoUrl: "",
    galleryUrlsText: "",
    isVerified: false,
    status: "pending",
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

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
        logoUrl: venue.logo || "",
        galleryUrlsText: gallery.join(", "),
        isVerified: venue.isVerified || false,
        status: venue.status || (venue.isVerified ? "active" : "pending"),
      })
      setLogoFile(null)
      setGalleryFiles([])
    }
  }, [venue])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.venueName.trim() || !formData.contactPerson.trim() || !formData.email.trim()) {
      toast.error("Venue name, contact person, and email are required")
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
        logo,
        venueImages,
        maxCapacity: parseInt(formData.maxCapacity, 10) || 0,
        totalHalls: parseInt(formData.totalHalls, 10) || 0,
        isVerified: formData.isVerified,
        status: formData.status,
      })
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : "Failed to upload images")
    } finally {
      setUploading(false)
    }
  }

  const sectionClass = "rounded-lg border bg-muted/30 p-4 space-y-4"
  const previewLogo = logoFile ? URL.createObjectURL(logoFile) : formData.logoUrl

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[92vh] max-w-3xl gap-0 overflow-y-auto p-0">
        <DialogHeader className="border-b bg-muted/20 px-6 py-4">
          <DialogTitle className="text-xl">Edit venue</DialogTitle>
          <DialogDescription>
            {venue?.venueName
              ? `Update all fields for ${venue.venueName} before approval or publishing.`
              : "Update venue information"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <div className={sectionClass}>
            <p className="text-sm font-semibold text-foreground">Images</p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="relative mx-auto h-[120px] w-[120px] shrink-0 overflow-hidden rounded-full border-2 border-white bg-muted shadow-md ring-2 ring-slate-200 sm:mx-0">
                {previewLogo ? (
                  <AppImage
                    src={previewLogo}
                    alt="Venue logo"
                    fill
                    sizes="120px"
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
                    <Image className="h-8 w-8 opacity-40" />
                    <span className="text-xs">No image</span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-logoUrl">Logo / main image URL</Label>
                  <Input
                    id="edit-logoUrl"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-logoFile">Upload logo</Label>
                  <Input
                    id="edit-logoFile"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-galleryUrls">Additional image URLs (comma-separated)</Label>
                  <Input
                    id="edit-galleryUrls"
                    value={formData.galleryUrlsText}
                    onChange={(e) => setFormData({ ...formData, galleryUrlsText: e.target.value })}
                    placeholder="https://..., https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-galleryFiles">Upload more photos</Label>
                  <Input
                    id="edit-galleryFiles"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setGalleryFiles(Array.from(e.target.files ?? []))}
                  />
                </div>
              </div>
            </div>
            {(venue?.venueImages?.length ?? 0) > 0 ? (
              <div className="flex gap-2 overflow-x-auto pt-1">
                {venue!.venueImages.slice(0, 6).map((url, i) => (
                  <div
                    key={`${url}-${i}`}
                    className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200"
                  >
                    <AppImage src={url} alt="" fill sizes="56px" className="rounded-full object-cover" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className={sectionClass}>
            <p className="text-sm font-semibold text-foreground">Basic information</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-venueName">Venue name *</Label>
                <Input
                  id="edit-venueName"
                  value={formData.venueName}
                  onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contactPerson">Contact person *</Label>
                <Input
                  id="edit-contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-mobile">Mobile</Label>
                <Input
                  id="edit-mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-website">Website</Label>
                <Input
                  id="edit-website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://"
                />
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <p className="text-sm font-semibold text-foreground">Location</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-address">Address</Label>
                <Textarea
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-state">State</Label>
                <Input
                  id="edit-state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-country">Country</Label>
                <Input
                  id="edit-country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <p className="text-sm font-semibold text-foreground">Venue details</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-capacity">Max capacity</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  min={0}
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-totalHalls">Total halls</Label>
                <Input
                  id="edit-totalHalls"
                  type="number"
                  min={0}
                  value={formData.totalHalls}
                  onChange={(e) => setFormData({ ...formData, totalHalls: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-amenities">Amenities (comma-separated)</Label>
                <Input
                  id="edit-amenities"
                  value={formData.amenitiesText}
                  onChange={(e) => setFormData({ ...formData, amenitiesText: e.target.value })}
                  placeholder="WiFi, Parking, Catering"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <p className="text-sm font-semibold text-foreground">Status & verification</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Listing status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending approval</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 rounded-md border bg-background px-4 py-3">
                <Switch
                  id="edit-verified"
                  checked={formData.isVerified}
                  onCheckedChange={(checked) => setFormData({ ...formData, isVerified: checked })}
                />
                <Label htmlFor="edit-verified" className="cursor-pointer">
                  Mark as verified venue
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 border-t px-0 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={uploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
