// "use client"

// import { AppImage } from "@/components/app-image"
// import Link from "next/link"
// import { useCallback, useEffect, useRef } from "react"
// import { ChevronLeft, ChevronRight, MapPin } from "lucide-react"
// import { eventPublicPath } from "@/lib/event-path"
// import HomeSectionEmptyState, { homeEmptyDescription } from "@/components/home/HomeSectionEmptyState"
// import { hasDisplayableEventImage } from "@/lib/event-card-meta"
// import type { HeroSlideshowEvent } from "@/lib/hero/types"

// export type Event = HeroSlideshowEvent

// function cardImageUrl(event: Event): string {
//   if (event.bannerImage?.trim()) return event.bannerImage.trim()
//   const first = event.images?.[0]
//   if (typeof first === "string" && first.trim()) return first.trim()
//   return ""
// }

// /** Day, month, and year from event start only (end date is not shown). */
// function heroCardDateParts(
//   startIso: string,
//   endIso?: string | null,
// ): { line1: string; line2: string; yearLine: string } {
//   const start = new Date(startIso)
//   const end = endIso ? new Date(endIso) : null

//   if (Number.isNaN(start.getTime())) {
//     return { line1: "—", line2: "", yearLine: "" }
//   }

//   const monUpper = (x: Date) =>
//     x.toLocaleString("en-GB", { month: "short" }).toUpperCase()

//   const startDay = start.getDate()
//   const endDay = end && !Number.isNaN(end.getTime()) ? end.getDate() : null

//   return {
//     line1: endDay ? `${startDay}-${endDay}` : `${startDay}`,
//     line2: monUpper(start),
//     yearLine: String(start.getFullYear()),
//   }
// }

// /** VIP card title: hide trailing calendar year (e.g. "… Event 2022") when the badge already shows the year. */
// function vipCardTitleDisplay(title: string): string {
//   return title.replace(/\s+(?:19|20)\d{2}$/, "").trim() || title
// }

// function formatLocationLine(event: Event): string {
//   const v = event.venue
//   if (!v) return ""
//   const city = v.venueCity?.trim()
//   const country = v.venueCountry?.trim()
//   if (city && country) return `${city}, ${country}`
//   if (city) return city
//   if (country) return country
//   const name = v.venueName?.trim()
//   if (name) return name
//   return ""
// }

// function EventCard({ event }: { event: Event }) {
//   const imageUrl = cardImageUrl(event)
//   if (!imageUrl) return null

//   const { line1: dateLine1, line2: dateLine2, yearLine: dateYear } =
//     heroCardDateParts(event.startDate, event.endDate)
//   const location = formatLocationLine(event)
//   const locationDisplay = location || "Venue coming soon"

//   return (
//     <Link
//       href={eventPublicPath(event)}
//       className="block h-full min-w-0 w-full snap-start"
//       aria-label={vipCardTitleDisplay(event.title)}
//     >
//       <div className="group relative h-[448px] w-full min-w-0 overflow-hidden bg-[#F2F2F2] transition-all duration-300 ease-out hover:z-10 hover:scale-[1.02] hover:shadow-2xl md:h-[488px] lg:h-[528px] lg:hover:scale-105">
//         <AppImage
//           src={imageUrl}
//           alt={event.title}
//           fill
//           sizes="(max-width: 768px) 100vw, 50vw"
//           className="object-cover transition-transform duration-500 group-hover:scale-110"
//         />
//         <div
//           className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-950/40 to-transparent transition-all duration-300 group-hover:from-blue-950/95 group-hover:via-blue-950/50"
//           aria-hidden
//         />

