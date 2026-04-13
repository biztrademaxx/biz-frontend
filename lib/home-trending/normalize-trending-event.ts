import type { FollowerPreviewItem, TrendingHomeEvent, TrendingVenue } from "./types"
import { avatarUrlFromRecord } from "@/lib/user-avatar-url"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readVenue(raw: unknown): TrendingVenue | undefined {
  if (!isRecord(raw)) return undefined
  const id = raw.id != null ? String(raw.id) : ""
  const venueName = typeof raw.venueName === "string" ? raw.venueName : ""
  const venueCity = typeof raw.venueCity === "string" ? raw.venueCity : ""
  const venueCountry = typeof raw.venueCountry === "string" ? raw.venueCountry : ""
  if (!id && !venueName && !venueCity) return undefined
  return {
    id,
    venueName,
    venueCity,
    venueCountry,
    venueState: typeof raw.venueState === "string" ? raw.venueState : undefined,
    venueAddress: typeof raw.venueAddress === "string" ? raw.venueAddress : undefined,
  }
}

function readFollowerPreview(raw: unknown): FollowerPreviewItem[] | undefined {
  if (!Array.isArray(raw)) return undefined
  const out: FollowerPreviewItem[] = []
  for (const x of raw) {
    if (!isRecord(x)) continue
    const row = x as Record<string, unknown>
    const nested = row.user && isRecord(row.user) ? (row.user as Record<string, unknown>) : {}
    const merged: Record<string, unknown> = { ...row, ...nested }
    const resolvedAvatar = avatarUrlFromRecord(merged)
    out.push({
      avatar: resolvedAvatar,
      image: typeof merged.image === "string" ? merged.image : null,
      firstName:
        (typeof merged.firstName === "string" ? merged.firstName : null) ??
        (typeof merged.first_name === "string" ? merged.first_name : null),
      lastName:
        (typeof merged.lastName === "string" ? merged.lastName : null) ??
        (typeof merged.last_name === "string" ? merged.last_name : null),
      name: typeof merged.name === "string" ? merged.name : null,
      displayName:
        (typeof merged.displayName === "string" ? merged.displayName : null) ??
        (typeof merged.display_name === "string" ? merged.display_name : null),
    })
  }
  return out.length ? out : undefined
}

export function normalizeTrendingHomeEvent(raw: unknown): TrendingHomeEvent | null {
  if (!isRecord(raw)) return null
  const idRaw = raw.id
  if (idRaw === undefined || idRaw === null) return null
  const id = String(idRaw)
  const title = typeof raw.title === "string" ? raw.title : "Event"
  const startDate =
    raw.startDate != null && String(raw.startDate)
      ? new Date(String(raw.startDate)).toISOString()
      : new Date().toISOString()
  const endDate =
    raw.endDate != null && String(raw.endDate) ? new Date(String(raw.endDate)).toISOString() : undefined

  const venue = readVenue(raw.venue)
  const countBlock = raw._count as { savedEvents?: number; leads?: number } | undefined

  let followersCount: number | undefined
  if (typeof raw.followersCount === "number") followersCount = raw.followersCount
  else if (typeof raw.followers === "number") followersCount = raw.followers
  else if (typeof countBlock?.savedEvents === "number") followersCount = countBlock.savedEvents

  let goingCount: number | undefined
  if (typeof raw.goingCount === "number") goingCount = raw.goingCount
  else if (typeof raw.going === "number") goingCount = raw.going
  else if (typeof raw.visitorsGoing === "number") goingCount = raw.visitorsGoing
  else if (typeof raw.visitCount === "number") goingCount = raw.visitCount
  else if (typeof countBlock?.leads === "number") goingCount = goingCount ?? countBlock.leads

  const event: TrendingHomeEvent = {
    id,
    slug: typeof raw.slug === "string" ? raw.slug : null,
    title,
    leads: typeof raw.leads === "string" ? raw.leads : "",
    bannerImage: typeof raw.bannerImage === "string" ? raw.bannerImage : undefined,
    logo: typeof raw.logo === "string" ? raw.logo : undefined,
    edition: typeof raw.edition === "string" ? raw.edition : undefined,
    categories: Array.isArray(raw.categories)
      ? raw.categories.filter((c): c is string => typeof c === "string")
      : undefined,
    followers: typeof raw.followers === "number" ? raw.followers : undefined,
    followersCount,
    goingCount,
    followerPreview: readFollowerPreview(raw.followerPreview),
    goingPreview: readFollowerPreview(raw.goingPreview),
    startDate,
    endDate,
    venueId: raw.venueId != null ? String(raw.venueId) : undefined,
    venue,
    location: venue
      ? {
          venue: venue.venueName,
          city: venue.venueCity,
          country: venue.venueCountry,
          address: venue.venueAddress ?? "",
        }
      : undefined,
  }
  return event
}
