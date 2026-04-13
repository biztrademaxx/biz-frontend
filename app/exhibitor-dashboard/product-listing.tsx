"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Package, Plus, Upload, FileText, Edit, Trash2, ExternalLink, Youtube } from "lucide-react"

interface ProductListingProps {
  exhibitorId: string
}

interface Product {
  youtube: string
  id: string
  name: string
  category: string
  description: string
  images: string[]
  brochure: string[]
  price?: number
  currency?: string
}

const ProductForm = ({
  isEdit = false,
  onSubmit,
  onCancel,
  initialData,
  uploading,
}: {
  isEdit?: boolean
  onSubmit: (data: any) => void
  onCancel: () => void
  initialData?: any
  uploading: boolean
}) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    youtube: "",
    currency: "USD",
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [brochureFiles, setBrochureFiles] = useState<File[]>([])

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        category: initialData.category || "",
        description: initialData.description || "",
        price: initialData.price?.toString() || "",
        youtube: initialData.youtube || "",
        currency: initialData.currency || "USD",
      })
    } else {
      setFormData({
        name: "",
        category: "",
        description: "",
        price: "",
        youtube: "",
        currency: "USD",
      })
    }
    setImageFiles([])
    setBrochureFiles([])
  }, [initialData])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files))
    }
  }

  const handleBrochureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setBrochureFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      imageFiles,
      brochureFiles,
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="product-name">Product Name</Label>
          <Input
            id="product-name"
            placeholder="Enter product name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            placeholder="Enter category"
            value={formData.category}
            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="Describe your product or service..."
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="youtube">YouTube Link</Label>
        <Input
          id="youtube"
          placeholder="Enter YouTube link..."
          value={formData.youtube}
          onChange={(e) => setFormData((prev) => ({ ...prev, youtube: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (Optional)</Label>
          <Input
            id="price"
            type="number"
            placeholder="0.00"
            value={formData.price}
            onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Input
            id="currency"
            placeholder="USD"
            value={formData.currency}
            onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="images">Product Images {isEdit && "(Add More)"}</Label>
        <div className="border-2 border-dashed border-input rounded-lg p-6 text-center">
          <input id="images" type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
          <label htmlFor="images" className="cursor-pointer">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Click to upload images or drag and drop</p>
            <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
            {imageFiles.length > 0 && <p className="text-sm text-primary mt-2">{imageFiles.length} file(s) selected</p>}
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="brochures">Brochures/Catalogues {isEdit && "(Add More)"}</Label>
        <div className="border-2 border-dashed border-input rounded-lg p-6 text-center">
          <input id="brochures" type="file" accept=".pdf" multiple onChange={handleBrochureChange} className="hidden" />
          <label htmlFor="brochures" className="cursor-pointer">
            <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Upload PDF brochures and catalogues</p>
            <p className="text-sm text-muted-foreground">PDF files up to 25MB</p>
            {brochureFiles.length > 0 && (
              <p className="text-sm text-primary mt-2">{brochureFiles.length} file(s) selected</p>
            )}
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={uploading}>
          {uploading ? "Uploading..." : isEdit ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </div>
  )
}

const transformCloudinaryUrlForViewing = (url: string): string => {
  if (url.includes("cloudinary.com")) {
    return url.replace("/upload/", "/upload/fl_attachment:false/")
  }
  return url
}

export default function ProductListing({ exhibitorId }: ProductListingProps) {
  const { toast } = useToast()
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [uploading, setUploading] = useState(false)
  const [viewingBrochure, setViewingBrochure] = useState<string | null>(null)
  const [isBrochureDialogOpen, setIsBrochureDialogOpen] = useState(false)

  useEffect(() => {
    if (exhibitorId && exhibitorId !== "undefined") {
      fetchProducts()
    }
  }, [exhibitorId])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiFetch<{ products?: Product[] }>(
        `/api/exhibitors/${exhibitorId}/products`
      )
      setProducts(data?.products ?? [])
    } catch (err) {
      console.error("Error fetching products:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const uploadFiles = async (files: File[], type: "image" | "pdf") => {
    const uploadedUrls: string[] = []

    for (const file of files) {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)

      const response = await fetch("/api/exhibitorBrochure", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Failed to upload ${file.name}`)
      }

      const data = await response.json()
      uploadedUrls.push(data.url)
    }

    return uploadedUrls
  }

  const handleAddProduct = async (formData: any) => {
    try {
      setUploading(true)

      const imageUrls = formData.imageFiles.length > 0 ? await uploadFiles(formData.imageFiles, "image") : []
      const brochureUrls = formData.brochureFiles.length > 0 ? await uploadFiles(formData.brochureFiles, "pdf") : []

      const data = await apiFetch<{ product: Product }>(
        `/api/exhibitors/${exhibitorId}/products`,
        {
          method: "POST",
          body: {
            name: formData.name,
            category: formData.category,
            description: formData.description,
            youtube: formData.youtube,
            price: formData.price ? Number.parseFloat(formData.price) : undefined,
            currency: formData.currency,
            images: imageUrls,
            brochure: brochureUrls,
          },
        }
      )
      setProducts((prev) => [data.product, ...prev])
      setIsAddProductOpen(false)

      toast({
        title: "Success",
        description: "Product added successfully!",
      })
    } catch (err) {
      console.error("Error adding product:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleEditProduct = async (formData: any) => {
    if (!editingProduct) return

    try {
      setUploading(true)

      const newImageUrls = formData.imageFiles.length > 0 ? await uploadFiles(formData.imageFiles, "image") : []
      const newBrochureUrls = formData.brochureFiles.length > 0 ? await uploadFiles(formData.brochureFiles, "pdf") : []

      const data = await apiFetch<{ product: Product }>(
        `/api/exhibitors/${exhibitorId}/products/${editingProduct.id}`,
        {
          method: "PUT",
          body: {
            name: formData.name,
            category: formData.category,
            description: formData.description,
            youtube: formData.youtube,
            price: formData.price ? Number.parseFloat(formData.price) : undefined,
            currency: formData.currency,
            images: [...editingProduct.images, ...newImageUrls],
            brochure: [...editingProduct.brochure, ...newBrochureUrls],
          },
        }
      )
      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? data.product : p)))
      setIsEditProductOpen(false)
      setEditingProduct(null)

      toast({
        title: "Success",
        description: "Product updated successfully!",
      })
    } catch (err) {
      console.error("Error updating product:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      await apiFetch(`/api/exhibitors/${exhibitorId}/products/${productId}`, {
        method: "DELETE",
      })
      setProducts((prev) => prev.filter((p) => p.id !== productId))

      toast({
        title: "Success",
        description: "Product deleted successfully!",
      })
    } catch (err) {
      console.error("Error deleting product:", err)
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setIsEditProductOpen(true)
  }

  const removeImage = async (productId: string, imageUrl: string) => {
    try {
      const product = products.find((p) => p.id === productId)
      if (!product) return

      const updatedImages = product.images.filter((img) => img !== imageUrl)

      const data = await apiFetch<{ product: Product }>(
        `/api/exhibitors/${exhibitorId}/products/${productId}`,
        { method: "PUT", body: { images: updatedImages } }
      )

      await fetch("/api/upload/cloudinary", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: imageUrl }),
      })

      setProducts((prev) => prev.map((p) => (p.id === productId ? data.product : p)))

      toast({
        title: "Success",
        description: "Image removed successfully!",
      })
    } catch (err) {
      console.error("Error removing image:", err)
      toast({
        title: "Error",
        description: "Failed to remove image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const ProductCard = ({ product }: { product: Product }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={product.images[0] || "/placeholder.svg?height=96&width=96&text=Product"}
              alt={product.name}
              className="w-24 h-24 object-cover rounded-lg"
            />
            {product.images.length > 1 && (
              <Badge variant="secondary" className="absolute bottom-1 right-1 text-xs">
                +{product.images.length - 1}
              </Badge>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <Badge variant="secondary" className="mt-1">
                  {product.category}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => openEditDialog(product)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <p className="text-muted-foreground text-sm mb-4">{product.description}</p>

            {product.price && (
              <div className="mb-4">
                <span className="text-lg font-semibold text-green-600">
                  {product.currency} {product.price}
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {product.brochure?.map((brochureUrl: string, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-transparent"
                  onClick={() => {
                    setViewingBrochure(transformCloudinaryUrlForViewing(brochureUrl))
                    setIsBrochureDialogOpen(true)
                  }}
                >
                  <FileText className="w-4 h-4" />
                  View Brochure {index + 1}
                </Button>
              ))}
            </div>

            {product.youtube && product.youtube.length > 0 && (
              <div className="mt-4">
                <Label className="text-sm font-semibold mb-2 block">YouTube Links</Label>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(product.youtube) ? (
                    product.youtube.map((link, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 bg-transparent"
                        onClick={() => window.open(link, "_blank")}
                      >
                        <Youtube className="w-4 h-4 text-red-600" />
                        Video {index + 1}
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    ))
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 bg-transparent"
                      onClick={() => window.open(product.youtube, "_blank")}
                    >
                      <Youtube className="w-4 h-4 text-red-600" />
                      Watch Video
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchProducts}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Product Listing & Brochures</h1>
        <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Product/Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product/Service</DialogTitle>
            </DialogHeader>
            <ProductForm
              onSubmit={handleAddProduct}
              onCancel={() => setIsAddProductOpen(false)}
              uploading={uploading}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product/Service</DialogTitle>
          </DialogHeader>
          <ProductForm
            isEdit
            onSubmit={handleEditProduct}
            onCancel={() => {
              setIsEditProductOpen(false)
              setEditingProduct(null)
            }}
            initialData={editingProduct}
            uploading={uploading}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isBrochureDialogOpen} onOpenChange={setIsBrochureDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Brochure Viewer
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => viewingBrochure && window.open(viewingBrochure, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="w-full h-[75vh] p-6 pt-4">
            {viewingBrochure && (
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(viewingBrochure)}&embedded=true`}
                className="w-full h-full border rounded-lg"
                title="Brochure Viewer"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {products.length > 0 ? (
          products.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No products listed</h3>
              <p className="text-muted-foreground">Add your first product to get started</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Content Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{products.length}</div>
              <div className="text-muted-foreground">Total Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {products.reduce((sum, p) => sum + (p.images?.length || 0), 0)}
              </div>
              <div className="text-muted-foreground">Total Images</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {products.reduce((sum, p) => sum + (p.brochure?.length || 0), 0)}
              </div>
              <div className="text-muted-foreground">Total Brochures</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
