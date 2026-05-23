"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit, Star, Eye, Trash2 } from "lucide-react"
import { getCategoryDisplay } from "../types/event.types"
import type { Event } from "../types/event.types"
import { EventActions } from "./EventActions"
import { AppImage } from "@/components/app-image"
import { getEventDisplayImageUrl } from "@/lib/default-event-image"

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
  // Get initials from company name (first letters of each word, max 2 letters)
  const words = companyName.split(" ").filter(w => w.length > 0)
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase()
  }
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
    <div style={{
      width: "28px", height: "28px", borderRadius: "50%",
      background: bg, color: text,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "11px", fontWeight: 700, flexShrink: 0, letterSpacing: "0.02em",
    }}>
      {getOrganizerInitials(name) || "?"}
    </div>
  )
}

// Category pill colors
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
}

function CategoryPill({ name }: { name: string }) {
  const style = CATEGORY_STYLES[name] || { bg: "#f3f4f6", text: "#374151" }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "4px 12px", borderRadius: "20px",
      fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap",
      background: style.bg, color: style.text,
    }}>
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
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "4px 12px", borderRadius: "20px",
      fontSize: "12px", fontWeight: 600,
      background: s.bg, color: s.text,
    }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  )
}

// FIXED: Strongly prioritize company over personal name
function getOrganizerCompanyName(organizer: any): string {
  if (!organizer) return "Unknown"

  // If organizer is string
  if (typeof organizer === "string") {
    return organizer
  }

  // PRIORITY 1 → company
  if (organizer.company && organizer.company.trim() !== "") {
    return organizer.company
  }

  // PRIORITY 2 → companyName
  if (organizer.companyName && organizer.companyName.trim() !== "") {
    return organizer.companyName
  }

  // PRIORITY 3 → name
  if (organizer.name && organizer.name.trim() !== "") {
    return organizer.name
  }

  // PRIORITY 4 → organizerName
  if (organizer.organizerName && organizer.organizerName.trim() !== "") {
    return organizer.organizerName
  }

  return "Unknown"
}

