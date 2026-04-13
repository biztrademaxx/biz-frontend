/**
 * Event “Visit / Exhibit” leads: same-origin fetches via Next `/api/events/[id]/leads` proxy
 * (avoids browser CORS on direct backend calls). Parsing is defensive for various API shapes.
 */
import { getAccessToken } from "@/lib/api"

const lsVisit = (eventId: string) => `biztf:eventLead:${eventId}:visit`
const lsExhibit = (eventId: string) => `biztf:eventLead:${eventId}:exhibit`

export function readInterestLocalStorage(eventId: string): { visiting: boolean; exhibiting: boolean } {
  if (typeof window === "undefined") return { visiting: false, exhibiting: false }
  try {
    return {
      visiting: localStorage.getItem(lsVisit(eventId)) === "1",
      exhibiting: localStorage.getItem(lsExhibit(eventId)) === "1",
    }
  } catch {
    return { visiting: false, exhibiting: false }
  }
}

export function persistInterestLocalStorage(eventId: string, kind: "visit" | "exhibit") {
  try {
    if (kind === "visit") localStorage.setItem(lsVisit(eventId), "1")
    else localStorage.setItem(lsExhibit(eventId), "1")
  } catch {
    /* private mode / quota */
  }
}

function idString(v: unknown): string {
  if (v == null) return ""
  if (typeof v === "string" || typeof v === "number") return String(v).trim()
  if (typeof v === "object" && v !== null && "$oid" in (v as object)) {
    return String((v as { $oid: string }).$oid).trim()
  }
  return ""
}

export function parseEventLeadsPayload(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>
    if (Array.isArray(o.leads)) return o.leads
    if (Array.isArray(o.data)) return o.data
    if (Array.isArray(o.items)) return o.items
    if (Array.isArray(o.results)) return o.results
    const inner = o.payload ?? o.response
    if (inner && typeof inner === "object") {
      const p = inner as Record<string, unknown>
      if (Array.isArray(p.leads)) return p.leads
      if (Array.isArray(p.data)) return p.data
    }
  }
  return []
}

function leadRowUserIds(row: unknown): string[] {
  if (!row || typeof row !== "object") return []
  const r = row as Record<string, unknown>
  const out: string[] = []
  const push = (x: unknown) => {
    const s = idString(x)
    if (s) out.push(s)
  }
  push(r.userId)
  push(r.user_id)
  const u = r.user ?? r.User
  if (u && typeof u === "object" && !Array.isArray(u)) {
    const ur = u as Record<string, unknown>
    push(ur.id)
    push(ur._id)
  }
  return [...new Set(out)]
}

function leadRowEmails(row: unknown): string[] {
  if (!row || typeof row !== "object") return []
  const r = row as Record<string, unknown>
  const out: string[] = []
  const push = (s: unknown) => {
    if (typeof s === "string" && s.includes("@")) out.push(s.trim().toLowerCase())
  }
  push(r.email)
  const u = r.user ?? r.User
  if (u && typeof u === "object" && !Array.isArray(u)) {
    const ur = u as Record<string, unknown>
    push(ur.email)
    push(ur.businessEmail)
  }
  return [...new Set(out)]
}

function normalizeComparableId(s: string): string {
  const t = s.trim()
  if (/^[a-f0-9]{24}$/i.test(t)) return t.toLowerCase()
  return t.toLowerCase()
}

function idsLikelyMatch(a: string, b: string): boolean {
  if (!a || !b) return false
  if (a === b) return true
  return normalizeComparableId(a) === normalizeComparableId(b)
}

export function userMatchesLeadRow(row: unknown, jwtSub: string, userEmail: string | null): boolean {
  const sub = String(jwtSub || "").trim()
  if (!sub) return false
  const emails = leadRowEmails(row)
  const em = userEmail?.trim().toLowerCase() ?? ""
  if (em && emails.some((e) => e === em)) return true
  for (const uid of leadRowUserIds(row)) {
    if (idsLikelyMatch(uid, sub)) return true
  }
  return false
}

function leadRowTypeUpper(row: unknown): string {
  if (!row || typeof row !== "object") return ""
  const r = row as Record<string, unknown>
  const raw = r.type ?? r.leadType ?? r.kind ?? r.role
  const t = String(raw ?? "").toUpperCase()
  if (t === "ATTENDEE" || t === "VISITOR" || t === "GUEST") return "ATTENDEE"
  if (t === "EXHIBITOR") return "EXHIBITOR"
  return t
}

export function interestFlagsFromLeads(
  data: unknown,
  jwtSub: string,
  userEmail: string | null,
): { visiting: boolean; exhibiting: boolean } {
  const rows = parseEventLeadsPayload(data)
  let visiting = false
  let exhibiting = false
  for (const row of rows) {
    if (!userMatchesLeadRow(row, jwtSub, userEmail)) continue
    const t = leadRowTypeUpper(row)
    if (t === "ATTENDEE") visiting = true
    if (t === "EXHIBITOR") exhibiting = true
  }
  return { visiting, exhibiting }
}

export async function fetchEventLeadsThroughNext(eventId: string): Promise<{ ok: boolean; data: unknown }> {
  const token = getAccessToken()
  const res = await fetch(`/api/events/${encodeURIComponent(eventId)}/leads`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  })
  let data: unknown = null
  try {
    data = res.ok ? await res.json() : null
  } catch {
    data = null
  }
  return { ok: res.ok, data }
}

export async function postEventLeadThroughNext(
  eventId: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; status: number }> {
  const token = getAccessToken()
  const res = await fetch(`/api/events/${encodeURIComponent(eventId)}/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })
  return { ok: res.ok, status: res.status }
}
