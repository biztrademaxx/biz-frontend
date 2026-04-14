"use client"

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
  "flex h-[120px] w-[200px] shrink-0 cursor-pointer items-center justify-center rounded-sm border border-gray-200 bg-white p-4 transition duration-200 hover:border-blue-300 hover:shadow-lg"

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
        <img src={src} alt="" className="max-h-full max-w-full object-contain" />
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
      <img src={src} alt={displayName} className="max-h-full max-w-full object-contain" />
    </div>
  )
}

export const OrganizerLogoTile = memo(OrganizerLogoTileComponent)
