import { fetchFeaturedSpeakersForHomeServer } from "@/lib/speakers/fetch-featured-speakers-home-server"
import HomeSectionEmptyState, { homeEmptyDescription } from "@/components/home/HomeSectionEmptyState"
import { getHomeCityDisplayLabel, getHomeCountryDisplayLabel } from "@/lib/home-location-server"
import FeaturedSpeakersStripClient from "./FeaturedSpeakersStripClient"

export default async function FeaturedSpeakersSection() {
  const [speakers, homeCity, homeCountry] = await Promise.all([
    fetchFeaturedSpeakersForHomeServer(),
    getHomeCityDisplayLabel(),
    getHomeCountryDisplayLabel(),
  ])

  if (speakers.length === 0) {
    return (
      <section className="home-tt-section mx-auto w-full min-w-0 max-w-7xl px-3 py-8 sm:px-4 lg:px-6">
        <h2 className="home-tt-h2 mb-3">
          Featured Speakers
          <br />
          <span className="home-tt-sub">
            {homeCountry
              ? `Industry experts and keynote speakers in ${homeCountry}`
              : "Learn from industry experts and keynote speakers."}
          </span>
        </h2>
        <HomeSectionEmptyState
          icon="speakers"
          title="No speakers in this region yet"
          description={homeEmptyDescription("speakers", homeCity, homeCountry)}
          homeCity={homeCity}
          homeCountry={homeCountry}
          actions={[
            { label: "Browse speakers", href: "/speakers" },
            { label: "Become a speaker", href: "/signup", variant: "secondary" },
          ]}
        />
      </section>
    )
  }

  return <FeaturedSpeakersStripClient speakers={speakers} homeCountry={homeCountry} />
}
