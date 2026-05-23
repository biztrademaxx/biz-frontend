"use client"

import type React from "react"
import { Calendar, Clock, Ticket, Users } from "lucide-react"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import Image from "next/image"
import { useEffect, useState } from "react"
import { formatPublicTicketPriceLine } from "@/lib/ticket-price-display"
import { formatEventSidebarTimeRange } from "@/lib/event-sidebar-time-range"
import { BRAND_IMAGE_BOTTOM_FADE } from "@/lib/brand-image-gradients"
import { resolveEventBannerImage } from "@/lib/events/resolve-event-banner-image"

const DEFAULT_EVENT_HERO_IMAGE = "/herosection-images/eventbanner.jpeg"

interface Event {
  id: string
  title: string
  subtitle?: string
  subTitle?: string
  address?: string
  startDate?: string
  endDate?: string
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

  // Get ticket price display
  const getTicketPriceDisplay = () => formatPublicTicketPriceLine(event.ticketTypes)

  // Get followers count
  const getFollowersCount = () => {
    if (event.followers && event.followers > 0) {
      return event.followers
    }
    if (event.leads && event.leads.length > 0) {
      return event.leads.length
    }
    if (event.currentAttendees && event.currentAttendees > 0) {
      return event.currentAttendees
    }
    return null
  }

  // Format date range
  const formatDateRange = () => {
    if (!event.startDate || !event.endDate) {
      return "Date to be announced"
    }

    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)

    const isSameDay = startDate.toDateString() === endDate.toDateString()

    if (isSameDay) {
      return startDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    } else {
      return `${startDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      })} - ${endDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}`
    }
  }

  // Format time range
  const formatTimeRange = () => {
    if (!event.startDate || !event.endDate) {
      return "Time to be announced"
    }

    const startTime = new Date(event.startDate).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    })

    const endTime = new Date(event.endDate).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    })

    return `${startTime} – ${endTime}`
  }

  const followersCount = getFollowersCount()

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
      {/* Top hero strip: fixed branding image (event photos only in card slider below) */}
      <div className="relative h-[200px] md:h-[300px] lg:h-[200px] overflow-hidden">
        <div className="relative h-full w-full">
          {/* Slight scale + light blur avoids soft edges clipping inside overflow-hidden */}
          <Image
            src={DEFAULT_EVENT_HERO_IMAGE}
            alt={event.title}
            fill
            className="object-cover scale-105 blur-sm brightness-[0.82] saturate-[0.92]"
            sizes="100vw"
            priority
          />
          {/* Smoky / mist veil */}
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

      {/* Main Card — same horizontal inset as EventPageSummaryBar (max-w-7xl + px-3/4/6) */}
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="relative z-10 -mt-[72px] flex w-full flex-col items-stretch overflow-hidden rounded-sm bg-white shadow-md sm:-mt-[96px] md:-mt-[120px] md:flex-row">
        {/* Slider Section */}
        <div className="relative min-h-[220px] w-full sm:min-h-[260px] md:min-h-[320px] md:w-2/3">
          <div
            ref={sliderRef}
            className="keen-slider h-[220px] w-full sm:h-[260px] md:h-[320px]"
          >
            {hasMainSliderMedia ? (
              <>
                {slideImages.map((imgSrc, index) => (
                  <div
                    key={`image-${index}`}
                    className="keen-slider__slide relative h-[220px] w-full bg-neutral-100 sm:h-[260px] md:h-[320px]"
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
                    className="keen-slider__slide relative h-[220px] w-full sm:h-[260px] md:h-[320px]"
                  >
                    <video className="h-full w-full object-cover" autoPlay loop muted playsInline>
                      <source src={vid} type="video/mp4" />
                    </video>
                  </div>
                ))}
              </>
            ) : (
              <div className="keen-slider__slide relative h-[220px] w-full bg-neutral-100 sm:h-[260px] md:h-[320px]">
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
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
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
              <p className="leading-tight">{formatDateRange()}</p>
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

            {/* Followers - ONLY SHOW IF WE HAVE FOLLOWERS */}
            {followersCount !== null && followersCount > 0 && (
              <div className="flex items-center gap-2 sm:gap-3">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-black flex-shrink-0" />
                <span className="leading-tight">
                  {followersCount.toLocaleString()} {followersCount === 1 ? 'Follower' : 'Followers'}
                </span>
              </div>
            )}
          </div>

          {/* Status Badge if postponed */}
          {event.postponedReason && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Postponed: {event.postponedReason}
              </span>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}