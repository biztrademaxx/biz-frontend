"use client"

import { devLog } from "@/lib/dev-log"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Download,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  FileText,
  Sparkles,
  ArrowLeft,
} from "lucide-react"
import { adminApi } from "@/lib/admin-api"
import { VisitorSuggestionsAdmin } from "./visitors/VisitorSuggestions"

interface Visitor {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  company?: string
  jobTitle?: string
  location?: string
  bio?: string
  website?: string
  social: { linkedin?: string; twitter?: string; instagram?: string }
  isVerified: boolean
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
  stats: {
    totalRegistrations: number
    confirmedRegistrations: number
    totalConnections: number
    acceptedConnections: number
    totalAppointments: number
    completedAppointments: number
    savedEvents: number
  }
}

interface PaginationInfo { page: number; limit: number; total: number; totalPages: number }

interface VisitorDetails extends Visitor {
  registrations: Array<{ id: string; event: { id: string; title: string; startDate: string; endDate: string }; status: string; registeredAt: string }>
  connections: Array<{ id: string; type: "sent" | "received"; user: { id: string; name: string; email: string; company?: string }; status: string; createdAt: string }>
  appointments: Array<{ id: string; title: string; exhibitor: { id: string; name: string; company?: string }; event?: { id: string; title: string }; status: string; requestedDate: string }>
  savedEvents: Array<{ id: string; event: { id: string; title: string; startDate: string } }>
}

const avatarColors = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
]
function getAvatarColor(name: string) { return avatarColors[name.charCodeAt(0) % avatarColors.length] }
function getInitials(name: string) { return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) }

