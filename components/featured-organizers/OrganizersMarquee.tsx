// OrganizersMarquee.tsx - Updated to conditionally hide heading
"use client"

import type { CSSProperties } from "react"
import { memo, useMemo } from "react"
import type { OrganizerListEntry } from "@/lib/organizers/types"
import { OrganizerLogoTile } from "./OrganizerLogoTile"
import { organizersMarqueeDurationSeconds } from "./utils/organizers.helpers"

const MARQUEE_MIN_ORGANIZERS = 3

export interface OrganizersMarqueeProps {
  organizers: OrganizerListEntry[]
  onOrganizerActivate: (organizerId: string) => void
  hideHeading?: boolean  // New prop to control heading visibility
}

function OrganizersMarqueeComponent({
  organizers,
  onOrganizerActivate,
  hideHeading = false,  // Default to showing heading for backward compatibility
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

  const stripClass = "flex w-max shrink-0 flex-row flex-nowrap items-stretch gap-6"

  // If not enough organizers, show static grid
  if (organizers.length < MARQUEE_MIN_ORGANIZERS) {
    return (
      <div className="py-4">
        {!hideHeading && (
          <div className="mb-6 border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-900">Featured Organizers</h2>
            <p className="mt-1 text-sm text-gray-600">Organizers in India</p>
          </div>
        )}
        <div className="overflow-x-auto">
          <div className={`mx-auto ${stripClass} justify-center`}>
            {organizers.map((organizer) => (
              <div key={organizerRouteKey(organizer)} className="flex-shrink-0">
                <OrganizerLogoTile
                  organizer={organizer}
                  mode="interactive"
                  onOpenProfile={onOrganizerActivate}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show marquee for enough organizers
  return (
    <div className="py-4">
      {!hideHeading && (
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Featured Organizers</h2>
          <p className="mt-1 text-sm text-gray-600">Organizers in India</p>
        </div>
      )}
      <div className="overflow-x-hidden" style={trackStyle}>
        <div className="organizers-marquee-track flex w-max flex-row flex-nowrap items-stretch">
          {/* First strip */}
          <div className={stripClass}>
            {organizers.map((organizer) => (
              <div key={organizerRouteKey(organizer)} className="flex-shrink-0">
                <OrganizerLogoTile
                  organizer={organizer}
                  mode="interactive"
                  onOpenProfile={onOrganizerActivate}
                />
              </div>
            ))}
          </div>

          {/* Duplicate strip for seamless scrolling */}
          <div className={stripClass} aria-hidden>
            {organizers.map((organizer) => (
              <div key={`marquee-dup-${organizerRouteKey(organizer)}`} className="flex-shrink-0">
                <OrganizerLogoTile
                  organizer={organizer}
                  mode="decorative"
                  onOpenProfile={onOrganizerActivate}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function organizerRouteKey(organizer: OrganizerListEntry): string {
  return String(organizer.id)
}

export const OrganizersMarquee = memo(OrganizersMarqueeComponent)