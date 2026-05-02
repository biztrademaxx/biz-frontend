/**
 * Layout-matched loading shells for the homepage (sheen via `.home-shimmer` in globals.css).
 */

function SectionTitleLines() {
  return (
    <div className="border-b border-gray-200 py-6">
      <div className="home-shimmer mb-1.5 h-6 w-52 max-w-[75%] rounded-md" />
      <div className="home-shimmer h-4 w-64 max-w-[85%] rounded-md" />
    </div>
  )
}

/** Featured Organizers: header + horizontal row of 200×120 logo tiles (+ dashed “View all” slot). */
export function FeaturedOrganizersSkeleton() {
  return (
    <div
      className="home-tt-section mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6"
      aria-busy="true"
      aria-label="Loading featured organizers"
    >
      <SectionTitleLines />
      <div className="group relative">
        <div className="flex items-center gap-6 overflow-hidden py-6 sm:gap-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="home-shimmer h-[120px] w-[200px] shrink-0 rounded-sm border border-gray-200 bg-white"
            />
          ))}
          <div className="home-shimmer h-[120px] w-[200px] shrink-0 rounded-sm border-2 border-dashed border-gray-200 bg-gray-50/80" />
        </div>
      </div>
    </div>
  )
}

/** Featured Speakers: header + circular avatars + name lines. */
export function FeaturedSpeakersSkeleton() {
  return (
    <div
      className="home-tt-section mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6"
      aria-busy="true"
      aria-label="Loading featured speakers"
    >
      <div className="group relative">
        <SectionTitleLines />
        <div className="flex min-w-0 items-center gap-6 overflow-hidden py-6 sm:gap-8">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex min-w-[100px] max-w-[140px] shrink-0 flex-col items-center"
            >
              <div className="home-shimmer h-[90px] w-[90px] shrink-0 rounded-full border border-gray-100 bg-white shadow-sm" />
              <div className="home-shimmer mt-3 h-3.5 w-20 rounded" />
              <div className="home-shimmer mt-1.5 h-3 w-16 rounded opacity-80" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Browse by category: title + 5 category tiles + view-all tile. */
export function CategoryBrowseSkeleton() {
  return (
    <div className="home-tt-section bg-[#F3F2F0] py-6 sm:py-8" aria-busy="true" aria-label="Loading categories">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="home-shimmer mb-3 h-6 w-56 max-w-[85%] rounded-md" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 md:gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex min-h-[110px] flex-col items-start rounded-md border border-gray-200/90 bg-white px-3 pt-3 pb-3 shadow-sm"
            >
              <div className="home-shimmer h-8 w-8 rounded-full" />
              <div className="home-shimmer mt-3 h-3 w-[90%] max-w-[140px] rounded" />
              <div className="home-shimmer mt-2 h-2.5 w-[55%] max-w-[100px] rounded" />
            </div>
          ))}
          <div className="flex min-h-[110px] items-center justify-center rounded-md border border-[#002C71]/20 bg-[#002C71]/[0.06] px-3 py-3 shadow-sm">
            <div className="home-shimmer h-4 w-16 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

function VenueCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
      <div className="home-shimmer h-28 w-full sm:h-32" />
      <div className="flex flex-col gap-1.5 p-3 sm:p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="home-shimmer h-4 w-[70%] rounded sm:h-[1.125rem]" />
          <div className="home-shimmer h-5 w-12 shrink-0 rounded-md sm:h-6 sm:w-14" />
        </div>
        <div className="home-shimmer h-3 w-full rounded" />
        <div className="home-shimmer h-3 w-[85%] rounded" />
        <div className="mt-1 border-t border-gray-100 pt-2">
          <div className="home-shimmer h-3.5 w-[50%] rounded" />
        </div>
      </div>
    </div>
  )
}

