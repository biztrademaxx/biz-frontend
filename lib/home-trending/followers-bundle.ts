import type {
  FollowerBundle,
  FollowerPreviewItem,
  FollowerProfile,
  GoingBundle,
  TrendingHomeEvent,
} from "./types"
import { TRENDING_AVATAR_COUNT } from "./types"
import { avatarUrlFromRecord } from "@/lib/user-avatar-url"

const MAX_PROFILES_FETCH = 24

function strField(v: unknown): string {
  if (v == null) return ""
  if (typeof v === "string") return v.trim()
  if (typeof v === "number" && Number.isFinite(v)) return String(v)
  return ""
}

function leadRowType(row: unknown): string {
  if (!row || typeof row !== "object") return ""
  const r = row as Record<string, unknown>
  return String(r.type ?? r.leadType ?? r.kind ?? "").toUpperCase()
}

/** Visit / visitor / exhibit leads all count toward “going”. */
function isGoingLeadRow(row: unknown): boolean {
  const t = leadRowType(row)
  return t === "ATTENDEE" || t === "EXHIBITOR" || t === "VISITOR" || t === "GUEST"
}

function idFromMaybeOid(v: unknown): string {
  if (v == null) return ""
  if (typeof v === "string" || typeof v === "number") return String(v).trim()
  if (typeof v === "object" && v !== null && "$oid" in (v as object)) {
    return String((v as { $oid: string }).$oid).trim()
  }
  return ""
}

/**
 * Stable person key: same user with both Visit (attendee) and Exhibit rows counts once toward “Going”.
 */
function primaryKeyForGoingLeadRow(row: unknown): string | null {
  if (!row || typeof row !== "object") return null
  const r = row as Record<string, unknown>
  const direct = strField(r.userId) || strField(r.user_id)
  if (direct) return `u:${direct.toLowerCase()}`
  const u = r.user ?? r.User
  if (u && typeof u === "object" && !Array.isArray(u)) {
    const ur = u as Record<string, unknown>
    const uid = strField(ur.id) || idFromMaybeOid(ur._id)
    if (uid) return `u:${uid.toLowerCase()}`
    const em = strField(ur.email).toLowerCase()
    if (em.includes("@")) return `e:${em}`
  }
  const em = strField(r.email).toLowerCase()
  if (em.includes("@")) return `e:${em}`
  return null
}

/** Deduplicate lead rows by user id / email (first occurrence wins). */
export function dedupeGoingLeadRows(rows: unknown[]): unknown[] {
  const seen = new Set<string>()
  const out: unknown[] = []
  for (const row of rows) {
    const k = primaryKeyForGoingLeadRow(row)
    if (k !== null) {
      if (seen.has(k)) continue
      seen.add(k)
    }
    out.push(row)
  }
  return out
}

/** Parse backend “going” / visit / attendee-lead payloads (not saved-event followers). */
export function normalizeGoingPayload(data: unknown): { rows: unknown[]; total: number } {
  /** Many APIs return a bare array of lead rows — treat as going list. */
  if (Array.isArray(data)) {
    const filtered = data.filter((row) => isGoingLeadRow(row))
    const rows = filtered.length > 0 ? filtered : data
    return { rows, total: rows.length }
  }
  if (!data || typeof data !== "object") return { rows: [], total: 0 }
  const d = data as Record<string, unknown>

  const metaTotal = (): number => {
    if (typeof d.total === "number" && d.total >= 0) return d.total
    if (typeof d.goingCount === "number" && d.goingCount >= 0) return d.goingCount
    if (typeof d.count === "number" && d.count >= 0) return d.count
    if (typeof d.totalGoing === "number" && d.totalGoing >= 0) return d.totalGoing
    if (typeof d.leadCount === "number" && d.leadCount >= 0) return d.leadCount
    if (typeof d.size === "number" && d.size >= 0) return d.size
    return 0
  }

  let rows: unknown[] = []
  const t = metaTotal()
  let fromLeadsFilter = false

  if (Array.isArray(d.going)) rows = d.going
  else if (Array.isArray(d.goingUsers)) rows = d.goingUsers
  else if (Array.isArray(d.visitors)) rows = d.visitors
  else if (Array.isArray(d.attendeeLeads)) rows = d.attendeeLeads
  else if (Array.isArray(d.leads)) {
    fromLeadsFilter = true
    rows = d.leads.filter((row) => isGoingLeadRow(row))
  } else if (Array.isArray(d.data)) {
    const dataArr = d.data
    const looksLikeLeads = dataArr.some(
      (row) => row && typeof row === "object" && ("type" in row || "leadType" in row),
    )
    if (looksLikeLeads) {
      fromLeadsFilter = true
      rows = dataArr.filter((row) => isGoingLeadRow(row))
    } else {
      rows = dataArr
    }
  } else if (d.data && typeof d.data === "object" && !Array.isArray(d.data)) {
    const inner = d.data as Record<string, unknown>
    if (Array.isArray(inner.leads)) {
      fromLeadsFilter = true
      rows = inner.leads.filter((row) => isGoingLeadRow(row))
    }
  } else if (Array.isArray(d.items)) rows = d.items
  else if (Array.isArray(d.results)) rows = d.results

  let total: number
  if (fromLeadsFilter) {
    total = typeof d.total === "number" && d.total >= rows.length ? d.total : rows.length
  } else {
    total = t > 0 ? t : rows.length
  }
  return { rows, total }
}

