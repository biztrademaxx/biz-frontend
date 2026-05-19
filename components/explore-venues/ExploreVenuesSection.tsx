import { Suspense } from "react"
import { ExploreVenuesSkeleton } from "@/components/home-skeletons"
import { getHomeLocationDisplayLabel } from "@/lib/home-location-server"
import { fetchExploreVenuesForHomeServer } from "@/lib/venues/fetch-explore-venues-home-server"
import ExploreVenuesGridClient from "./ExploreVenuesGridClient"

async function ExploreVenuesContent() {
  const [venues, homeCity] = await Promise.all([
    fetchExploreVenuesForHomeServer(),
    getHomeLocationDisplayLabel(),
  ])
  return <ExploreVenuesGridClient venues={venues} homeCity={homeCity} />
}

export default function ExploreVenuesSection() {
  return (
    <Suspense fallback={<ExploreVenuesSkeleton />}>
      <ExploreVenuesContent />
    </Suspense>
  )
}
