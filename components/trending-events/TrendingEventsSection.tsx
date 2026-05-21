import { fetchTrendingHomePayloadServer } from "@/lib/home-trending/fetch-trending-home-server"
import { getHomeCountryDisplayLabel } from "@/lib/home-location-server"
import TrendingEventsGridClient from "./TrendingEventsGridClient"

export default async function TrendingEventsSection() {
  const [{ events, goingBundles }, homeCountry] = await Promise.all([
    fetchTrendingHomePayloadServer(),
    getHomeCountryDisplayLabel(),
  ])
  return <TrendingEventsGridClient events={events} goingBundles={goingBundles} homeCountry={homeCountry} />
}
