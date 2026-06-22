/**
 * `/exhibitor` listing shell — mirrors blue hero, search bar, toolbar, and exhibitor cards grid.
 */

function ExhibitorCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <div className="home-shimmer mb-4 h-14 w-14 rounded-xl" />
      <div className="home-shimmer h-4 w-[78%] rounded-md" />
      <div className="home-shimmer mt-2 h-3.5 w-[62%] rounded-md" />
      <div className="home-shimmer mt-1.5 h-3.5 w-[48%] rounded-md" />
      <div className="home-shimmer mt-4 h-3.5 w-24 rounded-md" />
    </div>
  )
}

export default function ExhibitorsListingPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#f6f8fb]" aria-busy="true" aria-label="Loading exhibitors">
      <section className="relative overflow-hidden bg-gradient-to-r from-[#042f8c] via-[#0b3ea8] to-[#06378f]">
        <div className="absolute inset-0 bg-[url('/images/exhibitors-bg.jpg')] bg-cover bg-center opacity-15" />
        <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-14 sm:px-6 sm:pt-16 sm:pb-16 lg:px-8 lg:pt-20 lg:pb-20">
          <div className="h-9 w-48 animate-pulse rounded-md bg-white/20 sm:h-11 sm:w-56" />
          <div className="mt-3 space-y-2">
            <div className="h-4 w-full max-w-md animate-pulse rounded-md bg-white/15" />
            <div className="h-4 w-[72%] max-w-sm animate-pulse rounded-md bg-white/12" />
          </div>

          <div className="mt-8 w-full max-w-2xl sm:mt-9">
            <div className="flex items-center gap-2 rounded-xl bg-white p-2 shadow-2xl">
              <div className="home-shimmer ml-2 h-5 w-5 shrink-0 rounded-sm" />
              <div className="home-shimmer h-10 min-w-0 flex-1 rounded-md" />
              <div className="home-shimmer h-10 w-24 shrink-0 rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-7 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="home-shimmer h-7 w-44 rounded-md sm:h-8 sm:w-52" />
            <div className="home-shimmer h-4 w-36 rounded-md" />
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="home-shimmer h-10 w-10 rounded-lg sm:h-11 sm:w-11" />
            <div className="home-shimmer h-10 w-10 rounded-lg sm:h-11 sm:w-11" />
            <div className="home-shimmer h-10 w-28 rounded-lg sm:h-11" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <ExhibitorCardSkeleton key={i} />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:mt-12">
          <div className="home-shimmer h-10 w-10 rounded-lg sm:h-11 sm:w-11" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="home-shimmer h-10 w-10 rounded-lg sm:h-11 sm:w-11" />
          ))}
          <div className="home-shimmer h-10 w-10 rounded-lg sm:h-11 sm:w-11" />
        </div>
      </section>
    </main>
  )
}
