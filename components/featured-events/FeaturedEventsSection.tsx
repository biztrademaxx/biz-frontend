import { fetchFeaturedEventsForHomeSection } from "@/lib/events/fetch-featured-events-server"
import { getHomeCityDisplayLabel, getHomeCountryDisplayLabel } from "@/lib/home-location-server"
import FeaturedEventsGridClient from "./FeaturedEventsGridClient"

export default async function FeaturedEventsSection() {
  const [events, homeCity, homeCountry] = await Promise.all([
    fetchFeaturedEventsForHomeSection(),
    getHomeCityDisplayLabel(),
    getHomeCountryDisplayLabel(),
  ])
  const subtitle = homeCountry
    ? `Handpicked popular events in ${homeCountry}`
    : "Handpicked Popular Events"

  return (
    <section
      id="featured_events"
      className="home-tt-section mx-auto mb-12 mt-8 w-full min-w-0 max-w-7xl bg-[#F7FBFF] px-3 py-4 sm:px-4 lg:px-6"
    >
      <h2 className="home-tt-h2 mb-3">
        Featured Events
        <br />
        <span className="home-tt-sub">{subtitle}</span>
      </h2>
      <FeaturedEventsGridClient events={events} homeCity={homeCity} homeCountry={homeCountry} />
    </section>
  )
}
