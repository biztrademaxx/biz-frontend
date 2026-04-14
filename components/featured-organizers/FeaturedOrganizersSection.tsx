import type { ReactNode } from "react"
import { fetchFeaturedOrganizersForHomeServer } from "@/lib/organizers/fetch-public-organizers-server"
import { FeaturedOrganizersSectionHeading } from "./FeaturedOrganizersSectionHeading"
import { FeaturedOrganizersRefreshButton } from "./FeaturedOrganizersRefreshButton"
import FeaturedOrganizersStripClient from "./FeaturedOrganizersStripClient"

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="home-tt-section mx-auto w-full min-w-0 max-w-7xl px-3 sm:px-4 lg:px-6">
      <FeaturedOrganizersSectionHeading />
      {children}
    </div>
  )
}

export default async function FeaturedOrganizersSection() {
  const { organizers, fetchFailed } = await fetchFeaturedOrganizersForHomeServer()

  if (fetchFailed && organizers.length === 0) {
    return (
      <Shell>
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
    <Shell>
      <FeaturedOrganizersStripClient organizers={organizers} />
    </Shell>
  )
}
