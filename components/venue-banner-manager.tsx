// app/components/super-admin/venue-banner-manager.tsx
"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ImageUpload } from "@/components/ui/image-upload"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Plus, Trash2, Edit, Eye, Upload, X, Check } from "lucide-react"

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  page: string;
  link?: string;
  order: number;
  isActive: boolean;
  publicId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Venue {
  id: string;
  name: string;
  venueName?: string;
}

export function VenueBannerManager() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  
  const [formData, setFormData] = useState({
    title: "",
    page: "venue-detail",
    link: "",
    order: 0,
    targetVenueId: "",
    isGlobal: true,
    file: null as File | null,
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchBanners()
    fetchVenues()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await fetch("/api/banners?page=venue-detail")
      if (response.ok) {
        const data = await response.json()
        setBanners(data)
      }
    } catch (error) {
      console.error("Error fetching banners:", error)
      toast({
        title: "Error",
        description: "Failed to fetch banners",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchVenues = async () => {
    try {
      const response = await fetch("/api/venues/list") // You need to create this endpoint
      if (response.ok) {
        const data = await response.json()
        setVenues(data)
      }
    } catch (error) {
      console.error("Error fetching venues:", error)
    }
  }

  const handleFileChange = (file: File) => {
    setFormData({ ...formData, file })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.file) {
      toast({
        title: "Error",
        description: "Please select an image",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("file", formData.file)
      formDataToSend.append("title", formData.title)
      formDataToSend.append("page", formData.page)
      formDataToSend.append("order", formData.order.toString())
      formDataToSend.append("link", formData.link || "")
      formDataToSend.append("targetVenueId", formData.targetVenueId)
      formDataToSend.append("isGlobal", formData.isGlobal.toString())

      const response = await fetch("/api/banners", {
        method: "POST",
        body: formDataToSend,
      })

      if (response.ok) {
        const newBanner = await response.json()
        setBanners([newBanner, ...banners])
        
        toast({
          title: "Success",
          description: "Banner uploaded successfully",
        })

        // Reset form
        setFormData({
          title: "",
          page: "venue-detail",
          link: "",
          order: banners.length,
          targetVenueId: "",
          isGlobal: true,
          file: null,
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload banner")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload banner",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (bannerId: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return

    try {
      const response = await fetch(`/api/banners?id=${bannerId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setBanners(banners.filter(banner => banner.id !== bannerId))
        toast({
          title: "Success",
          description: "Banner deleted successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete banner",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (banner: Banner) => {
    try {
      const response = await fetch(`/api/banners?id=${banner.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !banner.isActive }),
      })

      if (response.ok) {
        const updatedBanner = await response.json()
        setBanners(banners.map(b => b.id === banner.id ? updatedBanner : b))
        
        toast({
          title: "Success",
          description: `Banner ${updatedBanner.isActive ? "activated" : "deactivated"}`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update banner",
        variant: "destructive",
      })
    }
  }

  const getVenueName = (link?: string) => {
    if (!link) return "Global"
    
    try {
      const linkData = JSON.parse(link)
      if (linkData.venueId) {
        const venue = venues.find(v => v.id === linkData.venueId)
        return venue?.name || venue?.venueName || linkData.venueId
      }
    } catch {
      return link.includes("venue:") ? link.split(":")[1] : "Global"
    }
    
    return "Global"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload New Venue Banner</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Banner Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter banner title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  value={formData.order}
                  onChange={handleInputChange}
                  placeholder="Order number"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Banner Link (Optional)</Label>
              <Input
                id="link"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder="https://example.com or leave empty"
              />
            </div>

            <div className="space-y-2">
              <Label>Banner Scope</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isGlobal}
                  onCheckedChange={(checked) => handleSwitchChange("isGlobal", checked)}
                />
                <span className="text-sm">{formData.isGlobal ? "Global (All venues)" : "Specific Venue"}</span>
              </div>
            </div>

            {!formData.isGlobal && (
              <div className="space-y-2">
                <Label htmlFor="targetVenueId">Select Venue</Label>
                <Select
                  value={formData.targetVenueId}
                  onValueChange={(value) => handleSelectChange("targetVenueId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name || venue.venueName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Banner Image</Label>
              <ImageUpload
                onFileSelect={handleFileChange}
                accept="image/*"
                maxSize={5 * 1024 * 1024} // 5MB
              />
              <p className="text-sm text-gray-500">
                Recommended size: 1920x600px, Max file size: 5MB
              </p>
            </div>

            <Button type="submit" disabled={uploading || !formData.file}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Banner
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Venue Banners</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No banners uploaded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Preview</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>{banner.title}</DialogTitle>
                            </DialogHeader>
                            <div className="relative w-full h-64 md:h-96">
                              <img
                                src={banner.imageUrl}
                                alt={banner.title}
                                className="object-contain w-full h-full"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="font-medium">{banner.title}</TableCell>
                      <TableCell>
                        <Badge variant={getVenueName(banner.link) === "Global" ? "default" : "secondary"}>
                          {getVenueName(banner.link)}
                        </Badge>
                      </TableCell>
                      <TableCell>{banner.order}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(banner)}
                          className={banner.isActive ? "text-green-600" : "text-gray-500"}
                        >
                          {banner.isActive ? (
                            <Check className="w-4 h-4 mr-1" />
                          ) : (
                            <X className="w-4 h-4 mr-1" />
                          )}
                          {banner.isActive ? "Active" : "Inactive"}
                        </Button>
                      </TableCell>
                      <TableCell>
                        {new Date(banner.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(banner.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}