"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import type { FeaturedSpeakerTile } from "@/lib/speakers/types"

export interface FeaturedSpeakersStripClientProps {
  speakers: FeaturedSpeakerTile[]
}

export default function FeaturedSpeakersStripClient({ speakers }: FeaturedSpeakersStripClientProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  const scrollByAmount = (amount: number) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" })
  }

  if (speakers.length === 0) return null

  return (
    <div className="home-tt-section mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
      <div className="group relative">
        <div className="border-b border-gray-200 py-6">
          <h2 className="home-tt-h2 mb-3">
            Featured Speakers
            <br />
            <span className="home-tt-sub">Learn from industry experts and keynote speakers.</span>
          </h2>
        </div>

        <button
          type="button"
          onClick={() => scrollByAmount(-280)}
          aria-label="Scroll speakers left"
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 opacity-0 shadow-md transition-all hover:bg-white group-hover:opacity-100"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" strokeWidth={2} />
        </button>

        <button
          type="button"
          onClick={() => scrollByAmount(280)}
          aria-label="Scroll speakers right"
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 opacity-0 shadow-md transition-all hover:bg-white group-hover:opacity-100"
        >
          <ChevronRight className="h-5 w-5 text-gray-700" strokeWidth={2} />
        </button>

        <div
          ref={scrollRef}
          className="no-scrollbar flex min-w-0 items-center gap-6 overflow-x-auto scroll-smooth py-6 sm:gap-8"
        >
          {speakers.map((spk) => (
            <div
              key={spk.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/speaker/${spk.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  router.push(`/speaker/${spk.id}`)
                }
              }}
              className="flex min-w-[100px] max-w-[140px] cursor-pointer flex-col items-center"
            >
              <div className="flex h-[90px] w-[90px] items-center justify-center overflow-hidden rounded-full bg-white shadow-sm">
                <img
                  src={spk.imageUrl}
                  alt={spk.displayName}
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <p className="mt-3 line-clamp-2 text-center text-sm text-gray-700">{spk.displayName}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
