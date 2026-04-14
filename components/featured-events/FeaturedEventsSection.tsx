import { fetchFeaturedEventsForHomeSection } from "@/lib/events/fetch-featured-events-server"
import FeaturedEventsGridClient from "./FeaturedEventsGridClient"

export default async function FeaturedEventsSection() {
  const events = await fetchFeaturedEventsForHomeSection()

  return (
    <section
      id="featured_events"
      className="home-tt-section mx-auto mb-12 mt-8 w-full min-w-0 max-w-7xl bg-white px-3 py-4 sm:px-4 lg:px-6"
    >
      <h2 className="home-tt-h2 mb-3">
        Featured Events
        <br />
        <span className="home-tt-sub">Handpicked Popular Events</span>
      </h2>
      <FeaturedEventsGridClient events={events} />
    </section>
  )
}
