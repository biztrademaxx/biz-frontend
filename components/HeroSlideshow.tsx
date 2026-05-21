import HeroSlideshowClient from "./HeroSlideshowClient"
import { fetchHeroSlideshowEventsServer } from "@/lib/hero/fetch-hero-slideshow-server"
import { getHomeCityDisplayLabel, getHomeCountryDisplayLabel } from "@/lib/home-location-server"

export const revalidate = 60

export default async function HeroSlideshow() {
  const [events, homeCity, homeCountry] = await Promise.all([
    fetchHeroSlideshowEventsServer(),
    getHomeCityDisplayLabel(),
    getHomeCountryDisplayLabel(),
  ])
  return (
    <HeroSlideshowClient
      initialEvents={events}
      homeCity={homeCity}
      homeCountry={homeCountry}
    />
  )
}
