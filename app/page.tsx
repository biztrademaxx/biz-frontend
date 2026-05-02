import { Suspense } from "react";
import BrowseByCountry from "../components/browse-by-country";
import { BrowseByCountrySkeleton } from "@/components/home-skeletons";
import BrowseEventsByCity from "../components/BrowseEventsByCity";
import { BrowseByCitySkeleton } from "@/components/home-skeletons";
import ExploreVenues from "../components/ExploreVenues";
import FeaturedEvents from "../components/FeaturedEvents";
import FeaturedOrganizers from "../components/FeaturedOrganizers";
import { PageBanner } from "@/components/page-banner";
import { InlineBanner } from "@/components/inline-banner";
import FeaturedSpeakers from "@/components/FeaturedSpeaker";
import CategoryGrid from "@/components/catagories";
import HeroSlideshow from "@/components/HeroSlideshow";
import HeroSlideshowSkeleton from "@/components/HeroSlideshowSkeleton";
import HomeScrollSignupRedirect from "@/components/home-scroll-signup-redirect";
import EventReviews from "@/components/EventReviews";
import {
  CategoryBrowseSkeleton,
  ExploreVenuesSkeleton,
  FeaturedEventsSkeleton,
  FeaturedOrganizersSkeleton,
  FeaturedSpeakersSkeleton,
  TrendingEventsSkeleton,
} from "@/components/home-skeletons";

export default function Home() {
  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-white">
      <HomeScrollSignupRedirect />
      <div className="bg-white pb-1">
        <div className="mx-auto px-4">
          <Suspense fallback={<HeroSlideshowSkeleton />}>
            <HeroSlideshow />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<CategoryBrowseSkeleton />}>
        <CategoryGrid />
      </Suspense>

      <Suspense fallback={<FeaturedEventsSkeleton />}>
        <FeaturedEvents />
      </Suspense>

      <Suspense fallback={<BrowseByCitySkeleton />}>
        <BrowseEventsByCity />
      </Suspense>

      <div className="mx-auto w-full min-w-0 max-w-7xl border-b border-gray-200 px-3 py-6 sm:px-4 lg:px-6">
        <Suspense
          fallback={
            <div
              className="home-shimmer relative min-h-[88px] w-full rounded-sm"
              style={{ height: 150 }}
              aria-hidden
            />
          }
        >
          <PageBanner
            page="events"
            height={150}
            fixedHeight
            autoplay={true}
            autoplayInterval={5000}
            showControls={true}
          />
        </Suspense>
      </div>

      <Suspense fallback={<BrowseByCountrySkeleton />}>
        <BrowseByCountry />
      </Suspense>
      <Suspense fallback={<ExploreVenuesSkeleton />}>
        <ExploreVenues />
      </Suspense>
      <Suspense fallback={<FeaturedOrganizersSkeleton />}>
        <FeaturedOrganizers />
      </Suspense>
      <Suspense fallback={<TrendingEventsSkeleton />}>
        <EventReviews />
      </Suspense>
      <Suspense fallback={<FeaturedSpeakersSkeleton />}>
        <FeaturedSpeakers />
      </Suspense>

      <div className="mx-auto w-full min-w-0 max-w-7xl border-b border-gray-200 px-3 py-6 sm:px-4 lg:px-6">
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