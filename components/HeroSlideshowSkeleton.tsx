import { cn } from "@/lib/utils"

function Shimmer({ className }: { className?: string }) {
  return <div className={cn("hero-premium-shimmer", className)} aria-hidden />
}

/** VIP hero loading — mirrors HeroSlideshowClient layout with a classic premium shimmer. */
export default function HeroSlideshowSkeleton() {
  return (
    <section
      className="relative w-full min-w-0 overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[28px]"
      aria-busy="true"
      aria-label="Loading featured events"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22] bg-[url('/images/glob.jpeg')] bg-cover bg-no-repeat bg-top lg:bg-center"
        aria-hidden
      />
      <div className="absolute inset-0 bg-white/88" aria-hidden />

      <div className="relative z-10 mx-auto w-full">
        <div className="relative z-10 flex flex-col gap-5 pb-4 pt-6 sm:gap-6 sm:pb-6 sm:pt-8 lg:flex-row lg:items-start lg:gap-10 lg:pt-16 xl:gap-16 xl:pt-20">
          <div className="w-full min-w-0 shrink-0 lg:w-[32%]">
            <div className="max-w-[340px] space-y-3 sm:space-y-4">
              <Shimmer className="h-7 w-[min(100%,15rem)] rounded-sm sm:h-8" />
              <Shimmer className="h-7 w-[min(100%,10rem)] rounded-sm sm:h-8" />
            </div>

            <div className="mt-16 max-w-[340px] space-y-2.5 lg:mt-20">
              <Shimmer className="h-3.5 w-full rounded-sm" />
              <Shimmer className="h-3.5 w-[92%] rounded-sm" />
              <Shimmer className="h-3.5 w-[78%] rounded-sm" />
            </div>

            <div className="mb-12 mt-10 flex flex-wrap gap-6 sm:gap-8 lg:mt-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Shimmer className="h-6 w-6 shrink-0 rounded-full" />
                  <div className="space-y-2">
                    <Shimmer className="h-7 w-14 rounded-sm" />
                    <Shimmer className="h-2.5 w-[5.5rem] rounded-sm" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex w-full max-w-[360px] flex-col gap-2.5 min-[400px]:flex-row sm:gap-4">
              <Shimmer className="h-11 flex-1 rounded-sm sm:h-12" />
              <Shimmer className="h-11 flex-1 rounded-sm border border-slate-200/90 bg-gradient-to-b from-white to-slate-50 sm:h-12" />
            </div>
          </div>

          <div className="flex w-full min-w-0 flex-col gap-3 sm:gap-4 lg:w-[55%]">
            <div className="relative w-full overflow-hidden rounded-xl ring-1 ring-slate-200/70">
              <div className="relative h-[220px] overflow-hidden rounded-xl min-[400px]:h-[240px] sm:h-[300px] lg:h-[360px] xl:h-[400px]">
                <Shimmer className="absolute inset-0 h-full w-full rounded-none" />

                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[52%] bg-gradient-to-t from-slate-300/50 via-slate-200/20 to-transparent"
                  aria-hidden
                />

                <Shimmer className="absolute left-4 top-4 z-10 h-6 w-[7.25rem] rounded-md" />

                <div className="absolute bottom-0 left-0 right-0 z-20 flex items-end gap-5 p-6">
                  <Shimmer className="h-[100px] w-[110px] shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1 space-y-3">
                    <Shimmer className="h-7 w-[88%] max-w-md rounded-sm" />
                    <Shimmer className="h-4 w-[62%] max-w-xs rounded-sm" />
                    <Shimmer className="h-4 w-[48%] max-w-[220px] rounded-sm" />
                    <div className="flex gap-2.5 pt-1">
                      <Shimmer className="h-9 w-[7.5rem] rounded-lg" />
                      <Shimmer className="h-9 w-[7.5rem] rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full items-center justify-center gap-2">
              <Shimmer className="h-2 w-6 rounded-full" />
              {[1, 2, 3, 4, 5].map((i) => (
                <Shimmer key={i} className="h-2 w-2 rounded-full" />
              ))}
            </div>

            <div className="mt-2 grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Shimmer className="h-[68px] w-[68px] shrink-0 rounded-sm" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Shimmer className="h-4 w-full rounded-sm" />
                    <Shimmer className="h-3 w-24 rounded-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
