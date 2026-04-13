import { unstable_noStore as noStore } from "next/cache"
import { getInternalAppOrigin } from "@/lib/server/internal-origin"
import { mergeGoingBundleFromJson, normalizeGoingPayload } from "./followers-bundle"
import { normalizeTrendingHomeEvent } from "./normalize-trending-event"
import { pickTrendingHomeEvents } from "./pick-trending-events"
import type { GoingBundle, TrendingHomeEvent } from "./types"
import { TRENDING_HOME_MAX_EVENTS } from "./types"

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
}

function rawEventsFromPayload(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === "object" && Array.isArray((data as { events?: unknown[] }).events)) {
    return (data as { events: unknown[] }).events
  }
  return []
}

function goingPayloadLooksUseful(j: unknown): boolean {
  const { rows, total } = normalizeGoingPayload(j)
  return rows.length > 0 || total > 0
}

/**
 * Prefer responses that actually carry counts/rows. Try Next proxy first during SSR (same host),
 * then direct backend `/going` and `/leads`.
 */
async function fetchGoingJsonForEvent(eventId: string): Promise<unknown | null> {
  const id = encodeURIComponent(eventId)
  const base = getApiBaseUrl().replace(/\/$/, "")
  const backendUrls = [
    `${base}/api/events/${id}/going`,
    `${base}/api/events/${id}/leads`,
    `${base}/api/events/${id}/leads?type=ATTENDEE`,
    `${base}/api/events/${id}/leads?type=attendee`,
  ]

  const tryInternal = async (): Promise<unknown | null> => {
    try {
      const origin = await getInternalAppOrigin()
      const res = await fetch(`${origin}/api/events/${id}/leads`, { cache: "no-store" })
      if (!res.ok) return null
      return res.json()
    } catch {
      return null
    }
  }

  const internalFirst = await tryInternal()
  if (internalFirst != null && goingPayloadLooksUseful(internalFirst)) return internalFirst

  for (const url of backendUrls) {
    try {
      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) continue
      const j: unknown = await res.json()
      if (goingPayloadLooksUseful(j)) return j
    } catch {
      /* try next */
    }
  }

  if (internalFirst != null) return internalFirst
  for (const url of backendUrls) {
    try {
      const res = await fetch(url, { cache: "no-store" })
      if (res.ok) return await res.json()
    } catch {
      /* */
    }
  }
  return null
}

export interface TrendingHomePayload {
  events: TrendingHomeEvent[]
  goingBundles: Record<string, GoingBundle>
}

export async function fetchTrendingHomePayloadServer(): Promise<TrendingHomePayload> {
  noStore()
  const empty: TrendingHomePayload = { events: [], goingBundles: {} }
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/events`, { cache: "no-store" })
    if (!res.ok) return empty
    const data: unknown = await res.json()
    const rawList = rawEventsFromPayload(data)
    const normalized: TrendingHomeEvent[] = []
    for (const row of rawList) {
      const ev = normalizeTrendingHomeEvent(row)
      if (ev) normalized.push(ev)
    }
    const picked = pickTrendingHomeEvents(normalized, TRENDING_HOME_MAX_EVENTS)
    if (picked.length === 0) return empty

    const goingBundles: Record<string, GoingBundle> = {}
    await Promise.all(
      picked.map(async (ev) => {
        try {
          const json = await fetchGoingJsonForEvent(ev.id)
          goingBundles[ev.id] = mergeGoingBundleFromJson(ev, json)
        } catch {
          goingBundles[ev.id] = mergeGoingBundleFromJson(ev, null)
        }
      }),
    )

    return { events: picked, goingBundles }
  } catch (e) {
    console.error("fetchTrendingHomePayloadServer:", e)
    return empty
  }
}
