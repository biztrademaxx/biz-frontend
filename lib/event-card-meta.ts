/** Small helpers for event list cards (date, location, organizer, image). */

export const EVENT_CARD_PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop"

export function getEventCardImageUrl(event: {
  thumbnailImage?: string | null
  bannerImage?: string | null
  images?: unknown
}): string {
  if (event.thumbnailImage?.trim()) return event.thumbnailImage.trim()
  if (event.bannerImage?.trim()) return event.bannerImage.trim()
  if (Array.isArray(event.images) && event.images.length > 0) {
    const first = event.images[0]
    if (typeof first === "string" && first.trim()) return first.trim()
    if (first && typeof first === "object" && "url" in first) {
      const url = (first as { url?: string }).url
      if (typeof url === "string" && url.trim()) return url.trim()
    }
  }
  return EVENT_CARD_PLACEHOLDER_IMAGE
}

export function formatEventCardDate(event: {
  startDate?: string | null
  date?: string | null
  endDate?: string | null
}): string {
  const raw = event.startDate ?? event.date
  if (!raw) return ""
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

export function formatEventCardOrganizer(organizer: unknown): string {
  if (typeof organizer === "string" && organizer.trim()) return organizer.trim()
  if (organizer && typeof organizer === "object") {
    const o = organizer as Record<string, unknown>
    const company = typeof o.company === "string" ? o.company.trim() : ""
    const org = typeof o.organizationName === "string" ? o.organizationName.trim() : ""
    const name =
      typeof o.name === "string"
        ? o.name.trim()
        : [o.firstName, o.lastName].filter(Boolean).join(" ").trim()
    return company || org || name || ""
  }
  return ""
}

export function formatEventCardLocation(event: {
  city?: string | null
  state?: string | null
  location?: string | { city?: string; state?: string; country?: string; address?: string } | null
  venue?: string | { venueName?: string; venueCity?: string; venueState?: string; venueCountry?: string } | null
}): string {
  if (event.city?.trim()) {
    return [event.city, event.state].filter(Boolean).join(", ")
  }
  const loc = event.location
  if (typeof loc === "string" && loc.trim()) return loc.trim()
  if (loc && typeof loc === "object") {
    const parts = [loc.city, loc.state, loc.country].filter((p) => typeof p === "string" && p.trim())
    if (parts.length) return parts.join(", ")
    if (loc.address?.trim()) return loc.address.trim()
  }
  const venue = event.venue
  if (typeof venue === "string" && venue.trim()) return venue.trim()
  if (venue && typeof venue === "object") {
    const parts = [venue.venueCity, venue.venueState, venue.venueCountry].filter(
      (p) => typeof p === "string" && p.trim(),
    )
    if (parts.length) return parts.join(", ")
    if (venue.venueName?.trim()) return venue.venueName.trim()
  }
  return ""
}

export function formatEventCardMetaLine(event: Parameters<typeof formatEventCardDate>[0] & Parameters<typeof formatEventCardLocation>[0] & { organizer?: unknown }): string {
  const parts = [
    formatEventCardDate(event),
    formatEventCardLocation(event),
    formatEventCardOrganizer(event.organizer),
  ].filter(Boolean)
  return parts.join(" • ")
}
