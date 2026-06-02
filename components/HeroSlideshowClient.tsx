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

/** Full-section world map dots — covers entire hero including bottom preview area */
function WorldMapDots() {
  // Dense dot clusters covering the full 1200×500 viewBox
  const dots: [number, number][] = [
    // North America
    [30, 40], [48, 35], [66, 32], [84, 30], [102, 28], [120, 30], [138, 33], [156, 37], [174, 42],
    [30, 58], [48, 53], [66, 50], [84, 48], [102, 46], [120, 48], [138, 51], [156, 55], [174, 60], [192, 65],
    [48, 76], [66, 73], [84, 71], [102, 69], [120, 71], [138, 74], [156, 78], [174, 83], [192, 88], [210, 93],
    [66, 94], [84, 91], [102, 89], [120, 91], [138, 94], [156, 98], [174, 103], [192, 108],
    [84, 112], [102, 110], [120, 112], [138, 115], [156, 119], [174, 124],
    [102, 130], [120, 132], [138, 135], [156, 139],
    [120, 148], [138, 151], [156, 155],
    [138, 166], [156, 170],
    // South America
    [138, 198], [156, 194], [174, 192], [192, 194], [210, 198],
    [138, 216], [156, 212], [174, 210], [192, 212], [210, 216], [228, 212],
    [156, 230], [174, 228], [192, 230], [210, 234], [228, 230],
    [174, 248], [192, 246], [210, 250], [228, 254],
    [192, 266], [210, 268], [228, 272],
    [210, 284], [228, 288],
    [210, 302],
    // Europe
    [318, 28], [336, 25], [354, 23], [372, 25], [390, 28], [408, 30],
    [318, 46], [336, 43], [354, 41], [372, 43], [390, 46], [408, 48], [426, 44],
    [318, 64], [336, 61], [354, 59], [372, 61], [390, 64], [408, 66], [426, 62], [444, 58],
    [336, 79], [354, 77], [372, 79], [390, 82], [408, 84], [426, 80], [444, 76],
    [354, 94], [372, 96], [390, 99], [408, 96], [426, 92],
    [372, 111], [390, 114], [408, 111],
    // Africa
    [354, 129], [372, 127], [390, 129], [408, 132], [426, 128], [444, 124],
    [336, 147], [354, 145], [372, 143], [390, 145], [408, 148], [426, 144], [444, 140], [462, 136],
    [336, 162], [354, 160], [372, 158], [390, 160], [408, 163], [426, 159], [444, 155],
    [354, 177], [372, 175], [390, 177], [408, 180], [426, 176], [444, 172],
    [372, 192], [390, 194], [408, 197], [426, 193], [444, 189],
    [372, 207], [390, 209], [408, 212], [426, 208],
    [390, 224], [408, 227], [426, 223],
    [390, 239], [408, 242],
    [408, 257],
    // Asia
    [462, 28], [480, 25], [498, 23], [516, 25], [534, 28], [552, 25], [570, 28], [588, 31], [606, 34], [624, 37], [642, 33], [660, 36], [678, 38],
    [462, 46], [480, 43], [498, 41], [516, 43], [534, 46], [552, 43], [570, 46], [588, 49], [606, 52], [624, 55], [642, 51], [660, 54], [678, 56], [696, 52], [714, 48],
    [462, 64], [480, 61], [498, 59], [516, 61], [534, 64], [552, 61], [570, 64], [588, 67], [606, 70], [624, 73], [642, 69], [660, 72], [678, 74], [696, 70], [714, 66], [732, 62],
    [480, 79], [498, 77], [516, 79], [534, 82], [552, 79], [570, 82], [588, 85], [606, 88], [624, 91], [642, 87], [660, 90], [678, 92], [696, 88], [714, 84], [732, 80],
    [498, 94], [516, 96], [534, 99], [552, 96], [570, 99], [588, 102], [606, 105], [624, 108], [642, 104], [660, 107], [678, 109], [696, 105], [714, 101],
    [516, 111], [534, 114], [552, 111], [570, 114], [588, 117], [606, 120], [624, 123], [642, 119], [660, 122], [678, 124], [696, 120],
    [534, 126], [552, 129], [570, 132], [588, 135], [606, 138], [624, 141], [642, 137], [660, 140], [678, 142], [696, 138], [714, 134], [732, 130],
    [552, 144], [570, 147], [588, 150], [606, 153], [624, 156], [642, 152], [660, 155], [678, 157], [696, 153], [714, 149],
    [570, 162], [588, 165], [606, 168], [624, 171], [642, 167], [660, 170], [678, 172],
    // Australia
    [606, 252], [624, 248], [642, 246], [660, 248], [678, 252], [696, 248],
    [606, 270], [624, 266], [642, 264], [660, 266], [678, 270], [696, 266], [714, 262],
    [606, 288], [624, 284], [642, 282], [660, 284], [678, 288], [696, 284], [714, 280],
    [624, 304], [642, 300], [660, 302], [678, 306], [696, 302],
    [642, 320], [660, 318], [678, 322],
    [660, 336], [678, 338],
    // Extra dots in bottom region to cover preview cards area
    [30, 340], [66, 336], [102, 340], [138, 344], [174, 340], [210, 344], [246, 340], [282, 344],
    [30, 358], [66, 354], [102, 358], [138, 362], [174, 358], [210, 362], [246, 358], [282, 362], [318, 358], [354, 354], [390, 358], [426, 362], [462, 358], [498, 354], [534, 358], [570, 362], [606, 358], [642, 354], [678, 358], [714, 362], [750, 358], [786, 354], [822, 358],
    [30, 376], [66, 372], [102, 376], [138, 380], [174, 376], [210, 380], [246, 376], [282, 380], [318, 376], [354, 372], [390, 376], [426, 380], [462, 376], [498, 372], [534, 376], [570, 380], [606, 376], [642, 372], [678, 376], [714, 380], [750, 376], [786, 372], [822, 376], [858, 372], [894, 376],
    [30, 394], [66, 390], [102, 394], [138, 398], [174, 394], [210, 398], [246, 394], [282, 398], [318, 394], [354, 390], [390, 394], [426, 398], [462, 394], [498, 390], [534, 394], [570, 398], [606, 394], [642, 390], [678, 394], [714, 398], [750, 394], [786, 390], [822, 394], [858, 390], [894, 394],
    [30, 412], [66, 408], [102, 412], [138, 416], [174, 412], [210, 416], [246, 412], [282, 416], [318, 412], [354, 408], [390, 412], [426, 416], [462, 412], [498, 408], [534, 412], [570, 416], [606, 412], [642, 408], [678, 412], [714, 416], [750, 412], [786, 408], [822, 412], [858, 408], [894, 412],
    [30, 430], [66, 426], [102, 430], [138, 434], [174, 430], [210, 434], [246, 430], [282, 434], [318, 430], [354, 426], [390, 430], [426, 434], [462, 430], [498, 426], [534, 430], [570, 434], [606, 430], [642, 426], [678, 430], [714, 434], [750, 430], [786, 426], [822, 430], [858, 426], [894, 430], [930, 426], [960, 430],
    [30, 448], [66, 444], [102, 448], [138, 452], [174, 448], [210, 452], [246, 448], [282, 452], [318, 448], [354, 444], [390, 448], [426, 452], [462, 448], [498, 444], [534, 448], [570, 452], [606, 448], [642, 444], [678, 448], [714, 452], [750, 448], [786, 444], [822, 448], [858, 444], [894, 448], [930, 444], [960, 448], [990, 444], [1020, 448],
  ]
  return (
    <svg
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      viewBox="0 0 1100 480"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="map-center-fade" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#c5d9f5" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#c5d9f5" stopOpacity="0.7" />
        </radialGradient>
      </defs>
      <g fill="#E6EDF7" opacity="0.45">
        {dots.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="2.4" />
        ))}
      </g>
    </svg>
  )
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
  const imgUrl = cardImageUrl(featured)
  const previews = [1, 2, 3].map((o) => events[(activeIdx + o) % events.length])

  return (
    <section
      aria-label="Discover Trade Shows"
      className="relative w-full overflow-hidden rounded-[28px] bg-white"
    >
      {/* World map dots — single layer covering the ENTIRE section */}
      <WorldMapDots />

      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
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
            <p className="mt-20 max-w-[340px] text-[14px] leading-[1.7] text-[#64748B] ">
              Connect with buyers, exhibitors & industry
              leaders at the world's best trade fairs.
            </p>

            {/* Stats */}
            <div className="flex gap-8 mt-8 mb-10">
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
                className="flex-1 text-center bg-blue-600 hover:bg-blue-700 transition-colors text-white text-[0.9rem] font-bold h-12 rounded-xl flex items-center justify-center"
              >
                Find Events
              </Link>
              <Link
                href="/organizer-signup"
                className="flex-1 text-center bg-white border-2 border-gray-300 hover:border-blue-400 hover:text-blue-600 transition-colors text-gray-800 text-[0.9rem] font-bold h-12 rounded-xl flex items-center justify-center"
              >
                List Your Event
              </Link>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="w-full lg:w-[65%] flex flex-col gap-5">
            {/* Featured card — with full visibility arrows outside */}
            <div className="relative w-full rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-visible">
              {/* Card inner container with overflow hidden for border radius */}
              <div className="relative overflow-hidden rounded-sm" style={{ height: "360px" }}>
                {imgUrl && (
                  <AppImage
                    src={imgUrl}
                    alt={featured.title}
                    fill
                    className="object-cover"
                    priority
                  />
                )}

                <div className="absolute inset-0 bg-black/45 z-[1]" />

                {!imgUrl && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-400" />
                )}

                {/* FEATURED EVENT badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-blue-600 text-white text-[0.62rem] font-extrabold uppercase tracking-[0.14em] px-3 py-1.5 rounded-md shadow">
                    Featured Event
                  </span>
                </div>

                {/* Bottom info bar — white frosted panel, no dark overlay */}
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

              {/* Prev / Next arrows positioned absolutely relative to the card but outside */}
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

            {/* Bottom 3 preview cards — thumbnails fully visible, no darkening */}
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
                    {/* Square thumbnail — fully visible */}
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
                    {/* Text */}
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