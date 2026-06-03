import { Suspense } from "react"
import { PageBanner } from "@/components/page-banner"

type HomePageBannerSlotProps = {
  position: string
  /** Legacy `middle` banners show here until reassigned in admin. */
  fallbackPosition?: string
  height?: number
}

export function HomePageBannerSlot({
  position,
  fallbackPosition,
  height = 150,
}: HomePageBannerSlotProps) {
  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl px-3 py-6 sm:px-4 lg:px-6">
      <Suspense
        fallback={
          <div
            className="home-shimmer relative min-h-[88px] w-full rounded-sm"
            style={{ height }}
            aria-hidden
          />
        }
      >
        <PageBanner
          page="homepage"
          position={position}
          fallbackPosition={fallbackPosition}
          height={height}
          fixedHeight
          autoplay
          autoplayInterval={5000}
          showControls
        />
      </Suspense>
    </div>
  )
}
