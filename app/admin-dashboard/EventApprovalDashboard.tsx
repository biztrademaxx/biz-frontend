"use client"

import { useState, useEffect } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Eye,
  Check,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"
import EventDetailsPanel from "./EventDetailsModal"

interface Event {
  id: string
  title: string
  description: string
  shortDescription: string
  startDate: string
  endDate: string
  venue: string
  city: string
  state: string
  country: string
  status: string
  isVirtual: boolean
  currency: string
  organizer: {
    id: string
    name: string
    email: string
    company: string
    phone: string
  }
  ticketTypes: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  exhibitionSpaces: Array<{
    id: string
    name: string
    spaceType: string
    basePrice: number
    area: number
  }>
  leadsCount: number
  images: string[]
  createdAt: string
  updatedAt: string
  rejectionReason?: string
  rejectedAt?: string
  rejectedBy?: {
    id: string
    name: string
    email: string
  }
}

type TabType = "pending" | "approved" | "rejected"

const categoryStyles: Record<string, { bg: string; text: string }> = {
  Expo: { bg: "#e3f2fd", text: "#1565c0" },
  Summit: { bg: "#f3e5f5", text: "#6a1b9a" },
  Workshop: { bg: "#fce4ec", text: "#880e4f" },
  Conference: { bg: "#e8f5e9", text: "#1b5e20" },
  Virtual: { bg: "#fff3e0", text: "#e65100" },
  "Expo + Conference": { bg: "#e8eaf6", text: "#283593" },
}

const priorityStyles: Record<string, { bg: string; text: string }> = {
  High: { bg: "#fce4ec", text: "#c62828" },
  Medium: { bg: "#fff8e1", text: "#e65100" },
  Low: { bg: "#e8f5e9", text: "#2e7d32" },
}

const orgColors = [
  { bg: "#e3f2fd", text: "#1565c0" },
  { bg: "#f3e5f5", text: "#6a1b9a" },
  { bg: "#fce4ec", text: "#880e4f" },
  { bg: "#e8f5e9", text: "#1b5e20" },
  { bg: "#fff3e0", text: "#e65100" },
  { bg: "#e8eaf6", text: "#283593" },
]

