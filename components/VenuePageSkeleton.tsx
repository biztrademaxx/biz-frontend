/**
 * Venue public profile loading shell — mirrors back bar + image hero + overlay title row.
 */
export default function VenuePageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50" aria-busy="true" aria-label="Loading venue details">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="home-shimmer h-9 w-40 rounded-md" />
        </div>
      </div>

      <div className="relative h-96 overflow-hidden">
        <div className="hero-card-shimmer absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent p-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="h-10 w-full max-w-xl animate-pulse rounded-md bg-white/35" />
                  <div className="h-7 w-24 shrink-0 animate-pulse rounded-md bg-white/25" />
                </div>
                <div className="h-4 w-full max-w-lg animate-pulse rounded-md bg-white/30" />
                <div className="h-4 w-48 animate-pulse rounded-md bg-white/20" />
              </div>
              <div className="flex gap-3">
                <div className="h-10 w-28 animate-pulse rounded-md bg-white/25" />
                <div className="h-10 w-36 animate-pulse rounded-md bg-white/25" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <div className="flex gap-1 overflow-x-auto p-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="home-shimmer h-10 w-28 shrink-0 rounded-md" />
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="home-shimmer mb-4 h-7 w-56 rounded-md" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="home-shimmer h-4 w-full rounded-md"
                style={{ maxWidth: `${100 - (i % 3) * 12}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
