import { cn } from "@/lib/utils"
import {
  HERO_AMBIENT_CYAN,
  HERO_AMBIENT_PEACH,
  HERO_SURFACE_STYLE,
} from "@/lib/hero/hero-surface"

function Shimmer({ className }: { className?: string }) {
  return <div className={cn("hero-premium-shimmer", className)} aria-hidden />
}

/** Full-width card slider loading state with 200px side margins. */
export default function HeroSlideshowSkeleton() {
  return (
    <section
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen min-w-0 overflow-hidden -mt-[5.5rem] pt-[calc(5.5rem+1.5rem)] pb-6 sm:pt-[calc(5.5rem+3rem)] sm:pb-12 lg:min-h-[760px] lg:pt-[calc(5.5rem+3.5rem)] lg:pb-14 xl:min-h-[820px] xl:pt-[calc(5.5rem+5rem)] xl:pb-20"
      style={HERO_SURFACE_STYLE}
      aria-busy="true"
      aria-label="Loading featured events"
    >
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
        <div
          className="absolute -left-[18%] -top-[32%] h-[min(140vw,90rem)] w-[min(140vw,90rem)]"
          style={{ background: HERO_AMBIENT_PEACH }}
        />
        <div
          className="absolute -right-[12%] -top-[30%] h-[min(140vw,90rem)] w-[min(140vw,90rem)]"
          style={{ background: HERO_AMBIENT_CYAN }}
        />
      </div>

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
