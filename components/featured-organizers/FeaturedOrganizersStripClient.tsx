// FeaturedOrganizersStripClient.tsx - Fixed (only ONE heading)
"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { OrganizerListEntry } from "@/lib/organizers/types"
import { OrganizersMarquee } from "./OrganizersMarquee"

export interface FeaturedOrganizersStripClientProps {
  organizers: OrganizerListEntry[]
}

export default function FeaturedOrganizersStripClient({
  organizers,
}: FeaturedOrganizersStripClientProps) {
  const router = useRouter()
  const onOrganizerActivate = useCallback(
    (organizerId: string) => {
      router.push(`/organizer/${encodeURIComponent(organizerId)}`)
    },
    [router],
  )

  if (organizers.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No featured organizers available at this time.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Marquee - make sure it doesn't have its own heading */}
      <OrganizersMarquee
        organizers={organizers}
        onOrganizerActivate={onOrganizerActivate}
        hideHeading={true}  // Pass prop to hide heading in marquee
      />

      {/* View All Button */}
      <div className="mt-10 flex justify-center">
        <Link
          href="/organizers"
          className="inline-flex items-center justify-center rounded-sm bg-[#004A96] px-8 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#003a75] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          View All Organizers
        </Link>
      </div>
    </div>
  )
}