/** Featured Events: title + event cards (matches FeaturedEventsSection layout). */
export function FeaturedEventsSkeleton() {
  return (
    <section
      id="featured_events"
      className="home-tt-section mx-auto mb-12 mt-8 w-full min-w-0 max-w-7xl bg-white px-3 py-4 sm:px-4 lg:px-6"
      aria-busy="true"
      aria-label="Loading featured events"
    >
      <div className="home-shimmer mb-3 h-6 w-56 max-w-[80%] rounded-md" />
      <div className="home-shimmer mb-8 h-4 w-72 max-w-[90%] rounded-md" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-sm border border-gray-200 bg-white">
            <div className="home-shimmer h-44 w-full" />
            <div className="space-y-2 p-4">
              <div className="home-shimmer h-5 w-[90%] rounded" />
              <div className="home-shimmer h-3.5 w-[60%] rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function ExploreVenuesSkeleton() {
  return (
    <section
      className="home-tt-section mx-auto mb-12 w-full max-w-7xl px-3 sm:px-4 lg:px-6"
      aria-busy="true"
      aria-label="Loading venues"
    >
      <div className="mb-10 text-start">
        <div className="home-shimmer mb-1.5 h-6 w-52 max-w-[85%] rounded-md" />
        <div className="home-shimmer h-4 w-72 max-w-[95%] rounded-md" />
      </div>
      <div>
        <div className="mb-6 grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <VenueCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <VenueCardSkeleton key={`b-${i}`} />
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <div className="home-shimmer h-11 w-40 rounded-md" />
        </div>
      </div>
    </section>
  )
}

export function BrowseByCountrySkeleton() {
  return (
    <section className="home-tt-section w-full py-16" aria-busy="true" aria-label="Loading countries">
      <div className="mx-auto w-full min-w-0 max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="mb-12 text-start">
          <div className="home-shimmer mb-1.5 h-6 w-64 max-w-[90%] rounded-md" />
          <div className="home-shimmer h-4 w-80 max-w-[95%] rounded-md" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 md:gap-3 lg:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-md border border-gray-200 bg-white px-3 py-3.5 shadow-sm">
              <div className="flex min-w-0 flex-col items-start gap-2">
                <div className="home-shimmer h-7 w-11 shrink-0 rounded-none" />
                <div className="w-full min-w-0">
                  <div className="home-shimmer h-3.5 w-[85%] rounded" />
                  <div className="home-shimmer mt-2 h-3 w-[55%] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function BrowseByCitySkeleton() {
  return (
    <section className="home-tt-section w-full py-16" aria-busy="true" aria-label="Loading cities">
      <div className="mx-auto w-full min-w-0 max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="mb-12 text-start">
          <div className="home-shimmer mb-1.5 h-6 w-64 max-w-[90%] rounded-md" />
          <div className="home-shimmer h-4 w-80 max-w-[95%] rounded-md" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 md:gap-3 lg:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-md border border-gray-200 bg-white px-3 py-3.5 shadow-sm">
              <div className="flex min-w-0 flex-col items-start gap-2">
                <div className="home-shimmer h-10 w-10 shrink-0 rounded-none" />
                <div className="w-full min-w-0">
                  <div className="home-shimmer h-3.5 w-[85%] rounded" />
                  <div className="home-shimmer mt-2 h-3 w-[55%] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function TrendingEventsSkeleton() {
  return (
    <section
      className="home-tt-section mx-auto max-w-7xl px-3 py-12 sm:px-4 lg:px-6"
      aria-busy="true"
      aria-label="Loading trending events"
    >
      <div className="mb-10 text-start">
        <div className="home-shimmer mb-2 h-6 w-72 max-w-[90%] rounded-md" />
        <div className="home-shimmer h-3.5 w-full max-w-3xl rounded-md" />
        <div className="home-shimmer mt-1.5 h-3.5 w-full max-w-2xl rounded-md opacity-70" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-sm border border-gray-200 bg-white">
            <div className="home-shimmer h-48 w-full" />
            <div className="space-y-3 p-5">
              <div className="home-shimmer h-5 w-full rounded" />
              <div className="home-shimmer h-4 w-[82%] rounded" />
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div
                        key={j}
                        className="home-shimmer relative h-7 w-7 rounded-full border-2 border-white"
                        style={{ zIndex: j }}
                      />
                    ))}
                  </div>
                  <div className="home-shimmer h-4 w-24 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
