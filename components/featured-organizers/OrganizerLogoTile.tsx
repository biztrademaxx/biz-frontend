// OrganizerLogoTile.tsx
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

// Updated: Added border and improved shadow with consistent sizing
const TILE_CLASS =
  "group flex h-[140px] w-[180px] shrink-0 cursor-pointer flex-col items-center rounded-lg bg-white border border-gray-200 px-3 py-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:border-[#002C71]/30"

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
        {/* Fixed height container for logo */}
        <div className="flex h-[70px] w-full items-center justify-center">
          {src ? (
            <AppImage
              src={src}
              alt=""
              width={160}
              height={64}
              className="max-h-[60px] max-w-full object-contain"
            />
          ) : (
            <span className="text-2xl font-bold text-gray-400">{companyName.charAt(0)}</span>
          )}
        </div>
        {/* Fixed height container for text with truncation */}
        <div className="mt-1 h-[30px] w-full text-center overflow-hidden">
          <p className="text-xs font-medium leading-snug text-gray-600 truncate">
            {companyName}
          </p>
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
      {/* Fixed height container for logo */}
      <div className="flex h-[70px] w-full items-center justify-center">
        {src ? (
          <AppImage
            src={src}
            alt={displayName}
            width={160}
            height={64}
            className="max-h-[60px] max-w-full object-contain"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <span className="text-xl font-bold text-blue-600">{companyName.charAt(0)}</span>
          </div>
        )}
      </div>

      {/* Fixed height container for text with truncation */}
      <div className="mt-1 h-[40px] w-full text-center overflow-hidden">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {companyName}
        </p>
        {hasSubtitle && (
          <p className="text-xs text-gray-500 truncate">
            {organizer.location || organizer.city || organizer.headquarters}
          </p>
        )}
      </div>
    </div>
  )
}

export const OrganizerLogoTile = memo(OrganizerLogoTileComponent)