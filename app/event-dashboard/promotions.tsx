"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"
import { cn } from "@/lib/utils"
import { adminCardShell, adminPrimaryBtn } from "@/app/admin-dashboard/admin-dashboard-theme"
import {
  Megaphone,
  Users,
  Target,
  CreditCard,
  CheckCircle,
  MapPin,
  GraduationCap,
  Briefcase,
  Music,
  Car,
  Home,
  Utensils,
  ShoppingBag,
  Plane,
  Dumbbell,
  Palette,
  Code,
  Stethoscope,
  Star,
  Loader2,
  Check,
} from "lucide-react"

interface Event {
  id: string
  title: string
  date: string
  location: string
  status: string
  category: string
}

interface Promotion {
  id: string
  eventId: string
  event: {
    id: string
    title: string
    date: string
    location: string
    status: string
  } | null
  packageType: string
  targetCategories: string[]
  status: string
  amount: number
  duration: number
  startDate: string
  endDate: string
  impressions: number
  clicks: number
  conversions: number
  createdAt: string
}

interface PromotionPackage {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  userCount: number
  categories: string[]
  duration: string
  recommended?: boolean
}

interface CategoryFilter {
  id: string
  name: string
  icon: any
  userCount: number
  avgEngagement: number
  color: string
}

interface DbCategory {
  id: string
  name: string
  icon?: string | null
  color?: string | null
}

