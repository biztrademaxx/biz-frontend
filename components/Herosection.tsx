import { fetchHeroSlideshowEventsServer } from "@/lib/hero/fetch-hero-slideshow-server"
import HeroBrandContent from "./Herobrandcontent"
import HeroVipSlider from "./Herovipslider"

export default async function HeroSection() {
    const events = await fetchHeroSlideshowEventsServer()

    return (
        <section
            aria-label="Featured VIP trade events"
            className="flex w-full min-h-[520px] bg-gray-100 rounded-lg overflow-hidden mt-8"
        >
            {/* LEFT */}
            <div className="flex w-[52%] shrink-0 flex-col justify-center ">
                <HeroBrandContent />
            </div>

            {/* RIGHT */}
            <div className="w-[48%]">
                <HeroVipSlider initialEvents={events} />
            </div>
        </section>
    )
}