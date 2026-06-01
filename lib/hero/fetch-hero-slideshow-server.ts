import {
  filterByHomeCountryPrioritizeCity,
  getHeroSlideshowCityLabel,
  getHeroSlideshowCountryLabel,
} from "@/lib/home-location"
import { hasDisplayableEventImage } from "@/lib/event-card-meta"
import { resolveHomeLocation } from "@/lib/home-location-server"
import type { HeroSlideshowEvent } from "./types"

function withDisplayableImage(events: HeroSlideshowEvent[]): HeroSlideshowEvent[] {
  return events.filter((e) => e.id && hasDisplayableEventImage(e))
}

const SLIDE_COUNT = 12

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
}

function firstImageUrl(event: Record<string, unknown>): string | null {
  if (typeof event.bannerImage === "string" && event.bannerImage.trim()) return event.bannerImage.trim()
  const images = event.images
  if (!Array.isArray(images) || images.length === 0) return null
  const first = images[0]
  if (typeof first === "string" && first.trim()) return first.trim()
  if (first && typeof first === "object" && "url" in first && typeof (first as { url: unknown }).url === "string") {
    return (first as { url: string }).url.trim() || null
  }
  return null
}

function normalizeEvent(event: Record<string, unknown>): HeroSlideshowEvent {
  const startRaw = event.startDate
  const endRaw = event.endDate
  const venueRaw = event.venue
  const venue =
    venueRaw && typeof venueRaw === "object"
      ? (venueRaw as { venueCity?: string | null; venueCountry?: string | null; venueName?: string | null })
      : null

  const images = event.images
  const imageStrings =
    Array.isArray(images) ? images.filter((x): x is string => typeof x === "string") : null

  const subRaw =
    event.subTitle ??
    event.subtitle ??
    (event as { eventSubTitle?: unknown }).eventSubTitle ??
    event.shortDescription ??
    (event as { sub_title?: unknown }).sub_title
  const subTitle = typeof subRaw === "string" && subRaw.trim() ? subRaw.trim() : null

  const descRaw = event.description ?? event.desc ?? event.about ?? null
  const description = typeof descRaw === "string" && descRaw.trim() ? descRaw.trim() : null

  const videoRaw = event.videoUrl ?? event.video_url ?? event.video ?? null
  const videoUrl = typeof videoRaw === "string" && videoRaw.trim() ? videoRaw.trim() : null

  return {
    id: String(event.id ?? ""),
    title: typeof event.title === "string" ? event.title : "Event",
    subTitle,
    slug: typeof event.slug === "string" ? event.slug : null,
    startDate:
      startRaw != null && String(startRaw)
        ? new Date(String(startRaw)).toISOString()
        : new Date().toISOString(),
    endDate:
      endRaw != null && String(endRaw) ? new Date(String(endRaw)).toISOString() : null,
    vipImage: typeof event.vipImage === "string" ? event.vipImage.trim() || null : null,
    bannerImage: firstImageUrl(event),
    images: imageStrings?.length ? imageStrings : null,
    description,
    videoUrl,
    venue:
      venue != null
        ? {
          venueName: typeof venue.venueName === "string" ? venue.venueName : null,
          venueCity: typeof venue.venueCity === "string" ? venue.venueCity : null,
          venueCountry: typeof venue.venueCountry === "string" ? venue.venueCountry : null,
        }
        : {
          venueName: typeof event.venueName === "string" ? event.venueName : null,
          venueCity: typeof event.city === "string" ? event.city : null,
          venueCountry: typeof event.country === "string" ? event.country : null,
        },
  }
}

function mergeUniqueById(
  primary: HeroSlideshowEvent[],
  more: HeroSlideshowEvent[],
  targetLen: number,
): HeroSlideshowEvent[] {
  const seen = new Set<string>()
  const out: HeroSlideshowEvent[] = []
  for (const e of primary) {
    if (!e.id || seen.has(e.id)) continue
    seen.add(e.id)
    out.push(e)
    if (out.length >= targetLen) return out
  }
  for (const e of more) {
    if (!e.id || seen.has(e.id)) continue
    seen.add(e.id)
    out.push(e)
    if (out.length >= targetLen) return out
  }
  return out
}

function applyHomeEventFilters(events: HeroSlideshowEvent[], loc: Awaited<ReturnType<typeof resolveHomeLocation>>) {
  return withDisplayableImage(
    filterByHomeCountryPrioritizeCity(events, loc, {
      getCity: getHeroSlideshowCityLabel,
      getCountry: getHeroSlideshowCountryLabel,
    }),
  )
}

export async function fetchHeroSlideshowEventsServer(): Promise<HeroSlideshowEvent[]> {
  const loc = await resolveHomeLocation()
  let pool: HeroSlideshowEvent[] = []

  try {
    const vipRes = await fetch(`${getApiBaseUrl()}/api/events/vip`, {
      next: { revalidate: 60 },
    })
    if (vipRes.ok) {
      const data = await vipRes.json()
      const raw = Array.isArray(data) ? data : data?.events ?? []
      pool = (raw as Record<string, unknown>[]).map(normalizeEvent).filter((e) => e.id)
    }

    if (pool.length < SLIDE_COUNT) {
      const listRes = await fetch(`${getApiBaseUrl()}/api/events?limit=60`, {
        next: { revalidate: 60 },
      })
      if (listRes.ok) {
        const data = await listRes.json()
        const rawList = (data?.events ?? []) as Record<string, unknown>[]
        const vipOnly = rawList.filter(
          (e) => e?.isVIP === true || e?.is_vip === true || e?.vip === true,
        )
        pool = mergeUniqueById(
          pool,
          vipOnly.map(normalizeEvent).filter((e) => e.id),
          60,
        )
      }
    }

    if (pool.length < SLIDE_COUNT) {
      const listRes = await fetch(`${getApiBaseUrl()}/api/events?limit=80`, {
        next: { revalidate: 60 },
      })
      if (listRes.ok) {
        const data = await listRes.json()
        const list = ((data?.events ?? []) as Record<string, unknown>[]).map(normalizeEvent).filter((e) => e.id)
        pool = mergeUniqueById(pool, list, 80)
      }
    }
  } catch (err) {
    console.error("Hero slideshow error:", err)
  }

  return applyHomeEventFilters(pool, loc).slice(0, SLIDE_COUNT)
}