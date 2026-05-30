import EventsPageContent from "../events-page-content"
import { fetchBrowseCategoryMetaServer } from "@/lib/categories/fetch-browse-categories-server"
import { fetchEventsListingServer } from "@/lib/events/fetch-events-listing-server"

export const revalidate = 45

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
