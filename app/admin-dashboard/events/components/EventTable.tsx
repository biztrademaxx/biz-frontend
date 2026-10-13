// app/admin-dashboard/events/components/EventTable.tsx
"use client"

import { useEffect, useMemo, useState, type CSSProperties } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Download, Search, Mail, Loader2, BadgeCheck, CheckCircle2 } from "lucide-react"
import { EventRow } from "./EventRow"
import type { Event, Category } from "../types/event.types"
import { getOrganizerDisplay, getCategoryDisplay } from "../types/event.types"
import type { AdminCountry, EventMailCandidate, EventPagination } from "../services/events.api"
import { useToast } from "@/hooks/use-toast"
import { Pagination } from "../../shared/components/Pagination"
import { getOrganizerPlansBatch } from "@/lib/get-organizer-plan"

interface EventTableProps {
  events: Event[]
  loading?: boolean
  searchTerm: string
  selectedStatus: string
  selectedCategory: string
  activeTab: string
  page: number
  pagination: EventPagination
  onPageChange: (page: number) => void
  eventCounts: Record<string, number>
  categories: Category[]
  countries: AdminCountry[]
  selectedCountry: string
  onCountryFilterChange: (value: string) => void
  onEdit: (event: Event) => void
  onView?: (event: Event) => void
  onStatusChange: (eventId: string, status: Event["status"]) => void
  onFeatureToggle: (eventId: string, current: boolean) => void
  onVipToggle: (eventId: string, current: boolean) => void
  onPublicToggle: (eventId: string, current: boolean) => void
  onDelete: (eventId: string) => void
  onBulkDelete?: (eventIds: string[]) => void
  onApprove?: (eventId: string) => void
  onBulkApprove?: (eventIds: string[]) => void
  onPromote: (event: Event) => void
  onVerify: (event: Event) => void
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onCategoryFilterChange: (value: string) => void
  onTabChange: (value: string) => void
  mailCandidates: EventMailCandidate[]
  sendingMail: boolean
  sendingMailFor: string | null
  onSendListingEmail: (organizerEmail: string, eventTitles: string[]) => void
  onSendListingEmailBulk: (items: Array<{ organizerEmail: string; eventTitles: string[] }>) => void
}

function getStatusColor(status: Event["status"]): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "Approved": return "default"
    case "Pending Review": return "secondary"
    case "Flagged":
    case "Rejected": return "destructive"
    case "Draft": return "outline"
    default: return "secondary"
  }
}

export function getEventDateStatus(event: Event): "Live" | "Upcoming" | "Ended" {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startDate = new Date(event.date || event.startDate || "")
  startDate.setHours(0, 0, 0, 0)
  const endDate = event.endDate ? new Date(event.endDate) : new Date(event.date || event.startDate || "")
  endDate.setHours(23, 59, 59, 999)
  if (today >= startDate && today <= endDate) return "Live"
  if (today < startDate) return "Upcoming"
  if (today > endDate) return "Ended"
  return "Upcoming"
}

function sortEventsClient(events: Event[], sortBy: string): Event[] {
  if (sortBy === "name") return [...events].sort((a, b) => a.title.localeCompare(b.title))
  if (sortBy === "attendance") return [...events].sort((a, b) => (b.attendees || 0) - (a.attendees || 0))
  return [...events].sort((a, b) => new Date(b.date || b.startDate || 0).getTime() - new Date(a.date || a.startDate || 0).getTime())
}

