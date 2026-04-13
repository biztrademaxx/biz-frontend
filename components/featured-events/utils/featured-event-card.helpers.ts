import type { FeaturedEventPayload } from "@/lib/events/types"

export function formatFeaturedDateRange(start: Date, end: Date): string {
  const sameCalendarDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate()

  if (sameCalendarDay) {
    return start.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const startLead = start.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })
  const endFull = end.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    const endMid = end.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })
    const monthYear = end.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    return `${startLead} - ${endMid} ${monthYear}`
  }

  const startFull = start.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  return `${startFull} - ${endFull}`
}

export function featuredEventLocationLine(event: FeaturedEventPayload): string {
  const v = event.venue
  const city = v?.venueCity?.trim()
  const country = v?.venueCountry?.trim()
  const name = v?.venueName?.trim()
  if (city && country) return `${city}, ${country}`
  if (city) return city
  if (name && city) return `${name}, ${city}`
  if (name) return name
  if (event.isVirtual) return "Online"
  if (!v) return "Venue TBA"
  return "Venue TBA"
}

export function featuredEventCategoryLabels(event: FeaturedEventPayload): string[] {
  const out: string[] = []
  const add = (s: string) => {
    const t = s.trim()
    if (t && !out.includes(t)) out.push(t)
  }
  for (const c of event.categories) add(c)
  for (const t of event.eventType) add(t)
  for (const t of event.tags) add(t)
  return out
}

export function eventsForFeaturedSlots(
  events: FeaturedEventPayload[],
  offset: number,
  count: number,
): FeaturedEventPayload[] {
  const n = events.length
  if (n === 0) return []
  return Array.from({ length: count }, (_, i) => events[(offset + i) % n])
}
