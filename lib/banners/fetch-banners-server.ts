import type { InlineBannerRecord, PageBannerRecord } from "./types"
import { normalizePageBanner } from "./normalize-banner"

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "") ?? "http://localhost:4000"
}

/** Banners are public; ISR avoids `headers()` + same-origin fetch (static gen / build friendly). */
const BANNER_REVALIDATE_SEC = 120

function normalizeInline(raw: unknown): InlineBannerRecord | null {
  const base = normalizePageBanner(raw)
  if (!base) return null
  const r = raw as Record<string, unknown>
  return {
    ...base,
    dateRange: typeof r.dateRange === "string" ? r.dateRange : undefined,
    location: typeof r.location === "string" ? r.location : undefined,
    description: typeof r.description === "string" ? r.description : undefined,
    buttonText: typeof r.buttonText === "string" ? r.buttonText : undefined,
  }
}

export async function fetchPageBannersServer(page: string, position?: string): Promise<PageBannerRecord[]> {
  try {
    const q = new URLSearchParams({ page })
    if (position) q.set("position", position)
    const res = await fetch(`${getApiBaseUrl()}/api/content/banners?${q.toString()}`, {
      next: { revalidate: BANNER_REVALIDATE_SEC },
    })
    if (!res.ok) return []
    const data: unknown = await res.json()
    if (!Array.isArray(data)) return []
    const out: PageBannerRecord[] = []
    for (const row of data) {
      const b = normalizePageBanner(row)
      if (b) out.push(b)
    }
    return out
  } catch (e) {
    console.error("fetchPageBannersServer:", e)
    return []
  }
}

export async function fetchInlineBannersServer(page: string, max: number): Promise<InlineBannerRecord[]> {
  try {
    const q = new URLSearchParams({ page })
    const res = await fetch(`${getApiBaseUrl()}/api/content/banners?${q.toString()}`, {
      next: { revalidate: BANNER_REVALIDATE_SEC },
    })
    if (!res.ok) return []
    const data: unknown = await res.json()
    if (!Array.isArray(data)) return []
    const out: InlineBannerRecord[] = []
    for (const row of data) {
      const b = normalizeInline(row)
      if (b) out.push(b)
      if (out.length >= max) break
    }
    return out
  } catch (e) {
    console.error("fetchInlineBannersServer:", e)
    return []
  }
}
