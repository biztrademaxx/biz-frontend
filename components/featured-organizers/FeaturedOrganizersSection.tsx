import type { ReactNode } from "react"
import { Suspense } from "react"
import { FeaturedOrganizersSkeleton } from "@/components/home-skeletons"
import { fetchFeaturedOrganizersForHomeServer } from "@/lib/organizers/fetch-public-organizers-server"
import HomeSectionEmptyState, { homeEmptyDescription } from "@/components/home/HomeSectionEmptyState"
import { getHomeCityDisplayLabel, getHomeCountryDisplayLabel } from "@/lib/home-location-server"
import { FeaturedOrganizersSectionHeading } from "./FeaturedOrganizersSectionHeading"
import { FeaturedOrganizersRefreshButton } from "./FeaturedOrganizersRefreshButton"
import FeaturedOrganizersStripClient from "./FeaturedOrganizersStripClient"

function Shell({
  children,
  homeCountry,
}: {
  children: ReactNode
  homeCountry?: string | null
}) {
  return (
    <div className="home-tt-section mx-auto w-full min-w-0 max-w-7xl px-3 sm:px-4 lg:px-6">
      <FeaturedOrganizersSectionHeading homeCountry={homeCountry} />
      {children}
    </div>
  )
}

async function FeaturedOrganizersContent() {
  const [{ organizers, fetchFailed }, homeCity, homeCountry] = await Promise.all([
    fetchFeaturedOrganizersForHomeServer(),
    getHomeCityDisplayLabel(),
    getHomeCountryDisplayLabel(),
  ])

  if (fetchFailed && organizers.length === 0) {
    return (
      <Shell homeCountry={homeCountry}>
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
    return (
      <Shell homeCountry={homeCountry}>
        <HomeSectionEmptyState
          icon="organizers"
          title="No organizers in this region yet"
          description={homeEmptyDescription("organizers", homeCity, homeCountry)}
          homeCity={homeCity}
          homeCountry={homeCountry}
          actions={[
            { label: "Browse organizers", href: "/organizers" },
            { label: "Become an organizer", href: "/become-organizer", variant: "secondary" },
          ]}
        />
      </Shell>
    )
  }

  return (
    <Shell homeCountry={homeCountry}>
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
