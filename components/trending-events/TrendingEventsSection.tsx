import { fetchTrendingHomePayloadServer } from "@/lib/home-trending/fetch-trending-home-server"
import TrendingEventsGridClient from "./TrendingEventsGridClient"

export default async function TrendingEventsSection() {
  const { events, goingBundles } = await fetchTrendingHomePayloadServer()
  return <TrendingEventsGridClient events={events} goingBundles={goingBundles} />
}
