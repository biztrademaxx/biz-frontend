"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Download,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { apiFetch } from "@/lib/api"

interface Subscription {
  id: string
  userId: string
  userName: string
  userEmail: string
  userRole: string
  planName: string
  planType: "MONTHLY" | "YEARLY" | "QUARTERLY"
  amount: number
  currency: string
  status: "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAUSED"
  startDate: string
  endDate: string
  nextBillingDate: string | null
  autoRenew: boolean
  paymentMethod: string
  transactionId: string
  features: string[]
  cancelledAt: string | null
  cancellationReason: string | null
  createdAt: string
}

export default function FinancialSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [planFilter, setPlanFilter] = useState<string>("all")
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<{ success?: boolean; data?: Subscription[] }>("/api/admin/financial/subscriptions", {
        auth: true,
      })
      setSubscriptions(data.data || [])
    } catch (error) {
      console.error("Error fetching subscriptions:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const matchesSearch =
      subscription.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || subscription.status === statusFilter
    const matchesPlan = planFilter === "all" || subscription.planType === planFilter

    return matchesSearch && matchesStatus && matchesPlan
  })

  const stats = {
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: subscriptions.filter((s) => s.status === "ACTIVE").length,
    monthlyRevenue: subscriptions
      .filter((s) => s.status === "ACTIVE" && s.planType === "MONTHLY")
      .reduce((acc, s) => acc + s.amount, 0),
    yearlyRevenue: subscriptions
      .filter((s) => s.status === "ACTIVE" && s.planType === "YEARLY")
      .reduce((acc, s) => acc + s.amount, 0),
    churnRate:
      subscriptions.length === 0
        ? "0.00"
        : ((subscriptions.filter((s) => s.status === "CANCELLED").length / subscriptions.length) * 100).toFixed(2),
    totalRevenue: subscriptions.filter((s) => s.status === "ACTIVE").reduce((acc, s) => acc + s.amount, 0),
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      ACTIVE: { variant: "default", icon: CheckCircle },
      CANCELLED: { variant: "destructive", icon: XCircle },
      EXPIRED: { variant: "secondary", icon: AlertCircle },
      PAUSED: { variant: "outline", icon: RefreshCw },
    }
    const config = variants[status] || variants.ACTIVE
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    )
  }

  const getPlanTypeBadge = (planType: string) => {
    const colors: Record<string, string> = {
      MONTHLY: "bg-blue-100 text-blue-700",
      QUARTERLY: "bg-purple-100 text-purple-700",
      YEARLY: "bg-green-100 text-green-700",
    }
    return (
      <Badge variant="outline" className={colors[planType]}>
        {planType}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading subscriptions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscriptions & Plans</h1>
        <p className="text-gray-600 mt-1">Manage all subscription plans and billing</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalSubscriptions}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.activeSubscriptions}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">${stats.monthlyRevenue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Churn Rate</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.churnRate}%</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by user, email, plan, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
              <SelectItem value="PAUSED">Paused</SelectItem>
            </SelectContent>
          </Select>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="QUARTERLY">Quarterly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subscription ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Next Billing</TableHead>
                <TableHead>Auto Renew</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                    No subscriptions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-mono text-sm">{subscription.id.slice(0, 8)}...</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{subscription.userName}</p>
                        <p className="text-sm text-gray-500">{subscription.userEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{subscription.planName}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {subscription.userRole}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{getPlanTypeBadge(subscription.planType)}</TableCell>
                    <TableCell>
                      <div className="font-semibold">
                        {subscription.currency} ${subscription.amount.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {new Date(subscription.startDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {subscription.nextBillingDate ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {new Date(subscription.nextBillingDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {subscription.autoRenew ? (
                        <Badge variant="default" className="bg-green-100 text-green-700">
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-600">
                          No
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedSubscription(subscription)
                              setDetailsOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
            <DialogDescription>Complete information about this subscription</DialogDescription>
          </DialogHeader>

          {selectedSubscription && (
            <div className="space-y-6">
              {/* User Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  User Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Name</p>
                    <p className="font-medium">{selectedSubscription.userName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-medium">{selectedSubscription.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Role</p>
                    <Badge variant="outline">{selectedSubscription.userRole}</Badge>
                  </div>
                  <div>
                    <p className="text-gray-600">User ID</p>
                    <p className="font-mono text-xs">{selectedSubscription.userId}</p>
                  </div>
                </div>
              </div>

              {/* Subscription Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Subscription Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Plan Name</p>
                    <p className="font-medium">{selectedSubscription.planName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Plan Type</p>
                    {getPlanTypeBadge(selectedSubscription.planType)}
                  </div>
                  <div>
                    <p className="text-gray-600">Amount</p>
                    <p className="font-semibold text-lg">
                      {selectedSubscription.currency} ${selectedSubscription.amount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    {getStatusBadge(selectedSubscription.status)}
                  </div>
                  <div>
                    <p className="text-gray-600">Start Date</p>
                    <p className="font-medium">{new Date(selectedSubscription.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">End Date</p>
                    <p className="font-medium">{new Date(selectedSubscription.endDate).toLocaleDateString()}</p>
                  </div>
                  {selectedSubscription.nextBillingDate && (
                    <div>
                      <p className="text-gray-600">Next Billing Date</p>
                      <p className="font-medium">
                        {new Date(selectedSubscription.nextBillingDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600">Auto Renew</p>
                    <p className="font-medium">{selectedSubscription.autoRenew ? "Enabled" : "Disabled"}</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Payment Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Payment Method</p>
                    <p className="font-medium">{selectedSubscription.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Transaction ID</p>
                    <p className="font-mono text-xs">{selectedSubscription.transactionId}</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Plan Features</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSubscription.features.map((feature, index) => (
                    <Badge key={index} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Cancellation Info */}
              {selectedSubscription.cancelledAt && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-900 mb-2">Cancellation Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-red-700">Cancelled At</p>
                      <p className="font-medium">{new Date(selectedSubscription.cancelledAt).toLocaleString()}</p>
                    </div>
                    {selectedSubscription.cancellationReason && (
                      <div>
                        <p className="text-red-700">Reason</p>
                        <p className="font-medium">{selectedSubscription.cancellationReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="border-t pt-4">
                <p className="text-xs text-gray-500">
                  Created: {new Date(selectedSubscription.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
