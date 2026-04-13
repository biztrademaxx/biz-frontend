"use client"

import { useRouter } from "next/navigation"
import type { BrowseByCountryServerPayload } from "@/lib/browse-by-country/types"
import { countryEventsCountLabel } from "./utils/country-events-count-label"

const browseCardClass =
  "group flex w-full min-h-0 cursor-pointer flex-col rounded-md border border-gray-200 bg-white px-3 py-3.5 text-left shadow-sm transition-shadow duration-200 hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"

const browseGridClass =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 md:gap-3 lg:gap-4"

export interface BrowseByCountryGridClientProps {
  displayCountries: BrowseByCountryServerPayload["displayCountries"]
}

export default function BrowseByCountryGridClient({
  displayCountries,
}: BrowseByCountryGridClientProps) {
  const router = useRouter()

  return (
    <>
      {displayCountries.length === 0 ? (
        <p className="text-sm text-gray-500">No countries available yet.</p>
      ) : (
        <div className={browseGridClass}>
          {displayCountries.map((country) => {
            const countLabel = countryEventsCountLabel(country.eventCount)
            return (
              <button
                key={country.id}
                type="button"
                onClick={() => router.push(`/event?country=${encodeURIComponent(country.name)}`)}
                className={browseCardClass}
              >
                <div className="flex min-w-0 flex-col items-start gap-2">
                  <div className="flex h-7 w-11 shrink-0 items-center justify-start overflow-hidden rounded-none">
                    <img
                      src={country.flag || "/placeholder.svg"}
                      alt=""
                      className="h-full w-full object-contain object-left"
                    />
                  </div>
                  <div className="w-full min-w-0 text-left leading-tight">
                    <h3 className="line-clamp-2 text-sm font-bold text-gray-900">{country.name}</h3>
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