//         <div className="absolute bottom-0 left-0 right-0 transform p-4 transition-transform duration-300 group-hover:-translate-y-2 md:p-6">
//           <div className="mb-3 flex w-full max-w-[min(100%,6.25rem)] flex-col items-start gap-2 md:mb-4 lg:max-w-[min(100%,5.75rem)]">
//             <span className="w-fit shrink-0 whitespace-nowrap rounded-sm bg-[#dc2626] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm md:text-xs">
//               Top events
//             </span>
//             <div
//               className="relative flex min-h-[5.25rem] w-full flex-col items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-[#0b3c8a] via-[#0a2f6b] to-[#081f4d] px-2 py-2 text-center font-bold shadow-[0_8px_22px_rgba(1,45,114,0.32),0_3px_10px_rgba(0,0,0,0.12)] ring-1 ring-white/10 md:min-h-[5.75rem] md:px-2.5 md:py-2.5 lg:min-h-[6rem]"
//               aria-hidden
//             >
//               <div
//                 className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-tr from-white/10 via-transparent to-white/5"
//                 aria-hidden
//               />
//               <div
//                 className="pointer-events-none absolute -left-6 top-0 z-[1] h-full w-16 bg-blue-400/30 blur-2xl"
//                 aria-hidden
//               />
//               <div
//                 className="pointer-events-none absolute right-0 top-0 z-[1] h-full w-10 bg-white/20 blur-xl opacity-60"
//                 aria-hidden
//               />
//               <div className="relative z-10 flex w-full flex-col items-center justify-center text-center">
//                 <div className="text-lg font-black leading-[0.92] tracking-tight text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.45)] md:text-xl md:leading-[0.9] lg:text-2xl">
//                   {dateLine1}
//                 </div>
//                 {dateLine2 ? (
//                   <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.5)] md:mt-1 md:text-[10px] lg:text-xs">
//                     {dateLine2}
//                   </div>
//                 ) : null}
//                 {dateYear ? (
//                   <div className="mt-0.5 text-[8px] font-semibold tabular-nums tracking-[0.08em] text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.5)] md:text-[9px] lg:text-[10px]">
//                     {dateYear}
//                   </div>
//                 ) : null}
//               </div>
//             </div>
//           </div>

//           <h3 className="mb-2 line-clamp-2 min-h-[2.75rem] text-lg font-bold leading-tight tracking-tight text-white drop-shadow-md transition-transform duration-300 group-hover:translate-y-0.5 md:min-h-[3rem] md:text-xl lg:text-2xl">
//             {vipCardTitleDisplay(event.subTitle || event.title)}
//           </h3>

//           <div className="flex items-center truncate text-sm text-white/85 transition-transform duration-300 group-hover:translate-y-0.5">
//             <MapPin className="mr-1 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
//             <span className="truncate">{locationDisplay}</span>
//           </div>
//         </div>
//       </div>
//     </Link>
//   )
// }

// const AUTO_ADVANCE_MS = 5000

// export default function HeroSlideshowClient({
//   initialEvents,
//   homeCity,
//   homeCountry,
// }: {
//   initialEvents: Event[]
//   homeCity?: string | null
//   homeCountry?: string | null
// }) {
//   const scrollRef = useRef<HTMLDivElement>(null)
//   const events = initialEvents.filter((e) => hasDisplayableEventImage(e))

//   const advance = useCallback((dir: "left" | "right") => {
//     const el = scrollRef.current
//     if (!el) return
//     if (el.scrollWidth <= el.clientWidth + 8) return
//     const step = Math.max(280, el.clientWidth * 0.8)
//     if (dir === "right") {
//       const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
//       if (atEnd) el.scrollTo({ left: 0, behavior: "smooth" })
//       else el.scrollBy({ left: step, behavior: "smooth" })
//     } else {
//       const atStart = el.scrollLeft <= 4
//       if (atStart) el.scrollTo({ left: el.scrollWidth - el.clientWidth, behavior: "smooth" })
//       else el.scrollBy({ left: -step, behavior: "smooth" })
//     }
//   }, [])

//   useEffect(() => {
//     if (events.length <= 1) return
//     const id = window.setInterval(() => {
//       const el = scrollRef.current
//       if (!el || el.scrollWidth <= el.clientWidth + 8) return
//       advance("right")
//     }, AUTO_ADVANCE_MS)
//     return () => window.clearInterval(id)
//   }, [events.length, advance])

