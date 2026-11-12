export type VenueEventActivity = { startDate: string; count: number }

export function getVenueMonthlyActivity(events: VenueEventActivity[], timeZone = "Asia/Kolkata", now = new Date()) {
  const zone = timeZone || "Asia/Kolkata"
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" })
  const parts = (date: Date) => {
    const values = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]))
    return { year: Number(values.year), month: Number(values.month), day: Number(values.day) }
  }
  const today = parts(now)
  const buildMonth = (offset: number) => {
    const first = new Date(Date.UTC(today.year, today.month - 1 + offset, 1))
    const year = first.getUTCFullYear(), month = first.getUTCMonth()
    const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
    const label = first.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })
    const buckets = Array.from({ length: days }, (_, i) => ({ day: `${label} ${i + 1}`, value: 0 }))
    for (const event of events) {
      const date = new Date(event.startDate)
      if (!Number.isFinite(date.getTime())) continue
      const local = parts(date)
      if (local.year === year && local.month === month + 1) buckets[local.day - 1].value += event.count
    }
    return buckets
  }
  return { thisMonth: buildMonth(0), lastMonth: buildMonth(-1) }
}
