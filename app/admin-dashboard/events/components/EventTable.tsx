"use client"

import { useMemo, useState, type CSSProperties } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Download, Search, Mail } from "lucide-react"
import { EventRow } from "./EventRow"
import type { Event, Category } from "../types/event.types"
import { getOrganizerDisplay, getCategoryDisplay } from "../types/event.types"
import type { EventMailCandidate } from "../services/events.api"
import { useToast } from "@/hooks/use-toast"

interface EventTableProps {
  events: Event[]
  searchTerm: string
  selectedStatus: string
  selectedCategory: string
  activeTab: string
  eventCounts: Record<string, number>
  categories: Category[]
  onEdit: (event: Event) => void
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
    case "Approved":
      return "default"
    case "Pending Review":
      return "secondary"
    case "Flagged":
    case "Rejected":
      return "destructive"
    case "Draft":
      return "outline"
    default:
      return "secondary"
  }
}

function getEventDateStatus(event: Event): "Live" | "Upcoming" | "Ended" | "Draft" {
  if (event.status === "Draft") return "Draft"
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startDate = new Date(event.date)
  startDate.setHours(0, 0, 0, 0)
  const endDate = event.endDate ? new Date(event.endDate) : new Date(event.date)
  endDate.setHours(23, 59, 59, 999)
  if (today >= startDate && today <= endDate) return "Live"
  if (today < startDate) return "Upcoming"
  if (today > endDate) return "Ended"
  return "Upcoming"
}

