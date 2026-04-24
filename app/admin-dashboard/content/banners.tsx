"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Upload, Trash2, Eye, Search, ImageIcon, Plus, Pencil } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"

interface Banner {
  id: string
  title: string
  imageUrl: string
  publicId: string
  page: string
  position: string
  link?: string
  isActive: boolean
  width: number
  height: number
  createdAt: string
  updatedAt: string
}

const PAGE_OPTIONS = [
  { value: "organizer-dashboard", label: "Organizer Dashboard" },
  { value: "exhibitor-dashboard", label: "Exhibitor Dashboard" },
  { value: "venue-dashboard", label: "Venue Dashboard" },
  { value: "speaker-dashboard", label: "Speaker Dashboard" },
  { value: "homepage", label: "Homepage" },
  { value: "events", label: "Events Page" },
  { value: "event-detail", label: "Event Detail Page" },
  { value: "speakers", label: "Speakers Page" },
  { value: "speaker-detail", label: "Speaker Detail Page" },
  { value: "exhibitors", label: "Exhibitors Page" },
  { value: "exhibitor-detail", label: "Exhibitor Detail Page" },
  { value: "organizers", label: "Organizers Page" },
  { value: "organizer-detail", label: "Organizer Detail Page" },
  { value: "venues", label: "Venues Page" },
  { value: "venue-detail", label: "Venue Detail Page" },
  { value: "about", label: "About Page" },
  { value: "contact", label: "Contact Page" },
]

