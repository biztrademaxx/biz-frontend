// OrganizerLogoTile.tsx - Improved version with better text handling
"use client"

import { AppImage } from "@/components/app-image"
import type { KeyboardEvent } from "react"
import { memo, useCallback } from "react"
import type { OrganizerListEntry } from "@/lib/organizers/types"
import type { OrganizerLogoTileMode } from "./types"
import {
  organizerDisplayName,
  organizerLogoSrc,
  organizerRouteId,
} from "./utils/organizers.helpers"

// Increased height for better text accommodation
const TILE_CLASS =
  "group flex h-[148px] w-[200px] shrink-0 cursor-pointer flex-col items-center justify-between rounded-lg border border-[#2563EB] bg-white px-3 pt-3 pb-4 shadow-[0_8px_16px_-10px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_22px_-10px_rgba(0,0,0,0.22)]"

export interface OrganizerLogoTileProps {
  organizer: OrganizerListEntry
  mode: OrganizerLogoTileMode
  onOpenProfile?: (organizerId: string) => void
}

function OrganizerLogoTileComponent({
  organizer,
  mode,
  onOpenProfile,
}: OrganizerLogoTileProps) {
  const displayName = organizerDisplayName(organizer)
  const src = organizerLogoSrc(organizer)
  const routeId = organizerRouteId(organizer)

  // Get company/name for text display
  const companyName = organizer.company || organizer.name || "Organization"

  // Check if there's a subtitle/event info (like "SERIES CONGRESS" or "kym jones exhibitions")
  const hasSubtitle = organizer.location || organizer.city || organizer.state

  const activate = useCallback(() => {
    onOpenProfile?.(routeId)
  }, [onOpenProfile, routeId])

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        activate()
      }
    },
    [activate],
  )

  // If decorative mode (duplicate strip)
  if (mode === "decorative") {
    return (
      <div className={TILE_CLASS} onClick={activate}>
        {src ? (
          <div className="flex h-16 w-full items-center justify-center">
            <AppImage
              src={src}
              alt=""
              width={160}
              height={64}
              className="max-h-16 max-w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex h-16 w-full items-center justify-center">
            <span className="text-2xl font-bold text-gray-400">{companyName.charAt(0)}</span>
          </div>
        )}
        <div className="mt-1 w-full min-h-0 flex-1 text-center">
          <p className="line-clamp-2 text-xs font-medium leading-snug text-gray-600">{companyName}</p>
        </div>
      </div>
    )
  }

  // Interactive mode with full details
  return (
    <div
      role="button"
      tabIndex={0}
      className={TILE_CLASS}
      onClick={activate}
      onKeyDown={onKeyDown}
    >
      {/* Logo/Image Section */}
      <div className="flex h-16 w-full items-center justify-center">
        {src ? (
          <AppImage
            src={src}
            alt={displayName}
            width={160}
            height={64}
            className="max-h-16 max-w-full object-contain"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <span className="text-xl font-bold text-blue-600">{companyName.charAt(0)}</span>
          </div>
        )}
      </div>

      {/* Text Section */}
      <div className="mt-2 w-full text-center">
        <p className="line-clamp-2 text-sm font-semibold text-gray-900">
          {companyName}
        </p>
        {hasSubtitle && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-500">
            {organizer.location || organizer.city || organizer.headquarters}
          </p>
        )}
      </div>
    </div>
  )
}

export const OrganizerLogoTile = memo(OrganizerLogoTileComponent)