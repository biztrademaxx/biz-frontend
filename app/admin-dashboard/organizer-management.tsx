"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Building2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Download,
  MoreHorizontal,
  Plus,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { adminApi } from "@/lib/admin-api"
import { useToast } from "@/components/ui/use-toast"
import EntityBulkImport from "./entity-bulk-import"

interface Organizer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  avatar: string | null
  role: string
  isActive: boolean
  isVerified: boolean
  lastLogin: string | null
  createdAt: string
  updatedAt: string
  organizationName: string | null
  description: string | null
  headquarters: string | null
  founded: string | null
  teamSize: string | null
  specialties: string[]
  achievements: string[]
  certifications: string[]
  businessEmail: string | null
  businessPhone: string | null
  businessAddress: string | null
  taxId: string | null
  totalEvents: number
  activeEvents: number
  totalAttendees: number
  totalRevenue: number
  averageRating?: number | null
  totalReviews?: number | null
  location: string | null
  website: string | null
  linkedin: string | null
  twitter: string | null
  instagram: string | null
  timezone: string | null
  language: string | null
  _count?: {
    organizedEvents: number
    speakers: number
    exhibitors: number
    venueManagers: number
  }
}

interface TransformedOrganizer {
  id: string
  name: string
  email: string
  phone: string
  location: string
  joinDate: string
  totalEvents: number
  totalRevenue: number
  averageRating: number
  totalReviews: number
  avatar: string
  category: string
  description: string
  documents: string[]
  lastActive: string
  originalData: Organizer
}

const avatarColors = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
]

