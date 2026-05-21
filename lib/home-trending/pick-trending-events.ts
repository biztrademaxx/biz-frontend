import { eventFollowerCount } from "./followers-bundle"
import type { TrendingHomeEvent } from "./types"
import { TRENDING_HOME_MAX_EVENTS } from "./types"

/**
 * Home trending strip: highest follower count first (saved-event followers from API).
 * Events with zero followers still appear after those with more followers.
 */
export function pickTrendingHomeEvents(
  events: TrendingHomeEvent[],
  max: number = TRENDING_HOME_MAX_EVENTS,
): TrendingHomeEvent[] {
  if (events.length === 0) return []

  const sorted = [...events].sort((a, b) => {
    const byFollowers = eventFollowerCount(b) - eventFollowerCount(a)
    if (byFollowers !== 0) return byFollowers
    const aStart = new Date(a.startDate).getTime()
    const bStart = new Date(b.startDate).getTime()
    if (!Number.isNaN(aStart) && !Number.isNaN(bStart) && aStart !== bStart) {
      return aStart - bStart
    }
    return a.id.localeCompare(b.id)
  })

  return sorted.slice(0, max)
}
