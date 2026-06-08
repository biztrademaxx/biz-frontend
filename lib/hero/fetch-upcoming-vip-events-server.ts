import { hasDisplayableEventImage } from "@/lib/event-card-meta"
import {
  filterByHomeCountryPrioritizeCity,
  getHeroSlideshowCityLabel,
  getHeroSlideshowCountryLabel,
} from "@/lib/home-location"
import { resolveHomeLocation } from "@/lib/home-location-server"
import type { HeroSlideshowEvent } from "./types"
import { fetchHeroSlideshowEventsServer } from "./fetch-hero-slideshow-server"

const UPCOMING_VIP_LIMIT = 12

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
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
    vipImage:
      typeof event.vipImage === "string"
        ? event.vipImage.trim() || null
        : typeof event.vip_image === "string"
          ? event.vip_image.trim() || null
          : null,
    bannerImage:
      typeof event.bannerImage === "string" && event.bannerImage.trim()
        ? event.bannerImage.trim()
        : null,
    images: imageStrings?.length ? imageStrings : null,
    description: null,
    videoUrl: null,
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

export async function fetchUpcomingVipEventsServer(): Promise<HeroSlideshowEvent[]> {
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

    if (pool.length < UPCOMING_VIP_LIMIT) {
      const listRes = await fetch(`${getApiBaseUrl()}/api/events?limit=60`, {
        next: { revalidate: 60 },
      })
      if (listRes.ok) {
        const data = await listRes.json()
        const rawList = (data?.events ?? []) as Record<string, unknown>[]
        const vipOnly = rawList.filter(
          (e) => e?.isVIP === true || e?.is_vip === true || e?.vip === true,
        )
        const seen = new Set(pool.map((e) => e.id))
        for (const row of vipOnly) {
          const e = normalizeEvent(row)
          if (e.id && !seen.has(e.id)) {
            seen.add(e.id)
            pool.push(e)
          }
        }
      }
    }
  } catch (err) {
    console.error("Upcoming VIP events fetch error:", err)
  }

  if (pool.length === 0) {
    pool = await fetchHeroSlideshowEventsServer()
  }

  return filterByHomeCountryPrioritizeCity(
    pool.filter((e) => hasDisplayableEventImage(e)),
    loc,
    {
      getCity: getHeroSlideshowCityLabel,
      getCountry: getHeroSlideshowCountryLabel,
    },
  ).slice(0, UPCOMING_VIP_LIMIT)
}
