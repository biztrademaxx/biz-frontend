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
import { cn } from "@/lib/utils"
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

const categoryStyles: Record<string, string> = {
  Expo: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
  Summit: "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300",
  Workshop: "bg-pink-100 text-pink-800 dark:bg-pink-500/20 dark:text-pink-300",
  Conference: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  Virtual: "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300",
  "Expo + Conference": "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300",
}

const orgColorClasses = [
  "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
  "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300",
  "bg-pink-100 text-pink-800 dark:bg-pink-500/20 dark:text-pink-300",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300",
  "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300",
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
        { method: "POST", body: { eventIds: ids }, auth: true },
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
        { method: "POST", body: { eventIds: ids, reason: "Bulk rejection by admin" }, auth: true },
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
        { method: "POST", body: { eventId, action: "approve" }, auth: true },
      )
      if (data.success !== false) {
        toast({ title: "Success", description: "Event approved successfully" })
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.delete(eventId)
          return next
        })
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
        { method: "POST", body: { eventId: selectedEvent.id, reason: rejectReason }, auth: true },
      )
      if (data.success !== false) {
        toast({ title: "Success", description: "Event rejected successfully" })
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.delete(selectedEvent.id)
          return next
        })
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
        { method: "POST", body: { eventId, action: "approve" }, auth: true },
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
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(eventId) ? next.delete(eventId) : next.add(eventId)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === events.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(events.map((e) => e.id)))
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

  const getCategory = (event: Event) => {
    if (event.isVirtual) return "Virtual"
    if (event.exhibitionSpaces?.length > 0 && event.ticketTypes?.length > 0) return "Expo + Conference"
    if (event.exhibitionSpaces?.length > 0) return "Expo"
    if (event.ticketTypes?.length > 0) return "Conference"
    return "Workshop"
  }

  const getOrganizerInitials = (event: Event) => {
    const name = event.organizer.company || event.organizer.name
    return name
      .split(" ")
      .slice(0, 2)
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
  }

  const getOrganizerName = (event: Event) => event.organizer.company || event.organizer.name

  const getOrgColor = (event: Event) => {
    const name = event.organizer.company || event.organizer.name
    return orgColorClasses[name.charCodeAt(0) % orgColorClasses.length]
  }

  const ghostBtn =
    "inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
  const approveBtn =
    "inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-card px-3.5 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-60 dark:border-emerald-500/40 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
  const rejectBtn =
    "inline-flex items-center gap-1 rounded-lg border border-red-200 bg-card px-3.5 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
  const reapproveBtn =
    "inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-card px-3.5 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-50 disabled:opacity-60 dark:border-[#17F0F6]/40 dark:text-[#17F0F6] dark:hover:bg-[#17F0F6]/10"

  if (loading && events.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const statCards = [
    {
      icon: <Clock size={16} />,
      value: stats.pending,
      label: "Pending",
      iconWrap: "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300",
    },
    {
      icon: <CheckCircle size={16} />,
      value: stats.approved,
      label: "Approved this month",
      iconWrap: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    },
    {
      icon: <XCircle size={16} />,
      value: stats.rejected,
      label: "Rejected",
      iconWrap: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    },
    {
      icon: <Clock size={16} />,
      value: stats.avgReviewTime,
      label: "Avg. review time",
      iconWrap: "bg-blue-100 text-blue-700 dark:bg-[#17F0F6]/15 dark:text-[#17F0F6]",
    },
  ]

  return (
    <div className="min-h-full space-y-6 bg-transparent">
      <div className="flex flex-wrap gap-3">
        {statCards.map((s, i) => (
          <div
            key={i}
            className="flex min-w-[160px] flex-1 items-center gap-3 rounded-xl border border-border bg-card px-[18px] py-3 shadow-sm"
          >
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", s.iconWrap)}>{s.icon}</div>
            <div>
              <div className="text-[22px] font-semibold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 pt-4">
          <div className="flex items-center justify-between pb-3.5">
            <span className="text-[15px] font-medium text-foreground">Event Submissions</span>
            {selectedIds.size > 0 && activeTab === "pending" && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleBulkApprove}
                  className="rounded-lg bg-emerald-700 px-4 py-1.5 text-[13px] text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  Approve Selected ({selectedIds.size})
                </button>
                <button
                  type="button"
                  onClick={handleBulkReject}
                  className="rounded-lg border border-red-200 bg-card px-4 py-1.5 text-[13px] text-red-700 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
                >
                  Reject Selected ({selectedIds.size})
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-6">
            {(["pending", "approved", "rejected"] as TabType[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab)
                  setSelectedIds(new Set())
                  setPage(1)
                }}
                className={cn(
                  "border-b-2 pb-2.5 text-[13px] font-medium capitalize transition-colors",
                  activeTab === tab
                    ? "border-emerald-600 text-emerald-700 dark:border-[#17F0F6] dark:text-[#17F0F6]"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {tab === "pending" ? "Pending" : tab === "approved" ? "Approved" : "Rejected"}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="w-10 py-3 pl-5 text-left">
                  {activeTab === "pending" && events.length > 0 && (
                    <input
                      type="checkbox"
                      checked={selectedIds.size === events.length && events.length > 0}
                      onChange={toggleSelectAll}
                      className="h-[15px] w-[15px] cursor-pointer accent-emerald-600 dark:accent-[#17F0F6]"
                    />
                  )}
                </th>
                {["Event Name", "Category", "Organizer", "Submitted", "Actions"].map((h, i) => (
                  <th
                    key={h}
                    className={cn(
                      "py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground",
                      i === 4 ? "pr-5 text-right" : "text-left",
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                    No {activeTab} submissions
                  </td>
                </tr>
              ) : (
                events.map((event) => {
                  const category = getCategory(event)
                  const catClass = categoryStyles[category] ?? categoryStyles.Expo
                  const orgColor = getOrgColor(event)

                  return (
                    <tr key={event.id} className="border-b border-border transition-colors hover:bg-muted/40">
                      <td className="py-3.5 pl-5">
                        {activeTab === "pending" && (
                          <input
                            type="checkbox"
                            checked={selectedIds.has(event.id)}
                            onChange={() => toggleSelect(event.id)}
                            className="h-[15px] w-[15px] cursor-pointer accent-emerald-600 dark:accent-[#17F0F6]"
                          />
                        )}
                      </td>

                      <td className="py-3.5">
                        <div className="text-[13px] font-medium text-foreground">{event.title}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {event.city}, {event.country} · {formatDateRange(event.startDate, event.endDate)}
                        </div>
                      </td>

                      <td className="py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            catClass,
                          )}
                        >
                          {category}
                        </span>
                      </td>

                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                              orgColor,
                            )}
                          >
                            {getOrganizerInitials(event)}
                          </div>
                          <span className="text-[13px] text-foreground">{getOrganizerName(event)}</span>
                        </div>
                      </td>

                      <td className="py-3.5 text-[13px] text-muted-foreground">{getTimeAgo(event.createdAt)}</td>

                      <td className="py-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {activeTab === "pending" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(event.id)}
                                disabled={approving === event.id}
                                className={approveBtn}
                              >
                                {approving === event.id ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Check size={12} />
                                )}
                                Approve
                              </button>
                              <button type="button" onClick={() => handleViewEvent(event.id)} className={ghostBtn}>
                                Review
                              </button>
                              <button type="button" onClick={() => openRejectDialog(event)} className={rejectBtn}>
                                <X size={12} />
                                Reject
                              </button>
                            </>
                          )}

                          {activeTab === "approved" && (
                            <button type="button" onClick={() => handleViewEvent(event.id)} className={ghostBtn}>
                              <Eye size={12} />
                              View
                            </button>
                          )}

                          {activeTab === "rejected" && (
                            <>
                              <button type="button" onClick={() => handleViewEvent(event.id)} className={ghostBtn}>
                                Review
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReapprove(event.id)}
                                disabled={approving === event.id}
                                className={reapproveBtn}
                              >
                                {approving === event.id ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Check size={12} />
                                )}
                                Re-approve
                              </button>
                            </>
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

        <div className="flex items-center justify-between border-t border-border px-5 py-3.5">
          <span className="text-[13px] text-muted-foreground">
            Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, totalItems)} of {totalItems} submissions
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-[13px]",
                  page === p
                    ? "bg-emerald-700 text-white dark:bg-[#17F0F6] dark:text-[#010639]"
                    : "border border-border bg-card text-foreground hover:bg-muted",
                )}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <EventDetailsPanel
        eventId={selectedEventForView}
        isOpen={isViewPanelOpen}
        onClose={() => {
          setIsViewPanelOpen(false)
          setSelectedEventForView(null)
        }}
        onActionComplete={() => {
          fetchEvents()
          fetchStats()
        }}
      />

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject <span className="font-medium">"{selectedEvent?.title}"</span>? The
              organizer will be notified with your reason.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-2 flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Rejection Reason</label>
            <Textarea
              placeholder="Please provide a reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">This reason will be shared with the organizer.</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setRejectReason("")
                setSelectedEvent(null)
              }}
              disabled={rejecting === selectedEvent?.id}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={rejecting === selectedEvent?.id || !rejectReason.trim()}
              className="bg-red-700 text-white hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-500"
            >
              {rejecting === selectedEvent?.id ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Rejecting...
                </span>
              ) : (
                "Confirm Rejection"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
