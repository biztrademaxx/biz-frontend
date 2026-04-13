"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Eye,
  MousePointerClick,
  Target,
} from "lucide-react"
import { adminApi } from "@/lib/admin-api"

type Promotion = {
  id: string
  exhibitor: {
    id: string
    firstName: string
    lastName: string
    email: string
    company?: string
  }
  event?: {
    id: string
    title: string
  }
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

export default function ExhibitorPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [packageFilter, setPackageFilter] = useState("all")

  // Dialog states
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"APPROVED" | "REJECTED">("APPROVED")
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    fetchPromotions()
  }, [])

  useEffect(() => {
    filterPromotions()
  }, [promotions, searchQuery, statusFilter, packageFilter])

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const data = await adminApi<Promotion[]>("/exhibitors/promotions")
      setPromotions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch promotions:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterPromotions = () => {
    let filtered = [...promotions]

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.exhibitor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.exhibitor.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.exhibitor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.exhibitor.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.event?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    if (packageFilter !== "all") {
      filtered = filtered.filter((p) => p.packageType === packageFilter)
    }

    setFilteredPromotions(filtered)
  }

  const handleActionClick = (promotion: Promotion, action: "APPROVED" | "REJECTED") => {
    setSelectedPromotion(promotion)
    setActionType(action)
    setActionDialogOpen(true)
    setRejectionReason("")
  }

  const handleConfirmAction = async () => {
    if (!selectedPromotion) return

    try {
      await adminApi(`/exhibitors/promotions/${selectedPromotion.id}`, {
        method: "PATCH",
        body: {
          status: actionType,
          rejectionReason: actionType === "REJECTED" ? rejectionReason : undefined,
        },
      })
      await fetchPromotions()
      setActionDialogOpen(false)
    } catch (error) {
      console.error("Failed to update promotion:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      PENDING: { variant: "outline", label: "Pending" },
      APPROVED: { variant: "default", label: "Approved" },
      ACTIVE: { variant: "default", label: "Active" },
      REJECTED: { variant: "destructive", label: "Rejected" },
      COMPLETED: { variant: "secondary", label: "Completed" },
      EXPIRED: { variant: "secondary", label: "Expired" },
    }
    const config = variants[status] || { variant: "outline" as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const calculateCTR = (clicks: number, impressions: number) => {
    if (impressions === 0) return "0.00"
    return ((clicks / impressions) * 100).toFixed(2)
  }

  const calculateConversionRate = (conversions: number, clicks: number) => {
    if (clicks === 0) return "0.00"
    return ((conversions / clicks) * 100).toFixed(2)
  }

  const stats = {
    total: promotions.length,
    pending: promotions.filter((p) => p.status === "PENDING").length,
    approved: promotions.filter((p) => p.status === "APPROVED" || p.status === "ACTIVE").length,
    active: promotions.filter((p) => p.status === "ACTIVE").length,
    totalRevenue: promotions.reduce((sum, p) => sum + p.amount, 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading promotions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Exhibitor Promotions</h1>
        <p className="text-muted-foreground">Manage and approve exhibitor promotion requests</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Promotions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Promotions</CardTitle>
          <CardDescription>Search and filter exhibitor promotion requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by exhibitor name, email, event, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={packageFilter} onValueChange={setPackageFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by package" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Packages</SelectItem>
                <SelectItem value="BASIC">Basic</SelectItem>
                <SelectItem value="STANDARD">Standard</SelectItem>
                <SelectItem value="PREMIUM">Premium</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Promotions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Promotion Requests</CardTitle>
          <CardDescription>
            Showing {filteredPromotions.length} of {promotions.length} promotions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Exhibitor</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromotions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No promotions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPromotions.map((promotion) => (
                    <TableRow key={promotion.id}>
                      <TableCell className="font-mono text-xs">{promotion.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {promotion.exhibitor?.firstName} {promotion.exhibitor?.lastName}
                          </div>
                          {promotion.exhibitor?.company && (
                            <div className="text-sm text-muted-foreground">{promotion.exhibitor?.company}</div>
                          )}
                          <div className="text-xs text-muted-foreground">{promotion.exhibitor?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {promotion.event ? (
                          <div className="text-sm">{promotion.event.title}</div>
                        ) : (
                          <span className="text-muted-foreground">No event</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{promotion.packageType}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">${promotion.amount.toLocaleString()}</TableCell>
                      <TableCell>{promotion.duration} days</TableCell>
                      <TableCell>{getStatusBadge(promotion.status)}</TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{promotion.impressions.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MousePointerClick className="h-3 w-3" />
                            <span>
                              {promotion.clicks} ({calculateCTR(promotion.clicks, promotion.impressions)}%)
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            <span>
                              {promotion.conversions} (
                              {calculateConversionRate(promotion.conversions, promotion.clicks)}%)
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPromotion(promotion)
                              setDetailsDialogOpen(true)
                            }}
                          >
                            View
                          </Button>
                          {promotion.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleActionClick(promotion, "APPROVED")}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleActionClick(promotion, "REJECTED")}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Promotion Details</DialogTitle>
            <DialogDescription>Complete information about this promotion request</DialogDescription>
          </DialogHeader>
          {selectedPromotion && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Promotion ID</Label>
                  <p className="font-mono text-sm">{selectedPromotion.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedPromotion.status)}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Exhibitor Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p>
                      {selectedPromotion.exhibitor.firstName} {selectedPromotion.exhibitor.lastName}
                    </p>
                  </div>
                  {selectedPromotion.exhibitor.company && (
                    <div>
                      <Label className="text-muted-foreground">Company</Label>
                      <p>{selectedPromotion.exhibitor.company}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="text-sm">{selectedPromotion.exhibitor.email}</p>
                  </div>
                </div>
              </div>

              {selectedPromotion.event && (
                <div>
                  <h3 className="font-semibold mb-3">Event Information</h3>
                  <div>
                    <Label className="text-muted-foreground">Event Title</Label>
                    <p>{selectedPromotion.event.title}</p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-3">Promotion Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Package Type</Label>
                    <p>{selectedPromotion.packageType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Amount</Label>
                    <p className="font-semibold">${selectedPromotion.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Duration</Label>
                    <p>{selectedPromotion.duration} days</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Start Date</Label>
                    <p>{new Date(selectedPromotion.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">End Date</Label>
                    <p>{new Date(selectedPromotion.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Target Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPromotion.targetCategories.map((category, index) => (
                    <Badge key={index} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Performance Metrics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Impressions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{selectedPromotion.impressions.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Clicks (CTR)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{selectedPromotion.clicks}</p>
                      <p className="text-xs text-muted-foreground">
                        {calculateCTR(selectedPromotion.clicks, selectedPromotion.impressions)}% CTR
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Conversions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{selectedPromotion.conversions}</p>
                      <p className="text-xs text-muted-foreground">
                        {calculateConversionRate(selectedPromotion.conversions, selectedPromotion.clicks)}% Conv. Rate
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <Label className="text-muted-foreground">Created At</Label>
                  <p>{new Date(selectedPromotion.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "APPROVED" ? "Approve Promotion" : "Reject Promotion"}</DialogTitle>
            <DialogDescription>
              {actionType === "APPROVED"
                ? "Are you sure you want to approve this promotion request?"
                : "Please provide a reason for rejecting this promotion request."}
            </DialogDescription>
          </DialogHeader>
          {actionType === "REJECTED" && (
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === "APPROVED" ? "default" : "destructive"}
              onClick={handleConfirmAction}
              disabled={actionType === "REJECTED" && !rejectionReason.trim()}
            >
              {actionType === "APPROVED" ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
