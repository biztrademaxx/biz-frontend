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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Package, Users, DollarSign, TrendingUp, Star, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  adminAccentText,
  adminCardShell,
  adminPrimaryBtn,
} from "@/app/admin-dashboard/admin-dashboard-theme"

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

const USER_TYPE_OPTIONS = [
  { value: "BOTH", label: "Both Exhibitors & Organizers" },
  { value: "EXHIBITOR", label: "Exhibitors Only" },
  { value: "ORGANIZER", label: "Organizers Only" },
] as const

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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Promotion Packages</h1>
          <p className="mt-1 text-slate-600">Manage promotion packages for exhibitors and organizers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className={adminPrimaryBtn}>
              <Plus className="mr-2 h-4 w-4" />
              Create Package
            </Button>
          </DialogTrigger>
          <DialogContent className="flex max-h-[92vh] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
            <DialogHeader className="shrink-0 border-b border-slate-100 bg-slate-50/80 px-6 py-5">
              <DialogTitle className="text-slate-900">
                {editingPackage ? "Edit" : "Create"} Promotion Package
              </DialogTitle>
              <DialogDescription>Configure the details of your promotion package</DialogDescription>
            </DialogHeader>

            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Basic details</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Reach & duration</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                  <div className="space-y-2">
                    <Label>Duration Display</Label>
                    <Input
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="7 days"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <div>
                  <Label>Category Targeting</Label>
                  <p className="mt-1 text-xs text-slate-500">Select the event category this package targets</p>
                </div>
                {eventCategories.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    No categories available
                  </p>
                ) : (
                  <div className="grid max-h-44 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 sm:grid-cols-2">
                    {eventCategories.map((cat) => {
                      const selected = formData.categories === cat.name
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, categories: cat.name })}
                          className={cn(
                            "flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-all",
                            selected
                              ? "border-[#004A96] bg-[#004A96]/10 font-medium text-[#004A96] shadow-sm"
                              : "border-slate-200 bg-slate-50/50 text-slate-700 hover:border-[#004A96]/40 hover:bg-white",
                          )}
                        >
                          <span className="truncate pr-2">{cat.name}</span>
                          {selected && <Check className="h-4 w-4 shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </section>

              <section className="space-y-3">
                <Label>Available For</Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {USER_TYPE_OPTIONS.map((option) => {
                    const selected = formData.userType === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, userType: option.value })}
                        className={cn(
                          "rounded-lg border px-3 py-2.5 text-center text-sm transition-all",
                          selected
                            ? "border-[#004A96] bg-[#004A96] font-medium text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-700 hover:border-[#004A96]/40 hover:bg-slate-50",
                        )}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="space-y-3">
                <Label>Features</Label>
                <div className="flex gap-2">
                  <Input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="Enter a feature"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addFeature()
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addFeature} className="shrink-0">
                    Add
                  </Button>
                </div>
                {formData.features.length > 0 && (
                  <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-2">
                    {formData.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-slate-100"
                      >
                        <span className="flex-1 text-slate-800">{feature}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                          onClick={() => removeFeature(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="flex flex-wrap items-center gap-6 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.recommended}
                    onCheckedChange={(checked) => setFormData({ ...formData, recommended: checked })}
                  />
                  <Label>Mark as Recommended</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </section>
            </div>

            <DialogFooter className="shrink-0 border-t border-slate-100 bg-white px-6 py-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className={adminPrimaryBtn}>
                {editingPackage ? "Update" : "Create"} Package
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: "Total Packages", value: stats.totalPackages, icon: Package, color: "text-[#004A96]" },
          { label: "Active Packages", value: stats.activePackages, icon: TrendingUp, color: "text-emerald-600" },
          { label: "Total Value", value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-[#004A96]" },
          { label: "Average Price", value: `$${Math.round(stats.avgPrice).toLocaleString()}`, icon: Users, color: "text-violet-600" },
        ].map((stat) => (
          <Card key={stat.label} className={adminCardShell}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{stat.label}</CardTitle>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className={adminCardShell}>
        <CardHeader>
          <CardTitle className="text-slate-900">All Packages</CardTitle>
          <CardDescription>Manage your promotion packages</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-slate-500">Loading...</div>
          ) : packages.length === 0 ? (
            <div className="py-8 text-center text-slate-500">No packages created yet</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Category</TableHead>
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
                          <span className="font-medium text-slate-900">{pkg.name}</span>
                          {pkg.recommended && (
                            <Badge className="bg-[#004A96]/10 text-[#004A96] hover:bg-[#004A96]/15">
                              <Star className="mr-1 h-3 w-3" />
                              Recommended
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">${pkg.price.toLocaleString()}</TableCell>
                      <TableCell>{pkg.userCount.toLocaleString()}+</TableCell>
                      <TableCell>{pkg.duration}</TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">{pkg.categories[0] || "—"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{pkg.userType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            pkg.isActive
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                              : "bg-slate-100 text-slate-600",
                          )}
                        >
                          {pkg.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(pkg)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(pkg.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
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
