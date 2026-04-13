import type { PageBannerRecord } from "./types"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function normalizePageBanner(raw: unknown): PageBannerRecord | null {
  if (!isRecord(raw)) return null
  const id = raw.id != null ? String(raw.id) : ""
  if (!id) return null
  const title = typeof raw.title === "string" ? raw.title : ""
  const imageUrl = typeof raw.imageUrl === "string" ? raw.imageUrl : ""
  if (!imageUrl) return null
  return {
    id,
    page: typeof raw.page === "string" ? raw.page : "",
    title,
    imageUrl,
    link: typeof raw.link === "string" ? raw.link : undefined,
    order: typeof raw.order === "number" ? raw.order : 0,
    isActive: raw.isActive === true,
  }
}
