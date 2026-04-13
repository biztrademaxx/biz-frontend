import { formatEventCountDisplay } from "@/lib/format-event-count"

export function countryEventsCountLabel(eventCount: number | null): string {
  const n = eventCount != null && Number.isFinite(eventCount) ? Math.round(eventCount) : 0
  return `${formatEventCountDisplay(n)} Events`
}
