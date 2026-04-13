import HeroSlideshowClient from "./HeroSlideshowClient"
import { fetchHeroSlideshowEventsServer } from "@/lib/hero/fetch-hero-slideshow-server"

export const revalidate = 60

export default async function HeroSlideshow() {
  const events = await fetchHeroSlideshowEventsServer()
  return <HeroSlideshowClient initialEvents={events} />
}
