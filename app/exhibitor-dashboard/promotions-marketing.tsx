"use client"


import { useState, useEffect, ReactNode } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PromotionPaymentDialog } from "@/components/payment/promotion-payment-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import {
  Megaphone,
  Users,
  Target,
  CreditCard,
  CheckCircle,
  Calendar,
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  exGlassCard,
  exTabsList,
  exTabsTriggerActive,
  exBtnPrimary,
  exPageTitle,
  exLink,
  exTabsScrollWrapper,
} from "./dashboard-theme"

interface PromotionsMarketingProps {
  exhibitorId: string
  onPromotionCreated?: () => void
}

interface Booth {
  id: string
  boothNumber: string
  companyName: string
  status: string

  event: {
    id: string
    title: string
    startDate: string
    endDate: string
    bannerImage?: string
  }

  space: {
    id: string
    name: string
    spaceType: string
  }
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
  durationDays: number
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

export default function PromotionsMarketing({ exhibitorId, onPromotionCreated }: PromotionsMarketingProps) {
  const [selectedTab, setSelectedTab] = useState("platform-promotion")
  const [selectedBooth, setSelectedBooth] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedPackage, setSelectedPackage] = useState("")
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [booths, setBooths] = useState<Booth[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [promotionPackages, setPromotionPackages] = useState<PromotionPackage[]>([])
  const [loadingPackages, setLoadingPackages] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoadingPackages(true)
        const data = await apiFetch<{ packages: any[] }>("/api/promotion-packages?userType=EXHIBITOR")

        const transformedPackages = (data.packages ?? []).map((pkg: any) => ({
          id: pkg.id,
          name: pkg.name,
          description: pkg.description,
          price: pkg.price,
          features: pkg.features,
          userCount: pkg.userCount,
          categories: pkg.targetUserTypes || ["selected"],
          duration: `${pkg.durationDays} days`,
          durationDays: pkg.durationDays,
          recommended: pkg.recommended || false,
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
        setLoadingPackages(false)
      }
    }

    fetchPackages()
  }, [toast])

  useEffect(() => {
    if (!exhibitorId) return

    const fetchEvents = async () => {
      try {
        setLoadingEvents(true)
        const data = await apiFetch<{ booths?: Booth[] }>(
          `/api/exhibitors/promotions?exhibitorId=${encodeURIComponent(exhibitorId)}`
        )

        setBooths(data.booths || [])
      } catch (error) {
        console.error("Error fetching exhibitor booths:", error)
        toast({
          title: "Error",
          description: "Failed to load booths",
          variant: "destructive",
        })
      } finally {
        setLoadingEvents(false)
      }
    }

    fetchEvents()
  }, [exhibitorId, toast])

  const userCategories: CategoryFilter[] = [
    {
      id: "technology",
      name: "Technology & IT",
      icon: Code,
      userCount: 12500,
      avgEngagement: 78,
      color: "bg-[#004A96]",
    },
    {
      id: "business",
      name: "Business & Finance",
      icon: Briefcase,
      userCount: 8900,
      avgEngagement: 82,
      color: "bg-green-500",
    },
    {
      id: "healthcare",
      name: "Healthcare & Medical",
      icon: Stethoscope,
      userCount: 6700,
      avgEngagement: 85,
      color: "bg-red-500",
    },
    {
      id: "education",
      name: "Education & Training",
      icon: GraduationCap,
      userCount: 9200,
      avgEngagement: 76,
      color: "bg-blue-500",
    },
    {
      id: "arts",
      name: "Arts & Culture",
      icon: Palette,
      userCount: 4300,
      avgEngagement: 88,
      color: "bg-pink-500",
    },
    {
      id: "sports",
      name: "Sports & Fitness",
      icon: Dumbbell,
      userCount: 7800,
      avgEngagement: 79,
      color: "bg-orange-500",
    },
    {
      id: "food",
      name: "Food & Beverage",
      icon: Utensils,
      userCount: 5600,
      avgEngagement: 83,
      color: "bg-yellow-500",
    },
    {
      id: "travel",
      name: "Travel & Tourism",
      icon: Plane,
      userCount: 6100,
      avgEngagement: 81,
      color: "bg-indigo-500",
    },
    {
      id: "automotive",
      name: "Automotive",
      icon: Car,
      userCount: 3900,
      avgEngagement: 74,
      color: "bg-gray-500",
    },
    {
      id: "real-estate",
      name: "Real Estate",
      icon: Home,
      userCount: 4700,
      avgEngagement: 77,
      color: "bg-teal-500",
    },
    {
      id: "entertainment",
      name: "Entertainment",
      icon: Music,
      userCount: 8200,
      avgEngagement: 86,
      color: "bg-sky-600",
    },
    {
      id: "retail",
      name: "Retail & Shopping",
      icon: ShoppingBag,
      userCount: 7300,
      avgEngagement: 80,
      color: "bg-emerald-500",
    },
  ]

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
    if (!selectedBooth) {
      toast({
        title: "Booth Required",
        description: "Please select a booth first",
        variant: "destructive",
      })
      return
    }

