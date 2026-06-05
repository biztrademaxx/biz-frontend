export type ExhibitorLeadSource = "follower" | "connection"

export type ExhibitorLeadRow = {
  id: string
  name: string
  company?: string
  jobTitle?: string
  timestamp: string
  status: string
  source: ExhibitorLeadSource
}

export type ExhibitorLeadPeriod = "this-month" | "3-months" | "1-year"

export type ExhibitorLeadChartPoint = {
  label: string
  leads: number
}

export type ExhibitorLeadSummary = {
  total: number
  new: number
  connected: number
  followers: number
}

type FollowerLike = {
  id: string
  firstName: string
  lastName: string
  company?: string | null
  jobTitle?: string | null
  followedAt: string
}

type ConnectionLike = {
  id: string
  firstName: string
  lastName: string
  company?: string | null
  jobTitle?: string | null
  status: string
  createdAt?: string
  updatedAt?: string
}

function displayName(firstName: string, lastName: string) {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || "Visitor"
}

function connectionLeadStatus(status: string) {
  const s = status.toLowerCase()
  if (s === "connected" || s === "accepted") return "contacted"
  return "new"
}

/** Leads = followers + connection activity (matches backend leads-count semantics). */
export function mergeExhibitorLeads(
  followers: FollowerLike[],
  connections: ConnectionLike[],
  connectionRequests: ConnectionLike[],
  exhibitorId: string,
): ExhibitorLeadRow[] {
  const byId = new Map<string, ExhibitorLeadRow>()

  const upsert = (row: ExhibitorLeadRow) => {
    const existing = byId.get(row.id)
    if (!existing) {
      byId.set(row.id, row)
      return
    }
    const existingTs = new Date(existing.timestamp).getTime()
    const newTs = new Date(row.timestamp).getTime()
    byId.set(row.id, {
      ...(newTs >= existingTs ? { ...existing, ...row } : existing),
      status:
        row.status === "contacted" || existing.status === "contacted" ? "contacted" : "new",
      source: existing.source === "follower" || row.source === "follower" ? "follower" : "connection",
      timestamp: newTs >= existingTs ? row.timestamp : existing.timestamp,
    })
  }

  for (const follower of followers) {
    if (follower.id === exhibitorId) continue
    upsert({
      id: follower.id,
      name: displayName(follower.firstName, follower.lastName),
      company: follower.company ?? undefined,
      jobTitle: follower.jobTitle ?? undefined,
      timestamp: follower.followedAt,
      status: "new",
      source: "follower",
    })
  }

  for (const connection of [...connectionRequests, ...connections]) {
    if (connection.id === exhibitorId) continue
    upsert({
      id: connection.id,
      name: displayName(connection.firstName, connection.lastName),
      company: connection.company ?? undefined,
      jobTitle: connection.jobTitle ?? undefined,
      timestamp: connection.createdAt ?? connection.updatedAt ?? new Date(0).toISOString(),
      status: connectionLeadStatus(connection.status),
      source: "connection",
    })
  }

  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )
}

function getPeriodRange(period: ExhibitorLeadPeriod) {
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  if (period === "this-month") {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
    }
  }
  if (period === "3-months") {
    return {
      start: new Date(now.getFullYear(), now.getMonth() - 2, 1),
      end,
    }
  }
  return {
    start: new Date(now.getFullYear(), now.getMonth() - 11, 1),
    end,
  }
}

export function filterExhibitorLeadsByPeriod(
  leads: ExhibitorLeadRow[],
  period: ExhibitorLeadPeriod,
): ExhibitorLeadRow[] {
  const { start, end } = getPeriodRange(period)
  const startMs = start.getTime()
  const endMs = end.getTime()
  return leads.filter((lead) => {
    const ts = new Date(lead.timestamp).getTime()
    return !Number.isNaN(ts) && ts >= startMs && ts <= endMs
  })
}

export function summarizeExhibitorLeads(leads: ExhibitorLeadRow[]): ExhibitorLeadSummary {
  return {
    total: leads.length,
    new: leads.filter((lead) => lead.status === "new").length,
    connected: leads.filter((lead) => lead.status === "contacted").length,
    followers: leads.filter((lead) => lead.source === "follower").length,
  }
}

function buildMonthlyChartBuckets(start: Date, end: Date) {
  const buckets: { label: string; leads: number; year: number; month: number }[] = []
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1)
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1)

  while (cursor <= endMonth) {
    buckets.push({
      label: cursor.toLocaleDateString("en-US", { month: "short" }),
      leads: 0,
      year: cursor.getFullYear(),
      month: cursor.getMonth(),
    })
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return buckets
}

/** Chart buckets for the selected period (weeks for this month, months for 3M/1Y). */
export function buildExhibitorLeadChartData(
  leads: ExhibitorLeadRow[],
  period: ExhibitorLeadPeriod,
): ExhibitorLeadChartPoint[] {
  const { start, end } = getPeriodRange(period)
  const startMs = start.getTime()
  const endMs = end.getTime()

  if (period === "this-month") {
    const year = start.getFullYear()
    const month = start.getMonth()
    const daysInMonth = end.getDate()
    const weekCount = Math.ceil(daysInMonth / 7)

    const buckets: ExhibitorLeadChartPoint[] = Array.from({ length: weekCount }, (_, i) => ({
      label: `Week ${i + 1}`,
      leads: 0,
    }))

    for (const lead of leads) {
      const d = new Date(lead.timestamp)
      if (Number.isNaN(d.getTime())) continue
      if (d.getTime() < startMs || d.getTime() > endMs) continue
      if (d.getFullYear() !== year || d.getMonth() !== month) continue
      const weekIdx = Math.min(Math.floor((d.getDate() - 1) / 7), weekCount - 1)
      buckets[weekIdx].leads += 1
    }

    return buckets
  }

  const buckets = buildMonthlyChartBuckets(start, end)

  for (const lead of leads) {
    const d = new Date(lead.timestamp)
    if (Number.isNaN(d.getTime())) continue
    if (d.getTime() < startMs || d.getTime() > endMs) continue
    const idx = buckets.findIndex((b) => b.year === d.getFullYear() && b.month === d.getMonth())
    if (idx >= 0) buckets[idx].leads += 1
  }

  return buckets.map(({ label, leads: count }) => ({ label, leads: count }))
}