export default function VisitorManagement() {
  const router = useRouter()
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorDetails | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false)
  const [suggestionsVisitor, setSuggestionsVisitor] = useState<{ id: string; name: string } | null>(null)
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, total: 0, totalPages: 0 })

  const fetchVisitors = async () => {
    try {
      setLoading(true); setError("")
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      })
      const result = await adminApi<{ success?: boolean; data?: { visitors: Visitor[]; pagination: PaginationInfo }; error?: string }>(`/visitors?${params}`)
      if (result.success && result.data) {
        const validatedVisitors = (result.data.visitors ?? []).map((visitor: any) => ({
          ...visitor,
          stats: {
            totalRegistrations: visitor.stats?.totalRegistrations ?? 0,
            confirmedRegistrations: visitor.stats?.confirmedRegistrations ?? 0,
            totalConnections: visitor.stats?.totalConnections ?? 0,
            acceptedConnections: visitor.stats?.acceptedConnections ?? 0,
            totalAppointments: visitor.stats?.totalAppointments ?? 0,
            completedAppointments: visitor.stats?.completedAppointments ?? 0,
            savedEvents: visitor.stats?.savedEvents ?? 0,
          },
        }))
        setVisitors(validatedVisitors)
        setPagination(result.data.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 })
      } else {
        setError((result as any).error ?? "Failed to fetch visitors")
      }
    } catch (err) { setError("Failed to fetch visitors"); console.error(err) }
    finally { setLoading(false) }
  }

  const fetchVisitorDetails = async (visitorId: string) => {
    try {
      setError("")
      const result = await adminApi<{ success?: boolean; data?: VisitorDetails; error?: string }>(`/visitors/${visitorId}`)
      if (result.success && result.data) { setSelectedVisitor(result.data); setShowDetailsModal(true) }
      else { setError((result as any).error ?? "Failed to fetch visitor details") }
    } catch (err) { setError("Failed to fetch visitor details"); console.error(err) }
  }

  const exportToExcel = async () => {
    try {
      setExportLoading(true); setError("")
      const params = new URLSearchParams({ limit: "10000", ...(searchTerm && { search: searchTerm }), ...(statusFilter !== "all" && { status: statusFilter }) })
      const result = await adminApi<{ success?: boolean; data?: { visitors: any[] }; error?: string }>(`/visitors?${params}`)
      if (result.success && result.data) {
        const visitorsData = result.data.visitors ?? []
        const headers = ["Name", "Email", "Phone", "Company", "Job Title", "Location", "Status", "Verified", "Total Events", "Confirmed Events", "Total Connections", "Accepted Connections", "Total Appointments", "Completed Appointments", "Saved Events", "Last Login", "Registered Date"]
        const csvContent = [
          headers.join(","),
          ...visitorsData.map((v: any) => [
            `"${(v.name || "").replace(/"/g, '""')}"`, `"${v.email || ""}"`, `"${v.phone || "N/A"}"`, `"${v.company || "N/A"}"`, `"${v.jobTitle || "N/A"}"`, `"${v.location || "N/A"}"`,
            `"${v.isActive ? "Active" : "Inactive"}"`, `"${v.isVerified ? "Yes" : "No"}"`,
            v.stats?.totalRegistrations || 0, v.stats?.confirmedRegistrations || 0, v.stats?.totalConnections || 0, v.stats?.acceptedConnections || 0,
            v.stats?.totalAppointments || 0, v.stats?.completedAppointments || 0, v.stats?.savedEvents || 0,
            `"${v.lastLogin ? new Date(v.lastLogin).toLocaleDateString() : "Never"}"`, `"${new Date(v.createdAt).toLocaleDateString()}"`,
          ].join(",")),
        ].join("\n")
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        link.setAttribute("href", URL.createObjectURL(blob))
        link.setAttribute("download", `visitors_${new Date().toISOString().split("T")[0]}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link); link.click(); document.body.removeChild(link)
      } else { setError("Failed to export visitors") }
    } catch (err) { setError("Failed to export visitors"); console.error(err) }
    finally { setExportLoading(false) }
  }

  useEffect(() => { fetchVisitors() }, [pagination.page, statusFilter])
  useEffect(() => {
    const t = setTimeout(() => {
      if (pagination.page === 1) fetchVisitors()
      else setPagination((p) => ({ ...p, page: 1 }))
    }, 500)
    return () => clearTimeout(t)
  }, [searchTerm])

  useEffect(() => {
    const handleClickOutside = () => { if (showActionsMenu) setShowActionsMenu(null) }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [showActionsMenu])

  const handlePageChange = (newPage: number) => setPagination((p) => ({ ...p, page: newPage }))

  const handleStatusToggle = async (visitorId: string, currentStatus: boolean) => {
    try {
      await adminApi(`/visitors/${visitorId}`, { method: "PATCH", body: { isActive: !currentStatus } })
      setVisitors((prev) => prev.map((v) => v.id === visitorId ? { ...v, isActive: !currentStatus } : v))
      setShowActionsMenu(null)
    } catch (error) { console.error("Error updating visitor status:", error); setError("Failed to update visitor status") }
  }

  const handleViewDetails = (visitorId: string) => { fetchVisitorDetails(visitorId); setShowActionsMenu(null) }
  const handleViewSuggestions = (visitorId: string, visitorName: string) => { setSuggestionsVisitor({ id: visitorId, name: visitorName }); setShowSuggestionsModal(true); setShowActionsMenu(null) }
  const handleEditVisitor = (visitorId: string) => { devLog("Edit visitor:", visitorId); setShowActionsMenu(null) }
  const handleDeleteVisitor = async (visitorId: string) => {
    if (confirm("Are you sure you want to delete this visitor? This action cannot be undone.")) {
      try {
        await adminApi(`/visitors/${visitorId}`, { method: "DELETE" })
        setVisitors((prev) => prev.filter((v) => v.id !== visitorId))
      } catch (error) { console.error("Error deleting visitor:", error); setError("Failed to delete visitor") }
    }
    setShowActionsMenu(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" style={{ background: "#F5F4F0" }}>
        <div className="animate-spin rounded-full h-7 w-7 border-2 border-gray-900 border-t-transparent" />
      </div>
    )
  }

  // Derive summary stats from loaded data
  const totalActive = visitors.filter((v) => v.isActive).length
  const totalVerified = visitors.filter((v) => v.isVerified).length
  const totalInactive = visitors.filter((v) => !v.isActive).length

  return (
    <div className="min-h-screen p-8" style={{ background: "#F5F4F0", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-gray-400 mb-1">Admin Panel</p>
          <h1 className="text-2xl font-semibold text-gray-900">Visitor Management</h1>
        </div>
        <button
          onClick={exportToExcel}
          disabled={exportLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {exportLoading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" /> : <Download className="w-4 h-4" />}
          {exportLoading ? "Exporting…" : "Export to Excel"}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "TOTAL VISITORS", value: pagination.total || visitors.length, sub: "All registered", subColor: "text-gray-400" },
          { label: "ACTIVE", value: totalActive, sub: "Currently active", subColor: "text-emerald-600" },
          { label: "VERIFIED", value: totalVerified, sub: `${Math.round((totalVerified / Math.max(visitors.length, 1)) * 100)}% verified`, subColor: "text-emerald-600" },
          { label: "INACTIVE", value: totalInactive, sub: "Needs action", subColor: "text-gray-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 border border-gray-100">
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-2">{s.label}</p>
            <p className="text-3xl font-semibold text-gray-900" style={{ fontFamily: "'DM Mono', monospace" }}>{s.value.toLocaleString()}</p>
            <p className={`text-xs mt-1 font-medium ${s.subColor}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, company…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
      )}

      {/* Visitors Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="w-10 px-5 py-3">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">Visitor</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">Company</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">Events</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">Connections</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">Status</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">Registered</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {visitors.map((visitor) => {
              const initials = getInitials(visitor.name)
              const colorClass = getAvatarColor(visitor.name)
              return (
                <tr key={visitor.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {visitor.avatar ? (
                        <img src={visitor.avatar} alt={visitor.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${colorClass}`}>
                          {initials}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-gray-900">{visitor.name}</p>
                          {visitor.isVerified && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                        </div>
                        <p className="text-xs text-gray-400">{visitor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {visitor.company ? (
                      <div>
                        <p className="text-sm text-gray-700">{visitor.company}</p>
                        {visitor.jobTitle && <p className="text-xs text-gray-400">{visitor.jobTitle}</p>}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>
                    {visitor.stats?.confirmedRegistrations ?? 0}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>
                    {visitor.stats?.acceptedConnections ?? 0}
                  </td>
                  <td className="px-4 py-4">
                    {visitor.isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {new Date(visitor.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(visitor.id)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleViewSuggestions(visitor.id, visitor.name)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors"
                      >
                        Suggest
                      </button>
                      <button
                        onClick={() => handleStatusToggle(visitor.id, visitor.isActive)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${visitor.isActive ? "border-red-200 text-red-600 hover:bg-red-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          }`}
                      >
                        {visitor.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowActionsMenu(showActionsMenu === visitor.id ? null : visitor.id) }}
                          className="p-1.5  text-gray-400 hover:bg-gray-50 transition-colors"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                        {showActionsMenu === visitor.id && (
                          <div className="absolute right-0 top-9 z-10 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 overflow-hidden">
                            <button onClick={() => handleViewDetails(visitor.id)} className="flex items-center gap-2 w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50">
                              <Eye className="w-3.5 h-3.5" /> View Details
                            </button>
                            <button onClick={() => handleViewSuggestions(visitor.id, visitor.name)} className="flex items-center gap-2 w-full px-4 py-2 text-xs text-amber-600 hover:bg-amber-50">
                              <Sparkles className="w-3.5 h-3.5" /> Suggestions
                            </button>
                            <button onClick={() => handleDeleteVisitor(visitor.id)} className="flex items-center gap-2 w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50">
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {visitors.length === 0 && !loading && (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              {searchTerm || statusFilter !== "all" ? "Try adjusting your search or filters" : "No visitors have registered yet"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">Page {pagination.page} of {pagination.totalPages}</span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedVisitor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-base font-semibold text-gray-900">Visitor Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                {selectedVisitor.avatar ? (
                  <img src={selectedVisitor.avatar} alt={selectedVisitor.name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold ${getAvatarColor(selectedVisitor.name)}`}>
                    {getInitials(selectedVisitor.name)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedVisitor.name}</h3>
                    {selectedVisitor.isVerified && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">Verified</span>}
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${selectedVisitor.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {selectedVisitor.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{selectedVisitor.email}</p>
                  {selectedVisitor.company && <p className="text-sm text-gray-400">{selectedVisitor.company}{selectedVisitor.jobTitle ? ` · ${selectedVisitor.jobTitle}` : ""}</p>}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Events", value: selectedVisitor.stats?.confirmedRegistrations || 0, color: "bg-blue-50 text-blue-600" },
                  { label: "Connections", value: selectedVisitor.stats?.acceptedConnections || 0, color: "bg-emerald-50 text-emerald-600" },
                  { label: "Meetings", value: selectedVisitor.stats?.completedAppointments || 0, color: "bg-violet-50 text-violet-600" },
                  { label: "Saved", value: selectedVisitor.stats?.savedEvents || 0, color: "bg-amber-50 text-amber-600" },
                ].map((s) => (
                  <div key={s.label} className={`${s.color} rounded-xl p-4 text-center`}>
                    <p className="text-2xl font-semibold" style={{ fontFamily: "'DM Mono', monospace" }}>{s.value}</p>
                    <p className="text-xs font-medium mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Phone", value: selectedVisitor.phone || "N/A" },
                  { label: "Location", value: selectedVisitor.location || "N/A" },
                  { label: "Bio", value: selectedVisitor.bio || "N/A", span: true },
                ].map((f) => (
                  <div key={f.label} className={f.span ? "col-span-2" : ""}>
                    <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1">{f.label}</p>
                    <p className="text-gray-700">{f.value}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => { setShowDetailsModal(false); handleViewSuggestions(selectedVisitor.id, selectedVisitor.name) }}
                className="w-full py-2.5 text-sm font-medium bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> View Exhibitor Suggestions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions Modal */}
      {showSuggestionsModal && suggestionsVisitor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center gap-3 z-10">
              <button onClick={() => setShowSuggestionsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-sm text-gray-600">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="text-base font-semibold text-gray-900">Exhibitor Suggestions — {suggestionsVisitor.name}</h2>
              <button onClick={() => setShowSuggestionsModal(false)} className="ml-auto p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <VisitorSuggestionsAdmin visitorId={suggestionsVisitor.id} visitorName={suggestionsVisitor.name} onClose={() => setShowSuggestionsModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}