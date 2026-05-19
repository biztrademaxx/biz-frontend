import { fetchTrendingHomePayloadServer } from "@/lib/home-trending/fetch-trending-home-server"
import { getHomeCityFromCookies } from "@/lib/home-location-server"
import TrendingEventsGridClient from "./TrendingEventsGridClient"

export default async function TrendingEventsSection() {
  const [{ events, goingBundles }, homeCity] = await Promise.all([
    fetchTrendingHomePayloadServer(),
    getHomeCityFromCookies(),
  ])
  return <TrendingEventsGridClient events={events} goingBundles={goingBundles} homeCity={homeCity} />
}
