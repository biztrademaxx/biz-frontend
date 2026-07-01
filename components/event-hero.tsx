"use client"

import type React from "react"
import { Calendar, Clock, Ticket, Users } from "lucide-react"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import Image from "next/image"
import { useEffect, useState } from "react"
import { formatPublicTicketPriceLine } from "@/lib/ticket-price-display"
import { formatEventSidebarTimeRange } from "@/lib/event-sidebar-time-range"
import { formatEventPublicDateRange, getEventPostponedNotice, isEventPostponed } from "@/lib/event-schedule-display"
import { BRAND_IMAGE_BOTTOM_FADE } from "@/lib/brand-image-gradients"
import { resolveEventBannerImage } from "@/lib/events/resolve-event-banner-image"

const DEFAULT_EVENT_HERO_IMAGE = "/herosection-images/eventbanner.jpeg"

interface Event {
  bannerImage: unknown
  thumbnailImage: unknown
  logo: unknown
  id: string
  title: string
  subtitle?: string
  subTitle?: string
  address?: string
  startDate?: string
  endDate?: string
  previousStartDate?: string | null
  previousEndDate?: string | null
  isPostponed?: boolean
  postponedReason?: string
  images: string[]
  videos?: string[]
  description: string
  shortDescription?: string
  leads: string[]
  ticketTypes: Array<{
    name: string
    price: number
    currency?: string
  }>
  location: {
    city: string
    venue: string
    address: string
    country?: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  followers?: number
  currentAttendees?: number
  maxAttendees?: number
}

interface EventHeroProps {
  event: Event
}

// ── Countdown hook ────────────────────────────────────────────────────────────
function useCountdown(targetDate?: string) {
  const calcTimeLeft = () => {
    if (!targetDate) return null
    const diff = new Date(targetDate).getTime() - Date.now()
    if (diff <= 0) return null
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
    }
  }

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft)

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return timeLeft
}
/** Navbar navy glass — matches `navbar.tsx` #002C71 / #004A96 system */
const COUNTDOWN_OUTER_GLASS: React.CSSProperties = {
  background: "transparent",
  border: "none",
  boxShadow: "none",
}

const COUNTDOWN_UNIT_GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.75)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(226,232,240,0.8)",
  boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="flex h-[58px] min-w-[62px] items-center justify-center rounded-xl px-3"
        style={COUNTDOWN_UNIT_GLASS}
      >
        <span className="text-[22px] font-bold tabular-nums text-[#002C71]">
          {String(value).padStart(2, "0")}
        </span>
      </div>

      <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
    </div>
  )
}

