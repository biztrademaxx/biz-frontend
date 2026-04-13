"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  Eye,
  MousePointer,
  TrendingUp,
} from "lucide-react"

interface Event {
  id: string
  title: string
  date: string
  location: string
  status: string
  attendees: number
  revenue: number
  registrations: number
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

interface EventPromotionProps {
  organizerId: string
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

export default function EventPromotion({ organizerId }: EventPromotionProps) {
  const { toast } = useToast()
  const [selectedTab, setSelectedTab] = useState("platform-promotion")
  const [selectedEvent, setSelectedEvent] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedPackage, setSelectedPackage] = useState("")
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  // State for API data
  const [events, setEvents] = useState<Event[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])

  // Platform promotion packages
  const promotionPackages: PromotionPackage[] = [
    {
      id: "basic",
      name: "Basic Promotion",
      description: "Reach targeted users in your event category",
      price: 2999,
      features: [
        "Email notification to 5,000+ users",
        "In-app notification banner",
        "Category-based targeting",
        "Basic analytics report",
        "7-day promotion duration",
      ],
      userCount: 5000,
      categories: ["selected"],
      duration: "7 days",
    },
    {
      id: "premium",
      name: "Premium Promotion",
      description: "Enhanced visibility with multi-category reach",
      price: 7999,
      features: [
        "Email notification to 15,000+ users",
        "Featured event placement",
        "Multi-category targeting",
        "Push notifications",
        "Detailed analytics dashboard",
        "14-day promotion duration",
        "Social media cross-promotion",
      ],
      userCount: 15000,
      categories: ["multiple"],
      duration: "14 days",
      recommended: true,
    },
    {
      id: "enterprise",
      name: "Enterprise Promotion",
      description: "Maximum reach across all relevant categories",
      price: 15999,
      features: [
        "Email notification to 50,000+ users",
        "Homepage banner placement",
        "All relevant category targeting",
        "SMS notifications (premium users)",
        "Advanced analytics & insights",
        "30-day promotion duration",
        "Dedicated account manager",
        "Custom promotional content",
      ],
      userCount: 50000,
      categories: ["all"],
      duration: "30 days",
    },
  ]

  // User categories with engagement data
  const userCategories: CategoryFilter[] = [
    {
      id: "technology",
      name: "Technology & IT",
      icon: Code,
      userCount: 12500,
      avgEngagement: 78,
      color: "bg-blue-500",
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
      color: "bg-purple-500",
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
      color: "bg-violet-500",
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

  useEffect(() => {
    fetchPromotionData()
  }, [organizerId])

  const fetchPromotionData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/organizers/${organizerId}/promotions`)
      if (!response.ok) throw new Error("Failed to fetch promotion data")

      const data = await response.json()
      setEvents(data.events || [])
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
    if (!selectedPackageData || !selectedEvent) return

    try {
      setCreating(true)
      const response = await fetch(`/api/organizers/${organizerId}/promotions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: selectedEvent,
          packageType: selectedPackageData.id,
          targetCategories: selectedCategories,
          amount: selectedPackageData.price,
          duration: Number.parseInt(selectedPackageData.duration.split(" ")[0]),
        }),
      })

      if (!response.ok) throw new Error("Failed to create promotion")

      toast({
        title: "Success",
        description: "Promotion campaign created successfully!",
      })

      setIsPaymentDialogOpen(false)
      setSelectedEvent("")
      setSelectedCategories([])
      setSelectedPackage("")
      fetchPromotionData() // Refresh data
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
    setIsPaymentDialogOpen(true)
  }

  const selectedPackageData = promotionPackages.find((p) => p.id === selectedPackage)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Event Promotion</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Users className="w-4 h-4 mr-1" />
            {userCategories.reduce((total, cat) => total + cat.userCount, 0).toLocaleString()} Platform Users
          </Badge>
        </div>
      </div>

      {/* Active Promotions */}
      {promotions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Active Promotions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {promotions.map((promotion) => (
                <div key={promotion.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={promotion.status === "ACTIVE" ? "default" : "secondary"}>{promotion.status}</Badge>
                    <span className="text-sm text-gray-500">{promotion.packageType}</span>
                  </div>
                  <h3 className="font-semibold mb-2">{promotion.event?.title || "Event"}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Impressions:</span>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{promotion.impressions.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Clicks:</span>
                      <div className="flex items-center gap-1">
                        <MousePointer className="w-3 h-3" />
                        <span>{promotion.clicks.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Conversions:</span>
                      <span className="font-medium text-green-600">{promotion.conversions}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="platform-promotion">Platform Promotion</TabsTrigger>
        </TabsList>

        <TabsContent value="platform-promotion" className="space-y-6">
          {/* Event Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Select Event to Promote
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose an event to promote" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>{event.title}</span>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                          <Calendar className="w-4 h-4" />
                          {event.date}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedEvent && (
            <>
              {/* Category Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Target User Categories
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Select categories that match your event audience. Each category shows user count and engagement
                    rate.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userCategories.map((category) => (
                      <div
                        key={category.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedCategories.includes(category.id)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
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
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold mb-2">Estimated Reach</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Total Users:</span>
                          <div className="text-2xl font-bold text-blue-600">
                            {calculateEstimatedReach().toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Avg. Engagement:</span>
                          <div className="text-2xl font-bold text-green-600">{calculateEstimatedEngagement()}%</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Expected Registrations:</span>
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round(calculateEstimatedReach() * (calculateEstimatedEngagement() / 100) * 0.15)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Promotion Packages */}
              {selectedCategories.length > 0 && (
                <Card>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {promotionPackages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className={`relative p-6 border-2 rounded-lg ${
                            pkg.recommended ? "border-blue-500 bg-blue-50" : "border-gray-200"
                          }`}
                        >
                          {pkg.recommended && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                              <Badge className="bg-blue-500 text-white">
                                <Star className="w-3 h-3 mr-1" />
                                Recommended
                              </Badge>
                            </div>
                          )}

                          <div className="text-center mb-4">
                            <h3 className="text-xl font-bold">{pkg.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                            <div className="mt-3">
                              <span className="text-3xl font-bold text-blue-600">₹{pkg.price.toLocaleString()}</span>
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
                            className="w-full"
                            variant={pkg.recommended ? "default" : "outline"}
                            onClick={() => handlePackageSelect(pkg.id)}
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Select Package
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

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
              {/* Order Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Package:</span>
                    <span className="font-medium">{selectedPackageData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Event:</span>
                    <span className="font-medium">{events.find((e) => e.id.toString() === selectedEvent)?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Categories:</span>
                    <span className="font-medium">{selectedCategories.length} selected</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Reach:</span>
                    <span className="font-medium">{calculateEstimatedReach().toLocaleString()} users</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{selectedPackageData.duration}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total Amount:</span>
                      <span className="text-blue-600">₹{selectedPackageData.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="space-y-4">
                <h3 className="font-semibold">Payment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input id="card-number" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-name">Cardholder Name</Label>
                    <Input id="card-name" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" />
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Terms and Conditions
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Promotion Policy
                  </a>
                </Label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createPromotion} disabled={creating}>
                  {creating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  Pay ₹{selectedPackageData.price.toLocaleString()}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
