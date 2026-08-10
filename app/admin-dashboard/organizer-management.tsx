"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { uploadVenueLogo } from "@/lib/upload-utils"
import { AdminTableAvatar } from "@/components/admin-dashboard/admin-table-avatar"
import { OrganizerLocationSelects } from "@/components/admin-dashboard/organizer-location-selects"
import { hasUsableProfileImage } from "@/lib/has-usable-profile-image"
import { resolveOrganizerLocationFields } from "@/lib/organizer-location-resolve"
import { getPublicProfilePath } from "@/lib/profile-path"
import { getPlanColor, getPlanDisplayName } from "@/lib/subscription-features"

interface Organizer {
  company: string | null
  publicSlug?: string | null
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
  organizerCountry: string | null
  organizerState: string | null
  organizerCity: string | null
  profileCountry?: string | null
  profileState?: string | null
  profileCity?: string | null
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
  /** Active ORGANIZER subscription from UserPlanSubscription (defaults to free). */
  planSlug?: string | null
  planName?: string | null
  planTier?: "free" | "silver" | "gold" | "platinum" | string | null
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

interface OrganizerEditFormData {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar: string
  organizationName: string
  company: string
  description: string
  headquarters: string
  founded: string
  teamSize: string
  website: string
  businessEmail: string
  businessPhone: string
  businessAddress: string
  taxId: string
  organizerCountry: string
  organizerState: string
  organizerCity: string
}

const avatarColors = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
]

function getAvatarColor(company?: string) {
  if (!company) {
    return avatarColors[0]
  }

  const idx = company.length % avatarColors.length
  return avatarColors[idx]
}

function getInitials(company?: string) {
  if (!company) {
    return "UN"
  }

  return company
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}

// Keys used to persist "where the admin was" across the trip to the
// public organizer profile page and back, since the admin dashboard is a
// single-page app (no per-section URLs) and can't rely on query params.
const ORGANIZERS_RETURN_SECTION_KEY = "admin:returnSection"
const ORGANIZERS_LIST_STATE_KEY = "admin:organizers:listState"

