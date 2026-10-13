import "server-only"
import { cache } from "react"

export type EventDashboardSnapshot = {
  id: string
  slug?: string | null
  title?: string | null
}

/** Server-only: resolve URL segment (UUID or slug) to event id + display fields. Cached per request. */
export const fetchEventByRefForDashboard = cache(async (ref: string): Promise<EventDashboardSnapshot | null> => {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
  const key = ref?.trim()
  if (!key) return null
  try {
    const res = await fetch(`${base}/api/events/${encodeURIComponent(key)}`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    })
    if (!res.ok) return null
    const data = (await res.json()) as { id?: string; slug?: string | null; title?: string | null }
    if (!data?.id) return null
    return { id: data.id, slug: data.slug ?? null, title: data.title ?? null }
  } catch {
    return null
  }
})
