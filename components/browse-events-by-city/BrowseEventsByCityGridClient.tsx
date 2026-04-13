"use client"

import { useRouter } from "next/navigation"
import type { BrowseByCityServerPayload } from "@/lib/browse-by-city/types"
import { formatEventCountDisplay } from "@/lib/format-event-count"
import { resolvedEventCountForCity } from "./utils/display-event-count"

const browseCardClass =
  "group flex w-full min-h-0 cursor-pointer flex-col rounded-md border border-gray-200 bg-white px-3 py-3.5 text-left shadow-sm transition-shadow duration-200 hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"

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
                <div className="flex min-w-0 flex-col items-start gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none">
                    <div className="relative h-7 w-7">
                      <img
                        src={city.image || "/placeholder.svg"}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>
                  <div className="w-full min-w-0 text-left leading-tight">
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
