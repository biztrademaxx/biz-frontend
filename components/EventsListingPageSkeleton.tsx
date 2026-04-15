/**
 * Shimmer shell for `/event` listing — mirrors tabs, 3-col grid (filters | list | ads), banner, and event cards.
 */
function SidebarBlockSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="home-shimmer h-4 w-28 rounded-md" />
        <div className="home-shimmer h-4 w-4 rounded-sm" />
      </div>
      <div className="space-y-2.5 px-4 pb-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="home-shimmer h-4 w-4 shrink-0 rounded-sm" />
            <div className="home-shimmer h-3.5 flex-1 rounded-md max-w-[180px]" />
            <div className="home-shimmer ml-auto h-3.5 w-6 rounded-md opacity-80" />
          </div>
        ))}
      </div>
    </div>
  )
}

function EventListCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-sm border border-gray-300 bg-white">
      <div className="flex flex-col md:min-h-[176px] md:flex-row md:items-stretch">
        <div className="flex min-h-0 flex-1 flex-col space-y-1.5 px-4 py-2.5 sm:px-5">
          <div className="home-shimmer h-3 w-36 rounded-md" />
          <div className="space-y-1">
            <div className="home-shimmer h-[18px] w-[95%] max-w-xl rounded-md" />
            <div className="home-shimmer h-[18px] w-[70%] max-w-lg rounded-md" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="home-shimmer h-3 w-3 shrink-0 rounded-sm" />
            <div className="home-shimmer h-3 w-48 max-w-[80%] rounded-md" />
          </div>
          <div className="space-y-1 pt-0.5">
            <div className="home-shimmer h-3 w-full rounded-md" />
            <div className="home-shimmer h-3 w-[80%] rounded-md" />
          </div>
          <div className="flex flex-wrap gap-1">
            <div className="home-shimmer h-5 w-20 rounded-md" />
            <div className="home-shimmer h-5 w-24 rounded-md" />
            <div className="home-shimmer h-5 w-16 rounded-md" />
          </div>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <div className="home-shimmer h-6 w-28 rounded-md" />
            <div className="home-shimmer h-6 w-32 rounded-md" />
          </div>
        </div>
        <div className="flex w-full shrink-0 flex-col justify-end p-2 md:w-[156px] md:p-2.5">
          <div className="hero-card-shimmer mx-auto h-[84px] w-full max-w-lg rounded-sm md:mx-0 md:w-[136px]" />
        </div>
      </div>
    </div>
  )
}

export default function EventsListingPageSkeleton() {
  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
      aria-busy="true"
      aria-label="Loading events"
    >
      <div className="mx-auto w-full min-w-0 max-w-7xl py-6">
          <div className="mb-6 flex flex-wrap gap-2 overflow-x-auto border-b border-gray-300 pb-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="home-shimmer mb-[-1px] h-11 w-24 shrink-0 rounded-t-md sm:w-28" />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-12 lg:gap-5 xl:gap-6">
            <div className="hidden lg:col-span-3 lg:block">
              <div className="sticky top-6 border border-gray-200 bg-white">
                <SidebarBlockSkeleton rows={4} />
                <SidebarBlockSkeleton rows={6} />
                <SidebarBlockSkeleton rows={5} />
                <SidebarBlockSkeleton rows={8} />
                <SidebarBlockSkeleton rows={4} />
                <div className="home-shimmer mx-4 my-3 h-10 w-[calc(100%-2rem)] rounded-md" />
              </div>
            </div>

            <div className="order-1 w-full lg:order-2 lg:col-span-5">
              <div className="relative mb-6 h-36 overflow-hidden rounded-sm border border-gray-200 shadow-md">
                <div className="hero-card-shimmer absolute inset-0 h-full w-full" />
                <div className="relative z-10 flex h-full flex-col justify-center space-y-3 p-4 sm:p-6 lg:p-8">
                  <div className="home-shimmer h-9 w-[min(100%,320px)] rounded-md" />
                  <div className="home-shimmer h-4 w-56 max-w-[90%] rounded-md" />
                </div>
              </div>

              <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="home-shimmer h-5 w-64 max-w-full rounded-md" />
                <div className="flex items-center gap-2">
                  <div className="home-shimmer h-9 w-20 rounded-md" />
                  <div className="home-shimmer h-9 w-9 rounded-md" />
                  <div className="home-shimmer h-9 w-9 rounded-md" />
                  <div className="home-shimmer h-9 w-9 rounded-md" />
                  <div className="home-shimmer h-9 w-16 rounded-md" />
                </div>
              </div>

              <div className="space-y-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <EventListCardSkeleton key={i} />
                ))}
              </div>
            </div>

            <div className="order-3 w-full lg:col-span-4">
              <div className="sticky top-6 space-y-4">
                <div className="home-shimmer min-h-[252px] w-full rounded-sm border border-gray-200" />
                <div className="home-shimmer min-h-[200px] w-full rounded-sm border border-gray-200" />
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}
