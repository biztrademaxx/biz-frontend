// app/admin/approvals/components/OrganizerApprovals.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Mail,
    Building2,
    Phone,
    Check,
    X,
    Eye,
    Clock,
    AlertTriangle,
    Loader2,
    Globe,
    Users,
    Search,
    ChevronLeft,
    ChevronRight,
    Filter,
    Calendar,
    UserCheck,
    MapPin,
    Briefcase,
    RefreshCw,
    CheckCheck,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { adminApi } from "@/lib/admin-api"

interface Organizer {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    phone: string | null
    organizationName: string | null
    company: string | null
    description: string | null
    website: string | null
    location: string | null
    avatar: string | null
    createdAt: string
    isVerified: boolean
    isActive: boolean
    eventsCount?: number
}

interface PaginatedResponse {
    data: Organizer[]
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
    stats?: {
        total: number
        verified: number
        premium: number
        pending: number
    }
}

function getOrganizerName(org: Organizer): string {
    if (org?.organizationName?.trim()) return org.organizationName
    if (org?.company?.trim()) return org.company
    const name = `${org?.firstName || ""} ${org?.lastName || ""}`.trim()
    return name || "Unnamed Organizer"
}

export default function OrganizerApprovals() {
    const [organizers, setOrganizers] = useState<Organizer[]>([])
    const [totalOrganizers, setTotalOrganizers] = useState(0)
    const [pendingTotal, setPendingTotal] = useState(0)
    const [activeTotal, setActiveTotal] = useState(0)
    const [listTotal, setListTotal] = useState(0)
    const [activeTab, setActiveTab] = useState<"pending" | "active">("pending")
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null)
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
    const [rejectReason, setRejectReason] = useState("")
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [approveDialogOpen, setApproveDialogOpen] = useState(false)
    const [bulkApproveMode, setBulkApproveMode] = useState<"selected" | "all" | null>(null)
    const [bulkApproving, setBulkApproving] = useState(false)
    const itemsPerPage = 10
    const { toast } = useToast()

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setCurrentPage(1)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchTerm])

    const buildOrganizersQuery = useCallback(
        (tab: "pending" | "active", page: number, search: string) => {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(itemsPerPage),
                sort: "createdAt",
                order: "desc",
            })
            const trimmedSearch = search.trim()
            if (trimmedSearch) params.set("search", trimmedSearch)
            if (tab === "pending") {
                params.set("verified", "false")
                params.set("isActive", "true")
            } else {
                params.set("verified", "true")
                params.set("isActive", "true")
            }
            return params
        },
        [itemsPerPage],
    )

    const fetchCounts = useCallback(async () => {
        const [allRes, pendingRes, activeRes] = await Promise.all([
            adminApi<PaginatedResponse>(`/organizers?limit=1&page=1`),
            adminApi<PaginatedResponse>(`/organizers?verified=false&isActive=true&limit=1&page=1`),
            adminApi<PaginatedResponse>(`/organizers?verified=true&isActive=true&limit=1&page=1`),
        ])
        setTotalOrganizers(allRes.stats?.total ?? allRes.pagination?.total ?? 0)
        setPendingTotal(pendingRes.pagination?.total ?? 0)
        setActiveTotal(activeRes.pagination?.total ?? 0)
    }, [])

    const fetchPage = useCallback(async () => {
        try {
            setLoading(true)
            const params = buildOrganizersQuery(activeTab, currentPage, debouncedSearch)
            const response = await adminApi<PaginatedResponse>(`/organizers?${params.toString()}`)
            const list = response?.data ?? []
            setOrganizers(Array.isArray(list) ? list : [])
            const total = Number(response?.pagination?.total ?? list.length)
            const pages = Math.max(1, Number(response?.pagination?.totalPages ?? 1))
            setListTotal(Number.isFinite(total) ? total : 0)
            setTotalPages(pages)
            if (currentPage > pages) setCurrentPage(pages)
            const valid = new Set((Array.isArray(list) ? list : []).map((o) => o.id))
            setSelectedIds((prev) => {
                const next = new Set([...prev].filter((id) => valid.has(id)))
                if (next.size === prev.size) return prev
                return next
            })
        } catch (error) {
            console.error("Error fetching organizers:", error)
            setOrganizers([])
            setListTotal(0)
            setTotalPages(1)
            toast({ title: "Error", description: "Failed to load organizers", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }, [activeTab, buildOrganizersQuery, currentPage, debouncedSearch])

    useEffect(() => {
        void fetchCounts()
    }, [fetchCounts])

    useEffect(() => {
        void fetchPage()
    }, [fetchPage])

    const refreshAllData = async () => {
        setRefreshing(true)
        setCurrentPage(1)
        setSearchTerm("")
        setDebouncedSearch("")
        await fetchCounts()
        toast({ title: "Refreshed", description: "Data has been updated" })
        setRefreshing(false)
    }

    const handleApprove = async (organizerId: string) => {
        setProcessingId(organizerId)
        try {
            await adminApi(`/organizers/${organizerId}`, {
                method: "PATCH",
                body: { isVerified: true, isActive: true },
            })
            toast({ title: "Success", description: "Organizer approved successfully" })
            await fetchCounts()
            await fetchPage()
        } catch (error) {
            toast({ title: "Error", description: "Failed to approve organizer", variant: "destructive" })
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async () => {
        if (!selectedOrganizer) return
        setProcessingId(selectedOrganizer.id)
        try {
            await adminApi(`/organizers/${selectedOrganizer.id}/reject`, {
                method: "POST",
                body: { reason: rejectReason },
            })
            toast({ title: "Success", description: "Organizer rejected successfully" })
            await fetchCounts()
            await fetchPage()
            setRejectDialogOpen(false)
            setRejectReason("")
            setSelectedOrganizer(null)
        } catch (error) {
            toast({ title: "Error", description: "Failed to reject organizer", variant: "destructive" })
        } finally {
            setProcessingId(null)
        }
    }

    const pendingCount = pendingTotal
    const activeCount = activeTotal
    const totalCount = totalOrganizers
    const searching = debouncedSearch.trim().length > 0
    const approveAllCount = searching ? listTotal : pendingCount
    const selectedCount = selectedIds.size
    const allSelected = organizers.length > 0 && selectedCount === organizers.length
    const someSelected = selectedCount > 0 && !allSelected

    const toggleOne = (id: string, checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev)
            if (checked) next.add(id)
            else next.delete(id)
            return next
        })
    }

    const toggleAll = (checked: boolean) => {
        setSelectedIds(checked ? new Set(organizers.map((o) => o.id)) : new Set())
    }

    const openBulkApprove = (mode: "selected" | "all") => {
        if (mode === "selected" && selectedCount === 0) return
        if (mode === "all" && approveAllCount === 0) return
        setBulkApproveMode(mode)
        setApproveDialogOpen(true)
    }

    const handleBulkApprove = async () => {
        if (!bulkApproveMode) return
        setBulkApproving(true)
        try {
            const body =
                bulkApproveMode === "all"
                    ? { allPending: true, search: debouncedSearch.trim() || undefined }
                    : { ids: [...selectedIds] }
            const result = await adminApi<{ success?: boolean; approvedCount?: number }>("/organizers/bulk-approve", {
                method: "POST",
                body,
            })
            const count = result.approvedCount ?? (bulkApproveMode === "all" ? approveAllCount : selectedCount)
            toast({ title: "Success", description: `${count} organizer(s) approved` })
            setSelectedIds(new Set())
            setApproveDialogOpen(false)
            setBulkApproveMode(null)
            await fetchCounts()
            await fetchPage()
        } catch (error) {
            toast({ title: "Error", description: "Failed to approve organizers", variant: "destructive" })
        } finally {
            setBulkApproving(false)
        }
    }

    const getOrganization = (org: Organizer): string => {
        return org?.organizationName || org?.company || "N/A"
    }

    const getInitials = (name: string): string => {
        if (!name || name === "Unnamed Organizer") return "UO"
        return name.split(" ").slice(0, 2).map((n) => n[0] || "").join("").toUpperCase()
    }

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage)
            window.scrollTo({ top: 0, behavior: "smooth" })
        }
    }

    return (
        <div className="space-y-6">
            {/* Header with Refresh Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Organizer Approvals</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage and review organizer registrations
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshAllData}
                    disabled={refreshing}
                    className="gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards - Now showing ACTUAL counts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Total Organizers</p>
                            <p className="text-3xl font-bold text-blue-900">{totalCount}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-blue-200/50 flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-amber-600 font-medium">Pending Approval</p>
                            <p className="text-3xl font-bold text-amber-900">{pendingCount}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-amber-200/50 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-amber-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Active Organizers</p>
                            <p className="text-3xl font-bold text-green-900">{activeCount}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-green-200/50 flex items-center justify-center">
                            <UserCheck className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by name, email, or organization..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={(v) => {
                    setActiveTab(v as "pending" | "active")
                    setCurrentPage(1)
                    setSearchTerm("")
                    setDebouncedSearch("")
                    setSelectedIds(new Set())
                }}
            >
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="pending" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Pending Review
                        {pendingCount > 0 && (
                            <Badge variant="secondary" className="ml-1 bg-amber-200 text-amber-800">
                                {pendingCount}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="active" className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Active Organizers
                        {activeCount > 0 && (
                            <Badge variant="secondary" className="ml-1 bg-green-200 text-green-800">
                                {activeCount}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Pending Tab */}
                <TabsContent value="pending" className="mt-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : organizers.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                            <p className="text-gray-500">No pending organizer registrations to review.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row sm:items-center sm:justify-between mb-3">
                                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                                    <Checkbox
                                        checked={allSelected ? true : someSelected ? "indeterminate" : false}
                                        onCheckedChange={(value) => toggleAll(value === true)}
                                        aria-label="Select all organizers on this page"
                                    />
                                    Select all ({organizers.length})
                                    {selectedCount > 0 && (
                                        <span className="text-muted-foreground font-normal">
                                            · {selectedCount} selected
                                        </span>
                                    )}
                                </label>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={selectedCount === 0 || bulkApproving}
                                        onClick={() => openBulkApprove("selected")}
                                    >
                                        Approve selected{selectedCount > 0 ? ` (${selectedCount})` : ""}
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                        disabled={approveAllCount === 0 || bulkApproving}
                                        onClick={() => openBulkApprove("all")}
                                    >
                                        <CheckCheck className="mr-1.5 h-4 w-4" />
                                        {searching
                                            ? `Approve all matching (${approveAllCount})`
                                            : `Approve all organizers (${approveAllCount})`}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {organizers.map((organizer) => (
                                    <OrganizerCard
                                        key={organizer.id}
                                        organizer={organizer}
                                        name={getOrganizerName(organizer)}
                                        organization={getOrganization(organizer)}
                                        initials={getInitials(getOrganizerName(organizer))}
                                        isPending={true}
                                        isProcessing={processingId === organizer.id}
                                        selected={selectedIds.has(organizer.id)}
                                        onSelectedChange={(checked) => toggleOne(organizer.id, checked)}
                                        onView={() => {
                                            setSelectedOrganizer(organizer)
                                            setDetailsDialogOpen(true)
                                        }}
                                        onApprove={() => handleApprove(organizer.id)}
                                        onReject={() => {
                                            setSelectedOrganizer(organizer)
                                            setRejectDialogOpen(true)
                                        }}
                                    />
                                ))}
                            </div>

                            {(listTotal > 0 || totalPages > 1) && (
                                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                    <p className="text-sm text-gray-500">
                                        Showing {organizers.length} of {listTotal} organizers
                                    </p>
                                    {totalPages > 1 && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Previous
                                        </Button>
                                        <span className="text-sm text-gray-600 px-3 py-1">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </TabsContent>

                {/* Active Tab */}
                <TabsContent value="active" className="mt-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : organizers.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                <Users className="h-8 w-8 text-gray-500" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No Active Organizers</h3>
                            <p className="text-gray-500">Approved organizers will appear here.</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {organizers.map((organizer) => (
                                    <OrganizerCard
                                        key={organizer.id}
                                        organizer={organizer}
                                        name={getOrganizerName(organizer)}
                                        organization={getOrganization(organizer)}
                                        initials={getInitials(getOrganizerName(organizer))}
                                        isPending={false}
                                        isProcessing={false}
                                        onView={() => {
                                            setSelectedOrganizer(organizer)
                                            setDetailsDialogOpen(true)
                                        }}
                                        onApprove={() => { }}
                                        onReject={() => { }}
                                        showActions={false}
                                    />
                                ))}
                            </div>

                            {(listTotal > 0 || totalPages > 1) && (
                                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                    <p className="text-sm text-gray-500">
                                        Showing {organizers.length} of {listTotal} organizers
                                    </p>
                                    {totalPages > 1 && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Previous
                                        </Button>
                                        <span className="text-sm text-gray-600 px-3 py-1">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </TabsContent>
            </Tabs>

            {/* Details Dialog - Same as before */}
            <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Organizer Details</DialogTitle>
                    </DialogHeader>
                    {selectedOrganizer && (
                        <div className="space-y-6">
                            <div className="flex items-start gap-5 pb-5 border-b">
                                <Avatar className="h-20 w-20 border-2 border-gray-200">
                                    <AvatarImage src={selectedOrganizer.avatar || undefined} />
                                    <AvatarFallback className="text-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                        {getInitials(getOrganizerName(selectedOrganizer))}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold mb-1">{getOrganizerName(selectedOrganizer)}</h2>
                                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                                        <Mail className="h-4 w-4" />
                                        <span className="text-sm">{selectedOrganizer.email}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge className={selectedOrganizer.isVerified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                                            {selectedOrganizer.isVerified ? "Verified" : "Pending Verification"}
                                        </Badge>
                                        <Badge className={selectedOrganizer.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                                            {selectedOrganizer.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Phone</p>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm">{selectedOrganizer.phone || "Not provided"}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Organization</p>
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm">{getOrganization(selectedOrganizer)}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Website</p>
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm">{selectedOrganizer.website || "N/A"}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Location</p>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm">{selectedOrganizer.location || "Not specified"}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg md:col-span-2">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Joined Date</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm">
                                            {new Date(selectedOrganizer.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {selectedOrganizer.description && (
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 font-medium mb-2">Description</p>
                                    <p className="text-sm leading-relaxed">{selectedOrganizer.description}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={approveDialogOpen}
                onOpenChange={(open) => {
                    if (bulkApproving) return
                    setApproveDialogOpen(open)
                    if (!open) setBulkApproveMode(null)
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600">
                            <CheckCheck className="h-5 w-5" />
                            {bulkApproveMode === "all"
                                ? `Approve ${approveAllCount} organizers`
                                : `Approve ${selectedCount} organizers`}
                        </DialogTitle>
                        <DialogDescription>
                            {bulkApproveMode === "all"
                                ? searching
                                    ? `Approve all ${approveAllCount} matching pending organizers? They will become verified and active.`
                                    : `Approve all ${approveAllCount} pending organizers? They will become verified and active.`
                                : `Approve ${selectedCount} selected organizers? They will become verified and active.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col gap-2 sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setApproveDialogOpen(false)
                                setBulkApproveMode(null)
                            }}
                            disabled={bulkApproving}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => void handleBulkApprove()}
                            disabled={bulkApproving}
                        >
                            {bulkApproving ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="mr-2 h-4 w-4" />
                            )}
                            {bulkApproving
                                ? "Approving…"
                                : bulkApproveMode === "all"
                                  ? `Approve ${approveAllCount} organizers`
                                  : `Approve ${selectedCount} organizers`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-full">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            <DialogTitle>Reject Organizer</DialogTitle>
                        </div>
                        <DialogDescription>
                            Are you sure you want to reject "{selectedOrganizer && getOrganizerName(selectedOrganizer)}"?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        <label className="text-sm font-medium">Rejection Reason</label>
                        <Textarea
                            placeholder="Please provide a reason for rejection..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                        <p className="text-xs text-gray-500">This reason will be shared with the organizer via email.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={!rejectReason.trim() || processingId !== null}
                            className="gap-2"
                        >
                            {processingId && <Loader2 className="h-4 w-4 animate-spin" />}
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

// Organizer Card Component
function OrganizerCard({
    organizer,
    name,
    organization,
    initials,
    isPending,
    isProcessing,
    selected = false,
    onSelectedChange,
    onView,
    onApprove,
    onReject,
    showActions = true
}: {
    organizer: Organizer
    name: string
    organization: string
    initials: string
    isPending: boolean
    isProcessing: boolean
    selected?: boolean
    onSelectedChange?: (checked: boolean) => void
    onView: () => void
    onApprove: () => void
    onReject: () => void
    showActions?: boolean
}) {
    return (
        <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
            <div className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                        {isPending && onSelectedChange && (
                            <Checkbox
                                className="mt-4"
                                checked={selected}
                                onCheckedChange={(value) => onSelectedChange(value === true)}
                                aria-label={`Select ${name}`}
                            />
                        )}
                        <Avatar className="h-12 w-12 flex-shrink-0 border border-gray-200">
                            <AvatarImage src={organizer.avatar || undefined} alt={name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                                {initials}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
                                {isPending && (
                                    <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 text-xs">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Pending
                                    </Badge>
                                )}
                                {!isPending && (
                                    <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50 text-xs">
                                        <Check className="h-3 w-3 mr-1" />
                                        Active
                                    </Badge>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1.5 text-sm">
                                <div className="flex items-center gap-1.5 text-gray-600 min-w-0">
                                    <Mail className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                                    <span className="truncate">{organizer.email}</span>
                                </div>
                                {organization !== "N/A" && (
                                    <div className="flex items-center gap-1.5 text-gray-600 min-w-0">
                                        <Briefcase className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                                        <span className="truncate">{organization}</span>
                                    </div>
                                )}
                                {organizer.phone && (
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                        <Phone className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                                        <span className="truncate">{organizer.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>Joined {new Date(organizer.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {showActions && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Button variant="ghost" size="sm" onClick={onView} className="h-8 px-3 text-sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Details
                            </Button>
                            <Button
                                size="sm"
                                onClick={onApprove}
                                disabled={isProcessing}
                                className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white text-sm"
                            >
                                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                                Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={onReject} disabled={isProcessing} className="h-8 px-3 text-sm">
                                <X className="h-4 w-4 mr-1" />
                                Reject
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}