const POSITION_OPTIONS = [
  { value: "hero", label: "Hero Banner (Top)" },
  { value: "middle", label: "Middle Section" },
  { value: "bottom", label: "Bottom Section" },
  { value: "sidebar", label: "Sidebar" },
]

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [filteredBanners, setFilteredBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPage, setSelectedPage] = useState<string>("all")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editFile, setEditFile] = useState<File | null>(null)
  /** Local object URL for the chosen replacement file — preview updates immediately in the dialog. */
  const [editFilePreviewUrl, setEditFilePreviewUrl] = useState<string | null>(null)

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: "",
    page: "",
    position: "hero",
    link: "",
    file: null as File | null,
  })

  const [editForm, setEditForm] = useState({
    title: "",
    page: "",
    position: "hero",
    link: "",
    isActive: true,
  })

  useEffect(() => {
    fetchBanners()
  }, [])

  useEffect(() => {
    filterBanners()
  }, [banners, searchQuery, selectedPage])

  useEffect(() => {
    if (!editFile) {
      setEditFilePreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(editFile)
    setEditFilePreviewUrl(url)
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [editFile])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const res = await apiFetch<{ success?: boolean; data?: Banner[] }>("/api/admin/content/banners", { auth: true })
      setBanners(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error("Error fetching banners:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterBanners = () => {
    let filtered = [...banners]

    if (searchQuery) {
      filtered = filtered.filter(
        (banner) =>
          banner.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          banner.page.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedPage !== "all") {
      filtered = filtered.filter((banner) => banner.page === selectedPage)
    }

    setFilteredBanners(filtered)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadForm({ ...uploadForm, file: e.target.files[0] })
    }
  }

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.title || !uploadForm.page) {
      alert("Please fill all required fields and select an image")
      return
    }

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append("file", uploadForm.file)
      formData.append("type", "image")
      formData.append("folder", "banners")

      const up = await apiFetch<{
        success?: boolean
        secure_url?: string
        public_id?: string
        error?: string
      }>("/api/admin/upload", {
        method: "POST",
        body: formData,
        auth: true,
      })

      if (!up.success || !up.secure_url) {
        throw new Error(up.error || "Upload failed")
      }

      const linkTrim = uploadForm.link.trim()
      const created = await apiFetch<{ success?: boolean; data?: Banner }>("/api/admin/content/banners", {
        method: "POST",
        body: {
          title: uploadForm.title,
          page: uploadForm.page,
          position: uploadForm.position,
          imageUrl: up.secure_url,
          publicId: up.public_id ?? "",
          ...(linkTrim ? { link: linkTrim } : {}),
        },
        auth: true,
      })

      if (created.data) {
        setBanners([created.data, ...banners])
        setIsUploadDialogOpen(false)
        setUploadForm({ title: "", page: "", position: "hero", link: "", file: null })
      } else {
        alert("Could not create banner record")
      }
    } catch (err: any) {
      console.error("Error uploading banner:", err)
      alert(err?.message || "Banner upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (bannerId: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return

    try {
      await apiFetch(`/api/admin/content/banners/${bannerId}`, {
        method: "DELETE",
        auth: true,
      })
      setBanners(banners.filter((b) => b.id !== bannerId))
    } catch (error) {
      console.error("Error deleting banner:", error)
      alert("Error deleting banner")
    }
  }

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner)
    setEditForm({
      title: banner.title,
      page: banner.page,
      position: banner.position,
      link: banner.link?.trim() ?? "",
      isActive: banner.isActive,
    })
    setEditFile(null)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingBanner) return
    if (!editForm.title.trim() || !editForm.page) {
      alert("Title and page are required")
      return
    }

    try {
      setSavingEdit(true)
      let imageUrl = editingBanner.imageUrl
      let publicId = editingBanner.publicId

      if (editFile) {
        const formData = new FormData()
        formData.append("file", editFile)
        formData.append("type", "image")
        formData.append("folder", "banners")
        const up = await apiFetch<{
          success?: boolean
          secure_url?: string
          public_id?: string
          error?: string
        }>("/api/admin/upload", {
          method: "POST",
          body: formData,
          auth: true,
        })
        if (!up.success || !up.secure_url) {
          throw new Error(up.error || "Image upload failed")
        }
        imageUrl = up.secure_url
        publicId = up.public_id ?? ""
      }

      const linkTrim = editForm.link.trim()
      const updated = await apiFetch<{ success?: boolean; data?: Banner }>(
        `/api/admin/content/banners/${editingBanner.id}`,
        {
          method: "PATCH",
          body: {
            title: editForm.title.trim(),
            page: editForm.page,
            position: editForm.position,
            link: linkTrim,
            isActive: editForm.isActive,
            ...(editFile ? { imageUrl, publicId } : {}),
          },
          auth: true,
        },
      )

      if (updated.data) {
        let nextRow: Banner = updated.data
        if (editFile && imageUrl) {
          nextRow = { ...nextRow, imageUrl, publicId }
        }
        setBanners(banners.map((b) => (b.id === editingBanner.id ? nextRow : b)))
        setIsEditDialogOpen(false)
        setEditingBanner(null)
        setEditFile(null)
      } else {
        alert("Could not update banner")
      }
    } catch (err: unknown) {
      console.error("Error updating banner:", err)
      alert(err instanceof Error ? err.message : "Banner update failed")
    } finally {
      setSavingEdit(false)
    }
  }

  const handleToggleStatus = async (bannerId: string, currentStatus: boolean) => {
    try {
      await apiFetch(`/api/admin/content/banners/${bannerId}`, {
        method: "PATCH",
        body: { isActive: !currentStatus },
        auth: true,
      })
      setBanners(banners.map((b) => (b.id === bannerId ? { ...b, isActive: !currentStatus } : b)))
    } catch (error) {
      console.error("Error toggling banner status:", error)
    }
  }

  const groupedBanners = PAGE_OPTIONS.reduce(
    (acc, page) => {
      acc[page.value] = filteredBanners.filter((b) => b.page === page.value)
      return acc
    },
    {} as Record<string, Banner[]>,
  )

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Banner & Ads Manager</h1>
        <p className="text-gray-600">Manage banners and advertisements across all pages</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Banners</p>
              <p className="text-2xl font-bold mt-1">{banners.length}</p>
            </div>
            <ImageIcon className="w-10 h-10 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{banners.filter((b) => b.isActive).length}</p>
            </div>
            <Badge className="bg-green-100 text-green-800">Active</Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold mt-1 text-gray-600">{banners.filter((b) => !b.isActive).length}</p>
            </div>
            <Badge variant="secondary">Inactive</Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pages Covered</p>
              <p className="text-2xl font-bold mt-1">{new Set(banners.map((b) => b.page)).size}</p>
            </div>
            <ImageIcon className="w-10 h-10 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search banners by title or page..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={selectedPage} onValueChange={setSelectedPage}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Filter by page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pages</SelectItem>
              {PAGE_OPTIONS.map((page) => (
                <SelectItem key={page.value} value={page.value}>
                  {page.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Upload Banner
          </Button>
        </div>
      </Card>

      {/* Banners Display - Tabbed by Page */}
      <Card className="p-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 flex-wrap h-auto">
            <TabsTrigger value="all">All ({filteredBanners.length})</TabsTrigger>
            {PAGE_OPTIONS.map((page) => {
              const count = groupedBanners[page.value]?.length || 0
              return (
                <TabsTrigger key={page.value} value={page.value}>
                  {page.label} ({count})
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value="all">
            <BannerGrid
              banners={filteredBanners}
              onPreview={(banner) => {
                setSelectedBanner(banner)
                setIsPreviewDialogOpen(true)
              }}
              onEdit={openEditDialog}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          </TabsContent>

          {PAGE_OPTIONS.map((page) => (
            <TabsContent key={page.value} value={page.value}>
              <BannerGrid
                banners={groupedBanners[page.value] || []}
                onPreview={(banner) => {
                  setSelectedBanner(banner)
                  setIsPreviewDialogOpen(true)
                }}
                onEdit={openEditDialog}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload New Banner</DialogTitle>
            <DialogDescription>Upload a banner image for a specific page location</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Banner Title *</Label>
              <Input
                id="title"
                placeholder="E.g., Homepage Hero Banner"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="page">Page Location *</Label>
              <select
                id="page"
                value={uploadForm.page}
                onChange={(e) => setUploadForm({ ...uploadForm, page: e.target.value })}
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="" disabled>
                  Select page
                </option>
                {PAGE_OPTIONS.map((page) => (
                  <option key={page.value} value={page.value}>
                    {page.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="position">Position on Page</Label>
              <select
                id="position"
                value={uploadForm.position}
                onChange={(e) => setUploadForm({ ...uploadForm, position: e.target.value })}
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {POSITION_OPTIONS.map((pos) => (
                  <option key={pos.value} value={pos.value}>
                    {pos.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="link">Destination link (optional)</Label>
              <Input
                id="link"
                type="url"
                placeholder="https://example.com — visitors open this when they click the banner image on the site"
                value={uploadForm.link}
                onChange={(e) => setUploadForm({ ...uploadForm, link: e.target.value })}
              />
              <p className="text-sm text-gray-500 mt-1">
                Only the image is clickable on the public site; text below the image stays static.
              </p>
            </div>

            <div>
              <Label htmlFor="file">Banner Image *</Label>
              <Input id="file" type="file" accept="image/*" onChange={handleFileChange} className="cursor-pointer" />
              <p className="text-sm text-gray-500 mt-1">Recommended: 1920x600px for hero banners, JPG or PNG</p>
            </div>

            {uploadForm.file && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <img
                  src={URL.createObjectURL(uploadForm.file) || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Banner
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Banner Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setEditingBanner(null)
            setEditFile(null)
            setEditFilePreviewUrl(null)
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Banner</DialogTitle>
            <DialogDescription>
              Change placement, copy, link, or replace the image. Save to apply on the live site.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Banner Title *</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="edit-page">Page Location *</Label>
              <select
                id="edit-page"
                value={editForm.page}
                onChange={(e) => setEditForm({ ...editForm, page: e.target.value })}
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="" disabled>
                  Select page
                </option>
                {PAGE_OPTIONS.map((page) => (
                  <option key={page.value} value={page.value}>
                    {page.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="edit-position">Position on Page</Label>
              <select
                id="edit-position"
                value={editForm.position}
                onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {POSITION_OPTIONS.map((pos) => (
                  <option key={pos.value} value={pos.value}>
                    {pos.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="edit-link">Destination link</Label>
              <Input
                id="edit-link"
                type="url"
                placeholder="https://example.com (leave empty to remove link)"
                value={editForm.link}
                onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="edit-active"
                checked={editForm.isActive}
                onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked === true })}
              />
              <Label htmlFor="edit-active" className="text-sm font-normal cursor-pointer">
                Published (visible on site)
              </Label>
            </div>

            <div>
              <Label htmlFor="edit-file">Replace image (optional)</Label>
              <Input
                id="edit-file"
                type="file"
                accept="image/*"
                className="cursor-pointer"
                onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
              />
              {editFile && (
                <p className="text-sm text-gray-600 mt-1">Selected: {editFile.name}</p>
              )}
            </div>

            {editingBanner && (
              <div className="border rounded-lg p-3 bg-gray-50 space-y-2">
                {editFilePreviewUrl ? (
                  <>
                    <p className="text-xs font-medium text-gray-700">New image preview</p>
                    <img
                      src={editFilePreviewUrl}
                      alt="New banner preview"
                      className="w-full max-h-48 object-contain rounded-md border border-gray-200 bg-white"
                    />
                    <p className="text-xs text-gray-500">This replaces the image below after you save.</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-medium text-gray-700">Current image</p>
                    <img
                      key={`${editingBanner.id}-${editingBanner.updatedAt}-${editingBanner.imageUrl}`}
                      src={editingBanner.imageUrl || "/placeholder.svg"}
                      alt=""
                      className="w-full max-h-48 object-contain rounded-md border border-gray-200 bg-white"
                    />
                  </>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setEditingBanner(null)
                setEditFile(null)
              }}
              disabled={savingEdit}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={savingEdit}>
              {savingEdit ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedBanner?.title}</DialogTitle>
            <DialogDescription>
              {PAGE_OPTIONS.find((p) => p.value === selectedBanner?.page)?.label} -{" "}
              {POSITION_OPTIONS.find((p) => p.value === selectedBanner?.position)?.label}
            </DialogDescription>
          </DialogHeader>

          {selectedBanner && (
            <div className="space-y-4">
              <img
                src={selectedBanner.imageUrl || "/placeholder.svg"}
                alt={selectedBanner.title}
                className="w-full rounded-lg"
              />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Dimensions</p>
                  <p className="font-medium">
                    {selectedBanner.width} x {selectedBanner.height}px
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <Badge variant={selectedBanner.isActive ? "default" : "secondary"}>
                    {selectedBanner.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-600">Created</p>
                  <p className="font-medium">{new Date(selectedBanner.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Last Updated</p>
                  <p className="font-medium">{new Date(selectedBanner.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">Click-through link</p>
                  <p className="font-medium break-all">
                    {selectedBanner.link?.trim() ? (
                      <a
                        href={selectedBanner.link.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedBanner.link.trim()}
                      </a>
                    ) : (
                      <span className="text-gray-400">None (image not linked)</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function BannerGrid({
  banners,
  onPreview,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  banners: Banner[]
  onPreview: (banner: Banner) => void
  onEdit: (banner: Banner) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string, currentStatus: boolean) => void
}) {
  if (banners.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No banners found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {banners.map((banner) => (
        <Card key={banner.id} className="overflow-hidden">
          <div className="relative h-48 bg-gray-100">
            <img
              src={banner.imageUrl || "/placeholder.svg"}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <Badge className="absolute top-2 right-2" variant={banner.isActive ? "default" : "secondary"}>
              {banner.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="p-4">
            <h3 className="font-semibold mb-1 truncate">{banner.title}</h3>
            <p className="text-sm text-gray-600 mb-1">{PAGE_OPTIONS.find((p) => p.value === banner.page)?.label}</p>
            {banner.link?.trim() ? (
              <p className="text-xs text-blue-600 truncate mb-2" title={banner.link}>
                Link: {banner.link}
              </p>
            ) : (
              <p className="text-xs text-gray-400 mb-2">No click-through link</p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="flex-1 min-w-[4rem] bg-transparent" onClick={() => onPreview(banner)}>
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button size="sm" variant="outline" onClick={() => onEdit(banner)}>
                <Pencil className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => onToggleStatus(banner.id, banner.isActive)}>
                {banner.isActive ? "Off" : "On"}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(banner.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
