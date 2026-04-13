"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Eye, CheckCircle, XCircle, Clock, TrendingUp, DollarSign, Target, Download } from "lucide-react"
import { format } from "date-fns"
import { adminApi } from "@/lib/admin-api"

interface Promotion {
    id: string
    organizer: {
        id: string
        firstName: string
        lastName: string
        organizationName?: string
        email: string
    }
    event?: {
        id: string
        title: string
    }
    packageType: string
    targetCategories: string[]
    status: "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "EXPIRED"
    amount: number
    duration: number
    startDate: string
    endDate: string
    impressions: number
    clicks: number
    conversions: number
    createdAt: string
}

export default function OrganizerPromotionsPage() {
    const [promotions, setPromotions] = useState<Promotion[]>([])
    const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [packageFilter, setPackageFilter] = useState<string>("all")
    const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
    const [viewDialogOpen, setViewDialogOpen] = useState(false)
    const [actionDialogOpen, setActionDialogOpen] = useState(false)
    const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
    const [rejectionReason, setRejectionReason] = useState("")

    // Fetch promotions data
    useEffect(() => {
        fetchPromotions()
    }, [])

    const fetchPromotions = async () => {
        try {
            setLoading(true)
            const data = await adminApi<{ promotions?: Promotion[]; total?: number }>("/organizers/promotions")
            const list = data.promotions ?? []
            setPromotions(list)
            setFilteredPromotions(list)
        } catch (error) {
            console.error("Error fetching promotions:", error)
        } finally {
            setLoading(false)
        }
    }

 
  // Filter promotions safely
useEffect(() => {
  let filtered = promotions

  // ✅ Search filter (with null-safe checks)
  if (searchTerm) {
    const search = searchTerm.toLowerCase()
    filtered = filtered.filter((promo) => {
      const orgName = promo.organizer?.organizationName?.toLowerCase() || ""
      const email = promo.organizer?.email?.toLowerCase() || ""
      const eventTitle = promo.event?.title?.toLowerCase() || ""
      const id = promo.id?.toLowerCase() || ""
      return orgName.includes(search) || email.includes(search) || eventTitle.includes(search) || id.includes(search)
    })
  }

  // ✅ Status filter
  if (statusFilter !== "all") {
    filtered = filtered.filter((promo) => promo.status === statusFilter)
  }

  // ✅ Package filter
  if (packageFilter !== "all") {
    filtered = filtered.filter((promo) => promo.packageType === packageFilter)
  }

  setFilteredPromotions(filtered)
}, [searchTerm, statusFilter, packageFilter, promotions])


    const handleViewPromotion = (promotion: Promotion) => {
        setSelectedPromotion(promotion)
        setViewDialogOpen(true)
    }

    const handleActionClick = (promotion: Promotion, action: "approve" | "reject") => {
        setSelectedPromotion(promotion)
        setActionType(action)
        setActionDialogOpen(true)
    }

    const handleConfirmAction = async () => {
        if (!selectedPromotion || !actionType) return

        try {
            await adminApi(`/organizers/promotions/${selectedPromotion.id}`, {
                method: "PATCH",
                body: {
                    status: actionType === "approve" ? "APPROVED" : "REJECTED",
                    rejectionReason: actionType === "reject" ? rejectionReason : undefined,
                },
            })
            fetchPromotions()
            setActionDialogOpen(false)
            setRejectionReason("")
            setSelectedPromotion(null)
            setActionType(null)
        } catch (error) {
            console.error("Error updating promotion:", error)
        }
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; icon: any }> = {
            PENDING: { variant: "outline", icon: Clock },
            APPROVED: { variant: "default", icon: CheckCircle },
            REJECTED: { variant: "destructive", icon: XCircle },
            ACTIVE: { variant: "default", icon: TrendingUp },
            EXPIRED: { variant: "secondary", icon: Clock },
        }

        const { variant, icon: Icon } = variants[status] || variants.PENDING

        return (
            <Badge variant={variant} className="flex items-center gap-1 w-fit">
                <Icon className="h-3 w-3" />
                {status}
            </Badge>
        )
    }

    const calculateCTR = (clicks: number, impressions: number) => {
        if (impressions === 0) return "0%"
        return ((clicks / impressions) * 100).toFixed(2) + "%"
    }

    const calculateConversionRate = (conversions: number, clicks: number) => {
        if (clicks === 0) return "0%"
        return ((conversions / clicks) * 100).toFixed(2) + "%"
    }

    const stats = {
        total: promotions.length,
        pending: promotions.filter((p) => p.status === "PENDING").length,
        approved: promotions.filter((p) => p.status === "APPROVED").length,
        active: promotions.filter((p) => p.status === "ACTIVE").length,
        totalRevenue: promotions.reduce((sum, p) => sum + p.amount, 0),
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Organizer Promotions</h1>
                <p className="text-muted-foreground mt-2">{"Manage and review promotion requests from event organizers"}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Promotions</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
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
                        <TrendingUp className="h-4 w-4 text-blue-500" />
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
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by organizer, email, event, or ID..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="EXPIRED">Expired</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={packageFilter} onValueChange={setPackageFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Package" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Packages</SelectItem>
                                <SelectItem value="FEATURED">Featured</SelectItem>
                                <SelectItem value="PREMIUM">Premium</SelectItem>
                                <SelectItem value="BASIC">Basic</SelectItem>
                                <SelectItem value="SPONSORED">Sponsored</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" className="w-full md:w-auto bg-transparent">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Promotions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Promotion Requests</CardTitle>
                    <CardDescription>
                        {filteredPromotions.length} of {promotions.length} promotions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {/* <TableHead>ID</TableHead> */}
                                    <TableHead>Organizer</TableHead>
                                    <TableHead>Event</TableHead>
                                    <TableHead>Package</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Performance</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8">
                                            Loading promotions...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredPromotions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8">
                                            No promotions found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPromotions.map((promotion) => (
                                        <TableRow key={promotion.id}>
                                            {/* <TableCell className="font-mono text-xs">{promotion.id.slice(0, 8)}...</TableCell> */}
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {promotion.organizer?.organizationName ||
                                                            (promotion.organizer
                                                                ? `${promotion.organizer.firstName ?? ""} ${promotion.organizer.lastName ?? ""}`
                                                                : "Unknown Organizer")}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {promotion.organizer?.email ?? "No email"}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                {promotion.event ? (
                                                    <span className="text-sm">{promotion.event.title}</span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">No event</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{promotion.packageType}</Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold">${promotion.amount}</TableCell>
                                            <TableCell>{promotion.duration} days</TableCell>
                                            <TableCell>{getStatusBadge(promotion.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1 text-xs">
                                                    <span>👁️ {promotion.impressions.toLocaleString()}</span>
                                                    <span>
                                                        🖱️ {promotion.clicks} ({calculateCTR(promotion.clicks, promotion.impressions)})
                                                    </span>
                                                    <span>✅ {promotion.conversions}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">{format(new Date(promotion.createdAt), "MMM dd, yyyy")}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleViewPromotion(promotion)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {promotion.status === "PENDING" && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleActionClick(promotion, "approve")}
                                                                className="text-green-600 hover:text-green-700"
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleActionClick(promotion, "reject")}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <XCircle className="h-4 w-4" />
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

            {/* View Promotion Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Promotion Details</DialogTitle>
                        <DialogDescription>Complete information about this promotion request</DialogDescription>
                    </DialogHeader>

                    {selectedPromotion && (
                        <div className="space-y-6">
                            {/* Status */}
                            <div>
                                <Label className="text-muted-foreground">Status</Label>
                                <div className="mt-1">{getStatusBadge(selectedPromotion.status)}</div>
                            </div>

                            {/* Organizer Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Organization</Label>
                                    <p className="mt-1 font-medium">
                                        {selectedPromotion.organizer.organizationName ||
                                            `${selectedPromotion.organizer.firstName} ${selectedPromotion.organizer.lastName}`}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Email</Label>
                                    <p className="mt-1 font-medium">{selectedPromotion.organizer.email}</p>
                                </div>
                            </div>

                            {/* Event */}
                            {selectedPromotion.event && (
                                <div>
                                    <Label className="text-muted-foreground">Event</Label>
                                    <p className="mt-1 font-medium">{selectedPromotion.event.title}</p>
                                </div>
                            )}

                            {/* Package & Pricing */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Package Type</Label>
                                    <p className="mt-1 font-medium">{selectedPromotion.packageType}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Amount</Label>
                                    <p className="mt-1 font-medium text-green-600">${selectedPromotion.amount}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Duration</Label>
                                    <p className="mt-1 font-medium">{selectedPromotion.duration} days</p>
                                </div>
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Start Date</Label>
                                    <p className="mt-1 font-medium">{format(new Date(selectedPromotion.startDate), "PPP")}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">End Date</Label>
                                    <p className="mt-1 font-medium">{format(new Date(selectedPromotion.endDate), "PPP")}</p>
                                </div>
                            </div>

                            {/* Target Categories */}
                            <div>
                                <Label className="text-muted-foreground">Target Categories</Label>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {selectedPromotion.targetCategories.map((category) => (
                                        <Badge key={category} variant="secondary">
                                            {category}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Performance Metrics */}
                            <div>
                                <Label className="text-muted-foreground mb-3 block">Performance Metrics</Label>
                                <div className="grid grid-cols-3 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{selectedPromotion.impressions.toLocaleString()}</div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{selectedPromotion.clicks}</div>
                                            <p className="text-xs text-muted-foreground">
                                                CTR: {calculateCTR(selectedPromotion.clicks, selectedPromotion.impressions)}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{selectedPromotion.conversions}</div>
                                            <p className="text-xs text-muted-foreground">
                                                Rate: {calculateConversionRate(selectedPromotion.conversions, selectedPromotion.clicks)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Created Date */}
                            <div>
                                <Label className="text-muted-foreground">Submitted On</Label>
                                <p className="mt-1 font-medium">{format(new Date(selectedPromotion.createdAt), "PPP 'at' p")}</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Action Confirmation Dialog */}
            <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{actionType === "approve" ? "Approve Promotion" : "Reject Promotion"}</DialogTitle>
                        <DialogDescription>
                            {actionType === "approve"
                                ? "This will approve the promotion request and allow it to go live."
                                : "Please provide a reason for rejecting this promotion request."}
                        </DialogDescription>
                    </DialogHeader>

                    {actionType === "reject" && (
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
                        <Button onClick={handleConfirmAction} variant={actionType === "approve" ? "default" : "destructive"}>
                            {actionType === "approve" ? "Approve" : "Reject"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
