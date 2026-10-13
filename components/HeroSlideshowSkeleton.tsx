import { cn } from "@/lib/utils"

function Shimmer({ className }: { className?: string }) {
  return <div className={cn("hero-premium-shimmer", className)} aria-hidden />
}

const SKELETON_CARDS = [1, 2, 3, 4, 5]

/** Loading state for the VIP events horizontal slider (HeroSlideshowClient). */
export default function HeroSlideshowClientSkeleton() {
  return (
    <div className="relative w-full min-w-0" aria-busy="true" aria-label="Loading VIP events">
      <div className="no-scrollbar flex w-full gap-0 overflow-x-hidden pt-0 pb-3">
        {SKELETON_CARDS.map((i) => (
          <div
            key={i}
            className="w-[min(100%,88vw)] shrink-0 sm:w-80 lg:w-1/5 lg:min-w-0"
          >
            <div className="h-[448px] w-full min-w-0 overflow-hidden md:h-[488px] lg:h-[528px]">
              <Shimmer className="h-full w-full" />
            </div>
          </div>
        ))}
      </div>

      <div
        aria-hidden
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 overflow-hidden rounded-full shadow-lg ring-1 ring-black/5"
      >
        <Shimmer className="h-10 w-10 rounded-full" />
      </div>
      <div
        aria-hidden
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 overflow-hidden rounded-full shadow-lg ring-1 ring-black/5"
      >
        <Shimmer className="h-10 w-10 rounded-full" />
      </div>
    </div>
  )
}