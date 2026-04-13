import type { HeroSlideshowEvent } from "./types"

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
    bannerImage: firstImageUrl(event),
    images: imageStrings?.length ? imageStrings : null,
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

export async function fetchHeroSlideshowEventsServer(): Promise<HeroSlideshowEvent[]> {
  let events: HeroSlideshowEvent[] = []

  try {
    const vipRes = await fetch(`${getApiBaseUrl()}/api/events/vip`, {
      next: { revalidate: 60 },
    })
    if (vipRes.ok) {
      const data = await vipRes.json()
      const raw = Array.isArray(data) ? data : data?.events ?? []
      events = (raw as Record<string, unknown>[]).map(normalizeEvent).filter((e) => e.id)
    }

    if (events.length === 0) {
      const listRes = await fetch(`${getApiBaseUrl()}/api/events?limit=24`, {
        next: { revalidate: 60 },
      })
      if (listRes.ok) {
        const data = await listRes.json()
        const list = (data?.events ?? []) as Record<string, unknown>[]
        const vipOnly = list.filter(
          (e) => e?.isVIP === true || e?.is_vip === true || e?.vip === true,
        )
        events = vipOnly.map(normalizeEvent).filter((e) => e.id)
      }
    }

    if (events.length < SLIDE_COUNT) {
      const listRes = await fetch(`${getApiBaseUrl()}/api/events?limit=40`, {
        next: { revalidate: 60 },
      })
      if (listRes.ok) {
        const data = await listRes.json()
        const list = ((data?.events ?? []) as Record<string, unknown>[]).map(normalizeEvent)
        events = mergeUniqueById(events, list, SLIDE_COUNT)
      }
    } else {
      events = events.slice(0, SLIDE_COUNT)
    }
  } catch (err) {
    console.error("Hero slideshow error:", err)
  }

  return events.slice(0, SLIDE_COUNT)
}
