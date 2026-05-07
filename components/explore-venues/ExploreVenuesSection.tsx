import { Suspense } from "react"
import { ExploreVenuesSkeleton } from "@/components/home-skeletons"
import { fetchExploreVenuesForHomeServer } from "@/lib/venues/fetch-explore-venues-home-server"
import ExploreVenuesGridClient from "./ExploreVenuesGridClient"

async function ExploreVenuesContent() {
  const venues = await fetchExploreVenuesForHomeServer()
  return <ExploreVenuesGridClient venues={venues} />
}

export default function ExploreVenuesSection() {
  return (
    <Suspense fallback={<ExploreVenuesSkeleton />}>
      <ExploreVenuesContent />
    </Suspense>
  )
}
