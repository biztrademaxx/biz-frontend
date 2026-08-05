// app/admin-dashboard/events/components/EventTable.tsx
"use client"

import { useEffect, useMemo, useState, type CSSProperties } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Download, Search, Mail, Loader2, BadgeCheck } from "lucide-react"
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
    if (confirm(`Are you sure you want to delete ${selectedCount} event(s)?`)) {
      const ids = Array.from(selectedEvents)
      ids.forEach((id) => onDelete(id))
      setSelectedEvents(new Set())
      if (onBulkDelete) onBulkDelete(ids)
    }
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
    color: "#A1A1AA",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    borderBottom: "1px solid #F0F0F0",
  }

  const selectStyle: CSSProperties = {
    height: "34px",
    padding: "0 10px",
    fontSize: "13px",
    border: "1.5px solid #E5E5E5",
    borderRadius: "8px",
    background: "#fff",
    color: "#374151",
    cursor: "pointer",
    fontFamily: "inherit",
  }

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

      <div className="min-h-screen bg-[#F5F4F0] p-4 md:p-6">
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

          {/* ── Search bar ── */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ position: "relative", maxWidth: "340px" }}>
              <Search style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "#a1a1aa" }} />
              <input
                placeholder="Search events or organizers…"
                value={localSearch}
                onChange={(e) => { setLocalSearch(e.target.value); onSearchChange(e.target.value) }}
                style={{
                  width: "100%", paddingLeft: "34px", paddingRight: "12px",
                  paddingTop: "8px", paddingBottom: "8px",
                  fontSize: "13px", border: "1px solid #E5E5E5", borderRadius: "10px",
                  background: "#fff", outline: "none", color: "#18181B", fontFamily: "inherit",
                }}
              />
            </div>
          </div>

          {/* ── Tabs + Filters ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { onTabChange(tab.id); setSelectedEvents(new Set()); setSelectedMailKeys(new Set()) }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    padding: "6px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 500,
                    border: isActive ? "none" : "1.5px solid #E5E5E5",
                    background: isActive ? (tab.mail ? "#2563EB" : tab.verified ? "#059669" : "#22C55E") : "#fff",
                    color: isActive ? "#fff" : "#374151",
                    cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
                    boxShadow: isActive ? "0 1px 4px rgba(34,197,94,0.18)" : "none",
                  }}
                >
                  {tab.mail && <Mail style={{ width: "13px", height: "13px" }} />}
                  {tab.dot && (
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: isActive ? "#fff" : tab.dot, flexShrink: 0 }} />
                  )}
                  {tab.star && <span style={{ fontSize: "12px" }}>⭐</span>}
                  {tab.label}
                  {tab.count > 0 && (
                    <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 5px", borderRadius: "999px", background: isActive ? "rgba(255,255,255,0.25)" : "#F4F4F5", color: isActive ? "#fff" : "#71717A" }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}

            <div style={{ flex: 1 }} />

            {!isMailTab && (
              <>
                <select
                  value={selectedCategory}
                  onChange={(e) => onCategoryFilterChange(e.target.value)}
                  style={selectStyle}
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
                  style={selectStyle}
                >
                  <option value="all">All Countries</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select value={localSort} onChange={(e) => setLocalSort(e.target.value)} style={selectStyle}>
                  <option value="date">Sort: Date ↓</option>
                  <option value="name">Sort: Name</option>
                  <option value="attendance">Sort: Attendance</option>
                </select>
              </>
            )}
          </div>

          {/* ── Main card ── */}
          <div style={{ background: "#fff", border: "1px solid #ECECEC", borderRadius: "16px", overflow: "hidden" }}>

            {/* Card header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #F0F0F0", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "15px", fontWeight: 600, color: "#18181B" }}>
                  {activeTab === "send-email"
                    ? "Send listing email"
                    : activeTab === "email-verified"
                      ? "Email verified organizers"
                      : "Event Listings"}
                </span>
                <span style={{ fontSize: "13px", color: "#A1A1AA" }}>
                  {isMailTab
                    ? `${groupedMail.length} organizer mail groups`
                    : `${filteredEvents.length.toLocaleString()} events found`}
                </span>
                {!isMailTab && selectedCount > 0 && (
                  <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "999px", background: "#DBEAFE", color: "#2563EB" }}>
                    {selectedCount} selected
                  </span>
                )}
                {activeTab === "send-email" && mailSelectedCount > 0 && (
                  <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "999px", background: "#DBEAFE", color: "#2563EB" }}>
                    {mailSelectedCount} selected
                  </span>
                )}
                {isLoadingPlans && (
                  <span style={{ fontSize: "11px", color: "#A1A1AA", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} />
                    Loading plans...
                  </span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
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
                      className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                      disabled={sendingMail}
                      onClick={handleSendListingEmailForSelection}
                    >
                      <Mail className="h-4 w-4" />
                      {sendingMail ? "Sending…" : "Send listing email"}
                    </Button>
                    <button
                      type="button" onClick={handleBulkDelete}
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, border: "1px solid #FEE2E2", background: "#FFF5F5", color: "#EF4444", cursor: "pointer" }}
                    >
                      <Trash2 style={{ width: "13px", height: "13px" }} />
                      Delete Selected
                    </button>
                  </>
                )}
                {!isMailTab && (
                  <button
                    type="button" onClick={() => exportToCSV(filteredEvents)}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, border: "1.5px solid #E5E5E5", background: "#fff", color: "#374151", cursor: "pointer" }}
                  >
                    <Download style={{ width: "13px", height: "13px" }} /> Export CSV
                  </button>
                )}
              </div>
            </div>

            {/* ── Table content ── */}
            {isMailTab ? (

              /* Mail / verified organizer table */
              <div style={{ padding: "0 20px 20px" }}>
                <p style={{ fontSize: "13px", color: "#71717A", margin: "14px 0" }}>
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
                    <tr style={{ borderBottom: "1px solid #F0F0F0", background: "#FAFAFA" }}>
                      {activeTab === "send-email" && (
                        <th style={{ padding: "10px 0 10px 16px" }}>
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
                        <td colSpan={activeTab === "send-email" ? 5 : 4} style={{ textAlign: "center", padding: "56px", color: "#A1A1AA", fontSize: "14px" }}>
                          {activeTab === "email-verified"
                            ? "No verified organizers yet. Organizers appear here after they complete email OTP or password setup."
                            : "No unverified organizers pending email. All listing organizers have verified their email."}
                        </td>
                      </tr>
                    ) : (
                      groupedMail.map((row) => (
                        <tr key={row.key} style={{ borderBottom: "1px solid #F5F5F5" }}>
                          {activeTab === "send-email" && (
                            <td style={{ padding: "12px 0 12px 16px" }}>
                              <Checkbox checked={selectedMailKeys.has(row.key)} onCheckedChange={(c) => handleSelectMailRow(row.key, c === true)} />
                            </td>
                          )}
                          <td style={{ padding: "12px 8px", fontSize: "13px", fontWeight: 500, color: "#18181B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 0 }}>
                            {row.organizerName || "—"}
                          </td>
                          <td style={{ padding: "12px 8px", fontSize: "13px", color: "#52525B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 0 }}>
                            {row.organizerEmail}
                          </td>
                          <td style={{ padding: "12px 8px", fontSize: "13px", color: "#52525B" }}>
                            <ul style={{ margin: 0, paddingLeft: "16px" }}>
                              {row.eventTitles.map((t) => <li key={t}>{t}</li>)}
                            </ul>
                          </td>
                          <td style={{ padding: "12px 8px" }}>
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
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 600, color: "#059669", background: "#ECFDF5", padding: "4px 10px", borderRadius: "999px" }}>
                                <BadgeCheck style={{ width: "13px", height: "13px" }} />
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
              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
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
                    <tr style={{ background: "#FAFAFA" }}>
                      <th style={{ padding: "10px 0 10px 16px", borderBottom: "1px solid #F0F0F0" }}>
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
                        <td colSpan={10} style={{ textAlign: "center", padding: "56px", color: "#A1A1AA", fontSize: "14px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                            <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />
                            Loading events…
                          </span>
                        </td>
                      </tr>
                    ) : filteredEvents.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: "center", padding: "56px", color: "#A1A1AA", fontSize: "14px" }}>
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
              <div style={{ borderTop: "1px solid #F0F0F0", padding: "0 16px" }}>
                <Pagination page={page} totalPages={pagination.totalPages} onPageChange={onPageChange} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}