/**
 * `/organizers` listing shell — mirrors filter sidebar, header, search, and organizer logo cards grid.
 */

function FilterSectionSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="border-b border-gray-100 py-4 last:border-b-0">
      <div className="mb-3 flex items-center justify-between">
        <div className="home-shimmer h-4 w-28 rounded-md" />
        <div className="home-shimmer h-4 w-4 rounded-sm" />
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="home-shimmer h-4 w-4 shrink-0 rounded-sm" />
            <div className="home-shimmer h-3.5 flex-1 rounded-md" style={{ maxWidth: `${100 - i * 6}%` }} />
            <div className="home-shimmer h-3.5 w-6 shrink-0 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}

function OrganizerCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
      <div className="hero-card-shimmer aspect-[5/4] w-full shrink-0" />
      <div className="flex flex-1 flex-col p-3">
        <div className="mb-1.5 flex items-start justify-between gap-1.5">
          <div className="home-shimmer h-4 w-[72%] rounded-md" />
          <div className="home-shimmer h-3.5 w-10 shrink-0 rounded-md" />
        </div>
        <div className="home-shimmer mb-1.5 h-3 w-[85%] rounded-md" />
        <div className="mt-auto flex flex-wrap gap-x-2 gap-y-1">
          <div className="home-shimmer h-3 w-14 rounded-md" />
          <div className="home-shimmer h-3 w-20 rounded-md" />
        </div>
      </div>
    </div>
  )
}

export default function OrganizersListingPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#f9f9f9]" aria-busy="true" aria-label="Loading organizers">
      <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-gray-200/80 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="home-shimmer h-9 w-24 shrink-0 rounded-md" />
        <div className="home-shimmer h-9 min-w-0 flex-1 rounded-md" />
      </div>

      <div className="flex flex-col lg:flex-row">
        <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block xl:w-72">
          <div className="border-b border-gray-100 px-5 py-5">
            <div className="home-shimmer h-5 w-40 rounded-md" />
            <div className="home-shimmer mt-2 h-3 w-52 rounded-md" />
          </div>
          <div className="px-5 py-2">
            <FilterSectionSkeleton rows={5} />
            <FilterSectionSkeleton rows={4} />
            <FilterSectionSkeleton rows={4} />
            <FilterSectionSkeleton rows={3} />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="border-b border-gray-200 bg-white px-4 py-6 sm:px-8">
            <div className="home-shimmer h-8 w-56 max-w-full rounded-md sm:h-9 sm:w-64" />
            <div className="mt-2 space-y-2">
              <div className="home-shimmer h-4 w-full max-w-xl rounded-md" />
              <div className="home-shimmer h-4 w-[70%] max-w-md rounded-md" />
            </div>
            <div className="mt-6 max-w-xl">
              <div className="home-shimmer h-10 w-full rounded-md" />
            </div>
          </div>

          <div className="px-4 py-6 sm:px-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="home-shimmer h-4 w-56 max-w-full rounded-md" />
              <div className="flex items-center gap-2">
                <div className="home-shimmer h-9 w-20 rounded-md" />
                <div className="home-shimmer h-4 w-24 rounded-md" />
                <div className="home-shimmer h-9 w-16 rounded-md" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <OrganizerCardSkeleton key={i} />
              ))}
            </div>

            <div className="mt-8 flex items-center justify-center gap-2">
              <div className="home-shimmer h-9 w-20 rounded-md" />
              <div className="home-shimmer h-4 w-24 rounded-md" />
              <div className="home-shimmer h-9 w-16 rounded-md" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