    if (selectedCategories.length === 0) {
      toast({
        title: "Categories Required",
        description: "Please select at least one target category",
        variant: "destructive",
      })
      return
    }

    setSelectedPackage(packageId)
    setIsPaymentDialogOpen(true)
  }

  const createPromotionAfterPayment = async (paymentTransactionId: string) => {
    await apiFetch("/api/exhibitors/promotions", {
      method: "POST",
      auth: true,
      body: {
        exhibitorId,
        paymentTransactionId,
      },
    })

    toast({
      title: "Success!",
      description: "Your promotion has been activated successfully",
    })

    setSelectedBooth("")
    setSelectedCategories([])
    setSelectedPackage("")

    if (onPromotionCreated) {
      onPromotionCreated()
    }
  }

  const selectedPackageData = promotionPackages.find((p) => p.id === selectedPackage)

  const selectedBoothData = booths.find((b) => b.id.toString() === selectedBooth)

  const buildPaymentContext = () => {
    if (!selectedPackageData || !selectedBooth || selectedCategories.length === 0) return null
    return {
      promotionChannel: "EXHIBITOR" as const,
      exhibitorId,
      eventId: selectedBoothData?.event?.id ?? selectedBooth,
      packageType: selectedPackageData.name,
      targetCategories: selectedCategories,
      durationDays: selectedPackageData.durationDays,
      amountInr: selectedPackageData.price,
    }
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className={exPageTitle}>Exhibitor Promotion</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="w-fit border-[#004A96]/25 bg-[#004A96]/10 text-[#004A96]">
            <Users className="w-4 h-4 mr-1" />
            {userCategories.reduce((total, cat) => total + cat.userCount, 0).toLocaleString()} Platform Users
          </Badge>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="min-w-0 space-y-6">
        <div className={exTabsScrollWrapper}>
          <TabsList className={cn(exTabsList, "mb-0 w-full sm:grid sm:grid-cols-2 sm:w-full")}>
            <TabsTrigger value="platform-promotion" className={cn(exTabsTriggerActive, "flex-1")}>
              <span className="sm:hidden">Platform</span>
              <span className="hidden sm:inline">Platform Promotion</span>
            </TabsTrigger>
            <TabsTrigger value="external-campaigns" className={cn(exTabsTriggerActive, "flex-1")}>
              <span className="sm:hidden">External</span>
              <span className="hidden sm:inline">External Campaigns</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="platform-promotion" className="space-y-6">
          {/* Booth Selection */}
          <Card className={exGlassCard}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Select Booth to Promote
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingEvents ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-500 mr-2" />
                  <span className="text-gray-500">Loading booths...</span>
                </div>
              ) : (
                <Select value={selectedBooth} onValueChange={setSelectedBooth}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a booth to promote">
                      {selectedBoothData && (
                        <span className="truncate">
                          {selectedBoothData.companyName} — {selectedBoothData.event.title} (Booth{" "}
                          {selectedBoothData.boothNumber})
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {booths.length === 0 ? (
                      <SelectItem value="no-events" disabled>
                        No booths found for your account
                      </SelectItem>
                    ) : (
                      booths.map((booth) => (
                        <SelectItem key={booth.id} value={booth.id.toString()}>
                          <div className="flex flex-col w-full">
                            <span className="font-semibold">
                              {booth.companyName}
                            </span>

                            <span className="text-sm text-gray-500">
                              {booth.event.title}
                            </span>

                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">

                              <span>
                                Booth: {booth.boothNumber}
                              </span>

                              <span>
                                {booth.space.name}
                              </span>

                              <span>
                                {new Date(booth.event.startDate).toLocaleDateString()}
                              </span>

                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
              {booths.length === 0 && !loadingEvents && (
                <p className="text-sm text-gray-500 mt-2">
                  You need to have booths in your account to create promotions.
                </p>
              )}
            </CardContent>
          </Card>

          {selectedBooth && (
            <>
              {/* Category Selection */}
              <Card className={exGlassCard}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Target User Categories
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Select categories that match your target audience. Each category shows user count and engagement
                    rate.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userCategories.map((category) => (
                      <div
                        key={category.id}
                        className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${selectedCategories.includes(category.id)
                            ? "border-[#004A96] bg-[#004A96]/10"
                            : "border-white/50 bg-white/25 hover:border-[#004A96]/35"
                          }`}
                        onClick={() => handleCategoryToggle(category.id)}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${category.color}`}>
                            <category.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">{category.name}</h3>
                          </div>
                          <Checkbox
                            checked={selectedCategories.includes(category.id)}
                            onChange={() => handleCategoryToggle(category.id)}
                          />
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Users:</span>
                            <span className="font-medium">{category.userCount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Engagement:</span>
                            <span className="font-medium">{category.avgEngagement}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedCategories.length > 0 && (
                    <div className="mt-6 rounded-lg border border-[#004A96]/20 bg-[#004A96]/10 p-4">
                      <h3 className="font-semibold mb-2">Estimated Reach</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Total Users:</span>
                          <div className="text-2xl font-bold text-[#004A96]">
                            {calculateEstimatedReach().toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Avg. Engagement:</span>
                          <div className="text-2xl font-bold text-green-600">{calculateEstimatedEngagement()}%</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Expected Leads:</span>
                          <div className="text-2xl font-bold text-[#004A96]">
                            {Math.round(
                              calculateEstimatedReach() * (calculateEstimatedEngagement() / 100) * 0.12,
                            ).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Promotion Packages */}
              {selectedCategories.length > 0 && (
                <Card className={exGlassCard}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Megaphone className="w-5 h-5" />
                      Choose Promotion Package
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Select a package that fits your budget and reach requirements
                    </p>
                  </CardHeader>
                  <CardContent>
                    {loadingPackages ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-500 mr-2" />
                        <span className="text-gray-500">Loading packages...</span>
                      </div>
                    ) : promotionPackages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No promotion packages available at the moment.</p>
                        <p className="text-sm mt-2">Please check back later or contact support.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {promotionPackages.map((pkg) => (
                          <div
                            key={pkg.id}
                            className={`relative rounded-lg border-2 p-6 transition-all ${pkg.recommended
                                ? "border-[#004A96] bg-[#004A96]/10 shadow-md"
                                : "border-white/50 bg-white/25 hover:border-[#004A96]/35"
                              }`}
                          >
                            {pkg.recommended && (
                              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                <Badge className="bg-[#004A96] text-white">
                                  <Star className="w-3 h-3 mr-1" />
                                  Recommended
                                </Badge>
                              </div>
                            )}

                            <div className="text-center mb-4">
                              <h3 className="text-xl font-bold">{pkg.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                              <div className="mt-3">
                                <span className="text-3xl font-bold text-[#004A96]">₹{pkg.price.toLocaleString("en-IN")}</span>
                                <span className="text-sm text-gray-500">/{pkg.duration}</span>
                              </div>
                            </div>

                            <div className="space-y-3 mb-6">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Reach:</span>
                                <span className="font-medium">{pkg.userCount.toLocaleString()}+ users</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Duration:</span>
                                <span className="font-medium">{pkg.duration}</span>
                              </div>
                            </div>

                            <div className="space-y-2 mb-6">
                              {pkg.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>

                            <Button
                              className={cn("w-full", pkg.recommended && exBtnPrimary)}
                              variant={pkg.recommended ? "default" : "outline"}
                              onClick={() => handlePackageSelect(pkg.id)}
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              Select Package
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="external-campaigns" className="space-y-6">
          <Card className={exGlassCard}>
            <CardHeader>
              <CardTitle>External Marketing Campaigns</CardTitle>
              <p className="text-sm text-gray-600">
                Create campaigns for social media, email marketing, and other external platforms
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">External Campaigns</h3>
                <p className="text-gray-500 mb-4">
                  This feature allows you to create and manage campaigns for external platforms
                </p>
                <Button variant="outline">Coming Soon</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PromotionPaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        receiptPrefix="exh_promo"
        termsCheckboxId="exhibitor-promotion-terms"
        paymentContext={buildPaymentContext()}
        payButtonClassName={exBtnPrimary}
        linkClassName={exLink}
        summary={
          selectedPackageData
            ? {
              packageName: selectedPackageData.name,
              eventTitle: selectedBoothData?.event?.title ?? "Event",
              categoryCount: selectedCategories.length,
              estimatedReach: calculateEstimatedReach(),
              duration: selectedPackageData.duration,
              amountInr: selectedPackageData.price,
            }
            : null
        }
        onPaymentSuccess={createPromotionAfterPayment}
      />
    </div>
  )
}