import { Suspense } from "react"
import EventsPageContent from "../events-page-content"
import EventsListingPageSkeleton from "@/components/EventsListingPageSkeleton"
import { fetchBrowseCategoryMetaServer } from "@/lib/categories/fetch-browse-categories-server"
import {
  fetchEventsListingPremiumServer,
  fetchEventsListingRailsServer,
  fetchEventsListingServer,
} from "@/lib/events/fetch-events-listing-server"
import { exploreKeyFromQueryParam, formatNameFromExploreKey } from "@/lib/explore-event-types"

export const revalidate = 45

type EventsListingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function firstParam(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0]
  return v
}

export default async function EventsPage({ searchParams }: EventsListingPageProps) {
  const sp = searchParams ? await searchParams : {}
  const category = firstParam(sp.category)
  const type = firstParam(sp.type)
  const location = firstParam(sp.location) || firstParam(sp.venue)
  const country = firstParam(sp.country)
  const search = firstParam(sp.search)
  const from = firstParam(sp.from)
  const to = firstParam(sp.to)
  const exploreKey = exploreKeyFromQueryParam(type ?? null)

  const [initialBrowseCategoryMeta, listing, initialRailEvents, initialPremiumEvents] =
    await Promise.all([
      fetchBrowseCategoryMetaServer(),
      fetchEventsListingServer({
        search,
        category,
        location,
        country,
        from,
        to,
        format: exploreKey ? formatNameFromExploreKey(exploreKey) : undefined,
        type: exploreKey ?? undefined,
        sort: "ranked",
        excludePast: true,
      }),
      fetchEventsListingRailsServer(),
      fetchEventsListingPremiumServer({
        category,
        location,
        country,
      }),
    ])

  return (
    <Suspense fallback={<EventsListingPageSkeleton />}>
      <EventsPageContent
        initialBrowseCategoryMeta={initialBrowseCategoryMeta}
        initialEvents={listing.events}
        initialPagination={listing.pagination}
        initialRailEvents={initialRailEvents}
        initialPremiumEvents={initialPremiumEvents}
      />
    </Suspense>
  )
}
