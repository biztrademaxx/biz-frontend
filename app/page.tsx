import { Suspense } from "react";
import BrowseByCountry from "../components/browse-by-country";
import { BrowseByCountrySkeleton } from "@/components/home-skeletons";
import BrowseEventsByCity from "../components/BrowseEventsByCity";
import { BrowseByCitySkeleton } from "@/components/home-skeletons";
import ExploreVenues from "../components/ExploreVenues";
import FeaturedEvents from "../components/FeaturedEvents";
import FeaturedOrganizers from "../components/FeaturedOrganizers";
import { HomePageBannerSlot } from "@/components/page-banner/HomePageBannerSlot";
import FeaturedSpeakers from "@/components/FeaturedSpeaker";
import CategoryGrid from "@/components/catagories";
import HeroSlideshow from "@/components/HeroSlideshow";
import HeroSlideshowSkeleton from "@/components/HeroSlideshowSkeleton";
import HomeHeroUnified from "@/components/hero/HomeHeroUnified";
import EventReviews from "@/components/EventReviews";
import {
  CategoryBrowseSkeleton,
  FeaturedEventsSkeleton,
  FeaturedSpeakersSkeleton,
  TrendingEventsSkeleton,
} from "@/components/home-skeletons";
import HomeTradeFairsSearch from "@/components/home/HomeTradeFairsSearch";

/** Home uses request-scoped geo (`headers`) and legacy `noStore()` in trending; cannot be fully static. */
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden">
      <div className="pb-1">
        <HomeHeroUnified>
          <Suspense fallback={<HeroSlideshowSkeleton />}>
            <HeroSlideshow />
          </Suspense>
        </HomeHeroUnified>
        <div className="mx-auto w-full min-w-0 max-w-7xl bg-[#f9f9f9] px-3 sm:px-4 lg:px-6">
          <Suspense
            fallback={
              <div className="mt-4 space-y-4 sm:mt-6" aria-hidden>
                <div className="home-shimmer h-6 w-56 rounded" />
                <div className="flex gap-4 overflow-hidden">
                  <div className="home-shimmer h-28 w-[300px] shrink-0 rounded-xl" />
                  <div className="home-shimmer h-28 w-[300px] shrink-0 rounded-xl" />
                  <div className="home-shimmer h-28 w-[300px] shrink-0 rounded-xl" />
                </div>
              </div>
            }
          >
            {/* <UpcomingVipEvents /> */}
          </Suspense>
          <div
            className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen pt-8 pb-10"
            style={{
              background: `
      radial-gradient(circle at 12% 25%, rgba(249,188,137,0.28) 0%, transparent 38%),
      radial-gradient(circle at 88% 20%, rgba(186,218,198,0.26) 0%, transparent 38%),
      linear-gradient(180deg, #f6f3ec 0%, #f1efe8 100%)
    `,
            }}
          >
            <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 " >
              <HomeTradeFairsSearch />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#f9f9f9]">
        <Suspense fallback={<CategoryBrowseSkeleton />}>
          <div className="mt-5">
            <CategoryGrid />
          </div>
        </Suspense>

        <Suspense fallback={<FeaturedEventsSkeleton />}>
          <FeaturedEvents />
        </Suspense>

        <Suspense fallback={<BrowseByCitySkeleton />}>
          <BrowseEventsByCity />
        </Suspense>

        <HomePageBannerSlot position="after_city" fallbackPosition="middle" />

        <Suspense fallback={<BrowseByCountrySkeleton />}>
          <BrowseByCountry />
        </Suspense>

        <HomePageBannerSlot position="after_country" />

        <ExploreVenues />
        <FeaturedOrganizers />

        <HomePageBannerSlot position="after_featured_organizers" />
        <Suspense fallback={<TrendingEventsSkeleton />}>
          <EventReviews />
        </Suspense>
        <Suspense fallback={<FeaturedSpeakersSkeleton />}>
          <FeaturedSpeakers />
        </Suspense>

        <div className="mx-auto w-full min-w-0 max-w-7xl px-3 py-6 sm:px-4 lg:px-6">
          <Suspense
            fallback={
              <div className="w-full space-y-4" aria-hidden>
                <div className="home-shimmer h-32 rounded-sm sm:h-36 md:h-40" />
              </div>
            }
          >
            {/* <InlineBanner page="speakers" maxBanners={3} dismissible={true} /> */}
          </Suspense>
        </div>
      </div>
    </div>
  )
}