"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion"
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react"
import { AppImage } from "@/components/app-image"
import HomeSectionEmptyState, { homeEmptyDescription } from "@/components/home/HomeSectionEmptyState"
import { hasDisplayableEventImage } from "@/lib/event-card-meta"
import { eventPublicPath } from "@/lib/event-path"
import { getHeroSlideshowCardImageUrl } from "@/lib/hero/hero-featured-image"
import { parseLocalDateKey } from "@/lib/format-local-date-key"
import type { HeroSlideshowEvent } from "@/lib/hero/types"

export type Event = HeroSlideshowEvent

const AUTO_ADVANCE_MS = 7000
const CARDS_PER_SLIDE = 3
const SLIDE_EASE = [0.76, 0, 0.24, 1] as const
const ENTER_EASE = [0.22, 1, 0.36, 1] as const
const EXIT_S = 0.5
const SWAP_S = 0.95
const CARD_STAGGER = 0.09
const CARD_IN_STEP = 90
const CARD_ITEM_CLASS =
  "h-full shrink-0 snap-center snap-always basis-full min-w-full lg:min-w-0 lg:max-w-none lg:basis-0 lg:flex-1"

/** Outer hero — blue brand pattern (visible during frame wipe) */
const HERO_OUTER_BG = "#e8f1fb"
/** Transition wipe panel — soft blue-grey (not pure white) */
const FRAME_WIPE_BG = "#e9eef5"

type Phase = "idle" | "exit" | "swap"

const SLIDE_THEMES = [
  {
    title: "Must See Events",
    description:
      "Connect with buyers, exhibitors, and industry leaders at the world's leading trade fairs.",
  },
  {
    title: "Trending Trade Fairs",
    description:
      "Discover exhibitions shaping global commerce, innovation, and cross-border partnerships.",
  },
  {
    title: "Global Exhibitions",
    description:
      "Explore premier business events across continents and grow your professional network.",
  },
] as const

const BLOB_SETS = [
  [
    "radial-gradient(circle, rgba(0, 74, 150, 0.35) 0%, rgba(0, 74, 150, 0) 62%, transparent 100%)",
    "radial-gradient(circle, rgba(100, 181, 246, 0.55) 0%, rgba(67, 160, 244, 0) 62%, transparent 100%)",
  ],
  [
    "radial-gradient(circle, rgba(66, 133, 244, 0.4) 0%, rgba(0, 74, 150, 0) 62%, transparent 100%)",
    "radial-gradient(circle, rgba(144, 202, 249, 0.5) 0%, rgba(25, 118, 210, 0) 62%, transparent 100%)",
  ],
  [
    "radial-gradient(circle, rgba(0, 96, 170, 0.38) 0%, rgba(0, 74, 150, 0) 62%, transparent 100%)",
    "radial-gradient(circle, rgba(129, 212, 250, 0.48) 0%, rgba(3, 155, 229, 0) 62%, transparent 100%)",
  ],
] as const

function buildSlides(events: Event[], perSlide: number): Event[][] {
  if (!events.length) return []
  const slides: Event[][] = []
  for (let i = 0; i < events.length; i += perSlide) {
    const chunk = events.slice(i, i + perSlide)
    if (chunk.length < perSlide) {
      const padded = [...chunk]
      while (padded.length < perSlide) {
        padded.push(events[padded.length % events.length])
      }
      slides.push(padded)
    } else {
      slides.push(chunk)
    }
  }
  return slides
}

function cardLocation(event: Event): { place: string; region: string } {
  const v = event.venue
  const city = v?.venueCity?.trim() || ""
  const country = v?.venueCountry?.trim() || ""
  const name = v?.venueName?.trim() || ""
  const place = event.subTitle?.trim() || event.title?.trim() || name || "Featured Event"
  const region = country || city || "Worldwide"
  return { place, region }
}

function parseEventCalendarDate(dateString: string): Date | null {
  if (!dateString?.trim()) return null
  const dateOnly = dateString.trim().slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    return parseLocalDateKey(dateOnly)
  }
  const d = new Date(dateString)
  return Number.isNaN(d.getTime()) ? null : d
}

