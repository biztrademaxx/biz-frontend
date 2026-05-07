/**
 * `/speakers` listing shell — mirrors search bar, stats/sort row, and horizontal speaker cards.
 */
export default function SpeakersListingPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50" aria-busy="true" aria-label="Loading speakers">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="relative mx-auto mb-8 max-w-2xl">
          <div className="home-shimmer h-[52px] w-full rounded-md border border-gray-200/80" />
        </div>

        <div className="mb-8 flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="flex items-center space-x-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="text-center">
                <div className="home-shimmer mx-auto mb-1 h-8 w-14 rounded-md" />
                <div className="home-shimmer mx-auto h-3 w-16 rounded" />
              </div>
            ))}
          </div>
          <div className="home-shimmer h-10 w-[220px] max-w-full rounded-md" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="relative h-20 w-20 shrink-0">
                <div className="home-shimmer h-20 w-20 rounded-full border-2 border-gray-100" />
              </div>
              <div className="ml-4 min-w-0 flex-1 space-y-2">
                <div className="home-shimmer h-4 w-[70%] rounded" />
                <div className="home-shimmer h-3 w-[45%] rounded" />
                <div className="home-shimmer h-3 w-[55%] rounded" />
                <div className="home-shimmer mt-3 h-3 w-full rounded" />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <div className="home-shimmer h-5 w-14 rounded-full" />
                  <div className="home-shimmer h-5 w-16 rounded-full" />
                  <div className="home-shimmer h-5 w-12 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <div className="home-shimmer h-4 w-48 rounded" />
        </div>
      </div>
    </div>
  )
}
