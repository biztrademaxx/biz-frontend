import { Suspense } from "react"
import EventsPageContent from "./events-page-content"
import EventsListingPageSkeleton from "@/components/EventsListingPageSkeleton"
import { fetchBrowseCategoryMetaServer } from "@/lib/categories/fetch-browse-categories-server"

export const dynamic = "force-dynamic"

export default async function EventsPage() {
  const initialBrowseCategoryMeta = await fetchBrowseCategoryMetaServer()

  return (
    <Suspense fallback={<EventsListingPageSkeleton />}>
      <EventsPageContent initialBrowseCategoryMeta={initialBrowseCategoryMeta} />
    </Suspense>
  )
}
