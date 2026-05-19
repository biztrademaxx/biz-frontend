import { fetchFeaturedSpeakersForHomeServer } from "@/lib/speakers/fetch-featured-speakers-home-server"
import { getHomeCityFromCookies } from "@/lib/home-location-server"
import FeaturedSpeakersStripClient from "./FeaturedSpeakersStripClient"

export default async function FeaturedSpeakersSection() {
  const [speakers, homeCity] = await Promise.all([
    fetchFeaturedSpeakersForHomeServer(),
    getHomeCityFromCookies(),
  ])
  if (speakers.length === 0) return null
  return <FeaturedSpeakersStripClient speakers={speakers} homeCity={homeCity} />
}
