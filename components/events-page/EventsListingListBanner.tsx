"use client"

import type { CSSProperties } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Users, Globe } from "lucide-react"

export type EventsListingListBannerProps = {
  surfaceStyle: CSSProperties
  title: string
  followerLabel: string
  filteredCount: number
  paginatedCount: number
  onShare: () => void | Promise<void>
}

export function EventsListingListBanner({
  surfaceStyle,
  title,
  followerLabel,
  filteredCount,
  paginatedCount,
  onShare,
}: EventsListingListBannerProps) {
  return (
    <div
      className="relative mb-6 min-h-[128px] overflow-hidden rounded-sm border border-white/15 shadow-lg sm:min-h-[140px]"
      style={surfaceStyle}
    >
      <div className="relative z-10 w-full p-3 pb-0 sm:p-4 sm:pb-0">
        <h1
          className="mb-3 font-sans text-xl font-bold tracking-tight text-white sm:text-2xl"
          style={{
            textShadow: "0 1px 2px rgba(0,0,0,0.5), 0 2px 16px rgba(0,0,0,0.35), 0 0 1px rgba(0,0,0,0.8)",
          }}
        >
          {title}
        </h1>
        <div
          className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-white"
          style={{
            textShadow: "0 1px 2px rgba(0,0,0,0.45), 0 0 1px rgba(0,0,0,0.6)",
          }}
        >
          <span className="flex items-center gap-1.5">
            <Users className="h-[18px] w-[18px] shrink-0 opacity-95" aria-hidden />
            {followerLabel}
          </span>
          <span className="hidden h-4 w-px shrink-0 bg-white/35 sm:block" aria-hidden />
          <span className="flex items-center gap-1.5">
            <Globe className="h-[18px] w-[18px] shrink-0 opacity-95" aria-hidden />
            {filteredCount.toLocaleString()} Events
          </span>
          <span className="hidden h-4 w-px shrink-0 bg-white/35 sm:block" aria-hidden />
          <span className="flex items-center gap-1.5 text-white/95">
            Showing {paginatedCount} of {filteredCount}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="ml-auto h-8 shrink-0 border-0 bg-white px-3 text-xs font-semibold text-gray-900 shadow-sm hover:bg-white/90"
            onClick={() => void onShare()}
          >
            <Share2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Share
          </Button>
        </div>
      </div>
    </div>
  )
}
