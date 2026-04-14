"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { UserRound } from "lucide-react"
import { BookmarkButton } from "@/components/bookmark-button"
import { eventPublicPath } from "@/lib/event-path"
import { trendingDateBadgeParts } from "@/lib/home-trending/trending-dates"
import type { FollowerProfile, GoingBundle, TrendingHomeEvent } from "@/lib/home-trending/types"
import { TRENDING_AVATAR_COUNT } from "@/lib/home-trending/types"
import {
  eventGoingCount,
  fallbackGoingProfilesFromEvent,
  mergeGoingBundleFromJson,
} from "@/lib/home-trending/followers-bundle"
import { absolutizeMediaUrl } from "@/lib/home-trending/media-absolute"

function formatGoingCompact(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000
    const s = v >= 10 ? String(Math.round(v)) : (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, "")
    return `${s}M`
  }
  if (n >= 1000) {
    const v = n / 1000
    const s = v >= 10 ? String(Math.round(v)) : (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, "")
    return `${s}k`
  }
  return n.toLocaleString("en-US")
}

function formatEventLocation(event: TrendingHomeEvent): string {
  const venue = event.venue?.venueName || event.location?.venue
  const city = event.venue?.venueCity || event.location?.city
  const country = event.venue?.venueCountry || event.location?.country
  const parts = [venue, city, country].filter((p) => typeof p === "string" && p.trim() !== "")
  return parts.length ? parts.join(", ") : "—"
}

