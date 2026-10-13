/**
 * `/speaker/[id]` loading shell — mirrors hero height + profile / about two-column layout.
 */
export default function SpeakerProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-white" aria-busy="true" aria-label="Loading speaker profile">
      <div className="relative h-[300px] overflow-hidden md:h-[350px]">
        <div className="home-shimmer h-full w-full bg-gradient-to-r from-gray-200 to-gray-300" />
      </div>

      <div className="relative z-20 mx-auto mt-7 max-w-6xl px-4 lg:ml-20">
        <div className="flex flex-col items-start gap-8 lg:flex-row">
          <div className="w-full lg:w-1/3">
            <div className="p-6">
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="home-shimmer mb-4 h-32 w-32 shrink-0 rounded-full border-4 border-gray-200" />
                <div className="home-shimmer mb-2 h-6 w-48 rounded-md" />
                <div className="home-shimmer h-4 w-36 rounded-md" />
                <div className="mt-4 flex justify-center gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="home-shimmer h-8 w-8 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-2/3">
            <div className="space-y-4 p-6">
              <div className="home-shimmer h-8 w-40 rounded-md" />
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="home-shimmer h-4 w-full rounded-md"
                    style={{ maxWidth: `${100 - i * 6}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="mx-auto my-4 w-3/4 border-t border-gray-200" />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="home-shimmer mb-6 h-8 w-56 rounded-md" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="home-shimmer h-36 w-full" />
              <div className="space-y-2 p-4">
                <div className="home-shimmer h-4 w-[85%] rounded" />
                <div className="home-shimmer h-3 w-[60%] rounded" />
                <div className="home-shimmer h-3 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
