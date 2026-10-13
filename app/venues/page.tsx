import { Suspense } from "react"
import VenuesListingPageSkeleton from "@/components/VenuesListingPageSkeleton"
import { fetchVenuesListingServer } from "@/lib/venues/fetch-venues-listing-server"
import VenuesListingPage from "./VenuesListingPage"

export const revalidate = 60

export default async function VenuesPage() {
  const initial = await fetchVenuesListingServer()

  return (
    <Suspense fallback={<VenuesListingPageSkeleton />}>
      <VenuesListingPage
        initialVenues={initial.venues}
        initialTotal={initial.total}
        initialTotalPages={initial.totalPages}
        visitorGeo={initial.visitorGeo}
      />
    </Suspense>
  )
}