function exportToCSV(events: Event[]) {
  const safeString = (value: any): string => {
    if (!value) return ""
    if (typeof value === "string") return value.replace(/"/g, '""')
    if (typeof value === "number") return value.toString()
    if (typeof value === "object") {
      if (value.props?.children) return String(value.props.children).replace(/"/g, '""')
      return JSON.stringify(value).replace(/"/g, '""')
    }
    return String(value).replace(/"/g, '""')
  }
  const headers = ["Event Title", "Category", "Start Date", "End Date", "Location", "City", "Country", "Venue", "Attendees", "Capacity", "Status", "Organizer", "Featured", "VIP", "Verified", "Created At"]
  const rows = events.map((event) => [
    `"${safeString(event.title)}"`,
    `"${safeString(getCategoryDisplay(event.category))}"`,
    safeString(event.startDate || event.date || ""),
    safeString(event.endDate || event.date || ""),
    `"${safeString(event.location)}"`,
    `"${safeString(event.city)}"`,
    `"${safeString(event.country)}"`,
    `"${safeString(event.venue)}"`,
    event.attendees || event.currentAttendees || 0,
    event.maxCapacity || event.maxAttendees || 0,
    getEventDateStatus(event),
    `"${safeString(typeof event.organizer === "object" ? event.organizer?.company || event.organizer?.name || "" : event.organizer || "")}"`,
    event.featured || event.isFeatured ? "Yes" : "No",
    event.vip ? "Yes" : "No",
    event.isVerified ? "Yes" : "No",
    new Date(event.createdAt || event.date || "").toLocaleDateString(),
  ])
  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `events_export_${new Date().toISOString().split("T")[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export type GroupedMailRow = {
  key: string
  organizerEmail: string
  organizerName: string
  eventTitles: string[]
}

export function groupMailCandidates(candidates: EventMailCandidate[]): GroupedMailRow[] {
  const map = new Map<string, { organizerEmail: string; organizerName: string; eventTitles: string[] }>()
  for (const c of candidates) {
    const email = (c.organizerEmail || "").trim()
    if (!email) continue
    const key = email.toLowerCase()
    if (!map.has(key)) map.set(key, { organizerEmail: email, organizerName: c.organizerName || "", eventTitles: [] })
    const g = map.get(key)!
    g.eventTitles.push(c.eventTitle)
    if (c.organizerName && !g.organizerName) g.organizerName = c.organizerName
  }
  return Array.from(map.entries()).map(([key, v]) => ({
    key,
    organizerEmail: v.organizerEmail,
    organizerName: v.organizerName,
    eventTitles: [...new Set(v.eventTitles)],
  }))
}

export function EventTable({
  events,
  loading = false,
  searchTerm,
  selectedStatus,
  selectedCategory,
  activeTab,
  page,
  pagination,
  onPageChange,
  eventCounts,
  categories,
  countries,
  selectedCountry,
  onCountryFilterChange,
  onEdit,
  onView,
  onStatusChange,
  onFeatureToggle,
  onVipToggle,
  onPublicToggle,
  onDelete,
  onBulkDelete,
  onApprove,
  onBulkApprove,
  onPromote,
  onVerify,
  onSearchChange,
  onStatusFilterChange,
  onCategoryFilterChange,
  onTabChange,
  mailCandidates,
  sendingMail,
  sendingMailFor,
  onSendListingEmail,
  onSendListingEmailBulk,
}: EventTableProps) {
  const { toast } = useToast()
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set())
  const [selectedMailKeys, setSelectedMailKeys] = useState<Set<string>>(new Set())
  const [localSort, setLocalSort] = useState("date")
  const [localSearch, setLocalSearch] = useState(searchTerm)
  const [organizerPlans, setOrganizerPlans] = useState<Map<string, any>>(new Map())
  const [isLoadingPlans, setIsLoadingPlans] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    setLocalSearch(searchTerm)
  }, [searchTerm])

  // Helper function to extract organizer identifier from event
  const getOrganizerIdentifier = (event: Event): string | null => {
    // 1. Check if organizerId exists directly
    if (event.organizerId && event.organizerId.includes('-')) {
      return event.organizerId
    }

    // 2. Check if organizer is an object with email or ID
    if (typeof event.organizer === 'object' && event.organizer) {
      const org = event.organizer as any
      // Prefer email as it's more reliable
      if (org.email) return org.email
      if (org.id && org.id.includes('-')) return org.id
      if (org._id && org._id.includes('-')) return org._id
      // Fallback to name
      if (org.company) return org.company.trim()
      if (org.name) return org.name.trim()
      if (org.organizationName) return org.organizationName.trim()
    }

    // 3. If organizer is a string, use it as the identifier
    if (typeof event.organizer === 'string') {
      return event.organizer.trim()
    }

    return null
  }

  // Fetch organizer plans when events change
  useEffect(() => {
    if (events.length === 0 || activeTab === "send-email" || activeTab === "email-verified") {
      setOrganizerPlans(new Map())
      setIsLoadingPlans(false)
      return
    }

    // Log event structure to debug
    console.log('📋 Sample event structure:', events[0])
    console.log('📋 Organizer field:', events[0].organizer)
    console.log('📋 Organizer type:', typeof events[0].organizer)

    // Get unique organizer identifiers from events
    const organizerIds = events
      .map(getOrganizerIdentifier)
      .filter((id): id is string => Boolean(id))

    // Remove duplicates
    const uniqueOrganizerIds = [...new Set(organizerIds)]

    console.log('🔍 Extracted organizer identifiers from events:', uniqueOrganizerIds)

    if (uniqueOrganizerIds.length === 0) {
      console.log('⚠️ No organizer identifiers found in events.')
      console.log('📋 Event data sample:', events.map(e => ({
        title: e.title,
        organizerId: e.organizerId,
        organizer: e.organizer,
        organizerType: typeof e.organizer
      })))
      setOrganizerPlans(new Map())
      setIsLoadingPlans(false)
      return
    }

    const fetchPlans = async () => {
      setIsLoadingPlans(true)
      setIsInitialLoad(false)
      try {
        console.log('📡 Fetching plans for organizer identifiers:', uniqueOrganizerIds)
        const plans = await getOrganizerPlansBatch(uniqueOrganizerIds)
        console.log('✅ Received plans map size:', plans.size)
        
        // Log each plan
        for (const [id, plan] of plans) {
          console.log(`📋 Organizer "${id}":`, plan)
        }
        
        setOrganizerPlans(plans)
      } catch (error) {
        console.error('❌ Failed to fetch organizer plans:', error)
        setOrganizerPlans(new Map())
      } finally {
        setIsLoadingPlans(false)
      }
    }

    fetchPlans()
  }, [events, activeTab])

  const isMailTab = activeTab === "send-email" || activeTab === "email-verified"

  const tabMailCandidates = useMemo(() => {
    if (activeTab === "send-email") {
      return mailCandidates.filter((c) => !c.emailVerified)
    }
    if (activeTab === "email-verified") {
      return mailCandidates.filter((c) => c.emailVerified)
    }
    return []
  }, [mailCandidates, activeTab])

  const groupedMail = useMemo(() => groupMailCandidates(tabMailCandidates), [tabMailCandidates])

  const verifiedOrganizerEmails = useMemo(
    () =>
      new Set(
        mailCandidates
          .filter((c) => c.emailVerified)
          .map((c) => (c.organizerEmail || "").trim().toLowerCase())
          .filter(Boolean),
      ),
    [mailCandidates],
  )

  // Enrich events with plan data - with case-insensitive matching
  const enrichedEvents = useMemo(() => {
    if (isMailTab) return []
    
    console.log('🔄 Enriching events with plan data...')
    console.log('📋 Organizer plans map size:', organizerPlans.size)
    console.log('📋 Organizer plans keys:', Array.from(organizerPlans.keys()))
    
    return events.map(event => {
      const organizerIdentifier = getOrganizerIdentifier(event)
      
      console.log(`🔍 Event "${event.title}" - Organizer Identifier:`, organizerIdentifier)
      
      // Check if plan is still loading
      const isLoading = isLoadingPlans && organizerIdentifier && !organizerPlans.has(organizerIdentifier)
      
      // Get plan from map or fallback to free
      let plan = null
      let planSlug = 'organizer-free'
      
      if (organizerIdentifier) {
        // Try exact match first
        plan = organizerPlans.get(organizerIdentifier)
        
        // If not found, try case-insensitive match
        if (!plan) {
          const lowerIdentifier = organizerIdentifier.toLowerCase()
          for (const [key, value] of organizerPlans) {
            if (key.toLowerCase() === lowerIdentifier) {
              plan = value
              console.log(`📋 Found case-insensitive match: "${key}" -> "${organizerIdentifier}"`)
              break
            }
          }
        }
        
        console.log(`📋 Event "${event.title}" - Plan found:`, plan)
        if (plan) {
          planSlug = plan.planSlug
        }
      }
      
      console.log(`📋 Event "${event.title}" - Final plan slug:`, planSlug)
      
      return {
        ...event,
        organizerPlanSlug: planSlug,
        _loadingPlan: isLoading
      }
    })
  }, [events, organizerPlans, isMailTab, isLoadingPlans])

  const filteredEvents = useMemo(() => {
    if (isMailTab) return []
    return sortEventsClient(enrichedEvents, localSort)
  }, [enrichedEvents, isMailTab, localSort])

  const allSelected = filteredEvents.length > 0 && filteredEvents.every((e) => selectedEvents.has(e.id))
  const selectedCount = selectedEvents.size
  const mailSelectedCount = selectedMailKeys.size
  const allMailSelected = groupedMail.length > 0 && groupedMail.every((g) => selectedMailKeys.has(g.key))

  const handleSelectEvent = (eventId: string, checked: boolean) => {
    const next = new Set(selectedEvents)
    if (checked) next.add(eventId)
    else next.delete(eventId)
    setSelectedEvents(next)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedEvents(new Set(filteredEvents.map((e) => e.id)))
    else setSelectedEvents(new Set())
  }

  const handleBulkDelete = () => {
    if (selectedCount === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedCount} event(s)?`)) return
    const ids = Array.from(selectedEvents)
    setSelectedEvents(new Set())
    if (onBulkDelete) {
      onBulkDelete(ids)
      return
    }
    // Fallback: single deletes (each may prompt again)
    ids.forEach((id) => onDelete(id))
  }

  const handleBulkApprove = () => {
    if (selectedCount === 0) return
    if (!confirm(`Approve and publish ${selectedCount} event(s)? They will appear on the public events page.`)) return
    const ids = Array.from(selectedEvents)
    setSelectedEvents(new Set())
    if (onBulkApprove) {
      onBulkApprove(ids)
      return
    }
    ids.forEach((id) => onApprove?.(id))
  }

  const handleSendListingEmailForSelection = () => {
    const list = filteredEvents.filter((e) => selectedEvents.has(e.id))
    const by = new Map<string, { organizerEmail: string; eventTitles: string[] }>()
    for (const e of list) {
      const raw = (e.organizerEmail || "").trim()
      if (!raw) continue
      const k = raw.toLowerCase()
      if (verifiedOrganizerEmails.has(k)) continue
      if (!by.has(k)) by.set(k, { organizerEmail: raw, eventTitles: [] })
      by.get(k)!.eventTitles.push(e.title)
    }
    const items = [...by.values()].map((x) => ({ organizerEmail: x.organizerEmail, eventTitles: [...new Set(x.eventTitles)] }))
    if (items.length === 0) {
      toast({
        title: "No unverified organizers",
        description: "Selected events have no organizer email, or all organizers already verified their email.",
        variant: "destructive",
      })
      return
    }
    void onSendListingEmailBulk(items)
  }

  const handleSelectMailRow = (key: string, checked: boolean) => {
    const next = new Set(selectedMailKeys)
    if (checked) next.add(key)
    else next.delete(key)
    setSelectedMailKeys(next)
  }

  const handleSelectAllMail = (checked: boolean) => {
    if (checked) setSelectedMailKeys(new Set(groupedMail.map((g) => g.key)))
    else setSelectedMailKeys(new Set())
  }

  const handleBulkSendMail = () => {
    const rows = groupedMail.filter((g) => selectedMailKeys.has(g.key))
    if (rows.length === 0) return
    void onSendListingEmailBulk(rows.map((r) => ({ organizerEmail: r.organizerEmail, eventTitles: r.eventTitles })))
    setSelectedMailKeys(new Set())
  }

  const tabs = [
    { id: "all", label: "All", count: eventCounts.all ?? pagination.total, dot: null, star: false, vip: false, mail: false, verified: false },
    { id: "live", label: "Live", count: eventCounts.live ?? 0, dot: "#22C55E", star: false, vip: false, mail: false, verified: false },
    { id: "upcoming", label: "Upcoming", count: eventCounts.upcoming ?? 0, dot: "#3B82F6", star: false, vip: false, mail: false, verified: false },
    { id: "ended", label: "Ended", count: eventCounts.ended ?? 0, dot: "#71717A", star: false, vip: false, mail: false, verified: false },
    { id: "pending", label: "Pending", count: eventCounts.pending ?? 0, dot: "#EAB308", star: false, vip: false, mail: false, verified: false },
    { id: "approved", label: "Approved", count: eventCounts.approved ?? 0, dot: "#8B5CF6", star: false, vip: false, mail: false, verified: false },
    { id: "featured", label: "Featured", count: eventCounts.featured ?? 0, dot: null, star: true, vip: false, mail: false, verified: false },
    { id: "vip", label: "VIP", count: eventCounts.vip ?? 0, dot: null, star: false, vip: true, mail: false, verified: false },
    { id: "send-email", label: "Send email", count: eventCounts.mail ?? 0, dot: null, star: false, vip: false, mail: true, verified: false },
    { id: "email-verified", label: "Email verified", count: eventCounts.emailVerified ?? 0, dot: null, star: false, vip: false, mail: false, verified: true },
  ]

  const thStyle: CSSProperties = {
    padding: "10px 8px",
    textAlign: "left",
    fontSize: "11px",
    fontWeight: 600,
    color: "var(--muted-foreground)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    borderBottom: "1px solid var(--border)",
  }

  const selectClassName =
    "h-[34px] cursor-pointer rounded-lg border border-border bg-card px-2.5 text-[13px] text-foreground font-[inherit]"

  return (
    <>
      <style>{`
        @media (max-width: 1024px) { .col-hide-lg { display: none !important; } }
        @media (max-width: 768px)  { .col-hide-md { display: none !important; } }
        @media (max-width: 640px)  { .col-hide-sm { display: none !important; } }

        .event-table-row:hover .row-actions { opacity: 1 !important; pointer-events: auto !important; }

        /* Always show actions on touch devices */
        @media (hover: none) {
          .row-actions { opacity: 1 !important; pointer-events: auto !important; }
        }
      `}</style>

      <div className="admin-events-page min-h-screen bg-transparent p-4 md:p-6">
        <div className="mx-auto max-w-[1400px]">

          {/* ── Search bar ── */}
          <div className="mb-3.5">
            <div className="relative max-w-[340px]">
              <Search className="pointer-events-none absolute left-[11px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search events or organizers…"
                value={localSearch}
                onChange={(e) => { setLocalSearch(e.target.value); onSearchChange(e.target.value) }}
                className="w-full rounded-[10px] border border-border bg-card py-2 pl-[34px] pr-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground font-[inherit]"
              />
            </div>
          </div>

          {/* ── Tabs + Filters ── */}
          <div className="mb-3.5 flex flex-wrap items-center gap-1.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              const activeBg = tab.mail ? "#2563EB" : tab.verified ? "#059669" : "#22C55E"
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { onTabChange(tab.id); setSelectedEvents(new Set()); setSelectedMailKeys(new Set()) }}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all ${
                    isActive
                      ? "border-transparent text-white shadow-sm"
                      : "border-[1.5px] border-border bg-card text-foreground hover:bg-accent"
                  }`}
                  style={isActive ? { background: activeBg } : undefined}
                >
                  {tab.mail && <Mail className="h-[13px] w-[13px]" />}
                  {tab.dot && (
                    <span
                      className="h-[7px] w-[7px] shrink-0 rounded-full"
                      style={{ background: isActive ? "#fff" : tab.dot }}
                    />
                  )}
                  {tab.star && <span className="text-xs">⭐</span>}
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-px text-[11px] font-semibold ${
                        isActive ? "bg-white/25 text-white" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}

            <div className="flex-1" />

            {!isMailTab && (
              <>
                <select
                  value={selectedCategory}
                  onChange={(e) => onCategoryFilterChange(e.target.value)}
                  className={selectClassName}
                >
                  <option value="all">All Categories</option>
                  {categories.filter((c) => c.isActive).map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedCountry}
                  onChange={(e) => onCountryFilterChange(e.target.value)}
                  className={selectClassName}
                >
                  <option value="all">All Countries</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select value={localSort} onChange={(e) => setLocalSort(e.target.value)} className={selectClassName}>
                  <option value="date">Sort: Date ↓</option>
                  <option value="name">Sort: Name</option>
                  <option value="attendance">Sort: Attendance</option>
                </select>
              </>
            )}
          </div>

          {/* ── Main card ── */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card">

            {/* Card header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[15px] font-semibold text-foreground">
                  {activeTab === "send-email"
                    ? "Send listing email"
                    : activeTab === "email-verified"
                      ? "Email verified organizers"
                      : "Event Listings"}
                </span>
                <span className="text-[13px] text-muted-foreground">
                  {isMailTab
                    ? `${groupedMail.length} organizer mail groups`
                    : `${filteredEvents.length.toLocaleString()} events found`}
                </span>
                {!isMailTab && selectedCount > 0 && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:bg-[#17F0F6]/15 dark:text-[#17F0F6]">
                    {selectedCount} selected
                  </span>
                )}
                {activeTab === "send-email" && mailSelectedCount > 0 && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:bg-[#17F0F6]/15 dark:text-[#17F0F6]">
                    {mailSelectedCount} selected
                  </span>
                )}
                {isLoadingPlans && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading plans...
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {activeTab === "send-email" && mailSelectedCount > 0 && (
                  <Button type="button" size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700" disabled={sendingMail} onClick={handleBulkSendMail}>
                    <Mail className="h-4 w-4" />
                    {sendingMail ? "Sending…" : `Send to ${mailSelectedCount} organizer(s)`}
                  </Button>
                )}
                {!isMailTab && selectedCount > 0 && (
                  <>
                    <Button
                      type="button" variant="outline" size="sm"
                      className="gap-2 border-green-200 text-green-700 hover:bg-green-50 dark:border-emerald-500/40 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                      onClick={handleBulkApprove}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve Selected
                    </Button>
                    <Button
                      type="button" variant="outline" size="sm"
                      className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-[#17F0F6]/40 dark:text-[#17F0F6] dark:hover:bg-[#17F0F6]/10"
                      disabled={sendingMail}
                      onClick={handleSendListingEmailForSelection}
                    >
                      <Mail className="h-4 w-4" />
                      {sendingMail ? "Sending…" : "Send listing email"}
                    </Button>
                    <button
                      type="button"
                      onClick={handleBulkDelete}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[13px] font-medium text-red-500 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
                    >
                      <Trash2 className="h-[13px] w-[13px]" />
                      Delete Selected
                    </button>
                  </>
                )}
                {!isMailTab && (
                  <button
                    type="button"
                    onClick={() => exportToCSV(filteredEvents)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground hover:bg-accent"
                  >
                    <Download className="h-[13px] w-[13px]" /> Export CSV
                  </button>
                )}
              </div>
            </div>

            {/* ── Table content ── */}
            {isMailTab ? (

              /* Mail / verified organizer table */
              <div className="px-5 pb-5">
                <p className="my-3.5 text-[13px] text-muted-foreground">
                  {activeTab === "email-verified"
                    ? "Organizers who verified their email (OTP or password setup). These organizers are excluded from Send email."
                    : "Unverified organizers only. Select rows and send event listing emails with password setup links."}
                </p>
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <colgroup>
                    {activeTab === "send-email" && <col style={{ width: "44px" }} />}
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "28%" }} />
                    <col />
                    {activeTab === "send-email" ? <col style={{ width: "90px" }} /> : <col style={{ width: "110px" }} />}
                  </colgroup>
                  <thead>
                    <tr className="border-b border-border bg-muted/60">
                      {activeTab === "send-email" && (
                        <th className="py-2.5 pl-4 pr-0">
                          <Checkbox checked={allMailSelected} onCheckedChange={(c) => handleSelectAllMail(c === true)} />
                        </th>
                      )}
                      {(activeTab === "send-email"
                        ? ["Organizer", "Email", "Events", ""]
                        : ["Organizer", "Email", "Events", "Status"]
                      ).map((label, i) => (
                        <th key={i} style={thStyle}>{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {groupedMail.length === 0 ? (
                      <tr>
                        <td colSpan={activeTab === "send-email" ? 5 : 4} className="px-4 py-14 text-center text-sm text-muted-foreground">
                          {activeTab === "email-verified"
                            ? "No verified organizers yet. Organizers appear here after they complete email OTP or password setup."
                            : "No unverified organizers pending email. All listing organizers have verified their email."}
                        </td>
                      </tr>
                    ) : (
                      groupedMail.map((row) => (
                        <tr key={row.key} className="border-b border-border">
                          {activeTab === "send-email" && (
                            <td className="py-3 pl-4 pr-0">
                              <Checkbox checked={selectedMailKeys.has(row.key)} onCheckedChange={(c) => handleSelectMailRow(row.key, c === true)} />
                            </td>
                          )}
                          <td className="max-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2 py-3 text-[13px] font-medium text-foreground">
                            {row.organizerName || "—"}
                          </td>
                          <td className="max-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2 py-3 text-[13px] text-muted-foreground">
                            {row.organizerEmail}
                          </td>
                          <td className="px-2 py-3 text-[13px] text-muted-foreground">
                            <ul className="m-0 list-disc pl-4">
                              {row.eventTitles.map((t) => <li key={t}>{t}</li>)}
                            </ul>
                          </td>
                          <td className="px-2 py-3">
                            {activeTab === "send-email" ? (
                              <Button
                                type="button" size="sm" variant="outline"
                                className="whitespace-nowrap"
                                disabled={sendingMail && sendingMailFor === row.organizerEmail.toLowerCase()}
                                onClick={() => onSendListingEmail(row.organizerEmail, row.eventTitles)}
                              >
                                {sendingMail && sendingMailFor === row.organizerEmail.toLowerCase() ? "Sending…" : "Send"}
                              </Button>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                <BadgeCheck className="h-[13px] w-[13px]" />
                                Verified
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            ) : (

              /* Events table — horizontally scrollable on small screens */
              <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: "860px" }}>
                  <colgroup>
                    {/* checkbox */}
                    <col style={{ width: "44px" }} />
                    {/* event title + thumbnail — reduced so content doesn't float */}
                    <col style={{ width: "22%" }} />
                    {/* category — tighter, pill wraps itself */}
                    <col style={{ width: "13%" }} />
                    {/* date */}
                    <col style={{ width: "13%" }} />
                    {/* location — hidden ≤768px */}
                    <col className="col-hide-md" style={{ width: "9%" }} />
                    {/* attendance — needs enough room for header + number */}
                    <col className="col-hide-sm" style={{ width: "9%" }} />
                    {/* status — needs room for pill + dot */}
                    <col style={{ width: "10%" }} />
                    {/* organizer — hidden ≤1024px */}
                    <col className="col-hide-lg" style={{ width: "12%" }} />
                    {/* featured star */}
                    <col style={{ width: "60px" }} />
                    {/* actions */}
                    <col style={{ width: "120px" }} />
                  </colgroup>

                  <thead>
                    <tr className="bg-muted/60">
                      <th className="border-b border-border py-2.5 pl-4 pr-0">
                        <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
                      </th>
                      <th style={thStyle}>Event</th>
                      <th style={thStyle}>Category</th>
                      <th style={thStyle}>Date</th>
                      <th className="col-hide-md" style={thStyle}>Location</th>
                      <th className="col-hide-sm" style={thStyle}>Attendance</th>
                      <th style={thStyle}>Status</th>
                      <th className="col-hide-lg" style={thStyle}>Organizer</th>
                      <th style={{ ...thStyle, textAlign: "center" }}>Featured</th>
                      <th style={{ ...thStyle, textAlign: "right", paddingRight: "16px" }}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-14 text-center text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-[18px] w-[18px] animate-spin" />
                            Loading events…
                          </span>
                        </td>
                      </tr>
                    ) : filteredEvents.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-14 text-center text-sm text-muted-foreground">
                          No events found
                        </td>
                      </tr>
                    ) : (
                      filteredEvents.map((event) => (
                        <EventRow
                          key={event.id}
                          event={event}
                          selected={selectedEvents.has(event.id)}
                          onSelect={handleSelectEvent}
                          onEdit={onEdit}
                          onView={onView}
                          onStatusChange={onStatusChange}
                          onFeatureToggle={onFeatureToggle}
                          onVipToggle={onVipToggle}
                          onPublicToggle={onPublicToggle}
                          onDelete={onDelete}
                          onApprove={onApprove}
                          onPromote={onPromote}
                          onVerify={onVerify}
                          getStatusColor={getStatusColor}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {!isMailTab && !loading && pagination.totalPages > 1 && (
              <div className="border-t border-border px-4">
                <Pagination page={page} totalPages={pagination.totalPages} onPageChange={onPageChange} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}