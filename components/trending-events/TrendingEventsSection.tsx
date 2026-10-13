import { fetchTrendingHomePayloadServer } from "@/lib/home-trending/fetch-trending-home-server"
import { getHomeCityDisplayLabel, getHomeCountryDisplayLabel } from "@/lib/home-location-server"
import TrendingEventsGridClient from "./TrendingEventsGridClient"

export default async function TrendingEventsSection() {
  const [{ events, goingBundles }, homeCity, homeCountry] = await Promise.all([
    fetchTrendingHomePayloadServer(),
    getHomeCityDisplayLabel(),
    getHomeCountryDisplayLabel(),
  ])
  return (
    <TrendingEventsGridClient
      events={events}
      goingBundles={goingBundles}
      homeCity={homeCity}
      homeCountry={homeCountry}
    />
  )
}
