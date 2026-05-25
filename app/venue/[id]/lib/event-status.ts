import { devLog } from "@/lib/dev-log"
import type { ComputedEventStatus, VenueEvent } from "../types/venue-detail.types"

export function getEventStatus(event: VenueEvent): ComputedEventStatus {
  const now = new Date()
  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)

  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())

  const nowTime = now.getTime()
  const startTime = startDate.getTime()
  const endTime = endDate.getTime()

  const isMultiDay = startDateOnly.getTime() !== endDateOnly.getTime()

  if (isMultiDay) {
    if (nowDate < startDateOnly) {
      devLog("Status: UPCOMING (multi-day)", event.title)
      return "UPCOMING"
    }
    if (nowDate > endDateOnly) {
      devLog("Status: PAST (multi-day)", event.title)
      return "PAST"
    }
    devLog("Status: ONGOING (multi-day)", event.title)
    return "ONGOING"
  }

  if (nowTime < startTime) {
    devLog("Status: UPCOMING (single-day)", event.title)
    return "UPCOMING"
  }
  if (nowTime >= startTime && nowTime <= endTime) {
    devLog("Status: ONGOING (single-day)", event.title)
    return "ONGOING"
  }
  if (nowTime > endTime) {
    devLog("Status: PAST (single-day)", event.title)
    return "PAST"
  }

  return "UPCOMING"
}

export function getStatusBadgeVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "UPCOMING":
      return "default"
    case "ONGOING":
      return "secondary"
    case "PAST":
      return "outline"
    default:
      return "default"
  }
}

export function getStatusBadgeText(status: string): string {
  switch (status) {
    case "UPCOMING":
      return "Upcoming"
    case "ONGOING":
      return "Ongoing"
    case "PAST":
      return "Past"
    default:
      return status
  }
}

export function getEventsCountByStatus(events: VenueEvent[]) {
  const counts = { total: events.length, upcoming: 0, ongoing: 0, past: 0 }
  for (const event of events) {
    const status = getEventStatus(event)
    if (status === "UPCOMING") counts.upcoming++
    else if (status === "ONGOING") counts.ongoing++
    else if (status === "PAST") counts.past++
  }
  return counts
}
