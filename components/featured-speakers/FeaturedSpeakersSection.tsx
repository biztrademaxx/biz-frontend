import { fetchFeaturedSpeakersForHomeServer } from "@/lib/speakers/fetch-featured-speakers-home-server"
import FeaturedSpeakersStripClient from "./FeaturedSpeakersStripClient"

export default async function FeaturedSpeakersSection() {
  const speakers = await fetchFeaturedSpeakersForHomeServer()
  if (speakers.length === 0) return null
  return <FeaturedSpeakersStripClient speakers={speakers} />
}
