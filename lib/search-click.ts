/**
 * Fire-and-forget search click beacon (Phase 4 ranking CTR).
 */

export type SearchClickPayload = {
  eventId: string
  query?: string
  position?: number
  page?: number
  listingSource?: "navbar" | "events_list"
  sessionId?: string
}

function getOrCreateSearchSessionId(): string {
  if (typeof window === "undefined") return ""
  try {
    const key = "bizz_search_sid"
    const existing = sessionStorage.getItem(key)
    if (existing) return existing
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s_${Date.now().toString(36)}`
    sessionStorage.setItem(key, id)
    return id
  } catch {
    return ""
  }
}

export function trackSearchClick(payload: SearchClickPayload): void {
  if (typeof window === "undefined") return
  const eventId = String(payload.eventId || "").trim()
  if (!eventId) return

  const body = {
    eventId,
    query: payload.query?.trim() || undefined,
    position: payload.position,
    page: payload.page,
    listingSource: payload.listingSource === "navbar" ? "navbar" : "events_list",
    sessionId: payload.sessionId || getOrCreateSearchSessionId(),
  }

  void fetch("/api/search/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => undefined)
}