// Capacity bar color
function barColor(attendees: number, capacity: number): string {
  if (!capacity) return "#22c55e"
  const pct = attendees / capacity
  if (pct > 0.8) return "#ef4444"
  if (pct > 0.5) return "#f59e0b"
  return "#22c55e"
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
  const [isHovered, setIsHovered] = useState(false)

  // Debug logs
  console.log("====================================")
  console.log("📌 EVENT TITLE:", event.title)
  console.log("👤 RAW ORGANIZER DATA:", JSON.stringify(event.organizer, null, 2))

  // Get company name using the improved function
  const organizerName =
    typeof event.organizer === "object" && event.organizer !== null
      ? event.organizer.company ||
      "Unknown"
      : event.organizer || "Unknown"

  console.log("🏢 FINAL ORGANIZER DISPLAY NAME:", organizerName)
  console.log("====================================")

  // Use currentAttendees if attendees is not available
  const attendees = event.attendees || event.currentAttendees || 0
  const maxCapacity = event.maxCapacity || event.maxAttendees || 0
  const fillPct = maxCapacity
    ? Math.min(100, (attendees / maxCapacity) * 100)
    : Math.min(100, attendees / 100)

  const categoryDisplay = getCategoryDisplay(event.category)
  const liveStatus = getEventStatusByDate(event)

  // Use startDate/endDate if date is not available
  const dateRange = formatDateRange(
    event.startDate || event.date,
    event.endDate || event.date
  )

  const locationParts = (event.location || `${event.city || ""}, ${event.country || ""}`).split(",").map(p => p.trim())
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
  const venueName = event.venue || ""

  return (
    <tr
      style={{
        borderBottom: "1px solid #F5F5F5",
        background: isHovered ? "#FAFAFA" : "#fff",
        transition: "background 0.1s",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Checkbox */}
      {onSelect && (
        <td style={{ padding: "0 0 0 22px", width: "48px", verticalAlign: "middle" }}>
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onSelect(event.id, checked === true)}
          />
        </td>
      )}

      {/* Event column */}
      <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Thumbnail */}
          <div style={{
            position: "relative",
            width: "46px", height: "46px", borderRadius: "10px",
            background: "#F4F4F5", overflow: "hidden", flexShrink: 0,
            border: "1px solid #ECECEC",
          }}>
            <AppImage
              src={getEventDisplayImageUrl({
                thumbnailImage: event.thumbnailImage,
                bannerImage: event.bannerImage,
                images: event.images,
              })}
              alt={eventDisplayTitle}
              fill
              sizes="46px"
              className="object-cover"
            />
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#18181B", lineHeight: 1.3 }}>
              {eventDisplayTitle}
            </div>
            <div style={{ fontSize: "12px", color: "#A1A1AA", marginTop: "3px" }}>
              {regionTag && <span style={{ marginRight: "6px", fontWeight: 600 }}>{regionTag}</span>}
              {venueName && <span>{venueName}{city ? ` · ` : ""}</span>}
              {city}{country && country !== city ? `, ${country}` : ""}
            </div>
          </div>
        </div>
      </td>

      {/* Category */}
      <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
        <CategoryPill name={categoryDisplay} />
      </td>

      {/* Date */}
      <td style={{ padding: "14px 16px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: "13px", color: "#52525B", fontWeight: 500 }}>{dateRange}</span>
      </td>

      {/* Location */}
      <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
        <span style={{ fontSize: "13px", color: "#52525B" }}>
          {city}{country && country !== city ? `, ${country}` : city || "—"}
        </span>
      </td>

      {/* Attendance */}
      <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{
            fontSize: "13px", fontWeight: 700, color: "#18181B", minWidth: "44px",
          }}>
            {attendees.toLocaleString()}
          </span>
          <div style={{ width: "64px", height: "4px", background: "#E4E4E7", borderRadius: "999px", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: "999px",
              width: `${fillPct}%`,
              background: barColor(attendees, maxCapacity),
              transition: "width 0.3s",
            }} />
          </div>
        </div>
      </td>

      {/* Status */}
      <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
        <StatusPill status={liveStatus} />
      </td>

      {/* Organizer - Shows COMPANY NAME */}
      <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap" }}>
          <OrganizerAvatar name={organizerName} />
          <span style={{ fontSize: "13px", color: "#52525B", fontWeight: 500 }}>
            {organizerName}
          </span>
        </div>
      </td>

      {/* Featured star */}
      <td style={{ padding: "14px 16px", textAlign: "center", verticalAlign: "middle" }}>
        <button
          onClick={() => onFeatureToggle(event.id, event.featured || event.isFeatured || false)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", lineHeight: 1 }}
          title={event.featured || event.isFeatured ? "Remove from featured" : "Mark as featured"}
        >
          <Star style={{
            width: "16px", height: "16px",
            fill: (event.featured || event.isFeatured) ? "#F59E0B" : "none",
            color: (event.featured || event.isFeatured) ? "#F59E0B" : "#D4D4D8",
            transition: "all 0.15s",
          }} />
        </button>
      </td>

      {/* Actions */}
      <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "2px",
          opacity: isHovered ? 1 : 0,
          pointerEvents: isHovered ? "auto" : "none",
          transition: "opacity 0.15s",
        }}>
          <Button
            variant="ghost" size="icon"
            onClick={() => onEdit(event)}
            className="h-7 w-7 text-gray-400 hover:text-blue-600"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          {onView && (
            <Button
              variant="ghost" size="icon"
              onClick={() => onView(event)}
              className="h-7 w-7 text-gray-400 hover:text-green-600"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost" size="icon"
            onClick={() => onDelete(event.id)}
            className="h-7 w-7 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <EventActions
            event={event}
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