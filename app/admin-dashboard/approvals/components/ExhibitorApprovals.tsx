// app/admin/approvals/components/ExhibitorApprovals.tsx
"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Building2, Mail, Phone, Briefcase, Check, X, Eye, Clock, AlertTriangle, Loader2, Users, CheckCheck } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { adminApi } from "@/lib/admin-api"

interface Exhibitor {
    id: string
    firstName: string | null
    lastName: string | null
    company: string | null
    email: string
    phone: string | null
    companyIndustry: string | null
    website: string | null
    location: string | null
    description: string | null
    avatar: string | null
    createdAt: string
    isActive: boolean
}

export default function ExhibitorApprovals() {
    const [exhibitors, setExhibitors] = useState<Exhibitor[]>([])
    const [activeTab, setActiveTab] = useState<"pending" | "active">("pending")
    const [loading, setLoading] = useState(true)
    const [selectedExhibitor, setSelectedExhibitor] = useState<Exhibitor | null>(null)
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
    const [rejectReason, setRejectReason] = useState("")
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [approveDialogOpen, setApproveDialogOpen] = useState(false)
    const [bulkApproveMode, setBulkApproveMode] = useState<"selected" | "all" | null>(null)
    const [bulkApproving, setBulkApproving] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        fetchExhibitors()
    }, [activeTab])

    const fetchExhibitors = async () => {
        try {
            setLoading(true)
            let url = "/exhibitors?limit=100"

            if (activeTab === "pending") {
                url = "/exhibitors?status=pending&limit=100"
            } else {
                url = "/exhibitors?isActive=true&limit=100"
            }

            const data = await adminApi<{ data: Exhibitor[] }>(url)
            // Ensure we have an array, even if data is null/undefined
            const exhibitorsList = data?.data || []
            setExhibitors(Array.isArray(exhibitorsList) ? exhibitorsList : [])
            const valid = new Set((Array.isArray(exhibitorsList) ? exhibitorsList : []).map((e) => e.id))
            setSelectedIds((prev) => {
                const next = new Set([...prev].filter((id) => valid.has(id)))
                if (next.size === prev.size) return prev
                return next
            })
        } catch (error) {
            console.error("Error fetching exhibitors:", error)
            toast({ title: "Error", description: "Failed to load exhibitors", variant: "destructive" })
            setExhibitors([])
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (exhibitorId: string) => {
        if (!exhibitorId) return
        setProcessingId(exhibitorId)
        try {
            await adminApi(`/exhibitors/${exhibitorId}`, {
                method: "PATCH",
                body: { isActive: true },
            })
            toast({ title: "Success", description: "Exhibitor approved successfully" })
            fetchExhibitors()
        } catch (error) {
            toast({ title: "Error", description: "Failed to approve exhibitor", variant: "destructive" })
        } finally {
            setProcessingId(null)
        }
    }

    const handleBulkApprove = async () => {
        if (!bulkApproveMode) return
        setBulkApproving(true)
        try {
            const body =
                bulkApproveMode === "all"
                    ? { allPending: true }
                    : { ids: [...selectedIds] }
            const result = await adminApi<{ success?: boolean; approvedCount?: number }>("/exhibitors/bulk-approve", {
                method: "POST",
                body,
            })
            const count = result.approvedCount ?? (bulkApproveMode === "all" ? pendingExhibitors.length : selectedIds.size)
            toast({ title: "Success", description: `${count} exhibitor(s) approved` })
            setSelectedIds(new Set())
            setApproveDialogOpen(false)
            setBulkApproveMode(null)
            await fetchExhibitors()
        } catch (error) {
            toast({ title: "Error", description: "Failed to approve exhibitors", variant: "destructive" })
        } finally {
            setBulkApproving(false)
        }
    }

    const handleReject = async () => {
        if (!selectedExhibitor || !selectedExhibitor.id) return
        setProcessingId(selectedExhibitor.id)
        try {
            await adminApi(`/exhibitors/${selectedExhibitor.id}/reject`, {
                method: "POST",
                body: { reason: rejectReason },
            })
            toast({ title: "Success", description: "Exhibitor rejected successfully" })
            setRejectDialogOpen(false)
            setRejectReason("")
            setSelectedExhibitor(null)
            fetchExhibitors()
        } catch (error) {
            toast({ title: "Error", description: "Failed to reject exhibitor", variant: "destructive" })
        } finally {
            setProcessingId(null)
        }
    }

    // Safe function to get company name - checks if ex exists first
    const getCompanyName = (ex: Exhibitor | null | undefined): string => {
        // Check if ex is null or undefined
        if (!ex) return "Unnamed Exhibitor"

        // Check company property
        if (ex.company && typeof ex.company === 'string' && ex.company.trim()) {
            return ex.company
        }

        // Check first and last name
        const firstName = ex.firstName || ""
        const lastName = ex.lastName || ""
        if (firstName || lastName) {
            return `${firstName} ${lastName}`.trim()
        }

        return "Unnamed Exhibitor"
    }

    // Safe function to get contact name
    const getContactName = (ex: Exhibitor | null | undefined): string => {
        if (!ex) return "Contact not provided"

        const firstName = ex.firstName || ""
        const lastName = ex.lastName || ""
        if (firstName || lastName) {
            return `${firstName} ${lastName}`.trim()
        }
        return "Contact not provided"
    }

    // Safe function to get initials
    const getInitials = (name: string): string => {
        if (!name || name === "Unnamed Exhibitor") return "UE"
        const parts = name.split(" ").slice(0, 2)
        const initials = parts.map((n) => n[0] || "").join("")
        return initials.toUpperCase() || "UE"
    }

    // Safe function to get email
    const getEmail = (ex: Exhibitor | null | undefined): string => {
        if (!ex) return "No email"
        return ex.email || "No email"
    }

    // Safe function to get industry
    const getIndustry = (ex: Exhibitor | null | undefined): string => {
        if (!ex) return "N/A"
        return ex.companyIndustry || "N/A"
    }

    // Safe function to get phone
    const getPhone = (ex: Exhibitor | null | undefined): string => {
        if (!ex) return "N/A"
        return ex.phone || "N/A"
    }

    // Filter exhibitors safely
    const pendingExhibitors = exhibitors.filter(e => e && !e.isActive)
    const activeExhibitors = exhibitors.filter(e => e && e.isActive)
    const selectedCount = selectedIds.size
    const allSelected = pendingExhibitors.length > 0 && selectedCount === pendingExhibitors.length
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
        setSelectedIds(checked ? new Set(pendingExhibitors.map((e) => e.id)) : new Set())
    }

    const openBulkApprove = (mode: "selected" | "all") => {
        if (mode === "selected" && selectedCount === 0) return
        if (mode === "all" && pendingExhibitors.length === 0) return
        setBulkApproveMode(mode)
        setApproveDialogOpen(true)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={(value) => {
                setActiveTab(value as "pending" | "active")
                setSelectedIds(new Set())
            }} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="pending" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Pending
                        {pendingExhibitors.length > 0 && (
                            <Badge variant="secondary" className="ml-1 bg-yellow-100 text-yellow-800">
                                {pendingExhibitors.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="active" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Active
                        {activeExhibitors.length > 0 && (
                            <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800">
                                {activeExhibitors.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6">
                    {pendingExhibitors.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No Pending Exhibitors</h3>
                            <p className="text-gray-500">All exhibitor registrations have been reviewed.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                                    <Checkbox
                                        checked={allSelected ? true : someSelected ? "indeterminate" : false}
                                        onCheckedChange={(value) => toggleAll(value === true)}
                                        aria-label="Select all pending exhibitors"
                                    />
                                    Select all ({pendingExhibitors.length})
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
                                        disabled={pendingExhibitors.length === 0 || bulkApproving}
                                        onClick={() => openBulkApprove("all")}
                                    >
                                        <CheckCheck className="mr-1.5 h-4 w-4" />
                                        Approve all exhibitors ({pendingExhibitors.length})
                                    </Button>
                                </div>
                            </div>
                            {pendingExhibitors.map((exhibitor) => {
                                if (!exhibitor) return null
                                const company = getCompanyName(exhibitor)
                                return (
                                    <Card key={exhibitor.id} className="relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-yellow-500 to-orange-500" />
                                        <div className="p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <Checkbox
                                                        checked={selectedIds.has(exhibitor.id)}
                                                        onCheckedChange={(value) => toggleOne(exhibitor.id, value === true)}
                                                        aria-label={`Select ${company}`}
                                                    />
                                                    <Avatar className="h-14 w-14 border-2 border-gray-100">
                                                        <AvatarImage src={exhibitor.avatar || undefined} alt={company} />
                                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                                                            {getInitials(company)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold">{company}</h3>
                                                        <p className="text-sm text-gray-500">{getContactName(exhibitor)}</p>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                                <Mail className="h-3.5 w-3.5" />
                                                                <span>{getEmail(exhibitor)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                                <Briefcase className="h-3.5 w-3.5" />
                                                                <span>{getIndustry(exhibitor)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleApprove(exhibitor.id)}
                                                        disabled={processingId === exhibitor.id || bulkApproving}
                                                        className="bg-green-600 hover:bg-green-700 text-white gap-2"
                                                    >
                                                        {processingId === exhibitor.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Check className="h-4 w-4" />
                                                        )}
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => {
                                                            setSelectedExhibitor(exhibitor)
                                                            setRejectDialogOpen(true)
                                                        }}
                                                        disabled={processingId === exhibitor.id || bulkApproving}
                                                        className="gap-2"
                                                    >
                                                        <X className="h-4 w-4" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="active" className="mt-6">
                    {activeExhibitors.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No Active Exhibitors</h3>
                            <p className="text-gray-500">No approved exhibitors found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeExhibitors.map((exhibitor) => {
                                if (!exhibitor) return null
                                const company = getCompanyName(exhibitor)
                                return (
                                    <Card key={exhibitor.id} className="relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-500 to-emerald-500" />
                                        <div className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-14 w-14 border-2 border-gray-100">
                                                        <AvatarImage src={exhibitor.avatar || undefined} alt={company} />
                                                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-lg">
                                                            {getInitials(company)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className="text-lg font-semibold">{company}</h3>
                                                        <p className="text-sm text-gray-500">{getEmail(exhibitor)}</p>
                                                        <p className="text-sm text-gray-500">{getIndustry(exhibitor)}</p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                                            </div>
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

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
                                ? `Approve ${pendingExhibitors.length} exhibitors`
                                : `Approve ${selectedCount} exhibitors`}
                        </DialogTitle>
                        <DialogDescription>
                            {bulkApproveMode === "all"
                                ? `Approve all ${pendingExhibitors.length} pending exhibitors? They will become active.`
                                : `Approve ${selectedCount} selected exhibitors? They will become active.`}
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
                                  ? `Approve ${pendingExhibitors.length} exhibitors`
                                  : `Approve ${selectedCount} exhibitors`}
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
                            <DialogTitle>Reject Exhibitor</DialogTitle>
                        </div>
                        <DialogDescription>
                            Are you sure you want to reject "{selectedExhibitor ? getCompanyName(selectedExhibitor) : "this exhibitor"}"?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        <label className="text-sm font-medium">Rejection Reason</label>
                        <Textarea
                            placeholder="Please provide a reason for rejection..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={4}
                        />
                        <p className="text-xs text-gray-500">
                            This reason will be shared with the exhibitor.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={!rejectReason.trim() || processingId === selectedExhibitor?.id}
                        >
                            {processingId === selectedExhibitor?.id ? "Rejecting..." : "Confirm Rejection"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}