// ── Countdown banner ──────────────────────────────────────────────────────────
function EventCountdownBanner({ startDate }: { startDate?: string }) {
  const timeLeft = useCountdown(startDate)

  if (!startDate || !timeLeft) return null

  return (
    <div className="rounded-sm p-4" style={COUNTDOWN_OUTER_GLASS}>
      <div className="flex items-center justify-start gap-2 pt-1">
        <CountdownUnit value={timeLeft.days} label="Days" />

        <span className="pb-4 text-xl font-light text-slate-300">
          :
        </span>

        <CountdownUnit value={timeLeft.hours} label="Hours" />

        <span className="pb-4 text-xl font-light text-slate-300">
          :
        </span>

        <CountdownUnit value={timeLeft.minutes} label="Mins" />
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function EventHero({ event }: EventHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [images, setImages] = useState<string[]>(event.images || [])

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1 },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel)
    },
  })

  useEffect(() => {
    const slider = instanceRef.current
    if (!slider) return
    const interval = setInterval(() => {
      slider.next()
    }, 10000)
    return () => clearInterval(interval)
  }, [instanceRef])

  useEffect(() => {
    const raw = Array.isArray(event.images) ? event.images : []
    const cleaned = raw.filter(
      (img): img is string =>
        typeof img === "string" && img.trim() !== "" && img !== "null" && img !== "undefined",
    )
    const banner = resolveEventBannerImage(event as Parameters<typeof resolveEventBannerImage>[0])
    if (banner && !cleaned.includes(banner)) {
      setImages([banner, ...cleaned])
    } else {
      setImages(cleaned)
    }
  }, [event.images, event.bannerImage, event.thumbnailImage, event.logo])

  const getTicketPriceDisplay = () => formatPublicTicketPriceLine(event.ticketTypes)

  const getFollowersCount = () => {
    if (event.followers && event.followers > 0) return event.followers
    if (event.leads && event.leads.length > 0) return event.leads.length
    if (event.currentAttendees && event.currentAttendees > 0) return event.currentAttendees
    return null
  }

  const followersCount = getFollowersCount()
  const postponed = isEventPostponed(event)

  const slideImages = images.filter(
    (img) =>
      typeof img === "string" && img.trim() !== "" && img !== "null" && img !== "undefined"
  )
  const videoSlides = event.videos ?? []
  const hasMainSliderMedia = slideImages.length > 0 || videoSlides.length > 0

  const rawHeroLabel =
    (event.subTitle || event.subtitle || "").trim() || (event.title || "").trim()
  const eventSubtitle = rawHeroLabel.slice(0, 10)

  return (
    <div>
      {/* Top hero strip */}
      <div className="relative h-[200px] md:h-[300px] lg:h-[200px] overflow-hidden">
        <div className="relative h-full w-full">
          <Image
            src={DEFAULT_EVENT_HERO_IMAGE}
            alt={event.title}
            fill
            className="object-cover scale-105 blur-sm brightness-[0.82] saturate-[0.92]"
            sizes="100vw"
            priority
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_40%,rgba(15,23,42,0.14)_0%,rgba(15,23,42,0.38)_45%,rgba(2,6,23,0.52)_100%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/35 via-slate-900/14 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 top-1/4"
            style={{ backgroundImage: BRAND_IMAGE_BOTTOM_FADE }}
            aria-hidden
          />
        </div>
      </div>

      {/* Main Card */}
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="relative z-10 -mt-[72px] flex w-full flex-col overflow-hidden rounded-sm bg-white shadow-md sm:-mt-[96px] md:-mt-[120px] md:flex-row md:items-stretch">

          {/* Slider Section — fixed height on mobile/tablet (flex-col stacks
              this above the info panel, so it needs a real height of its
              own); at md+ the layout switches to a row and `items-stretch`
              on the parent makes this match the info panel's height instead,
              so we drop back to h-auto there. */}
          <div className="relative w-full h-[260px] sm:h-[320px] md:h-auto md:w-2/3 self-stretch">
            <div
              ref={sliderRef}
              className="keen-slider absolute inset-0 h-full w-full"
            >
              {hasMainSliderMedia ? (
                <>
                  {slideImages.map((imgSrc, index) => (
                    <div
                      key={`image-${index}`}
                      className="keen-slider__slide relative h-full w-full bg-neutral-100"
                    >
                      <Image
                        src={imgSrc}
                        alt={`${event.title} Image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 66vw"
                        priority={index === 0}
                        onLoadingComplete={(imgEl) => {
                          const ratio = imgEl.naturalWidth / imgEl.naturalHeight
                          imgEl.style.objectFit = ratio > 2 ? "contain" : "cover"
                        }}
                      />
                    </div>
                  ))}

                  {videoSlides.map((vid: string, index: number) => (
                    <div
                      key={`video-${index}`}
                      className="keen-slider__slide relative h-full w-full"
                    >
                      <video className="h-full w-full object-cover" autoPlay loop muted playsInline>
                        <source src={vid} type="video/mp4" />
                      </video>
                    </div>
                  ))}
                </>
              ) : (
                <div className="keen-slider__slide relative h-full w-full bg-neutral-100">
                  <Image
                    src={DEFAULT_EVENT_HERO_IMAGE}
                    alt={event.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 66vw"
                  />
                </div>
              )}
            </div>

            {/* Slide Indicators */}
            {slideImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 z-10 transform -translate-x-1/2 flex space-x-2">
                {slideImages.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-colors ${idx === currentSlide ? "bg-white" : "bg-white/50"
                      }`}
                    onClick={() => instanceRef.current?.moveToIdx(idx)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="md:w-1/3 w-full bg-white p-4 sm:p-6 lg:p-8 flex flex-col justify-center space-y-3">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-black leading-snug line-clamp-2">
              {eventSubtitle}
            </h2>

            <div className="space-y-3 text-xs sm:text-sm text-gray-800 py-2">
              {/* Date */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-black flex-shrink-0" />
                <p className="leading-tight">{formatEventPublicDateRange(event.startDate, event.endDate)}</p>
              </div>

              {/* Time */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-black flex-shrink-0" />
                <span className="leading-tight">{formatEventSidebarTimeRange(event)}</span>
              </div>

              {/* Ticket Price */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-black flex-shrink-0" />
                <span className="leading-tight font-medium">
                  {getTicketPriceDisplay()}
                </span>
              </div>

              {/* Followers */}
              {followersCount !== null && followersCount > 0 && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-black flex-shrink-0" />
                  <span className="leading-tight">
                    {followersCount.toLocaleString()} {followersCount === 1 ? "Follower" : "Followers"}
                  </span>
                </div>
              )}
            </div>

            {/* ── Countdown Timer ── */}
            <EventCountdownBanner startDate={event.startDate} />
          </div>

        </div>
      </div>
    </div>
  )
}