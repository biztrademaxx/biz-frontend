"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PromotionPaymentDialog } from "@/components/payment/promotion-payment-dialog"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"
import { cn } from "@/lib/utils"
import { adminCardShell, adminPrimaryBtn } from "@/app/admin-dashboard/admin-dashboard-theme"
import {
  Megaphone,
  Users,
  Target,
  CreditCard,
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
  Loader2,
  Check,
} from "lucide-react"
import { EventPromotionPlansView } from "@/components/promotion-plans/event-promotion-plans-view"
import {
  ALL_CATEGORIES_LABEL,
  packageTargetsAllCategories,
} from "@/lib/promotion-package-constants"
import {
  estimateEngagement,
  estimateReach,
  estimateRegistrations,
} from "@/lib/promotion-reach-estimates"

const CANONICAL_PACKAGE_IDS = new Set([
  "pkg_starter",
  "pkg_professional",
  "pkg_enterprise",
  "pkg_visitor_reach",
  "pkg_prospector",
  "pkg_leadboost",
])

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
  section?: "subscription" | "on_demand"
  ctaLabel?: string
  visibilityLabel?: string
  leadsLabel?: string
  planKey?: string
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

function categoryAccentColor(hex?: string | null): string {
  if (hex && /^#[0-9A-Fa-f]{6}$/.test(hex)) return hex
  return "#004A96"
}

export default function EventPromotion({ eventId }: { eventId: string }) {
  const { toast } = useToast()
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedPackage, setSelectedPackage] = useState("")
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const [promotionPackages, setPromotionPackages] = useState<PromotionPackage[]>([])
  const [packagesLoading, setPackagesLoading] = useState(true)

  // State for API data
  const [event, setEvent] = useState<Event | null>(null)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [userCategories, setUserCategories] = useState<CategoryFilter[]>([])
  const [platformReach, setPlatformReach] = useState(0)

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
      const [categoriesRes, audienceRes] = await Promise.all([
        apiFetch<{ success?: boolean; data?: DbCategory[] }>("/api/event-categories", { auth: true }),
        apiFetch<{
          platformReach?: number
          categories?: Array<{
            id: string
            name: string
            userCount: number
            avgEngagement: number
          }>
        }>("/api/promotion-packages/audience-stats", { auth: true }),
      ])

      const audienceByName = new Map(
        (audienceRes.categories ?? []).map((row) => [row.name.toLowerCase().trim(), row]),
      )

      const list = (categoriesRes.data ?? []).map((cat) => {
        const stats = audienceByName.get(cat.name.toLowerCase().trim())
        return {
          id: cat.name.toLowerCase().replace(/\s+/g, "-"),
          name: cat.name,
          icon: iconByCategory(cat.name),
          userCount: stats?.userCount ?? 300,
          avgEngagement: stats?.avgEngagement ?? 55,
          color: categoryAccentColor(cat.color),
        }
      })

      setPlatformReach(audienceRes.platformReach ?? list.reduce((sum, c) => sum + c.userCount, 0))
      setUserCategories(list)
    } catch (error) {
      console.error("Error fetching promotion categories:", error)
      setUserCategories([])
      setPlatformReach(0)
    }
  }

  const fetchPromotionPackages = async () => {
    try {
      setPackagesLoading(true)
      const data = await apiFetch<{ packages: any[] }>("/api/promotion-packages?userType=ORGANIZER", {
        auth: true,
      })

      // Transform API response to match component structure
      const transformedPackages = data.packages
        .filter((pkg: { id: string }) => CANONICAL_PACKAGE_IDS.has(pkg.id))
        .map((pkg: any) => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        features: pkg.features,
        userCount: pkg.userCount,
        categories: Array.isArray(pkg.categories) ? pkg.categories : [],
        duration: pkg.duration || `${pkg.durationDays || 0} days`,
        recommended: !!pkg.recommended,
        section: pkg.section === "on_demand" ? "on_demand" : "subscription",
        ctaLabel: pkg.ctaLabel,
        visibilityLabel: pkg.visibilityLabel,
        leadsLabel: pkg.leadsLabel,
        planKey: pkg.planKey,
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

  const resolveTargetCategories = (): string[] => {
    const pkg = promotionPackages.find((p) => p.id === selectedPackage)
    if (!pkg) return []

    if (packageTargetsAllCategories(pkg.categories)) {
      if (selectedCategories.length === 0 || selectedCategories.length === userCategories.length) {
        return [ALL_CATEGORIES_LABEL]
      }
    }

    return selectedCategories
      .map((id) => userCategories.find((c) => c.id === id)?.name)
      .filter((name): name is string => !!name)
  }

  const getDurationDays = (pkg: PromotionPackage): number => {
    if (pkg.duration === "month") return 30
    if (pkg.duration.includes("campaign")) return 14
    const parsed = Number.parseInt(pkg.duration.split(" ")[0], 10)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 30
  }

  const buildPaymentContext = () => {
    if (!selectedPackageData || !event) return null
    return {
      promotionChannel: "EVENT" as const,
      eventId,
      packageType: selectedPackageData.id,
      targetCategories: resolveTargetCategories(),
      durationDays: getDurationDays(selectedPackageData),
      amountInr: selectedPackageData.price,
    }
  }

  const createPromotion = async (paymentTransactionId: string) => {
    try {
      await apiFetch(`/api/events/${eventId}/promotions`, {
        method: "POST",
        auth: true,
        body: { paymentTransactionId },
      })

      toast({
        title: "Success",
        description: "Promotion campaign created successfully!",
      })

      setSelectedCategories([])
      setSelectedPackage("")
      fetchPromotionData()
    } catch (error) {
      console.error("Error creating promotion:", error)
      const message = error instanceof Error ? error.message : "Failed to create promotion campaign"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error instanceof Error ? error : new Error(message)
    }
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId)
    const pkg = promotionPackages.find((p) => p.id === packageId)
    if (pkg && packageTargetsAllCategories(pkg.categories) && userCategories.length > 0) {
      setSelectedCategories(userCategories.map((c) => c.id))
    } else {
      setSelectedCategories([])
    }
  }

  const selectedPackageData = promotionPackages.find((p) => p.id === selectedPackage)
  const packageHasAllCategories = packageTargetsAllCategories(selectedPackageData?.categories)
  const displayedCategories = selectedPackageData
    ? packageHasAllCategories
      ? userCategories
      : userCategories.filter((cat) =>
          (selectedPackageData.categories || [])
            .map((c) => c.toLowerCase().trim())
            .includes(cat.name.toLowerCase().trim()),
        )
    : []

  const canContinueToPurchase =
    !!selectedPackage &&
    (packageHasAllCategories || selectedCategories.length > 0)

  const estimatedReach = estimateReach(
    selectedCategories,
    userCategories,
    selectedPackageData?.planKey,
  )
  const estimatedEngagement = estimateEngagement(selectedCategories, userCategories)
  const expectedRegistrations = estimateRegistrations(estimatedReach, estimatedEngagement)

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
    <div className="min-w-0 space-y-5 sm:space-y-8">
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl md:text-3xl">Promote Your Event</h1>
          <div className="mt-2 flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <span className="break-words font-semibold text-slate-900">{event.title}</span>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="break-words">{event.location}</span>
            </div>
            <Badge variant="outline" className="w-fit">{event.status}</Badge>
          </div>
        </div>
        <Badge variant="outline" className="w-fit shrink-0 bg-[#004A96]/10 text-[#004A96]">
          <Users className="mr-1 h-4 w-4" />
          {platformReach.toLocaleString()} Platform Users
        </Badge>
      </div>

      {/* Step 1: Promotion Packages */}
      <Card className={cn(adminCardShell, "relative z-0 min-w-0 overflow-hidden")}>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Megaphone className="h-5 w-5 text-[#004A96]" />
            Step 1 — Choose Promotion Package
          </CardTitle>
          <p className="text-sm text-slate-600">
            Select a subscription plan or on-demand solution. Category targeting is in the next step.
          </p>
        </CardHeader>
        <CardContent className="min-w-0 overflow-hidden p-3 pt-0 sm:p-6 sm:pt-0">
          {promotionPackages.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <p>No promotion packages available at the moment.</p>
              <p className="mt-2 text-sm">Please check back later or contact support.</p>
            </div>
          ) : (
            <EventPromotionPlansView
              packages={promotionPackages}
              selectedPackageId={selectedPackage}
              onSelectPackage={handlePackageSelect}
              onContactCustom={() => {
                window.location.href = "mailto:support@biztradefairs.com?subject=Custom%20Marketing%20Package"
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Step 2: Category Selection — separate card, always on top */}
      {selectedPackageData && (
        <Card className={cn(adminCardShell, "relative z-10 min-w-0 overflow-hidden")}>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Target className="h-5 w-5 text-[#004A96]" />
              Step 2 — Target User Categories
            </CardTitle>
            <p className="text-sm text-slate-600">
              {packageHasAllCategories ? (
                <>
                  This package targets <span className="font-medium text-[#004A96]">All Categories</span>. Refine
                  below or keep all selected.
                </>
              ) : (
                <>
                  Categories configured for{" "}
                  <span className="font-medium text-[#004A96]">{selectedPackageData.name}</span>
                </>
              )}
            </p>
          </CardHeader>
          <CardContent className="min-w-0 overflow-hidden p-3 pt-0 sm:p-6 sm:pt-0">
            {packageHasAllCategories && displayedCategories.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="bg-[#004A96] text-white hover:bg-[#004A96]">{ALL_CATEGORIES_LABEL}</Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCategories(userCategories.map((c) => c.id))}
                >
                  Select all categories
                </Button>
              </div>
            )}
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
                          <div
                            className="rounded-lg p-2"
                            style={{ backgroundColor: category.color }}
                          >
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
                    <h3 className="mb-1 font-semibold text-slate-900">Estimated Reach</h3>
                    {selectedPackageData?.planKey && (
                      <p className="mb-3 text-xs text-slate-500">
                        Includes plan visibility multiplier for {selectedPackageData.name}
                      </p>
                    )}
                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                      <div>
                        <span className="text-slate-600">Total Users</span>
                        <div className="text-2xl font-bold text-[#004A96]">
                          {estimatedReach.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-600">Avg. Engagement</span>
                        <div className="text-2xl font-bold text-emerald-600">{estimatedEngagement}%</div>
                      </div>
                      <div>
                        <span className="text-slate-600">Expected Registrations</span>
                        <div className="text-2xl font-bold text-violet-600">
                          {expectedRegistrations.toLocaleString()}
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

      {canContinueToPurchase && (
        <div className="flex justify-stretch sm:justify-end">
          <Button className={cn(adminPrimaryBtn, "w-full sm:w-auto")} onClick={() => setIsPaymentDialogOpen(true)}>
            <CreditCard className="mr-2 h-4 w-4" />
            Continue to Purchase
          </Button>
        </div>
      )}

      <PromotionPaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        receiptPrefix="event_promo"
        termsCheckboxId="event-promotion-terms"
        payButtonClassName="w-full"
        payButtonLabel="Complete Purchase"
        summary={
          selectedPackageData && event
            ? {
                packageName: selectedPackageData.name,
                eventTitle: event.title,
                categoryCount: selectedCategories.length,
                estimatedReach,
                duration: selectedPackageData.duration,
                amountInr: selectedPackageData.price,
              }
            : null
        }
        paymentContext={buildPaymentContext()}
        onPaymentSuccess={createPromotion}
      />
    </div>
  )
}
