/**
 * `/speakers` listing shell — mirrors hero, search, stat cards, featured grid, CTA aside, and pagination.
 */

function StatCardSkeleton() {
  return (
    <div className="rounded-[20px] border border-[#E2E8F4] bg-white px-5 py-3.5 shadow-[0_10px_24px_rgba(16,42,94,0.06)]">
      <div className="flex items-center gap-4">
        <div className="home-shimmer h-13 w-13 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="home-shimmer h-9 w-16 rounded-md" />
          <div className="home-shimmer h-4 w-24 rounded-md" />
          <div className="home-shimmer h-3 w-32 rounded-md" />
        </div>
      </div>
    </div>
  )
}

function SpeakerCardSkeleton() {
  return (
    <article className="flex h-[260px] flex-col overflow-hidden rounded-[22px] border border-[#E4EAF5] bg-white p-4 shadow-[0_10px_28px_rgba(16,42,94,0.08)]">
      <div className="flex items-center gap-3">
        <div className="home-shimmer h-14 w-14 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="home-shimmer h-4 w-[72%] rounded-md" />
          <div className="home-shimmer h-3 w-[48%] rounded-md" />
        </div>
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-2">
        <div className="home-shimmer h-3 w-[58%] rounded-md" />
        <div className="home-shimmer h-3 w-[42%] rounded-md" />
      </div>

      <div className="mt-auto border-t border-[#E4EAF5] pt-3">
        <div className="grid grid-cols-2 gap-0">
          <div className="space-y-1.5 pr-3 text-center">
            <div className="home-shimmer mx-auto h-4 w-8 rounded-md" />
            <div className="home-shimmer mx-auto h-2.5 w-16 rounded-md" />
          </div>
          <div className="space-y-1.5 border-l border-[#E4EAF5] pl-3 text-center">
            <div className="home-shimmer mx-auto h-4 w-8 rounded-md" />
            <div className="home-shimmer mx-auto h-2.5 w-16 rounded-md" />
          </div>
        </div>
      </div>
    </article>
  )
}

function SpeakerCtaAsideSkeleton() {
  return (
    <aside className="h-fit overflow-hidden rounded-[22px] bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_32%),linear-gradient(135deg,#0E2E67_0%,#133E8A_100%)] p-5 shadow-[0_18px_50px_rgba(18,61,134,0.2)]">
      <div className="h-10 w-10 animate-pulse rounded-full bg-white/15" />
      <div className="mt-4 h-6 w-40 animate-pulse rounded-md bg-white/15" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full animate-pulse rounded-md bg-white/12" />
        <div className="h-3 w-[88%] animate-pulse rounded-md bg-white/12" />
      </div>
      <div className="mt-4 h-[42px] w-full animate-pulse rounded-2xl bg-white/20" />
      <div className="mt-5 space-y-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-5 w-5 shrink-0 animate-pulse rounded-full bg-white/15" />
            <div
              className="h-3 flex-1 animate-pulse rounded-md bg-white/12"
              style={{ maxWidth: `${88 - i * 8}%` }}
            />
          </div>
        ))}
      </div>
    </aside>
  )
}

export default function SpeakersListingPageSkeleton() {
  return (
    <div
      className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(23,76,154,0.08),transparent_24%),linear-gradient(180deg,#FFFFFF_0%,#F8FAFD_100%)] text-[#102A5E]"
      aria-busy="true"
      aria-label="Loading speakers"
    >
      <div className="mx-auto max-w-[1380px] px-4 py-6 sm:px-8 lg:px-14 lg:py-8">
        <div className="px-1 sm:px-2 lg:px-0">
          <section className="border-b border-[#DFE6F1] pb-6 lg:flex lg:items-start lg:justify-between lg:gap-10">
            <div className="max-w-[460px] shrink-0 lg:w-[35%]">
              <div className="home-shimmer h-4 w-40 rounded-md" />
              <div className="mt-4 space-y-3">
                <div className="home-shimmer h-10 w-full max-w-[320px] rounded-md" />
                <div className="home-shimmer h-10 w-full max-w-[280px] rounded-md" />
                <div className="home-shimmer h-10 w-[72%] max-w-[240px] rounded-md" />
              </div>
              <div className="mt-5 space-y-2">
                <div className="home-shimmer h-3.5 w-full max-w-[340px] rounded-md" />
                <div className="home-shimmer h-3.5 w-[82%] max-w-[280px] rounded-md" />
              </div>
            </div>

            <div className="space-y-3 pt-6 lg:w-[65%] lg:pt-2">
              <div className="overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#0C2760_0%,#123D86_100%)] shadow-[0_14px_30px_rgba(18,61,134,0.18)]">
                <div className="h-[54px] w-full animate-pulse bg-white/10" />
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </div>
            </div>
          </section>

          <section className="pt-5">
            <div className="flex flex-col gap-5 border-b border-[#DFE6F1] pb-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="home-shimmer h-6 w-6 shrink-0 rounded-md" />
                  <div className="home-shimmer h-8 w-52 max-w-full rounded-md sm:h-9 sm:w-60" />
                </div>
                <div className="home-shimmer mt-2 h-4 w-64 max-w-full rounded-md" />
              </div>

              <div className="flex items-center gap-3">
                <div className="home-shimmer h-5 w-16 rounded-md" />
                <div className="home-shimmer h-[50px] w-full min-w-[190px] max-w-[220px] rounded-2xl" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SpeakerCardSkeleton key={i} />
              ))}
              <SpeakerCtaAsideSkeleton />
            </div>

            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="home-shimmer h-12 w-12 rounded-2xl" />
              <div className="home-shimmer h-12 w-12 rounded-2xl" />
              <div className="home-shimmer h-12 w-12 rounded-2xl" />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