function getAvatarColor(name: string) {
  const idx = name.charCodeAt(0) % avatarColors.length
  return avatarColors[idx]
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function OrganizerManagement({ initialTab = "all" }: { initialTab?: "all" | "bulk-import" }) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [organizers, setOrganizers] = useState<Organizer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"all" | "bulk-import">(initialTab)

  useEffect(() => {
    fetchOrganizers()
  }, [])

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  const fetchOrganizers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminApi<{ success?: boolean; data?: Organizer[]; organizers?: Organizer[] }>("/organizers")
      const list = data?.data ?? (data as any)?.organizers ?? []
      setOrganizers(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error("Error fetching organizers:", err)
      setError("Failed to load organizers")
      toast({ title: "Error", description: "Failed to load organizers", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const transformOrganizerData = (organizer: Organizer): TransformedOrganizer => {
    const location = organizer.headquarters || organizer.businessAddress || "Location not specified"
    const eventCount = organizer._count?.organizedEvents ?? organizer.totalEvents ?? 0
    const avg = Number(organizer.averageRating ?? 0)
    const reviewCount = organizer.totalReviews ?? 0
    const documents =
      organizer.certifications && organizer.certifications.length > 0
        ? organizer.certifications
        : ["Business Registration", "Tax ID"]

    return {
      id: organizer.id,
      name: organizer.organizationName || `${organizer.firstName} ${organizer.lastName}`,
      email: organizer.email,
      phone: organizer.phone || organizer.businessPhone || "Not provided",
      location,
      joinDate: new Date(organizer.createdAt).toISOString().split("T")[0],
      totalEvents: eventCount,
      totalRevenue: organizer.totalRevenue || 0,
      averageRating: avg,
      totalReviews: reviewCount,
      avatar: organizer.avatar || "/city/c4.jpg",
      category: organizer.specialties?.[0] || "General Events",
      description: organizer.description || "No description provided",
      documents,
      lastActive: organizer.lastLogin
        ? new Date(organizer.lastLogin).toISOString().split("T")[0]
        : new Date(organizer.updatedAt).toISOString().split("T")[0],
      originalData: organizer,
    }
  }

  const filteredOrganizers: TransformedOrganizer[] = organizers
    .map(transformOrganizerData)
    .filter((organizer) => {
      const q = searchTerm.trim().toLowerCase()
      if (!q) return true
      return (
        organizer.name.toLowerCase().includes(q) ||
        organizer.email.toLowerCase().includes(q) ||
        organizer.category.toLowerCase().includes(q)
      )
    })

  const stats = {
    total: organizers.length,
    verified: organizers.filter((o) => o.isVerified).length,
    premium: organizers.filter((o) => o.isActive && o.isVerified).length,
    pending: organizers.filter((o) => !o.isVerified).length,
  }

  const handleExport = async () => {
    try {
      interface ExportResponse { csv?: string; data?: any[] }
      const response = await adminApi<ExportResponse>('/organizers/export', { method: 'GET' })
      const csv = response.csv || JSON.stringify(response, null, 2)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'organizers.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast({ title: "Success", description: "Data exported successfully!" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to export data", variant: "destructive" })
    }
  }

  const handleSendMessage = async (organizer: TransformedOrganizer) => {
    try {
      await adminApi("/organizers/send-account-email", {
        method: "POST",
        body: { organizerId: organizer.id },
      })
      toast({ title: "Email sent", description: `Account email sent to ${organizer.email}` })
    } catch (error: any) {
      toast({ title: "Failed to send email", description: error?.message || "Could not send organizer email", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-7 w-7 border-2 border-gray-900 border-t-transparent mx-auto" />
          <p className="text-sm text-gray-400 tracking-wide">Loading organizers…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center space-y-3">
          <p className="text-sm font-medium text-red-500">{error}</p>
          <button onClick={fetchOrganizers} className="text-sm underline text-gray-600">Try Again</button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen p-8"
      style={{ background: "#F5F4F0", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-gray-400 mb-1">Admin Panel</p>
          <h1 className="text-2xl font-semibold text-gray-900">Organizers</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "TOTAL ORGANIZERS", value: stats.total.toLocaleString(), sub: "+142 this month", subColor: "text-emerald-600" },
          { label: "VERIFIED", value: stats.verified.toLocaleString(), sub: `${Math.round((stats.verified / Math.max(stats.total, 1)) * 100)}% verified`, subColor: "text-emerald-600" },
          { label: "PREMIUM", value: stats.premium.toLocaleString(), sub: "+22 upgraded", subColor: "text-emerald-600" },
          { label: "PENDING VERIFY", value: stats.pending.toLocaleString(), sub: "Needs action", subColor: "text-gray-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 border border-gray-100">
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-2">{s.label}</p>
            <p className="text-3xl font-semibold text-gray-900" style={{ fontFamily: "'DM Mono', monospace" }}>{s.value}</p>
            <p className={`text-xs mt-1 font-medium ${s.subColor}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "bulk-import")}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-white border border-gray-200 rounded-lg p-1 gap-1">
            <TabsTrigger
              value="all"
              className="text-sm px-4 py-1.5 rounded-md data-[state=active]:bg-gray-900 data-[state=active]:text-white text-gray-500"
            >
              All Organizers
            </TabsTrigger>
            <TabsTrigger
              value="bulk-import"
              className="text-sm px-4 py-1.5 rounded-md data-[state=active]:bg-gray-900 data-[state=active]:text-white text-gray-500"
            >
              Bulk Import
            </TabsTrigger>
          </TabsList>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              placeholder="Search organizers…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 w-64"
            />
          </div>
        </div>

        <TabsContent value="all">
          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="w-10 px-5 py-3">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">Organizer</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">Plan</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">Events Listed</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">Total Attendees</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">Status</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrganizers.map((organizer) => {
                  const isVerified = organizer.originalData.isVerified
                  const isActive = organizer.originalData.isActive
                  const isPremium = isVerified && isActive
                  const initials = getInitials(organizer.name)
                  const colorClass = getAvatarColor(organizer.name)

                  return (
                    <tr key={organizer.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${colorClass}`}>
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{organizer.name}</p>
                            <p className="text-xs text-gray-400">{organizer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {isPremium ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Basic
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>
                        {organizer.totalEvents}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>
                        {organizer.originalData.totalAttendees?.toLocaleString() || "—"}
                      </td>
                      <td className="px-4 py-4">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {new Date(organizer.joinDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {/* {!isVerified && (
                            <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors">
                              Verify
                            </button>
                          )} */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                                View
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Organizer Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold ${colorClass}`}>
                                    {initials}
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-semibold">{organizer.name}</h3>
                                    <p className="text-gray-500 text-sm">{organizer.category}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Contact</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex items-center gap-2 text-gray-700"><Mail className="w-4 h-4 text-gray-400" />{organizer.email}</div>
                                      <div className="flex items-center gap-2 text-gray-700"><Phone className="w-4 h-4 text-gray-400" />{organizer.phone}</div>
                                      <div className="flex items-center gap-2 text-gray-700"><MapPin className="w-4 h-4 text-gray-400" />{organizer.location}</div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Performance</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex items-center gap-2 text-gray-700"><Calendar className="w-4 h-4 text-gray-400" />{organizer.totalEvents} Events</div>
                                      <div className="flex items-center gap-2 text-gray-700"><DollarSign className="w-4 h-4 text-gray-400" />₹{organizer.totalRevenue.toLocaleString()} Revenue</div>
                                      <div className="flex items-center gap-2 text-gray-700">
                                        <Star className="w-4 h-4 text-amber-400" />
                                        {organizer.totalReviews > 0 ? `${organizer.averageRating.toFixed(1)} (${organizer.totalReviews} reviews)` : "No reviews yet"}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">Description</h4>
                                  <p className="text-sm text-gray-600">{organizer.description}</p>
                                </div>
                                <div>
                                  <h4 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">Documents</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {organizer.documents.map((doc, i) => (
                                      <span key={i} className="text-xs px-2.5 py-1 bg-gray-100 rounded-full text-gray-600">{doc}</span>
                                    ))}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-400 flex gap-4">
                                  <span>Joined: {new Date(organizer.joinDate).toLocaleDateString()}</span>
                                  <span>Last Active: {new Date(organizer.lastActive).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          {/* <button
                            onClick={() => handleSendMessage(organizer)}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            Events
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredOrganizers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-sm text-gray-400">
                      No organizers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="bulk-import">
          <EntityBulkImport
            title="Organizer Bulk Import"
            description="Import organizers using all core add-organizer fields."
            endpoint="/organizers/import"
            templateHeaders={[
              "firstName", "lastName", "email", "phone", "organizationName", "description",
              "city", "state", "country", "founded", "teamSize", "specialties",
              "businessEmail", "businessPhone", "businessAddress", "taxId", "isActive",
            ]}
            sampleRow={[
              "John", "Doe", "john@eventco.com", "+1 555 000 1000", "EventCo",
              "Corporate event specialists", "San Francisco", "California", "United States",
              "2018", "11-50", "Corporate Events|Conferences", "contact@eventco.com",
              "+1 555 000 1010", "Market Street, SF", "GST-1099", "true",
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}