export function normalizeFollowersPayload(data: unknown): { rows: unknown[]; total: number } {
  if (!data || typeof data !== "object") return { rows: [], total: 0 }
  const d = data as Record<string, unknown>
  let rows: unknown[] = []
  if (Array.isArray(d.followers)) rows = d.followers
  else if (Array.isArray(d.data)) rows = d.data
  else if (Array.isArray(d.savedEvents)) rows = d.savedEvents
  else if (Array.isArray(d.items)) rows = d.items
  else if (Array.isArray(d.results)) rows = d.results
  else if (Array.isArray(d.records)) rows = d.records
  const total =
    typeof d.total === "number"
      ? d.total
      : typeof d.followersCount === "number"
        ? d.followersCount
        : rows.length
  return { rows, total }
}

function userObjectFromFollowerRow(row: unknown): Record<string, unknown> | null {
  if (!row || typeof row !== "object" || Array.isArray(row)) return null
  const r = row as Record<string, unknown>
  const rawNested =
    r.user ??
    r.User ??
    r.follower ??
    r.Follower ??
    r.profile ??
    r.Profile ??
    r.member ??
    r.attendee ??
    r.savedBy ??
    r.visitor ??
    r.followerUser

  let nestedObj: Record<string, unknown> = {}
  if (typeof rawNested === "string" && rawNested.trim()) {
    nestedObj = { id: rawNested.trim() }
  } else if (rawNested && typeof rawNested === "object" && !Array.isArray(rawNested)) {
    nestedObj = rawNested as Record<string, unknown>
  }

  const merged: Record<string, unknown> = { ...r, ...nestedObj }

  const hasSignal =
    strField(merged.firstName) ||
    strField(merged.first_name) ||
    strField(merged.lastName) ||
    strField(merged.last_name) ||
    strField(merged.fullName) ||
    strField(merged.full_name) ||
    strField(merged.name) ||
    strField(merged.displayName) ||
    strField(merged.display_name) ||
    strField(merged.email) ||
    strField(merged.username) ||
    strField(merged.userName) ||
    strField(merged.avatar) ||
    strField(merged.profileImage) ||
    strField(merged.userId) ||
    strField(merged.user_id) ||
    strField(merged.id) ||
    strField(merged._id)

  if (!hasSignal) return null
  return merged
}

function displayNameFromUser(u: Record<string, unknown>): string {
  const fn = strField(u.firstName) || strField(u.first_name)
  const ln = strField(u.lastName) || strField(u.last_name)
  const joined = [fn, ln].filter(Boolean).join(" ").trim()
  if (joined) return joined

  const full =
    strField(u.fullName) ||
    strField(u.full_name) ||
    strField(u.displayName) ||
    strField(u.display_name) ||
    strField(u.name)
  if (full) return full

  const un =
    strField(u.username) || strField(u.userName) || strField(u.user_name) || strField(u.handle)
  if (un) return un

  const em = strField(u.email) || strField(u.businessEmail)
  if (em.includes("@")) {
    const local = em.split("@")[0]?.trim()
    if (local) return local
  }
  return "Member"
}

