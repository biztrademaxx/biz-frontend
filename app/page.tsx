import { Suspense } from "react";

/** Home uses request-scoped geo (`headers`) and legacy `noStore()` in trending; cannot be fully static. */
export const dynamic = "force-dynamic";
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
import EventReviews from "@/components/EventReviews";
import {
  CategoryBrowseSkeleton,
  FeaturedEventsSkeleton,
  FeaturedSpeakersSkeleton,
  TrendingEventsSkeleton,
} from "@/components/home-skeletons";
import HeroSection from "@/components/Herosection";
import AboutBizTrade from "@/components/aboutBiztradefairs";
import HomeTradeFairsSearch from "@/components/home/HomeTradeFairsSearch";
import UpcomingVipEvents from "@/components/home/UpcomingVipEvents";

export default function Home() {
  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f9f9f9]">
      <div className="pb-1">
        <Suspense fallback={<HeroSlideshowSkeleton />}>
          <HeroSlideshow />
        </Suspense>
        <div className="mx-auto w-full min-w-0 max-w-7xl px-3 sm:px-4 lg:px-6">
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
          <div className="relative bg-[#F9F9F9] left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen  pt-4 pb-6 mt-5">
            <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
              <HomeTradeFairsSearch />
            </div>
          </div>
        </div>
      </div>
      {/* <AboutBizTrade/> */}
      <Suspense fallback={<CategoryBrowseSkeleton />}>
        <div className="-mt-8">
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


  );
}


// import ComingSoonBanner from "@/components/ComingSoonBanner";

// export default function Home() {
//   return (
//     <div>
//       <ComingSoonBanner />
//     </div>
//   );
// }