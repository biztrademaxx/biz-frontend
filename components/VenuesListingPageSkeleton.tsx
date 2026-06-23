/**
 * `/venues` listing shell — mirrors header, filter sidebar, and venue card grid.
 */
export default function VenuesListingPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#f9f9f9]" aria-busy="true" aria-label="Loading venues">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="home-shimmer mb-2 h-9 w-72 max-w-[90%] rounded-md" />
          <div className="home-shimmer h-5 w-96 max-w-[95%] rounded-md" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <div className="order-1 min-w-0 w-full flex-1 lg:order-2">
            <div className="mb-4 space-y-3 lg:hidden">
              <div className="home-shimmer h-10 w-full rounded-md" />
              <div className="home-shimmer h-10 w-full rounded-md" />
            </div>
            <div className="mb-6">
              <div className="home-shimmer mb-2 h-7 w-48 max-w-[85%] rounded-md" />
              <div className="home-shimmer h-4 w-56 rounded-md" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-sm border bg-white shadow-sm">
                  <div className="home-shimmer h-48 w-full" />
                  <div className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="home-shimmer h-5 min-w-0 flex-1 rounded" />
                      <div className="home-shimmer h-5 w-16 shrink-0 rounded" />
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="home-shimmer mt-0.5 h-4 w-4 shrink-0 rounded-sm" />
                      <div className="home-shimmer h-4 min-w-0 flex-1 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-2 hidden w-full shrink-0 lg:order-1 lg:block lg:w-64 xl:w-72">
            <div className="sticky top-8 rounded-lg border bg-white p-6">
              <div className="home-shimmer mb-6 h-7 w-40 rounded-md" />
              <div className="home-shimmer mb-6 h-10 w-full rounded-md" />
              <div className="home-shimmer mb-3 h-4 w-28 rounded" />
              <div className="mb-8 grid grid-cols-2 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="home-shimmer h-9 rounded-md" />
                ))}
              </div>
              <div className="home-shimmer mb-3 h-4 w-32 rounded" />
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="home-shimmer h-9 rounded-md" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
