import { Suspense } from "react"
import EventsPageContent from "../events-page-content"
import EventsListingPageSkeleton from "@/components/EventsListingPageSkeleton"
import { fetchBrowseCategoryMetaServer } from "@/lib/categories/fetch-browse-categories-server"
import { fetchEventsListingServer } from "@/lib/events/fetch-events-listing-server"

export const revalidate = 45

export default async function EventsPage() {
  const [initialBrowseCategoryMeta, initialEvents] = await Promise.all([
    fetchBrowseCategoryMetaServer(),
    fetchEventsListingServer(),
  ])

  return (
    <Suspense fallback={<EventsListingPageSkeleton />}>
      <EventsPageContent
        initialBrowseCategoryMeta={initialBrowseCategoryMeta}
        initialEvents={initialEvents}
      />
    </Suspense>
  )
}
