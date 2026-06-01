"use client"

import { AppImage } from "@/components/app-image"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { eventPublicPath } from "@/lib/event-path"
import { hasDisplayableEventImage } from "@/lib/event-card-meta"
import type { HeroSlideshowEvent } from "@/lib/hero/types"

export type Event = HeroSlideshowEvent

const AUTO_ADVANCE_MS = 4500

function cardImageUrl(event: Event): string {
    if (event.bannerImage?.trim()) return event.bannerImage.trim()
    const first = event.images?.[0]
    if (typeof first === "string" && first.trim()) return first.trim()
    return ""
}

function formatDateVenueLine(event: Event): string {
    const start = new Date(event.startDate)
    const end = event.endDate ? new Date(event.endDate) : null
    if (Number.isNaN(start.getTime())) return ""

    const d = (x: Date) => x.getDate()
    const mon = (x: Date) => x.toLocaleString("en-GB", { month: "short" })
    const yr = (x: Date) => x.getFullYear()

    const datePart =
        end && !Number.isNaN(end.getTime())
            ? `${d(start)}–${d(end)} ${mon(start)} ${yr(start)}`
            : `${d(start)} ${mon(start)} ${yr(start)}`

    const v = event.venue
    const venueParts: string[] = []
    if (v?.venueName?.trim()) venueParts.push(v.venueName.trim())
    if (v?.venueCity?.trim()) venueParts.push(v.venueCity.trim())
    if (v?.venueCountry?.trim()) venueParts.push(v.venueCountry.trim())
    const venuePart = venueParts.join(", ")

    return [datePart, venuePart].filter(Boolean).join(" · ")
}

function orgAbbr(title: string): string {
    return title
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 3)
        .toUpperCase()
}

function vipTitle(event: Event): string {
    const t =  event.title
    return t.replace(/\s+(?:19|20)\d{2}$/, "").trim() || t
}

function isComingSoon(event: Event): boolean {
    return new Date(event.startDate) > new Date()
}

function EventSlide({
    event,
    onPrev,
    onNext,
}: {
    event: Event
    onPrev: () => void
    onNext: () => void
}) {
    const imageUrl = cardImageUrl(event)
    const dateLine = formatDateVenueLine(event)
    const orgName = event.title.split(/[—–-]/)[0].trim()

    return (
        <div className="absolute inset-0">
            {/* Background image */}
            {imageUrl ? (
                <AppImage
                    src={imageUrl}
                    alt={event.title}
                    fill
                    sizes="48vw"
                    className="object-cover"
                    priority
                />
            ) : (
                <div className="absolute inset-0 bg-slate-700" />
            )}

            {/* Bottom gradient for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/05" />

            {/* "Show Coming Soon" — top right */}
            {isComingSoon(event) && (
                <div className="absolute right-3 top-3 z-10 rounded bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white/90">
                    Show Coming Soon
                </div>
            )}

            {/* Content pinned to bottom */}
            {/* Strong overlay */}
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/30" />

            {/* Content */}
            <div className="absolute inset-0 z-10 flex items-center">
                <div className="absolute inset-0 bg-black/45" />

                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-8 text-center">

                    {/* Top Row */}
                    <div className="mb-8 flex items-center gap-5">
                        {/* BizTrade */}
                        <div className="text-left">
                            <p className="text-sm font-medium text-white/80">
                                BizTrade
                            </p>

                            <h4 className="text-3xl font-bold leading-none text-white">
                                Fairs
                            </h4>
                        </div>

                        {/* Vertical Divider */}
                        <div className="h-14 w-px bg-white/40" />

                        {/* Date + Venue */}
                        <div className="text-left">
                            <p className="text-xl font-bold text-white">
                                {dateLine?.split("·")[0]}
                            </p>

                            <p className="text-lg text-white/85">
                                {event.venue?.venueName}
                            </p>
                        </div>
                    </div>

                    {/* Main Heading */}
                    <h2 className="max-w-[500px] text-center text-[22px] font-extrabold uppercase leading-[1.1] text-white">
                        {vipTitle(event)}
                    </h2>

                    {/* Description */}
                    <p className="mt-6 max-w-[750px] text-center text-[20px] leading-relaxed text-white/90">
                        {event.description}
                    </p>

                    {/* Buttons */}
                    <div className="mt-10 flex items-center justify-center gap-4">
                        <Link
                            href={eventPublicPath(event)}
                            className="rounded-md bg-red-600 px-12 py-4 text-lg font-bold text-white hover:bg-red-700"
                        >
                            Register Now
                        </Link>

                        <Link
                            href={eventPublicPath(event)}
                            className="rounded-md bg-white px-12 py-4 text-lg font-semibold text-gray-900 hover:bg-gray-100"
                        >
                            Show Info
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function HeroVipSlider({ initialEvents }: { initialEvents: Event[] }) {
    const events = initialEvents.filter((e) => hasDisplayableEventImage(e))
    const [current, setCurrent] = useState(0)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const total = events.length

    const go = useCallback(
        (idx: number) => {
            if (!total) return
            setCurrent(((idx % total) + total) % total)
        },
        [total],
    )

    const resetTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = setInterval(
            () => setCurrent((prev) => ((prev + 1) % total)),
            AUTO_ADVANCE_MS,
        )
    }, [total])

    const handlePrev = useCallback(() => { go(current - 1); resetTimer() }, [current, go, resetTimer])
    const handleNext = useCallback(() => { go(current + 1); resetTimer() }, [current, go, resetTimer])

    useEffect(() => {
        if (total <= 1) return
        timerRef.current = setInterval(
            () => setCurrent((prev) => ((prev + 1) % total)),
            AUTO_ADVANCE_MS,
        )
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [total])

    if (!events.length) return null

    return (
        <div className="relative h-[370px] w-[100%] overflow-hidden mt-12 rounded-lg">
             {events.map((event, i) => (
                <div
                    key={event.id}
                    className={`absolute inset-0 transition-opacity duration-500 ${i === current ? "opacity-100" : "pointer-events-none opacity-0"
                        }`}
                >
                    <EventSlide event={event} onPrev={handlePrev} onNext={handleNext} />
                </div>
            ))}
        </div> 
    )
}