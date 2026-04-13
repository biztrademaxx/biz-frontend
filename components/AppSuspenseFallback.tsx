"use client"

import { usePathname } from "next/navigation"
import HeroSlideshowSkeleton from "@/components/HeroSlideshowSkeleton"

/**
 * Replaces generic "Loading..." when the root Suspense boundary is active.
 * Home route shows the same VIP-style shimmer as the hero Suspense fallback.
 */
export default function AppSuspenseFallback() {
  const pathname = usePathname()
  const path = pathname ?? "/"

  if (path === "/" || path === "") {
    return (
      <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-white">
        <div className="bg-white pb-1">
          <div className="mx-auto px-4">
            <HeroSlideshowSkeleton />
          </div>
        </div>
        <div className="bg-[#F3F2F0] py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="home-shimmer mb-10 h-8 w-64 max-w-[50%] rounded-md" aria-hidden />
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border border-gray-200 bg-white p-6 shadow-md">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="home-shimmer h-10 w-10 rounded-full" aria-hidden />
                    <div className="home-shimmer h-4 w-24 rounded" aria-hidden />
                    <div className="home-shimmer h-3.5 w-16 rounded" aria-hidden />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-4 bg-slate-50 px-4"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="home-shimmer h-10 w-48 max-w-[80%] rounded-md" />
      <div className="home-shimmer h-3 w-64 max-w-[90%] rounded opacity-80" />
    </div>
  )
}
