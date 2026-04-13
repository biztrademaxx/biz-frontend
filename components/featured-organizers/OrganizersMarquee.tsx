"use client"

import type { CSSProperties } from "react"
import { memo, useMemo } from "react"
import type { OrganizerListEntry } from "@/lib/organizers/types"
import { OrganizerLogoTile } from "./OrganizerLogoTile"
import { OrganizersViewAllTile } from "./OrganizersViewAllTile"
import { organizersMarqueeDurationSeconds } from "./utils/organizers.helpers"

/** Below this count, a duplicated strip + -50% scroll looks broken or redundant; use one row. */
const MARQUEE_MIN_ORGANIZERS = 3

export interface OrganizersMarqueeProps {
  organizers: OrganizerListEntry[]
  onOrganizerActivate: (organizerId: string) => void
  viewAllHref?: string
}

function OrganizersMarqueeComponent({
  organizers,
  onOrganizerActivate,
  viewAllHref = "/organizers",
}: OrganizersMarqueeProps) {
  const durationSeconds = useMemo(
    () => organizersMarqueeDurationSeconds(organizers.length),
    [organizers.length],
  )

  const trackStyle = useMemo(
    () =>
      ({
        "--organizers-marquee-duration": `${durationSeconds}s`,
      }) as CSSProperties,
    [durationSeconds],
  )

  const stripClass =
    "flex w-max shrink-0 flex-row flex-nowrap items-center gap-6 sm:gap-8"

  if (organizers.length < MARQUEE_MIN_ORGANIZERS) {
    return (
      <div className="overflow-x-auto py-6">
        <div className={`mx-auto ${stripClass} justify-center sm:mx-0 sm:justify-start`}>
          {organizers.map((organizer) => (
            <OrganizerLogoTile
              key={organizerRouteKey(organizer)}
              organizer={organizer}
              mode="interactive"
              onOpenProfile={onOrganizerActivate}
            />
          ))}
          <OrganizersViewAllTile href={viewAllHref} interactive />
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-hidden py-6" style={trackStyle}>
      <div className="organizers-marquee-track flex w-max flex-row flex-nowrap items-center">
        <div className={stripClass}>
          {organizers.map((organizer) => (
            <OrganizerLogoTile
              key={organizerRouteKey(organizer)}
              organizer={organizer}
              mode="interactive"
              onOpenProfile={onOrganizerActivate}
            />
          ))}
          <OrganizersViewAllTile href={viewAllHref} interactive />
        </div>
        <div className={stripClass} aria-hidden>
          {organizers.map((organizer) => (
            <OrganizerLogoTile
              key={`marquee-dup-${organizerRouteKey(organizer)}`}
              organizer={organizer}
              mode="decorative"
              onOpenProfile={onOrganizerActivate}
            />
          ))}
          <OrganizersViewAllTile href={viewAllHref} interactive={false} />
        </div>
      </div>
    </div>
  )
}

function organizerRouteKey(organizer: OrganizerListEntry): string {
  return String(organizer.id)
}

export const OrganizersMarquee = memo(OrganizersMarqueeComponent)
