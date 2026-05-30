"use client"

import { AppImage } from "@/components/app-image"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { MapPin, Play } from "lucide-react"
import { eventPublicPath } from "@/lib/event-path"
import HomeSectionEmptyState, { homeEmptyDescription } from "@/components/home/HomeSectionEmptyState"
import { hasDisplayableEventImage } from "@/lib/event-card-meta"
import type { HeroSlideshowEvent } from "@/lib/hero/types"

export type Event = HeroSlideshowEvent

function cardImageUrl(event: Event): string {
  if (event.vipImage?.trim()) return event.vipImage.trim()
  if (event.bannerImage?.trim()) return event.bannerImage.trim()
  const first = event.images?.[0]
  if (typeof first === "string" && first.trim()) return first.trim()
  return ""
}

/** Pull up to 4 images from the event for the 2x2 grid */
function eventGridImages(event: Event): string[] {
  const imgs: string[] = []

  if (event.vipImage?.trim()) imgs.push(event.vipImage.trim())

  if (
    event.bannerImage?.trim() &&
    !imgs.includes(event.bannerImage.trim())
  ) {
    imgs.push(event.bannerImage.trim())
  }

  if (Array.isArray(event.images)) {
    for (const img of event.images) {
      if (
        typeof img === "string" &&
        img.trim() &&
        !imgs.includes(img.trim())
      ) {
        imgs.push(img.trim())
      }
    }
  }

  return imgs.slice(0, 4)
}

function heroCardDateParts(
  startIso: string,
  endIso?: string | null,
): { line1: string; line2: string; yearLine: string } {
  const start = new Date(startIso)
  const end = endIso ? new Date(endIso) : null
  if (Number.isNaN(start.getTime())) return { line1: "—", line2: "", yearLine: "" }
  const monUpper = (x: Date) => x.toLocaleString("en-GB", { month: "short" }).toUpperCase()
  const startDay = start.getDate()
  const endDay = end && !Number.isNaN(end.getTime()) ? end.getDate() : null
  return {
    line1: endDay ? `${startDay}–${endDay}` : `${startDay}`,
    line2: monUpper(start),
    yearLine: String(start.getFullYear()),
  }
}

function vipCardTitleDisplay(title: string): string {
  return title.replace(/\s+(?:19|20)\d{2}$/, "").trim() || title
}

function formatLocationLine(event: Event): string {
  const v = event.venue
  if (!v) return ""
  const city = v.venueCity?.trim()
  const country = v.venueCountry?.trim()
  if (city && country) return `${city}, ${country}`
  if (city) return city
  if (country) return country
  return v.venueName?.trim() ?? ""
}

function leftPanelCopy(event: Event): { headline: React.ReactNode; body: string } {
  const title = vipCardTitleDisplay(event.subTitle || event.title)
  const location = formatLocationLine(event)
  const locationSnippet = location ? ` in ${location}` : ""
  const body =
    event.description?.trim() ||
    `Join industry leaders and innovators at ${title}${locationSnippet}. An unmissable experience bringing together the best in the field — don't miss your chance to be part of it.`
  const headline = (
    <>
      Discover the{" "}
      <span className="text-red-600">{title}</span>
    </>
  )
  return { headline, body }
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M7 0 L7.9 5.5 L13 7 L7.9 8.5 L7 14 L6.1 8.5 L1 7 L6.1 5.5 Z" fill="#9ca3af" />
    </svg>
  )
}

function StatBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
      {children}
    </div>
  )
}

const AUTO_ADVANCE_MS = 70000

