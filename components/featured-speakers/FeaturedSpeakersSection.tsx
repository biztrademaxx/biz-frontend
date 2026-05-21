import { fetchFeaturedSpeakersForHomeServer } from "@/lib/speakers/fetch-featured-speakers-home-server"
import { getHomeCountryDisplayLabel } from "@/lib/home-location-server"
import FeaturedSpeakersStripClient from "./FeaturedSpeakersStripClient"

export default async function FeaturedSpeakersSection() {
  const [speakers, homeCountry] = await Promise.all([
    fetchFeaturedSpeakersForHomeServer(),
    getHomeCountryDisplayLabel(),
  ])
  if (speakers.length === 0) return null
  return <FeaturedSpeakersStripClient speakers={speakers} homeCountry={homeCountry} />
}
