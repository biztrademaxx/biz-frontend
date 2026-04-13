"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Crown, Check, Download, Calendar, Users, Headphones, Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/api"

interface MyPlanProps {
  organizerId: string
}

interface Subscription {
  id: string
  planName: string
  planType: string
  price: number
  status: string
  renewalDate: string
  features: string[]
}

interface Usage {
  events: { used: number; limit: number }
  attendees: { used: number; limit: number }
  storage: { used: number; limit: number }
  promotions: { used: number; limit: number }
}

export default function MyPlan({ organizerId }: MyPlanProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)
  const [daysLeft, setDaysLeft] = useState(0)

  // Mock plan data - will be replaced with API data
  const [currentPlan, setCurrentPlan] = useState({
    name: "Professional",
    price: 2999,
    billing: "monthly",
    nextBilling: "January 1, 2025",
    features: [
      "25 events per month",
      "5,000 attendees per event",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
      "Email marketing tools",
    ],
  })

  const plans = [
    {
      name: "Starter",
      type: "BASIC",
      price: 999,
      popular: false,
      features: [
        "5 events per month",
        "500 attendees per event",
        "Basic analytics",
        "Email support",
        "Standard templates",
      ],
    },
    {
      name: "Professional",
      type: "PRO",
      price: 2999,
      popular: true,
      features: [
        "25 events per month",
        "5,000 attendees per event",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
        "Email marketing tools",
        "API access",
      ],
    },
    {
      name: "Enterprise",
      type: "ENTERPRISE",
      price: 9999,
      popular: false,
      features: [
        "Unlimited events",
        "Unlimited attendees",
        "Advanced analytics",
        "24/7 phone support",
        "White-label solution",
        "Custom integrations",
        "Dedicated account manager",
      ],
    },
  ]

  const paymentMethods = [
    {
      id: 1,
      type: "VISA",
      last4: "4242",
      expiry: "12/26",
      isDefault: true,
    },
  ]

  const invoices = [
    {
      id: "INV-2024-001",
      date: "1 December 2024",
      amount: 2999,
      plan: "Professional Plan",
      status: "Paid",
    },
    {
      id: "INV-2024-002",
      date: "1 November 2024",
      amount: 2999,
      plan: "Professional Plan",
      status: "Paid",
    },
    {
      id: "INV-2024-003",
      date: "1 October 2024",
      amount: 2999,
      plan: "Professional Plan",
      status: "Paid",
    },
  ]

  useEffect(() => {
    fetchSubscriptionData()
  }, [organizerId])

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<any>(`/api/organizers/${organizerId}/subscription`, { auth: true })
      const sub = data.subscription ?? data.data
      setSubscription(sub)
      setUsage(data.usage ?? sub?.usage)
      setDaysLeft(data.daysLeft ?? sub?.daysLeft)

      // Update current plan with API data
      if (sub) {
        setCurrentPlan({
          name: sub.planName,
          price: data.subscription.price,
          billing: "monthly",
          nextBilling: new Date(sub.renewalDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          features: sub.features || currentPlan.features,
        })
      }
    } catch (error) {
      console.error("Error fetching subscription:", error)
      toast({
        title: "Error",
        description: "Failed to load subscription data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planType: string, planName: string, price: number) => {
    try {
      setUpgrading(true)
      await apiFetch(`/api/organizers/${organizerId}/subscription`, {
        method: "PUT",
        body: { planType, planName, price },
        auth: true,
      })

      toast({
        title: "Success",
        description: `Successfully upgraded to ${planName} plan!`,
      })

      fetchSubscriptionData() // Refresh data
    } catch (error) {
      console.error("Error upgrading plan:", error)
      toast({
        title: "Error",
        description: "Failed to upgrade plan",
        variant: "destructive",
      })
    } finally {
      setUpgrading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Plan</h1>

      <Tabs defaultValue="current" className="w-full">
        <TabsList>
          <TabsTrigger value="current">Current Plan</TabsTrigger>
          <TabsTrigger value="upgrade">Upgrade Plan</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="w-8 h-8 text-yellow-500" />
                  <div>
                    <CardTitle className="text-2xl">{currentPlan.name} Plan</CardTitle>
                    <p className="text-gray-600">
                      ₹{currentPlan.price}/{currentPlan.billing}
                    </p>
                  </div>
                </div>
                <Badge variant="default">{subscription?.status || "Active"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{usage?.events.limit === -1 ? "∞" : usage?.events.limit || "25"}</p>
                  <p className="text-sm text-gray-600">Events per month</p>
                  {usage && <p className="text-xs text-gray-500 mt-1">{usage.events.used} used this month</p>}
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">
                    {usage?.attendees.limit === -1 ? "∞" : `${(usage?.attendees.limit || 5000) / 1000}K`}
                  </p>
                  <p className="text-sm text-gray-600">Attendees per event</p>
                  {usage && <p className="text-xs text-gray-500 mt-1">{usage.attendees.used} total attendees</p>}
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Headphones className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">Priority</p>
                  <p className="text-sm text-gray-600">Support level</p>
                  <p className="text-xs text-gray-500 mt-1">{daysLeft} days until renewal</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Plan Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {currentPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Next billing date</p>
                  <p className="text-sm text-gray-600">{currentPlan.nextBilling}</p>
                </div>
                <Button variant="outline">Cancel Subscription</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upgrade" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? "border-blue-500 border-2" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">₹{plan.price}</div>
                  <p className="text-gray-600">per month</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full"
                    variant={plan.name === currentPlan.name ? "outline" : "default"}
                    disabled={plan.name === currentPlan.name || upgrading}
                    onClick={() => handleUpgrade(plan.type, plan.name, plan.price)}
                  >
                    {upgrading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : plan.name === currentPlan.name ? (
                      "Current Plan"
                    ) : plan.price > currentPlan.price ? (
                      "Upgrade Now"
                    ) : (
                      "Downgrade"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Billing History</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{invoice.id}</p>
                      <p className="text-sm text-gray-600">
                        {invoice.date} • {invoice.plan}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-medium">₹{invoice.amount}</p>
                        <Badge variant={invoice.status === "Paid" ? "default" : "destructive"} className="text-xs">
                          {invoice.status}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
