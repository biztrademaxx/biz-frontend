import type { ReactNode } from "react"
import { Suspense } from "react"
import { FeaturedOrganizersSkeleton } from "@/components/home-skeletons"
import { fetchFeaturedOrganizersForHomeServer } from "@/lib/organizers/fetch-public-organizers-server"
import { getHomeLocationDisplayLabel } from "@/lib/home-location-server"
import { FeaturedOrganizersSectionHeading } from "./FeaturedOrganizersSectionHeading"
import { FeaturedOrganizersRefreshButton } from "./FeaturedOrganizersRefreshButton"
import FeaturedOrganizersStripClient from "./FeaturedOrganizersStripClient"

function Shell({ children, homeCity }: { children: ReactNode; homeCity?: string | null }) {
  return (
    <div className="home-tt-section mx-auto w-full min-w-0 max-w-7xl px-3 sm:px-4 lg:px-6">
      <FeaturedOrganizersSectionHeading homeCity={homeCity} />
      {children}
    </div>
  )
}

async function FeaturedOrganizersContent() {
  const [{ organizers, fetchFailed }, homeCity] = await Promise.all([
    fetchFeaturedOrganizersForHomeServer(),
    getHomeLocationDisplayLabel(),
  ])

  if (fetchFailed && organizers.length === 0) {
    return (
      <Shell homeCity={homeCity}>
        <div
          className="flex flex-col gap-2 border-b border-red-100 bg-red-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <p className="text-sm text-red-800">
            We could not load organizers. Please try again shortly.
          </p>
          <FeaturedOrganizersRefreshButton />
        </div>
      </Shell>
    )
  }

  if (organizers.length === 0) {
    return null
  }

  return (
    <Shell homeCity={homeCity}>
      <FeaturedOrganizersStripClient organizers={organizers} />
    </Shell>
  )
}

export default function FeaturedOrganizersSection() {
  return (
    <Suspense fallback={<FeaturedOrganizersSkeleton />}>
      <FeaturedOrganizersContent />
    </Suspense>
  )
}