export default function EventApprovalDashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedEventForView, setSelectedEventForView] = useState<string | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [approving, setApproving] = useState<string | null>(null)
  const [rejecting, setRejecting] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    avgReviewTime: "2.4h",
  })
  const [activeTab, setActiveTab] = useState<TabType>("pending")
  const { toast } = useToast()
  const [isViewPanelOpen, setIsViewPanelOpen] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    setPage(1)
    fetchEvents()
  }, [activeTab, search])

  useEffect(() => {
    fetchEvents()
  }, [page])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const statusMap = {
        pending: "PENDING_APPROVAL",
        rejected: "REJECTED",
        approved: "PUBLISHED",
      } as const
      const status = statusMap[activeTab]
      const params = new URLSearchParams({
        status,
        page: String(page),
        limit: "10",
        search: search || "",
      })
      const data = await apiFetch<{
        success?: boolean
        events?: Event[]
        data?: { events?: Event[]; total?: number }
        pagination?: { totalPages: number; total: number }
        error?: string
      }>(`/api/admin/events?${params.toString()}`, { auth: true })

      const eventsList = data.events ?? (data as any).data?.events
      const total = data.pagination?.total ?? (data as any).data?.total ?? 0

      if (data.success !== false) {
        setEvents(Array.isArray(eventsList) ? eventsList : [])
        setTotalPages(data.pagination?.totalPages ?? 1)
        setTotalItems(total)
      } else {
        toast({
          title: "Error",
          description: (data as any).error || "Failed to fetch events",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch events", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await apiFetch<{
        success?: boolean
        stats?: { total: number; approved: number; rejected: number; pending: number }
      }>("/api/admin/events/stats", { auth: true })
      if (data.success !== false && data.stats) {
        setStats({
          pending: data.stats.pending,
          approved: data.stats.approved,
          rejected: data.stats.rejected,
          avgReviewTime: "2.4h",
        })
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const handleViewEvent = (eventId: string) => {
    setSelectedEventForView(eventId)
    setIsViewPanelOpen(true)
  }

  const handleBulkApprove = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    try {
      const data = await apiFetch<{ success?: boolean; error?: string }>(
        "/api/admin/events/bulk-approve",
        { method: "POST", body: { eventIds: ids }, auth: true }
      )
      if (data.success !== false) {
        toast({ title: "Success", description: `${ids.length} events approved successfully` })
        setSelectedIds(new Set())
        fetchEvents()
        fetchStats()
      } else {
        toast({ title: "Error", description: data.error || "Failed to approve events", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to approve events", variant: "destructive" })
    }
  }

  const handleBulkReject = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    try {
      const data = await apiFetch<{ success?: boolean; error?: string }>(
        "/api/admin/events/bulk-reject",
        { method: "POST", body: { eventIds: ids, reason: "Bulk rejection by admin" }, auth: true }
      )
      if (data.success !== false) {
        toast({ title: "Success", description: `${ids.length} events rejected successfully` })
        setSelectedIds(new Set())
        fetchEvents()
        fetchStats()
      } else {
        toast({ title: "Error", description: data.error || "Failed to reject events", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to reject events", variant: "destructive" })
    }
  }

  const handleApprove = async (eventId: string) => {
    try {
      setApproving(eventId)
      const data = await apiFetch<{ success?: boolean; error?: string }>(
        "/api/admin/events/approve",
        { method: "POST", body: { eventId, action: "approve" }, auth: true }
      )
      if (data.success !== false) {
        toast({ title: "Success", description: "Event approved successfully" })
        setSelectedIds(prev => { const next = new Set(prev); next.delete(eventId); return next })
        fetchEvents()
        fetchStats()
      } else {
        toast({ title: "Error", description: data.error || "Failed to approve event", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to approve event", variant: "destructive" })
    } finally {
      setApproving(null)
    }
  }

  const handleReject = async () => {
    if (!selectedEvent) return
    try {
      setRejecting(selectedEvent.id)
      const data = await apiFetch<{ success?: boolean; error?: string }>(
        "/api/admin/events/reject",
        { method: "POST", body: { eventId: selectedEvent.id, reason: rejectReason }, auth: true }
      )
      if (data.success !== false) {
        toast({ title: "Success", description: "Event rejected successfully" })
        setSelectedIds(prev => { const next = new Set(prev); next.delete(selectedEvent.id); return next })
        fetchEvents()
        fetchStats()
        setRejectDialogOpen(false)
        setRejectReason("")
        setSelectedEvent(null)
      } else {
        toast({ title: "Error", description: data.error || "Failed to reject event", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to reject event", variant: "destructive" })
    } finally {
      setRejecting(null)
    }
  }

  const handleReapprove = async (eventId: string) => {
    try {
      setApproving(eventId)
      const data = await apiFetch<{ success?: boolean; error?: string }>(
        "/api/admin/events/approve",
        { method: "POST", body: { eventId, action: "approve" }, auth: true }
      )
      if (data.success !== false) {
        toast({ title: "Success", description: "Event re-approved successfully" })
        fetchEvents()
        fetchStats()
      } else {
        toast({ title: "Error", description: data.error || "Failed to re-approve event", variant: "destructive" })
      }
    } finally {
      setApproving(null)
    }
  }

  const openRejectDialog = (event: Event) => {
    setSelectedEvent(event)
    setRejectDialogOpen(true)
  }

  const toggleSelect = (eventId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(eventId) ? next.delete(eventId) : next.add(eventId)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === events.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(events.map(e => e.id)))
    }
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const startMonth = start.toLocaleDateString("en-US", { month: "short" })
    const startDay = start.getDate()
    const endMonth = end.toLocaleDateString("en-US", { month: "short" })
    const endDay = end.getDate()
    if (startMonth === endMonth) return `${startMonth} ${startDay}–${endDay}`
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}`
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffHours < 1) return "Just now"
    if (diffHours === 1) return "1 hour ago"
    if (diffHours < 24) return `${diffHours} hours ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return "Yesterday"
    return `${diffDays} days ago`
  }

  const getPriority = (createdAt: string) => {
    const hours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)
    if (hours < 24) return "High"
    if (hours < 72) return "Medium"
    return "Low"
  }

  const getCategory = (event: Event) => {
    if (event.isVirtual) return "Virtual"
    if (event.exhibitionSpaces?.length > 0 && event.ticketTypes?.length > 0) return "Expo + Conference"
    if (event.exhibitionSpaces?.length > 0) return "Expo"
    if (event.ticketTypes?.length > 0) return "Conference"
    return "Workshop"
  }

  const getOrganizerInitials = (event: Event) => {
    const name = event.organizer.company || event.organizer.name
    return name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()
  }

  const getOrganizerName = (event: Event) => event.organizer.company || event.organizer.name

  const getOrgColor = (event: Event) => {
    const name = event.organizer.company || event.organizer.name
    return orgColors[name.charCodeAt(0) % orgColors.length]
  }

  if (loading && events.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "256px" }}>
        <Loader2 style={{ width: "32px", height: "32px", color: "#aaa", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0ede8", padding: "24px", fontFamily: "system-ui, sans-serif" }}>

      {/* Stats Row */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        {[
          { icon: <Clock size={16} />, value: stats.pending, label: "Pending", iconBg: "#fff3e0", iconColor: "#f57c00" },
          { icon: <CheckCircle size={16} />, value: stats.approved, label: "Approved this month", iconBg: "#e8f5e9", iconColor: "#2e7d32" },
          { icon: <XCircle size={16} />, value: stats.rejected, label: "Rejected", iconBg: "#fce4ec", iconColor: "#c62828" },
          { icon: <Clock size={16} />, value: stats.avgReviewTime, label: "Avg. review time", iconBg: "#e3f2fd", iconColor: "#1565c0" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "#fff", border: "0.5px solid #e5e3dc", borderRadius: "12px",
            padding: "12px 18px", display: "flex", alignItems: "center", gap: "12px",
          }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: s.iconBg, color: s.iconColor,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: "22px", fontWeight: 600, color: "#111" }}>{s.value}</div>
              <div style={{ fontSize: "12px", color: "#888" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div style={{ background: "#fff", border: "0.5px solid #e5e3dc", borderRadius: "14px", overflow: "hidden" }}>

        {/* Card Header */}
        <div style={{ padding: "16px 20px 0", borderBottom: "0.5px solid #f0ede8" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "14px" }}>
            <span style={{ fontSize: "15px", fontWeight: 500 }}>Pending Submissions</span>
            {selectedIds.size > 0 && activeTab === "pending" && (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handleBulkApprove}
                  style={{
                    background: "#2e7d32", color: "#fff", border: "none",
                    borderRadius: "8px", padding: "7px 16px", fontSize: "13px", cursor: "pointer",
                  }}
                >
                  Approve Selected
                </button>
                <button
                  onClick={handleBulkReject}
                  style={{
                    background: "#fff", color: "#c62828", border: "1px solid #ffcdd2",
                    borderRadius: "8px", padding: "7px 16px", fontSize: "13px", cursor: "pointer",
                  }}
                >
                  Reject Selected
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "24px" }}>
            {(["pending", "approved", "rejected"] as TabType[]).map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSelectedIds(new Set()); setPage(1) }}
                style={{
                  paddingBottom: "10px", fontSize: "13px", fontWeight: 500,
                  background: "none", border: "none",
                  borderBottom: activeTab === tab ? "2px solid #2e7d32" : "2px solid transparent",
                  color: activeTab === tab ? "#2e7d32" : "#888",
                  cursor: "pointer", textTransform: "capitalize",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid #f0ede8" }}>
                <th style={{ padding: "12px 0 12px 20px", width: "40px", textAlign: "left" }}>
                  {activeTab === "pending" && events.length > 0 && (
                    <input
                      type="checkbox"
                      checked={selectedIds.size === events.length && events.length > 0}
                      onChange={toggleSelectAll}
                      style={{ width: "15px", height: "15px", accentColor: "#2e7d32", cursor: "pointer" }}
                    />
                  )}
                </th>
                {["Event Name", "Category", "Organizer", "Submitted", "Priority", "Actions"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 0",
                      textAlign: i === 5 ? "right" : "left",
                      paddingRight: i === 5 ? "20px" : "0",
                      fontSize: "11px", fontWeight: 500, color: "#aaa",
                      letterSpacing: "0.06em", textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "48px 0", color: "#aaa", fontSize: "14px" }}>
                    No {activeTab} submissions
                  </td>
                </tr>
              ) : (
                events.map(event => {
                  const priority = getPriority(event.createdAt)
                  const category = getCategory(event)
                  const cat = categoryStyles[category] ?? categoryStyles["Expo"]
                  const pri = priorityStyles[priority]
                  const orgColor = getOrgColor(event)

                  return (
                    <tr
                      key={event.id}
                      style={{ borderBottom: "0.5px solid #f8f7f5", transition: "background 0.1s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#faf9f7")}
                      onMouseLeave={e => (e.currentTarget.style.background = "")}
                    >
                      <td style={{ paddingLeft: "20px", paddingTop: "14px", paddingBottom: "14px" }}>
                        {activeTab === "pending" && (
                          <input
                            type="checkbox"
                            checked={selectedIds.has(event.id)}
                            onChange={() => toggleSelect(event.id)}
                            style={{ width: "15px", height: "15px", accentColor: "#2e7d32", cursor: "pointer" }}
                          />
                        )}
                      </td>

                      <td style={{ paddingTop: "14px", paddingBottom: "14px" }}>
                        <div style={{ fontWeight: 500, fontSize: "13px", color: "#111" }}>{event.title}</div>
                        <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                          {event.city}, {event.country}&nbsp;·&nbsp;{formatDateRange(event.startDate, event.endDate)}
                        </div>
                      </td>

                      <td style={{ paddingTop: "14px", paddingBottom: "14px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center",
                          padding: "3px 10px", borderRadius: "20px",
                          fontSize: "12px", fontWeight: 500,
                          background: cat.bg, color: cat.text,
                        }}>
                          {category}
                        </span>
                      </td>

                      <td style={{ paddingTop: "14px", paddingBottom: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{
                            width: "28px", height: "28px", borderRadius: "50%",
                            background: orgColor.bg, color: orgColor.text,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "11px", fontWeight: 600, flexShrink: 0,
                          }}>
                            {getOrganizerInitials(event)}
                          </div>
                          <span style={{ fontSize: "13px" }}>{getOrganizerName(event)}</span>
                        </div>
                      </td>

                      <td style={{ paddingTop: "14px", paddingBottom: "14px", fontSize: "13px", color: "#888" }}>
                        {getTimeAgo(event.createdAt)}
                      </td>

                      <td style={{ paddingTop: "14px", paddingBottom: "14px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center",
                          padding: "3px 10px", borderRadius: "20px",
                          fontSize: "12px", fontWeight: 500,
                          background: pri.bg, color: pri.text,
                        }}>
                          {priority}
                        </span>
                      </td>

                      <td style={{ paddingTop: "14px", paddingBottom: "14px", paddingRight: "20px", textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                          <button
                            onClick={() => handleViewEvent(event.id)}
                            title="View Details"
                            style={{
                              padding: "6px", borderRadius: "7px",
                              border: "1px solid #e0e0e0", background: "#fff",
                              color: "#888", cursor: "pointer", display: "flex", alignItems: "center",
                            }}
                          >
                            <Eye size={14} />
                          </button>

                          {activeTab === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(event.id)}
                                disabled={approving === event.id}
                                style={{
                                  padding: "6px 14px", borderRadius: "7px",
                                  fontSize: "12px", fontWeight: 500,
                                  border: "1px solid #a5d6a7", background: "#fff", color: "#2e7d32",
                                  cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                                  opacity: approving === event.id ? 0.6 : 1,
                                }}
                              >
                                {approving === event.id
                                  ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                                  : <Check size={12} />
                                }
                                Approve
                              </button>

                              <button
                                onClick={() => handleViewEvent(event.id)}
                                style={{
                                  padding: "6px 14px", borderRadius: "7px",
                                  fontSize: "12px", fontWeight: 500,
                                  border: "1px solid #e0e0e0", background: "#fff", color: "#555",
                                  cursor: "pointer",
                                }}
                              >
                                Review
                              </button>

                              <button
                                onClick={() => openRejectDialog(event)}
                                style={{
                                  padding: "6px 14px", borderRadius: "7px",
                                  fontSize: "12px", fontWeight: 500,
                                  border: "1px solid #ffcdd2", background: "#fff", color: "#c62828",
                                  cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                                }}
                              >
                                <X size={12} />
                                Reject
                              </button>
                            </>
                          )}

                          {activeTab === "rejected" && (
                            <button
                              onClick={() => handleReapprove(event.id)}
                              disabled={approving === event.id}
                              style={{
                                padding: "6px 14px", borderRadius: "7px",
                                fontSize: "12px", fontWeight: 500,
                                border: "1px solid #bbdefb", background: "#fff", color: "#1565c0",
                                cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                                opacity: approving === event.id ? 0.6 : 1,
                              }}
                            >
                              {approving === event.id
                                ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                                : <Check size={12} />
                              }
                              Re-approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderTop: "0.5px solid #f0ede8",
        }}>
          <span style={{ fontSize: "13px", color: "#888" }}>
            Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, totalItems)} of {totalItems} submissions
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                width: "32px", height: "32px", borderRadius: "8px",
                border: "0.5px solid #e5e3dc", background: "#fff", color: "#aaa",
                cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  border: page === p ? "none" : "0.5px solid #e5e3dc",
                  background: page === p ? "#2e7d32" : "#fff",
                  color: page === p ? "#fff" : "#555",
                  fontSize: "13px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                width: "32px", height: "32px", borderRadius: "8px",
                border: "0.5px solid #e5e3dc", background: "#fff", color: "#aaa",
                cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Event Details Panel */}
      <EventDetailsPanel
        eventId={selectedEventForView}
        isOpen={isViewPanelOpen}
        onClose={() => { setIsViewPanelOpen(false); setSelectedEventForView(null) }}
        onActionComplete={() => { fetchEvents(); fetchStats() }}
      />

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject{" "}
              <span style={{ fontWeight: 500 }}>"{selectedEvent?.title}"</span>?
              The organizer will be notified with your reason.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "8px 0" }}>
            <label style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>Rejection Reason</label>
            <Textarea
              placeholder="Please provide a reason for rejection..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p style={{ fontSize: "12px", color: "#888" }}>This reason will be shared with the organizer.</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => { setRejectReason(""); setSelectedEvent(null) }}
              disabled={rejecting === selectedEvent?.id}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={rejecting === selectedEvent?.id || !rejectReason.trim()}
              style={{ background: "#c62828" }}
            >
              {rejecting === selectedEvent?.id ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  Rejecting...
                </span>
              ) : (
                "Confirm Rejection"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}