function padCardDay(d: Date): string {
  return String(d.getDate()).padStart(2, "0")
}

function cardMonthUpper(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
}

type CardDateDisplay = {
  dayLine: string
  monthYearLine: string
  aria: string
}

/** e.g. dayLine "01 - 03", monthYearLine "JUN 2020" */
function cardEventDates(event: Event): CardDateDisplay | null {
  const start = parseEventCalendarDate(event.startDate)
  if (!start) return null

  const end = event.endDate ? parseEventCalendarDate(event.endDate) : start
  if (!end) return null

  const startDay = padCardDay(start)
  const endDay = padCardDay(end)
  const startMonth = cardMonthUpper(start)
  const endMonth = cardMonthUpper(end)
  const startYear = start.getFullYear()
  const endYear = end.getFullYear()

  const sameDay =
    start.getDate() === end.getDate() &&
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()

  if (sameDay) {
    const monthYearLine = `${startMonth} ${startYear}`
    return {
      dayLine: startDay,
      monthYearLine,
      aria: `${startDay} ${monthYearLine}`,
    }
  }

  const sameMonthYear = startMonth === endMonth && startYear === endYear
  if (sameMonthYear) {
    const monthYearLine = `${startMonth} ${startYear}`
    return {
      dayLine: `${startDay} - ${endDay}`,
      monthYearLine,
      aria: `${startDay} to ${endDay} ${monthYearLine}`,
    }
  }

  if (startYear === endYear) {
    const dayLine = `${startDay} ${startMonth} - ${endDay} ${endMonth}`
    return {
      dayLine,
      monthYearLine: String(startYear),
      aria: `${startDay} ${startMonth} to ${endDay} ${endMonth} ${startYear}`,
    }
  }

  const dayLine = `${startDay} ${startMonth} - ${endDay} ${endMonth}`
  return {
    dayLine,
    monthYearLine: `${startYear} - ${endYear}`,
    aria: `${startDay} ${startMonth} ${startYear} to ${endDay} ${endMonth} ${endYear}`,
  }
}

