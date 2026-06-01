import { fetchHeroSlideshowEventsServer } from "@/lib/hero/fetch-hero-slideshow-server"
import HeroBrandContent from "./Herobrandcontent"
import HeroVipSlider from "./Herovipslider"

export default async function HeroSection() {
    const events = await fetchHeroSlideshowEventsServer()

    return (
        <section
            aria-label="Featured VIP trade events"
            className="mt-8 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm"
        >
            <div className="grid min-h-[650px] grid-cols-1 lg:grid-cols-[48%_52%]">

                <HeroBrandContent />

                <div className="p-6 lg:p-8">
                    <HeroVipSlider initialEvents={events} />
                </div>

            </div>
        </section>
    )
}