//   if (!events.length) {
//     return (
//       <div className="w-full px-3 sm:px-4 lg:px-6">
//         <HomeSectionEmptyState
//           icon="trending"
//           title="No VIP events in this region"
//           description={homeEmptyDescription("VIP events with images", homeCity, homeCountry)}
//           homeCity={homeCity}
//           homeCountry={homeCountry}
//           actions={[
//             { label: "Browse all events", href: "/event" },
//             { label: "Add event", href: "/organizer-signup", variant: "secondary" },
//           ]}
//           className="min-h-[280px] lg:min-h-[320px]"
//         />
//       </div>
//     )
//   }

//   return (
//     <div className="relative w-full min-w-0" aria-label="VIP events">
//       <div
//         ref={scrollRef}
//         className="no-scrollbar flex w-full scroll-smooth snap-x snap-mandatory gap-0 overflow-x-auto overflow-y-hidden pt-0 pb-3"
//         style={{ scrollbarWidth: "none" }}
//       >
//         {events.map((event) => (
//           <div
//             key={event.id}
//             className="w-[min(100%,88vw)] shrink-0 snap-start sm:w-80 lg:w-1/5 lg:min-w-0"
//           >
//             <EventCard event={event} />
//           </div>
//         ))}
//       </div>

//       <button
//         type="button"
//         aria-label="Scroll left"
//         onClick={() => advance("left")}
//         className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/95 p-2 shadow-lg ring-1 ring-black/5 hover:bg-white"
//       >
//         <ChevronLeft className="h-6 w-6 text-gray-700" strokeWidth={2} />
//       </button>
//       <button
//         type="button"
//         aria-label="Scroll right"
//         onClick={() => advance("right")}
//         className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/95 p-2 shadow-lg ring-1 ring-black/5 hover:bg-white"
//       >
//         <ChevronRight className="h-6 w-6 text-gray-700" strokeWidth={2} />
//       </button>
//     </div>
//   )
// }

"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, MapPin, Search, Users, Globe, CalendarDays, Building2 } from "lucide-react"
import { eventPublicPath } from "@/lib/event-path"
import HomeSectionEmptyState, { homeEmptyDescription } from "@/components/home/HomeSectionEmptyState"
import { hasDisplayableEventImage } from "@/lib/event-card-meta"
import type { HeroSlideshowEvent } from "@/lib/hero/types"
import { getHeroFeaturedImageUrl } from "@/lib/hero/hero-featured-image"
import { AppImage } from "@/components/app-image"

export type Event = HeroSlideshowEvent

function heroDateParts(startIso: string, endIso?: string | null) {
  const start = new Date(startIso)
  const end = endIso ? new Date(endIso) : null
  if (Number.isNaN(start.getTime())) return { dayRange: "—", monthYear: "" }
  const s = start.getDate()
  const e = end && !Number.isNaN(end.getTime()) ? end.getDate() : null
  const mon = start.toLocaleString("en-GB", { month: "short" }).toUpperCase()
  return {
    dayRange: e ? `${s} - ${e}` : `${s}`,
    monthYear: `${mon} ${start.getFullYear()}`,
  }
}

function locationLine(event: Event) {
  const v = event.venue
  if (!v) return ""
  return [v.venueName, v.venueCity, v.venueCountry].filter(Boolean).join(", ")
}

