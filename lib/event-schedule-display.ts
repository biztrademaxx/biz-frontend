/** Whether the public page should show a postponed notice. */
export function isEventPostponed(event: {
  isPostponed?: boolean | null
  previousStartDate?: string | Date | null
  startDate?: string | Date | null
}): boolean {
  if (event.isPostponed) return true
  if (!event.previousStartDate || !event.startDate) return false
  return new Date(event.previousStartDate).getTime() !== new Date(event.startDate).getTime()
}

export function formatEventPublicDateRange(
  startDate?: string | Date | null,
  endDate?: string | Date | null,
): string {
  if (!startDate || !endDate) return "dates to be announced"

  const start = new Date(startDate)
  const end = new Date(endDate)
  const sameDay = start.toDateString() === end.toDateString()

  if (sameDay) {
    return start.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return `${start.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  })} – ${end.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`
}

export function getEventPostponedNotice(event: {
  startDate?: string | Date | null
  endDate?: string | Date | null
}): string {
  return `This event has been postponed to ${formatEventPublicDateRange(event.startDate, event.endDate)}.`
}

export function isUpcomingEvent(event: { startDate?: string | Date | null; endDate?: string | Date | null }, now = new Date()): boolean {
  if (!event.startDate) return false
  const start = new Date(event.startDate).getTime()
  const end = event.endDate ? new Date(event.endDate).getTime() : start
  return Number.isFinite(start) && Number.isFinite(end) && end >= start && start > now.getTime()
}
