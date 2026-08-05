// app/admin-dashboard/events/components/EventRow.tsx
"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit, Star, Eye, Trash2 } from "lucide-react"
import { getCategoryDisplay } from "../types/event.types"
import type { Event } from "../types/event.types"
import { EventActions } from "./EventActions"
import { AppImage } from "@/components/app-image"
import { getEventDisplayImageUrl } from "@/lib/default-event-image"
import { eventPublicPath } from "@/lib/event-path"
import { getPlanDisplayName, getPlanColor } from "@/lib/subscription-features"

interface EventRowProps {
  event: Event
  selected?: boolean
  onSelect?: (eventId: string, checked: boolean) => void
  onEdit: (event: Event) => void
  onView?: (event: Event) => void
  onStatusChange: (eventId: string, status: Event["status"]) => void
  onFeatureToggle: (eventId: string, current: boolean) => void
  onVipToggle: (eventId: string, current: boolean) => void
  onPublicToggle: (eventId: string, current: boolean) => void
  onDelete: (eventId: string) => void
  onPromote: (event: Event) => void
  onVerify: (event: Event) => void
  getStatusColor: (status: Event["status"]) => "default" | "secondary" | "destructive" | "outline"
}

function getEventStatusByDate(event: Event): "Live" | "Upcoming" | "Ended" | "Draft" {
  if (event.status === "Draft") return "Draft"
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const startDate = new Date(event.date); startDate.setHours(0, 0, 0, 0)
  const endDate = event.endDate ? new Date(event.endDate) : new Date(event.date)
  endDate.setHours(23, 59, 59, 999)
  if (today >= startDate && today <= endDate) return "Live"
  if (today < startDate) return "Upcoming"
  if (today > endDate) return "Ended"
  return "Upcoming"
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const startMonth = start.toLocaleDateString("en-US", { month: "short" })
  const startDay = start.getDate()
  const endMonth = end.toLocaleDateString("en-US", { month: "short" })
  const endDay = end.getDate()
  const year = start.getFullYear()
  if (startMonth === endMonth) return `${startMonth} ${startDay}–${endDay}, ${year}`
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`
}

function getOrganizerInitials(companyName: string): string {
  const words = companyName.split(" ").filter((w) => w.length > 0)
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
  return words.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("")
}

const ORGANIZER_COLORS = [
  { bg: "#e3f2fd", text: "#1565c0" },
  { bg: "#f3e5f5", text: "#6a1b9a" },
  { bg: "#fce4ec", text: "#880e4f" },
  { bg: "#e8f5e9", text: "#1b5e20" },
  { bg: "#fff3e0", text: "#e65100" },
  { bg: "#e8eaf6", text: "#283593" },
  { bg: "#fef3c7", text: "#92400e" },
  { bg: "#d1fae5", text: "#065f46" },
  { bg: "#fee2e2", text: "#991b1b" },
  { bg: "#dbeafe", text: "#1e40af" },
]

function getOrganizerColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return ORGANIZER_COLORS[Math.abs(hash) % ORGANIZER_COLORS.length]
}

function OrganizerAvatar({ name }: { name: string }) {
  const { bg, text } = getOrganizerColor(name)
  return (
    <div
      style={{
        width: "28px", height: "28px", borderRadius: "50%",
        background: bg, color: text,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "11px", fontWeight: 700, flexShrink: 0, letterSpacing: "0.02em",
      }}
    >
      {getOrganizerInitials(name) || "?"}
    </div>
  )
}

// Plan Badge Component
function PlanBadge({ planSlug, isLoading }: { planSlug?: string; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '1px 8px',
          borderRadius: '12px',
          fontSize: '9px',
          fontWeight: 500,
          background: '#F3F4F6',
          color: '#9CA3AF',
          marginLeft: '4px',
          whiteSpace: 'nowrap',
        }}
      >
        ...
      </span>
    )
  }
  
  if (!planSlug || planSlug === 'organizer-free' || planSlug === 'organizer-silver') return null
  
  const name = getPlanDisplayName(planSlug)
  const colors = getPlanColor(planSlug)
  
  // Only show for Gold and Platinum
  if (!['organizer-gold', 'organizer-platinum'].includes(planSlug)) return null
  
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '1px 8px',
        borderRadius: '12px',
        fontSize: '9px',
        fontWeight: 700,
        background: colors.bg,
        color: colors.text,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginLeft: '4px',
        whiteSpace: 'nowrap',
      }}
    >
      {name}
    </span>
  )
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  "Summit": { bg: "#dcfce7", text: "#166534" },
  "Expo": { bg: "#ede9fe", text: "#5b21b6" },
  "Conference": { bg: "#dbeafe", text: "#1d4ed8" },
  "Workshop": { bg: "#fce7f3", text: "#9d174d" },
  "Trade Show": { bg: "#ffedd5", text: "#c2410c" },
  "Virtual": { bg: "#e0e7ff", text: "#3730a3" },
  "Auto & Automotive": { bg: "#fce7f3", text: "#be185d" },
  "Agriculture & Forestry": { bg: "#dcfce7", text: "#166534" },
  "Security & Defense": { bg: "#fee2e2", text: "#991b1b" },
  "Technology": { bg: "#dbeafe", text: "#1e40af" },
  "Healthcare": { bg: "#d1fae5", text: "#065f46" },
  "Finance": { bg: "#fef3c7", text: "#92400e" },
  "Minerals & Metals": { bg: "#fef3c7", text: "#92400e" },
  "Packing & Packaging": { bg: "#e0e7ff", text: "#3730a3" },
  "Food & Beverages": { bg: "#dcfce7", text: "#166534" },
  "Chemicals": { bg: "#fee2e2", text: "#991b1b" },
  "Industrial Engineering": { bg: "#f3f4f6", text: "#374151" },
  "Building & Construction": { bg: "#dbeafe", text: "#1d4ed8" },
}

function CategoryPill({ name }: { name: string }) {
  const style = CATEGORY_STYLES[name] || { bg: "#f3f4f6", text: "#374151" }
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 9px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: 600,
        background: style.bg,
        color: style.text,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: "100%",
      }}
    >
      {name}
    </span>
  )
}

function StatusPill({ status }: { status: "Live" | "Upcoming" | "Ended" | "Draft" }) {
  const STYLES = {
    Live: { bg: "#dcfce7", dot: "#16a34a", text: "#15803d" },
    Upcoming: { bg: "#dbeafe", dot: "#3b82f6", text: "#1d4ed8" },
    Ended: { bg: "#f3f4f6", dot: "#9ca3af", text: "#6b7280" },
    Draft: { bg: "#fef9c3", dot: "#ca8a04", text: "#a16207" },
  }
  const s = STYLES[status]
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: "5px",
        padding: "3px 9px", borderRadius: "20px",
        fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap",
        background: s.bg, color: s.text,
      }}
    >
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  )
}

function getOrganizerCompanyName(organizer: any): string {
  if (!organizer) return "Unknown"
  if (typeof organizer === "string") return organizer
  if (organizer.company?.trim()) return organizer.company
  if (organizer.companyName?.trim()) return organizer.companyName
  if (organizer.name?.trim()) return organizer.name
  if (organizer.organizerName?.trim()) return organizer.organizerName
  return "Unknown"
}

// Shared truncation style — works with table-layout: fixed
const truncStyle: React.CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  maxWidth: 0,
}

export function EventRow({
  event,
  selected = false,
  onSelect,
  onEdit,
  onView,
  onStatusChange,
  onFeatureToggle,
  onVipToggle,
  onPublicToggle,
  onDelete,
  onPromote,
  onVerify,
}: EventRowProps) {
  const router = useRouter()
  const organizerName = getOrganizerCompanyName(event.organizer)
  const attendees = event.attendees || event.currentAttendees || 0
  const categoryDisplay = getCategoryDisplay(event.category)
  const liveStatus = getEventStatusByDate(event)

  // Get plan slug from event
  const planSlug = (event as any).organizerPlanSlug || 'organizer-free'
  const isLoadingPlan = (event as any)._loadingPlan === true

  console.log(`🎯 EventRow: ${event.title} - Plan: ${planSlug}, Loading: ${isLoadingPlan}`)

  const dateRange = formatDateRange(
    event.startDate || event.date,
    event.endDate || event.date,
  )

  const locationParts = (event.location || `${event.city || ""}, ${event.country || ""}`).split(",").map((p) => p.trim())
  const city = locationParts[0] || event.city || ""
  const country = locationParts[locationParts.length - 1] || event.country || ""

  const regionTag = ((): string => {
    const loc = (event.location || `${event.city || ""} ${event.country || ""}`).toLowerCase()
    if (loc.includes("india") || loc.includes("singapore") || loc.includes("japan") || loc.includes("china") || loc.includes("australia")) return "APAC"
    if (loc.includes("germany") || loc.includes("france") || loc.includes("uk") || loc.includes("london") || loc.includes("amsterdam")) return "EU"
    if (loc.includes("usa") || loc.includes("canada") || loc.includes("new york") || loc.includes("chicago") || loc.includes("united states")) return "NA"
    if (loc.includes("dubai") || loc.includes("uae") || loc.includes("saudi") || loc.includes("qatar")) return "ME"
    return ""
  })()

  const eventDisplayTitle = event.subTitle || event.shortDescription || event.title
  const locationDisplay = city
    ? `${city}${country && country !== city ? `, ${country}` : ""}`
    : "—"

  const isFeatured = event.featured || event.isFeatured || false

  const openEventPage = () => {
    if (onView) {
      onView(event)
      return
    }
    router.push(eventPublicPath({ id: event.id, slug: event.slug }))
  }

  return (
    <tr
      className="event-table-row"
      style={{ borderBottom: "1px solid #F5F5F5", background: "#fff", transition: "background 0.1s" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "#FAFAFA" }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "#fff" }}
    >
      {/* ── Checkbox ── */}
      <td style={{ padding: "0 0 0 16px", verticalAlign: "middle", width: "44px" }}>
        {onSelect && (
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onSelect(event.id, checked === true)}
          />
        )}
      </td>

      {/* ── Event: thumbnail + title + location ── */}
      <td
        style={{ padding: "10px 8px 10px 10px", verticalAlign: "middle", cursor: "pointer", ...truncStyle }}
        onClick={openEventPage}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            openEventPage()
          }
        }}
        role="link"
        tabIndex={0}
        title={`View ${eventDisplayTitle}`}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <div
            style={{
              position: "relative", width: "38px", height: "38px",
              borderRadius: "7px", background: "#F4F4F5", overflow: "hidden",
              flexShrink: 0, border: "1px solid #ECECEC",
            }}
          >
            <AppImage
              src={getEventDisplayImageUrl({
                thumbnailImage: event.thumbnailImage,
                bannerImage: event.bannerImage,
                vipImage: event.vipImage,
                images: event.images,
              })}
              alt={eventDisplayTitle}
              fill
              sizes="38px"
              className="object-cover"
            />
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              title={eventDisplayTitle}
              style={{ fontSize: "13px", fontWeight: 600, color: "#18181B", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              className="hover:text-[#004A96] hover:underline"
            >
              {eventDisplayTitle}
            </div>
            <div
              title={locationDisplay}
              style={{ fontSize: "11px", color: "#A1A1AA", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {regionTag && <span style={{ marginRight: "4px", fontWeight: 600 }}>{regionTag}</span>}
              {city}{country && country !== city ? `, ${country}` : ""}
            </div>
          </div>
        </div>
      </td>

      {/* ── Category ── */}
      <td style={{ padding: "10px 8px", verticalAlign: "middle", overflow: "hidden" }}>
        <CategoryPill name={categoryDisplay} />
      </td>

      {/* ── Date ── */}
      <td style={{ padding: "10px 8px", verticalAlign: "middle", ...truncStyle }}>
        <span title={dateRange} style={{ fontSize: "12px", color: "#52525B", fontWeight: 500 }}>
          {dateRange}
        </span>
      </td>

      {/* ── Location (hidden ≤768px) ── */}
      <td className="col-hide-md" style={{ padding: "10px 8px", verticalAlign: "middle", ...truncStyle }}>
        <span title={locationDisplay} style={{ fontSize: "12px", color: "#52525B" }}>
          {locationDisplay}
        </span>
      </td>

      {/* ── Attendance (hidden ≤640px) ── no truncStyle: numbers must never clip */}
      <td className="col-hide-sm" style={{ padding: "10px 8px", verticalAlign: "middle" }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: "#18181B" }}>
          {attendees.toLocaleString()}
        </span>
      </td>

      {/* ── Status ── no truncStyle: pill must not disappear */}
      <td style={{ padding: "10px 8px", verticalAlign: "middle" }}>
        <StatusPill status={liveStatus} />
      </td>

      {/* ── Organizer (hidden ≤1024px) with Plan Badge ── */}
      <td className="col-hide-lg" style={{ padding: "10px 8px", verticalAlign: "middle", ...truncStyle }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <OrganizerAvatar name={organizerName} />
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              overflow: 'hidden',
              minWidth: 0,
            }}
          >
            <span
              title={organizerName}
              style={{
                fontSize: "12px",
                color: "#52525B",
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {organizerName}
            </span>
            <PlanBadge planSlug={planSlug} isLoading={isLoadingPlan} />
          </span>
        </div>
      </td>

      {/* ── Featured star ── */}
      <td style={{ padding: "10px 6px", textAlign: "center", verticalAlign: "middle" }}>
        <button
          onClick={() => onFeatureToggle(event.id, isFeatured)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", lineHeight: 1 }}
          title={isFeatured ? "Remove from featured" : "Mark as featured"}
        >
          <Star
            style={{
              width: "15px", height: "15px",
              fill: isFeatured ? "#F59E0B" : "none",
              color: isFeatured ? "#F59E0B" : "#D4D4D8",
              transition: "all 0.15s",
            }}
          />
        </button>
      </td>

      {/* ── Actions ── always visible; hover reveals them more prominently via CSS ── */}
      <td style={{ padding: "10px 10px 10px 2px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
        <div
          className="row-actions"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
            opacity: 0.45,
            transition: "opacity 0.15s",
          }}
        >
          {/* View */}
          <Button
            variant="ghost"
            size="icon"
            onClick={openEventPage}
            className="h-7 w-7 hover:bg-blue-50 hover:text-blue-600"
            title="View public event page"
            style={{ color: "#71717A" }}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>

          {/* Edit */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(event)}
            className="h-7 w-7 hover:bg-green-50 hover:text-green-600"
            title="Edit event"
            style={{ color: "#71717A" }}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>

          {/* Delete */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(event.id)}
            className="h-7 w-7 hover:bg-red-50 hover:text-red-600"
            title="Delete event"
            style={{ color: "#71717A" }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>

          {/* More actions dropdown */}
          <EventActions
            event={{
              ...event,
              _loadingPlan: isLoadingPlan
            }}
            onStatusChange={onStatusChange}
            onFeatureToggle={onFeatureToggle}
            onVipToggle={onVipToggle}
            onPublicToggle={onPublicToggle}
            onDelete={onDelete}
            onPromote={onPromote}
            onVerify={onVerify}
          />
        </div>
      </td>
    </tr>
  )
}