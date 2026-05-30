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

const TILE_CLASS =
  "group flex h-[120px] w-[200px] shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#2563EB] bg-white p-2 shadow-[0_8px_16px_-10px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_22px_-10px_rgba(0,0,0,0.22)]"
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

  if (mode === "decorative") {
    return (
      <div className={TILE_CLASS} onClick={activate}>
        <AppImage src={src} alt="" width={176} height={96} className="max-h-full max-w-full object-contain" />
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={TILE_CLASS}
      onClick={activate}
      onKeyDown={onKeyDown}
    >
      <AppImage src={src} alt={displayName} width={176} height={96} className="max-h-full max-w-full object-contain" />
    </div>
  )
}

export const OrganizerLogoTile = memo(OrganizerLogoTileComponent)
