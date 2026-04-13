import { getInternalAppOrigin } from "@/lib/server/internal-origin"
import type { InlineBannerRecord, PageBannerRecord } from "./types"
import { normalizePageBanner } from "./normalize-banner"

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

export async function fetchPageBannersServer(page: string): Promise<PageBannerRecord[]> {
  try {
    const origin = await getInternalAppOrigin()
    const res = await fetch(`${origin}/api/banners/${encodeURIComponent(page)}`, {
      cache: "no-store",
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
    const origin = await getInternalAppOrigin()
    const res = await fetch(`${origin}/api/banners/${encodeURIComponent(page)}`, {
      cache: "no-store",
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
