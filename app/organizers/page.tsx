import { Suspense } from "react"
import OrganizersListingPageSkeleton from "@/components/OrganizersListingPageSkeleton"
import { fetchOrganizersListingServer } from "@/lib/organizers/fetch-organizers-listing-server"
import OrganizersPageContent from "./organizers-page-content"

export const revalidate = 60

export default async function OrganizersPage() {
  const initial = await fetchOrganizersListingServer()

  return (
    <Suspense fallback={<OrganizersListingPageSkeleton />}>
      <OrganizersPageContent
        initialOrganizers={initial.organizers}
        initialTotal={initial.total}
        initialTotalPages={initial.totalPages}
        initialFacets={initial.facets}
        visitorGeo={initial.visitorGeo}
      />
    </Suspense>
  )
}
