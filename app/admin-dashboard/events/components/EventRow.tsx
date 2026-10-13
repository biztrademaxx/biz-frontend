// app/admin-dashboard/events/components/EventRow.tsx
"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit, Star, Eye, Trash2, CheckCircle2 } from "lucide-react"
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
  onApprove?: (eventId: string) => void
  onPromote: (event: Event) => void
  onVerify: (event: Event) => void
  getStatusColor: (status: Event["status"]) => "default" | "secondary" | "destructive" | "outline"
}

function getEventStatusByDate(event: Event): "Live" | "Upcoming" | "Ended" | "Draft" | "Pending" {
  if (event.status === "Pending Review") return "Pending"
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
      <span className="ml-1 inline-block whitespace-nowrap rounded-xl bg-muted px-2 py-px text-[9px] font-medium text-muted-foreground">
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

const CATEGORY_CLASS: Record<string, string> = {
  "Summit": "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  "Expo": "bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300",
  "Conference": "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
  "Workshop": "bg-pink-100 text-pink-800 dark:bg-pink-500/20 dark:text-pink-300",
  "Trade Show": "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300",
  "Virtual": "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300",
  "Auto & Automotive": "bg-pink-100 text-pink-800 dark:bg-pink-500/20 dark:text-pink-300",
  "Agriculture & Forestry": "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  "Security & Defense": "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300",
  "Technology": "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
  "Healthcare": "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  "Finance": "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  "Minerals & Metals": "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  "Packing & Packaging": "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300",
  "Food & Beverages": "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  "Chemicals": "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300",
  "Industrial Engineering": "bg-muted text-foreground",
  "Building & Construction": "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
}

function CategoryPill({ name }: { name: string }) {
  const colorClass = CATEGORY_CLASS[name] || "bg-muted text-foreground"
  return (
    <span
      className={`inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${colorClass}`}
    >
      {name}
    </span>
  )
}

function StatusPill({ status }: { status: "Live" | "Upcoming" | "Ended" | "Draft" | "Pending" }) {
  const STYLES = {
    Live: { className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300", dot: "#16a34a" },
    Upcoming: { className: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300", dot: "#3b82f6" },
    Ended: { className: "bg-muted text-muted-foreground", dot: "#9ca3af" },
    Draft: { className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300", dot: "#ca8a04" },
    Pending: { className: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300", dot: "#eab308" },
  }
  const s = STYLES[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.className}`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: s.dot }} />
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
  onApprove,
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
    <tr className="event-table-row border-b border-border bg-card transition-colors hover:bg-muted/50">
      {/* ── Checkbox ── */}
      <td className="w-11 py-0 pl-4 align-middle">
        {onSelect && (
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onSelect(event.id, checked === true)}
          />
        )}
      </td>

      {/* ── Event: thumbnail + title + location ── */}
      <td
        className="cursor-pointer px-2 py-2.5 pl-2.5 align-middle"
        style={truncStyle}
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
        <div className="flex items-center gap-2">
          <div className="relative h-[38px] w-[38px] shrink-0 overflow-hidden rounded-[7px] border border-border bg-muted">
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
          <div className="min-w-0">
            <div
              title={eventDisplayTitle}
              className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold leading-tight text-foreground hover:text-[#004A96] hover:underline dark:hover:text-[#17F0F6]"
            >
              {eventDisplayTitle}
            </div>
            <div
              title={locationDisplay}
              className="mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-muted-foreground"
            >
              {regionTag && <span className="mr-1 font-semibold">{regionTag}</span>}
              {city}{country && country !== city ? `, ${country}` : ""}
            </div>
          </div>
        </div>
      </td>

      {/* ── Category ── */}
      <td className="overflow-hidden px-2 py-2.5 align-middle">
        <CategoryPill name={categoryDisplay} />
      </td>

      {/* ── Date ── */}
      <td className="px-2 py-2.5 align-middle" style={truncStyle}>
        <span title={dateRange} className="text-xs font-medium text-muted-foreground">
          {dateRange}
        </span>
      </td>

      {/* ── Location (hidden ≤768px) ── */}
      <td className="col-hide-md px-2 py-2.5 align-middle" style={truncStyle}>
        <span title={locationDisplay} className="text-xs text-muted-foreground">
          {locationDisplay}
        </span>
      </td>

      {/* ── Attendance (hidden ≤640px) ── no truncStyle: numbers must never clip */}
      <td className="col-hide-sm px-2 py-2.5 align-middle">
        <span className="text-[13px] font-bold text-foreground">
          {attendees.toLocaleString()}
        </span>
      </td>

      {/* ── Status ── no truncStyle: pill must not disappear */}
      <td className="px-2 py-2.5 align-middle">
        <StatusPill status={liveStatus} />
      </td>

      {/* ── Organizer (hidden ≤1024px) with Plan Badge ── */}
      <td className="col-hide-lg px-2 py-2.5 align-middle" style={truncStyle}>
        <div className="flex items-center gap-1.5">
          <OrganizerAvatar name={organizerName} />
          <span className="flex min-w-0 items-center gap-0.5 overflow-hidden">
            <span
              title={organizerName}
              className="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium text-muted-foreground"
            >
              {organizerName}
            </span>
            <PlanBadge planSlug={planSlug} isLoading={isLoadingPlan} />
          </span>
        </div>
      </td>

      {/* ── Featured star ── */}
      <td className="px-1.5 py-2.5 text-center align-middle">
        <button
          onClick={() => onFeatureToggle(event.id, isFeatured)}
          className="cursor-pointer border-0 bg-transparent p-1 leading-none"
          title={isFeatured ? "Remove from featured" : "Mark as featured"}
        >
          <Star
            className={`h-[15px] w-[15px] transition-all ${
              isFeatured ? "fill-amber-500 text-amber-500" : "text-muted-foreground/50"
            }`}
          />
        </button>
      </td>

      {/* ── Actions ── always visible; hover reveals them more prominently via CSS ── */}
      <td className="whitespace-nowrap py-2.5 pl-0.5 pr-2.5 align-middle">
        <div className="row-actions flex items-center gap-0.5 opacity-45 transition-opacity">
          {/* View */}
          <Button
            variant="ghost"
            size="icon"
            onClick={openEventPage}
            className="h-7 w-7 text-muted-foreground hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-[#17F0F6]/10 dark:hover:text-[#17F0F6]"
            title="View public event page"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>

          {/* Edit */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(event)}
            className="h-7 w-7 text-muted-foreground hover:bg-green-50 hover:text-green-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
            title="Edit event"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>

          {/* Approve pending */}
          {event.status === "Pending Review" && onApprove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onApprove(event.id)}
              className="h-7 w-7 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
              title="Approve & publish event"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Delete */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(event.id)}
            className="h-7 w-7 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-300"
            title="Delete event"
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
            onApprove={onApprove}
            onPromote={onPromote}
            onVerify={onVerify}
          />
        </div>
      </td>
    </tr>
  )
}