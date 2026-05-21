import HeroSlideshowClient from "./HeroSlideshowClient"
import { fetchHeroSlideshowEventsServer } from "@/lib/hero/fetch-hero-slideshow-server"
import { getHomeCountryDisplayLabel } from "@/lib/home-location-server"

export const revalidate = 60

export default async function HeroSlideshow() {
  const [events, homeCountry] = await Promise.all([
    fetchHeroSlideshowEventsServer(),
    getHomeCountryDisplayLabel(),
  ])
  return <HeroSlideshowClient initialEvents={events} homeCountry={homeCountry} />
}
