"use client"

import { AppImage } from "@/components/app-image"
import { useRouter } from "next/navigation"
import type { BrowseByCityServerPayload } from "@/lib/browse-by-city/types"
import { formatEventCountDisplay } from "@/lib/format-event-count"
import { resolvedEventCountForCity } from "./utils/display-event-count"

const browseCardClass =
  "group flex w-full min-h-[120px] cursor-pointer flex-col rounded-lg border border-[#2563EB] bg-white px-3 py-3.5 text-left shadow-[0_8px_16px_-10px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_22px_-10px_rgba(0,0,0,0.22)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
const browseGridClass =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 md:gap-3 lg:gap-4"

export interface BrowseEventsByCityGridClientProps {
  displayCities: BrowseByCityServerPayload["displayCities"]
  cityEventCounts: BrowseByCityServerPayload["cityEventCounts"]
}

export default function BrowseEventsByCityGridClient({
  displayCities,
  cityEventCounts,
}: BrowseEventsByCityGridClientProps) {
  const router = useRouter()

  return (
    <>
      {displayCities.length === 0 ? (
        <p className="text-sm text-gray-500">No cities available yet.</p>
      ) : (
        <div className={browseGridClass}>
          {displayCities.map((city) => {
            const count = resolvedEventCountForCity(city, cityEventCounts)
            const countLabel = `${formatEventCountDisplay(count)} Events`
            return (
              <button
                key={city.id}
                type="button"
                onClick={() => router.push(`/event?location=${encodeURIComponent(city.name)}`)}
                className={browseCardClass}
              >
                <div className="flex h-full min-w-0 flex-col items-start gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none">
                    <div className="relative h-7 w-7">
                      {city.image?.trim() ? (
                        <AppImage
                          src={city.image.trim()}
                          alt=""
                          fill
                          sizes="28px"
                          className="object-contain"
                        />
                      ) : (
                        <span className="flex h-7 w-7 items-center justify-center text-lg" aria-hidden>
                          🏙️
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-auto w-full min-w-0 text-left leading-tight">
                    <h3 className="line-clamp-2 text-sm font-bold text-gray-900">{city.name}</h3>
                    <p className="mt-1 text-xs font-normal text-gray-500">{countLabel}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