function avatarFromUser(u: Record<string, unknown>): string | null {
  return avatarUrlFromRecord(u)
}

function profileFromFollowerRow(row: unknown, index: number): FollowerProfile | null {
  const merged = userObjectFromFollowerRow(row)
  if (!merged) return null
  const idRaw = merged.id ?? merged._id ?? merged.userId ?? merged.user_id
  const id = strField(idRaw) || `row-${index}`
  const name = displayNameFromUser(merged)
  const avatar = avatarFromUser(merged)
  const company = strField(merged.company) || strField(merged.organizationName)
  const job = strField(merged.jobTitle) || strField(merged.job_title)
  const subtitle = company || job || undefined
  return { id, name, avatar, subtitle }
}

export function profilesFromFollowerRows(rows: unknown[]): FollowerProfile[] {
  const out: FollowerProfile[] = []
  let i = 0
  for (const row of rows) {
    if (out.length >= MAX_PROFILES_FETCH) break
    const p = profileFromFollowerRow(row, i++)
    if (p) out.push(p)
  }
  return out
}

export function eventFollowerCount(event: TrendingHomeEvent): number {
  if (typeof event.followersCount === "number") return event.followersCount
  if (typeof event.followers === "number") return event.followers
  return 0
}

export function eventGoingCount(event: TrendingHomeEvent): number {
  if (typeof event.goingCount === "number") return event.goingCount
  return 0
}

export function fallbackGoingProfilesFromEvent(event: TrendingHomeEvent): FollowerProfile[] {
  const fp = event.goingPreview ?? event.followerPreview
  if (!Array.isArray(fp)) return []
  return fp.slice(0, TRENDING_AVATAR_COUNT).map((x: FollowerPreviewItem, i) => ({
    id: `going-preview-${event.id}-${i}`,
    name: "",
    avatar: avatarUrlFromRecord(x as unknown as Record<string, unknown>),
    subtitle: undefined,
  }))
}

export function fallbackProfilesFromEventPreview(event: TrendingHomeEvent): FollowerProfile[] {
  const fp = event.followerPreview
  if (!Array.isArray(fp)) return []
  return fp.slice(0, TRENDING_AVATAR_COUNT).map((x: FollowerPreviewItem, i) => ({
    id: `preview-${event.id}-${i}`,
    name: "",
    avatar: avatarUrlFromRecord(x as unknown as Record<string, unknown>),
    subtitle: undefined,
  }))
}

export function mergeGoingBundleFromJson(event: TrendingHomeEvent, data: unknown): GoingBundle {
  const listFallback: GoingBundle = {
    profiles: fallbackGoingProfilesFromEvent(event),
    total: eventGoingCount(event),
  }
  if (data == null) return listFallback
  try {
    const { rows, total } = normalizeGoingPayload(data)
    const dedupedRows = dedupeGoingLeadRows(rows)
    const fromBackend = profilesFromFollowerRows(dedupedRows)
    const mergedProfiles = fromBackend.length > 0 ? fromBackend : listFallback.profiles
    const uniqueCount = dedupedRows.length
    const mergedTotal =
      rows.length > 0
        ? uniqueCount
        : total > 0
          ? total
          : fromBackend.length > 0
            ? fromBackend.length
            : listFallback.total
    return { profiles: mergedProfiles, total: mergedTotal }
  } catch {
    return listFallback
  }
}

export function mergeFollowerBundleFromJson(event: TrendingHomeEvent, data: unknown): FollowerBundle {
  const listFallback: FollowerBundle = {
    profiles: fallbackProfilesFromEventPreview(event),
    total: eventFollowerCount(event),
  }
  if (data == null) return listFallback
  try {
    const { rows, total } = normalizeFollowersPayload(data)
    const fromBackend = profilesFromFollowerRows(rows)
    const mergedProfiles = fromBackend.length > 0 ? fromBackend : listFallback.profiles
    const mergedTotal =
      total > 0 ? total : fromBackend.length > 0 ? fromBackend.length : listFallback.total
    return { profiles: mergedProfiles, total: mergedTotal }
  } catch {
    return listFallback
  }
}
