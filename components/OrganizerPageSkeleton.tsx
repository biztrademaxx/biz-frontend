/**
 * Organizer public profile loading shell — mirrors hero (#002C71) + main content layout.
 */
export default function OrganizerPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50" aria-busy="true" aria-label="Loading organizer profile">
      <div className="bg-[#002C71] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            <div className="relative shrink-0">
              <div className="h-32 w-32 rounded-full border-4 border-white/35 bg-white/15 shadow-lg ring-1 ring-white/20" />
              <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-white/25 ring-2 ring-white/40" />
            </div>
            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="h-10 w-full max-w-md rounded-md bg-white/20" />
                <div className="h-7 w-24 shrink-0 rounded-md bg-white/15" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full max-w-2xl rounded bg-white/15" />
                <div className="h-4 w-full max-w-xl rounded bg-white/15" />
                <div className="h-4 w-full max-w-lg rounded bg-white/10" />
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                <div className="h-9 w-28 rounded-md bg-white/20" />
                <div className="h-9 w-28 rounded-md bg-white/20" />
                <div className="h-9 w-32 rounded-md bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8">
        <div className="mb-6 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <div className="flex gap-1 overflow-x-auto p-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="home-shimmer h-10 w-24 shrink-0 rounded-md" />
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="home-shimmer mb-4 h-7 w-48 rounded-md" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="home-shimmer h-4 w-full rounded-md opacity-90" style={{ maxWidth: `${100 - i * 8}%` }} />
            ))}
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-md border border-neutral-100">
                <div className="home-shimmer h-32 w-full" />
                <div className="space-y-2 p-4">
                  <div className="home-shimmer h-4 w-[80%] rounded" />
                  <div className="home-shimmer h-3 w-[55%] rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