function AmbientBackground({
  blobs,
  reduceMotion,
  parallaxX,
  parallaxY,
}: {
  blobs: readonly [string, string]
  reduceMotion: boolean | null
  parallaxX: ReturnType<typeof useSpring>
  parallaxY: ReturnType<typeof useSpring>
}) {
  const blob1X = useTransform(parallaxX, [-1, 1], [-80, 80])
  const blob1Y = useTransform(parallaxY, [-1, 1], [-45, 45])
  const blob2X = useTransform(parallaxX, [-1, 1], [65, -65])
  const blob2Y = useTransform(parallaxY, [-1, 1], [35, -35])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -left-[6%] top-[-16%] h-[85vw] max-h-[1300px] w-[85vw] max-w-[1300px]"
        style={{ x: reduceMotion ? 0 : blob1X, y: reduceMotion ? 0 : blob1Y }}
      >
        <motion.div
          className="h-full w-full rounded-full"
          animate={{ background: blobs[0], x: [0, 55, -30, 45, 0] }}
          transition={{
            background: { duration: SWAP_S, ease: SLIDE_EASE },
            x: { duration: 20, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      </motion.div>
      <motion.div
        className="absolute -right-[4%] top-[-26%] h-[80vw] max-h-[1200px] w-[80vw] max-w-[1200px]"
        style={{ x: reduceMotion ? 0 : blob2X, y: reduceMotion ? 0 : blob2Y }}
      >
        <motion.div
          className="h-full w-full rounded-full"
          animate={{ background: blobs[1], x: [0, -65, 38, -50, 0] }}
          transition={{
            background: { duration: SWAP_S, ease: SLIDE_EASE },
            x: { duration: 24, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
          }}
        />
      </motion.div>
    </div>
  )
}

function DestinationCard({ event, priority }: { event: Event; priority?: boolean }) {
  const imageUrl = getHeroSlideshowCardImageUrl(event)
  const { place, region } = cardLocation(event)
  const dates = cardEventDates(event)
  const dateAria = dates?.aria ?? null

  return (
    <div className="h-full w-full min-w-0">
      <Link
        href={eventPublicPath(event)}
        className="group relative block h-full w-full overflow-hidden rounded-[12px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] sm:rounded-[15px]"
        aria-label={dateAria ? `${place}, ${dateAria}` : place}
      >
        <div className="relative h-[300px] w-full overflow-hidden rounded-sm sm:h-[420px] sm:rounded-sm lg:h-[400px] xl:h-[520px]">
          {imageUrl ? (
            <AppImage
              src={imageUrl}
              alt={place}
              fill
              priority={priority}
              sizes="(max-width: 1023px) 100vw, 33vw"
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-300 to-slate-500" />
          )}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/45 to-transparent"
            aria-hidden
          />
          <div className="absolute bottom-0 left-0 right-0 z-10 p-3 sm:p-6 lg:p-8">
            {dates ? (
              <div className="mb-2 sm:mb-3">
                <p className="text-base font-bold leading-none tracking-[0.06em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] sm:text-lg lg:text-xl">
                  {dates.dayLine}
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] sm:text-xs">
                  {dates.monthYearLine}
                </p>
              </div>
            ) : null}
            <p className="line-clamp-2 text-base font-bold leading-tight tracking-[-0.02em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)] sm:text-[clamp(1.25rem,2.2vw,2.5rem)]">
              {place}
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#ff2323] drop-shadow-sm" strokeWidth={2.5} aria-hidden />
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] sm:text-xs">
                {region}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

function SlideText({ slideIndex }: { slideIndex: number }) {
  const theme = SLIDE_THEMES[slideIndex % SLIDE_THEMES.length]
  return (
    <div className="w-full shrink-0 lg:w-[33.333%] lg:pr-10 xl:pr-14">
      <h1 className="mb-3 text-[1.75rem] font-extrabold leading-[0.95] tracking-[-0.03em] text-[#1a093f] sm:mb-6 sm:text-[clamp(2rem,5vw,6.25rem)] sm:leading-[0.9]">
        {theme.title}
      </h1>
      <p className="mb-5 max-w-md text-sm leading-6 text-[#1a093f]/80 sm:mb-8 sm:text-[17px] sm:leading-8 xl:text-lg">
        {theme.description}
      </p>
      <Link
        href="/event"
        className="inline-flex w-full items-center justify-center rounded-full border border-white/30 bg-gradient-to-br from-[#ff5e3a] to-[#ff2a68] px-8 py-3 text-base font-bold text-white shadow-[0_7px_20px_rgba(255,91,143,0.41)] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] sm:w-auto sm:px-16 sm:py-4 sm:text-lg"
      >
        Explore
      </Link>
    </div>
  )
}

function SlideCards({
  slideIndex,
  cards,
  stagger,
  direction,
  imagePriority,
}: {
  slideIndex: number
  cards: Event[]
  stagger?: boolean
  direction?: 1 | -1
  imagePriority?: boolean
}) {
  const sign = direction && direction > 0 ? 1 : -1

  return (
    <div className="w-full min-w-0 lg:w-[66.666%]">
      <div
        className={[
          "flex gap-0 lg:gap-2",
          "min-h-[300px] overflow-x-auto overscroll-x-contain pb-1",
          "snap-x snap-mandatory scroll-smooth touch-pan-x",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          "lg:min-h-[400px] lg:overflow-visible lg:snap-none lg:pb-0",
          "xl:min-h-[520px]",
        ].join(" ")}
      >
        {cards.map((event, index) => {
          const inner = <DestinationCard event={event} priority={imagePriority && index === 0} />
          if (!stagger || !direction) {
            return (
              <div key={`${slideIndex}-${event.id}`} className={CARD_ITEM_CLASS}>
                {inner}
              </div>
            )
          }
          const delay = sign > 0 ? index * CARD_STAGGER : (CARDS_PER_SLIDE - 1 - index) * CARD_STAGGER
          return (
            <motion.div
              key={`${slideIndex}-${event.id}`}
              className={`${CARD_ITEM_CLASS} will-change-transform`}
              initial={{ x: sign * (CARD_IN_STEP + index * 70), y: 0 }}
              animate={{ x: 0, y: 0 }}
              transition={{ type: "tween", duration: SWAP_S * 0.9, delay, ease: ENTER_EASE }}
            >
              {inner}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function SlideRow({
  slideIndex,
  cards,
  stagger,
  direction,
  imagePriority,
}: {
  slideIndex: number
  cards: Event[]
  stagger?: boolean
  direction?: 1 | -1
  imagePriority?: boolean
}) {
  return (
    <div className="flex w-full flex-col gap-5 sm:gap-8 lg:flex-row lg:items-start lg:gap-0">
      <SlideText slideIndex={slideIndex} />
      <SlideCards
        slideIndex={slideIndex}
        cards={cards}
        stagger={stagger}
        direction={direction}
        imagePriority={imagePriority}
      />
    </div>
  )
}

/** Phase 2 — white frame sweeps left → right (next) */
function WhiteFrame({ direction }: { direction: 1 | -1 }) {
  const from = direction > 0 ? "-100%" : "100%"
  const to = direction > 0 ? "100%" : "-100%"

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[5] h-full min-h-full"
      style={{ backgroundColor: FRAME_WIPE_BG }}
      initial={{ x: from, y: 0 }}
      animate={{ x: to, y: 0 }}
      transition={{ duration: SWAP_S, ease: SLIDE_EASE }}
      aria-hidden
    />
  )
}

/** Phase 3 — new text + cards enter right → left (same time as white frame) */
function IncomingSlide({
  slideIndex,
  cards,
  direction,
  onComplete,
}: {
  slideIndex: number
  cards: Event[]
  direction: 1 | -1
  onComplete: () => void
}) {
  const from = direction > 0 ? "100%" : "-100%"

  return (
    <motion.div
      className="absolute inset-0 z-20 will-change-transform"
      initial={{ x: from, y: 0 }}
      animate={{ x: 0, y: 0 }}
      transition={{ type: "tween", duration: SWAP_S, ease: ENTER_EASE }}
      onAnimationComplete={onComplete}
    >
      <SlideRow slideIndex={slideIndex} cards={cards} stagger direction={direction} />
    </motion.div>
  )
}

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
  const slides = useMemo(() => buildSlides(events, CARDS_PER_SLIDE), [events])
  const [displayIdx, setDisplayIdx] = useState(0)
  const [pendingIdx, setPendingIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>("idle")
  const [direction, setDirection] = useState<1 | -1>(1)
  const reduceMotion = useReducedMotion()

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const parallaxX = useSpring(mouseX, { stiffness: 35, damping: 22 })
  const parallaxY = useSpring(mouseY, { stiffness: 35, damping: 22 })

  const isAnimating = phase !== "idle"
  const footerIdx = phase === "swap" ? pendingIdx : displayIdx

  const goTo = useCallback(
    (next: number, dir: 1 | -1) => {
      if (!slides.length || phase !== "idle") return
      const normalized = ((next % slides.length) + slides.length) % slides.length
      if (normalized === displayIdx) return
      setDirection(dir)
      setPendingIdx(normalized)
      if (reduceMotion) {
        setDisplayIdx(normalized)
        return
      }
      setPhase("exit")
    },
    [slides.length, phase, displayIdx, reduceMotion],
  )

  const advance = useCallback(
    (dir: "prev" | "next") => {
      goTo(displayIdx + (dir === "next" ? 1 : -1), dir === "next" ? 1 : -1)
    },
    [displayIdx, goTo],
  )

  useEffect(() => {
    if (slides.length <= 1 || phase !== "idle") return
    const id = window.setInterval(() => advance("next"), AUTO_ADVANCE_MS)
    return () => window.clearInterval(id)
  }, [slides.length, advance, phase])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (reduceMotion) return
      const rect = e.currentTarget.getBoundingClientRect()
      mouseX.set(((e.clientX - rect.left) / rect.width) * 2 - 1)
      mouseY.set(((e.clientY - rect.top) / rect.height) * 2 - 1)
    },
    [mouseX, mouseY, reduceMotion],
  )

  if (!slides.length) {
    return (
      <div className="w-full px-[clamp(1rem,5vw,200px)]">
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

  const blobs = BLOB_SETS[footerIdx % BLOB_SETS.length]
  const slideCount = slides.length
  const slideLabel = String(footerIdx + 1).padStart(2, "0")
  const totalLabel = String(slideCount).padStart(2, "0")
  const sign = direction > 0 ? 1 : -1
  const exitX = sign > 0 ? "-100%" : "100%"

  return (
    <section
      aria-label="Featured trade fairs"
      onPointerMove={handlePointerMove}
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen min-w-0 overflow-hidden py-6 sm:py-12 lg:min-h-[760px] lg:py-14 xl:min-h-[820px] xl:py-20"
      style={{ backgroundColor: HERO_OUTER_BG }}
    >
      <AmbientBackground
        blobs={blobs}
        reduceMotion={reduceMotion}
        parallaxX={parallaxX}
        parallaxY={parallaxY}
      />

      {phase === "swap" && <WhiteFrame direction={direction} />}

      <div className="relative z-10 mx-auto w-full px-4 sm:px-[clamp(1rem,5vw,200px)]">
        <div className="relative overflow-hidden lg:min-h-[480px] xl:min-h-[560px]">
          {/* Idle — content on blue pattern */}
          {phase === "idle" && (
            <SlideRow slideIndex={displayIdx} cards={slides[displayIdx]} imagePriority={displayIdx === 0} />
          )}

          {/* Phase 1 — current text + cards exit left */}
          {phase === "exit" && (
            <motion.div
              key={`exit-${displayIdx}`}
              className="absolute inset-0 z-30 will-change-transform"
              initial={{ x: 0, y: 0 }}
              animate={{ x: exitX, y: 0 }}
              transition={{ duration: EXIT_S, ease: SLIDE_EASE }}
              onAnimationComplete={() => setPhase("swap")}
            >
              <SlideRow slideIndex={displayIdx} cards={slides[displayIdx]} />
            </motion.div>
          )}

          {/* Phase 2 + 3 — white frame L→R while new content R→L (same time) */}
          {phase === "swap" && (
            <IncomingSlide
              slideIndex={pendingIdx}
              cards={slides[pendingIdx]}
              direction={direction}
              onComplete={() => {
                setDisplayIdx(pendingIdx)
                setPhase("idle")
              }}
            />
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:mt-10 sm:gap-4 sm:flex-row sm:items-center sm:justify-between lg:mt-12">
          <div className="hidden text-sm font-medium lowercase tracking-[0.12em] text-[#004A96]/70 sm:block lg:w-[33.333%]">
            trade.
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 lg:w-[66.666%] lg:justify-end">
            <span className="text-center text-[11px] font-medium uppercase tracking-[0.14em] text-[#1a093f] sm:text-left sm:text-xs">
              Featured Events
            </span>
            <div className="flex items-center justify-center gap-2 sm:justify-end sm:gap-3">
              <span className="text-sm font-medium uppercase tracking-[0.2em] text-[#1a093f]">
                {slideLabel}
              </span>
              <span className="text-sm font-medium uppercase tracking-[0.2em] text-[#bc1c4f]">/</span>
              <span className="text-sm font-medium uppercase tracking-[0.2em] text-[#1a093f]">
                {totalLabel}
              </span>
              <button
                type="button"
                aria-label="Previous slide"
                disabled={isAnimating}
                onClick={() => advance("prev")}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#004A96]/35 text-[#004A96] transition-colors hover:border-[#004A96] hover:bg-white/50 disabled:opacity-40"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2} />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                disabled={isAnimating}
                onClick={() => advance("next")}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#004A96]/35 text-[#004A96] transition-colors hover:border-[#004A96] hover:bg-white/50 disabled:opacity-40"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
