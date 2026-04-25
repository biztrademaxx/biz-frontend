"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ShieldCheck } from "lucide-react"
import { EventFilters } from "./EventFilters"
import { EventRow } from "./EventRow"
import type { Event, Category } from "../types/event.types"
import { getOrganizerDisplay, getCategoryDisplay } from "../types/event.types"

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
  onPromote: (event: Event) => void
  onVerify: (event: Event) => void
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onCategoryFilterChange: (value: string) => void
  onTabChange: (value: string) => void
  mailCandidates: Array<{
    source: "SUB_ADMIN" | "BULK_UPLOAD"
    eventTitle: string
    organizerEmail: string
    organizerName: string
    createdAt: string
  }>
  sendingMail: boolean
  sendingMailFor?: string | null
  onSendListingEmail: (organizerEmail: string, eventTitles: string[]) => Promise<void>
  onSendListingEmailBulk: (items: Array<{ organizerEmail: string; eventTitles: string[] }>) => Promise<void>
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

function filterEventsByTab(
  events: Event[],
  tab: string,
  searchTerm: string,
  selectedStatus: string,
  selectedCategory: string
): Event[] {
  const filtered = events.filter((event) => {
    const organizerStr = getOrganizerDisplay(event.organizer)
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      organizerStr.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      selectedStatus === "all" ||
      event.status.toLowerCase().replace(" ", "") === selectedStatus
    const categoryStr = getCategoryDisplay(event.category).toLowerCase()
    const matchesCategory =
      selectedCategory === "all" || categoryStr === selectedCategory
    return matchesSearch && matchesStatus && matchesCategory
  })
  switch (tab) {
    case "pending": return filtered.filter((e) => e.status === "Pending Review")
    case "approved": return filtered.filter((e) => e.status === "Approved")
    case "flagged": return filtered.filter((e) => e.status === "Flagged")
    case "featured": return filtered.filter((e) => e.featured)
    case "vip": return filtered.filter((e) => e.vip)
    case "verified": return filtered.filter((e) => e.isVerified)
    default: return filtered
  }
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
  const tabs = ["all", "pending", "approved", "flagged", "featured", "vip", "verified", "mail"]
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())
  const groupedMail = mailCandidates.reduce(
    (acc, row) => {
      const key = row.organizerEmail.toLowerCase()
      if (!acc[key]) acc[key] = { organizerEmail: row.organizerEmail, organizerName: row.organizerName, rows: [] as typeof mailCandidates }
      acc[key].rows.push(row)
      return acc
    },
    {} as Record<string, { organizerEmail: string; organizerName: string; rows: typeof mailCandidates }>,
  )
  const groupedMailRows = Object.values(groupedMail)
  const groupedByEmail = useMemo(
    () =>
      groupedMailRows.map((group) => {
        const titles = Array.from(new Set(group.rows.map((r) => r.eventTitle).filter(Boolean)))
        return { organizerEmail: group.organizerEmail, titles }
      }),
    [groupedMailRows]
  )
  const allSelected = groupedByEmail.length > 0 && groupedByEmail.every((g) => selectedEmails.has(g.organizerEmail.toLowerCase()))
  const selectedCount = groupedByEmail.filter((g) => selectedEmails.has(g.organizerEmail.toLowerCase())).length

  const toggleOne = (email: string, checked: boolean) => {
    const key = email.toLowerCase()
    setSelectedEmails((prev) => {
      const next = new Set(prev)
      if (checked) next.add(key)
      else next.delete(key)
      return next
    })
  }

  const toggleAll = (checked: boolean) => {
    if (!checked) {
      setSelectedEmails(new Set())
      return
    }
    setSelectedEmails(new Set(groupedByEmail.map((g) => g.organizerEmail.toLowerCase())))
  }

  const handleSendSelected = async () => {
    const items = groupedByEmail
      .filter((g) => selectedEmails.has(g.organizerEmail.toLowerCase()) && g.titles.length > 0)
      .map((g) => ({ organizerEmail: g.organizerEmail, eventTitles: g.titles }))
    if (items.length === 0) return
    await onSendListingEmailBulk(items)
    setSelectedEmails(new Set())
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
        <Badge className="bg-green-100 text-green-800">
          <ShieldCheck className="w-4 h-4 mr-1" />
          {eventCounts.verified} Verified
        </Badge>
      </div>
      <EventFilters
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        selectedStatus={selectedStatus}
        onStatusFilterChange={onStatusFilterChange}
        selectedCategory={selectedCategory}
        onCategoryFilterChange={onCategoryFilterChange}
        categories={categories}
      />
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="all">All ({eventCounts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({eventCounts.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({eventCounts.approved})</TabsTrigger>
          <TabsTrigger value="flagged">Flagged ({eventCounts.flagged})</TabsTrigger>
          <TabsTrigger value="featured">Featured ({eventCounts.featured})</TabsTrigger>
          <TabsTrigger value="vip">VIP ({eventCounts.vip})</TabsTrigger>
          <TabsTrigger value="verified">
            <ShieldCheck className="w-4 h-4 mr-1" />
            Verified ({eventCounts.verified})
          </TabsTrigger>
          <TabsTrigger value="mail">Mail ({eventCounts.mail ?? 0})</TabsTrigger>
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {tab !== "mail" ? (
              filterEventsByTab(events, tab, searchTerm, selectedStatus, selectedCategory).map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
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
            ) : groupedMailRows.length === 0 ? (
              <div className="rounded-lg border p-4 text-sm text-muted-foreground">No sub-admin or bulk-upload event listings found.</div>
            ) : (
              <>
                <div className="rounded-lg border p-3 bg-white flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => toggleAll(e.target.checked)}
                      className="h-4 w-4"
                    />
                    Select All
                  </label>
                  <Button size="sm" disabled={sendingMail || selectedCount === 0} onClick={handleSendSelected}>
                    {sendingMail ? "Sending..." : `Send Selected (${selectedCount})`}
                  </Button>
                </div>
                {groupedMailRows.map((group) => {
                  const titles = Array.from(new Set(group.rows.map((r) => r.eventTitle).filter(Boolean)))
                const isCurrentRowSending = sendingMail && sendingMailFor === group.organizerEmail.toLowerCase()
                return (
                  <div key={group.organizerEmail} className="rounded-lg border p-4 bg-white space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedEmails.has(group.organizerEmail.toLowerCase())}
                          onChange={(e) => toggleOne(group.organizerEmail, e.target.checked)}
                          className="h-4 w-4 mt-1"
                        />
                        <div>
                        <p className="font-medium text-gray-900">{group.organizerName || "Organizer"}</p>
                        <p className="text-sm text-gray-600">{group.organizerEmail}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        disabled={isCurrentRowSending || titles.length === 0}
                        onClick={() => onSendListingEmail(group.organizerEmail, titles)}
                      >
                        {isCurrentRowSending ? "Sending..." : "Send Mail"}
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">{titles.length}</span> event(s): {titles.join(", ")}
                    </div>
                  </div>
                )
                })}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