function filterEvents(
  events: Event[],
  tab: string,
  searchTerm: string,
  selectedStatus: string,
  categoryFilter: string,
  regionFilter: string,
  industryFilter: string,
  sortBy: string,
): Event[] {
  let filtered = events.filter((event) => {
    const organizerStr = getOrganizerDisplay(event.organizer)
    const matchesSearch =
      searchTerm === "" ||
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      organizerStr.toLowerCase().includes(searchTerm.toLowerCase())

    let matchesStatusFilter = true
    if (selectedStatus !== "all") {
      const dateStatus = getEventDateStatus(event)
      if (selectedStatus === "live") matchesStatusFilter = dateStatus === "Live"
      else if (selectedStatus === "upcoming") matchesStatusFilter = dateStatus === "Upcoming"
      else if (selectedStatus === "ended") matchesStatusFilter = dateStatus === "Ended"
      else if (selectedStatus === "draft") matchesStatusFilter = dateStatus === "Draft"
      else if (selectedStatus === "pendingreview") matchesStatusFilter = event.status === "Pending Review"
      else if (selectedStatus === "approved") matchesStatusFilter = event.status === "Approved"
    }

    const categoryStr = getCategoryDisplay(event.category).toLowerCase()
    const matchesCategory = categoryFilter === "all" || categoryStr === categoryFilter

    const locationStr = (event.location || "").toLowerCase()
    const matchesRegion =
      regionFilter === "all" ||
      (regionFilter === "apac" &&
        (locationStr.includes("india") ||
          locationStr.includes("singapore") ||
          locationStr.includes("japan") ||
          locationStr.includes("china") ||
          locationStr.includes("australia") ||
          locationStr.includes("apac"))) ||
      (regionFilter === "eu" &&
        (locationStr.includes("germany") ||
          locationStr.includes("france") ||
          locationStr.includes("uk") ||
          locationStr.includes("london") ||
          locationStr.includes("europe") ||
          locationStr.includes("eu"))) ||
      (regionFilter === "na" &&
        (locationStr.includes("usa") ||
          locationStr.includes("canada") ||
          locationStr.includes("new york") ||
          locationStr.includes("chicago") ||
          locationStr.includes("los angeles") ||
          locationStr.includes("united states"))) ||
      (regionFilter === "me" &&
        (locationStr.includes("dubai") ||
          locationStr.includes("uae") ||
          locationStr.includes("saudi") ||
          locationStr.includes("middle east") ||
          locationStr.includes("qatar")))

    const matchesIndustry =
      industryFilter === "all" ||
      (industryFilter === "tech" &&
        (categoryStr.includes("tech") || categoryStr.includes("summit") || categoryStr.includes("conference"))) ||
      (industryFilter === "health" &&
        (categoryStr.includes("health") || categoryStr.includes("med") || categoryStr.includes("pharma"))) ||
      (industryFilter === "finance" &&
        (categoryStr.includes("finance") || categoryStr.includes("fintech") || categoryStr.includes("banking"))) ||
      (industryFilter === "manufacturing" &&
        (categoryStr.includes("manuf") || categoryStr.includes("expo") || categoryStr.includes("industrial")))

    let matchesTab = true
    if (tab === "live") matchesTab = getEventDateStatus(event) === "Live"
    else if (tab === "upcoming") matchesTab = getEventDateStatus(event) === "Upcoming"
    else if (tab === "ended") matchesTab = getEventDateStatus(event) === "Ended"
    else if (tab === "draft") matchesTab = event.status === "Draft"
    else if (tab === "pending") matchesTab = event.status === "Pending Review"
    else if (tab === "approved") matchesTab = event.status === "Approved"
    else if (tab === "flagged") matchesTab = event.status === "Flagged"
    else if (tab === "featured") matchesTab = event.featured === true
    else if (tab === "vip") matchesTab = event.vip === true
    else if (tab === "verified") matchesTab = event.isVerified === true

    return matchesSearch && matchesStatusFilter && matchesCategory && matchesRegion && matchesIndustry && matchesTab
  })

  if (sortBy === "name") filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title))
  else if (sortBy === "attendance") filtered = [...filtered].sort((a, b) => (b.attendees || 0) - (a.attendees || 0))
  else filtered = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return filtered
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

  const headers = [
    "Event Title",
    "Category",
    "Start Date",
    "End Date",
    "Location",
    "City",
    "Country",
    "Venue",
    "Attendees",
    "Capacity",
    "Status",
    "Organizer",
    "Featured",
    "VIP",
    "Verified",
    "Created At",
  ]

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
    if (!map.has(key)) {
      map.set(key, { organizerEmail: email, organizerName: c.organizerName || "", eventTitles: [] })
    }
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
  searchTerm,
  selectedStatus,
  selectedCategory,
  activeTab,
  eventCounts,
  categories,
  onEdit,
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
  const [localCategoryFilter, setLocalCategoryFilter] = useState("all")
  const [localRegionFilter, setLocalRegionFilter] = useState("all")
  const [localIndustryFilter, setLocalIndustryFilter] = useState("all")
  const [localSort, setLocalSort] = useState("date")
  const [localSearch, setLocalSearch] = useState(searchTerm)

  const groupedMail = useMemo(() => groupMailCandidates(mailCandidates), [mailCandidates])

  const filteredEvents =
    activeTab === "send-email"
      ? []
      : filterEvents(
          events,
          activeTab,
          localSearch,
          selectedStatus,
          localCategoryFilter,
          localRegionFilter,
          localIndustryFilter,
          localSort,
        )

  const allSelected = filteredEvents.length > 0 && filteredEvents.every((e) => selectedEvents.has(e.id))
  const selectedCount = selectedEvents.size
  const mailSelectedCount = selectedMailKeys.size
  const allMailSelected =
    groupedMail.length > 0 && groupedMail.every((g) => selectedMailKeys.has(g.key))

  const handleSelectEvent = (eventId: string, checked: boolean) => {
    const newSelected = new Set(selectedEvents)
    if (checked) newSelected.add(eventId)
    else newSelected.delete(eventId)
    setSelectedEvents(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedEvents(new Set(filteredEvents.map((e) => e.id)))
    else setSelectedEvents(new Set())
  }

  const handleBulkDelete = () => {
    if (selectedCount === 0) return
    if (confirm(`Are you sure you want to delete ${selectedCount} event(s)?`)) {
      const ids = Array.from(selectedEvents)
      ids.forEach((eventId) => onDelete(eventId))
      setSelectedEvents(new Set())
      if (onBulkDelete) onBulkDelete(ids)
    }
  }

  const handleExportCSV = () => {
    exportToCSV(filteredEvents)
  }

  const handleSendListingEmailForSelection = () => {
    const list = filteredEvents.filter((e) => selectedEvents.has(e.id))
    const by = new Map<string, { organizerEmail: string; eventTitles: string[] }>()
    for (const e of list) {
      const raw = (e.organizerEmail || "").trim()
      if (!raw) continue
      const k = raw.toLowerCase()
      if (!by.has(k)) by.set(k, { organizerEmail: raw, eventTitles: [] })
      by.get(k)!.eventTitles.push(e.title)
    }
    const items = [...by.values()].map((x) => ({
      organizerEmail: x.organizerEmail,
      eventTitles: [...new Set(x.eventTitles)],
    }))
    if (items.length === 0) {
      toast({
        title: "No organizer email",
        description:
          "None of the selected events have an organizer email. Add emails on organizer accounts or use the Send email tab for import / sub-admin listings.",
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
    void onSendListingEmailBulk(
      rows.map((r) => ({ organizerEmail: r.organizerEmail, eventTitles: r.eventTitles })),
    )
    setSelectedMailKeys(new Set())
  }

  const liveCount = events.filter((e) => getEventDateStatus(e) === "Live").length
  const upcomingCount = events.filter((e) => getEventDateStatus(e) === "Upcoming").length
  const endedCount = events.filter((e) => getEventDateStatus(e) === "Ended").length
  const draftCount = events.filter((e) => e.status === "Draft").length
  const featuredCount = events.filter((e) => e.featured).length
  const mailTabCount = eventCounts.mail ?? groupedMail.length

  const tabs = [
    { id: "all", label: "All", count: events.length, dot: null, star: false, mail: false },
    { id: "live", label: "Live", count: liveCount, dot: "#22C55E", star: false, mail: false },
    { id: "upcoming", label: "Upcoming", count: upcomingCount, dot: "#3B82F6", star: false, mail: false },
    { id: "ended", label: "Ended", count: endedCount, dot: "#71717A", star: false, mail: false },
    { id: "draft", label: "Draft", count: draftCount, dot: "#EAB308", star: false, mail: false },
    { id: "featured", label: "Featured", count: featuredCount, dot: null, star: true, mail: false },
    { id: "send-email", label: "Send email", count: mailTabCount, dot: null, star: false, mail: true },
  ]

  return (
    <div className="min-h-screen bg-[#F5F4F0] p-6">
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ position: "relative", maxWidth: "360px" }}>
            <Search
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "15px",
                height: "15px",
                color: "#a1a1aa",
              }}
            />
            <input
              placeholder="Search events or organizers…"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value)
                onSearchChange(e.target.value)
              }}
              style={{
                width: "100%",
                paddingLeft: "38px",
                paddingRight: "14px",
                paddingTop: "9px",
                paddingBottom: "9px",
                fontSize: "13px",
                border: "1px solid #E5E5E5",
                borderRadius: "10px",
                background: "#fff",
                outline: "none",
                color: "#18181B",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onTabChange(tab.id)
                  setSelectedEvents(new Set())
                  setSelectedMailKeys(new Set())
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 16px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: 500,
                  border: isActive ? "none" : "1.5px solid #E5E5E5",
                  background: isActive ? (tab.mail ? "#2563EB" : "#22C55E") : "#fff",
                  color: isActive ? "#fff" : "#374151",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                  boxShadow: isActive ? "0 1px 4px rgba(34,197,94,0.25)" : "none",
                }}
              >
                {tab.mail && <Mail style={{ width: "14px", height: "14px" }} />}
                {tab.dot && (
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: isActive ? "#fff" : tab.dot,
                      flexShrink: 0,
                    }}
                  />
                )}
                {tab.star && <span style={{ fontSize: "13px" }}>⭐</span>}
                {tab.label}
                {tab.count > 0 && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "1px 6px",
                      borderRadius: "999px",
                      background: isActive ? "rgba(255,255,255,0.25)" : "#F4F4F5",
                      color: isActive ? "#fff" : "#71717A",
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}

          <div style={{ flex: 1 }} />

          {activeTab !== "send-email" && (
            <>
              <select
                value={localCategoryFilter}
                onChange={(e) => {
                  setLocalCategoryFilter(e.target.value)
                  onCategoryFilterChange(e.target.value)
                }}
                style={{
                  height: "36px",
                  padding: "0 12px",
                  fontSize: "13px",
                  border: "1.5px solid #E5E5E5",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#374151",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <option value="all">All Categories</option>
                {categories
                  .filter((c) => c.isActive)
                  .map((cat) => (
                    <option key={cat.id} value={cat.name.toLowerCase()}>
                      {cat.name}
                    </option>
                  ))}
              </select>

              <select
                value={localRegionFilter}
                onChange={(e) => setLocalRegionFilter(e.target.value)}
                style={{
                  height: "36px",
                  padding: "0 12px",
                  fontSize: "13px",
                  border: "1.5px solid #E5E5E5",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#374151",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <option value="all">All Regions</option>
                <option value="apac">APAC</option>
                <option value="eu">EU</option>
                <option value="na">NA</option>
                <option value="me">ME</option>
              </select>

              <select
                value={localIndustryFilter}
                onChange={(e) => setLocalIndustryFilter(e.target.value)}
                style={{
                  height: "36px",
                  padding: "0 12px",
                  fontSize: "13px",
                  border: "1.5px solid #E5E5E5",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#374151",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <option value="all">All Industries</option>
                <option value="tech">Technology</option>
                <option value="health">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="manufacturing">Manufacturing</option>
              </select>

              <select
                value={localSort}
                onChange={(e) => setLocalSort(e.target.value)}
                style={{
                  height: "36px",
                  padding: "0 12px",
                  fontSize: "13px",
                  border: "1.5px solid #E5E5E5",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#374151",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <option value="date">Sort: Date ↓</option>
                <option value="name">Sort: Name</option>
                <option value="attendance">Sort: Attendance</option>
              </select>
            </>
          )}
        </div>

        <div style={{ background: "#fff", border: "1px solid #ECECEC", borderRadius: "16px", overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 22px",
              borderBottom: "1px solid #F0F0F0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "15px", fontWeight: 600, color: "#18181B" }}>
                {activeTab === "send-email" ? "Send listing email" : "Event Listings"}
              </span>
              <span style={{ fontSize: "13px", color: "#A1A1AA" }}>
                {activeTab === "send-email"
                  ? `${groupedMail.length} organizer mail groups`
                  : `${filteredEvents.length.toLocaleString()} events found`}
              </span>
              {activeTab !== "send-email" && selectedCount > 0 && (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: "999px",
                    background: "#DBEAFE",
                    color: "#2563EB",
                  }}
                >
                  {selectedCount} selected
                </span>
              )}
              {activeTab === "send-email" && mailSelectedCount > 0 && (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: "999px",
                    background: "#DBEAFE",
                    color: "#2563EB",
                  }}
                >
                  {mailSelectedCount} selected
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {activeTab === "send-email" && mailSelectedCount > 0 && (
                <Button
                  type="button"
                  size="sm"
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                  disabled={sendingMail}
                  onClick={() => handleBulkSendMail()}
                >
                  <Mail className="h-4 w-4" />
                  {sendingMail ? "Sending…" : `Send to ${mailSelectedCount} organizer(s)`}
                </Button>
              )}
              {activeTab !== "send-email" && selectedCount > 0 && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                    disabled={sendingMail}
                    onClick={() => handleSendListingEmailForSelection()}
                  >
                    <Mail className="h-4 w-4" />
                    {sendingMail ? "Sending…" : "Send listing email"}
                  </Button>
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                      border: "1px solid #FEE2E2",
                      background: "#FFF5F5",
                      color: "#EF4444",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 style={{ width: "13px", height: "13px" }} />
                    Delete Selected
                  </button>
                </>
              )}
              {activeTab !== "send-email" && (
                <button
                  type="button"
                  onClick={handleExportCSV}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 500,
                    border: "1.5px solid #E5E5E5",
                    background: "#fff",
                    color: "#374151",
                    cursor: "pointer",
                  }}
                >
                  <Download style={{ width: "13px", height: "13px" }} /> Export CSV
                </button>
              )}
            </div>
          </div>

          {activeTab === "send-email" ? (
            <div style={{ padding: "0 22px 22px" }}>
              <p style={{ fontSize: "13px", color: "#71717A", margin: "16px 0" }}>
                Emails are grouped by organizer. Select rows and send event listing messages (same as API mail
                candidates from sub-admin / bulk imports).
              </p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #F0F0F0", background: "#FAFAFA" }}>
                      <th style={{ padding: "11px 0 11px 22px", width: "48px" }}>
                        <Checkbox checked={allMailSelected} onCheckedChange={(c) => handleSelectAllMail(c === true)} />
                      </th>
                      <th
                        style={{
                          padding: "11px 16px",
                          textAlign: "left",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#A1A1AA",
                          letterSpacing: "0.07em",
                          textTransform: "uppercase",
                        }}
                      >
                        Organizer
                      </th>
                      <th
                        style={{
                          padding: "11px 16px",
                          textAlign: "left",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#A1A1AA",
                          letterSpacing: "0.07em",
                          textTransform: "uppercase",
                        }}
                      >
                        Email
                      </th>
                      <th
                        style={{
                          padding: "11px 16px",
                          textAlign: "left",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#A1A1AA",
                          letterSpacing: "0.07em",
                          textTransform: "uppercase",
                        }}
                      >
                        Events
                      </th>
                      <th style={{ padding: "11px 16px", width: "120px" }} />
                    </tr>
                  </thead>
                  <tbody>
                    {groupedMail.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{ textAlign: "center", padding: "56px", color: "#A1A1AA", fontSize: "14px" }}
                        >
                          No pending mail candidates. New sub-admin or bulk-import listings will appear here.
                        </td>
                      </tr>
                    ) : (
                      groupedMail.map((row) => (
                        <tr key={row.key} style={{ borderBottom: "1px solid #F5F5F5" }}>
                          <td style={{ padding: "12px 0 12px 22px" }}>
                            <Checkbox
                              checked={selectedMailKeys.has(row.key)}
                              onCheckedChange={(c) => handleSelectMailRow(row.key, c === true)}
                            />
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 500, color: "#18181B" }}>
                            {row.organizerName || "—"}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: "13px", color: "#52525B" }}>{row.organizerEmail}</td>
                          <td style={{ padding: "12px 16px", fontSize: "13px", color: "#52525B" }}>
                            <ul style={{ margin: 0, paddingLeft: "18px" }}>
                              {row.eventTitles.map((t) => (
                                <li key={t}>{t}</li>
                              ))}
                            </ul>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="whitespace-nowrap"
                              disabled={sendingMail && sendingMailFor === row.organizerEmail.toLowerCase()}
                              onClick={() => onSendListingEmail(row.organizerEmail, row.eventTitles)}
                            >
                              {sendingMail && sendingMailFor === row.organizerEmail.toLowerCase()
                                ? "Sending…"
                                : "Send"}
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1100px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #F0F0F0", background: "#FAFAFA" }}>
                    <th style={{ padding: "11px 0 11px 22px", width: "48px" }}>
                      <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
                    </th>
                    {[
                      { label: "EVENT", align: "left" },
                      { label: "CATEGORY", align: "left" },
                      { label: "DATE", align: "left" },
                      { label: "LOCATION", align: "left" },
                      { label: "ATTENDANCE", align: "left" },
                      { label: "STATUS", align: "left" },
                      { label: "ORGANIZER", align: "left" },
                      { label: "FEATURED", align: "center" },
                      { label: "", align: "left" },
                    ].map((h, i) => (
                      <th
                        key={i}
                        style={{
                          padding: "11px 16px",
                          textAlign: h.align as CSSProperties["textAlign"],
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#A1A1AA",
                          letterSpacing: "0.07em",
                          textTransform: "uppercase",
                        }}
                      >
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.length === 0 ? (
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
        </div>
      </div>
    </div>
  )
}
