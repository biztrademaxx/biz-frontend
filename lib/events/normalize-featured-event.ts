import type { FeaturedEventPayload, FeaturedEventVenue } from "./types"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readString(value: unknown): string | null {
  return typeof value === "string" ? value : null
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((x): x is string => typeof x === "string")
}

function readCategories(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const out: string[] = []
  for (const entry of raw) {
    if (typeof entry === "string" && entry.trim()) out.push(entry)
    else if (isRecord(entry)) {
      const name = readString(entry.name)
      if (name?.trim()) out.push(name.trim())
    }
  }
  return out
}

function readVenue(raw: unknown): FeaturedEventVenue | null {
  if (!isRecord(raw)) return null
  return {
    venueName: readString(raw.venueName),
    venueAddress: readString(raw.venueAddress),
    venueCity: readString(raw.venueCity),
    venueCountry: readString(raw.venueCountry),
  }
}

/**
 * Maps one API / JSON object into {@link FeaturedEventPayload}, or `null` if unusable.
 */
export function normalizeFeaturedEvent(raw: unknown): FeaturedEventPayload | null {
  if (!isRecord(raw)) return null
  const idRaw = raw.id
  if (idRaw === undefined || idRaw === null) return null
  const id = String(idRaw)
  const title = readString(raw.title)?.trim() ?? ""

  const start = raw.startDate ? new Date(String(raw.startDate)) : new Date()
  const end = raw.endDate ? new Date(String(raw.endDate)) : start

  const images = raw.images
  let firstImage: string | null = null
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0]
    firstImage = typeof first === "string" ? first : null
  }

  const bannerImage = readString(raw.bannerImage) ?? firstImage

  const tags = readStringArray(raw.tags)
  const eventType = readStringArray(raw.eventType)
  const categories = readCategories(raw.categories)
  const categoriesFromPrisma = readStringArray(raw.category)
  const mergedCategories = categories.length > 0 ? categories : categoriesFromPrisma

  const averageRating =
    typeof raw.averageRating === "number" && Number.isFinite(raw.averageRating)
      ? raw.averageRating
      : 0
  const totalReviews =
    typeof raw.totalReviews === "number" && Number.isFinite(raw.totalReviews)
      ? raw.totalReviews
      : 0

  return {
    id,
    title,
    slug: readString(raw.slug),
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    bannerImage,
    edition: readString(raw.edition),
    tags,
    eventType,
    categories: mergedCategories,
    averageRating,
    totalReviews,
    venue: readVenue(raw.venue),
    isVirtual: raw.isVirtual === true,
  }
}
