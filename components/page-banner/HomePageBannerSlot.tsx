import { Suspense } from "react"
import { PageBanner } from "@/components/page-banner"
import { cn } from "@/lib/utils"

/** Compact inline promos between homepage sections (not full-bleed hero size). */
export const HOME_PAGE_BANNER_HEIGHT = 96
export const HOME_PAGE_BANNER_MAX_WIDTH_CLASS = "max-w-4xl"

type HomePageBannerSlotProps = {
  position: string
  /** Legacy `middle` banners show here until reassigned in admin. */
  fallbackPosition?: string
  height?: number
}

export function HomePageBannerSlot({
  position,
  fallbackPosition,
  height = HOME_PAGE_BANNER_HEIGHT,
}: HomePageBannerSlotProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full min-w-0 px-3 py-3 sm:px-4 sm:py-4",
        HOME_PAGE_BANNER_MAX_WIDTH_CLASS,
      )}
    >
      <Suspense
        fallback={
          <div
            className="home-shimmer relative w-full rounded-lg"
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
          className="rounded-lg shadow-sm"
        />
      </Suspense>
    </div>
  )
}