export default function OrganizerManagement({ initialTab = "all" }: { initialTab?: "all" | "bulk-import" }) {
  const PAGE_SIZE = 10
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("all")
  const [countries, setCountries] = useState<Array<{ id: string; name: string; isActive?: boolean }>>([])
  const [organizers, setOrganizers] = useState<Organizer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [listStats, setListStats] = useState({
    total: 0,
    verified: 0,
    premium: 0,
    pending: 0,
  })
  const [activeTab, setActiveTab] = useState<"all" | "bulk-import">(initialTab)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sendingEmailFor, setSendingEmailFor] = useState<string | null>(null)
  const [bulkSending, setBulkSending] = useState(false)
  const [bulkApproving, setBulkApproving] = useState(false)
  const [editingOrganizer, setEditingOrganizer] = useState<OrganizerEditFormData | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  // Gates the debounced fetch effect until we've had a chance to restore
  // saved list state from sessionStorage, so it doesn't fetch page 1 first.
  const [hydratedFromUrl, setHydratedFromUrl] = useState(false)

  const fetchOrganizerStats = async () => {
    try {
      let page = 1;
      const limit = 500;
      let allOrganizers: Organizer[] = [];
      let totalPages = 1;

      do {
        const res = await adminApi<{
          data: Organizer[];
          pagination: {
            totalPages: number;
          };
        }>(`/organizers?page=${page}&limit=${limit}`);

        allOrganizers.push(...(res.data || []));
        totalPages = res.pagination.totalPages;
        page++;
      } while (page <= totalPages);

      setListStats({
        total: allOrganizers.length,
        verified: allOrganizers.filter((o) => o.isVerified).length,
        premium: allOrganizers.filter((o) => o.isVerified && o.isActive).length,
        pending: allOrganizers.filter((o) => !o.isVerified).length,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Restore list state (page/search/country/tab) from sessionStorage on
  // mount. This is set right before navigating to a profile page, so coming
  // back lands on the exact same page/search/tab/filter instead of resetting.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(ORGANIZERS_LIST_STATE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as {
          page?: number
          search?: string
          country?: string
          tab?: "all" | "bulk-import"
        }
        if (saved.page) setCurrentPage(saved.page)
        if (saved.search) setSearchTerm(saved.search)
        if (saved.country) setSelectedCountry(saved.country)
        if (saved.tab === "all" || saved.tab === "bulk-import") setActiveTab(saved.tab)
        sessionStorage.removeItem(ORGANIZERS_LIST_STATE_KEY)
      }
    } catch {
      /* ignore malformed/blocked storage */
    }
    setHydratedFromUrl(true)
  }, [])

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await adminApi<Array<{ id: string; name: string; isActive?: boolean }>>("/countries")
        setCountries(Array.isArray(data) ? data.filter((c) => c.isActive !== false) : [])
      } catch {
        setCountries([])
      }
    }
    void loadCountries()
  }, [])

  useEffect(() => {
    if (!hydratedFromUrl) return
    const timer = setTimeout(() => {
      fetchOrganizers(currentPage, searchTerm, selectedCountry)
    }, 250)

    return () => clearTimeout(timer)
  }, [currentPage, searchTerm, selectedCountry, hydratedFromUrl])

  useEffect(() => {
    fetchOrganizerStats();
  }, []);

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  const fetchOrganizers = async (pageArg?: number, searchArg?: string, countryArg?: string) => {
    try {
      const page = typeof pageArg === "number" ? pageArg : currentPage
      setLoading(true)
      setError(null)
      const query = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      })
      const trimmedSearch = (searchArg ?? searchTerm ?? "").trim()
      if (trimmedSearch) {
        query.set("search", trimmedSearch)
      }
      const country = (countryArg ?? selectedCountry ?? "all").trim()
      if (country && country !== "all") {
        query.set("country", country)
      }
      const data = await adminApi<{
        success?: boolean
        data?: Organizer[]
        organizers?: Organizer[]
        pagination?: { page?: number; limit?: number; total?: number; totalPages?: number }
        stats?: { total?: number; verified?: number; premium?: number; pending?: number }
      }>(`/organizers?${query.toString()}`)
      const list = data?.data ?? (data as any)?.organizers ?? []
      setOrganizers(Array.isArray(list) ? list : [])
      const incomingTotal = Number(data?.pagination?.total ?? list?.length ?? 0)
      const incomingPages = Math.max(1, Number(data?.pagination?.totalPages ?? 1))
      setTotalItems(Number.isFinite(incomingTotal) ? incomingTotal : 0)
      setTotalPages(incomingPages)
      if (page > incomingPages) {
        setCurrentPage(incomingPages)
      }
      setSelectedIds(new Set())
    } catch (err) {
      console.error("Error fetching organizers:", err)
      setError("Failed to load organizers")
      toast({ title: "Error", description: "Failed to load organizers", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveOrganizer = async (organizerId: string) => {
    try {
      await adminApi(`/organizers/${organizerId}`, {
        method: "PATCH",
        body: { isVerified: true, isActive: true },
      })
      toast({ title: "Approved", description: "Organizer can now sign in and use the platform." })
      await fetchOrganizers(currentPage, searchTerm)
    } catch (e: any) {
      toast({
        title: "Approval failed",
        description: e?.message || "Could not approve organizer",
        variant: "destructive",
      })
    }
  }

  const formatOrganizerLocation = (organizer: Organizer): string => {
    if (organizer.location?.trim()) return organizer.location.trim()
    const parts = [organizer.organizerCity, organizer.organizerState, organizer.organizerCountry]
      .map((p) => p?.trim())
      .filter(Boolean)
    if (parts.length > 0) return parts.join(", ")
    if (organizer.headquarters?.trim()) return organizer.headquarters.trim()
    if (organizer.businessAddress?.trim()) return organizer.businessAddress.trim()
    return "Location not specified"
  }

  const transformOrganizerData = (organizer: Organizer): TransformedOrganizer => {
    const location = formatOrganizerLocation(organizer)
    const eventCount = organizer._count?.organizedEvents ?? organizer.totalEvents ?? 0
    const avg = Number(organizer.averageRating ?? 0)
    const reviewCount = organizer.totalReviews ?? 0
    const documents =
      organizer.certifications && organizer.certifications.length > 0
        ? organizer.certifications
        : ["Business Registration", "Tax ID"]

    return {
      id: organizer.id,
      name:
        organizer.organizationName?.trim() ||
        organizer.company?.trim() ||
        `${organizer.firstName || ""} ${organizer.lastName || ""}`.trim() ||
        "Unknown Organizer",
      email: organizer.email,
      phone: organizer.phone || organizer.businessPhone || "Not provided",
      location,
      joinDate: new Date(organizer.createdAt).toISOString().split("T")[0],
      totalEvents: eventCount,
      totalRevenue: organizer.totalRevenue || 0,
      averageRating: avg,
      totalReviews: reviewCount,
      avatar: organizer.avatar || "",
      category: organizer.specialties?.[0] || "General Events",
      description: organizer.description || "No description provided",
      documents,
      lastActive: organizer.lastLogin
        ? new Date(organizer.lastLogin).toISOString().split("T")[0]
        : new Date(organizer.updatedAt).toISOString().split("T")[0],
      originalData: organizer,
    }
  }

  const visibleOrganizers: TransformedOrganizer[] = organizers.map(transformOrganizerData)

  const getOrganizerProfilePath = (organizer: TransformedOrganizer) =>
    getPublicProfilePath("organizer", {
      id: organizer.id,
      publicSlug: organizer.originalData.publicSlug,
      organizationName: organizer.originalData.organizationName || organizer.name,
      company: organizer.originalData.company,
      firstName: organizer.originalData.firstName,
      lastName: organizer.originalData.lastName,
    })

  const handleOpenOrganizerProfile = (organizer: TransformedOrganizer) => {
    try {
      // Remember exactly where we are in this list so we can restore it.
      sessionStorage.setItem(
        ORGANIZERS_LIST_STATE_KEY,
        JSON.stringify({
          page: currentPage,
          search: searchTerm.trim(),
          country: selectedCountry,
          tab: activeTab,
        })
      )
      // Tell the dashboard shell which section/sub-section to reopen.
      sessionStorage.setItem(
        ORGANIZERS_RETURN_SECTION_KEY,
        JSON.stringify({ section: "organizers", sub: "organizers-all" })
      )
    } catch {
      /* ignore storage errors (e.g. private browsing) */
    }

    const profilePath = getOrganizerProfilePath(organizer)
    const separator = profilePath.includes("?") ? "&" : "?"
    router.push(`${profilePath}${separator}returnTo=${encodeURIComponent("/admin-dashboard")}`)
  }

  const stats = {
    total: listStats.total || totalItems,
    verified: listStats.verified,
    premium: listStats.premium,
    pending: listStats.pending,
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

  const sendAccountEmail = async (organizer: { id: string; email: string }) => {
    if (!organizer.email?.trim()) {
      toast({ title: "No email", description: "This organizer has no email address.", variant: "destructive" })
      return false
    }
    await adminApi("/organizers/send-account-email", {
      method: "POST",
      body: { organizerId: organizer.id, organizerEmail: organizer.email },
    })
    return true
  }

  const handleSendAccountEmail = async (organizer: TransformedOrganizer) => {
    const key = organizer.id
    try {
      setSendingEmailFor(key)
      const ok = await sendAccountEmail(organizer)
      if (ok) {
        toast({ title: "Email sent", description: `Account access email sent to ${organizer.email}` })
      }
    } catch (error: unknown) {
      toast({
        title: "Failed to send email",
        description: error instanceof Error ? error.message : "Could not send organizer email",
        variant: "destructive",
      })
    } finally {
      setSendingEmailFor(null)
    }
  }

  const handleBulkSendEmail = async () => {
    const targets = visibleOrganizers.filter((o) => selectedIds.has(o.id))
    if (targets.length === 0) {
      toast({ title: "No selection", description: "Select at least one organizer.", variant: "destructive" })
      return
    }
    setBulkSending(true)
    let sent = 0
    let failed = 0
    for (const organizer of targets) {
      try {
        const ok = await sendAccountEmail(organizer)
        if (ok) sent += 1
        else failed += 1
      } catch {
        failed += 1
      }
    }
    setBulkSending(false)
    if (sent > 0) {
      toast({
        title: "Emails sent",
        description:
          failed > 0
            ? `Sent ${sent} email(s); ${failed} failed (missing email or server error).`
            : `Account access email sent to ${sent} organizer(s).`,
      })
    } else {
      toast({
        title: "Failed to send",
        description: "No emails were sent. Check organizer emails and SMTP configuration.",
        variant: "destructive",
      })
    }
  }

  const handleBulkApprove = async () => {
    const targets = visibleOrganizers.filter((o) => selectedIds.has(o.id) && !o.originalData.isVerified)
    if (targets.length === 0) {
      toast({
        title: "No pending selection",
        description: "Select at least one pending organizer to approve.",
        variant: "destructive",
      })
      return
    }

    setBulkApproving(true)
    let approved = 0
    let failed = 0

    for (const organizer of targets) {
      try {
        await adminApi(`/organizers/${organizer.id}`, {
          method: "PATCH",
          body: { isVerified: true, isActive: true },
        })
        approved += 1
      } catch {
        failed += 1
      }
    }

    setBulkApproving(false)

    if (approved > 0) {
      toast({
        title: "Bulk approval complete",
        description:
          failed > 0
            ? `Approved ${approved} organizer(s); ${failed} failed.`
            : `Approved ${approved} organizer(s).`,
      })
      await fetchOrganizers(currentPage, searchTerm)
    } else {
      toast({
        title: "Approval failed",
        description: "Could not approve selected organizers.",
        variant: "destructive",
      })
    }
  }

  const buildEditFormFromOrganizer = (source: Organizer): OrganizerEditFormData => {
    const loc = resolveOrganizerLocationFields(source)
    const normalizedCompany =
      source.company?.trim() ||
      source.organizationName?.trim() ||
      `${source.firstName || ""} ${source.lastName || ""}`.trim()
    return {
      id: source.id,
      firstName: source.firstName || "",
      lastName: source.lastName || "",
      email: source.email || "",
      phone: source.phone || "",
      avatar: source.avatar || "",
      organizationName: source.organizationName || "",
      company: normalizedCompany,
      description: source.description || "",
      headquarters: source.headquarters || "",
      founded: source.founded || "",
      teamSize: source.teamSize || "",
      website: source.website || "",
      businessEmail: source.businessEmail || "",
      businessPhone: source.businessPhone || "",
      businessAddress: source.businessAddress || "",
      taxId: source.taxId || "",
      organizerCountry: loc.organizerCountry,
      organizerState: loc.organizerState,
      organizerCity: loc.organizerCity,
    }
  }

  const handleOpenEdit = async (organizer: TransformedOrganizer) => {
    setAvatarFile(null)
    setIsEditDialogOpen(true)
    setEditingOrganizer(buildEditFormFromOrganizer(organizer.originalData))

    try {
      const detail = await adminApi<{ data?: Organizer }>(`/organizers/${organizer.id}`)
      if (detail?.data) {
        setEditingOrganizer(buildEditFormFromOrganizer(detail.data))
      }
    } catch {
      /* keep list row data */
    }
  }

  const handleEditField = (field: keyof OrganizerEditFormData, value: string) => {
    setEditingOrganizer((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleSaveEdit = async () => {
    if (!editingOrganizer) return
    try {
      setSavingEdit(true)
      let avatarUrl = editingOrganizer.avatar.trim()
      if (avatarFile) {
        avatarUrl = await uploadVenueLogo(avatarFile)
      }
      await adminApi(`/organizers/${editingOrganizer.id}`, {
        method: "PATCH",
        body: {
          firstName: editingOrganizer.firstName.trim(),
          lastName: editingOrganizer.lastName.trim(),
          email: editingOrganizer.email.trim(),
          phone: editingOrganizer.phone.trim() || null,
          avatar: avatarUrl || null,
          organizationName: editingOrganizer.organizationName.trim() || null,
          company: editingOrganizer.company.trim() || null,
          description: editingOrganizer.description.trim() || null,
          headquarters: editingOrganizer.headquarters.trim() || null,
          organizerCountry: editingOrganizer.organizerCountry.trim() || null,
          organizerState: editingOrganizer.organizerState.trim() || null,
          organizerCity: editingOrganizer.organizerCity.trim() || null,
          founded: editingOrganizer.founded.trim() || null,
          teamSize: editingOrganizer.teamSize.trim() || null,
          website: editingOrganizer.website.trim() || null,
          businessEmail: editingOrganizer.businessEmail.trim() || null,
          businessPhone: editingOrganizer.businessPhone.trim() || null,
          businessAddress: editingOrganizer.businessAddress.trim() || null,
          taxId: editingOrganizer.taxId.trim() || null,
        },
      })
      toast({ title: "Updated", description: "Organizer details updated successfully." })
      setIsEditDialogOpen(false)
      await fetchOrganizers(currentPage, searchTerm)
    } catch (e: any) {
      toast({
        title: "Update failed",
        description: e?.message || "Could not update organizer details.",
        variant: "destructive",
      })
    } finally {
      setSavingEdit(false)
    }
  }

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(visibleOrganizers.map((o) => o.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const toggleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const allVisibleSelected =
    visibleOrganizers.length > 0 && visibleOrganizers.every((o) => selectedIds.has(o.id))

  const showFullPageLoader = loading && organizers.length === 0

  if (showFullPageLoader) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-7 w-7 border-2 border-gray-900 border-t-transparent mx-auto" />
          <p className="text-sm text-gray-400 tracking-wide">Loading organizers…</p>
        </div>
      </div>
    )
  }

  if (error && organizers.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center space-y-3">
          <p className="text-sm font-medium text-red-500">{error}</p>
          <button onClick={() => fetchOrganizers(currentPage, searchTerm)} className="text-sm underline text-gray-600">Try Again</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-gray-400 mb-1">Admin Panel</p>
          <h1 className="text-2xl font-semibold text-gray-900">Organizers</h1>
        </div>
        <div className="flex gap-2">
          {activeTab === "all" && selectedIds.size > 0 && (
            <>
              <button
                type="button"
                onClick={handleBulkApprove}
                disabled={bulkApproving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60"
              >
                <CheckCircle className="w-4 h-4" />
                {bulkApproving ? "Approving…" : `Approve selected (${selectedIds.size})`}
              </button>
              <button
                type="button"
                onClick={handleBulkSendEmail}
                disabled={bulkSending || bulkApproving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60"
              >
                <Mail className="w-4 h-4" />
                {bulkSending ? "Sending…" : `Send email (${selectedIds.size})`}
              </button>
            </>
          )}
          <button
            type="button"
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
          { label: "TOTAL ORGANIZERS", value: stats.total.toLocaleString(), subColor: "text-emerald-600" },
          { label: "VERIFIED", value: stats.verified.toLocaleString(), subColor: "text-emerald-600" },
          { label: "PREMIUM", value: stats.premium.toLocaleString(), subColor: "text-emerald-600" },
          { label: "PENDING VERIFY", value: stats.pending.toLocaleString(), subColor: "text-gray-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 border border-gray-100">
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-2">{s.label}</p>
            <p className="font-mono text-3xl font-semibold tabular-nums text-gray-900">{s.value}</p>
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

          <div className="flex items-center gap-2">
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value)
                setCurrentPage(1)
              }}
              className="h-9 min-w-[160px] rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              aria-label="Filter organizers by country"
            >
              <option value="all">All Countries</option>
              {countries.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                placeholder="Search organizers…"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 w-64"
              />
            </div>
          </div>
        </div>

        <TabsContent value="all">
          {/* Table */}
          <div className={`bg-white rounded-xl border border-gray-100 overflow-hidden ${loading ? "opacity-60" : ""}`}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="w-10 px-5 py-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={allVisibleSelected}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      aria-label="Select all organizers"
                    />
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
                {visibleOrganizers.map((organizer) => {
                  const isVerified = organizer.originalData.isVerified
                  const planSlug = organizer.originalData.planSlug || "organizer-free"
                  const planLabel = getPlanDisplayName(planSlug)
                  const planColors = getPlanColor(planSlug)
                  const colorClass = getAvatarColor(organizer.name)

                  return (
                    <tr key={organizer.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedIds.has(organizer.id)}
                          onChange={(e) => toggleSelectOne(organizer.id, e.target.checked)}
                          aria-label={`Select ${organizer.name}`}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <AdminTableAvatar
                            src={organizer.avatar}
                            name={organizer.name}
                            colorClass={colorClass}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 hover:text-[#004A96] hover:underline">
                              {organizer.name}
                            </p>
                            <p className="text-xs text-gray-400">{organizer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: planColors.bg, color: planColors.text }}
                          title={organizer.originalData.planName || planLabel}
                        >
                          {planLabel}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono text-sm font-medium tabular-nums text-gray-700">
                        {organizer.totalEvents}
                      </td>
                      <td className="px-4 py-4 font-mono text-sm font-medium tabular-nums text-gray-700">
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
                          {!isVerified && (
                            <button
                              type="button"
                              onClick={() => handleApproveOrganizer(organizer.id)}
                              disabled={bulkApproving}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSendAccountEmail(organizer)}
                            disabled={!organizer.email || sendingEmailFor === organizer.id || bulkSending}
                            className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            title="Send account access email with password reset link"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            {sendingEmailFor === organizer.id ? "Sending…" : "Send email"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenOrganizerProfile(organizer)}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(organizer)}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {visibleOrganizers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-sm text-gray-400">
                      No organizers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-4 px-1">
            <p className="text-xs text-gray-500">
              Showing page {currentPage} of {totalPages} ({totalItems.toLocaleString()} organizers)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage <= 1 || loading}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages || loading}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bulk-import">
          <EntityBulkImport
            title="Organizer Bulk Import"
            description="Import organizers with organization contact and location. Row 1 must use template column names (required: email). Uploading again updates country, state, and city for existing organizers matched by email."
            endpoint="/organizers/import"
            templateHeaders={[
              "Organization Name",
              "email",
              "phone number",
              "website",
              "country",
              "state",
              "city",
              "company headquarters address",
            ]}
            sampleRow={[
              "Acme Trade Fairs",
              "contact@acmetradefairs.com",
              "+1 555 010 0200",
              "https://acmetradefairs.com",
              "United States",
              "California",
              "San Francisco",
              "123 Market Street, Suite 400, San Francisco, CA 94105",
            ]}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Organizer</DialogTitle>
          </DialogHeader>
          {editingOrganizer && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14 border">
                  <AvatarImage
                    src={
                      avatarFile
                        ? URL.createObjectURL(avatarFile)
                        : hasUsableProfileImage(editingOrganizer.avatar)
                          ? editingOrganizer.avatar || undefined
                          : undefined
                    }
                    alt={editingOrganizer.organizationName || "Organizer"}
                  />
                  <AvatarFallback>{getInitials(editingOrganizer.organizationName || editingOrganizer.company)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Image URL</label>
                  <input
                    value={editingOrganizer.avatar}
                    onChange={(e) => handleEditField("avatar", e.target.value)}
                    placeholder="https://..."
                    className="w-full mt-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                  <label className="text-xs text-gray-500 mt-3 block">Or Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                    className="w-full mt-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Company</label>
                  <input value={editingOrganizer.company} onChange={(e) => handleEditField("company", e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Website</label>
                  <input value={editingOrganizer.website} onChange={(e) => handleEditField("website", e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500">Headquarters</label>
                  <input value={editingOrganizer.headquarters} onChange={(e) => handleEditField("headquarters", e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg" />
                </div>
              </div>

              <OrganizerLocationSelects
                labelClassName="text-xs text-gray-500"
                country={editingOrganizer.organizerCountry}
                state={editingOrganizer.organizerState}
                city={editingOrganizer.organizerCity}
                onCountryChange={(name) => handleEditField("organizerCountry", name)}
                onStateChange={(name) => handleEditField("organizerState", name)}
                onCityChange={(name) => handleEditField("organizerCity", name)}
                disabled={savingEdit}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Founded</label>
                  <input value={editingOrganizer.founded} onChange={(e) => handleEditField("founded", e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Team Size</label>
                  <input value={editingOrganizer.teamSize} onChange={(e) => handleEditField("teamSize", e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Business Email</label>
                  <input value={editingOrganizer.businessEmail} onChange={(e) => handleEditField("businessEmail", e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Business Phone</label>
                  <input value={editingOrganizer.businessPhone} onChange={(e) => handleEditField("businessPhone", e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500">Business Address</label>
                <textarea value={editingOrganizer.businessAddress} onChange={(e) => handleEditField("businessAddress", e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Description</label>
                <textarea value={editingOrganizer.description} onChange={(e) => handleEditField("description", e.target.value)} rows={3} className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Tax ID</label>
                <input value={editingOrganizer.taxId} onChange={(e) => handleEditField("taxId", e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={savingEdit}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSaveEdit} disabled={savingEdit}>
                  {savingEdit ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}