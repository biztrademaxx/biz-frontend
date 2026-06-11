// app/admin/approvals/components/OrganizerApprovals.tsx
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
import { Mail, Building2, Phone, Check, X, Eye, Clock, AlertTriangle, Loader2, Globe, Users } from "lucide-react"
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
}

export default function OrganizerApprovals() {
    const [organizers, setOrganizers] = useState<Organizer[]>([])
    const [activeTab, setActiveTab] = useState<"pending" | "active">("pending")
    const [loading, setLoading] = useState(true)
    const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null)
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
    const [rejectReason, setRejectReason] = useState("")
    const [processingId, setProcessingId] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        fetchOrganizers()
    }, [activeTab])

    const fetchOrganizers = async () => {
        try {
            setLoading(true)
            let url = "/organizers?limit=100"

            if (activeTab === "pending") {
                url = "/organizers?verified=false&limit=100"
            } else {
                url = "/organizers?verified=true&isActive=true&limit=100"
            }

            const data = await adminApi<{ data: Organizer[] }>(url)
            setOrganizers(data.data || [])
        } catch (error) {
            console.error("Error fetching organizers:", error)
            toast({ title: "Error", description: "Failed to load organizers", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (organizerId: string) => {
        setProcessingId(organizerId)
        try {
            await adminApi(`/organizers/${organizerId}`, {
                method: "PATCH",
                body: { isVerified: true, isActive: true },
            })
            toast({ title: "Success", description: "Organizer approved successfully" })
            fetchOrganizers()
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
            setRejectDialogOpen(false)
            setRejectReason("")
            setSelectedOrganizer(null)
            fetchOrganizers()
        } catch (error) {
            toast({ title: "Error", description: "Failed to reject organizer", variant: "destructive" })
        } finally {
            setProcessingId(null)
        }
    }

    // Safe function to get organizer name - handles null/undefined
    const getOrganizerName = (org: Organizer): string => {
        // Check organizationName
        if (org?.organizationName && typeof org.organizationName === 'string' && org.organizationName.trim()) {
            return org.organizationName
        }
        // Check company
        if (org?.company && typeof org.company === 'string' && org.company.trim()) {
            return org.company
        }
        // Check first and last name
        const firstName = org?.firstName || ""
        const lastName = org?.lastName || ""
        if (firstName || lastName) {
            return `${firstName} ${lastName}`.trim()
        }
        return "Unnamed Organizer"
    }

    // Safe function to get initials
    const getInitials = (name: string): string => {
        if (!name || name === "Unnamed Organizer") return "UO"
        const parts = name.split(" ").slice(0, 2)
        return parts.map((n) => n[0] || "").join("").toUpperCase()
    }

    // Safe function to get email
    const getEmail = (org: Organizer): string => {
        return org?.email || "No email provided"
    }

    // Safe function to get phone
    const getPhone = (org: Organizer): string => {
        return org?.phone || "Not provided"
    }

    // Safe function to get organization
    const getOrganization = (org: Organizer): string => {
        if (org?.organizationName && typeof org.organizationName === 'string' && org.organizationName.trim()) {
            return org.organizationName
        }
        if (org?.company && typeof org.company === 'string' && org.company.trim()) {
            return org.company
        }
        return "N/A"
    }

    // Safe function to get website
    const getWebsite = (org: Organizer): string => {
        return org?.website || "N/A"
    }

    // Safe function to get location
    const getLocation = (org: Organizer): string => {
        return org?.location || "Not specified"
    }

    const pendingOrganizers = organizers.filter(o => !o.isVerified)
    const activeOrganizers = organizers.filter(o => o.isVerified && o.isActive)

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "pending" | "active")} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="pending" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Pending
                        {pendingOrganizers.length > 0 && (
                            <Badge variant="secondary" className="ml-1 bg-yellow-100 text-yellow-800">
                                {pendingOrganizers.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="active" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Active
                        {activeOrganizers.length > 0 && (
                            <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800">
                                {activeOrganizers.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6">
                    {pendingOrganizers.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No Pending Organizers</h3>
                            <p className="text-gray-500">All organizer registrations have been reviewed.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingOrganizers.map((organizer) => {
                                const name = getOrganizerName(organizer)
                                return (
                                    <OrganizerCard
                                        key={organizer.id}
                                        organizer={organizer}
                                        name={name}
                                        onView={() => {
                                            setSelectedOrganizer(organizer)
                                            setDetailsDialogOpen(true)
                                        }}
                                        onApprove={() => handleApprove(organizer.id)}
                                        onReject={() => {
                                            setSelectedOrganizer(organizer)
                                            setRejectDialogOpen(true)
                                        }}
                                        isProcessing={processingId === organizer.id}
                                        getInitials={getInitials}
                                        getEmail={getEmail}
                                        getPhone={getPhone}
                                        getOrganization={getOrganization}
                                        getWebsite={getWebsite}
                                    />
                                )
                            })}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="active" className="mt-6">
                    {activeOrganizers.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No Active Organizers</h3>
                            <p className="text-gray-500">No approved organizers found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeOrganizers.map((organizer) => {
                                const name = getOrganizerName(organizer)
                                return (
                                    <OrganizerCard
                                        key={organizer.id}
                                        organizer={organizer}
                                        name={name}
                                        isActive={true}
                                        onView={() => {
                                            setSelectedOrganizer(organizer)
                                            setDetailsDialogOpen(true)
                                        }}
                                        onApprove={() => { }}
                                        onReject={() => { }}
                                        isProcessing={false}
                                        getInitials={getInitials}
                                        getEmail={getEmail}
                                        getPhone={getPhone}
                                        getOrganization={getOrganization}
                                        getWebsite={getWebsite}
                                        showActions={false}
                                    />
                                )
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Organizer Details Dialog */}
            <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Organizer Details</DialogTitle>
                    </DialogHeader>
                    {selectedOrganizer && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={selectedOrganizer.avatar || undefined} />
                                    <AvatarFallback className="text-2xl">{getInitials(getOrganizerName(selectedOrganizer))}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-2xl font-bold">{getOrganizerName(selectedOrganizer)}</h2>
                                    <p className="text-gray-500">{getEmail(selectedOrganizer)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Phone</p>
                                    <p className="font-medium">{getPhone(selectedOrganizer)}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Website</p>
                                    <p className="font-medium">{getWebsite(selectedOrganizer)}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Location</p>
                                    <p className="font-medium">{getLocation(selectedOrganizer)}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Joined</p>
                                    <p className="font-medium">{new Date(selectedOrganizer.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {selectedOrganizer.description && (
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-2">Description</p>
                                    <p className="text-sm">{selectedOrganizer.description}</p>
                                </div>
                            )}
                        </div>
                    )}
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
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
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
    isActive = false,
    onView,
    onApprove,
    onReject,
    isProcessing,
    getInitials,
    getEmail,
    getPhone,
    getOrganization,
    getWebsite,
    showActions = true
}: any) {
    return (
        <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg">
            <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${isActive ? 'from-green-500 to-emerald-500' : 'from-yellow-500 to-orange-500'
                }`} />

            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                        <Avatar className="h-14 w-14 border-2 border-gray-100">
                            <AvatarImage src={organizer.avatar || undefined} alt={name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                                {getInitials(name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold">{name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Mail className="h-3.5 w-3.5 text-gray-400" />
                                <p className="text-sm text-gray-500">{getEmail(organizer)}</p>
                            </div>
                        </div>
                    </div>
                    {!isActive && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                        </Badge>
                    )}
                    {isActive && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <Check className="h-3 w-3 mr-1" />
                            Active
                        </Badge>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Organization:</span>
                        <span className="font-medium truncate">{getOrganization(organizer)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{getPhone(organizer)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Website:</span>
                        <span className="font-medium truncate">{getWebsite(organizer)}</span>
                    </div>
                </div>

                {showActions && (
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button variant="outline" size="sm" onClick={onView} className="gap-2">
                            <Eye className="h-4 w-4" />
                            Review Details
                        </Button>
                        <Button
                            size="sm"
                            onClick={onApprove}
                            disabled={isProcessing}
                            className="bg-green-600 hover:bg-green-700 text-white gap-2"
                        >
                            {isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4" />
                            )}
                            Approve
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={onReject}
                            disabled={isProcessing}
                            className="gap-2"
                        >
                            <X className="h-4 w-4" />
                            Reject
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    )
}