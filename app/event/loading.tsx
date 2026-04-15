import EventsListingPageSkeleton from "@/components/EventsListingPageSkeleton"

/** Shown during the `/event` segment load so the UI never flashes empty layout before the client fetch. */
export default function EventListingLoading() {
  return <EventsListingPageSkeleton />
}
