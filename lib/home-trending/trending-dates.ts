/** Day + uppercase month label for trending event image badge (e.g. 20 / JUNE). */
export function trendingDateBadgeParts(startIso: string): { day: string; month: string } {
  const start = new Date(startIso)
  if (Number.isNaN(start.getTime())) return { day: "—", month: "" }
  const day = String(start.getDate())
  const month = start.toLocaleString("en-US", { month: "long" }).toUpperCase()
  return { day, month }
}

export function formatTrendingDateRange(startIso: string, endIso?: string): string {
  const start = new Date(startIso)
  if (Number.isNaN(start.getTime())) return ""
  const end = endIso ? new Date(endIso) : start
  const e = Number.isNaN(end.getTime()) ? start : end

  const d = (x: Date) => x.getDate()
  const mon = (x: Date) => x.toLocaleString("en-GB", { month: "short" })
  const y = e.getFullYear()

  if (start.toDateString() === e.toDateString()) {
    return `${d(start)} ${mon(start)} ${y}`
  }
  if (start.getMonth() === e.getMonth() && start.getFullYear() === e.getFullYear()) {
    return `${d(start)} - ${d(e)} ${mon(e)} ${y}`
  }
  return `${d(start)} ${mon(start)} - ${d(e)} ${mon(e)} ${y}`
}
