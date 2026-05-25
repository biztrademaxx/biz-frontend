"use client"

import VenuePageSkeleton from "@/components/VenuePageSkeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  VenueDetailBackBar,
  VenueEventsTab,
  VenueHeroGallery,
  VenueHallsTab,
  VenueLocationTab,
  VenueNotFound,
  VenueOverviewTab,
  VenueReviewsTab,
} from "./components"
import { useVenueDetail } from "./hooks/useVenueDetail"
import { getHallsCount, getVenueImages } from "./lib/venue-detail-utils"

export default function VenueDetailPage() {
  const vm = useVenueDetail()

  if (vm.loading) {
    return <VenuePageSkeleton />
  }

  if (vm.error || !vm.venue) {
    return <VenueNotFound error={vm.error} router={vm.router} />
  }

  const venueImages = getVenueImages(vm.venue)
  const hallsCount = getHallsCount(vm.venue)

  return (
    <div className="min-h-screen bg-gray-50">
      <VenueDetailBackBar router={vm.router} />

      <VenueHeroGallery
        venue={vm.venue}
        images={venueImages}
        currentImageIndex={vm.currentImageIndex}
        onSelectImage={vm.setCurrentImageIndex}
        onPrev={() => vm.prevImage(venueImages.length)}
        onNext={() => vm.nextImage(venueImages.length)}
        showScheduleMeeting={vm.showScheduleMeeting}
        schedulingMeeting={vm.schedulingMeeting}
        onScheduleMeeting={() => void vm.handleScheduleMeeting()}
      />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="spaces">Halls ({hallsCount})</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="events">Events ({vm.events.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({vm.reviews.length})</TabsTrigger>
          </TabsList>

          <VenueOverviewTab venue={vm.venue} events={vm.events} />
          <VenueHallsTab venue={vm.venue} />
          <VenueLocationTab venue={vm.venue} />
          <VenueEventsTab
            events={vm.events}
            eventsLoading={vm.eventsLoading}
            showScheduleMeeting={vm.showScheduleMeeting}
            onScheduleMeeting={() => void vm.handleScheduleMeeting()}
          />
          <VenueReviewsTab
            venue={vm.venue}
            reviews={vm.reviews}
            reviewsLoading={vm.reviewsLoading}
            onReviewAdded={vm.handleReviewAdded}
          />
        </Tabs>
      </div>
    </div>
  )
}
