import EventsPageContent from "../events-page-content"
import { fetchBrowseCategoryMetaServer } from "@/lib/categories/fetch-browse-categories-server"
import { fetchEventsListingServer } from "@/lib/events/fetch-events-listing-server"
import { EVENTS_LISTING_REVALIDATE_SEC } from "@/components/events-page/listing-constants"

export const revalidate = EVENTS_LISTING_REVALIDATE_SEC

export default async function EventsPage() {
  const [initialBrowseCategoryMeta, initialEvents] = await Promise.all([
    fetchBrowseCategoryMetaServer(),
    fetchEventsListingServer(),
  ])

  return (
    <EventsPageContent
      initialBrowseCategoryMeta={initialBrowseCategoryMeta}
      initialEvents={initialEvents}
    />
  )
}
