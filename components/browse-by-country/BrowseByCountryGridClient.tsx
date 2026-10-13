"use client"

import { AppImage } from "@/components/app-image"
import { useRouter } from "next/navigation"
import type { BrowseByCountryServerPayload } from "@/lib/browse-by-country/types"
import { countryEventsCountLabel } from "./utils/country-events-count-label"

// Updated: Added border and improved shadow
const browseCardClass =
  "group flex w-full min-h-[120px] cursor-pointer flex-col rounded-sm bg-white border border-gray-200 px-3 py-3.5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:border-[#002C71]/30 focus:outline-none focus:ring-2 focus:ring-[#002C71] focus:ring-offset-2"

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
                <div className="flex h-full min-w-0 flex-col items-start gap-2">
                  <div className="relative flex h-7 w-11 shrink-0 items-center justify-start overflow-hidden rounded-none">
                    {country.flag?.trim() ? (
                      <AppImage
                        src={country.flag.trim()}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-contain object-left"
                      />
                    ) : (
                      <span className="text-lg leading-none" aria-hidden>
                        🌐
                      </span>
                    )}
                  </div>
                  <div className="mt-auto w-full min-w-0 text-left leading-tight">
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