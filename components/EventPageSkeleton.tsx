/**
 * Event detail page loading shell — mirrors EventHero + EventPageContent layout (neutral shimmer only).
 */
export default function EventPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#f1f7fb]" aria-busy="true" aria-label="Loading event">
      {/* Top banner strip (matches event-hero) */}
      <div className="relative h-[200px] overflow-hidden md:h-[300px] lg:h-[200px]">
        <div className="hero-card-shimmer h-full w-full" />
      </div>

      {/* Overlapping main card */}
      <div className="relative z-10 -mt-[150px] flex w-full max-w-7xl flex-col items-stretch overflow-hidden rounded-sm bg-white shadow-md md:-mt-[120px] md:flex-row left-1/2 lg:left-160 -translate-x-1/2 mx-auto mb-0 ring-1 ring-neutral-200/80">
        <div className="relative min-h-[280px] w-full md:min-h-[320px] md:w-2/3">
          <div className="hero-card-shimmer absolute inset-0 min-h-[280px] md:min-h-[320px]" />
          <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-2 w-2 rounded-full bg-neutral-300/80 ring-1 ring-neutral-400/40" />
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col justify-center space-y-4 bg-white p-4 sm:p-6 lg:p-8 md:w-1/3">
          <div className="home-shimmer h-7 w-full rounded-md sm:h-8" />
          <div className="space-y-3 py-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="home-shimmer h-5 w-5 shrink-0 rounded-sm" />
                <div className="home-shimmer h-4 flex-1 rounded-md max-w-[220px]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Title + actions bar */}
      <div className="mx-auto max-w-7xl py-4">
        <div className="mb-8 rounded-sm bg-white p-6 shadow-sm ring-1 ring-neutral-200/60">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 space-y-4">
              <div className="home-shimmer h-9 w-full max-w-3xl rounded-md" />
              <div className="flex items-center gap-2">
                <div className="home-shimmer h-4 w-4 shrink-0 rounded-sm" />
                <div className="home-shimmer h-4 w-[min(100%,420px)] rounded-md" />
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="home-shimmer h-9 w-32 rounded-md" />
                <div className="home-shimmer h-9 w-28 rounded-md" />
                <div className="home-shimmer h-9 w-24 rounded-md" />
                <div className="home-shimmer h-9 w-24 rounded-md" />
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:-ml-8">
              <div className="home-shimmer mx-auto h-5 w-48 rounded-md lg:mx-0" />
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="home-shimmer h-10 w-full rounded-md sm:w-[180px]" />
                <div className="home-shimmer h-10 w-full rounded-md sm:w-[180px]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + main card */}
      <div className="mx-auto max-w-7xl pb-16">
        <div className="mb-6 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <div className="grid grid-cols-5 gap-1 p-1 sm:grid-cols-10">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="home-shimmer h-11 rounded-md" />
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-md">
          <div className="space-y-3 border-b border-neutral-200 bg-neutral-100/80 px-6 py-5">
            <div className="home-shimmer h-6 w-2/3 max-w-md rounded-md" />
            <div className="home-shimmer h-4 w-full rounded-md" />
            <div className="home-shimmer h-4 w-full rounded-md opacity-90" />
            <div className="home-shimmer h-4 w-[80%] max-w-2xl rounded-md opacity-80" />
          </div>
          <div className="space-y-4 px-6 py-5">
            <div className="home-shimmer min-h-[120px] w-full rounded-lg" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="home-shimmer min-h-[140px] w-full rounded-lg" />
              <div className="home-shimmer min-h-[140px] w-full rounded-lg" />
            </div>
            <div className="home-shimmer min-h-[200px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
