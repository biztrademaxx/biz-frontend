"use client"

import { AppImage } from "@/components/app-image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  Building2,
  CheckCircle,
  Edit,
  Eye,
  Mail,
  MapPin,
  MoreHorizontal,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  XCircle,
} from "lucide-react"
import type { Venue, VenueCardAccent, VenueListingStatus } from "../types/venue.types"
import { VenueStatusBadge } from "./venue-status-badges"

const VENUE_CARD_ACCENT = {
  blue: {
    bar: "from-blue-500 to-indigo-500",
    ring: "ring-blue-100 dark:ring-primary/30",
    icon: "text-blue-600 dark:text-primary",
    pill: "bg-blue-50/80 text-blue-900 border-blue-100 dark:bg-muted dark:text-foreground dark:border-border",
    border: "border-slate-200/90 dark:border-border",
  },
  amber: {
    bar: "from-amber-400 to-orange-500",
    ring: "ring-amber-100 dark:ring-amber-500/30",
    icon: "text-amber-600 dark:text-amber-300",
    pill: "bg-amber-50/90 text-amber-950 border-amber-100 dark:bg-muted dark:text-foreground dark:border-border",
    border: "border-amber-200/80 dark:border-border",
  },
  emerald: {
    bar: "from-emerald-500 to-teal-500",
    ring: "ring-emerald-100 dark:ring-emerald-500/30",
    icon: "text-emerald-600 dark:text-emerald-300",
    pill: "bg-emerald-50/90 text-emerald-950 border-emerald-100 dark:bg-muted dark:text-foreground dark:border-border",
    border: "border-emerald-200/80 dark:border-border",
  },
} as const

function VenueThumbnail({
  src,
  alt,
  accent,
}: {
  src: string
  alt: string
  accent: VenueCardAccent
}) {
  const theme = VENUE_CARD_ACCENT[accent]
  return (
    <div
      className={cn(
        "relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md ring-2 dark:border-card",
        theme.ring,
      )}
    >
      {src ? (
        <AppImage src={src} alt={alt} fill sizes="72px" className="rounded-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200">
          <Building2 className={cn("h-8 w-8", theme.icon)} />
        </div>
      )}
    </div>
  )
}

export type VenueCardListProps = {
  venues: Venue[]
  accent: VenueCardAccent
  mode: "pending" | "manage"
  onView: (venue: Venue) => void
  onEdit: (venue: Venue) => void
  onApprove?: (venue: Venue) => void
  onReject?: (venue: Venue) => void
  onSendMessage?: (venue: Venue) => void
  onStatusChange?: (venueId: string, status: VenueListingStatus) => void
  onVerificationToggle?: (venueId: string) => void
  onDelete?: (venueId: string) => void
}

export function VenueCardList({
  venues,
  accent,
  mode,
  onView,
  onEdit,
  onApprove,
  onReject,
  onSendMessage,
  onStatusChange,
  onVerificationToggle,
  onDelete,
}: VenueCardListProps) {
  const theme = VENUE_CARD_ACCENT[accent]

  if (venues.length === 0) return null

  return (
    <div className="space-y-3">
      {venues.map((venue) => {
        const thumb =
          venue.logo || (venue.venueImages?.length ? venue.venueImages[0] : "") || ""
        const location = [venue.city, venue.state, venue.country].filter(Boolean).join(", ")

        return (
          <Card
            key={venue.id}
            className={cn(
              "overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md",
              theme.border,
            )}
          >
            <div className={cn("h-1 bg-gradient-to-r", theme.bar)} />
            <CardContent className="flex items-start gap-4 px-4 py-3.5">
              <VenueThumbnail src={thumb} alt={venue.venueName} accent={accent} />

              <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate text-base font-semibold text-foreground">
                        {venue.venueName}
                      </h3>
                      {venue.isVerified ? (
                        <CheckCircle
                          className="h-4 w-4 shrink-0 text-emerald-500"
                          aria-label="Verified"
                        />
                      ) : null}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {venue.contactPerson || "—"}
                    </p>
                  </div>
                  <VenueStatusBadge
                    status={venue.status || (mode === "pending" ? "pending" : "active")}
                  />
                </div>

                <div className="space-y-0.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5 truncate">
                    <MapPin className={cn("h-3.5 w-3.5 shrink-0", theme.icon)} />
                    {location || "—"}
                  </p>
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail className={cn("h-3.5 w-3.5 shrink-0", theme.icon)} />
                    {venue.email}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "Cap", value: (venue.maxCapacity || 0).toLocaleString() },
                    { label: "Halls", value: String(venue.totalHalls || 0) },
                    { label: "Events", value: String(venue.totalEvents || 0) },
                    {
                      label: "Rating",
                      value: venue.totalReviews > 0 ? venue.averageRating.toFixed(1) : "—",
                    },
                  ].map((stat) => (
                    <span
                      key={stat.label}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                        theme.pill,
                      )}
                    >
                      {stat.label} {stat.value}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-1.5 border-l border-border/60 pl-3 pt-0.5 pb-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 px-2.5 text-xs"
                  onClick={() => onView(venue)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 border-blue-200 px-2.5 text-xs text-blue-700 hover:bg-blue-50 dark:border-border dark:text-primary dark:hover:bg-accent"
                  onClick={() => onEdit(venue)}
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </Button>
                {mode === "pending" && onApprove && onReject ? (
                  <>
                    <Button
                      size="sm"
                      className="h-8 gap-1.5 bg-emerald-600 px-2.5 text-xs hover:bg-emerald-700"
                      onClick={() => onApprove(venue)}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 border-red-200 px-2.5 text-xs text-red-700 hover:bg-red-50 dark:border-border dark:text-red-300 dark:hover:bg-accent"
                      onClick={() => onReject(venue)}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                      Reject
                    </Button>
                  </>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 gap-1.5 px-2.5 text-xs">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                        More
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      {onSendMessage ? (
                        <DropdownMenuItem onClick={() => onSendMessage(venue)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Send message
                        </DropdownMenuItem>
                      ) : null}
                      {onVerificationToggle ? (
                        <DropdownMenuItem onClick={() => onVerificationToggle(venue.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {venue.isVerified ? "Remove verification" : "Verify venue"}
                        </DropdownMenuItem>
                      ) : null}
                      {onStatusChange ? (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              onStatusChange(
                                venue.id,
                                (venue.status === "active" ? "suspended" : "active") as VenueListingStatus,
                              )
                            }
                          >
                            {venue.status === "active" ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Suspend
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                        </>
                      ) : null}
                      {onDelete ? (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(venue.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
