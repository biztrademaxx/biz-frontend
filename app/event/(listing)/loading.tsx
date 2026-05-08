import EventsListingPageSkeleton from "@/components/EventsListingPageSkeleton"

/** Shown only while `/event` (listing) loads — scoped via `(listing)` so `/event/[id]` uses its own loading UI. */
export default function EventListingLoading() {
  return <EventsListingPageSkeleton />
}
