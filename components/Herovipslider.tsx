"use client"

import { AppImage } from "@/components/app-image"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight  } from "lucide-react"
import { eventPublicPath } from "@/lib/event-path"
import { hasDisplayableEventImage } from "@/lib/event-card-meta"
import type { HeroSlideshowEvent } from "@/lib/hero/types"
import {
   
    CalendarDays,
    MapPin,
    Users,
} from "lucide-react"

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
    const t = event.subTitle || event.title || ""

    return t
        .replace(/\s+(?:19|20)\d{2}$/, "")
        .trim()
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

    return (
        <div className="absolute inset-0">
            <div className="grid h-full grid-cols-[58%_42%] overflow-hidden rounded-[28px] bg-white">

                {/* LEFT IMAGE */}
                <div className="relative h-full">
                    {imageUrl ? (
                        <AppImage
                            src={imageUrl}
                            alt={event.title}
                            fill
                            priority
                            sizes="40vw"
                            className="object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-slate-300" />
                    )}

                    {/* VIP Badge */}
                    <div className="absolute left-5 top-5 z-10">
                        <span className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white">
                            VIP / Featured
                        </span>
                    </div>

                    {/* Mega Event */}
                    <div className="absolute bottom-5 left-5 z-10">
                        <span className="rounded-xl border border-white/20 bg-black/40 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
                            ⭐ Mega Event
                        </span>
                    </div>
                </div>

                {/* RIGHT CONTENT */}
                <div className="relative flex flex-col bg-white p-8 lg:p-10">

                    {/* Arrows */}
                    <div className="absolute right-8 top-6 flex gap-3">
                        <button
                            onClick={onPrev}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <button
                            onClick={onNext}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Title */}
                    <h2 className="mt-10 text-[30px] font-bold leading-[1.15] text-slate-900">
                        {vipTitle(event)}
                    </h2>

                    {/* Description */}
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                        {event.description
                            ? `${event.description.slice(0, 120)}...`
                            : "Discover one of the leading international trade exhibitions."}
                    </p>

                    <div className="mt-5 space-y-4">

                        <div className="flex items-start gap-3">
                            <span className="text-blue-600">📅</span>

                            <div>
                                <p className="text-sm font-medium text-slate-900">
                                    {dateLine?.split("·")[0]}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <span className="text-blue-600">📍</span>

                            <div>
                                <p className="text-sm font-medium text-slate-900">
                                    {event.venue?.venueName}
                                </p>

                                <p className="text-xs text-slate-500">
                                    {event.venue?.venueCity},{" "}
                                    {event.venue?.venueCountry}
                                </p>
                            </div>
                        </div>

                    </div>
                    {/* Buttons */}
                    <div className="mt-auto pt-8">
                        <div className="flex flex-col gap-4">

                            <Link
                                href={eventPublicPath(event)}
                                className="flex h-12 items-center justify-center rounded-xl bg-blue-600 font-semibold text-white transition hover:bg-blue-700"
                            >
                                Register Now
                            </Link>

                            <Link
                                href={eventPublicPath(event)}
                                className="flex h-12 items-center justify-center rounded-xl border border-blue-200 bg-white font-semibold text-blue-600 transition hover:bg-blue-50"
                            >
                                View Details
                            </Link>

                        </div>
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
        <div className="relative h-[540px] w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-lg">
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