function GoingFace({
  profile,
  index,
  stackSize,
}: {
  profile: FollowerProfile
  index: number
  stackSize: number
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const dim = "h-8 w-8"
  const stackStyle = { marginLeft: index === 0 ? 0 : -10, zIndex: stackSize - index }

  const resolvedAvatar = profile.avatar
    ? absolutizeMediaUrl(profile.avatar) ?? profile.avatar
    : null

  if (resolvedAvatar && !imgFailed) {
    return (
      <img
        src={resolvedAvatar}
        alt=""
        className={`${dim} relative rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-gray-200/60`}
        style={stackStyle}
        onError={() => setImgFailed(true)}
      />
    )
  }

  const initials = (() => {
    const n = profile.name?.trim()
    if (!n) return ""
    const parts = n.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase()
    return n.slice(0, 2).toUpperCase()
  })()

  return (
    <div
      className={`${dim} relative flex items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-600 shadow-sm ring-1 ring-gray-200/60`}
      style={stackStyle}
      aria-hidden
    >
      {initials || <UserRound className="h-[42%] w-[42%] text-slate-400" strokeWidth={1.75} />}
    </div>
  )
}

function TrendingGoingRow({ profiles, total }: { profiles: FollowerProfile[]; total: number }) {
  const faces = profiles.slice(0, TRENDING_AVATAR_COUNT)

  return (
    <div
      className="flex min-h-10 min-w-0 flex-1 items-center gap-2.5"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex shrink-0 items-center" aria-hidden>
        {faces.length > 0
          ? faces.map((p, i) => (
              <GoingFace key={`${p.id}-${i}`} profile={p} index={i} stackSize={TRENDING_AVATAR_COUNT} />
            ))
          : Array.from({ length: TRENDING_AVATAR_COUNT }).map((_, i) => (
              <div
                key={i}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 shadow-sm ring-1 ring-gray-200/60"
                style={{ marginLeft: i === 0 ? 0 : -10, zIndex: TRENDING_AVATAR_COUNT - i }}
              >
                <UserRound className="h-[42%] w-[42%] text-slate-400" strokeWidth={1.75} />
              </div>
            ))}
      </div>
      {total > 0 ? (
        <span className="line-clamp-1 min-w-0 truncate text-sm font-bold leading-none tabular-nums text-red-600">
          {formatGoingCompact(total)} Going
        </span>
      ) : (
        <span className="line-clamp-1 min-w-0 text-sm leading-none text-gray-400">No one going yet</span>
      )}
    </div>
  )
}

export interface TrendingEventsGridClientProps {
  events: TrendingHomeEvent[]
  goingBundles: Record<string, GoingBundle>
}

export default function TrendingEventsGridClient({ events, goingBundles: initialGoingBundles }: TrendingEventsGridClientProps) {
  const router = useRouter()
  const displayEvents = events
  const [goingBundles, setGoingBundles] = useState(initialGoingBundles)

  const eventIdsKey = useMemo(() => displayEvents.map((e) => e.id).join("|"), [displayEvents])

  useEffect(() => {
    setGoingBundles(initialGoingBundles)
  }, [eventIdsKey, initialGoingBundles])

  useEffect(() => {
    if (displayEvents.length === 0) return
    let cancelled = false
    ;(async () => {
      const updates: Record<string, GoingBundle> = {}
      await Promise.all(
        displayEvents.map(async (ev) => {
          try {
            const res = await fetch(`/api/events/${encodeURIComponent(ev.id)}/leads`, {
              cache: "no-store",
            })
            if (!res.ok) return
            const json: unknown = await res.json()
            if (cancelled) return
            updates[ev.id] = mergeGoingBundleFromJson(ev, json)
          } catch {
            /* keep server bundle */
          }
        }),
      )
      if (cancelled || Object.keys(updates).length === 0) return
      setGoingBundles((prev) => ({ ...prev, ...updates }))
    })()
    return () => {
      cancelled = true
    }
  }, [eventIdsKey])

  const handleCardClick = (event: TrendingHomeEvent) => {
    router.push(eventPublicPath(event))
  }

  const handleRegister = (e: React.MouseEvent, event: TrendingHomeEvent) => {
    e.stopPropagation()
    router.push(eventPublicPath(event))
  }

  return (
    <section className="home-tt-section mx-auto w-full min-w-0 max-w-7xl px-3 py-12 sm:px-4 lg:px-6">
      <div className="mb-10 text-start">
        <h2 className="home-tt-h2 mb-3">
          Trending Upcoming Events
          <br />
          <span className="home-tt-sub max-w-3xl">
            Connecting the global B2B trade fair community—where new business opportunities begin every minute.
          </span>
        </h2>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-5">
          {displayEvents.length > 0
            ? displayEvents.map((event, index) => {
                const { day, month } = trendingDateBadgeParts(event.startDate)
                const locationLine = formatEventLocation(event)

                const bundle = goingBundles[event.id]
                const total = bundle !== undefined ? bundle.total : eventGoingCount(event)
                const profiles =
                  bundle !== undefined ? bundle.profiles : fallbackGoingProfilesFromEvent(event)

                return (
                  <div
                    key={event.id || index}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleCardClick(event)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        handleCardClick(event)
                      }
                    }}
                    className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-sm border border-gray-100/90 bg-white shadow-sm ring-1 ring-black/[0.04] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#002C71]/20 hover:shadow-lg hover:shadow-[#002C71]/[0.08]"
                  >
                    <div className="relative aspect-[5/3] w-full shrink-0 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                      <img
                        src={event.bannerImage || event.logo || "/herosection-images/food.jpg"}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/herosection-images/food.jpg"
                        }}
                      />
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent"
                        aria-hidden
                      />
                      <div className="pointer-events-none absolute left-3 top-3 z-20 sm:left-4 sm:top-4">
                        <div className="pointer-events-auto flex min-w-[3.25rem] flex-col items-center justify-center rounded-sm bg-white px-2.5 py-2 shadow-md ring-1 ring-black/[0.06]">
                          <span className="text-2xl font-bold leading-none text-gray-900">{day}</span>
                          {month ? (
                            <span className="mt-1 text-[10px] font-bold leading-none tracking-[0.12em] text-gray-900">
                              {month}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div
                        className="absolute right-3 top-3 z-20 sm:right-4 sm:top-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <BookmarkButton
                          eventId={event.id}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-gray-900 shadow-md ring-1 ring-black/[0.06] transition hover:bg-gray-50 [&_svg]:h-[18px] [&_svg]:w-[18px]"
                        />
                      </div>
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col px-5 pb-5 pt-4">
                      <h3 className="mb-2 line-clamp-2 min-h-[2.75rem] text-base font-bold leading-snug tracking-tight text-gray-900 md:min-h-[3rem] md:text-[1.05rem]">
                        {event.title}
                      </h3>
                      <div className="mb-1 flex min-h-[2.5rem] items-start gap-2 text-gray-600 md:min-h-[2.75rem]">
                        <svg
                          className="mt-0.5 h-4 w-4 shrink-0 text-gray-800"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden
                        >
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        <p className="line-clamp-2 text-sm font-medium leading-relaxed">{locationLine}</p>
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                        <TrendingGoingRow profiles={profiles} total={total} />
                        <button
                          type="button"
                          onClick={(e) => handleRegister(e, event)}
                          className="inline-flex h-10 shrink-0 items-center justify-center rounded-sm bg-[#002C71] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#002255] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#002C71]"
                        >
                          Register
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            : Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-full flex-col overflow-hidden rounded-sm border border-gray-100/90 bg-white shadow-sm ring-1 ring-black/[0.04]"
                >
                  <div className="home-shimmer aspect-[5/3] w-full shrink-0" />
                  <div className="flex min-h-0 flex-1 flex-col space-y-3 px-5 pb-5 pt-4">
                    <div className="home-shimmer h-5 min-h-[2.75rem] w-[82%] rounded-sm md:min-h-[3rem]" />
                    <div className="home-shimmer h-4 min-h-[2.5rem] w-[88%] rounded-sm md:min-h-[2.75rem]" />
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <div className="flex shrink-0">
                          {Array.from({ length: 3 }).map((_, j) => (
                            <div
                              key={j}
                              className="home-shimmer h-8 w-8 rounded-full border-2 border-white"
                              style={{ marginLeft: j === 0 ? 0 : -10, zIndex: 3 - j }}
                            />
                          ))}
                        </div>
                        <div className="home-shimmer h-4 w-24 rounded" />
                      </div>
                      <div className="home-shimmer h-10 w-[5.5rem] shrink-0 rounded-sm" />
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  )
}
