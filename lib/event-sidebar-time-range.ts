/**
 * Clock row next to EventHero (date/time/ticket block).
 * Keeps en-IN + Asia/Kolkata in sync with the hero sidebar everywhere else on the page.
 */
export function formatEventSidebarTimeRange(event: {
  startDate?: string
  endDate?: string
}): string {
  if (!event.startDate || !event.endDate) {
    return "Time to be announced"
  }

  const opts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }

  const startTime = new Date(event.startDate).toLocaleTimeString("en-IN", opts)
  const endTime = new Date(event.endDate).toLocaleTimeString("en-IN", opts)

  return `${startTime} – ${endTime}`
}
