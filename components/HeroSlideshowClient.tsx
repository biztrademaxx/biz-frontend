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
import { AppImage } from "@/components/app-image"

export type Event = HeroSlideshowEvent

function cardImageUrl(event: Event): string {
  if (event.bannerImage?.trim()) return event.bannerImage.trim()
  const first = event.images?.[0]
  if (typeof first === "string" && first.trim()) return first.trim()
  return ""
}

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

function shortDate(startIso: string, endIso?: string | null) {
  const start = new Date(startIso)
  const end = endIso ? new Date(endIso) : null
  if (Number.isNaN(start.getTime())) return ""
  const s = start.getDate()
  const e = end && !Number.isNaN(end.getTime()) ? end.getDate() : null
  const mon = start.toLocaleString("en-GB", { month: "short" })
  return e ? `${s}-${e} ${mon} ${start.getFullYear()}` : `${s} ${mon} ${start.getFullYear()}`
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
  //const imgUrl = cardImageUrl(featured)
  const imgUrl = '/images/heroImage.png'
  const previews = [1, 2, 3].map((o) => events[(activeIdx + o) % events.length])

  return (
    <section
      aria-label="Discover Trade Shows"
      className="relative w-full overflow-hidden rounded-[28px] "
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.30]"
        style={{
          backgroundImage: "url('/images/glob.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Optional white overlay */}
      <div className="absolute inset-0 bg-white/85" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-16 py-8">
          {/* ── LEFT PANEL ── */}
          <div className="w-full lg:w-[35%] flex-shrink-0">
            {/* Headline */}
            <h1 className="max-w-[340px] text-[65px] font-light leading-[0.9] tracking-[-0.05em] text-[#0B132B]">
              Discover
              <br />
              <span className="text-[#2563EB]">Trade Shows</span>
              <br />
              Worldwide
            </h1>

            {/* Description */}
            <p className="mt-20 max-w-[340px] text-[14px] leading-[1.7] text-[#64748B]">
              Connect with buyers, exhibitors & industry
              leaders at the world's best trade fairs.
            </p>

            {/* Stats */}
            <div className="flex gap-8 mt-8 mb-12">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-6 w-6 text-blue-500 shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-[28px] font-extrabold text-[#0F172A] leading-none">12K+</p>
                  <p className="text-[10px] text-[#64748B] mt-1">Events Listed</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Users className="h-6 w-6 text-blue-500 shrink-0" strokeWidth={2} />
                <div>
                  <p className="text-[28px] font-extrabold text-[#0F172A] leading-none">320K+</p>
                  <p className="text-[10px] text-[#64748B] mt-1 whitespace-nowrap">
                    Industry Professionals
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="h-6 w-6 text-blue-500 shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-[28px] font-extrabold text-[#0F172A] leading-none">180+</p>
                  <p className="text-[10px] text-[#64748B] mt-1">Countries</p>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-4 mt-6 max-w-[360px]">
              <Link
                href="/event"
                className="flex-1 text-center bg-blue-600 hover:bg-blue-700 transition-colors text-white text-[0.9rem] font-bold h-12 rounded-sm flex items-center justify-center"
              >
                Find Events
              </Link>
              <Link
                href="/organizer-signup"
                className="flex-1 text-center bg-white border-2 border-gray-300 hover:border-blue-400 hover:text-blue-600 transition-colors text-gray-800 text-[0.9rem] font-bold h-12 rounded-sm flex items-center justify-center"
              >
                List Your Event
              </Link>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="w-full lg:w-[65%] flex flex-col gap-5">
            {/* Featured card — with blue light shadow added */}
            <div className="relative w-full rounded-xl shadow-[0_20px_60px_-15px_rgba(59,130,246,0.4)] overflow-visible">
              <div className="relative overflow-hidden rounded-xl" style={{ height: "360px" }}>
                {imgUrl && (
                  <AppImage
                    src={imgUrl}
                    alt={featured.title}
                    fill
                    className="object-cover"
                    priority
                  />
                )}

                <div
                  className="
    absolute
    bottom-0
    left-0
    right-0
    h-[50%]
    bg-gradient-to-t
    from-black/70
    via-black/35
    to-transparent
    z-[1]
  "
                />
                {!imgUrl && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-400" />
                )}

                {/* FEATURED EVENT badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-blue-600 text-white text-[0.62rem] font-extrabold uppercase tracking-[0.14em] px-3 py-1.5 rounded-md shadow">
                    Featured Event
                  </span>
                </div>

                {/* Bottom info bar */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                  <div className="flex items-end gap-5">
                    {/* White date box */}
                    <div className="flex-shrink-0 bg-white rounded-xl px-4 py-3 text-center w-[110px] h-[100px] shadow">
                      <p className="text-[1.4rem] font-black text-gray-900 leading-none tracking-tight mt-5">{dayRange}</p>
                      <p className="text-[0.68rem] font-semibold text-gray-500 mt-1.5 uppercase tracking-wider">{monthYear}</p>
                    </div>

                    {/* Event info */}
                    <div className="flex-1 min-w-0 max-w-[400px]">
                      <h2 className="text-[1.7rem] font-extrabold text-white mb-2 leading-tight line-clamp-2">
                        {featured.title}
                      </h2>
                      {loc && (
                        <div className="flex items-center gap-1.5 text-white text-[0.8rem] mb-1">
                          <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                          <span className="truncate drop-shadow-sm">{loc}</span>
                        </div>
                      )}
                      {featured.organizerName && (
                        <div className="flex items-center gap-1.5 text-white text-[0.8rem] mb-3">
                          <Building2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                          <span className="truncate drop-shadow-sm">{featured.organizerName}</span>
                        </div>
                      )}
                      <div className="flex gap-2.5">
                        <Link
                          href={eventPublicPath(featured)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-[0.8rem] font-bold px-5 py-2 rounded-lg transition-colors shadow"
                        >
                          Register Now
                        </Link>
                        <Link
                          href={`${eventPublicPath(featured)}?tab=exhibit`}
                          className="bg-white hover:bg-gray-50 text-gray-900 text-[0.8rem] font-bold px-5 py-2 rounded-lg border border-white/60 transition-colors shadow"
                        >
                          Exhibit Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prev / Next arrows */}
              <button
                type="button"
                aria-label="Previous event"
                onClick={() => advance("prev")}
                className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                aria-label="Next event"
                onClick={() => advance("next")}
                className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" strokeWidth={2.5} />
              </button>
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

            {/* Bottom 3 preview cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
              {previews.map((event, i) => {
                const pImg = cardImageUrl(event)
                const pDate = shortDate(event.startDate, event.endDate)
                return (
                  <Link
                    key={`${event.id}-${i}`}
                    href={eventPublicPath(event)}
                    className="flex items-center gap-3 group"
                  >
                    <div className="relative w-[68px] h-[68px] rounded-sm overflow-hidden flex-shrink-0 bg-gray-100 shadow-sm">
                      {pImg ? (
                        <AppImage
                          src={pImg}
                          alt={event.title}
                          fill
                          sizes="56px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center">
                          <CalendarDays className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.82rem] font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {event.title}
                      </p>
                      <p className="text-[0.7rem] text-gray-500 mt-0.5">{pDate}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}