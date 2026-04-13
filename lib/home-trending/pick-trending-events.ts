import type { TrendingHomeEvent } from "./types"
import { TRENDING_HOME_MAX_EVENTS } from "./types"

function isEventInCurrentMonth(event: TrendingHomeEvent): boolean {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const eventStartDate = new Date(event.startDate)
  const eventEndDate = event.endDate ? new Date(event.endDate) : eventStartDate

  return (
    (eventStartDate.getMonth() === currentMonth && eventStartDate.getFullYear() === currentYear) ||
    (eventEndDate.getMonth() === currentMonth && eventEndDate.getFullYear() === currentYear) ||
    (eventStartDate <= now && eventEndDate >= now)
  )
}

/**
 * Prefer current-month events, then fill with stable id-sorted remainder (no random).
 */
export function pickTrendingHomeEvents(
  events: TrendingHomeEvent[],
  max: number = TRENDING_HOME_MAX_EVENTS,
): TrendingHomeEvent[] {
  if (events.length === 0) return []
  const currentMonthOnly = events.filter(isEventInCurrentMonth)
  let limited = currentMonthOnly.slice(0, max)

  if (limited.length < max && events.length > 0) {
    const needed = max - limited.length
    const used = new Set(limited.map((e) => e.id))
    const rest = events
      .filter((e) => !used.has(e.id))
      .sort((a, b) => a.id.localeCompare(b.id))
      .slice(0, needed)
    limited = [...limited, ...rest]
  }

  return limited.slice(0, max)
}
