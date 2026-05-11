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
  FeaturedEventsSkeleton,
  FeaturedSpeakersSkeleton,
  TrendingEventsSkeleton,
} from "@/components/home-skeletons";
import ComingSoonBanner from "@/components/ComingSoonBanner";

export default function Home() {
  return (
    <div>
      <ComingSoonBanner />
    </div>
  );
}