export default function HeroSlideshowClient({
  initialEvents,
  homeCity,
  homeCountry,
}: {
  initialEvents: Event[]
  homeCity?: string | null
  homeCountry?: string | null
}) {
  const events = initialEvents.filter((e) => hasDisplayableEventImage(e))
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const total = events.length

  const go = useCallback(
    (index: number) => { setCurrent(((index % total) + total) % total) },
    [total],
  )

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent((c) => ((c + 1) % total))
    }, AUTO_ADVANCE_MS)
  }, [total])

  useEffect(() => {
    if (total <= 1) return
    resetTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [total, resetTimer])

  if (!events.length) {
    return (
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <HomeSectionEmptyState
          icon="trending"
          title="No VIP events in this region"
          description={homeEmptyDescription("VIP events with images", homeCity, homeCountry)}
          homeCity={homeCity}
          homeCountry={homeCountry}
          actions={[
            { label: "Browse all events", href: "/event" },
            { label: "Add event", href: "/organizer-signup", variant: "secondary" },
          ]}
          className="min-h-[280px] lg:min-h-[320px]"
        />
      </div>
    )
  }

  const event = events[current]
  const gridImages = eventGridImages(event)
  const { line1: dateLine1, line2: dateLine2, yearLine: dateYear } =
    heroCardDateParts(event.startDate, event.endDate)
  const location = formatLocationLine(event) || "Venue coming soon"
  const { headline, body } = leftPanelCopy(event)
  const eyebrowName = vipCardTitleDisplay(event.title).toUpperCase()

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[480px] lg:min-h-[540px]">

        {/* ── LEFT ── */}
        <div className="flex flex-col justify-center gap-5 px-8 py-10 lg:px-12 lg:py-14">

          <div className="flex items-center gap-2">
            <SparkleIcon />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
              Welcome to {eyebrowName}
            </span>
          </div>

          <h1
            className="font-extrabold leading-[1.06] tracking-tight text-[#0b1829] transition-all duration-500"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.6rem)", fontFamily: "'Syne', sans-serif" }}
          >
            {headline}
          </h1>

          <p className="max-w-sm text-[0.93rem] leading-relaxed text-gray-500 line-clamp-4">
            {body}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={eventPublicPath(event)}
              className="inline-flex items-center gap-2 rounded-full bg-[#0b1829] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1a2e47]"
            >
              Join beta <span aria-hidden>→</span>
            </Link>
            <a
              href="/event"
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-[#0b1829] transition-all hover:bg-[#0b1829] hover:text-white hover:border-[#0b1829]"
            >
              Learn more
            </a>
          </div>

          {/* Stats grid */}
          <div
            className="border-t border-gray-100 pt-5"
            style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr 1px 1fr", alignItems: "start" }}
          >
            {/* Stat 1 */}
            <div className="flex flex-col gap-2 pr-4">
              <StatBadge>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="1" y="6" width="2" height="4" rx="1" fill="currentColor" opacity=".5" />
                  <rect x="4.5" y="4" width="2" height="8" rx="1" fill="currentColor" opacity=".7" />
                  <rect x="8" y="2" width="2" height="12" rx="1" fill="currentColor" />
                  <rect x="11.5" y="4" width="2" height="8" rx="1" fill="currentColor" opacity=".7" />
                </svg>
              </StatBadge>
              <div>
                <div className="text-xl font-bold tracking-tight text-[#0b1829]" style={{ fontFamily: "'Syne', sans-serif" }}>99%</div>
                <div className="text-xs text-gray-400 leading-tight">Sound clarity</div>
              </div>
            </div>

            <div className="self-stretch bg-gray-200" aria-hidden />

            {/* Stat 2 — avatars */}
            <div className="flex flex-col gap-2 px-4">
              <div className="flex -space-x-2.5" aria-hidden>
                <div className="h-9 w-9 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.5" fill="#9ca3af" /><path d="M2 12c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="#9ca3af" strokeWidth="1.3" strokeLinecap="round" fill="none" /></svg>
                </div>
                <div className="h-9 w-9 rounded-full bg-gray-300 ring-2 ring-white flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.5" fill="#6b7280" /><path d="M2 12c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="#6b7280" strokeWidth="1.3" strokeLinecap="round" fill="none" /></svg>
                </div>
                <div className="h-9 w-9 rounded-full bg-gray-400 ring-2 ring-white flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.5" fill="#fff" /><path d="M2 12c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" fill="none" /></svg>
                </div>
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight text-[#0b1829]" style={{ fontFamily: "'Syne', sans-serif" }}>320K</div>
                <div className="text-xs text-gray-400 leading-tight">Number of users</div>
              </div>
            </div>

            <div className="self-stretch bg-gray-200" aria-hidden />

            {/* Stat 3 */}
            <div className="flex flex-col gap-2 pl-4">
              <StatBadge>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M8 6.5V9l1.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M6 1.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </StatBadge>
              <div>
                <div className="text-xl font-bold tracking-tight text-[#0b1829]" style={{ fontFamily: "'Syne', sans-serif" }}>15ms</div>
                <div className="text-xs text-gray-400 leading-tight">Avg. response time</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: reference-style framed card on dark navy bg ── */}
        <div
          className="flex items-center justify-center p-5 lg:p-7"
          style={{
            background: "#071020"
          }}
        >
          {/*
            Outer glow ring — teal/cyan gradient border matching reference
            Uses a padding trick: gradient bg + inner dark bg creates the border
          */}
          <div
            className="relative w-full overflow-hidden"
            style={{
              borderRadius: "16px",
              padding: "2px",
              background:
                "linear-gradient(135deg,#2dd4bf 0%,#14b8a6 50%,#0f766e 100%)",
              boxShadow:
                "0 0 15px rgba(45,212,191,.15)",
            }}
          >
            {/* Inner card — dark navy */}
            <div
              className="relative overflow-hidden"
              style={{ borderRadius: "14px", background: "#164e63" }}
            >
              {/* 2×2 image grid */}
              {event.videoUrl ? (
                <div
                  className="relative overflow-hidden"
                  style={{ aspectRatio: "16/9" }}
                >
                  <video
                    src={event.videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : gridImages.length === 1 ? (
                <div
                  className="relative overflow-hidden"
                  style={{ aspectRatio: "16/9" }}
                >
                  <AppImage
                    src={gridImages[0]}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2" style={{ aspectRatio: "16/9" }}>
                  {gridImages.map((src, i) => (
                    <div
                      key={i}
                      className="relative overflow-hidden"
                      style={{
                        borderRight:
                          i % 2 === 0
                            ? "1px solid rgba(255,255,255,0.08)"
                            : "none",
                        borderBottom:
                          i < 2
                            ? "1px solid rgba(255,255,255,0.08)"
                            : "none",
                      }}
                    >
                      <AppImage
                        src={src}
                        alt={`${event.title} photo ${i + 1}`}
                        fill
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              )}
              </div>

              {/* "featured video" pill — top right over image */}
            <div className="absolute left-4 bottom-16 z-20">
              <span
                className="rounded-full px-4 py-2 text-xs font-medium text-[#1f2937]"
                style={{
                  background: "#ffffff",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                }}
              >
                Featured Video
              </span>
            </div>

              {/* Bottom bar — live indicator + play + register CTA */}
            <div
              className="relative flex items-center px-4 py-4"
              style={{ background: "rgba(5,12,28,0.92)" }}
            >
              {/* Left Location */}
              <div
                className="flex shrink-0 items-center gap-2 rounded-full px-4 py-2"
                style={{
                  background: "rgba(0,180,200,.18)",
                  border: "1px solid rgba(0,200,220,.35)",
                }}
              >
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold uppercase text-cyan-300">
                  {location}
                </span>
              </div>

              {/* Center Play Button */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <button
                  type="button"
                  aria-label="Play featured video"
                  className="
        flex
        h-14
        w-14
        items-center
        justify-center
        rounded-full
        bg-white/10
        backdrop-blur-md
        border
        border-white/20
        shadow-lg
        transition-all
        hover:scale-110
      "
                >
                  <Play className="h-5 w-5 fill-white text-white ml-0.5" />
                </button>
              </div>

              {/* Register Button */}
              <Link
                href={eventPublicPath(event)}
                className="
      ml-auto
      flex
      items-center
      justify-center
      rounded-full
      px-8
      py-3
      text-sm
      font-bold
      uppercase
      tracking-wider
      transition-all
      hover:scale-105
    "
                style={{
                  background: "#ffffff",
                  color: "#0b1829",
                }}
              >
                Register To Attend
              </Link>
            </div>
            </div>
          </div>

    
        </div>


      </div>
    
  )
}