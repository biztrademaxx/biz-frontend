import { Suspense } from "react"
import { ExploreVenuesSkeleton } from "@/components/home-skeletons"
import { getHomeCountryDisplayLabel } from "@/lib/home-location-server"
import { fetchExploreVenuesForHomeServer } from "@/lib/venues/fetch-explore-venues-home-server"
import ExploreVenuesGridClient from "./ExploreVenuesGridClient"

async function ExploreVenuesContent() {
  const [venues, homeCountry] = await Promise.all([
    fetchExploreVenuesForHomeServer(),
    getHomeCountryDisplayLabel(),
  ])
  return <ExploreVenuesGridClient venues={venues} homeCountry={homeCountry} />
}

export default function ExploreVenuesSection() {
  return (
    <Suspense fallback={<ExploreVenuesSkeleton />}>
      <ExploreVenuesContent />
    </Suspense>
  )
}
