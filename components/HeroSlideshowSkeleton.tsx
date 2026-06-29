import { cn } from "@/lib/utils"

function Shimmer({ className }: { className?: string }) {
  return <div className={cn("hero-premium-shimmer", className)} aria-hidden />
}

/** Full-width card slider loading state with 200px side margins. */
export default function HeroSlideshowSkeleton() {
  return (
    <section
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen min-w-0 overflow-hidden py-6 sm:py-12 lg:min-h-[760px] lg:py-14 xl:min-h-[820px] xl:py-20"
      style={{ backgroundColor: "#e8f1fb" }}
      aria-busy="true"
      aria-label="Loading featured events"
    >
      <div
        className="pointer-events-none absolute -left-[8%] top-[-14%] h-[80vw] max-h-[1200px] w-[80vw] max-w-[1200px] rounded-full bg-[radial-gradient(circle,rgba(0,74,150,0.2)_0%,transparent_65%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-[6%] top-[-24%] h-[75vw] max-h-[1100px] w-[75vw] max-w-[1100px] rounded-full bg-[radial-gradient(circle,rgba(100,181,246,0.25)_0%,transparent_65%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full px-4 sm:px-[clamp(1rem,5vw,200px)]">
        <div className="flex min-h-0 flex-col gap-5 sm:gap-8 lg:min-h-[480px] lg:flex-row lg:items-start xl:min-h-[560px]">
          <div className="w-full shrink-0 lg:w-[33.333%] lg:pr-10">
            <Shimmer className="mb-3 h-10 w-[min(100%,16rem)] rounded-sm sm:mb-6 sm:h-16 lg:h-20" />
            <Shimmer className="mb-2 h-3 w-full max-w-md rounded-sm" />
            <Shimmer className="mb-2 h-3 w-[92%] max-w-md rounded-sm" />
            <Shimmer className="mb-5 h-3 w-[70%] max-w-sm rounded-sm sm:mb-8" />
            <Shimmer className="h-11 w-full rounded-full sm:h-14 sm:w-48" />
          </div>

          <div className="w-full min-w-0 lg:w-[66.666%]">
            <Shimmer className="h-[300px] w-full rounded-[12px] sm:h-[420px] lg:hidden" />
            <div className="hidden gap-2 lg:flex lg:w-full">
              {[1, 2, 3].map((i) => (
                <div key={i} className="min-w-0 flex-1">
                  <Shimmer className="h-[400px] w-full rounded-[12px] xl:h-[520px]" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:justify-between lg:mt-12">
          <Shimmer className="hidden h-4 w-16 sm:block lg:w-[33.333%]" />
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-end lg:w-[66.666%]">
            <Shimmer className="h-3 w-28 rounded-sm" />
            <div className="flex items-center gap-3">
              <Shimmer className="h-4 w-16 rounded-sm" />
              <Shimmer className="h-11 w-11 rounded-full" />
              <Shimmer className="h-11 w-11 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