const AUTO_ADVANCE_MS = 5000

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
  const [activeIdx, setActiveIdx] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

  const advance = useCallback(
    (dir: "prev" | "next") => {
      setActiveIdx((i) =>
        dir === "next" ? (i + 1) % events.length : (i - 1 + events.length) % events.length,
      )
    },
    [events.length],
  )

  useEffect(() => {
    if (events.length <= 1) return
    const id = window.setInterval(() => advance("next"), AUTO_ADVANCE_MS)
    return () => window.clearInterval(id)
  }, [events.length, advance])

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

  const featured = events[activeIdx]
  const { dayRange, monthYear } = heroDateParts(featured.startDate, featured.endDate)
  const loc = locationLine(featured)
  const featuredImageUrl = getHeroFeaturedImageUrl(featured)

  return (
    <section
      aria-label="Discover Trade Shows"
      className="relative w-full overflow-hidden rounded-[28px]"
    >
      {/* Background Image */}
      <div
        className="
          absolute inset-0 pointer-events-none opacity-[0.30]
          bg-[url('/images/glob.jpeg')]
          bg-cover bg-no-repeat bg-top lg:bg-center
        "
      />

      {/* White overlay */}
      <div className="absolute inset-0 bg-white/85" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1300px] mx-auto px-4 sm:px-6 xl:px-10">

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-10 xl:gap-16 pt-8 sm:pt-10 lg:pt-16 xl:pt-20 pb-6 lg:pb-2">

          {/* ── LEFT PANEL ── */}
          <div className="w-full lg:w-[32%] flex-shrink-0">

            {/* Headline — tighter on mobile */}
            <h1 className="text-[28px] sm:text-[34px] lg:text-[42px] xl:text-[55px] font-light leading-[0.9] tracking-[-0.05em] text-[#0B132B]">
              <span className="block">Discover</span>
              <span className="block mt-3 lg:mt-4 text-[#2563EB]">Trade Shows</span>
              <span className="block mt-3 lg:mt-4">Worldwide</span>
            </h1>

            {/* Description — hidden on very small to save space, shown sm+ */}
            <p className="hidden sm:block mt-5 lg:mt-7 max-w-[340px] text-[15px] sm:text-[16px] lg:text-[18px] leading-[1.7] text-[#64748B]">
              Connect with buyers, exhibitors, and industry leaders at the world's leading trade fairs.
            </p>

            {/* Stats — 3 columns on mobile, row on desktop */}
            <div className="grid grid-cols-3 gap-3 mt-5 lg:mt-8 mb-5 lg:mb-8 lg:flex lg:gap-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-3">
                <CalendarDays className="h-5 w-5 lg:h-6 lg:w-6 text-blue-500 shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-[20px] sm:text-[24px] lg:text-[28px] font-extrabold text-[#0F172A] leading-none">12K+</p>
                  <p className="text-[11px] sm:text-[12px] lg:text-[14px] font-medium text-[#64748B] mt-0.5 sm:mt-1 whitespace-nowrap">
                    Events Listed
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-3">
                <Users className="h-5 w-5 lg:h-6 lg:w-6 text-blue-500 shrink-0" strokeWidth={2} />
                <div>
                  <p className="text-[20px] sm:text-[24px] lg:text-[28px] font-extrabold text-[#0F172A] leading-none">320K+</p>
                  <p className="text-[11px] sm:text-[12px] lg:text-[14px] font-medium text-[#64748B] mt-0.5 sm:mt-1 whitespace-nowrap">
                    Professionals
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-3">
                <Globe className="h-5 w-5 lg:h-6 lg:w-6 text-blue-500 shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-[20px] sm:text-[24px] lg:text-[28px] font-extrabold text-[#0F172A] leading-none">180+</p>
                  <p className="text-[11px] sm:text-[12px] lg:text-[14px] font-medium text-[#64748B] mt-0.5 sm:mt-1 whitespace-nowrap">
                    Countries
                  </p>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3 sm:gap-4 max-w-[360px]">
              <Link
                href="/event"
                className="flex-1 text-center bg-blue-600 hover:bg-blue-700 transition-colors text-white text-[0.85rem] sm:text-[0.9rem] font-bold h-11 sm:h-12 rounded-sm flex items-center justify-center"
              >
                Find Events
              </Link>
              <Link
                href="/organizer-signup"
                className="flex-1 text-center bg-white border-2 border-gray-300 hover:border-blue-400 hover:text-blue-600 transition-colors text-gray-800 text-[0.85rem] sm:text-[0.9rem] font-bold h-11 sm:h-12 rounded-sm flex items-center justify-center"
              >
                List Your Event
              </Link>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="w-full lg:w-[55%] lg:ml-25 flex flex-col gap-4 lg:gap-5">

            {/* Featured card */}
            <div className="relative w-full rounded-xl shadow-[0_15px_80px_-10px_rgba(0,74,150,0.95)] overflow-visible">
              <div className="relative overflow-hidden rounded-xl h-[260px] sm:h-[300px] lg:h-[360px] xl:h-[400px]">
                {featuredImageUrl ? (
                  <AppImage
                    key={featured.id}
                    src={featuredImageUrl}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover"
                    priority
                  />
                ) : null}

                <div className="absolute bottom-0 left-0 right-0 h-[55%] bg-gradient-to-t from-black/75 via-black/40 to-transparent z-[1]" />

                {!featuredImageUrl && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-400" />
                )}

                {/* VIP badge */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                  <span className="bg-blue-600 text-white text-[0.58rem] sm:text-[0.62rem] font-extrabold uppercase tracking-[0.14em] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md shadow">
                    VIP Event
                  </span>
                </div>

                {/* Bottom info bar */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-3 sm:p-5 lg:p-6">
                  <div className="flex items-end gap-3 sm:gap-4 lg:gap-5">

                    {/* Date box — smaller on mobile */}
                    <div className="flex-shrink-0 bg-white rounded-lg sm:rounded-xl px-2 py-2 sm:px-4 sm:py-3 text-center w-[58px] h-[58px] sm:w-[80px] sm:h-[80px] lg:w-[110px] lg:h-[100px] shadow flex flex-col items-center justify-center">
                      <p className="text-[1.1rem] sm:text-[1.3rem] lg:text-[1.4rem] font-black text-gray-900 leading-none tracking-tight">{dayRange}</p>
                      <p className="text-[0.65rem] sm:text-[0.85rem] font-semibold text-gray-500 mt-1 uppercase tracking-wider">{monthYear}</p>
                    </div>

                    {/* Event info */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-[1.1rem] sm:text-[1.35rem] lg:text-[1.7rem] font-extrabold text-white mb-1 sm:mb-2 leading-tight line-clamp-2">
                        {featured.subTitle}
                      </h2>
                      {loc && (
                        <div className="flex items-center gap-1.5 sm:gap-2 text-white text-[0.72rem] sm:text-[0.78rem] mb-1.5 sm:mb-2">
                          <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" strokeWidth={2} />
                          <span className="truncate drop-shadow-sm">{loc}</span>
                        </div>
                      )}
                      {featured.organizerName && (
                        <div className="hidden sm:flex items-center gap-1.5 text-white text-[0.78rem] mb-2">
                          <Building2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                          <span className="truncate drop-shadow-sm">{featured.organizerName}</span>
                        </div>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        <Link
                          href={eventPublicPath(featured)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-[0.72rem] sm:text-[0.8rem] font-bold px-3 sm:px-5 py-1.5 sm:py-2 rounded-md sm:rounded-lg transition-colors shadow"
                        >
                          Register Now
                        </Link>
                        <Link
                          href={`${eventPublicPath(featured)}?tab=exhibit`}
                          className="bg-white hover:bg-gray-50 text-gray-900 text-[0.72rem] sm:text-[0.8rem] font-bold px-3 sm:px-5 py-1.5 sm:py-2 rounded-md sm:rounded-lg border border-white/60 transition-colors shadow"
                        >
                          Exhibit Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dot indicators */}
            <div className="flex w-full justify-center items-center gap-2">
              {events.slice(0, Math.min(events.length, 8)).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Event ${i + 1}`}
                  onClick={() => setActiveIdx(i)}
                  className={`rounded-full transition-all duration-300 ${i === activeIdx ? "w-6 h-2 bg-blue-600" : "w-2 h-2 bg-blue-200 hover:bg-blue-400"
                    }`}
                />
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}