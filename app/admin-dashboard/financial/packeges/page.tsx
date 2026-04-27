"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Package, Users, DollarSign, TrendingUp, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"

interface PromotionPackage {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  userCount: number
  duration: string
  durationDays: number
  categories: string[]
  recommended: boolean
  isActive: boolean
  userType: string
  order: number
}

interface EventCategoryOption {
  id: string
  name: string
}

export default function PromotionPackagesPage() {
  const [packages, setPackages] = useState<PromotionPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<PromotionPackage | null>(null)
  const [featureInput, setFeatureInput] = useState("")
  const [eventCategories, setEventCategories] = useState<EventCategoryOption[]>([])
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    userCount: "",
    duration: "",
    durationDays: "",
    categories: "",
    recommended: false,
    isActive: true,
    userType: "BOTH",
    features: [] as string[],
  })

  useEffect(() => {
    fetchPackages()
    fetchEventCategories()
  }, [])

  const fetchPackages = async () => {
    try {
      const data = await apiFetch<{ packages?: PromotionPackage[]; data?: PromotionPackage[] }>(
        "/api/admin/promotion-package",
        { auth: true },
      )
      setPackages(data.packages ?? data.data ?? [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load promotion packages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchEventCategories = async () => {
    try {
      const data = await apiFetch<
        EventCategoryOption[] | { data?: EventCategoryOption[]; success?: boolean }
      >("/api/event-categories", { auth: false })
      const list = Array.isArray(data) ? data : data.data ?? []
      setEventCategories(list)
      if (!editingPackage) {
        setFormData((prev) => ({
          ...prev,
          categories: prev.categories || list[0]?.name || "",
        }))
      }
    } catch (error) {
      setEventCategories([])
    }
  }

  const handleSubmit = async () => {
    try {
      const packageData = {
        ...formData,
        price: Number.parseFloat(formData.price),
        userCount: Number.parseInt(formData.userCount),
        durationDays: Number.parseInt(formData.durationDays),
        categories: [formData.categories],
      }

      const url = editingPackage
        ? `/api/admin/promotion-package/${editingPackage.id}`
        : "/api/admin/promotion-package"

      await apiFetch(url, {
        method: editingPackage ? "PATCH" : "POST",
        body: packageData,
        auth: true,
      })

      toast({
        title: "Success",
        description: `Package ${editingPackage ? "updated" : "created"} successfully`,
      })

      setIsDialogOpen(false)
      resetForm()
      fetchPackages()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save package",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return

    try {
      await apiFetch(`/api/admin/promotion-package/${id}`, {
        method: "DELETE",
        auth: true,
      })

      toast({
        title: "Success",
        description: "Package deleted successfully",
      })

      fetchPackages()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete package",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (pkg: PromotionPackage) => {
    const normalizedUserType =
      pkg.userType === "EXHIBITOR" || pkg.userType === "ORGANIZER" || pkg.userType === "BOTH"
        ? pkg.userType
        : "BOTH"
    setEditingPackage(pkg)
    setFormData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price.toString(),
      userCount: pkg.userCount.toString(),
      duration: pkg.duration,
      durationDays: pkg.durationDays.toString(),
      categories: pkg.categories[0] || eventCategories[0]?.name || "",
      recommended: pkg.recommended,
      isActive: pkg.isActive,
      userType: normalizedUserType,
      features: pkg.features,
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingPackage(null)
    setFormData({
      name: "",
      description: "",
      price: "",
      userCount: "",
      duration: "",
      durationDays: "",
      categories: eventCategories[0]?.name || "",
      recommended: false,
      isActive: true,
      userType: "BOTH",
      features: [],
    })
    setFeatureInput("")
  }

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()],
      })
      setFeatureInput("")
    }
  }

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    })
  }

  const stats = {
    totalPackages: packages.length,
    activePackages: packages.filter((p) => p.isActive).length,
    totalRevenue: packages.reduce((sum, p) => sum + p.price, 0),
    avgPrice: packages.length > 0 ? packages.reduce((sum, p) => sum + p.price, 0) / packages.length : 0,
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Promotion Packages</h1>
          <p className="text-gray-600">Manage promotion packages for exhibitors and organizers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Create Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPackage ? "Edit" : "Create"} Promotion Package</DialogTitle>
              <DialogDescription>Configure the details of your promotion package</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Package Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Basic Promotion"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price (USD)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="2999"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the package"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>User Count</Label>
                  <Input
                    type="number"
                    value={formData.userCount}
                    onChange={(e) => setFormData({ ...formData, userCount: e.target.value })}
                    placeholder="5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (days)</Label>
                  <Input
                    type="number"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                    placeholder="7"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration Display</Label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="7 days"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category Targeting</Label>
                  <Select
                    value={formData.categories}
                    onValueChange={(value) => setFormData({ ...formData, categories: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventCategories.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No categories available
                        </SelectItem>
                      ) : (
                        eventCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Available For</Label>
                <Select
                  value={formData.userType}
                  onValueChange={(value) => setFormData({ ...formData, userType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BOTH">Both Exhibitors & Organizers</SelectItem>
                    <SelectItem value="EXHIBITOR">Exhibitors Only</SelectItem>
                    <SelectItem value="ORGANIZER">Organizers Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Features</Label>
                <div className="flex gap-2">
                  <Input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="Enter a feature"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature}>
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="flex-1">{feature}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeFeature(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.recommended}
                    onCheckedChange={(checked) => setFormData({ ...formData, recommended: checked })}
                  />
                  <Label>Mark as Recommended</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>{editingPackage ? "Update" : "Create"} Package</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            <Package className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPackages}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Packages</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePackages}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <Users className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Math.round(stats.avgPrice).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Packages Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Packages</CardTitle>
          <CardDescription>Manage your promotion packages</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : packages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No packages created yet</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {pkg.name}
                        {pkg.recommended && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            <Star className="w-3 h-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${pkg.price.toLocaleString()}</TableCell>
                    <TableCell>{pkg.userCount.toLocaleString()}+</TableCell>
                    <TableCell>{pkg.duration}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{pkg.userType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={pkg.isActive ? "default" : "secondary"}>
                        {pkg.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(pkg)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(pkg.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
