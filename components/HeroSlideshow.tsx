import HeroSlideshowClient from "./HeroSlideshowClient"
import { fetchHeroSlideshowEventsServer } from "@/lib/hero/fetch-hero-slideshow-server"
import { getHomeLocationDisplayLabel } from "@/lib/home-location-server"

export const revalidate = 60

export default async function HeroSlideshow() {
  const [events, homeCity] = await Promise.all([
    fetchHeroSlideshowEventsServer(),
    getHomeLocationDisplayLabel(),
  ])
  return <HeroSlideshowClient initialEvents={events} homeCity={homeCity} />
}