export default function EventPromotion({ eventId }: { eventId: string }) {
  const { toast } = useToast()
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedPackage, setSelectedPackage] = useState("")
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const [promotionPackages, setPromotionPackages] = useState<PromotionPackage[]>([])
  const [packagesLoading, setPackagesLoading] = useState(true)

  // State for API data
  const [event, setEvent] = useState<Event | null>(null)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [userCategories, setUserCategories] = useState<CategoryFilter[]>([])

  const iconByCategory = (name: string) => {
    const key = name.toLowerCase()
    if (key.includes("tech") || key.includes("it")) return Code
    if (key.includes("business") || key.includes("finance")) return Briefcase
    if (key.includes("health") || key.includes("medical")) return Stethoscope
    if (key.includes("education") || key.includes("training")) return GraduationCap
    if (key.includes("art") || key.includes("culture")) return Palette
    if (key.includes("sport") || key.includes("fitness")) return Dumbbell
    if (key.includes("food") || key.includes("beverage")) return Utensils
    if (key.includes("travel") || key.includes("tourism")) return Plane
    if (key.includes("auto")) return Car
    if (key.includes("real estate") || key.includes("property")) return Home
    if (key.includes("entertainment")) return Music
    if (key.includes("retail") || key.includes("shopping")) return ShoppingBag
    return Target
  }

  useEffect(() => {
    fetchPromotionData()
    fetchPromotionPackages()
    fetchPromotionCategories()
  }, [eventId])

  const fetchPromotionCategories = async () => {
    try {
      const data = await apiFetch<{ success?: boolean; data?: DbCategory[] }>("/api/event-categories", { auth: true })
      const list = (data.data ?? []).map((cat) => ({
        id: cat.name.toLowerCase().replace(/\s+/g, "-"),
        name: cat.name,
        icon: iconByCategory(cat.name),
        userCount: 0,
        avgEngagement: 0,
        color: "bg-blue-500",
      }))
      setUserCategories(list)
    } catch (error) {
      setUserCategories([])
    }
  }

  const fetchPromotionPackages = async () => {
    try {
      setPackagesLoading(true)
      const data = await apiFetch<{ packages: any[] }>("/api/promotion-packages?userType=ORGANIZER", {
        auth: true,
      })

      // Transform API response to match component structure
      const transformedPackages = data.packages.map((pkg: any) => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        features: pkg.features,
        userCount: pkg.userCount,
        categories: Array.isArray(pkg.categories) ? pkg.categories : [],
        duration: pkg.duration || `${pkg.durationDays || 0} days`,
        recommended: !!pkg.recommended,
      }))

      setPromotionPackages(transformedPackages)
    } catch (error) {
      console.error("Error fetching promotion packages:", error)
      toast({
        title: "Error",
        description: "Failed to load promotion packages",
        variant: "destructive",
      })
    } finally {
      setPackagesLoading(false)
    }
  }

  const fetchPromotionData = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<{ event: Event; promotions: Promotion[] }>(
        `/api/events/${eventId}/promotions`,
        { auth: false },
      )
      setEvent(data.event)
      setPromotions(data.promotions || [])
    } catch (error) {
      console.error("Error fetching promotion data:", error)
      toast({
        title: "Error",
        description: "Failed to load promotion data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createPromotion = async () => {
    const selectedPackageData = promotionPackages.find((p) => p.id === selectedPackage)
    if (!selectedPackageData) return

    try {
      setCreating(true)
      await apiFetch(`/api/events/${eventId}/promotions`, {
        method: "POST",
        body: {
          packageType: selectedPackageData.id,
          targetCategories: selectedCategories,
          amount: selectedPackageData.price,
          duration: Number.parseInt(selectedPackageData.duration.split(" ")[0]),
        },
      })

      toast({
        title: "Success",
        description: "Promotion campaign created successfully!",
      })

      setIsPaymentDialogOpen(false)
      setSelectedCategories([])
      setSelectedPackage("")
      fetchPromotionData()
    } catch (error) {
      console.error("Error creating promotion:", error)
      toast({
        title: "Error",
        description: "Failed to create promotion campaign",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const calculateEstimatedReach = () => {
    if (selectedCategories.length === 0) return 0
    return selectedCategories.reduce((total, categoryId) => {
      const category = userCategories.find((c) => c.id === categoryId)
      return total + (category?.userCount || 0)
    }, 0)
  }

  const calculateEstimatedEngagement = () => {
    if (selectedCategories.length === 0) return 0
    const totalEngagement = selectedCategories.reduce((total, categoryId) => {
      const category = userCategories.find((c) => c.id === categoryId)
      return total + (category?.avgEngagement || 0)
    }, 0)
    return Math.round(totalEngagement / selectedCategories.length)
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId)
    setSelectedCategories([])
  }

  const selectedPackageData = promotionPackages.find((p) => p.id === selectedPackage)
  const displayedCategories = selectedPackageData
    ? userCategories.filter((cat) =>
        (selectedPackageData.categories || [])
          .map((c) => c.toLowerCase().trim())
          .includes(cat.name.toLowerCase().trim()),
      )
    : []

  if (loading || packagesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Event not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Promote Your Event</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{event.title}</span>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {event.location}
            </div>
            <Badge variant="outline">{event.status}</Badge>
          </div>
        </div>
        <Badge variant="outline" className="w-fit bg-[#004A96]/10 text-[#004A96]">
          <Users className="mr-1 h-4 w-4" />
          {userCategories.reduce((total, cat) => total + cat.userCount, 0).toLocaleString()} Platform Users
        </Badge>
      </div>

      {/* Step 1: Promotion Packages */}
      <Card className={cn(adminCardShell, "relative z-0 overflow-visible")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Megaphone className="h-5 w-5 text-[#004A96]" />
            Step 1 — Choose Promotion Package
          </CardTitle>
          <p className="text-sm text-slate-600">
            Select a package configured by admin. Category targeting appears in the next step.
          </p>
        </CardHeader>
        <CardContent className="overflow-visible">
          {promotionPackages.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <p>No promotion packages available at the moment.</p>
              <p className="mt-2 text-sm">Please check back later or contact support.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 overflow-visible pt-2 md:grid-cols-3">
              {promotionPackages.map((pkg) => {
                const isSelected = selectedPackage === pkg.id
                return (
                  <div
                    key={pkg.id}
                    className={cn(
                      "relative flex flex-col rounded-2xl border-2 bg-white p-6 shadow-sm transition-all",
                      isSelected
                        ? "border-[#004A96] ring-2 ring-[#004A96]/20"
                        : pkg.recommended
                          ? "border-[#004A96]/50"
                          : "border-slate-200 hover:border-[#004A96]/30",
                    )}
                  >
                    {pkg.recommended && (
                      <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                        <Badge className="bg-[#004A96] text-white shadow-sm">
                          <Star className="mr-1 h-3 w-3" />
                          Recommended
                        </Badge>
                      </div>
                    )}

                    <div className="mb-4 text-center">
                      <h3 className="text-xl font-bold text-slate-900">{pkg.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{pkg.description}</p>
                      <div className="mt-3">
                        <span className="text-3xl font-bold text-[#004A96]">₹{pkg.price.toLocaleString()}</span>
                        <span className="text-sm text-slate-500">/{pkg.duration}</span>
                      </div>
                    </div>

                    <div className="mb-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Reach</span>
                        <span className="font-medium">{pkg.userCount.toLocaleString()}+ users</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Duration</span>
                        <span className="font-medium">{pkg.duration}</span>
                      </div>
                    </div>

                    <div className="mb-6 flex-1 space-y-2">
                      {pkg.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-slate-700">
                          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className={cn("w-full", isSelected && adminPrimaryBtn)}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => handlePackageSelect(pkg.id)}
                    >
                      {isSelected ? "Selected" : "Select Package"}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Category Selection — separate card, always on top */}
      {selectedPackageData && (
        <Card className={cn(adminCardShell, "relative z-10")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Target className="h-5 w-5 text-[#004A96]" />
              Step 2 — Target User Categories
            </CardTitle>
            <p className="text-sm text-slate-600">
              Categories configured for <span className="font-medium text-[#004A96]">{selectedPackageData.name}</span>
            </p>
          </CardHeader>
          <CardContent>
            {displayedCategories.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                No categories configured for this package.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {displayedCategories.map((category) => {
                    const isSelected = selectedCategories.includes(category.id)
                    return (
                      <div
                        key={category.id}
                        role="button"
                        tabIndex={0}
                        className={cn(
                          "cursor-pointer rounded-xl border-2 p-4 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#004A96]/40",
                          isSelected
                            ? "border-[#004A96] bg-[#004A96]/10 shadow-sm"
                            : "border-slate-200 bg-white hover:border-[#004A96]/40 hover:bg-slate-50",
                        )}
                        onClick={() => handleCategoryToggle(category.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            handleCategoryToggle(category.id)
                          }
                        }}
                      >
                        <div className="mb-3 flex items-center gap-3">
                          <div className={cn("rounded-lg p-2", category.color)}>
                            <category.icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-semibold text-slate-900">{category.name}</h3>
                          </div>
                          <div
                            aria-hidden
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded border shadow-xs",
                              isSelected
                                ? "border-[#004A96] bg-[#004A96] text-white"
                                : "border-slate-300 bg-white",
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Users</span>
                            <span className="font-medium">{category.userCount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Engagement</span>
                            <span className="font-medium">{category.avgEngagement}%</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {selectedCategories.length > 0 && (
                  <div className="mt-6 rounded-xl border border-[#004A96]/20 bg-[#004A96]/5 p-5">
                    <h3 className="mb-3 font-semibold text-slate-900">Estimated Reach</h3>
                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                      <div>
                        <span className="text-slate-600">Total Users</span>
                        <div className="text-2xl font-bold text-[#004A96]">
                          {calculateEstimatedReach().toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-600">Avg. Engagement</span>
                        <div className="text-2xl font-bold text-emerald-600">{calculateEstimatedEngagement()}%</div>
                      </div>
                      <div>
                        <span className="text-slate-600">Expected Registrations</span>
                        <div className="text-2xl font-bold text-violet-600">
                          {Math.round(calculateEstimatedReach() * (calculateEstimatedEngagement() / 100) * 0.15)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedPackageData && (
        <Card className="border-dashed border-slate-200 bg-slate-50/80 shadow-none">
          <CardContent className="py-8 text-center text-sm text-slate-500">
            Select a promotion package above to configure category targeting.
          </CardContent>
        </Card>
      )}

      {selectedPackage && selectedCategories.length > 0 && (
        <div className="flex justify-end">
          <Button className={adminPrimaryBtn} onClick={() => setIsPaymentDialogOpen(true)}>
            <CreditCard className="mr-2 h-4 w-4" />
            Continue to Purchase
          </Button>
        </div>
      )}

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complete Your Promotion Purchase</DialogTitle>
            <DialogDescription>
              Review your selection and complete the payment to start promoting your event
            </DialogDescription>
          </DialogHeader>

          {selectedPackageData && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Package:</span>
                    <span className="font-medium">{selectedPackageData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Event:</span>
                    <span className="font-medium">{event.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{selectedPackageData.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Categories:</span>
                    <span className="font-medium">{selectedCategories.length} selected</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>₹{selectedPackageData.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={createPromotion} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Complete Purchase
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
